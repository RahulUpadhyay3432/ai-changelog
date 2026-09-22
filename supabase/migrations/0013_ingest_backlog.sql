-- ============================================================================
-- Migration 0013 — ingest_backlog (HERMES failed-story summarisation backlog)
-- ----------------------------------------------------------------------------
-- When every LLM provider fails to classify+summarise a fresh story,
-- api/news/fetch used to just drop it. This table keeps those stories instead,
-- so HERMES (the always-on runtime on Rahul's laptop, see docs/PROJECT-STATUS.md
-- and the Kapyn<->HERMES connection plan) can pull one via
-- GET /api/hermes/tasks, summarise it with its own planner, and submit the
-- result back via POST /api/hermes/results. Kapyn validates before persisting
-- through the normal news_items insert path.
--
-- No anon policies at all: RLS on + zero policies = anon is fully denied.
-- Only the service-role key (used server-side by /api/news/fetch and
-- /api/hermes/*) can read/write this table.
--
-- Run once in the Supabase SQL editor. Idempotent — safe to re-run.
-- ============================================================================

create table if not exists public.ingest_backlog (
  id                uuid primary key default gen_random_uuid(),
  source_url        text not null unique,
  title             text not null,
  source_name       text not null,
  default_category  text not null,
  content           text not null,
  image_url         text,
  published_at      timestamptz not null,
  status            text not null default 'pending'
                       check (status in ('pending', 'done', 'rejected', 'expired', 'superseded')),
  vercel_failures   int not null default 1,
  hermes_attempts   int not null default 0,
  last_error        text,
  result            jsonb,
  news_item_id      uuid,
  is_test           boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists ingest_backlog_pending_idx
  on public.ingest_backlog (published_at desc)
  where status = 'pending';

alter table public.ingest_backlog enable row level security;
-- No anon policies — service-role only.
