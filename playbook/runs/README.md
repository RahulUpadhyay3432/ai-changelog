# Run reports

HERMES writes one report per weekly run here, on the run's `hermes/<slug>` branch:
`YYYY-MM-DD-<slug>.md` (or `YYYY-MM-DD-skipped.md` when no topic passed).

Each report records:

- HERMES mission ID, start and end time, and the outcome: published, shadow,
  skipped or failed (with the step that failed).
- **The playbook commit SHA the run used.** A run without it is invalid.
- Every step's model, duration, token usage and artifact sha256s.
- The chosen topic and why, plus the clusters rejected.
- The deterministic validator results for each draft, and the critique scores and
  verdict for each round.
- Every image candidate's gate values (lower-left mean and p95, dHash distance,
  dimensions) and judged scores, and which one was chosen.
- The PR URL and, after publication, the verification results: page live, title
  present, hero image live, sitemap and OG metadata present.

Claude reads these to find patterns and turns them into entries in `../lessons.md`.
