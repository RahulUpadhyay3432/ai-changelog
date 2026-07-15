// ── Feed window ──────────────────────────────────────────────────────────────
// Single source of truth for how long a story stays in the LIVE swipe feed.
// Ingestion deletes items older than this; the feed only reads within it.
// Widened from 48h → 7 days so people who open Kapyn a few days apart don't miss
// the week's important stories. (Every item is still archived to story_archive
// on ingest, so /story/[id] permalinks resolve forever regardless of this.)
// This is the only knob — change the number here to tune the whole window.

export const FEED_WINDOW_HOURS = 24 * 7; // 7 days
export const FEED_WINDOW_LABEL = "7 days"; // human-facing copy — keep in sync with the number above

export function feedCutoffISO(): string {
  return new Date(Date.now() - FEED_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
}
