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
  transition, say).
- The rules for writing the post above still apply in full.

Return the complete revised post as structured output, in the same schema as the
draft.
