// ─── Blog reading palette ────────────────────────────────────────────────────
// A higher-contrast, warm reading ramp scoped to the blog — separate from the
// app-wide TEXT tokens so the article reads well without changing the rest of
// the product. Mirrored as CSS variables in blog.module.css; these constants are
// for the inline-styled parts of the article page (byline, CTA, related, rails).
// Named generically so a future light theme can swap the values behind them.

export const READING = {
  canvas: "#100f0d", // warm near-black page surface (not pure black)
  ink: "#e4dfd4", // body text — brighter, higher contrast than the app body grey
  inkLead: "#f3efe7", // lead paragraph
  heading: "#fbfaf7", // headings
  muted: "#9e988c", // meta / secondary
  accent: "#5b9bff", // brighter blue link/accent for dark contrast
  hairline: "rgba(255,255,255,0.10)",
  surface: "rgba(255,255,255,0.025)", // cards / rails
} as const;
