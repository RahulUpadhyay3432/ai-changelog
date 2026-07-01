// ─── Blog reading palette ────────────────────────────────────────────────────
// A higher-contrast, warm reading ramp scoped to the blog — separate from the
// app-wide TEXT tokens so the article reads well without changing the rest of
// the product. Mirrored as CSS variables in blog.module.css; these constants are
// for the inline-styled parts of the article page (byline, CTA, related, rails).
// Named generically so a future light theme can swap the values behind them.

// CSS vars (dark fallbacks) so the blog flips with the (web) light theme.
export const READING = {
  canvas: "var(--kt-web-bg, #100f0d)", // warm page surface
  ink: "var(--kt-read-ink, #e4dfd4)", // body text
  inkLead: "var(--kt-read-lead, #f3efe7)", // lead paragraph
  heading: "var(--kt-read-heading, #fbfaf7)", // headings
  muted: "var(--kt-read-muted, #9e988c)", // meta / secondary
  accent: "var(--kt-read-accent, #5b9bff)", // link/accent
  hairline: "var(--kt-read-hairline, rgba(255,255,255,0.10))",
  surface: "var(--kt-read-surface, rgba(255,255,255,0.025))", // cards / rails
} as const;
