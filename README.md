# trust-chain

> A skill for your AI assistant that finds the people actually worth following on X —
> starting from the few you already trust. You just ask in plain language; the AI does the work.

## What this is (read this first)

trust-chain is **a skill you install into an AI coding assistant** — like
[Claude Code](https://claude.com/claude-code) or a compatible agent. It is **not** a
program you sit and operate yourself.

Once it's installed, you talk to your AI normally:

> *"Find me good people to follow on semiconductors. I already trust @someAnalyst and @someEngineer."*

…and the AI, using this skill, pulls who those trusted accounts amplify, ranks the
candidates, and walks you through checking whether they've actually earned trust. You
don't edit config files or run commands — the AI handles that part. You make the calls.

(If you *are* technical and want to run the scripts directly, you can — see
[Advanced](#advanced-run-it-yourself) at the bottom.)

## The problem it solves

When you get into a new field on X — AI, semiconductors, crypto, biotech — you start by
following the obvious accounts: big media brands, official company handles, the
million-follower names.

But that's rarely where the real signal is. Every field has a smaller group of people who
genuinely know what's going on — the analyst whose supply-chain calls keep turning out
right, the engineer who explains what's actually happening, the researcher who saw it
coming months early. They often have a fraction of the followers, and if you're new you
have no way to find them. X's "who to follow" just pushes you toward more popular accounts.

**trust-chain helps your AI find those hidden high-signal people for you** — and check
whether they've earned trust, instead of guessing from follower counts.

## Who this is for

- **People new to X in a topic**, who only follow the big institutional accounts and
  suspect they're missing the people who really know the field.
- **Anyone who wants their feed to be signal, not noise** — who'd rather follow 20 people
  with a real track record than 200 chasing engagement.
- **Curious investors, researchers, builders, and journalists** mapping out who the
  credible voices in a domain are, and why.

You don't need to be technical. You need an AI assistant that supports skills (like Claude
Code) and a free X API key. The AI does the rest.

## When you'd use it

- You just got into a topic and want to know **"who should I actually be reading?"**
- You already trust a couple of accounts and wonder **"who do they pay attention to that I
  don't know about?"**
- You want to **clean up a noisy feed** and keep only sources that have proven reliable.
- You want a repeatable way to **keep discovering good new sources** as a field moves.

## How it works, in plain terms

You tell the AI **one or two accounts you already trust** in a topic (your "seeds"). The
skill looks at who those people consistently amplify — retweet, quote, reply to, mention —
and builds a ranked list of accounts in their orbit.

The core idea: **if two people you trust both keep pointing at the same third person, that
person is probably worth a look.** Accounts amplified by more than one of your seeds rank
at the top.

```
the people you already trust
        │
        ▼
   who do they keep amplifying?
        │
        ▼
   a ranked list of candidates you didn't know about
        │
        ▼
   check their track record (did their past calls come true?)
        │
        ▼
   follow the ones who actually earned it
```

That last step matters. **The skill finds candidates; it does not declare them
trustworthy.** Being amplified a lot is a lead, not proof. Whether someone earned trust
comes down to whether their past *checkable* claims turned out right — and the AI walks
you through that using the method in
[`docs/verification-method.md`](docs/verification-method.md).

## Two parts, and we're upfront about which is which

| Part | What it does | Who does it |
|------|--------------|-------------|
| **Discovery** | Ranks who your trusted seeds amplify. Cross-validated picks (amplified by 2+ seeds) come first. | Automated — the AI runs `scripts/discover.js` |
| **Verification** | Decides who actually earned trust by checking their track record. | You and the AI together, using a documented method |

We don't pretend a script can decide who's trustworthy. Discovery is mechanical, so it's
automated. Trust is earned and everyone's bar is different, so it's a method the AI guides
you through — not a black box.

## Install (as a skill)

You'll need [Node.js](https://nodejs.org), an AI assistant that supports skills, and a
free X API key from [developer.x.com](https://developer.x.com).

```bash
# 1. Install the skill where your AI looks for skills.
#    For Claude Code, that's ~/.claude/skills/
git clone https://github.com/feinanbang/x-trust-chain-skill ~/.claude/skills/trust-chain

# 2. Install its dependencies.
cd ~/.claude/skills/trust-chain && npm install

# 3. Add YOUR X API keys (gitignored — they never leave your machine).
cp .env.example .env   # then edit .env
```

Now just ask your AI: *"use trust-chain to find good semiconductor accounts to follow,
I trust @x and @y."* It will set up the config, run discovery, and guide verification.

## Things we promise

- **Your keys stay yours.** Ships with no credentials. It reads your own keys from a local
  `.env` that's never committed. Your account, your quota.
- **It won't blow your API quota.** X's free tier is ~100 reads/month, so the skill is
  frugal: it caps reads, caches results so re-runs cost nothing, and stops on the first
  error instead of hammering the API.
- **It never acts for you.** It only produces lists. It never follows or unfollows anyone
  — every decision stays yours.

## Advanced: run it yourself

You don't need an AI to use the engine. With `.env` and a `config.json` set up
(`cp config.example.json config.json`, then edit), run:

```bash
node scripts/discover.js
```

Output lands in `./output/`. See [`examples/sample-output.md`](examples/sample-output.md).

## License

MIT — see [LICENSE](LICENSE). Built by [@feinanbang](https://github.com/feinanbang).
