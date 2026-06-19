import type { NextRequest } from "next/server";

// Same-origin logo proxy. The client never beacons a tool/product hostname to a
// third party (DPDP) — it asks us, and we fetch the icon server-side, cached.
//   ?domain=<host>   → the site's icon via DuckDuckGo (privacy-friendly, no Google)
//   ?github=<owner>  → the GitHub org/user avatar
// Only those two upstreams are ever contacted, and inputs are validated, so the
// route can't be turned into an open SSRF proxy.
export const runtime = "nodejs";

const HOST_RE = /^[a-z0-9.-]{1,253}$/i; // a plain hostname, no scheme/path/port
const OWNER_RE = /^[a-z0-9-]{1,39}$/i; // GitHub login charset

// 1×1 transparent GIF — returned (200) when the upstream has no icon, so the
// client <img> still loads "successfully" but onError-style fallbacks can also
// key off the tiny size if needed. We use 204 instead to trigger onError.
function empty(): Response {
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}

async function proxy(upstream: string): Promise<Response> {
  try {
    const res = await fetch(upstream, {
      headers: { Accept: "image/*" },
      next: { revalidate: 604800 }, // a week — logos rarely change
    });
    if (!res.ok || !res.body) return empty();
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return empty();
    return new Response(res.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch {
    return empty();
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");
  const github = searchParams.get("github");

  if (github && OWNER_RE.test(github)) {
    return proxy(`https://github.com/${github}.png?size=80`);
  }
  if (domain && HOST_RE.test(domain)) {
    return proxy(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  }
  return empty();
}
