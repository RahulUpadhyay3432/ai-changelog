-- ============================================================================
-- Migration 0005 — radar_tools: Essentials layer
-- ----------------------------------------------------------------------------
-- Adds the "Essentials" layer (evergreen must-know tools) alongside the
-- existing "trending" (what's new) rows:
--   kind        'trending' (what's new) | 'essential' (the canon)
--   sort_rank   accessible-first ordering within Essentials (lower = first)
-- Also allows source='curated' for the hand-curated closed/commercial tools
-- that GitHub stars can't find (Cursor, ChatGPT, etc.).
--
-- Run once in the Supabase SQL editor. Idempotent.
-- ============================================================================

alter table public.radar_tools
  add column if not exists kind      text not null default 'trending',
  add column if not exists sort_rank int  not null default 0;

alter table public.radar_tools drop constraint if exists radar_tools_source_check;
alter table public.radar_tools
  add constraint radar_tools_source_check check (source in ('github','producthunt','curated'));

create index if not exists radar_tools_kind_idx
  on public.radar_tools (kind, sort_rank, score desc);
