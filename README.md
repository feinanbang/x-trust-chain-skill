# trust-chain

> Find the people actually worth following on X — starting from the few you already trust.

## The problem this solves

When you get into a new field on X — say AI, semiconductors, crypto, or biotech — you
usually start by following the obvious accounts: the big media brands, the official
company handles, the people with millions of followers.

But those are rarely where the real signal is. In every field there's a smaller group of
people who genuinely know what they're talking about — the analyst whose supply-chain
calls keep turning out right, the engineer who explains what's actually happening, the
researcher who saw something coming months early. They often have a fraction of the
followers. And if you're new, you have no way to find them. You don't know their names,
and X's "who to follow" suggestions just push you toward more popular accounts.

**trust-chain helps you find those hidden high-signal people** — and then check whether
they've actually earned your trust, instead of guessing from follower counts.

## Who this is for

- **People new to X in a topic**, who only follow the big institutional accounts and
  suspect they're missing the people who really know the field.
- **Anyone who wants their feed to be signal, not noise** — and would rather follow 20
  people with a real track record than 200 accounts chasing engagement.
- **Curious investors, researchers, builders, and journalists** who want to map out who
  the credible voices in a domain are, and why.

You don't need to be technical to understand the idea. You do need a basic comfort with
running a command, and a free X developer key (instructions below).

## When you'd use it

- You just got interested in a topic and want to know **"who should I actually be reading?"**
- You already follow a couple of people you trust, and you think **"who do they pay
  attention to that I don't know about?"**
- You want to **clean up a noisy feed** and keep only sources that have proven reliable.
- You want a repeatable way to **keep discovering good new sources** as a field evolves.

## How it works, in plain terms

You give trust-chain **one or two accounts you already trust** in a topic (we call these
your "seeds"). It looks at who those people consistently amplify — retweet, quote, reply
to, mention — and builds a ranked list of the accounts in their orbit.

The key idea: **if two people you trust both keep pointing at the same third person, that
person is probably worth a look.** Those "amplified by more than one of your seeds"
accounts rank at the top.

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

That last step matters. **The tool finds candidates; it does not declare them
trustworthy.** Being amplified a lot is a lead, not proof. Whether someone has earned
trust comes down to whether their past *checkable* claims turned out right — and that's a
judgment you make, with a method we walk you through in
[`docs/verification-method.md`](docs/verification-method.md).

## Two parts, and we're upfront about which is which

| Part | What it does | Who does it |
|------|--------------|-------------|
| **Discovery** | Ranks who your trusted seeds amplify. Cross-validated picks (amplified by 2+ seeds) come first. | The tool, automatically — `scripts/discover.js` |
| **Verification** | Decides who actually earned trust by checking their track record. | You, using a documented method — `docs/verification-method.md` |

We don't pretend a script can decide who's trustworthy. Discovery is mechanical and we
automated it. Trust is earned, everyone's bar is different, so we hand you a clear method
instead of a black box.

## Quick start

You'll need [Node.js](https://nodejs.org) and a free X API key (get one at
[developer.x.com](https://developer.x.com)).

```bash
npm install

# 1. Add YOUR X API keys. This file is gitignored — your keys never leave your machine.
cp .env.example .env

# 2. Set your trusted seed accounts and the topic.
cp config.example.json config.json

# 3. Find candidates.
node scripts/discover.js
```

You'll get a ranked list in `./output/`. See
[`examples/sample-output.md`](examples/sample-output.md) for what it looks like, and read
[`docs/verification-method.md`](docs/verification-method.md) before you actually follow
anyone.

## Things we promise

- **Your keys stay yours.** The tool ships with no credentials. It reads your own keys
  from a local `.env` that is never committed. You use your own account and quota.
- **It won't blow your API quota.** X's free tier is about 100 reads a month, so the tool
  is frugal by design: it caps how much it reads, caches results so re-runs cost nothing,
  and stops on the first error instead of hammering the API.
- **It never acts for you.** trust-chain only produces lists. It never follows or
  unfollows anyone — every decision stays yours.

## License

MIT — see [LICENSE](LICENSE). Built by [@feinanbang](https://github.com/feinanbang).
