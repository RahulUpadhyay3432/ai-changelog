import { getLearnEntities } from "@/lib/knowledge";

// /feed.xml — RSS for the knowledge base (concept explainers). Aids feed-reader
// discovery, syndication, and freshness signals. Mirrors the canonical domain
// used by the sitemap + page canonicals (kapyn.app, non-www).
export const revalidate = 3600;

const APP_URL = "https://kapyn.app";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const entities = await getLearnEntities(60);
  const now = new Date().toUTCString();

  const items = entities
    .map((e) => {
      const link = `${APP_URL}/learn/${e.slug}`;
      const date = e.lastMentionedAt ? new Date(e.lastMentionedAt).toUTCString() : now;
      const desc = (e.shortDesc ?? "").trim();
      return `    <item>
      <title>${esc(e.canonicalName)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${date}</pubDate>
      <description>${esc(desc)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kapyn, AI Glossary</title>
    <link>${APP_URL}/explore</link>
    <atom:link href="${APP_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Plain-English, source-grounded explainers for the concepts shaping AI , from Kapyn.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
