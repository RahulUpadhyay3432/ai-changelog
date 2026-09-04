# Blog hero image prompts

**Status: 59 posts, 28 distinct images. 41 of those posts share just 11 images.**
This file has a subject line for every post, so the set can become one image per post.

## Read this first — the one thing that decides if it works

59 images generated from 59 unrelated prompts will look like 59 different blogs.
The fix is that **every prompt starts with the identical STYLE BLOCK below** and
varies only the SUBJECT line. That constant is what turns separate generations
into a visual system.

Variety then comes from **geometry, not styling**. Each cluster below has its own
motif family (comparisons are bilateral, explainers show one mechanism, opinions
break a pattern), so the set reads as coherent without any two images being the
same picture.

Two hard constraints from the actual page CSS:

- **No text, letters, numbers or logos in the image.** `blog.module.css` overlays
  the post title, tag and deck on top of the hero. Any text in the image collides.
- **Keep the bottom-left third calm and dark.** That is exactly where the title
  sits, under a gradient scrim. Detail belongs top-right.

Hero is `min-height: 380px` (280 on mobile) at full content width, `object-fit:
cover`. Generate **1600x900**; the centre is what survives the crop.

---

## STYLE BLOCK — paste this before every subject

```
A wide 16:9 abstract graphic for a technical article hero image.

Style: flat vector geometry on a very dark warm-black background (#0c0b0a).
Thin precise line work, 1-2px strokes, in muted grey-white. A single accent
colour, blue #3b82f6, used sparingly on no more than 15% of the image.
Calm, editorial, restrained. Think technical schematic or instrument panel,
not illustration.

Composition: visual detail concentrated in the upper-right. The lower-left
third must stay near-empty and dark. Generous negative space throughout.

Absolutely no text, letters, numbers, logos, watermarks or UI chrome.
No glow, no lens flare, no bokeh, no 3D render, no gradients-as-decoration,
no photorealism, no people, no stock-photo look, no neon cyberpunk.

Subject:
```

Then append one SUBJECT line.

---

## BATCH 1 — the calibration set. Generate these eight first.

Chosen to stress the style block from every direction: a hub, a bilateral, a
timeline, a broken pattern, a container, a chart, a layered stack and a lattice.
If these eight sit together as one system, the rest will too.

| Post | Subject line |
|---|---|
| `best-mcp-servers-2026` | A central hub with exactly six connectors radiating outward, most of the surrounding space intentionally empty. |
| `claude-vs-gpt-which-to-use` | Two mirrored line-structures facing each other with a narrow gap down the centre. |
| `ai-tooling-september-2026` | Two parallel horizontal rails carrying small markers that cluster tightly toward one end. |
| `ai-tool-graveyard-2026` | A row of upright rectangular forms where several have fallen flat to horizontal. |
| `agent-plugins-1-0-explained` | A single open container outline holding three differently shaped modules that each fit it exactly. |
| `control-ai-credit-burn-2026` | A steeply rising curve crossing a faint horizontal reference line and continuing well past it. |
| `best-ai-skills-2026` | Layered translucent planes stacked at slight offsets, implying capability added on top of a base. |
| `run-llms-locally-2026` | A single enclosed box holding a dense internal lattice, with nothing crossing its boundary. |

**Stop here and compare them side by side before generating anything else.**
Regenerating 8 is cheap. Regenerating 59 is not. If they do not read as one
system, tighten the style block, not the subjects.

---

## BATCH 2 — the worst repeats. 11 images currently cover 41 posts.

### Comparisons, motif: bilateral and mirrored
| Post | Subject line |
|---|---|
| `claude-vs-gemini-which-to-use-2026` | Two interlocking bracket forms of unequal weight meeting off-centre, one denser than the other. |
| `best-ai-chatbots-2026` | Four vertical columns of stacked horizontal ticks at visibly different densities, side by side. |
| `gpt-6-astra-what-changed` | A stepped ascending form where one riser is drawn markedly taller than all the others. |

### Explainers, motif: one mechanism, drawn like a schematic
| Post | Subject line |
|---|---|
| `what-is-mcp-model-context-protocol` | A single connector shape linking two dissimilar geometric forms, drawn like a schematic. |
| `what-is-agentic-ai-2026` | A closed loop of directional arrows passing through three small square gates, like a control diagram. |

### Protocol cluster, motif: hubs, spokes and patch panels
| Post | Subject line |
|---|---|
| `best-mcp-servers-for-claude-2026` | A hub and spoke arrangement where three of eight spokes are solid and the rest are dashed. |
| `mcp-2026-07-28-spec-what-changed` | A patch panel grid of small ports, several of them crossed through with a single fine diagonal. |

### Roundups, motif: timeline rails
| Post | Subject line |
|---|---|
| `ai-tooling-august-2026` | A horizontal timeline rail with irregularly spaced markers, a few emphasised in blue. |

### Tool guides, motif: collections, arrays and shelves
| Post | Subject line |
|---|---|
| `ai-stack-for-indie-hackers-2026` | A narrow vertical stack of five plates, each a slightly different width, precisely aligned. |
| `tools-every-vibe-coder-should-know` | A scattered set of small primitives, circle, square and triangle, resting on an implied baseline. |
| `best-ai-tech-stack-for-any-product-2026` | A layered cross-section of four horizontal bands with thin connector lines threading vertically between them. |
| `best-ai-coding-assistants-2026` | Nested bracket pairs of decreasing size, like collapsing code blocks reduced to pure outline. |
| `best-ai-tools-for-designers-2026` | Overlapping translucent rectangles at slight rotations, like artboards stacked on a canvas. |
| `best-ai-tools-for-startups-2026` | An ascending sequence of bars with wide gaps between them, the final bar left incomplete. |
| `best-ai-writing-tools-2026` | Long horizontal rules of varying length stacked with generous leading, like abstracted paragraphs. |
| `best-ai-tools-for-productivity-2026` | A grid of small squares with a single diagonal path of blue ones cutting across it. |
| `best-free-ai-tools-2026` | Concentric rectangles where only the innermost is filled blue and every outer one is open. |
| `best-ai-video-generators-2026` | A strip of equal rectangles in a row with fine sprocket-like marks along one edge. |
| `best-ai-image-generators-2026` | A square divided into a fine grid, one quadrant resolving into noticeably larger cells. |
| `best-ai-tools-for-seo-2026` | A single rising polyline over a faint measurement grid, no axes drawn. |
| `best-ai-tools-for-data-analysis-2026` | A scatter of small dots with one fitted straight line passing cleanly through them. |
| `best-ai-tools-for-email-2026` | A tightly overlapped stack of flat envelope outlines, reduced to triangles over rectangles. |
| `best-ai-tools-for-research-2026` | Thin lines radiating from an off-centre point, each terminating in a small open circle. |
| `best-ai-tools-for-project-management-2026` | Horizontal bars arranged at staggered start points, like a Gantt chart stripped of labels. |
| `best-ai-tools-for-content-creators-2026` | A waveform reduced to vertical ticks of varying height along a single baseline. |
| `best-ai-tools-for-customer-support-2026` | Two offset speech-bubble outlines reduced to plain geometry, one nested inside the other. |
| `best-ai-tools-2026` | A loose constellation of small geometric marks of different shapes, unevenly spaced. |

### Process guides, motif: a rule and its exception
| Post | Subject line |
|---|---|
| `vibe-coding-explained-2026` | A loose wandering curve that resolves into a precise straight line as it moves to the right. |
| `vibe-coding-design-checklist` | A layout grid with blue alignment guides, several elements deliberately snapped to them and one not. |
| `vibe-coding-security-checklist-2026` | A closed perimeter outline with exactly one segment drawn as a dashed gap. |
| `ai-for-legal-2026` | Strictly nested rectangles in formal alignment, with one inner rectangle drawn dashed. |
| `ai-for-healthcare-2026` | A steady repeating waveform interrupted once by a completely flat segment. |

### Opinion, motif: a broken or asymmetric pattern
| Post | Subject line |
|---|---|
| `why-ai-tool-directories-are-useless` | A dense uniform field of identical marks with one single mark isolated in clear space. |
| `is-your-ai-wrapper-defensible-2026` | A thin outline shell drawn around a conspicuously empty interior. |
| `distribution-specificity-problem-2026` | A wide dispersed spray of lines beside a single tightly focused convergent bundle. |
| `is-it-too-late-to-learn-ai-2026` | A long ascending line with an entry point marked low and early, leaving obvious runway ahead. |

---

## BATCH 3 — posts that already have a unique image

Lower priority. These are not repeats, they are just photos rather than system
pieces. Do them once Batch 1 and 2 are in and the system is proven.

| Post | Subject line |
|---|---|
| `best-ai-agents-2026` | A branching tree of thin lines where every branch terminates in a small filled square. |
| `best-ai-tools-for-developers-2026` | An exploded axonometric of simple blocks separated by thin alignment lines. |
| `best-ai-tools-for-marketing-2026` | A funnel drawn as two converging straight lines with tick marks along the inside. |
| `best-ai-tools-for-social-media-2026` | Small identical rounded rectangles tiled with irregular gaps, a few outlined in blue. |
| `best-ai-tools-for-education-2026` | A stepped pyramid of thin horizontal lines increasing in width toward the base. |

---

## BATCH 4 — the India series. Read the caveat first.

**These ten already have distinct, hand-picked Creative Commons photographs with
inline attribution, added in PR #53.** They are currently the most visually
distinctive set on the blog. Converting them to abstracts makes the site more
consistent and drops the `credit` obligation, but it also trades away real
photography of real places for schematics.

Recommendation: do this batch last, and only if Batches 1 to 3 have convinced you
the generated system looks better than what is already there.

| Post | Subject line |
|---|---|
| `india-ai-startup-ecosystem-2026` | Concentric rings with small nodes clustered densely at just three points, suggesting capital pooling in a few places. |
| `indiaai-mission-explained-2026` | A grid of small uniform squares, a minority outlined in blue, implying allocated versus unallocated capacity. |
| `sovereign-ai-india-2026` | Two overlapping circular boundaries, one solid and one dashed, with a fine lattice inside the overlap. |
| `best-ai-tools-for-indian-startups-2026` | A sparse toolkit layout: simple geometric shapes on an implied shelf with wide gaps between them. |
| `ai-startups-in-bengaluru-2026` | A dense radial network, many thin lines converging on one bright central node. |
| `ai-startups-in-delhi-ncr-2026` | Formal nested rectangles in strict alignment, like an administrative plan drawing. |
| `ai-startups-in-mumbai-2026` | Vertical parallel lines of varying height, like a dense column chart or a skyline abstraction. |
| `ai-startups-in-hyderabad-2026` | Two node clusters of unequal size joined by a widening band of lines, suggesting flow from one to the other. |
| `ai-startups-in-pune-2026` | Interlocking gear-like circles rendered as pure outline, mechanical and precise. |
| `ai-startups-in-chennai-2026` | A repeating modular tile pattern fading out toward the lower left, orderly and self-similar. |

---

## Workflow

1. Generate at **1600x900**. If the tool cannot do 16:9 directly, generate square
   and crop to the centre band; the style block already keeps detail off the edges.
2. Name each file exactly `<slug>.webp` and put it in `public/blog/`.
   The slug is the left column of every table above. That naming is what lets the
   wiring be mechanical rather than a guessing game.
3. WebP, quality ~80. It is roughly a third of PNG and every target browser
   supports it. `public/blog/` does not exist yet; create it.
4. Tell me a batch is in. I will point `hero.src` at `/blog/<slug>.webp`, drop the
   now-unneeded `credit` field for those posts, and stamp `updated`.

Partial batches are fine. The code path is per-post, so mixed states work: any
post without a generated image keeps its current photo until you replace it.

## The risk worth naming

Generic AI imagery reads as low-effort, and Kapyn's positioning is calm and
credible. The "no glow, no lens flare, no 3D, no neon" clause in the style block
is doing the real work there. It is what keeps these looking like schematics
rather than AI art.

**If a generation comes back glossy, reject it rather than shipping it.** One
gaudy hero undoes the credibility the other 58 are buying, and the whole reason
to do this is that repeated stock photos already read as low-effort.
