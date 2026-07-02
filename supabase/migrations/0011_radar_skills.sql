-- ============================================================================
-- Migration 0011 — radar_skills (AI skills directory: curated + official-discovered)
-- ----------------------------------------------------------------------------
-- Mirrors radar_mcp. Two layers, same table:
--   featured   — the curated AI_SKILLS editorial list (src/lib/radar-skills.ts):
--                Claude Skills + custom GPTs + Gemini Gems, list order (sort_rank).
--   discovered — official Anthropic Agent Skills auto-pulled from the
--                github.com/anthropics/skills repo (real name+description from
--                each SKILL.md frontmatter). We do NOT mirror the 2M-file
--                marketplace long tail — curated + official only.
-- The cron (/api/radar/skills) refreshes rows; the page reads this table and
-- falls back to the static curated list if it's empty (e.g. before this runs).
--
-- Run once in the Supabase SQL editor. Idempotent.
-- ============================================================================

create table if not exists public.radar_skills (
  id            uuid primary key default gen_random_uuid(),
  source        text not null check (source in ('curated','official')),
  external_id   text not null,                 -- curated slug or "anthropic/<skill>" (dedup key)
  name          text not null,
  tagline       text not null,                 -- one-line value
  description   text,                           -- 2-3 sentence detail body
  category      text not null,                 -- SkillCategory string (radar-skills.ts)
  platform      text not null default 'Claude' check (platform in ('Claude','GPT','Gemini','Multi')),
  url           text not null,
  kind          text not null default 'featured' check (kind in ('featured','discovered')),
  sort_rank     int not null default 0,         -- featured: list order; discovered: 0
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  unique (source, external_id)
);

create index if not exists radar_skills_kind_rank_idx
  on public.radar_skills (kind, sort_rank);

-- RLS: anon read (the public catalog reads it), service-role write (the cron).
alter table public.radar_skills enable row level security;
drop policy if exists radar_skills_anon_read on public.radar_skills;
create policy radar_skills_anon_read on public.radar_skills for select to anon using (true);
