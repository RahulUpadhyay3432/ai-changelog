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
