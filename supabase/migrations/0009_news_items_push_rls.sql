-- ============================================================================
-- Migration 0009 — lock down news_items + push_subscriptions with RLS
-- ----------------------------------------------------------------------------
-- The browser reads Supabase directly with the PUBLIC anon key (it ships in the
-- client bundle by design). That's fine for public, read-only data — but only
-- if Row Level Security is actually on. The radar/KB tables already enforce
-- "anon read, service-role write" (migrations 0001/0004/0008). Two tables were
-- created by hand and never got that treatment:
--
--   news_items         — the main feed. Without RLS, anyone holding the anon key
--                        (i.e. anyone) could INSERT / UPDATE / DELETE stories.
--   push_subscriptions — holds endpoints (PII). The browser never touches this
--                        table directly (only the server /api/push/* routes do),
--                        so anon needs NO access at all.
--
-- After this:
--   news_items         → anon SELECT only; writes are service-role (the cron).
--   push_subscriptions → no anon access; reads/writes are service-role only.
--
-- ⚠️ PRECONDITION — set SUPABASE_SERVICE_ROLE_KEY in Vercel FIRST.
--    The ingestion (/api/news/fetch) and push (/api/push/*, /api/notify) routes
--    fall back to the anon key when that env var is missing. Service-role
--    bypasses RLS; anon will be blocked by it. So if the service-role key is not
--    set, enabling RLS here will stop the cron from writing news (feed goes
--    stale) and break push. Set the key, redeploy, THEN run this.
--
-- Run once in the Supabase SQL editor. Idempotent — safe to re-run.
-- ============================================================================

-- ── news_items: anon read-only ──────────────────────────────────────────────
do $$
begin
  if to_regclass('public.news_items') is not null then
    execute 'alter table public.news_items enable row level security';
    execute 'drop policy if exists news_items_anon_read on public.news_items';
    execute 'create policy news_items_anon_read on public.news_items for select to anon using (true)';
  end if;
end $$;

-- ── push_subscriptions: no anon access (service-role only) ───────────────────
-- RLS on with zero anon policies = anon is fully denied; service_role bypasses
-- RLS, so the server routes keep working. The endpoints (PII) stay unreadable
-- with the public key.
do $$
begin
  if to_regclass('public.push_subscriptions') is not null then
    execute 'alter table public.push_subscriptions enable row level security';
    -- Drop any permissive policy that may have been added by hand.
    execute 'drop policy if exists push_subscriptions_anon_read on public.push_subscriptions';
    execute 'drop policy if exists push_subscriptions_anon_all on public.push_subscriptions';
  end if;
end $$;
