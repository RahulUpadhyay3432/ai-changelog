-- ============================================================================
-- Migration 0008 — radar_hackathons (aggregated AI/tech hackathon listings)
-- ----------------------------------------------------------------------------
-- We aggregate hackathons from public sources (Devpost now; Luma / MLH / etc.
-- later) and store the full details + the registration URL, so the listing
-- lives in-app and only sends users out when they tap Register. Refreshed by
-- the /api/radar/hackathons cron; durable across runs via (source, external_id).
--
-- Run once in the Supabase SQL editor. Idempotent.
-- ============================================================================

create table if not exists public.radar_hackathons (
  id            uuid primary key default gen_random_uuid(),
  source        text not null,                 -- 'devpost' | 'luma' | ...
  external_id   text not null,                 -- source's id (dedup key)
  title         text not null,
  url           text not null,                 -- detail / registration page
  image_url     text,
  dates         text,                          -- human string, e.g. "Jun 01 - Jul 15, 2026"
  prize         text,                          -- e.g. "$10,000"
  location      text,                          -- "Online" / "San Francisco, CA"
  is_online     boolean not null default false,
  themes        text[] not null default '{}',
  participants  int,                           -- registrations count
  open_state    text,                          -- 'open' | 'upcoming' | 'ended'
  organization  text,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  unique (source, external_id)
);

create index if not exists radar_hackathons_participants_idx
  on public.radar_hackathons (participants desc);

-- RLS: anon read (the public radar reads it), service-role write (the cron).
alter table public.radar_hackathons enable row level security;
drop policy if exists radar_hackathons_anon_read on public.radar_hackathons;
create policy radar_hackathons_anon_read on public.radar_hackathons for select to anon using (true);
