# External SEO / backlink playbook

Goal: get Kapyn discovered in Google via **off-page** signals — backlinks, referral traffic, and
inclusion in the "best AI tools" lists other people cite. On-site SEO (the blog, /compare, /explore) is
already shipping; this is the other half.

## Honest expectations (so we don't fool ourselves)

- Ranking for **"kapyn"** is trivial and already happening. Ranking for **competitive terms**
  ("best AI news app", "claude vs gpt") needs many quality backlinks + months. This is a compounding
  game, not a switch.
- Most guest-post links are **nofollow** → their value is **referral traffic + brand mentions + branded
  search lift**, not raw link juice. That's still worth a lot early on.
- **Do-follow platforms** (real link equity): **Dev.to, Hashnode, Medium (partial), personal Substack.**
  Lead with these.
- **Directory listings are the highest-ROI backlinks** for a product like this — do those first (below).

## Two rules that keep this from backfiring

1. **Don't duplicate on-site content verbatim.** Publishing a copy of a kapyn.app/blog post on Medium can
   split ranking signals. Either (a) write a **fresh** angle for the external site, or (b) if you
   republish, set **`rel=canonical`** back to the kapyn.app original (Medium + Dev.to both support a
   "canonical URL" field — always fill it).
2. **Vary anchor text.** Don't link with "kapyn" every time. Rotate natural phrases: *"a 30-second AI
   news reader"*, *"Kapyn's AI model comparison"*, *"an AI glossary tied to the news"*, *"kapyn.app"*.

## Do this first — directory submissions (1–2 hours, biggest backlink ROI)

Submit Kapyn to these. Most are free; several give do-follow links and steady referral traffic.

| Directory | URL to submit | Notes |
|---|---|---|
| There's An AI For That | theresanaiforthat.com/submit | Highest-traffic AI directory; worth the effort |
| Futurepedia | futurepedia.io/submit-tool | Large AI-tool audience |
| Toolify.ai | toolify.ai/submit | Do-follow, indexes fast |
| AlternativeTo | alternativeto.net (add as alternative to Artifact / Inshorts / TLDR) | Strong domain, do-follow |
| SaaSHub | saashub.com/submit | Do-follow, "alternatives" pages rank |
| Product Hunt | producthunt.com (schedule a relaunch) | Spike + lasting backlink + reviews |
| BetaList | betalist.com/submit | Early-adopter traffic |
| AI Tool Hunt / Insidr / Aixploria | their submit pages | Long-tail directories; batch them |

**Standard blurb to reuse:**
> **Kapyn** — the calm way to keep up with AI. Swipeable 30-second dispatches on the AI/tech news that
> matters, plus an AI model comparison and a news-tied glossary. Mobile-first, free, no paywall. kapyn.app

## The posts (in this folder)

| File | Platform | Lead with? |
|---|---|---|
| `01-listicle-keep-up-with-ai.md` | Medium + Dev.to | Dev.to (do-follow) first, then Medium w/ canonical |
| `02-builder-story-devto.md` | Dev.to / Hashnode | Yes — do-follow, dev audience loves build stories |
| `03-indiehackers-0-to-600.md` | Indie Hackers | Community referral, founder credibility |
| `04-linkedin-firehose.md` | LinkedIn article | Your existing network |
| `05-compare-claude-gpt-gemini.md` | HackerNoon / Substack | Drives to /compare |
| `06-reddit-set.md` | Reddit (3 subs) | Highest short-term referral; follow each sub's rules |

## Sequencing (don't dump all at once — looks spammy to Google and to humans)

- **Week 1:** directory submissions + Post 02 (Dev.to builder story, do-follow).
- **Week 2:** Post 01 (Dev.to listicle) + cross-post to Medium with canonical.
- **Week 3:** Post 03 (Indie Hackers) + Post 04 (LinkedIn).
- **Week 4:** Post 05 (HackerNoon) + the Reddit set, spaced across different days.
- Repeat the cycle with fresh angles monthly. Consistency > volume.

## What "success" looks like in 60–90 days

- Kapyn appears in Google for **branded** + **"kapyn AI news"** queries (fast).
- A handful of do-follow backlinks (Dev.to, directories) start compounding domain authority.
- Referral sessions from Dev.to / Reddit / Product Hunt show up in PostHog.
- The on-site blog + these external links reinforce each other — that's when competitive terms start moving.
