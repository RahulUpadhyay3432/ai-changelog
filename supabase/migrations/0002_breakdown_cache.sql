-- ============================================================================
-- Migration 0002 — breakdown cache column on news_items
-- ----------------------------------------------------------------------------
-- Adds a nullable text column to store the AI-generated "Why it matters"
-- explanation per story. Once generated for any user, the result is served
-- from this column to every subsequent request — zero LLM cost on re-reads.
--
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Idempotent: IF NOT EXISTS makes it safe to re-run.
-- ============================================================================

alter table public.news_items
  add column if not exists breakdown text;
