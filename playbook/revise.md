# Step: revise

You are revising the draft to fix every issue the editor raised.

## Input

- `factsheet.json`, the only source of truth.
- `post.json`, the draft.
- `critique.json`, the editor's issues. Each quotes the offending text and says what
  to do.
- `validator.json`, the deterministic validator's findings.

## Rules

- Fix every blocking issue and every validator finding. When in doubt, cut: removing
  an unsupported sentence always beats rewording it.
- Change nothing the editor did not flag, apart from what a fix forces (a changed
  transition, say). This applies inside a paragraph too: restructuring the
  sentence a fix targets must not alter the certainty or attribution of an
  unflagged sentence next to it. Moving a citation link for flow and dropping
  "reports that" along the way is a certainty change, not a transition — see the
  certainty rule in `blog-writing.md`.
- If the flagged issue is length (too short), do not fix it by adding more short,
  one-fact sentences. Combine facts already cited into fuller sentences, or go
  deeper on what they mean. Padding this way can pass the word count check while
  failing voice and value: read the whole paragraph back and ask whether it
  connects the facts or just lists them.
- Cuts and combines made to fix a voice, value or synthesis issue can drop the
  post under 450 words even when length wasn't the flagged issue — a draft that
  passed word count going in is not guaranteed to still pass it after revision.
  Count the body after every edit. If a fix would take the post under 450,
  recover the length by expanding an existing section with facts already cited
  (go deeper on what they mean), not by re-adding the sentence you just cut.
- The rules for writing the post above still apply in full.

Return the complete revised post as structured output, in the same schema as the
draft.
