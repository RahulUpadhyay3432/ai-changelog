-- ============================================================================
-- Migration 0004 — radar_tools (structured tool sources: GitHub + Product Hunt)
-- ----------------------------------------------------------------------------
-- These sources are curated lists of actual tools, each with the maker's OWN
-- description. That description IS the value-line — no LLM, no extraction, no
-- drift (the failure mode of pulling tools out of news stories). Refreshed each
-- run; durable across runs via the (source, external_id) upsert key.
--
-- Run once in the Supabase SQL editor. Idempotent.
-- ============================================================================

create table if not exists public.radar_tools (
  id            uuid primary key default gen_random_uuid(),
  source        text not null check (source in ('github','producthunt')),
  external_id   text not null,                 -- repo full_name or PH launch url (dedup key)
  name          text not null,
  value_line    text not null,                 -- the maker's own description/tagline
  url           text not null,
  meta          text,                           -- "1.2k stars · Python" / "340 upvotes"
  score         int not null default 0,         -- stars (GitHub) or upvotes (PH) — traction sort
  topics        text[] not null default '{}',
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  unique (source, external_id)
);

create index if not exists radar_tools_seen_score_idx
  on public.radar_tools (last_seen_at desc, score desc);

-- RLS: anon read (the public radar reads it), service-role write (the cron).
alter table public.radar_tools enable row level security;
drop policy if exists radar_tools_anon_read on public.radar_tools;
create policy radar_tools_anon_read on public.radar_tools for select to anon using (true);
