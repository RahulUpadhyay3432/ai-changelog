/**
 * The one place the canonical origin is declared.
 *
 * It used to be a `const APP_URL = "https://kapyn.app"` copy-pasted into 27
 * files, which is how the host could drift out of agreement with the Vercel
 * domain config without anyone noticing: every sitemap entry and canonical tag
 * pointed at the apex while the edge redirected to www. One export, one truth.
 *
 * Canonical host is the APEX (no www) — www.kapyn.app redirects here.
 */
export const APP_URL = "https://kapyn.app";

/**
 * Kapyn's official social profiles.
 *
 * One list, two consumers: the `sameAs` array on the Organization JSON-LD in
 * src/app/layout.tsx (which is how Google ties these accounts to the brand
 * entity) and the footer icon row in src/components/layout/SocialRow.tsx.
 * Keeping them together means a new account cannot be added to the footer and
 * silently left out of the structured data.
 */
export const SOCIAL_PROFILES = [
  { name: "Instagram", url: "https://www.instagram.com/kapyn.app/" },
  { name: "X", url: "https://x.com/kapynapp" },
  { name: "Facebook", url: "https://www.facebook.com/profile.php?id=61591150865674" },
] as const;

export const SOCIAL_URLS: string[] = SOCIAL_PROFILES.map((p) => p.url);
