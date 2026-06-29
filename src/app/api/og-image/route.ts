import type { NextRequest } from "next/server";
import { fetchPageMeta } from "@/lib/page-meta";
import { isSafePublicUrl } from "@/lib/url-guard";

// Same-origin tool-image proxy. Given a tool's site URL, resolve a cover image
// without the client ever beaconing the tool host directly (DPDP):
//   1. the site's og:image / twitter:image (via fetchPageMeta) — best quality
//   2. a live homepage screenshot — ONLY when a no-watermark provider is
//      configured via SCREENSHOT_URL_TEMPLATE (e.g. urlbox/thum.io paid). Free
//      screenshot tiers stamp "image not authorized" watermarks, which look
//      broken, so without a key we skip straight to the gradient.
//   3. 204 — the client <img> onError shows the clean category-gradient cover
// SSRF-guarded (isSafePublicUrl), responses cached a week.
export const runtime = "nodejs";

const WEEK = "public, max-age=604800";

function redirect(location: string): Response {
  return new Response(null, { status: 302, headers: { Location: location, "Cache-Control": WEEK } });
}

function empty(): Response {
  return new Response(null, { status: 204, headers: { "Cache-Control": "public, max-age=86400" } });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url || !isSafePublicUrl(url)) return empty();

  // 1. Prefer the site's own OG image.
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
