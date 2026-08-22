import { isSafePublicUrl } from "@/lib/url-guard";

// Shared OG/Twitter meta fetcher — extracts an image, description, and title
// from a public page's <head>. Used by the news ingestion pipeline and the
// radar tools cron (to enrich Product Hunt launches with a real description).
// SSRF-guarded, real-UA, 5s timeout, reads at most 50KB of HTML.

export type PageMeta = { imageUrl: string | null; description: string | null; title: string | null };

const EMPTY: PageMeta = { imageUrl: null, description: null, title: null };

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ").trim();
}

function extractMeta(html: string, property: string, nameAttr = "property"): string | null {
  return (
    html.match(new RegExp(`<meta[^>]+${nameAttr}=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"))?.[1] ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${nameAttr}=["']${property}["']`, "i"))?.[1] ??
    null
  );
}

const MAX_REDIRECTS = 3;

export async function fetchPageMeta(url: string): Promise<PageMeta> {
  // SSRF guard: only fetch public http(s) URLs from third-party feed content —
  // never internal/private/loopback/link-local addresses.
  if (!url || !isSafePublicUrl(url)) return EMPTY;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    // Follow redirects MANUALLY, re-checking every hop. Guarding only the first
    // URL is not enough: a public page can 302 straight to 169.254.169.254, and
    // the platform fetch would follow it happily.
    let target = url;
    let res: Response | null = null;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      res = await fetch(target, {
        signal: controller.signal,
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
      });
      if (res.status < 300 || res.status >= 400) break;
      const loc = res.headers.get("location");
      if (!loc) break;
      // Relative Locations resolve against the current hop.
      const next = new URL(loc, target).toString();
      if (!isSafePublicUrl(next)) {
        clearTimeout(timer);
        return EMPTY;
      }
      target = next;
      res = null;
    }
    clearTimeout(timer);
    if (!res || !res.ok) return EMPTY;
    const reader = res.body?.getReader();
    if (!reader) return EMPTY;
    const decoder = new TextDecoder();
    let html = "";
    try {
      while (html.length < 51200) {
        const { value, done } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
      }
    } finally {
      reader.cancel();
    }
    const rawImageUrl =
      extractMeta(html, "og:image") ??
      extractMeta(html, "og:image:secure_url") ??
      extractMeta(html, "twitter:image", "name") ??
      extractMeta(html, "twitter:image:src", "name") ??
      null;
    // Resolve relative URLs to absolute
    let imageUrl: string | null = null;
    if (rawImageUrl) {
      try {
        imageUrl = new URL(rawImageUrl, url).href;
      } catch {
        imageUrl = rawImageUrl.startsWith("http") ? rawImageUrl : null;
      }
    }
    const description =
      extractMeta(html, "og:description") ?? extractMeta(html, "twitter:description", "name") ?? null;
    const titleRaw =
      extractMeta(html, "og:title") ?? extractMeta(html, "twitter:title", "name") ?? null;
    return {
      imageUrl,
      description: description ? decodeHTMLEntities(description) : null,
      title: titleRaw ? decodeHTMLEntities(titleRaw) : null,
    };
  } catch {
    return EMPTY;
  }
}
