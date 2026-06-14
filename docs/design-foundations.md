# Kapyn — Design Foundations

*The first-principles brief for "the easiest place on the internet to understand AI."*

> **Why this doc exists.** We almost started at pixels (picking a "vibe" from three mockups). That's backwards. A world-class product is built who → job → transformation → flows → *then* visual. This is the brief a product designer would build from — synthesized from a first-principles UX teardown of 16 platforms across four lenses. Visual craft is Section 6, not Section 1. When we eventually bring in a designer, this is what we hand them to react to (a designer is ~10x more effective reacting to a thought-through brief than designing from blank).
>
> **Method & honesty.** Built from parallel teardowns of: AI answer engines (Perplexity, ChatGPT, Google AI Overviews); structured reference (Wikipedia, Investopedia, Stanford Encyclopedia of Philosophy, Notion); reading-craft masters (Stripe Docs, Stripe Press, Anthropic, Every.to, Linear); and habit/transformation products (Brilliant, Duolingo, Maven) plus the cautionary deaths (Inshorts, Artifact, Circa). Most teardown detail is deep model knowledge (web search was blocked mid-run); the **retention-benchmark numbers in §4 are live 2024–2026 web data.** The JTBD in §1 is my synthesis — we can pressure-test it with the installed `jobs-to-be-done` skill before locking it.

---

## 1. The job to be done

People don't want "AI news." They want to **stop feeling behind.** The anxiety is specific: the field moves weekly, every headline assumes a concept you half-understand, and the cost of asking "what's RAG, actually?" in a meeting feels too high.

**The transformation we sell:** *from "I'm quietly anxious I'm falling behind on AI" → "I understand what's happening and I can explain it."*

| Job type | What they're actually hiring Kapyn for |
|---|---|
| **Functional** | "Tell me what happened today, and let me actually understand the thing it's about — fast." |
| **Emotional** | "Make me feel current and competent, not overwhelmed or dumb." |
| **Social** | "Let me sound informed — explain this concept to a colleague tomorrow." |

**Personas (primary → secondary):**
- **The builder** (engineer/PM): needs to *use* the concept. Trusts sources, hates fluff. Will leave for the primary doc if we feel shallow.
- **The operator/founder**: needs to *talk about* the concept credibly. Values the 30-second-then-go-deeper arc.
- **The curious learner** (incl. students): wants a *path*, not a one-off answer. Highest lifetime value if we deliver the "getting smarter" feeling.

**The "hire/fire" test for every feature:** does it move someone along the anxiety → competence transformation? If not, it's decoration.

---

## 2. The competitive truth

Every substitute fails at the **same** thing, in different ways:

| Cluster | What it nails | Where it fails | The gap it leaves |
|---|---|---|---|
| **AI answer engines** (Perplexity, ChatGPT, AI Overviews) | Instant, grounded-ish answers; follow-ups; the "Related" curiosity rail | **Ephemeral** (no durable URL/artifact); citations often don't support the claim ("citation laundering"); flat single-depth; **no memory of what you already understand**; stale on week-old AI news | A *durable, trustworthy, progressive* artifact you can return to |
| **Structured reference** (Wikipedia, Investopedia, SEP, Notion) | Durable; cross-linked knowledge graph; answer-first lede (Wikipedia); "Key Takeaways" + worked examples (Investopedia); authority/provenance | **Dry & overwhelming**; no progressive disclosure (SEP drops you into a grad seminar); poor mobile (tables, tap targets); **not fresh** — slow on fast-moving AI; ad-cluttered (Investopedia) | The *calm, current, mobile-native* version of an encyclopedia |
| **Reading-craft masters** (Stripe, Anthropic, Every.to, Linear) | The *feeling* of premium, trustworthy reading; deceleration; quiet authority | Not about AI concepts; docs assume you already know what you're looking for | Borrow the craft; apply it to *understanding*, not reference-lookup |
| **Habit / transformation** (Brilliant, Duolingo, Maven) | The "I'm getting smarter" feeling; daily ritual; investment that compounds | Brilliant gates behind a paywall; Duolingo's streaks become manipulative guilt; Maven needs cohorts/live | The *calm* habit loop — progress without dark patterns |

**The convergent insight:** the substitutes split into two camps that never meet —
- AI chat gives you **understanding without durability** (gone when the session ends), and
- Wikipedia gives you **durability without freshness or calm** (a wall of stale text).

**Nobody connects the chain: breaking news → the evergreen concept behind it → your growing comprehension of it.** That chain is the white space.

---

## 3. The white space we own

> **Kapyn is the calm, current, source-grounded place where today's AI news links to the evergreen concept behind it — and reading it makes you feel yourself getting smarter.**

The news stream is the *input*. The durable concept/entity knowledge graph is the *asset*. This is the only positioning that fixes **both** of Kapyn's structural problems at once:
- **Acquisition** — durable, SEO-indexed concept pages are the long-tail front door (AI chat and Wikipedia can't be news-fresh; we can).
- **Retention** — a reason to return that isn't "there's new news today": *your understanding compounds here.*

The moat is **curation + structure + real grounding** — not more generated text. Ungrounded AI summaries make people learn *less* and don't differentiate from free ChatGPT. Our grounding (every claim traces to a Kapyn source story, with a date) is the defensible edge.

---

## 4. The retention reality (live data — read this twice)

Two findings that reframe the whole strategy:

**a) The format is NOT doomed.** Across 2024–2026 benchmark sources (Statista, Business of Apps, OneSignal, UXCam), **news apps lead Day-30 retention (~8–11%) — roughly 2.5x the ~4% all-category median**, beaten only by banking. Driver: *habitual daily use.* So a calm daily-news habit is a legitimately strong retention base — better than gaming or social, which spike on Day 1 and churn.

**b) But the swipe-only ceiling is real and lethal.** Inshorts (decade, ~$165M raised) and Artifact (Instagram's founders, shut down 2024) both proved the *same* failure: a 30-second card format creates **sessions, not habits** — *information without understanding*, on a fixed-ratio reward schedule that ends cleanly each session, with **zero user investment** that makes switching costly. Systrom's own post-mortem: "the market opportunity isn't big enough." The lesson isn't "improve the cards." It's **"add a layer above the swipe that compounds for the user."**

**The synthesis:** the knowledge base *is* that investment layer. The highest-leverage retention mechanic for Kapyn is a **personal AI-literacy map** — a persistent, visual record of which concepts you've explored, how they connect, and what's adjacent-but-unreached — so every visit is "adding a node to the mental model I'm building," not "catching up on news." That's the Brilliant lesson (investment = a knowledge map, not a streak counter) applied to AI.

**Calm, not gamified — this is a brand constraint.** Borrow Brilliant's "name the thing you just learned" and engagement-matched cohorts; **reject** Duolingo's guilt-owl, streak-anxiety monetization, and demotion threats. Our habit comes from *satisfaction and compounding understanding*, not loss aversion.

---

## 5. Design principles (the rules every screen must obey)

1. **Grounded, never generated-feeling.** Every claim traces to a dated Kapyn source story. Show "Sources" and "Last updated." *Provenance is the moat* — it's exactly what ChatGPT and AI Overviews lack.
2. **Answer in 3 seconds, depth on demand.** Lede-first (Wikipedia), then progressive disclosure. Never a wall of text (SEP's failure); never a thin stub (Inshorts' failure).
3. **Calm is the product, not a skin.** Deceleration by design — generous leading, narrow measure, one accent, lots of air. Whitespace = luxury = trust. No dark patterns, ever.
4. **Connect, don't isolate.** News → concept → related concepts → tools. The graph is the asset. Every page is a real node with *contextual* links (prerequisite / application / related) — not "See also" dumps, not doorway pages.
5. **Make them feel themselves getting smarter.** Name the cognitive gain ("You can now explain…"). Show the growing map. Investment compounds (Brilliant), it doesn't shame (Duolingo).
6. **Mobile-native AND web-durable.** The reading page must be flawless at 430px *and* be an SEO-indexed durable artifact — the one thing AI chat structurally cannot be.
7. **Restraint over expressiveness.** One accent per context (the premium signal). Resist feature creep (Artifact's death). Fewer concepts done deeply > thousands done thinly (Investopedia's thin-content trap, and an SEO penalty risk).

---

## 6. The craft spec (implementation-ready)

The teardowns converge on a remarkably consistent recipe for premium dark-mode reading. Kapyn's existing palette is already correct on the most important axis (warm off-white text, not pure white). Concrete tokens for the `/learn` reading page:

```css
/* Typography — the 18 / 1.7 / 70ch triad does ~70% of the work */
--reading-font-size:    18px;          /* premium-editorial consensus (Stripe Press, Linear, Anthropic body ~1.75) */
--reading-line-height:  1.7;           /* dark backgrounds need extra leading to track lines */
--reading-measure:      70ch;          /* Bringhurst optimal; cap it even with dark space to spare */
--reading-text:         #E8E4DE;       /* ALREADY CORRECT — ~12.5:1, warm, AAA, clear of halation */
--reading-muted:        #A09A90;       /* warm mid-gray for secondary — warmer than current #737373 */

/* Headings — all-sans, DRAMATIC weight contrast (no serif/sans mixing for a tech product) */
h1 { font-weight: 800; letter-spacing: -0.03em; line-height: 1.1;  }
h2 { font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; margin: 48px 0 16px; }
h3 { font-weight: 600; letter-spacing: 0;       line-height: 1.2;  margin: 32px 0 12px; }
/* The jump from 400 body → 700/800 heading creates hierarchy, NOT a typeface switch.
   Negative tracking on big headings is essential — default tracking reads cheap at ≥32px. */

/* Vertical rhythm — 8pt grid; space ABOVE a heading = 2–3x space below (grouping signal) */
p { margin-bottom: 24px; }
/* major section breaks: 80px (10 × 8) */

/* Warmth & depth — depth via surface stepping, NOT shadows (shadows look fake on dark) */
--surface-card:  #111110;                       /* barely-warm vs flat #111111 */
--border:        rgba(255, 248, 235, 0.07);     /* warm-tinted; pure-white alpha reads cold */
/* layers: page #0d0c0b → card #111110 → hover #171614 → elevated #1f1e1b */

/* One accent only — the per-category color, on links / active state / the "In the news" rule */
```

**The single signature moment** (every crafted page needs exactly one): the **"You can now explain…" payoff** — a single warm-accent line near the top stating the cognitive gain, paired later with a small visual of where this concept sits in your growing map. It does double duty: it's the craft flourish *and* the seed of the literacy-map retention mechanic. (Borrowed from Brilliant's "name what you learned" + Every.to's confident, decorative-free editorial restraint.)

---

## 7. The `/learn/[slug]` blueprint (information architecture)

Synthesizing the best of every cluster — Investopedia's answer-first template, Wikipedia's standalone lede, Every.to's deceleration, Anthropic's quiet authority, and grounding for the trust AI chat lacks:

1. **Eyebrow** — concept type (TECHNIQUE / CONCEPT), small-caps, muted. *(Anthropic/Stripe nav-label treatment.)*
2. **Concept name (H1)** + **one-sentence plain-English deck** — the standalone definition. Answers "what is X" in 3 seconds. *(Wikipedia lede + Investopedia definition box.)*
3. **"You can now explain…"** — the signature payoff line (warm accent). *(Brilliant.)*
4. **Why it matters → How it works → Current developments** — progressive depth, each section substantive. *(Solves SEP's no-progressive-disclosure failure.)*
5. **In the news** — dated, linked source stories with source name. *The trust layer.* Temporal markers ("3 days ago") are the highest-ROI credibility signal AI answers omit.
6. **Related** — contextual concept chips (ideally typed: *prerequisite / application / related*), not a flat "See also." *(Fixes Wikipedia/SEP's context-free links.)*
7. **Footer provenance** — "Auto-generated from Kapyn's news stream · grounded in N sources · last updated [date]." Honest, and it's the anti-AI-slop signal.

**Never** render an empty shell or a thin stub — lean page from `short_desc` + stories, or `noindex` until substantive (the thin-content firewall).

---

## 8. What this means for what we build next

The brief now exists, so the visual craft is no longer guesswork — it's executing §6 and §7. Recommended sequence:

1. **Elevate `/learn/[slug]` + `/explore` to the §6/§7 spec** (the craft pass we were about to start blind — now grounded). This is the "prove the format is beautiful and trustworthy" ship.
2. **Then the literacy-map investment mechanic** (§4) — the retention layer that breaks the Inshorts/Artifact ceiling. Start by *collecting* which concepts a user has read (localStorage, no auth) so the data exists when we build the UI.
3. **Defer** any streak/gamification until the calm-progress version is proven. If it ever risks feeling like Duolingo's guilt loop, don't ship it.

---

## 9. Open questions for a designer / next pass

- Pressure-test §1 (JTBD) with the `jobs-to-be-done` skill and, ideally, 3–5 real discovery interviews (`discovery-interview-prep`).
- Decide the typeface: stay all-sans (recommended for a tech-trust product — Linear/Anthropic model) vs. a serif concept-title (Every.to/Stripe Press editorial model). The craft spec assumes all-sans.
- Validate the literacy-map concept with users before building it — it's the highest-leverage *and* highest-effort bet.
- When there's a real product to react to, get a contract product designer for one design-review pass to close the top-5% taste gap.
