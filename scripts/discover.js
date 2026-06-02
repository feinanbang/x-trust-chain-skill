#!/usr/bin/env node
// trust-chain — DISCOVER: from trusted seed account(s), find unknown-but-credible
// same-domain accounts by mining the amplification graph (who the seeds retweet,
// quote, reply to, and mention).
//
// This is the runnable half of the method. It does NOT decide who is trustworthy —
// it surfaces a ranked candidate list for you to then VERIFY by track record
// (see docs/verification-method.md). Discovery is mechanical; trust is earned.
//
// Economy guards (X API free tier is ~100 reads/month):
//   - hard cap of `maxPagesPerSeed` timeline pages per seed (100 tweets/page)
//   - global `readBudget` across all seeds, declared in config
//   - stop-on-error: any API error stops that seed, keeps what succeeded, no retry
//   - cache-first: re-runs reuse the cache (0 reads) unless you pass --force
//
// Usage:  node scripts/discover.js [path/to/config.json]   (default ./config.json)

const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildClient } = require("./client.js");

// Amplification weights: a retweet is a stronger endorsement than a bare mention.
const WEIGHTS = { retweeted: 3, quoted: 2.5, replied_to: 1, mention: 0.5 };

function loadConfig() {
  const configPath = process.argv[2] || path.join(process.cwd(), "config.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config not found at ${configPath}. Copy config.example.json to config.json and edit it.`);
  }
  const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (!Array.isArray(cfg.seeds) || cfg.seeds.length === 0) {
    throw new Error("config.seeds must be a non-empty array of X handles you already trust.");
  }
  return {
    seeds: cfg.seeds.map((s) => s.replace(/^@/, "")),
    domain: cfg.domain || "unspecified",
    maxPagesPerSeed: cfg.maxPagesPerSeed ?? 3,
    readBudget: cfg.readBudget ?? 15,
    cacheDir: (cfg.cacheDir || "~/.trust-chain/cache").replace(/^~/, os.homedir()),
    outputDir: (cfg.outputDir || "./output").replace(/^~/, os.homedir()),
  };
}

const bigAvatar = (url) => (url || "").replace("_normal", "_400x400");
const today = () => new Date().toISOString().slice(0, 10);

// Pull one seed's recent timeline (bounded, cached, stop-on-error).
async function pullSeed(handle, client, cfg) {
  fs.mkdirSync(cfg.cacheDir, { recursive: true });
  const cacheFile = path.join(cfg.cacheDir, `${handle}-${today()}.json`);
  if (fs.existsSync(cacheFile) && !process.argv.includes("--force")) {
    console.error(`[cache] @${handle}: reusing (0 reads)`);
    return { ...JSON.parse(fs.readFileSync(cacheFile, "utf8")), reads_used: 0 };
  }

  let reads = 0;
  let user;
  try {
    user = await client.v2.userByUsername(handle, {
      "user.fields": ["public_metrics", "description", "profile_image_url"],
    });
    reads += 1;
  } catch (e) {
    console.error(`[STOP] @${handle}: user lookup failed (${e.code || "?"})`);
    return { handle, ok: false, reads_used: reads, error: e.code || e.message };
  }
  if (!user.data) {
    console.error(`[STOP] @${handle}: not found`);
    return { handle, ok: false, reads_used: reads, error: "not_found" };
  }

  const tweets = [];
  const includesUsers = {};
  const includesTweets = {};
  let token;
  let stopped = "max_pages";

  for (let page = 0; page < cfg.maxPagesPerSeed; page++) {
    let resp;
    try {
      resp = await client.v2.userTimeline(user.data.id, {
        max_results: 100,
        ...(token ? { pagination_token: token } : {}),
        "tweet.fields": ["created_at", "referenced_tweets", "entities"],
        expansions: ["referenced_tweets.id.author_id", "entities.mentions.username"],
        "user.fields": ["username", "name", "profile_image_url", "public_metrics"],
      });
      reads += 1;
    } catch (e) {
      stopped = `api_error:${e.code || "?"}`;
      console.error(`[STOP] @${handle}: page ${page + 1} failed (${e.code || "?"}) — keeping ${tweets.length} tweets`);
      break;
    }
    const data = resp.data?.data || resp._realData?.data || [];
    for (const t of data) tweets.push(t);
    const inc = resp.data?.includes || resp._realData?.includes || {};
    for (const u of inc.users || []) includesUsers[u.id] = u;
    for (const rt of inc.tweets || []) includesTweets[rt.id] = rt;
    token = resp.data?.meta?.next_token || resp._realData?.meta?.next_token;
    console.error(`[pull] @${handle}: page ${page + 1} got ${data.length} (total ${tweets.length})`);
    if (!token || data.length === 0) { stopped = "no_more_pages"; break; }
  }

  const raw = {
    handle,
    pulled_at: new Date().toISOString(),
    reads_used: reads,
    stopped_reason: stopped,
    user: {
      id: user.data.id,
      name: user.data.name,
      bio: user.data.description || "",
      followers: user.data.public_metrics?.followers_count || 0,
      avatar: bigAvatar(user.data.profile_image_url),
    },
    tweets,
    includes: { users: Object.values(includesUsers), tweets: Object.values(includesTweets) },
    ok: true,
  };
  fs.writeFileSync(cacheFile, JSON.stringify(raw, null, 2));
  console.error(`[done] @${handle}: ${tweets.length} tweets, ${reads} reads, stopped=${stopped}`);
  return raw;
}

// Fold one seed's payload into the aggregate amplification map.
function ingest(payload, seedLc, seedsLc, agg) {
  const usersById = {};
  const usersByHandle = {};
  for (const u of payload.includes?.users || []) {
    usersById[u.id] = u;
    if (u.username) usersByHandle[u.username.toLowerCase()] = u;
  }
  const refTweets = {};
  for (const t of payload.includes?.tweets || []) refTweets[t.id] = t;

  const bump = (usr, type) => {
    if (!usr?.username) return;
    const k = usr.username.toLowerCase();
    if (k === seedLc || seedsLc.has(k)) return; // never surface the seeds themselves
    if (!agg[k]) {
      agg[k] = {
        handle: usr.username,
        name: usr.name || "",
        bio: usr.description || "",
        followers: usr.public_metrics?.followers_count || 0,
        avatar: bigAvatar(usr.profile_image_url),
        seeds: {},
        score: 0,
      };
    }
    const node = agg[k];
    if (!node.seeds[seedLc]) node.seeds[seedLc] = { score: 0, counts: {} };
    node.seeds[seedLc].counts[type] = (node.seeds[seedLc].counts[type] || 0) + 1;
    node.seeds[seedLc].score += WEIGHTS[type] || 0;
    node.score += WEIGHTS[type] || 0;
  };

  for (const t of payload.tweets || []) {
    for (const ref of t.referenced_tweets || []) {
      const rt = refTweets[ref.id];
      const author = rt ? usersById[rt.author_id] : null;
      if (author) bump(author, ref.type);
    }
    for (const mn of t.entities?.mentions || []) {
      const u = usersByHandle[mn.username?.toLowerCase()] || { username: mn.username };
      bump(u, "mention");
    }
  }
}

(async () => {
  const cfg = loadConfig();
  const client = buildClient();
  const seedsLc = new Set(cfg.seeds.map((s) => s.toLowerCase()));
  const agg = {};
  let totalReads = 0;
  const seedSummary = [];

  for (const seed of cfg.seeds) {
    if (totalReads >= cfg.readBudget) {
      console.error(`[BUDGET] hit ${cfg.readBudget} reads — skipping remaining seeds`);
      seedSummary.push({ handle: seed, skipped: "budget" });
      continue;
    }
    const payload = await pullSeed(seed, client, cfg);
    totalReads += payload.reads_used || 0;
    if (!payload.ok) { seedSummary.push({ handle: seed, ok: false, error: payload.error }); continue; }
    ingest(payload, seed.toLowerCase(), seedsLc, agg);
    seedSummary.push({ handle: seed, ok: true, tweets: payload.tweets.length, reads: payload.reads_used });
  }

  const nodes = Object.values(agg).map((n) => {
    const seedHandles = Object.keys(n.seeds);
    return {
      handle: n.handle,
      name: n.name,
      amplification_weight: Number(n.score.toFixed(2)),
      amplified_by: seedHandles,
      seed_count: seedHandles.length,
      cross_validated: seedHandles.length >= 2,
      followers: n.followers,
      interactions: Object.fromEntries(
        seedHandles.map((s) => [s, { score: Number(n.seeds[s].score.toFixed(2)), types: n.seeds[s].counts }]),
      ),
      bio: (n.bio || "").slice(0, 180),
    };
  });

  // Cross-validated (amplified by >=2 seeds) rank first, then by weight.
  nodes.sort((a, b) => b.seed_count - a.seed_count || b.amplification_weight - a.amplification_weight);
  nodes.forEach((n, i) => (n.rank = i + 1));

  const out = {
    generated_at: new Date().toISOString(),
    domain: cfg.domain,
    seeds: cfg.seeds,
    weights: WEIGHTS,
    x_api_reads_used: totalReads,
    totals: {
      distinct_candidates: nodes.length,
      cross_validated: nodes.filter((n) => n.cross_validated).length,
    },
    candidates: nodes,
  };

  fs.mkdirSync(cfg.outputDir, { recursive: true });
  const outFile = path.join(cfg.outputDir, `next-ring-candidates-${today()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));

  console.log(
    JSON.stringify(
      {
        domain: cfg.domain,
        seeds_summary: seedSummary,
        reads_used: totalReads,
        read_budget: cfg.readBudget,
        distinct_candidates: nodes.length,
        cross_validated: out.totals.cross_validated,
        output_file: outFile,
        top10: nodes.slice(0, 10).map(
          (n) => `@${n.handle} (${n.seed_count} seed, w=${n.amplification_weight}${n.cross_validated ? ", XVAL" : ""})`,
        ),
        next_step: "Verify the top candidates by track record before trusting/following — see docs/verification-method.md",
      },
      null,
      2,
    ),
  );
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
