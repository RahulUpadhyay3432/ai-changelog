# Kapyn Radar Redesign Direction

*Design lead's definitive brief. Decisive, concrete, buildable. Built at 430px, inline-style React + Framer Motion, on the warm near-black canvas. Color from content, not chrome.*

---

## 1. The north-star visual idea

> **Warm near-black canvas. One loud, image-led object per fold. Then a colorful, scannable field where every Thing wears its category color on its mark — and, on the ~30 brands we curate, its real logo. Big warm-white type punctuates; gold means "Kapyn"; motion stays quiet.**

The tension dissolves because **calm and colorful live on different axes.** Calm = restraint in *motion, copy, density, and chrome*. Colorful = saturation in *content* (logos, covers, category-tinted marks, one metric). Hype comes from glow-on-everything, bright colored borders, tinted shout-caps on every line, and many competing focal points. The fix is never "less color" — it's **move the color budget off the text labels and onto the marks and covers.** Color belongs on imagery, logos, marks, left-rails, and *exactly one* metric per object. It does not belong on a stacked column of tinted eyebrows.

Three rules make this enforceable, encoded once in `radar-shared.tsx` so they can't drift per-surface:

1. **One loud object per fold. One *bezel* per viewport. One horizontal scroll axis per screen.**
2. **Gold (`#E8B25C`) has exactly one meaning: Kapyn / wayfinding.** Never a data signal, never a content accent, never an active-control state.
3. **Colored eyebrows cap at one-per-card.** Section headers get a white title + muted-gray kicker. Color = taxonomy, carried by the mark.

---

## 2. The Radar visual system

### 2.1 Color strategy

Source of truth: the per-category triad already in `src/lib/categories.ts`. **Do not invent hues. Mirror, never re-declare** — `accentFor()` in `radar-shared.tsx` imports from `categories.ts`.

The load-bearing correction (verified against WCAG): the raw `colorAccent` base hues (`#7c3aed`…) land at 3.15–6.21 contrast on `#0a0a0a` — they **fail as text/icon color.** Every `colorLabel` (`fg`) clears AA (6.64–11.86). So:

| token | = existing field | used for |
|---|---|---|
| `fg` | `colorLabel` (`#c4b5fd`…) | **all on-dark text, icons, eyebrows, metric numbers** — the only foreground color |
| `bg` | `colorBg` (`#1a0533`…) | tile/pill/monogram fills, tints |
| `ring` | `colorAccent` (`#7c3aed`…) | **borders only** (`${ring}33`), **glow only** (`${ring}40` cap), 3px left-rails. Never text. |

| slug | bg | fg (text/icon) | ring (border/glow) |
|---|---|---|---|
| ai-models | `#1a0533` | `#c4b5fd` | `#7c3aed` |
| dev-tools | `#0d1f3c` | `#60a5fa` | `#2563eb` |
| open-source | `#2d1200` | `#fb923c` | `#ea580c` |
| startups | `#0a2015` | `#4ade80` | `#16a34a` |
| research | `#001f2e` | `#22d3ee` | `#0891b2` |
| funding-ma | `#2d1a00` | `#fbbf24` | `#d97706` |
| big-tech | `#0f0f2d` | `#818cf8` | `#4f46e5` |
| infrastructure | `#001f1d` | `#2dd4bf` | `#0f766e` |
| policy | `#1e0a2e` | `#d8b4fe` | `#9333ea` |

**Where color enters, in priority order:** (1) real brand logos in the mark, (2) real story imagery as covers, (3) category-tinted monograms + gradient fallbacks, (4) category accent on the mark's left-rail / one metric chip / detail hero band.

**Gold's single job (critique #3 baked in):** wordmark/"KAPYN" eyebrow, the "Caught up" closer, empty-state CTAs. **Removed from gold:** the Trending heat chip (→ category `fg`), active filter/lens pills (→ the *lens's own* hue), "TOP PICKS"/"Start here" kickers (→ muted gray, see §2.2), and the `essential` face fallback (→ `startups` green, never gold chrome).

**Saturation caps (the not-hyped guardrail):** glow stops ≤ `${ring}40` (~0.25α); borders `${ring}33` (~0.20α); all covers `filter: saturate(0.9)`; **no accent ever touches nav, search, dividers, or the phone frame.**

### 2.2 The exact mobile type scale

Anchored to two non-negotiables: a real **20px section title** tier (replacing the old 12px gray eyebrow), and body lifted off the 13–14px floor. Drop into `radar-shared.tsx` as a `TYPE` token object.

| role | size / weight / lh | tracking | font | color | notes |
|---|---|---|---|---|---|
| **section title** | 20 / 700 / 1.15 | −0.02em | Space Grotesk | `#f5f3ef` | **keystone tier.** The *only* colored-or-white punctuation. Deletes the old `#5c5c5c` sub. |
| **section eyebrow/kicker** | 12 / 700 / 1.0 | +0.06em, CAPS | SG | **`#8f8b83` (muted)** | critique #2 fix: muted by default on *section headers*. Gold only for brand sections. |
| **hero headline** | 24 / 600 / 1.12 | −0.02em | SG | `#f5f3ef` | the one place massive type is safe. Editorial line, not bare name. |
| **item title** (row/tile/card) | **16** / 600 / 1.25 | −0.01em | SG | `#f5f3ef` | 16 not 17 (mobile critique #4): let the FaceMark logo carry item prominence, not type inflation. |
| **card kind-eyebrow** | 12 / 700 / 1.0 | +0.06em, CAPS | SG | **category `fg`** | the *one* place a tinted eyebrow is allowed — inside a card, where "what kind" is the job. |
| **body / value line** | 15 / 450 / 1.45 | — | system | `#c2beb6` | 2-line clamp. 15 not 17: dense scan surface; 17 breaks 2-up tiles to 1–2 words/line. |
| **meta** (recency, source) | 13 / 500 / 1.3 | — | system | `#8f8b83` | retires `#5c5c5c`/`#525252` (failed AA). |
| **metric chip** | 12 / 600 | tabular-nums | mono-ish | category `fg` | the row's *one* tint that carries signal. |
| **subtype chip** | 12 / 600 | tabular-nums | mono | **`#8f8b83` (mono, untinted)** | critique #5 fix: a disambiguator, not a brand signal — never accent-tinted. |

**Warm text ramp** (replaces cold grays everywhere): primary `#f5f3ef` · body `#c2beb6` · muted `#8f8b83`.

The load-bearing ratio is **one jump: 20px title vs 15px body.** That single gap is the punctuation. Pulling item titles to 16px (not 17) preserves it — when every tier inflates, hierarchy flattens back into a text-wall at a larger point size.

### 2.3 Surface & depth

Page is not pure black. One elevation tier only:

```
Page canvas:    #0a0a0a   (+ warm grain overlay opacity 0.035)
Card surface:   #131210   (warm, raised — replaces cold flat #111111)
Hairline:       rgba(255,255,255,0.07)   (white-alpha only — NEVER colored)
Inner highlight:inset 0 1px 0 rgba(255,255,255,0.07)
```

**Body card recipe (light):** surface + hairline + inner highlight + one corner glow `radial-gradient(120% 90% at 85% -10%, ${ring}33 0%, transparent 55%)`. Depth from light, not heavy shadow. Concentric radii: outer tile 18px, inner mark 11–13px (`~0.28×size`), never `rounded-full`.

**Double-bezel (the heavy treatment) is Radar's signature — reserved for the hero deck ONLY** (critique #1 + #4 baked in). The standalone SpotlightCard gets the *light* recipe, not a second bezel. One bezel per viewport is the enforceable form of "one loud object."

### 2.4 Imagery

Image-where-it-earns, never faked, never 2-up-everywhere. The category-tinted monogram + deterministic gradient is the **default render path, branched on `null` *before* any `<img>` mounts** — not an `onError` afterthought (an empty/null `src` does not reliably fire React's `onError`). Logos and covers are the exception for most of this catalog.

- **Have a cover** (`latestStory.imageUrl`, entities only) → real image, `objectFit: cover`, bottom scrim `linear-gradient(to top, rgba(8,8,8,0.94) 22%, transparent 60%)`, `saturate(0.9)`.
- **Have a logo** (curated ~30 brands) → real brand mark.
- **Neither** (tools, papers, most things) → `radial-gradient(120% 90% at 70% -10%, ${ring}40 0%, ${bg} 45%, #0c0c0c 100%)` + faint centered category icon at `${fg}` opacity 0.5. **Never broken, never flat gray.**

### 2.5 Motion (quiet is the brand guardrail)

Keep `radar-motion.ts` `EASE = cubic-bezier(0.4,0,0.2,1)`, the `DUR` palette, `useReducedMotion`, and `lensIndicatorSpring` (stiffness 320 / damping 34) **unchanged.** Three layers:

1. **State feedback (biggest current gap — there is none):** `whileTap={{ scale: 0.97 }}` @130ms on every row/tile/card/pill; cards shrink corner-glow on press; desktop-only `whileHover={{ y: -2 }}`. Add `press: 0.13` token.
2. **Entry:** wire existing variants to `whileInView` — fade-up `y:12→0`, 30–50ms stagger, <500ms total, transform/opacity only.
3. **Ambient (Radar-only signature, critique #4):** one `position:absolute` mesh glow tinted to the active lens hue (`radial-gradient(80% 50% at 50% -5%, ${lensHue}24 0%, transparent 60%)`, ≤0.14α), crossfade ~320ms on lens switch.

**Defer:** hero parallax, breathing-glow loop. **Enhancement-only, gated behind `!useReducedMotion()`:** shared-element `layoutId` tile→detail; metric count-up (once-per-view, 600ms ease-out) — *only* on Things that carry a raw numeric (see §3 — most `metric` strings can't be parsed back to a number).

---

## 3. The expanded content model

### 3.1 The unified type

Extend the live `RadarThing` (today: `kind: "tool" | "entity"`). The 7 `Face` values stay as the **icon-fallback layer only**; `kind` becomes the semantic discriminator.

```ts
kind: "tool" | "model" | "agent" | "mcp" | "paper" | "okf" | "entity"
// + new fields:
imageUrl: string | null      // PLUMB from latestStory — currently dropped in entThing
logoUrl: string | null       // curated subset only; null is the common case
entityId: string | null      // raw UUID — stop string-baking into id
categorySlug: CategorySlug | null
metricValue: number | null   // raw number for count-up (metric stays a display string)
subtype: string | null       // "70B · open weights" / "stdio" / "arXiv"
badges: ("official"|"new"|"open-source"|"trending")[]
```

**Cut from the original 8 kinds (mobile critique #1):** `skill` and `okf` are **not** top-level kinds. Skill = `kind:"tool", subtype:"skill"` (low individual signal, no source, can never be loud — fails the kind test on its own merits). OKF = a Browse-only `subtype` (thin, evergreen, never hero-eligible).

**Kind → category accent** (color = taxonomy, never mood):

| kind | category accent |
|---|---|
| model, agent | ai-models (violet) |
| tool | dev-tools (blue) |
| mcp | infrastructure (teal) |
| paper | research (cyan) |
| okf (subtype) | big-tech (indigo) |
| entity(company) | big-tech · entity(concept) | research |
| OSS canon | open-source (orange) regardless of kind |

### 3.2 Sourcing — have-it vs needs-integration

| kind | status | source |
|---|---|---|
| **model / tool / company / concept** | ✅ HAVE | knowledge-graph entities (`getRadarCards`) |
| **trending tool** | ✅ HAVE | GitHub trending + Product Hunt (`radar_tools`) |
| **curated essential** | ✅ HAVE | `radar-essentials.ts` (23 items, exact buckets: AI coding 6, Models & chat 4, Inference 5, Data/RAG 2, Agents 2, Eval 2, Media 1) |
| **OSS canon** | ✅ HAVE | `fetchTopAIRepos` |
| **`imageUrl`** | ✅ HAVE, dropped | on `e.latestStory.imageUrl`; `entThing` discards it. ~3-line plumb. Entities only — tools have no image field, ever. |
| **agent** | 🟡 PARTIAL | GitHub `topic:ai-agent` already queried; needs kind-tagging + curated list for closed agents (Devin) |
| **logos (~30 curated)** | 🟡 BUILD-TIME | `mcp__magic__logo_search` is a **codegen tool, not a runtime API** — generate TSX for the 23 essentials + canon by hand, commit to `/public`. |
| **logos (open-ended)** | 🟡 DEGRADE | favicon — but see hard constraint below. Default to monogram. |
| **mcp servers** | 🔴 NEW | seed as a curated list first (like essentials); MCP registry later |
| **research papers** | 🔴 NEW | arXiv ATOM feed (cs.AI/CL/LG) → `lib/arxiv.ts` |
| **`why it matters`** | 🟡 CONTRACT MISMATCH | `/api/breakdown` is single-shot (not streaming), news-framed, requires `{title, summary}`, rate-limited 30/IP/60s |

**Hard sourcing constraints baked in (feasibility critique):**
- **`logoUrl` is the exception, not the rule.** Downgrade every "logo-led" claim to "category-tint-led; logo as a bonus on ~30 known brands." The MCP "every server borrows a famous logo" color thesis only holds once those are curated by hand.
- **Never favicon off an entity's `url`** — that host is the *article publisher* (techcrunch.com), not the entity. You'd render TechCrunch's icon next to "GPT-5." Entities get monograms; favicons only for the curated tool set, routed through a **same-origin `/api/favicon` proxy** (controls sizing/cache; stops beaconing every saved hostname to Google — DPDP).
- **`metric` is a pre-formatted string** (`"1.2k stars · Python"`) — not parseable back to a number. Carry `metricValue` separately if you want count-up; otherwise render the string and skip the animation.
- **`/api/breakdown`:** drop "streams" — it's a single `await` + skeleton. For "Why it matters" pass `{title: thing.name, summary: thing.valueLine}`; **gate so null-`valueLine` things don't POST empty → 400.** Prefer the published Explainer (`getPublishedExplainer(entityId)`) when present.

### 3.3 Visual representation of each kind

One **polymorphic `ThingCard`** branches on `kind` + `density` (spotlight / tile / row). Rules:

| kind | mark | eyebrow | name | metric | hero-eligible? |
|---|---|---|---|---|---|
| model | maker logo / violet monogram | NEW MODEL (violet) | 1-line | params or context (not stars) | ✅ |
| tool | logo / blue monogram | NEW TOOL (blue) | 1-line | stars / upvotes | ✅ |
| agent | framework logo / violet | AGENT (violet) | 1-line | GitHub stars | ✅ |
| mcp | **served-app logo** + "MCP SERVER" eyebrow (makes provenance explicit) / teal | MCP SERVER (teal) | 1-line | stars / verified | row/rail only |
| paper | cyan document monogram | RESEARCH (cyan) | **2-line clamp** | none / cited-by | row only |
| okf (subtype) | source logo / indigo | OPEN KNOWLEDGE (indigo) | 1-line | item count | Browse only |
| entity | logo / category monogram | category fg | 1-line | mention count | ✅ |

**One accent family per rail (critique #5):** a rail is monochromatic. "From the papers" is all-cyan. Do **not** ship a mixed "Agents & MCP" rail with alternating violet/teal eyebrows — split into an all-violet Agents rail and an all-teal MCP rail, *or* if mixed, the eyebrows go muted-gray and only the FaceMark logo carries per-item color.

---

## 4. Per-surface specs (top-to-bottom at 430px)

> Shared prerequisite for all five: the **§5 foundation PR** (FaceMark rewrite, `accentFor`, CoverImage fallback, `imageUrl` plumb) must merge first. No surface re-implements the gray-killer.

### 4.1 Trending (`/trending`)

| # | top → bottom |
|---|---|
| 1 | **Header** — TrendingUp + "Trending" (24px) + 13px muted sub. Chrome. |
| 2 | **"TOP 3 TODAY"** eyebrow — Flame + gold caps (gold = curation, allowed). |
| 3 | **Top-3 stack** — #1 **SpotlightCard** (light recipe, 170px cover band, overlaid category pill + heat chip), #2/#3 compact horizontal cards (84px thumb + rank badge). #1 ≈ 2× the weight of #2/#3. |
| 4 | **"More trending today"** — 20px title (promoted from old 11px gray) + muted dek. **"See all" is load-bearing, not optional.** |
| 5 | **2-up image tile grid** — `1fr 1fr`, gap 12px, **capped at 8 tiles** (4 rows). Beyond that, covers become wallpaper; the tail lives behind "See all". |
| 6 | Tail padding 24px. Empty state unchanged. |

**Key components:** SpotlightCard, CompactHighlightCard, CategoryPill, HeatChip, TrendingTile/Grid, CoverImage, existing BreakdownSheet.

**Baked-in fixes:**
- **HeatChip is category-`fg`, not gold** (critique #3). A violet "6 sources" on a model story reads "this model story is hot" — gold trained the user that gold=trending, contradicting gold=brand.
- **Deterministic "why it leads" line is mandatory day one, not deferred** (mobile critique #3). When `sources < 2` (thin graph collapses to recency), the spotlight shows "Freshest in {category}" instead of a hole. Don't ship "Trending" that silently degrades to "Recent" with no honesty marker.
- **Inline "Why it matters" link only on #1.** Compact/grid = whole-tile-tap opens the sheet. One target per object (mobile critique #2).
- **Trending is purely vertical** — no carousels, no double-bezel, no ambient glow. Those are Radar-only (critique #4).

### 4.2 Radar Today feed (`/radar`)

| # | top → bottom |
|---|---|
| 1 | **Header strip** — gold "KAPYN" + 26px "Radar" wordmark + muted one-liner; 38px monochrome Bell → /profile. |
| 2 | **Lens pill row** — Builder / Founder / Exploring, horizontal scroll, bleeds off-right. Active = filled in **its own lens hue** (Builder blue / Founder amber / Exploring cyan), `layoutId="lensPill"` spring. |
| 3 | **Hero deck** — the one loud zone. Scroll-snap, 84% card width, next card peeks ~16%. **Double-bezel (Radar's signature), 210px.** Cover or gradient fallback. Overlaid: card kind-eyebrow → 24px headline → 15px clamp → footer (metric + recency + ArrowUpRight). **Always ends on the gold "You're caught up" closer.** Pagination dots (active = gold). |
| 4 | **Named editorial rails** — the spine. **Section set + order LOCKED across lenses** (mobile critique #1). Header: white 20px title + **muted-gray kicker** + quiet "See all" → Browse. Rails are **vertical** (2-up grids or colored row lists). |
| 5 | Footer 28px to clear bottom nav. |

**Hard cuts baked in:**
- **No standalone SpotlightCard** — redundant with the hero deck, which already leads with the highest-signal Thing. Two image heroes back-to-back is a stutter (critiques #1 + mobile #3). SpotlightCard survives on Browse/Detail where nothing competes.
- **One horizontal axis only** — the hero deck. Convert "image-tile rails" to vertical 2-up grids or route to Browse via "See all." Nested horizontal-in-vertical scroll is the #1 way a thumb fights mobile UI (mobile critique #2).
- **Lens re-ranks within rails + swaps which hero leads — it does NOT reorder sections** (mobile critique #1). Three IAs in one screen = unstable scroll-map + 3× QA. Same spine, different fill.
- **Section kickers muted gray, not tinted** (critique #2). Color lives on the mark, not a confetti strip down the left margin.

### 4.3 Detail page

**Delivery: full-height `position:absolute` overlay in `#phone-overlay-root` (option B), not a route** — until `(app)/layout.tsx` is verified to frame-constrain arbitrary routes. `#phone-overlay-root` has `overflow:hidden, borderRadius:inherit`; the existing sheet already does exactly this. Add the shareable `/radar/[id]` route later.

| # | top → bottom |
|---|---|
| 1 | **Floating back bar** — sticky, transparent over hero; gains `blur(14px)` + hairline once scrollY>140. 36px back left, 36px share right. Monochrome chrome. |
| 2 | **Hero band 220px** — real `imageUrl` or category radial fallback + bottom scrim. No baked text. |
| 3 | **Identity row** — 64px logo mark overlapping hero −28px on a 4px `#0a0a0a` ring (the *one* place double-bezel is earned outside the deck). Name 24px + meta pill row (filled category pill + ghost type pill + recency). |
| 4 | **Key-facts strip** — 2–4 cells, each eyebrow + one big number in `${fg}`. **Count-up only if `metricValue` exists** (strings like "1.2k stars · Python" don't parse). Single wide cell if one datum. |
| 5 | **What it is** — 20px title + 15px body. **Hide section if `valueLine` is empty** (held-back entities). |
| 6 | **Why it matters** — published Explainer (`getPublishedExplainer(entityId)`) if present; else "Explain with Kapyn" → single `await` POST `{title:name, summary:valueLine}` + skeleton. **Gated so null valueLine never POSTs.** Filter output (`isBadSummary`) before render. Cache in state. |
| 7 | **Latest story** — one image-led card → source_url. Omit if no storyTitle. |
| 8 | **Related on the Radar** — horizontal rail, client-derived by shared category/face, dedupe self, cap 8, **hide under 2.** |
| 9 | 96px spacer + **sticky action bar** — Save (category-accent fill `${ring}`, the one saturated control) + Copy + Open-site. |

**Baked-in:** add `entityId` as a real field (stop `thing.id.replace('entity:','')`). `essential` Save button → green/filed category, never gold.

### 4.4 Browse (`/radar/browse`)

The strongest decision of the set — **lead with category bento, not search** (you can't search for what you don't know exists).

| # | top → bottom |
|---|---|
| 1 | **Header** — gold "KAPYN" + "Browse" (26px) + count sub. |
| 2 | **Demoted search pill** — 44px ghost pill (not an input); tap morphs to inline live-filter field. Active query → flat results rows. |
| 3 | **Category bento** — `1fr 1fr`, descending by **live count** (group `RadarThing[]` → length — **never hardcoded;** `categories.ts` already ships fake `storyCount:47`). Tile: mark + muted kicker + 16px name + big `${fg}` count + corner glow. |
| 4 | **Top picks rail** — horizontal image-led tiles (~190px). The "few things very prominent" moment. |
| 5 | **By recency** — Today/This week/All-time (phase-2 stub). |
| 6 | **Filtered view** (in-place, replaces 3–5) — **36px circular back button** (not text "‹ All categories"), big category header, tiles for discovery / dense rows for reference. **Search pill stays visible** so search-within is one tap. |

**Baked-in:**
- **Thin buckets: MERGE, don't hide** (mobile critique). Data/RAG + Eval + Agents → "Build & ops"; Media folds in. Hiding count<3 makes them unreachable except by search — re-creating the exact problem this surface kills.
- **Kind filter pills active state = the kind's accent, not gold** (critique #3). Bento count from live data only; a kind tile renders only if `count > 0`.

### 4.5 Toolkit (`/radar/toolkit`) + share UX

100% client-side (localStorage `kapyn_radar_saved_tools`); sharing 100% client-side, **no backend, no PII.**

| # | top → bottom |
|---|---|
| 1 | **Header** — gold "KAPYN" + "Toolkit" (26px) + depth sub ("{n} saved across {g} categories"). |
| 2 | **Summary rail** — per-category count pills (`${bg}` fill, `${fg}` label, `${ring}33` border). Proof-of-depth. |
| 3 | **Quiet filter pill** + right-aligned gold-ghost "Share all". |
| 4 | **Category sections** — collapsible. Header: chevron + **`cat.fg` eyebrow** (color = taxonomy, the one card-level tint that's fine) + count + 28px Share button (scopes to category). |
| 5 | **2-up tile grid** (`1fr 1fr`). 1-item category → **same ToolkitTile at `gridColumn: 1/-1`** (no separate SpotlightTile component). Each tile: 44px mark + 16px name + 2-line value + per-tile Share2 icon (stops propagation). |
| 6 | **Empty state** — Bookmark glyph + "Build your toolkit" + filing explainer + gold CTA → /radar + 3 ghosted teaser pills at 25%. |

**Share UX — CONFIRMED FEASIBLE, all pure client APIs:**
- **Text (single):** `${name} — ${valueLine}${url?' '+url:''}\n\nvia Kapyn Radar — kapyn.vercel.app`
- **Text (category):** header line + `items.map(• name — valueLine url)`, **capped at ~25 items** ("…and N more on Kapyn") to stay under `wa.me`/`mailto` URL-length limits.
- **WhatsApp:** `window.open(\`https://wa.me/?text=${encodeURIComponent(text)}\`)` — prefilled, user picks recipient, no phone number. Works web + mobile.
- **Email:** `location.href = \`mailto:?subject=...&body=${encodeURIComponent(text)}\``.
- **System:** `if (navigator.share) navigator.share({...})` — feature-detect; else collapse into Copy. (Absent on most desktop; HTTPS/mobile only.)

**Share sheet (portaled, `position:absolute`):** context header + channel buttons (WhatsApp green `#25D366` **ghost-tint, not solid** — the one allowed non-palette color, a recognized channel brand; Email gold-ghost; System neutral) + Copy fallback.

**Baked-in cuts (mobile critique):**
- **No scrollable literal-text preview pane** — that's desktop-email thinking; it pushes the actual channel buttons below the fold on a 58dvh sheet. Single item → one-line preview; category → a summary chip ("Models — my Kapyn toolkit (7) +6 more"). The full text still goes to the channel.
- **No SpotlightTile component** — `gridColumn:1/-1` on the existing tile.
- **Toast: `position:absolute`, not `fixed`** (copy the existing detail-sheet pattern). PostHog props = scope/channel/count only, **never full item lists** (DPDP).

---

## 5. 21st.dev / Magic component shortlist

**Global preamble (prepend to every prompt):** *Inline-style React (no Tailwind in JSX, no shadcn) + Framer Motion. Canvas #0a0a0a, surface #131210, hairlines rgba(255,255,255,0.07). Color only via content; `fg` (#c4b5fd) is the only on-dark text color, `ring` (#7c3aed) is borders `${ring}33` + glow `${ring}40` only. Gold #E8B25C = brand only. Covers saturate(0.9). whileTap 0.97 @130ms. position:absolute, portal to #phone-overlay-root. Mobile-first 430px.*

**Generate (in build order):**

| # | component | one-line prompt seed |
|---|---|---|
| 1 | **FaceMark** (keystone) | "Tiny badge `FaceMark({face,category,logoUrl,size=40})`: logo img if present (objectFit cover, onError→fallback), else Lucide category icon in `${fg}` on `${bg}`, 1px `${ring}33` border, inset top-highlight, radius round(size*0.28) — never rounded-full, never gray." |
| 2 | **CoverImage** | "Image-with-fallback: pre-branch on falsy/null src (not onError) to a category radial gradient + faint centered Lucide icon at `${fg}` 0.5 opacity; lazy, saturate(0.9). Never broken, never flat." |
| 3 | **ThingCard** (polymorphic — subsumes most cards) | "One card branching on `kind` for which fields render: 48px FaceMark, card kind-eyebrow in `${fg}`, 16px name (2-line clamp for papers), 15px value, mono untinted SubtypeChip, one right-aligned MetricChip in `${fg}`; supports spotlight/tile/row densities." |
| 4 | **HeroDeck** | "Scroll-snap deck, 84% cards, next peeks 16%, double-bezel 210px image well + gradient fallback + scrim, overlaid eyebrow→24px headline→15px clamp→footer; ends on a gold 'caught up' closer; gold pagination dots." |
| 5 | **LensPillRow / KindFilterPills** | "Horizontal segmented pills bleeding off-right; active filled in **its own hue** (lens: blue/amber/cyan) with shared `layoutId` spring; inactive ghost #a3a3a3." |
| 6 | **CategoryBento** | "2-col bento (1fr 1fr) sorted by count desc: tile = surface + corner glow `${ring}33` + 40px mark + muted kicker + 16px name + big 20px tabular count in `${fg}`; count-up once-per-view." |
| 7 | **RadarDetailPage scaffold** | "Full-bleed mobile detail (position:absolute inset:0): scroll-aware back bar solidifying past 140px, 220px hero band, 64px mark overlapping −28px on a 4px ring, 24px name, meta pill row; slide-in x:100%." |
| 8 | **StickyActionBar** | "Pinned-bottom bar (absolute, blur, safe-area): flex:1 Save filled `${ring}` (ghost+Check when saved) + 50px Copy + 50px Open-site; whileTap 0.97, vibrate(10)." |
| 9 | **ShareSheet** | "Portaled bottom sheet (absolute, 58dvh, drag-dismiss >80px): context header, **one-line/summary-chip preview (no scroll pane)**, 3 channel buttons — WhatsApp green ghost-tint, Email gold-ghost, System neutral — + Copy fallback." |
| 10 | **EmptyToolkit** | "Centered empty state: 56px gold-soft Bookmark square, 'Build your toolkit', explainer, gold CTA → /radar, 3 ghosted teaser pills at 25%." |

**Refine via `21st_magic_component_refiner` rather than commissioning separate cards** — ThingCard with `kind` + `density` props subsumes Trending's Spotlight/Tile, Radar's RailCard/Row, Browse's PickTile/CatalogTile, and Toolkit's tile. **Use `logo_search` once, at curation time**, to generate the ~30 essential/canon logos as committed TSX — *not* at ingest (it's a codegen tool, not an API).

---

## 6. Phased build plan (ordered by leverage)

### Phase 0 — Foundation PR (merge gate; everything depends on it)
*Have-it, highest impact, recolors four surfaces in one edit.*
1. `accentFor()` + `ACCENT` map + `TYPE` tokens + warm text ramp + `#131210` surface in `radar-shared.tsx`. **Encode the gold-reservation and muted-eyebrow-default here so they can't drift per-surface.**
2. **Rewrite `FaceMark`** → logo-else-tinted-monogram, never gray. (~12 lines; the keystone.)
3. **CoverImage** with `null`-first gradient branch.
4. **Plumb `imageUrl` + `entityId` + `metricValue`** onto `RadarThing` in `entThing` (others pass `null` honestly).
5. Accent-ize `MetricChip`; default eyebrows to muted gray.

### Phase 1 — Quick wins (have-it, ship on the foundation)
- **Trending redesign** (spotlight + 8-cap tile grid, category-fg heat chip, mandatory deterministic "why it leads").
- **Toolkit redesign** + WhatsApp/Email/System share sheet (zero backend).
- **Radar Today**: locked-spine rails, hero deck (already exists — upgrade to image-led + bezel), muted kickers, press feedback, ambient lens glow.
- **Detail as full-height overlay** (port Save/Copy/Open verbatim; Explainer-or-breakdown with the gating fix).
- **Browse bento-over-search** with live counts + merged thin buckets.
- **~30 curated logos** via `logo_search` → committed TSX.

### Phase 2 — Big bets (needs-data / LLM / integration; gate each on real data)
- **`/api/favicon` proxy** for the curated tool set (same-origin, cached, DPDP-safe).
- **Tool-framed branch on `/api/breakdown`** (optional; current `{title,summary}` reuse works first).
- **arXiv integration** → `paper` kind (`lib/arxiv.ts`); reuse existing `valueLinePrompt`, gated by the `parseValueLine` held-back rule (papers ship no line rather than mush).
- **MCP servers** (curated seed list first, registry later) → `mcp` kind.
- **Agent kind-tagging** pass + curated closed-agent list.
- DB: `kind`, `subtype`, `badges`, `logo_url` on `radar_tools` — **normalize at map-time in `radar-map.ts`, don't force one physical table** (entities flow through a different table).

### Later
- Shareable `/radar/[id]` route + OG images (once `(app)` layout frame-constraint is verified).
- Shared-element `layoutId` tile→detail (enhancement, reduced-motion gated).
- OKF as a Browse subtype; skills as `tool` subtype.
- "By recency" Browse axis.

**Quick wins vs big bets, one line:** the quick wins are *reshaping data you already have* (the gray-killer recolors everything for the price of one PR); the big bets are *five separate integrations* — sequence them, ship the grammar before the sources, and let empty kinds not render (the `Section`-returns-null pattern already holds).

---

## 7. Open decisions for the founder

1. **Logo strategy — confirm the downgrade.** Logos are a bonus on ~30 hand-curated brands; everything else is a category-tinted monogram by design. (The alternative — favicons everywhere — renders wrong-provenance icons and beacons users' saved hostnames to Google.) **Ship monogram-first, curate ~30 logos?** [recommended: yes]

2. **Detail delivery.** Full-height overlay now (zero layout risk, ships this phase) vs. a real `/radar/[id]` route (shareable URL, needs layout verification). **Overlay first, route later?** [recommended: overlay first]

3. **Thin Browse buckets.** Merge (Data/RAG + Eval + Agents → "Build & ops", Media folded) vs. show "Media 1" tiles. Merge keeps the bento's depth-proof honest and keeps them reachable. **Merge?** [recommended: merge]

4. **New content kinds — scope & order.** Papers (arXiv) and MCP servers are the two highest-value new kinds but each is a real integration. **Greenlight arXiv + MCP for Phase 2, defer agents/skills/okf?** Or hold all new kinds until Today/Browse/Detail land?

5. **"Why it matters" cost.** On-demand `/api/breakdown` per tool-open adds latency + shares a rate-limited bucket with the feed. **Acceptable to reuse the news-framed prompt (mildly off for pure tools), or invest in a tool-framed branch + per-entity cache?**

6. **Trending vs Radar divergence.** I'm making the double-bezel + ambient lens glow **Radar-only** so the two top-level spaces are distinguishable in 200ms without reading the nav. **Confirm Trending stays flat/vertical** (no deck, no bezel, no ambient) — or do you want them to feel like one continuous surface?