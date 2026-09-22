# HERMES_SYNC.md — Canonical Living Cross-Agent State File

> **CANONICAL KAPYN-SIDE STATE FILE**
> **Location:** `/home/rahul/projects/ai-changelog/docs/agents/HERMES_SYNC.md`
> **Owner (Writer):** Claude Code (working in Kapyn repository)
> **Reader:** AGY / Gemini (working in HERMES repository at `/home/rahul/hermes-poc/mission-runner`)
> **Counterpart File:** `/home/rahul/hermes-poc/mission-runner/KAPYN_SYNC.md` (written by AGY, read by Claude).
> **Rule:** Living state file, not a static log. Whenever any material change is made on the
> Kapyn side, Claude updates this file in the same task before stopping.
> **Cycle:** `READ SYNC → WORK → TEST → UPDATE SYNC → STOP / REPORT` (matches KAPYN_SYNC.md §12.4).

---

## 1. What Claude / Kapyn Has Completed

All five items KAPYN_SYNC.md §5 asked for are code-complete, type-checked (`npx tsc --noEmit`
clean) and lint-clean, on branch `hermes/slice-1-ingest-backlog` (PR #65, not yet merged):

1. **Migration** `supabase/migrations/0013_ingest_backlog.sql` — `ingest_backlog` table.
2. **Ingestion failure routing** — `api/news/fetch/route.ts`'s `!outcome.ok` branch now
   best-effort upserts the failed story into `ingest_backlog` (own try/catch, never affects
   ingestion itself).
3. **`GET /api/hermes/tasks`** — implemented, see §4 for the exact contract.
4. **`POST /api/hermes/results`** — implemented, see §4 for the exact contract.
5. **Guardrails** — `hermes_attempts` cap of 3 (rejects at 3), 7-day expiry via the existing
   `feedCutoffISO()` window (`src/lib/feed-window.ts`, `FEED_WINDOW_HOURS = 24 * 7`, the same
   window the live feed uses — not a separate constant), idempotent result handling (see §4).

Also added, beyond the five items: `GET /api/hermes/results?task_id=` (read-only status
check for HERMES to reconcile a submission it never saw a response for — KAPYN_SYNC.md didn't
ask for this explicitly but the earlier planning session's contract required it).

---

## 2. Current Production State (as of this writing)

- **Migration APPLIED.** Rahul ran it in the Supabase SQL editor. `ingest_backlog` exists in
  the one production Supabase project (Preview and Production point at the same physical DB —
  there is no separate staging database for this project).
- **PR #65 verification COMPLETE — full round trip passed on the Preview deployment**
  (`https://ai-changelog-7sshfk65k-rahul-upadhyays-projects-8dd82149.vercel.app`, ephemeral,
  will disappear on merge). Every check in the original hermetic list passed:
  - 401 with no `Authorization` header, 401 with a wrong secret (this route's own
    `{"error":"Unauthorized"}` JSON, not a Vercel SSO wall — confirmed via response body).
  - Empty `tasks` list on an empty/all-resolved backlog; unknown `kind` also returns `[]`.
  - `GET /api/hermes/tasks` returns the correct task shape (verified against a real
    `is_test=true` row — see below).
  - `404 {"error":"unknown task"}` on both `POST /api/hermes/results` and
    `GET /api/hermes/results?task_id=` for a made-up id.
  - `400` on a malformed `POST /api/hermes/results` body (missing `result.task_id`/`output`).
  - `422 {"accepted":false,"reason":"summary length 9 outside 80-900","attempts_left":2}` on a
    deliberately bad submission; `hermes_attempts` incremented, row stayed `pending`.
  - Valid submission on the same (`is_test=true`) row →
    `200 {"accepted":true,"news_item_id":null,"duplicate":false}` — confirms the `is_test`
    write-skip actually works (never touched `news_items`).
  - Same submission resubmitted → `200 {"accepted":true,"news_item_id":null,"duplicate":true}`
    — idempotency confirmed.
  - Status flipped `pending → done`; `GET /api/hermes/tasks` then correctly excludes it.
  - **One real gotcha found during testing, not a code bug:** running two INSERT statements
    stacked in the same Supabase SQL editor buffer (leftover text from an earlier paste) rolled
    both back when the second hit a unique-constraint conflict with the first, within the same
    implicit transaction. Symptom looked exactly like a query-logic bug (row existed per the
    constraint error, `SELECT *` showed 0 rows) but was purely an SQL-editor buffer mixup.
    Nothing in `src/app/api/hermes/*` needed to change.
- **`HERMES_SECRET` IS set** in Vercel — both **Preview** and **Production** environments
  (confirmed via `vercel env ls`, values hidden as expected). Stored for HERMES at
  `~/.config/hermes/kapyn.env` (chmod 600, outside both repos), key name `HERMES_SECRET`.
- **PR #65 MERGED to `main`** (squash commit `2d7dec7`) and **LIVE IN PRODUCTION**, confirmed:
  `https://www.kapyn.app/api/hermes/tasks` returns `401` with no/wrong secret and
  `200 {"tasks":[]}` with the correct one (production build took ~9 minutes — slow because of
  841 pre-existing static `/mcp/[slug]` pages, unrelated to this slice; not a regression it
  introduced). **This is the durable URL for HERMES to poll going forward — use
  `https://www.kapyn.app`, not any `*.vercel.app` preview URL.**
- **No genuine failed story has appeared yet** — still true. AGY's real acceptance run (below)
  used the same synthetic `is_test` row, reset to `pending` with fresh content via a manual
  Supabase SQL `UPDATE` Rahul ran by hand (safe: `is_test=true` rows are hard-blocked in
  `results/route.ts` from ever reaching `news_items`, unchanged by this).
- **HERMES side — AGY's connector build (2026-09-22, in AGY's own terminal, outside any Claude
  Code session):** `master` branch, working tree clean, HEAD now `7891046`. AGY built and
  committed `integrations/kapyn.py` (`KapynAdapter`: `get_tasks`/`submit_result`/`get_result`,
  strict validation, credential resolution via `~/.config/hermes/kapyn.env`),
  `missions/kapyn_summary_backlog.yaml` (planner-mode, `capabilities: [api]`,
  `allowed_domains: [kapyn.app, www.kapyn.app]`, `max_steps: 4`), and
  `tests/test_kapyn_adapter.py` (25/25 hermetic unit tests + AGY reports 441/441 on the full
  HERMES regression suite, zero regressions). Commits: `2fbf4a5 feat(kapyn): implement Kapyn
  integration adapter and verify live end-to-end task execution`, `7891046 docs(sync): record
  HEAD commit 2fbf4a5 in KAPYN_SYNC.md`. Claude's only commit in that repo all session remains
  `99f5d6f` (git init + baseline) — everything else, including this build, is AGY's.

### Independent verification (Claude, 2026-09-22 late evening — not just trusting AGY's `KAPYN_SYNC.md` self-report)

`KAPYN_SYNC.md` claimed task `8d182d10-d1bb-49b1-8443-25886b511738` was pulled, classified,
submitted, and accepted, and that mission `0a941b7c-ebd9-462b-92d2-291e0b43d2fb` completed in 3
steps. Given the documented ~90-minute mid-air-crash risk between these two docs, this was
checked directly rather than taken on faith:

1. **HERMES git log** — commits `2fbf4a5`/`7891046` genuinely exist, working tree clean, all
   three claimed files present on disk with mtimes (~20:35–20:36) consistent with the run.
2. **HERMES's local mission ledger** (`~/hermes-poc/mission-runner/mission.db`, read-only
   `sqlite3` query) — mission `0a941b7c-ebd9-462b-92d2-291e0b43d2fb` exists,
   `status=completed`, `definition_name=kapyn_summary_backlog`, timestamps consistent with the
   claimed run.
3. **Live production `GET` requests against `https://www.kapyn.app`** (read-only, using the
   stored `HERMES_SECRET`):
   - `GET /api/hermes/results?task_id=8d182d10-d1bb-49b1-8443-25886b511738` → `{"status":"done"}`
   - `GET /api/hermes/tasks?kind=summary_backlog&limit=5` → `{"tasks":[]}` (no eligible backlog
     tasks pending — nothing dangling or stuck)

**Conclusion: the Kapyn ↔ HERMES Task Connection milestone is genuinely complete and verified
live in production**, confirmed independently on the Kapyn side, not solely on AGY's report.

---

## 3. Reconciliation With KAPYN_SYNC.md

Read in full. No conflicts found.

- Architecture, milestone, and target task (§1–3) match Claude's understanding exactly.
- Steps-mode work (§6, §9) is acknowledged as complete and out of scope to redo — Claude has
  not touched `mission_definition.py`, `trigger_gateway.py`, `durable_runner_v2.py`,
  `workspace.py`, or `hermetic_test_base.py`, and has no plans to.
- Deferred work list (§13) matches: `llm.generate`, `image.generate`, blog automation, GitHub
  PR/CI automation, Buffer/Instagram — none of this has been started or will be started as
  part of this connection slice.
- Protected items (§11) respected: no Kapyn migration has been *applied* (only written,
  pending Rahul running it by hand), no existing table dropped, no historical HERMES mission
  touched.
- One stale-but-harmless note: KAPYN_SYNC.md §18's commit list ends at `843fb4d`; HEAD is
  actually `1859b4f` (one commit later, "remove duplicate sync file"). Not a conflict, just
  worth AGY refreshing on its next write.
- §14 open questions are answered in full in §4 below.

**Re-reconciled 2026-09-22 late evening, after AGY's connector build + production run.**
`KAPYN_SYNC.md` (its §1–§11, timestamp `2026-09-22T21:15:00+05:30`) and this file now agree:
both sides list the same milestone as complete, the same commit hashes, and the same protected
items as untouched. No conflicts found on this pass either — see the independent verification
above for why this isn't just taking AGY's write at face value.

---

## 4. Exact API Contracts (answers KAPYN_SYNC.md §14)

**Auth (answers §14.3):** `Authorization: Bearer <HERMES_SECRET>` **only** — no
`x-hermes-secret` header, no `?secret=` query param (deliberately narrower than
`cron-auth.ts`'s three-way fallback, since this is a single trusted machine-to-machine
credential, not a browser-triggered cron ping). Constant-time compare, fails closed if
`HERMES_SECRET` is unset. Implementation: `src/lib/hermes-auth.ts`.

### `GET /api/hermes/tasks?kind=summary_backlog&limit=1..5`

- `kind` must currently be exactly `summary_backlog`; anything else (or missing) returns
  `{"tasks":[]}` rather than an error, so HERMES's polling loop never needs to special-case an
  unimplemented kind.
- `limit` clamped to 1-5, default 1.
- On every call, before selecting tasks: expires pending rows whose `published_at` fell out of
  the feed window, and marks `superseded` any pending row whose `source_url` now exists in
  `news_items` (i.e. a later Vercel cron run already summarised it — so HERMES never
  duplicates work). **Polling itself never creates rows** — only `api/news/fetch` does that.
- Response:
  ```json
  { "tasks": [
    { "id": "<uuid>", "kind": "summary_backlog",
      "input": { "title": "...", "content": "... (≤2000 chars)", "source_name": "...",
                 "default_category": "...", "published_at": "..." },
      "instructions": "<full prompt text, includes the category list + summary rules Kapyn's own ingestion LLM chain uses, plus an explicit instruction NOT to reply in the CATEGORY:/SUMMARY:/ENTITIES: text format but to call submit_result with parsed JSON fields instead>",
      "output_format": { "category": "one of: ai-models, dev-tools, open-source, startups, research, funding-ma, big-tech, infrastructure, policy",
                          "summary": "2-4 plain-English sentences (80-900 chars), or LOW_SIGNAL / OFF_TOPIC per the instructions",
                          "entities": [{ "name": "string", "type": "model | tool | company | technique | concept" }] }
    }
  ] }
  ```

### `POST /api/hermes/results`

- Body: `{ "run_id": "...", "result": { "task_id": "<uuid>", "kind": "summary_backlog", "output": { "category": "...", "summary": "...", "entities": [{"name":"...","type":"..."}] } } }`.
  **`entities` is a real JSON array**, not a stringified CATEGORY/SUMMARY/ENTITIES text block —
  HERMES's planner must parse its own output into these three fields before calling
  `submit_result`.
- Responses:
  - `200 { "accepted": true, "news_item_id": "<uuid>|null", "duplicate"?: true }`
  - `422 { "accepted": false, "reason": "...", "attempts_left": <n> }` — invalid category, bad
    summary (`isBadSummary`), or length outside 80-900 chars. Bumps `hermes_attempts`;
    `status` moves to `rejected` once `attempts_left` hits 0 (3rd failure).
  - `404 { "error": "unknown task" }`
  - `409 { "accepted": false, "reason": "task is <status>, not pending" }` — already
    expired/rejected/superseded.
  - `401 { "error": "Unauthorized" }`
  - `400` on a malformed body (missing `result.task_id` / `result.output`).
- **Idempotent:** resubmitting to an already-`done` task replays `{accepted:true, news_item_id, duplicate:true}` without re-validating. A `news_items.source_url` unique-violation
  (e.g. Vercel's cron happened to insert the same story in the gap between task issue and
  result submission) is caught server-side and treated as done, same response shape.
- **`is_test` rows** (set directly on the `ingest_backlog` row, not part of the HTTP contract):
  go through the identical auth/validation/idempotency/status path, but the final
  `news_items`/`story_archive`/entity-linking write is skipped — the parsed output is stored
  on the backlog row only (`status: done`, `news_item_id: null`). This is enforced
  server-side in the route handler, not by convention.

### `GET /api/hermes/results?task_id=<id>`

Read-only. `{"status": "pending"|"done"|"rejected"|"expired"|"superseded"}`, `404` if unknown.
For HERMES to reconcile a submission whose HTTP response it never received.

**Shared code:** `buildClassifyAndSummarizePrompt`, `parseClassifyResponse`, `mirrorToArchive`,
`linkEntities`, and the new `persistStory()` (insert → archive → entities, with the
unique-violation handling above) all live in `src/lib/news-ingest.ts`, used by both
`api/news/fetch` and `api/hermes/results` so the two ingestion paths persist a story
identically.

---

## 5. Protected Items (Kapyn side)

1. **`news_items` / `story_archive` / knowledge-graph tables** — only ever written via
   `persistStory()`, never directly.
2. **`ingest_backlog` is currently only a *written* migration, not an applied one.** Do not
   assume the table exists until this file says so (§2 will be updated the moment Rahul
   confirms).
3. **`is_test=true` rows must never reach `news_items`.** This is a hermetic path exactly for
   HERMES's own verification — safe to use for a one-off end-to-end test before a genuine
   failed story appears, per the original plan.
4. Production deploy (`www.kapyn.app`) is untouched by this slice so far — merging PR #65 is
   an explicit, separate step (see §6), not implied by anything already done.

---

## 6. Exact Next Approved Step

1. ~~**Rahul:** apply `supabase/migrations/0013_ingest_backlog.sql`~~ — **DONE.**
2. ~~**Claude:** finish the preview verification checklist~~ — **DONE, all green** (§2).
3. ~~**Claude:** merge PR #65 to `main`, confirm production deploy~~ — **DONE.** Merged as
   `2d7dec7`, production build finished and verified live (§2).
4. ~~**AGY — this is your green light.** Build `integrations/kapyn.py` ... attempt exactly one
   real task pull + submit against production ...~~ — **DONE.** AGY built the adapter, mission
   YAML, and hermetic tests, and ran the real acceptance task against `https://www.kapyn.app`
   (task `8d182d10-...`, mission `0a941b7c-...`, `200 {"accepted":true}`). Independently
   verified by Claude, not just AGY's self-report — see the verification block above.
5. **Do not** start `llm.generate`, `image.generate`, blog automation, or Instagram work
   (unchanged from KAPYN_SYNC.md §13) — **still applies, nothing here changes it.**
6. ~~When AGY's run completes, update this file's §1/§2 ... hand back to Claude for
   inspection~~ — **DONE, this update is that inspection.** Per the agreed cycle
   (`BUILD → TEST → ONE REAL RUN → INSPECT → STOP/report`), this milestone has now reached
   **STOP/report**: the connection is live, verified, and complete. No further HERMES work is
   approved without a fresh, explicit go-ahead from Rahul — and per `docs/PROJECT-STATUS.md`,
   this track was never the priority to begin with (retention is). Next action is Rahul's call,
   not an automatic continuation into a new slice.

---

## 7. Relevant Identifiers

- **Kapyn branch:** `hermes/slice-1-ingest-backlog` (still exists, merged into `main`).
- **`main` HEAD:** `2d7dec7` (squash-merged PR #65).
- **PR:** https://github.com/RahulUpadhyay3432/ai-changelog/pull/65 (**MERGED**).
- **Production URL (durable — use this):** `https://www.kapyn.app`
- **Migration file:** `supabase/migrations/0013_ingest_backlog.sql` (written AND applied).
- **HERMES repo:** branch `master`, HEAD `7891046` as of Claude's last read (AGY's commits
  `2fbf4a5`/`7891046` on top of Claude's baseline). Claude's only commit there all session:
  `99f5d6f` (git init + baseline).
- **Verified task/mission (2026-09-22 real acceptance run):** task
  `8d182d10-d1bb-49b1-8443-25886b511738`, mission `0a941b7c-ebd9-462b-92d2-291e0b43d2fb`,
  status `done`/`completed` on both sides, confirmed live.
- **Secret file for HERMES:** `~/.config/hermes/kapyn.env` (`HERMES_SECRET=...`, chmod 600).

---

## 8. Last Update Timestamp

- **Timestamp:** 2026-09-22, late evening (session-local; see git commit timestamps on the
  identifiers above for exact times).
- **Updated by:** Claude Code (Kapyn side) — reconciling AGY's completed connector build +
  verified production run.
