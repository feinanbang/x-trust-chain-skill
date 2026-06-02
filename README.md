# trust-chain

**New to X and only following the big institutional accounts? You're missing the people who actually know things.**

The highest-signal voices in any field — the analyst whose chip-supply calls keep coming
true, the researcher who called the model release months early — usually have a fraction
of the followers of the brand-name accounts. They're hard to find if you don't already
know the scene.

trust-chain finds them. You give it **one or two accounts you already trust** in a topic.
It mines who *they* amplify — retweet, quote, reply to, cite — and surfaces the credible
people in their orbit that you didn't know about. Then it gives you a method to check
whether those people have actually *earned* trust, by track record, not popularity.

```
people you already trust  ──►  who they amplify  ──►  ranked candidates  ──►  verify by track record  ──►  follow the ones who earn it
```

## Two halves (and we're honest about which is which)

| | What | Automated? |
|---|---|---|
| **Discovery** | From your trusted seeds, rank who they amplify. Anyone amplified by *more than one* seed ranks highest. | ✅ Yes — `scripts/discover.js` |
| **Verification** | Decide who actually earned trust: log their falsifiable claims, check if past ones came true. | ✍️ A method you apply — `docs/verification-method.md` |

Discovery is mechanical. Trust is earned, and everyone's bar for it is different — so we
document the method instead of pretending a script can decide for you.

## Quick start

```bash
npm install

cp .env.example .env          # add YOUR X API keys (free tier works). Gitignored — never committed.
cp config.example.json config.json   # set your trusted "seeds" and the topic

node scripts/discover.js
```

You'll get a ranked candidate list in `./output/`. See
[`examples/sample-output.md`](examples/sample-output.md) for what it looks like, then
read [`docs/verification-method.md`](docs/verification-method.md) before you follow anyone.

## Your keys stay yours

This tool ships with **no credentials**. `scripts/client.js` reads your own keys from a
local `.env` (which is gitignored). You use your own X account and your own API quota —
nothing of anyone else's is bundled in.

## Built to respect the X API free tier

The free tier is ~100 reads/month, so the tool is deliberately frugal: a hard read budget
per run, a page cap per seed, cache-first re-runs (0 reads), and stop-on-error instead of
retry loops. You won't blow your quota by running it.

## It never acts for you

trust-chain produces lists. It never follows or unfollows anyone — you decide.

## How discovery ranks candidates

Each interaction from a seed is weighted (retweet 3, quote 2.5, reply 1, mention 0.5) and
summed per candidate. Candidates amplified by two or more of your seeds are
**cross-validated** and ranked first — two independent sources you trust both pointing at
the same person is the strongest signal a script can give you. But it's still just a
lead: verify before you trust.

## License

MIT — see [LICENSE](LICENSE).
