// ─── Brand copy: the single source for how Kapyn describes itself ────────────
//
// Before this file the product shipped seven different self-descriptions at once
// (the root title said "the calm signal layer for AI", the homepage H1 said "the
// calm map", the manifest said "the calm intelligence layer", and the OG images
// said "What happened in AI today"). Anything user-facing that names what Kapyn
// IS imports from here, so the drift can't come back one file at a time.
//
// The settled hierarchy (docs/PROJECT-STATUS.md, "do not relitigate"):
// Kapyn is the calm map of the AI worth using. The Radar is discovery; the
// 30-second brief is the live signal feeding it. Discovery first, news second.
//
// House style: no em dashes in shipped copy, and no space before punctuation
// either (a past sweep turned "—" into " ," across the codebase). Use a colon,
// a bracket or a shorter sentence instead.

/** The brand line. Short enough for a sidebar, an H1 or a footer. */
export const TAGLINE = "The calm map of the AI worth using";

/** Title tag default. Leads with the name, since brand search is the weak spot. */
export const TITLE_DEFAULT = "Kapyn: the calm map of the AI worth using";

/** One-sentence product description: metadata, OG, Twitter. */
export const DESCRIPTION =
  "The calm map of the AI worth using: agents, models, tools, MCP servers and skills. Curated, kept current by a daily signal, never behind a paywall.";

/** The same claim without the promise clause, for schema.org and the manifest. */
export const DESCRIPTION_SHORT =
  "The calm map of the AI worth using: agents, models, tools, MCP servers and skills.";

/** What the app is, for the WebApplication entity. Describes both surfaces. */
export const APP_DESCRIPTION =
  "A curated map of the AI worth using (agents, models, tools, MCP servers and skills), plus a 30-second daily brief on what changed.";

/** Sitewide OG image: the line under the headline. */
export const OG_SUBLINE = "Agents, models, tools, MCP servers and skills. Curated.";

/**
 * Story OG image eyebrow. A story card is the brief, not the whole product, so
 * it names the brief rather than claiming Kapyn is a news app.
 */
export const OG_STORY_EYEBROW = "The 30-second AI brief";
