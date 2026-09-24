# Lessons

Append-only. Each lesson says what went wrong, the evidence, and the rule it
produced. Claude reviews run reports periodically and adds entries here, then
updates the prompt or rubric the lesson points to. Newest first.

## 2026-09-24 · "Opinion" became a loophole for inventing scenarios

**What happened:** mission `3cfc4d17` ("Anthropic releases Claude Opus 5.5")
failed `POST_JUDGED` at grounding 1/5, the harshest score seen yet, despite the
two prior lessons' fixes holding (structure 5/5). Every flagged sentence was
marked as opinion ("Our read is...") but invented a specific scenario the fact
sheet does not describe: "engineers crafting custom prompts to force a neutral
tone", "teams evaluating replacements" and "migrating high-volume tasks away
from OpenAI", "plugging into evaluation pipelines... testing against
proprietary data". `voice.md`/`blog-writing.md` already said opinion may
interpret facts but never add new ones; the model was following that rule for
prose it thought of as opinion while still inventing concrete, specific facts
under it. A prior real run's opinion paragraphs stayed at a general level
("changes the calculus", "affects engineering budgets") and scored grounding
5/5, so the boundary is one of specificity, not the presence of opinion itself.
**Rule:** analysis may state direction and scale in general terms (cheaper,
faster, who benefits, broadly) but must never invent a specific scenario,
activity or persona the fact sheet doesn't describe, even when marked as
opinion. See `blog-writing.md`.

## 2026-09-24 · "It is not yet known" is the passive voice the prompt itself asked for

**What happened:** the first real run after the previous lesson's fix (mission
`16311347`, "Anthropic releases Claude Opus 5.5") was dramatically better
(synthesis 3→5, value 1→4, voice 1→3) but still failed `POST_JUDGED` at voice
3/4. All 3 remaining voice issues were the same pattern: "The supported context
window length... are not yet known," which the critique flagged as passive and
rewrote as "Anthropic does not state the supported context window length...".
The instruction was contradicting itself: `blog-writing.md` literally told the
writer to phrase open questions as "it is not yet known" while `voice.md`
requires active voice throughout.
**Rule:** phrase an open question by naming who hasn't said it ("Anthropic has
not published X"), never as an impersonal "X is not yet known". See
`blog-writing.md`.

## 2026-09-24 · One fact per sentence reads as machine-written

**What happened:** the first real weekly run to clear both deterministic checks
(mission `b023ed75`, "Anthropic launches Claude Opus 5.5") failed `POST_JUDGED` at
voice 1/5 and value 1/5, despite grounding 5/5 and structure 5/5. Nearly every
paragraph mapped facts to sentences one-for-one instead of combining them, e.g.
"Developers can integrate Claude Opus 5.5 via the Claude Platform on AWS to build
autonomous agents. Developers can also integrate Claude Opus 5.5 via the Claude
Platform on AWS to automate intricate workflows." The revise step made it worse:
the only blocking issue on the first draft was `word_count` (295 words, too
short), and the model hit length by adding more one-fact sentences rather than
deepening the analysis already grounded in the fact sheet.
**Rule:** "one idea per sentence" (`voice.md`) means one idea, not one fact.
Closely related facts about the same subject belong in one sentence with a
conjunction or clause. When length is short, fix it by synthesizing facts
together or going deeper on what they mean, never by adding more short,
repetitive sentences. See `voice.md`, `blog-writing.md`, `revise.md`.

## 2026-09-23 · The dHash gate does not catch a repeated subject

**What happened:** the slice 3 real run (HERMES mission `m_img_ccfdefa7b636`) made
3 brass-key-on-slate heroes. `reference-heroes/perm_probe_1790107557477.jpg` is also
a brass key on slate, yet it sits 30-42 dHash bits from all three, far above the
gate of 10. dHash compares coarse pixel structure, so the same object shot at a
different angle or crop looks unrelated to it.
**Rule:** the dHash gate only catches near-copies of a published hero. Variety of
*subject* across posts comes from the concept step reading `used-subjects.json`.
Every published hero's subject must be appended there. See `image-concept.md`.

## 2026-09-23 · agy structured output can disagree with its own prose

**What happened:** asked for a title and a 1-5 rating with `--json-schema`, agy's
prose answered "Silicon Squeeze..." and 4/5. Its `structured_output` said
"GPU Price Post Title and Rating" and 5.
**Rule:** when a step has a schema, only `structured_output` counts, re-validated
locally. The prose is discarded. (Enforced in HERMES `llm.generate`.)

## 2026-09-23 · A mean-luminance gate passes a bad hero

**What happened:** the probe hero with neon brains and code text had a lower-left
mean luma of 38.2, dark enough to pass a mean-only gate. Its text showed up only in
the 95th percentile (126).
**Rule:** gate on both mean (≤ 40) and p95 (≤ 90). See `rubrics/image.json`.

## 2026-09-23 · Ungrounded headline-to-post invents details

**What happened:** the capability probe asked agy for a 1,200-word post from one
headline. It wrote 1,324 words with 5 em dashes, a hype tone, and specifics that
appear in no source.
**Rule:** posts are written only from a fact sheet built from several sources.
Length follows the number of facts. Every number must appear in the fact sheet
(`numbers_grounded`). See `research.md`, `blog-writing.md`.

## 2026-09-23 · Unconstrained image prompts produce "AI imagery"

**What happened:** the probe prompt "a blog hero image for the headline..." gave
glowing brains, a balance with "AI BENCHMARK" on it, and floating labels. The same
tool, given a concrete subject ("a single brass key on dark slate, no text"), gave
a clean editorial still life.
**Rule:** the concept step picks a physical, photographable object. The fixed
treatment follows it. See `image-concept.md`.

## 2026-09-04 · Abstract subjects collapse into circuit boards (PR #59)

**What happened:** the first hero batch came back as near-identical circuit-board
schematics. The style block was 150 words of concrete instruction and the subjects
were 15 words of abstract geometry, so the style won.
**Rule:** the subject carries the image, the treatment only unifies it. The subject
goes first. See `docs/blog-image-prompts.md`.

## 2026-08 · Three plausible facts shipped wrong (India series, PR #51)

**What happened:** the project shipped three plausible-looking facts that turned out
to be wrong. That is recorded in the header of `src/lib/blog-india.ts`, which is why
every India figure is now checked against a primary source.
**Rule:** cite or cut. A fact with no source does not go in.
