-- ============================================================================
-- Migration 0010 — radar_mcp (MCP server directory: curated + registry-discovered)
-- ----------------------------------------------------------------------------
-- Mirrors radar_tools. Two layers, same table:
--   featured   — the curated MCP_SERVERS editorial list (src/lib/radar-mcp.ts),
--                the guaranteed high-quality set, ordered by list order (sort_rank).
--   discovered — servers pulled from the official MCP Registry
--                (registry.modelcontextprotocol.io), quality-gated to ones with a
--                GitHub repo + a minimum star count, ranked by stars.
-- The cron (/api/radar/mcp) refreshes rows; the page reads this table and falls
-- back to the static curated list if it's empty (e.g. before this migration runs).
--
-- Run once in the Supabase SQL editor. Idempotent.
-- ============================================================================

create table if not exists public.radar_mcp (
  id            uuid primary key default gen_random_uuid(),
  source        text not null check (source in ('curated','registry')),
  external_id   text not null,                 -- github full_name, registry name, or curated slug (dedup key)
  name          text not null,
  tagline       text not null,                 -- one-line value
  description   text,                           -- 2-3 sentence detail body
  category      text not null,                 -- McpCategory string (radar-mcp.ts)
  url           text not null,
  by            text not null default 'community' check (by in ('official','community')),
  score         int not null default 0,         -- github stars — traction sort
  gh_created_at timestamptz,                    -- repo created date — "newest" sort
  kind          text not null default 'featured' check (kind in ('featured','discovered')),
  sort_rank     int not null default 0,         -- featured: list order; discovered: 0
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  unique (source, external_id)
);

create index if not exists radar_mcp_kind_score_idx
  on public.radar_mcp (kind, score desc);

-- RLS: anon read (the public radar reads it), service-role write (the cron).
alter table public.radar_mcp enable row level security;
drop policy if exists radar_mcp_anon_read on public.radar_mcp;
create policy radar_mcp_anon_read on public.radar_mcp for select to anon using (true);
