# The verification method

`discover.js` finds candidates. It does **not** tell you who to trust. This document
is the other half — how to decide whether a discovered account has actually *earned*
trust. This part is deliberately manual and judgment-driven, because **everyone's
verification standard is different**, and it should be. Treat this as a framework to
fill in with your own domain and your own sources of ground truth.

## Why not just follow whoever has the most followers?

Follower count and engagement measure popularity, not accuracy. The person worth
following is the one whose **falsifiable claims later turned out to be right** — often
someone with far fewer followers than the institutional accounts a newcomer defaults to.
Discovery surfaces candidates; verification is what separates a real signal from a
confident voice.

## Three mechanisms of trust

1. **Verifiability** — the claim withstands cross-checking. The same fact from multiple
   credible institutions, or an irrefutable primary source (a filing number you can
   check against the company's own document). The strongest mechanism.
2. **Reputation** — you trust a source because it is accountable for what it says:
   official journals, named experts, executives. Reputation is *earned by* verifiability
   over time, not assumed.
3. **Transitive trust** — trusting person A lets you reach the people A consistently
   amplifies. This is exactly what `discover.js` mechanizes. But transitive trust is a
   *lead*, not a verdict — the discovered account still has to clear mechanism 1.

## The flywheel (why this compounds)

```
someone makes a falsifiable call
  → you timestamp it
    → time passes; the call is confirmed or refuted
      → their reputation moves accordingly
        → you follow + traverse who they amplify (discover.js)
          → new candidates surface, who make their own calls → repeat
```

The engine that turns a static "who do I follow" snapshot into a self-correcting system
is the **prediction ledger**: a claim → timestamp → later verified → update the source's
reputation. See `docs/ledger-template.json` for a schema you can keep your own in.

## Two design rules to keep it honest

1. **Trust is (person × domain), never a single global score.** Someone reliable on
   semiconductors is not automatically reliable on macro or politics. Tag every judgment
   with the domain. Otherwise an authority bleeds into areas they know nothing about.
2. **Transitive trust must decay with distance and resist echo chambers.** A amplifies B
   amplifies A is not corroboration. Don't reinvent this — borrow established ideas:
   PageRank (distance decay + damping), EigenTrust (normalized transitive aggregation),
   PGP web-of-trust (signed assertions, marginal trust).

## A scoring sketch (adapt the weights to your taste)

When you have logged enough resolved claims for a candidate, score them on three axes:

- **Commitment** — how many falsifiable, time-bound calls they actually make. Making a
  real, checkable prediction is itself a positive signal; vague commentary is not.
- **Calibration** — did their stated confidence match outcomes?
- **Hit-rate** — confirmed / (confirmed + refuted), **gated** behind a commitment
  minimum so that "said almost nothing, never wrong" cannot top the ranking.

Map the composite to a multiplier and promote a candidate into your trusted set only
when the composite is high enough **and** they've made enough calls to judge. The exact
thresholds are yours.

## Penalize errors of fact, not errors of opinion

A forecast that turned out wrong is normal — that's the cost of making falsifiable calls,
and you *want* people who make them. The disqualifying signal is a **stated false fact**
(a wrong number, a fabricated event), especially a repeated one. When you prune, prune on
factual-error rate, not on opinions or predictions you disagreed with.

## Resolve cheaply: your own knowledge first

When checking a claim, work outward in order of cost:

1. **What you already know / have on file** — your notes, prior verified claims, saved
   sources. Zero cost, and it compounds: the more you log, the more new claims resolve for free.
2. **Cached material** — things you already pulled.
3. **Web search** — last resort, for the claims nothing else can settle.

This keeps the method runnable without burning API budget or hours per claim.
