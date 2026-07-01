// ─── Kapyn brand tokens — single source of truth ────────────────────────────
// Plain constants (no React, no "use client") so BOTH server components (the
// /home landing) and client components (radar) can import them. radar-shared.tsx
// re-exports these so every existing radar import keeps working unchanged.
// One palette, one place → the landing and Radar can never drift apart.

// Brand accent — currently BLUE (#3b82f6). The export is still named GOLD to
// avoid a repo-wide rename across ~110 call sites; it's simply "the brand accent"
// token. To change the brand colour, edit these three lines (+ the mirrored CSS
// vars in home/landing.module.css) — everything propagates from here.
export const GOLD = "#3b82f6"; // brand accent / wayfinding ONLY — never a data or content signal
export const GOLD_SOFT = "rgba(59,130,246,0.12)";
export const GOLD_BORDER = "rgba(59,130,246,0.28)";
export const SG = "var(--font-space-grotesk), -apple-system, sans-serif";

// Warm surface ramp — lifted off pure-black so the eye has somewhere to rest.
// Cards sit clearly above the canvas; raised rows sit above the cards.
export const CANVAS = "#0c0b0a"; // app canvas (warm near-black, not pure #0a0a0a)
export const SURFACE = "#1b1a17"; // card surface — visibly above canvas
export const SURFACE_RAISED = "#24221d"; // elevated rows / hovered cards
export const HAIRLINE = "rgba(255,255,255,0.09)"; // white-alpha only, never colored
export const INNER_HIGHLIGHT = "inset 0 1px 0 rgba(255,255,255,0.08)";

// Warm text ramp — the only greys used on dark.
export const TEXT = {
  primary: "#f6f4f0",
  body: "#d6d2ca", // was #cbc7bf — a touch more presence for body copy
  muted: "#bcb7ad", // was #a29d94 — stronger secondary text for readability on near-black
} as const;
