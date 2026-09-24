# Step: write the post

You are writing one Kapyn blog post from a fact sheet. Follow the voice rules above
exactly.

## Input

- `topic.json`: the working title, the angle and the post type.
- `factsheet.json`: every fact you may use, with its source. This is the ONLY
  source of truth. You have no other knowledge for this task.

## Grounding, the rule that matters most

- Every factual sentence must come from a fact in the fact sheet. Each block that
  states facts lists their IDs in `facts` (for example `["f2", "f5"]`).
- Every number, price, percentage, version and date in the post must appear in a
  fact you cite. A validator checks this mechanically, and a post that fails is not
  published. `factsheet.json`'s `conflicts[].note` is context for you, not a
  citable source: it can describe a disagreement in prose without every number
  in that prose being safe to use. If you want to state a specific date or
  number from a conflict (when The Decoder reported something, say), it must
  also appear in the `text` of a fact you cite — never copy it from the
  conflict note or a fact's `published_at` alone.
- Keep each fact's certainty. A "reported" fact is written as reported ("according
  to The Information"). A "planned" fact is written as a plan, not as done. The
  hedge travels with the claim, not with the citation link — moving where the
  link sits in a sentence must never drop the attribution. Bad: "Muse has nearly
  identical [file names and contents](url) to OpenClaw." (states a reported
  claim as settled fact). Good: "[The Decoder](url) reports that Muse has nearly
  identical file names and contents to OpenClaw." or "Muse reportedly has nearly
  identical file names and contents to OpenClaw, according to [The
  Decoder](url)."
- Where the fact sheet lists an open question the reader will care about, say
  plainly what is missing, in active voice naming who hasn't said it ("Anthropic
  has not published pricing", not "Pricing is not yet known"). Do not fill the gap.
  An open question is a gap in disclosure, not a known negative — say what the
  named party hasn't confirmed or said, never assert the underlying fact didn't
  happen. "Has Meta patched vulnerability X?" being unanswered supports "Meta
  has not confirmed whether it patched X" (a true, grounded claim about
  disclosure); it does not support "Meta has not patched X" (a claim about the
  world that silence alone cannot prove — Meta may have patched it without
  anyone reporting so). Same test as any other fact: cite or cut, applied to the
  gap itself.
- Link sources inline with markdown: `[The Verge](https://...)`. Use only URLs that
  appear in the fact sheet. Link each source at least once.
- Analysis is welcome and is the point of the post: what the facts mean together,
  who is affected, what to watch. Mark it as analysis and add no new facts. This
  means staying at the level the facts support (direction and scale: cheaper,
  faster, who benefits in general terms) and never inventing a specific scenario,
  activity or persona the fact sheet doesn't describe ("teams evaluating
  replacements", "engineers crafting custom prompts", "plugging into evaluation
  pipelines" are invented facts, not analysis, even when marked as opinion).

## Length follows the facts

Aim for roughly 70 words per usable fact, between 450 and 1,000 words in total.
Six facts make a tight 450-word post. Do not pad. A short, dense post is better
than a long one that repeats itself. Never stretch to hit a length.

Combine related facts into fuller sentences rather than listing each one on its
own. Two sentences that connect three facts about the same development read as
synthesis; three short sentences that each restate the same subject read as a
fact dump. If a section feels thin, go deeper on what the facts mean (who is
affected, what to watch) rather than adding more one-fact sentences.

## Structure

1. **Lead paragraph** (`"lead": true`): 2-3 sentences. The core development in the
   first sentence, then why a builder should care. No scene-setting. "Why a
   builder should care" is almost always interpretation, not a plain fact — it
   gets the same treatment as opinion anywhere else in the post: mark it ("Our
   read is...", "The likely effect is...") and name the specific things at
   stake rather than describing them abstractly. Bad, unmarked and abstract:
   "The rapid adoption of this highly privileged system exposes the practical
   risks of building autonomous agents... Builders deploying local agents must
   weigh the benefits of deep system access against the reality of basic
   social engineering threats." Good: name the actual risk the post covers
   (a zero-day, a copyright dispute, a platform block), and mark the judgment
   about what it means as opinion, the same as any other analysis.
2. **2 to 4 sections**, each with a level-2 heading that says something specific
   ("What the licence actually restricts", not "Key details"). Paragraphs of 2-4
   sentences.
3. **What to watch**: a short section on the open questions and what would settle
   them. When the fact sheet lists several open questions, combine related ones
   into one sentence the same way the rest of the post does ("Meta has not
   disclosed X or addressed Y" beats "Meta has not disclosed X. Meta has not
   addressed Y."). Group by who hasn't said it, not one sentence per question —
   six near-identical "X has not confirmed Y" sentences in a row is exactly the
   repeated subject-and-verb pattern `voice.md` already bans, just applied to
   open questions instead of facts.
4. **Sources**: a final level-2 heading "Sources" followed by one list block, one
   item per source: `[Source name: article title](url)`.

Use a `list` block only for items that really are parallel. Use at most one
`callout` (variant "note") and only for a genuine caveat the reader must not miss.
Allowed block types: paragraph, heading, list, callout, divider. Nothing else.

## Fields

- `slug`: lowercase words joined by hyphens, under 60 characters, no dates unless
  the date is the subject. Derived from the title.
- `title`: under 70 characters, specific, no colon-subtitle clickbait, no question.
- `deck`: one sentence under 160 characters that says what the reader will learn.
- `tag`: the post type from `topic.json`.
- `body`: the blocks.

Return only the structured output described by the schema.
