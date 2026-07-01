---
platform: Indie Hackers (indiehackers.com — post as a "Milestone" or forum story)
target_query: community + referral (IH threads rank for long-tail founder queries)
canonical: none (original)
backlinks: kapyn.app (once, in context — IH is anti-spam, keep it incidental)
anchor_text_variants: ["Kapyn", "kapyn.app"]
note: >
  Indie Hackers rewards vulnerability and specifics, punishes marketing. Numbers are the user's own
  stated figures (~600 signups, ~80 weekly active). Lead with the failure, not the win.
---

# 0 → ~600 users on an AI news app — what worked, what flopped, and the mistake I'm still fixing

Quick context: I built [Kapyn](https://kapyn.app), a mobile-first app that turns AI/tech news into
swipeable 30-second cards. I'm at roughly 600 signups and ~80 weekly actives. Not a rocket ship — but I've
learned more from the flops than the wins, so here's the honest version.

## What flopped

**1. "People like the concept" is a trap.** Early on, ~15 people told me they liked it. Almost none came
back. "I like the concept" is politeness, not retention. The questions that actually matter: *"What did
you stop using to use this?"* and *"Would you be annoyed if it disappeared?"* Nobody could answer those
for me, which told me everything.

**2. I built a vitamin, not a painkiller.** AI news is a commodity — it's on X, Reddit, five newsletters,
and you can just ask ChatGPT. "Read AI news" isn't a daily job to be done. I mistook *"this is nicely
made"* for *"I need this."*

**3. No return trigger.** I had no push, no email, and my ingestion ran once a day — so if you opened it
twice, you saw the same cards and thought "nothing new." A product with no reason to come back cannot
retain, no matter how clean the UI. This was self-inflicted and I'm still fixing it.

**4. No distribution channel actually running.** 15 friends is not a channel. I shipped SEO pages and
assumed traffic would come; SEO takes months. For weeks I had a product and no pipe into it.

## What worked

**1. Radical scope-narrowing of the content.** Distilling every story to 2–3 calm sentences, no hype, was
the one thing people consistently praised without prompting. The constraint *is* the product.

**2. Building in public + content as the moat.** I started publishing genuinely useful stuff (comparisons,
"what is X" explainers, tool roundups) instead of just posting "check out my app." That's slow but it
compounds, and it's the only thing competitors can't copy overnight.

**3. Talking to churned users — five honest conversations beat any dashboard.** The moment I stopped
looking at analytics and started asking "walk me through the last time you opened it," the real problems
became obvious in an afternoon.

## The mistake I'm still fixing

Retention. I'm turning on the return trigger I should have built first: web push for breaking news, a daily
email digest, and bumping ingestion from daily to every few hours so the feed is never stale. My bet is
that acquisition was never the real problem — the leaky bucket was.

## If you're building something similar

- Ship the **return trigger before the polish**. A reason to come back beats a prettier card.
- Treat "I like the concept" as a **red flag**, not validation. Dig for the painkiller.
- Pick **one distribution channel** and go deep, instead of five channels done thin.

Happy to share specifics on the stack or the ingestion pipeline if it's useful. It's at
[kapyn.app](https://kapyn.app) if you want to poke at it — feedback welcome, especially the harsh kind.
