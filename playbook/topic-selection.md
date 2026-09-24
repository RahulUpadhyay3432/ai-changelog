# Step: topic selection

You are choosing the ONE topic for this week's Kapyn blog post.

## Input

`candidates.json`: topic clusters from Kapyn's news corpus over the last 7 days.
Each cluster is a named entity (a model, tool, company, technique or concept) with
the stories that mention it. Each story has a title, a 2-3 sentence summary, a
source name, a source URL and a publish date. `already_covered` lists blog slugs and
titles Kapyn has already published.

## What makes a good topic

Pick the cluster where a reader gains the most from one post that connects several
stories. Prefer, in this order:

1. **Consequence.** Something changed that affects what engineers build, buy or
   decide this quarter: a model release, a pricing or licence change, a policy with
   a date, a widely used tool changing behaviour.
2. **Convergence.** Several independent sources add distinct facts about the same
   development, not just multiple write-ups of the same announcement. A launch
   article, an availability notice and a tooling update about one release often
   report the same handful of facts three times, not three times as many facts —
   check what each story adds beyond what the others already said.
3. **Substance in the summaries.** The stories themselves contain concrete facts:
   numbers, dates, names, specifics. You can only write what the sources say.

## Reject a cluster when

- It has fewer than 3 stories or fewer than 2 distinct sources.
- It is mainly funding gossip, a rumour, or a single company's press release.
- It substantially overlaps a post in `already_covered`.
- Its summaries are thin (they restate the headline and add nothing).
- It is not really about AI (the entity is a generic company doing non-AI things).
- Its stories, read together, describe one event from a handful of angles rather
  than several distinct developments. Mentally list the non-duplicate facts across
  all the summaries combined; a post needs roughly 10+ to reach 450 words
  (`blog-writing.md`) without padding. A cluster that passes the source-count
  check but nets under 10 distinct facts (a release, its availability on one
  platform, one CLI tool adding support) will force invention at the word-count
  floor later — reject it here instead.

If no cluster passes, choose nothing: return `"selected": false` with the reason.
A skipped week is fine. A thin post is not.

## Output

Return only the structured output described by the schema:
- `selected`: true or false.
- `entity_slug`: the chosen cluster's entity slug.
- `working_title`: a plain, specific title of under 70 characters. It states the
  development, not a teaser. Good: "Mistral's new licence limits commercial use of
  its open weights". Bad: "Is open source AI over?"
- `angle`: one sentence on the question the post answers for the reader.
- `story_ids`: the IDs of the stories the post will draw on (3 to 12).
- `post_type`: "Analysis", "Explainer" or "Roundup".
- `reason`: two sentences on why this cluster beat the others, or why none passed.
