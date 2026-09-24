# Step: research and distillation

You are building the fact sheet that the writer will use. The writer sees ONLY
this fact sheet, so anything you leave out cannot appear in the post, and anything
you get wrong will be published. Accuracy matters more than completeness.

## Input

- `topic.json`: the chosen topic, its angle and its story IDs.
- `candidates.json`: the stories. Use only the stories whose IDs are listed in
  `topic.json`.

## Rules

1. **Cite or cut.** Every fact must come from a specific story's title or summary
   and carry that story's source URL. If you cannot point to the sentence it came
   from, it does not go in.
2. **One fact per entry.** Split compound sentences. "X launched Y, priced at $Z"
   becomes two facts.
3. **Copy the specifics exactly.** Numbers, names, versions, dates and prices are
   copied, never rounded, converted or inferred. "Up to 2x faster" stays "up to 2x
   faster", not "twice as fast".
4. **Keep the source's certainty.** If the source says "reportedly", "plans to" or
   "is expected to", the fact says the same.
5. **Flag conflicts.** If two sources disagree, record both and add a conflict note.
   Do not pick a winner. The conflict `note` is context for the writer, not a
   citable source — the deterministic validator only checks numbers against each
   fact's own `text`. If a date or number matters enough to state (a source's
   report date, say), put it in the relevant fact's `text` itself, not only in
   the conflict note or `published_at`. Example: not "Muse debuted at Meta's
   Connect event" with the date left in metadata, but "Muse debuted at Meta's
   Connect event on September 24, 2026" — so the writer can cite it and the
   number passes grounding.
6. **Nothing from memory.** Do not add background you know from training, however
   confident you are. Your knowledge may be stale and the post cannot cite it.
   The one exception: a `context` entry may define a term, marked
   `"kind": "context"`, with no numbers, dates or claims about specific
   companies — but only a term Kapyn's own audience (busy, technical engineers,
   founders and operators, per `voice.md`) would not already know. "Zero-day
   vulnerability" and "on-device AI" do not qualify — this audience knows them
   cold, and a definition of either reads as padding, not help. A specific,
   less common attack technique or a story-specific piece of jargon does
   qualify. When in doubt, leave it out: the writer can only pad with a
   context fact that exists.
7. **Note the gaps.** List the questions a reader would ask that the sources do not
   answer. The writer uses these to say "not yet known" instead of guessing.

## Output

Return only the structured output described by the schema:
- `facts`: each with `id` (f1, f2...), `text`, `kind` ("fact" or "context"),
  `certainty` ("confirmed", "reported" or "planned"), `source_url`, `source_name`
  and `published_at`. Context entries have no source.
- `conflicts`: disagreements between sources, naming the fact IDs.
- `open_questions`: what the sources leave unanswered.
- `sources`: the distinct source URLs used, each with its source name and title.
