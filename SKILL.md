---
name: trust-chain
description: Find unknown-but-credible accounts to follow on X by mining the amplification graph of people you already trust, then verifying candidates on track record. Use when you want to discover high-signal sources in a topic, or build a self-correcting list of who to trust for information. Discovery is automated; verification is a documented method you apply yourself.
---

# trust-chain — find who to actually trust on X

Most people new to X follow the obvious institutional accounts and miss the people
doing the real work. This skill fixes that: start from **one or two accounts you already
trust** in a topic, and find the credible people *they* amplify — then verify those
candidates on whether their past calls came true, not on follower count.

Two halves, and they are honest about which is which:

1. **Discovery — automated.** `scripts/discover.js` mines who your trusted "seed"
   accounts retweet / quote / reply to / mention, and ranks the resulting candidates.
   Accounts amplified by *more than one* of your seeds (cross-validated) rank highest.
2. **Verification — a method you apply.** Discovery gives leads, not verdicts. Whether a
   candidate has *earned* trust is judgment-driven and differs per person, so it is
   documented as a framework, not hard-coded. See `docs/verification-method.md`.

## Setup (one time)

1. `npm install`
2. Copy `.env.example` → `.env`, add your own X API keys (free tier is fine). Your keys
   never leave your machine — `.env` is gitignored.
3. Copy `config.example.json` → `config.json`, set your `seeds` (handles you trust) and
   `domain`.

## Run discovery

```
node scripts/discover.js
```

Outputs a ranked candidate list to `./output/`. Cross-validated candidates first.
Re-runs reuse the cache (0 API reads) unless you pass `--force`.

## Then verify before you follow

Take the top candidates and run them through `docs/verification-method.md`:
log their falsifiable claims, check whether past ones came true, score on
commitment / calibration / hit-rate, and keep a running ledger
(`docs/ledger-template.json`). Promote into your trusted set only the ones who clear it.

## Principles baked in

- **API economy** — free tier is ~100 reads/month. The tool caps reads per run
  (`readBudget` / `maxPagesPerSeed`), caches everything, and stops on the first API error
  rather than retrying. Never burns the budget in a loop.
- **You decide who to follow** — the tool produces lists, never follows or unfollows
  anyone for you.
- **Trust is per-domain** — someone credible on chips isn't automatically credible on
  macro. Keep separate seeds/configs per domain.

## Files

- `scripts/discover.js` — the discovery engine (runnable)
- `scripts/client.js` — minimal X API client (reads your `.env`, no bundled credentials)
- `docs/verification-method.md` — how to verify candidates (the method)
- `docs/ledger-template.json` — schema for your own prediction ledger
- `examples/sample-output.md` — what a discovery run looks like
