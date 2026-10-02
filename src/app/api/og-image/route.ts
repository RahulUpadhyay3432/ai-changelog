import type { NextRequest } from "next/server";
import { fetchPageMeta } from "@/lib/page-meta";
import { isSafePublicUrl } from "@/lib/url-guard";

// Same-origin tool-image proxy. Given a tool's site URL, resolve a cover image
// without the client ever beaconing the tool host directly (DPDP):
//   1. Product Hunt post URLs → thumbnail from PH GraphQL API (PH listing pages
//      are Cloudflare-protected and can't be scraped server-side)
//   2. the site's og:image / twitter:image (via fetchPageMeta) — best quality
//   3. a live homepage screenshot — ONLY when a no-watermark provider is
//      configured via SCREENSHOT_URL_TEMPLATE (e.g. urlbox/thum.io paid). Free
//      screenshot tiers stamp "image not authorized" watermarks, which look
//      broken, so without a key we skip straight to the gradient.
//   4. 404 — the client <img> onError swaps in the category-gradient cover
// SSRF-guarded (isSafePublicUrl), responses cached a week.
export const runtime = "nodejs";

const WEEK = "public, max-age=604800";
const PH_GRAPHQL = "https://api.producthunt.com/v2/api/graphql";

/**
 * 302 to an image URL, but only to one that passes the SSRF guard.
 *
 * Every target here is attacker-influenceable: `og:image` comes from a
 * third-party page, and the PH thumbnail from an API response. Redirecting to
 * them unchecked turned this route into an open redirect on the kapyn.app
 * origin (a phishing primitive: the link genuinely is our domain) as well as an
 * internal-network probe. Validating inside the helper covers all call sites,
 * including ones added later.
 */
function redirect(location: string): Response {
  if (!isSafePublicUrl(location)) return empty();
  return new Response(null, { status: 302, headers: { Location: location, "Cache-Control": WEEK } });
}

// 404, deliberately, not 204. A 204 is a SUCCESSFUL response with no body, so
// the browser does not fire `error` on the <img> that requested it: it just
// paints its own broken-image icon and leaves it there. That is what put a
// permanent broken marker inside the 340px hero on tool pages. An error status
// fires onError, which is what the gradient fallback has always been waiting for.
function empty(): Response {
  return new Response(null, { status: 404, headers: { "Cache-Control": "public, max-age=86400" } });
}

// Extract the PH post slug from a producthunt.com/posts/... URL.
function phSlug(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("producthunt.com")) return null;
    const m = u.pathname.match(/^\/posts\/([^/?#]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url || !isSafePublicUrl(url)) return empty();

  // 1. Product Hunt listing pages are Cloudflare-protected — scraping them
  //    server-side always fails. Instead call the PH GraphQL API directly with
  //    the post slug to get the product thumbnail.
  const slug = phSlug(url);
  if (slug) {
    const token = process.env.PRODUCT_HUNT_TOKEN;
    if (token) {
      try {
        const res = await fetch(PH_GRAPHQL, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query { post(slug: "${slug}") { thumbnail { url } } }`,
          }),
          signal: AbortSignal.timeout(5000),
        });
        const json = (await res.json()) as { data?: { post?: { thumbnail?: { url?: string } } } };
        const thumb = json?.data?.post?.thumbnail?.url;
        if (thumb) return redirect(thumb);
      } catch {
        /* fall through to gradient */
      }
    }
    // PH URLs have no useful OG image server-side — skip straight to gradient.
    return empty();
  }

  // 2. Prefer the site's own OG image.
  try {
    const meta = await fetchPageMeta(url);
    if (meta.imageUrl) return redirect(meta.imageUrl);
  } catch {
    /* fall through */
  }

  // 2. Optional screenshot provider (no-watermark, key-gated). {url} is replaced
  //    with the encoded target. Unset by default → clean gradient fallback.
  const tmpl = process.env.SCREENSHOT_URL_TEMPLATE;
  if (tmpl) {
    try {
      return redirect(tmpl.replace("{url}", encodeURIComponent(new URL(url).toString())));
    } catch {
      /* fall through */
    }
  }

  // 3. No image → 204 → category-gradient cover.
  return empty();
}
