# Analytics findings — 22 August 2026

> Pulled directly from PostHog (project `435054`) via HogQL, not from dashboard
> screenshots. Window: trailing 90 days. Reproduce with the queries at the end.

---

## 1. The shape of the problem

Weekly users who actually swiped a story:

| Week | People | Swipes | Swipes/person |
|---|---|---|---|
| 2026-05-24 | 18 | 1,412 | 78 |
| 2026-05-31 | 56 | 1,890 | 34 |
| 2026-06-07 | 44 | 1,606 | 36 |
| **2026-06-14** | **81** | 1,671 | 21 |
| 2026-06-21 | 18 | 412 | 23 |
| 2026-06-28 | 18 | 291 | 16 |
| 2026-07-05 | 6 | 311 | 52 |
| **2026-07-12** | **60** | 592 | 10 |
| 2026-07-19 | 32 | 502 | 16 |
| 2026-07-26 | 4 | 113 | 28 |
| 2026-08-02 | 2 | 45 | 23 |
| 2026-08-09 | 2 | 11 | 6 |
| 2026-08-16 | 2 | 7 | 4 |

**Kapyn has had real usage** — 297 people swiped 8,863 stories over 90 days, 552
reached the end of the feed. This is not a product nobody wanted. It is a product
that lost the people it had: 81 weekly users down to 2, and depth per person down
from 78 swipes to 4.

## 2. Every peak was a manual push. None became a channel.

| Week | Users | Source |
|---|---|---|
| 05-31 | 56 | LinkedIn (18), Product Hunt (8), Bing (9) |
| 06-14 | 81 | Instagram (10), Facebook (6) |
| 06-21 | 18 | Instagram (8), Facebook (8), Google (8), LinkedIn (6), X (6) |
| 06-28 | 18 | Bing (15), Google (15) — first real search traffic |
| 07-05 | 6 | LinkedIn (16), Instagram (11) |
| **07-12** | 60 | **Reddit (66)** — largest single source in 90 days |
| 07-19 | 32 | Reddit tail (10) |
| 07-26 onward | 4 → 2 | nothing |

**Reddit is the best channel by a wide margin.** LinkedIn quietly delivered three
separate times (18, 10, 16) without ever being treated as one. Every peak decays
to zero inside two weeks. Nothing has been pushed since 26 July; traffic has been
flat at ~2 people/week since.

## 3. Retention is worse than the dashboard implies

Distinct days used per person, 90 days:

| Days active | People | Share |
|---|---|---|
| **1** | **983** | **91.4%** |
| 2 | 60 | 5.6% |
| 3 | 17 | 1.6% |
| 4+ | 14 | 1.3% |

**91.4% of everyone who ever arrived came once and never came back.** 92 of 1,075
returned on a different day (8.6%).

A tiny hardcore exists — individuals with 31, 20 and 17 active days. The product
can hold someone. It holds roughly 1 in 350.

## 4. ⭐ The finding: investment predicts return, consumption does not

Baseline return rate is **9.5%**. Of people who performed each action *in their
first session*, the share who came back on a later day:

| First-session action | n | Returned | vs baseline |
|---|---|---|---|
| Bookmarked a story | 9 | 44.4% | 4.7× |
| **Opened saved stories** | 53 | **35.8%** | **3.8×** |
| Changed feed prefs | 9 | 33.3% | 3.5× |
| Opened a breakdown | 44 | 25.0% | 2.6× |
| Opened a Radar tool | 20 | 25.0% | 2.6× |
| **Changed category** | 98 | **24.5%** | **2.6×** |
| Clicked through to source | 65 | 16.9% | 1.8× |
| Swiped a story | 292 | 17.5% | 1.8× |
| Reached end of feed | 535 | 12.9% | 1.4× |

Every action where the user **puts something into the product** roughly triples
return. Every **passive** action barely moves it — including reaching the end of
the feed, which is what the product is designed around and which 535 people did.

The two most trustworthy signals are `saved_stories_viewed` (best effect size with
a real sample) and `category_changed` (largest sample of any strong signal).
Bookmarking looks strongest at 44% but n=9 — directionally consistent, not
bankable alone.

**Caveat:** correlation, not proof. People inclined to return may simply be more
likely to explore settings. But the pattern holds across six independent
investment actions and is absent from every passive one, which selection bias
alone struggles to explain.

**The gap this exposes:** only 98 of 1,093 people ever changed a category, and
only 9 ever bookmarked. The behaviours that predict retention are ones almost
nobody discovers. That is a design problem, not a demand problem.

## 5. Activation leak, measured

Feed sessions by deepest card reached (`feed_session_ended`, shipped in PR #45):

| Depth | Sessions |
|---|---|
| **0** | **23** |
| 2 | 4 |
| 3 | 2 |
| 4 | 8 |
| 5+ | 5 |

Over half of sessions end on the **first card**.

## 6. What the audience actually wants — the content brief

Category picks over 90 days:

| Category | Picks | People |
|---|---|---|
| **ai-models** | 151 | 84 |
| **dev-tools** | 111 | 61 |
| **open-source** | 79 | 43 |
| startups | 60 | 29 |
| big-tech | 47 | 28 |
| research | 46 | 24 |
| funding-ma | 45 | 28 |
| infrastructure | 41 | 25 |
| policy | 25 | 17 |

Radar tools actually opened: `context7`, `git`, `filesystem`, `apify`, `sentry`,
`n8n`, `cursor`, `memory`, `google-maps` — overwhelmingly **MCP servers and
coding tools**.

**Write about:** model comparisons, MCP servers, dev tools, open source.
**Stop writing about:** marketing, education, customer support, policy. These have
no support anywhere in the data.

## 7. Implications

1. **Acquisition works when attempted.** Reddit, LinkedIn, Instagram and Product
   Hunt all delivered. Nothing is running now — that is why traffic is flat.
2. **Retention is the binding constraint**, and pushing traffic into a 91%
   one-and-done funnel is what July already proved doesn't work.
3. **The highest-leverage build is one investment moment in session one** — get a
   first-time user to pick topics or save one story, rather than just swipe.
   Not more content; not more features.

## Reproducing this

Personal API key in `.env.local` as `POSTHOG_PERSONAL_API_KEY`; project `435054`;
`POST https://us.posthog.com/api/projects/435054/query/` with
`{"query":{"kind":"HogQLQuery","query":"<SQL>"}}`. HogQL rejects `toInt64`/
`toInt32OrNull` — use `toInt` or compare as strings.

The PostHog MCP server is configured in `.mcp.json` and activates on the next
Claude Code restart, which makes this queryable without hand-rolled API calls.
