# Sample discover output (synthetic)

This is an illustrative example of what `node scripts/discover.js` prints and writes.
The handles and numbers are made up — your real run will reflect your own seeds.

## Console summary

```json
{
  "domain": "semiconductors",
  "seeds_summary": [
    { "handle": "seed_one", "ok": true, "tweets": 280, "reads": 3 },
    { "handle": "seed_two", "ok": true, "tweets": 240, "reads": 3 }
  ],
  "reads_used": 6,
  "read_budget": 15,
  "distinct_candidates": 142,
  "cross_validated": 7,
  "output_file": "./output/next-ring-candidates-2026-06-03.json",
  "top10": [
    "@analyst_a (2 seed, w=18.5, XVAL)",
    "@analyst_b (2 seed, w=13.0, XVAL)",
    "@analyst_c (2 seed, w=9.5, XVAL)",
    "@analyst_d (1 seed, w=22.0)",
    "@analyst_e (1 seed, w=14.5)"
  ],
  "next_step": "Verify the top candidates by track record before trusting/following — see docs/verification-method.md"
}
```

## How to read it

- **Cross-validated (`XVAL`) candidates rank first.** These are accounts amplified by
  **more than one** of your trusted seeds — the strongest discovery signal, because two
  independent sources you trust both point at them.
- **`amplification_weight`** sums weighted interactions (retweet 3, quote 2.5, reply 1,
  mention 0.5). High weight from a single seed can still be noise; cross-validation is
  the stronger filter.
- **This list is a lead, not a verdict.** A high rank means "your trusted sources point
  here a lot" — not "this person is correct." Run them through
  `docs/verification-method.md` before you actually follow.

## One entry from the output JSON

```json
{
  "rank": 1,
  "handle": "analyst_a",
  "name": "Analyst A",
  "amplification_weight": 18.5,
  "amplified_by": ["seed_one", "seed_two"],
  "seed_count": 2,
  "cross_validated": true,
  "followers": 21000,
  "interactions": {
    "seed_one": { "score": 11.0, "types": { "retweeted": 3, "quoted": 1 } },
    "seed_two": { "score": 7.5, "types": { "quoted": 3 } }
  },
  "bio": "(their bio, first 180 chars)"
}
```
