import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  // No auth — every visitor is anonymous. "always" gives each a durable person
  // profile so returning-visitor retention is measurable cleanly (the default
  // "identified_only" never creates a profile without an identify() call).
  person_profiles: "always",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});

// ─── Personal opt-out ────────────────────────────────────────────────────────
// Kapyn has no auth, so there is no account to mark "internal". Founder/device
// traffic was inflating every metric (382 Bengaluru visitors -> 2,905 views).
//
// posthog-js persists opt-out itself (localStorage + cookie, keyed by token), so
// visiting the URL once silences that browser permanently — including the
// installed PWA, which shares the same storage.
//
//   kapyn.app/?ph=off   stop sending events from this device
//   kapyn.app/?ph=on    start again
//
// Profile has a visible toggle for the same thing; this exists so you can also
// silence a phone or a fresh browser without hunting for the setting.
try {
  const ph = new URLSearchParams(window.location.search).get("ph");
  if (ph === "off") posthog.opt_out_capturing();
  if (ph === "on") posthog.opt_in_capturing();
} catch {
  // Non-browser or blocked storage — nothing to do.
}
