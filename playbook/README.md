# Kapyn blog playbook

The editorial knowledge behind Kapyn's autonomous weekly blog. HERMES runs the
pipeline on the dedicated laptop, with every model call going through the local
`agy` CLI (no API keys). This directory is what HERMES reads to decide *how* to
write. HERMES's Python holds no editorial rules; they all live here, versioned.

Claude Code maintains it periodically: it reads the run reports, adds lessons, and
tunes the prompts and rubrics. HERMES does not need Claude to run.

## How a run uses it

`config.json` → `steps` maps each pipeline step to its prompt files, inputs,
output schema and output artifact. The HERMES mission (`missions/kapyn_weekly_blog.yaml`
in the HERMES repo) follows it:

| Step | Reads | Produces |
|---|---|---|
| intake | `GET /api/blog/candidates?days=7`, `used-subjects.json` | `candidates.json` |
| topic | `voice.md`, `topic-selection.md` | `topic.json` (`schemas/topic.schema.json`) |
| distill | `research.md` | `factsheet.json` |
| write | `voice.md`, `blog-writing.md` | `post.json` |
| validate | `rubrics/post.json` (deterministic section) | `validator.json` |
| critique | `voice.md`, `critique.md`, `rubrics/post.json` | `critique.json` |
| revise (≤ 1) | `voice.md`, `blog-writing.md`, `revise.md` | `post.revised.json`, then validate again |
| image concept | `image-concept.md` | `image-concept.json` |
| image ×3 | `image-treatment.txt`, `rubrics/image.json` | 3 WebP candidates + gate report |
| image judge | `rubrics/image.json` (judged section) | the chosen hero |
| assembly, PR, verify, report | `config.json` → `output` | branch `hermes/<slug>`, PR, `runs/<date>-<slug>.md` |

Every step's LLM output is structured JSON, validated against its schema by HERMES.
Inputs the model needs are inlined into the prompt by HERMES; the model has no
tools and cannot read files or browse.

**The pipeline fails closed.** No topic passes, a draft fails validation after one
revision, or no image passes its gates: the run publishes nothing and says why in
its report. A skipped week is fine. A wrong post is not.

## Controls

- `enabled`: the kill switch. `false` stops the mission at intake. Flip it in a
  one-line PR and it takes effect on the next run.
- `publish_mode`: `"shadow"` builds everything and opens the PR but never merges.
  `"auto"` merges when CI is green, the post passes `rubrics/post.json` and the image
  passes `rubrics/image.json`. It stays `"shadow"` until 2 shadow runs
  (`shadow_runs_required`) have been inspected.
- `models`: the agy model per step (`agy models` lists them).

## Output contract

A published post is two files on the run's branch:

- `content/blog/generated/<slug>.json`: the validated post (`schemas/post.schema.json`)
  plus `date`, `readingMin` (computed, not generated), `hero` and `playbook_sha`.
- `public/blog/<slug>.webp`: the 1600×900 hero.

The blog reads `content/blog/generated/` alongside the hand-written posts in
`src/lib/blog-content.ts`. (That loader is not built yet; it ships with the
candidates endpoint.)

## Rules for editing the playbook

- Every run records the playbook commit SHA. Change the playbook only by PR, so
  each run is reproducible.
- A rule change starts as an entry in `lessons.md` citing the run that showed the
  problem. Then change the prompt or rubric it points to.
- Keep deterministic checks in `rubrics/*.json` and judgement in the prompts. If a
  rule can be checked mechanically, it belongs in the rubric, not a prompt.
- Keep `image-treatment.txt` short. Adding words to the treatment is what caused the
  first image failure (see `lessons.md`). Fix subjects, not the treatment.

## Sources of these rules

- The voice: `CLAUDE.md` voice and tone, and the summary rules in `src/lib/news-ingest.ts`.
- Cite or cut: `src/lib/blog-india.ts` header.
- Images: `docs/blog-image-prompts.md` (treatment copied verbatim, subjects seeded
  into `used-subjects.json`).
