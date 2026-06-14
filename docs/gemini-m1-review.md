# Gemini review prompt — Kapyn knowledge base (M1)

**How to use:** Open this file, copy everything in the "PROMPT" block below into
**Gemini 2.5 Pro** (AI Studio, not the default app model). Then paste the contents
of the files listed under "FILES TO PASTE" so Gemini reviews the real code.

---

## PROMPT (copy from here)

You are a staff engineer doing an adversarial pre-deploy code review. Be skeptical and concrete — I want real defects, not praise. If something is fine, say so briefly; spend your effort on what could break.

**Context.** Kapyn is a Next.js 16 (App Router) + React 19 + Supabase (Postgres) PWA that turns AI/tech news into swipeable 30-second reads. I just built "M1" of a knowledge base: during the existing daily news-ingestion cron, an LLM also extracts named entities (models, tools, concepts) per story; these are stored in a durable graph; a separate cron auto-generates a grounded, self-critiqued "explainer" for each concept; and public SEO pages render them at `/learn/[slug]` and `/explore`. The product is **free, no auth** — the public uses the Supabase **anon** role. Content generation is **fully automated** with quality guardrails (the brand risk is auto-publishing wrong facts under Kapyn's name).

Key invariants that MUST hold:
- The anon (public) role can read **only** `status='published'` explainers/digests and `status='active'` entities — never draft/held content.
- The anon role can never **write** to any knowledge-base table.
- Entity enrichment during ingestion must **never** break or abort the existing news insert.
- A hallucinated/low-quality explainer must never reach `status='published'`.

**Review for these specifically (ranked by what I'm most worried about):**

1. **Security / RLS (highest priority).**
   - In the migration: do the RLS policies actually prevent anon from reading `held`/`draft`/`unpublished` explainers and digests, and from reading `hidden` entities? Is there any read path that leaks unpublished content to the public client?
   - The `kb_upsert_entity_mention` function is `SECURITY DEFINER`. Is that a privilege-escalation risk? Are the `revoke … from public, anon, authenticated` + `grant … to service_role` correct and sufficient? Is `set search_path = public` enough to prevent search-path hijacking?
   - Can anon INSERT/UPDATE/DELETE any new table (no write policy = blocked under RLS — confirm there's genuinely no permissive policy and RLS is enabled on all five tables)?

2. **Ingestion robustness (`api/news/fetch`).**
   - The entity/archive enrichment is wrapped in try/catch — can anything still throw and abort the news insert, the per-item loop, or the whole cron? Trace failure modes (RPC error, FK violation, network).
   - The response parser: the new `SUMMARY:` regex must stop before the `ENTITIES:` line so the JSON never leaks into the summary. Check edge cases: no ENTITIES line, malformed/truncated JSON, multi-line summary, entities array containing `]` in a name.
   - `mirrorToArchive`: it does insert-or-ignore on `source_url` then re-selects the id. Is the returned `archiveId` always correct — including when the URL was archived before under a different id (news_items rotates every 48h, archive does not)? Any race under `INSERT_CONCURRENCY = 4`?

3. **Generation gating (`api/knowledge/generate`).**
   - Trace every path to `status='published'`. Can a hallucinated or empty-ish explainer slip through? The gate is: 3 core sections pass `isBadExplainerSection` AND a self-critique score ≥ 70. Is the self-critique meaningfully protective, or trivially gamed/bypassed (e.g., critique LLM call fails → score 0 → held; is that right)?
   - The "needs regeneration when stale" logic uses `last_mentioned_at > explainer.updated_at`. Can this loop forever, thrash, or never converge? Do seeds (which may have null `last_mentioned_at`) generate exactly once?
   - `maxDuration = 300s`, batch 40, 2 LLM calls/entity at concurrency 4 (~7s/call). Realistic, or will it time out mid-batch and leave partial state? Are partial writes safe?

4. **Data integrity.**
   - `entity_mentions.story_id` references `story_archive` (durable), not `news_items` (rotated). Confirm nothing links to `news_items` — if it did, every concept page goes empty in 48h.
   - `canonicalize`/`slugify` (entities.ts): empty-slug handling, collisions, and the alias-merge in the RPC — any way to corrupt the graph or create duplicate entities for the same concept?

5. **Next.js / SEO correctness.**
   - `/learn/[slug]`: `generateStaticParams` returns 15 seeds, `dynamicParams = true`, `revalidate = 3600`. Is the ISR setup correct for Next 16? Thin pages are set `robots: noindex` until a published explainer exists — is the logic right? Any `notFound()` path that wrongly 404s a valid page (or vice-versa)?
   - The sitemap reads `story_archive` and only `published` learn-type entities — could it ever list a URL that 404s?
   - Any server/client boundary mistakes, or secrets (service-role key) at risk of reaching the client bundle?

**Output format.** Group findings by severity: **Critical / High / Medium / Low**. For each: the file + function (or line), the concrete failure scenario, and a specific fix. End with a one-line verdict: is this safe to deploy as-is, or are there blockers? Don't invent issues to pad the list — if a section is solid, say "no issues found" and move on.

## FILES TO PASTE (current contents from the repo)

Paste each of these below the prompt, labeled with its path:

- `supabase/migrations/0001_knowledge_base.sql`  ← the security boundary (RLS + RPC); review most carefully
- `src/app/api/knowledge/generate/route.ts`       ← generation gating
- `src/app/api/news/fetch/route.ts`               ← ingestion enrichment (entity extraction, mirrorToArchive, linkEntities, processOne, parseClassifyResponse)
- `src/lib/entities.ts`                           ← canonicalize / slugify / parseExtractedEntities
- `src/lib/quality.ts`                            ← isBadSummary / isBadExplainerSection
- `src/lib/knowledge.ts`                          ← anon-role reads (optional but useful for the RLS check)

---

*When Gemini replies, paste its findings back to Claude — I'll triage what's real, fix the genuine issues, and dismiss false positives with reasons.*
