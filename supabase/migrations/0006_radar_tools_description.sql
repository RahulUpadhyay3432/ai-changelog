-- ============================================================================
-- Migration 0006 — radar_tools.description
-- ----------------------------------------------------------------------------
-- The value_line is the short, punchy one-liner shown on cards and rows. Some
-- sources (Product Hunt especially) also ship a fuller description worth showing
-- in the detail sheet — the radar was rendering "one small line" otherwise.
-- This adds an optional longer body. Populated on the next /api/radar/tools run.
--
-- Read path degrades gracefully if this hasn't run yet (knowledge.ts retries the
-- select without `description`), so it's safe to deploy the app code first. But
-- the cron WRITE (upsert) needs this column — run this before the next refresh.
--
-- Run once in the Supabase SQL editor. Idempotent.
-- ============================================================================

alter table public.radar_tools
  add column if not exists description text;
