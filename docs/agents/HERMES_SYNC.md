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

- **Migration NOT yet applied.** Confirmed live just now: a correctly-authenticated request to
  the preview deployment's `/api/hermes/tasks` returns
  `500 {"error":"Could not find the table 'public.ingest_backlog' in the schema cache"}`.
  **This is the current blocking dependency** — Rahul is applying it by hand in the Supabase
  SQL editor (no psql/Supabase CLI available in this environment); not yet confirmed done.
- **PR #65 NOT yet merged.** Production (`www.kapyn.app`) is still running the old
  `api/news/fetch` code — no `ingest_backlog` writes are happening in production yet, and
  `/api/hermes/*` does not exist in production yet.
- **`HERMES_SECRET` IS already set** in Vercel — both **Preview** and **Production**
  environments (confirmed via `vercel env ls`, values hidden as expected). Stored for HERMES
  at `~/.config/hermes/kapyn.env` (chmod 600, outside both repos), key name `HERMES_SECRET`.
- **Preview deployment is live** and reachable:
  `https://ai-changelog-7sshfk65k-rahul-upadhyays-projects-8dd82149.vercel.app`
  (ephemeral — tied to the branch/PR, will change/disappear on merge. Not a durable URL for
  HERMES to poll long-term; production `https://www.kapyn.app` is the durable one, live only
  after merge+deploy).
- **Preview checks done so far:** 401 with no `Authorization` header ✅, 401 with a wrong
  secret ✅ (both return this route's own `{"error":"Unauthorized"}` JSON, not a Vercel
  SSO/deployment-protection wall — confirmed by inspecting the response body, not just the
  status code), 200-reachable auth path with the correct secret ✅ (then hit the missing-table
  error above, which is expected pre-migration).
  **Not yet done** (blocked on the migration): empty `tasks` list, 422 on a bad summary, 404 on
  an unknown task id, duplicate-submit idempotency, one full `is_test` round trip.
- **No `is_test` row exists yet. No genuine failed story has been captured yet** — the
  backlog-write code isn't live in production, so nothing has had the chance to fail into it.
- **HERMES side:** confirmed read-only — `master` branch, working tree clean, HEAD `1859b4f`.
  Claude has made exactly one commit there this session: `99f5d6f` (git init + baseline,
  before any of AGY's steps-mode work was known to be in progress). Nothing else in
  `mission-runner` has been touched by Claude.

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

1. **Rahul:** apply `supabase/migrations/0013_ingest_backlog.sql` in the Supabase SQL editor
   (in progress, not yet confirmed).
2. **Claude:** once confirmed, finish the preview verification checklist (empty tasks, 422,
   404, duplicate-submit idempotency, one full `is_test` round trip through
   `/api/hermes/tasks` → `/api/hermes/results` on the **preview** deployment).
3. **Claude:** merge PR #65 to `main`, confirm production deploy (`npx vercel ls --prod`),
   update this file with the production URL/commit and confirmation the migration + routes are
   live in production.
4. **AGY:** only after step 3 is confirmed in this file — build `integrations/kapyn.py`
   (`get_tasks`, `submit_result`, `prepare_observation_request`, `reconcile`,
   `parse_response` per the contract in §4), register it, add
   `missions/kapyn_summary_backlog.yaml` (capabilities `[api]`, `max_steps: 4`,
   `policy.api.allowed_domains: [kapyn.app]`, `credential_bindings: {kapyn: HERMES_SECRET}`,
   planner-mode `prompt_template`, **not** steps mode — this slice was always planner-driven),
   and hermetic adapter tests. Then attempt exactly one real task pull + submit against
   **production** (`https://www.kapyn.app`, not the ephemeral preview URL) as the actual
   acceptance test — using an `is_test` row if no genuine failed story has appeared yet.
5. **Do not** start `llm.generate`, `image.generate`, blog automation, or Instagram work
   (unchanged from KAPYN_SYNC.md §13).

---

## 7. Relevant Identifiers

- **Kapyn branch:** `hermes/slice-1-ingest-backlog`, commit `c74fc99`.
- **PR:** https://github.com/RahulUpadhyay3432/ai-changelog/pull/65 (open, not merged).
- **Preview URL (ephemeral):** `https://ai-changelog-7sshfk65k-rahul-upadhyays-projects-8dd82149.vercel.app`
- **Migration file:** `supabase/migrations/0013_ingest_backlog.sql` (written, not yet applied).
- **HERMES repo:** branch `master`, HEAD `1859b4f`. Claude's only commit there: `99f5d6f`.
- **Secret file for HERMES:** `~/.config/hermes/kapyn.env` (`HERMES_SECRET=...`, chmod 600).

---

## 8. Last Update Timestamp

- **Timestamp:** 2026-09-22 (session-local; see git commit timestamps on the identifiers above
  for exact times).
- **Updated by:** Claude Code (Kapyn side).
