---
platform: Dev.to (do-follow) primary, cross-post to Hashnode (do-follow)
target_query: "build an AI news app", "Next.js Supabase Gemini project", devs
canonical: none (original)
tags: [nextjs, ai, supabase, webdev]
backlinks: kapyn.app (intro), the live feed + /compare (in body)
anchor_text_variants: ["Kapyn", "the live app", "kapyn.app"]
note: >
  Dev.to rewards real technical detail and honesty about trade-offs. This is a build story, not an ad —
  the link is incidental to the lesson. Keep the code snippets accurate to the actual stack.
---

# I built an AI news app that distills every story to 30 seconds — here's the stack and what I'd change

There's too much AI news and almost none of it is skimmable. I wanted an Inshorts-style reader for AI: swipe
through 30-second cards, each one a calm 2–3 sentence summary, no hype. So I built one — [Kapyn](https://kapyn.app) —
and this is the honest engineering write-up: the stack, the pipeline, the parts that broke, and what I'd do
differently.

## The stack

- **Next.js (App Router) + React 19** — the whole app, including the ingestion API routes.
- **Supabase (Postgres)** — a single `news_items` table with a 48h rolling window.
- **Google Gemini 2.5 Flash Lite** — classification + summarization, with an **OpenRouter** free-tier model
  as a fallback so a single provider outage doesn't kill ingestion.
- **Framer Motion** — the swipe/card-stack physics.
- **Vercel Cron** — triggers the ingestion pipeline on a schedule.
- **PostHog** — product analytics.

## The pipeline (the actual interesting part)

Every run does roughly this:

```
Cron → GET /api/news/fetch
  → fetch ~30 RSS feeds + Product Hunt in parallel
  → for each new item: pull the OG image + description
  → classify + summarize with Gemini (fallback: OpenRouter)
  → quality-filter (drop low-signal / off-topic / prompt-leak garbage)
  → upsert into Supabase, dedupe on source_url
  → delete anything older than 48h
```

Two things mattered more than I expected:

**1. Dedupe on a stable key, not the title.** The same story shows up across five feeds with five slightly
different headlines. I dedupe on a normalized `source_url` (unique constraint) so the DB rejects dupes for
free instead of me diffing titles.

**2. The LLM will happily summarize garbage.** A changelog entry, a cookie notice, a "we use AI" press
release — the model summarizes them all confidently. So the summary prompt has explicit escape hatches: it
returns a `LOW_SIGNAL` sentinel for minor patches and `OFF_TOPIC` for anything not about AI/tech, and a
`isBadSummary()` filter drops those before they ever hit the DB. Without that gate, ~20% of the feed was
noise.

```ts
// simplified — the model is told to bail, and we enforce it
if (isBadSummary(summary)) return; // LOW_SIGNAL / OFF_TOPIC / prompt leak → dropped
```

## Things that broke

- **Module-eval crashes.** Instantiating the Supabase client at module scope (`const supabase =
  createClient(url, key)`) means a missing env var throws at *build* time, not request time. Fine on Vercel
  (env present), painful locally. Lazy-init or guard it.
- **RSS feeds are wildly inconsistent.** Some give you a clean OG image, some give you nothing, some give you
  a tracking pixel. You need a per-item metadata fetch and a graceful fallback, not trust.
- **"Tech-adjacent" is not "on-topic."** A non-AI story about a tech *company* (a hotel-tech startup's IPO)
  sailed through my first relevance filter because the gate allowed "tech industry." Narrowing the gate to
  "substantively about AI/tech" mattered.

## What I'd change

- **Ingest more often than daily.** A once-a-day cron means the feed is stale by dinnertime. Moving to every
  2–4 hours (via a GitHub Action, since Vercel Hobby caps crons at daily) is the single biggest UX win left.
- **Add the primary sources I was lazy about** — some labs don't publish RSS, so I relied on second-hand
  coverage and missed launches. Worth the extra scraping.
- **Ship the return trigger sooner.** Web push was built but buried; a news app with no reason to come back
  can't retain, no matter how clean the UI.

## Takeaway

The hard part of an "AI-summarizes-the-news" product isn't the AI — the models are good enough. It's the
**boring plumbing**: dedupe, freshness, and a ruthless quality gate. The summary is 10% of the work; deciding
what deserves a summary is the other 90%.

The result is live at [kapyn.app](https://kapyn.app) if you want to see it (there's also a side-by-side
[model comparison](https://kapyn.app/compare)). Happy to answer anything about the pipeline in the comments.
