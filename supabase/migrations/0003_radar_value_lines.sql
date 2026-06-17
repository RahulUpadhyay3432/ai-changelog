-- ============================================================================
-- Migration 0003 — radar value-line cache on entities
-- ----------------------------------------------------------------------------
-- Stores the generated "what this lets you do" line per entity, generated ONCE
-- (during ingestion) and served from here forever — no per-view LLM cost.
--
--   value_line          the actionable one-liner (NULL = held back / not useful)
--   value_line_story_id  which story it was generated from (regenerate if the
--                        entity's best story changes)
--   value_line_at        when it was last evaluated (NULL = never tried).
--                        A NULL value_line WITH a value_line_at = "evaluated,
--                        held back" → don't retry until the story changes.
--
-- Run once in the Supabase SQL editor. Idempotent.
-- ============================================================================

alter table public.entities
  add column if not exists value_line          text,
  add column if not exists value_line_story_id uuid,
  add column if not exists value_line_at        timestamptz;
