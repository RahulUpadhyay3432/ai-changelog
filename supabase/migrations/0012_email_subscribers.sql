-- ============================================================================
-- Migration 0012 — email_subscribers (weekly digest opt-in)
-- ----------------------------------------------------------------------------
-- Personal data (email). Privacy-by-design: RLS allows anon INSERT (subscribe)
-- but NO anon SELECT (nobody can read the list from the browser — same rule the
-- feedback table should follow). The digest cron reads it with the service role.
-- Single opt-in + a per-row unsubscribe token for one-click, no-login removal.
--
-- Run once in the Supabase SQL editor. Idempotent.
-- ============================================================================

create table if not exists public.email_subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  unsubscribe_token text not null default gen_random_uuid()::text,
  source            text,                    -- where they signed up (e.g. 'pulse')
  confirmed         boolean not null default true,
  created_at        timestamptz not null default now(),
  unsubscribed_at   timestamptz
);

create index if not exists email_subscribers_active_idx
  on public.email_subscribers (created_at desc)
  where unsubscribed_at is null;

-- RLS: anon may INSERT (subscribe) only; anon may NOT SELECT/UPDATE/DELETE.
alter table public.email_subscribers enable row level security;
drop policy if exists email_subscribers_anon_insert on public.email_subscribers;
create policy email_subscribers_anon_insert on public.email_subscribers
  for insert to anon with check (true);
