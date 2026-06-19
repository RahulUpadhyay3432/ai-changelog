-- ============================================================================
-- Migration 0007 — radar_tools.image_url
-- ----------------------------------------------------------------------------
-- Product thumbnail for a tool (Product Hunt provides one per launch). The
-- radar uses it as the tool's logo in the detail sheet and cards. Populated on
-- the next /api/radar/tools run for Product Hunt rows.
--
-- Read path degrades gracefully if this hasn't run (knowledge.ts retries the
-- select without it), so the app code is safe to deploy first. The cron WRITE
-- needs the column — run this before the next refresh.
--
-- Run once in the Supabase SQL editor. Idempotent.
-- ============================================================================

alter table public.radar_tools
  add column if not exists image_url text;
