import { ImageResponse } from "next/og";
import { getCategoryBySlug } from "@/lib/categories";
import { fetchNewsItemById } from "@/lib/supabase";
import { isSafePublicUrl } from "@/lib/url-guard";

// ─── Instagram story card ────────────────────────────────────────────────────
// /api/share-card?format=ig&id=<story uuid> → a ready-to-post 1080x1350 (4:5)
// PNG in the decided "Carousel Grid" layout: photo top, kapyn wordmark,
// category eyebrow, headline, a 2-line dek (the summary's first sentence) and a
// "Read more" pill. All text is rendered here, never drawn by an image model.
// The dek is the stored summary, so a human still checks it against the source
// before posting.

const W = 1080;
const H = 1350;
const PHOTO_H = 770;
const MAX_REDIRECTS = 3;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Fetch the story photo as a data URL. Satori renders PNG and JPEG only, so
 *  anything else (WebP, SVG, timeouts, unsafe hosts) returns null and the card
 *  falls back to a category gradient. Same every-hop SSRF check as fetchPageMeta. */
async function loadPhoto(url?: string): Promise<{ src: string; logo: boolean } | null> {
  if (!url || !isSafePublicUrl(url)) return null;
  try {
    const signal = AbortSignal.timeout(4000);
    let target = url;
    let res: Response | null = null;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      res = await fetch(target, { signal, redirect: "manual", headers: { "User-Agent": "Mozilla/5.0 (compatible; KapynBot/1.0; +https://kapyn.app)" } });
      if (res.status < 300 || res.status >= 400) break;
      const loc = res.headers.get("location");
      if (!loc) break;
      const next = new URL(loc, target).toString();
      if (!isSafePublicUrl(next)) return null;
      target = next;
      res = null;
    }
    const type = (res?.headers.get("content-type") ?? "").split(";")[0].trim();
    if (!res || !res.ok || !/^image\/(png|jpe?g)$/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 4_000_000) return null;
    // Product Hunt thumbnails and similar are small logos; cropping them to
    // fill a 1080px-wide photo band looks broken, so they are framed instead.
    return { src: `data:${type};base64,${buf.toString("base64")}`, logo: buf.length < 30_000 };
  } catch {
    return null;
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#039;/g, "'")
    .replace(/&amp;/g, "&");
}

function firstSentence(summary: string): string {
  return summary.trim().split(/(?<=[.!?])\s+/)[0] ?? summary;
}

export async function igCard(id: string | null): Promise<Response> {
  if (!id || !UUID.test(id)) return Response.json({ error: "id must be a story uuid" }, { status: 400 });
  const story = await fetchNewsItemById(id);
  if (!story) return Response.json({ error: "story not found" }, { status: 404 });

  const cat = getCategoryBySlug(story.categorySlug);
  const accent = cat?.colorAccent ?? "#2563eb";
  const bg = cat?.colorBg ?? "#0d1f3c";
  const label = cat?.colorLabel ?? "#60a5fa";
  const title = decodeEntities(story.title);
  const dek = decodeEntities(firstSentence(story.summary));
  const photo = await loadPhoto(story.imageUrl);

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", flexDirection: "column", position: "relative", background: "#0a0a0a", fontFamily: "sans-serif", overflow: "hidden" }}>
        {/* Photo band, or a category gradient when there is no usable photo */}
        <div
          style={{
            position: "absolute", top: 0, left: 0, width: W, height: PHOTO_H, display: "flex",
            alignItems: "center", justifyContent: "center",
            background: photo ? bg : `radial-gradient(circle at 72% 28%, ${accent}66, ${bg} 55%, #0a0a0a)`,
          }}
        >
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.src}
              alt=""
              width={photo.logo ? 300 : W}
              height={photo.logo ? 300 : PHOTO_H}
              style={photo.logo ? { objectFit: "contain", borderRadius: 48 } : { objectFit: "cover" }}
            />
          )}
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, width: W, height: 220, display: "flex", backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0))" }} />
        <div style={{ position: "absolute", top: 470, left: 0, width: W, height: 302, display: "flex", backgroundImage: "linear-gradient(rgba(10,10,10,0), #0a0a0a)" }} />

        <div style={{ position: "absolute", top: 50, left: 64, display: "flex", fontSize: 56, fontWeight: 700, letterSpacing: "-0.03em", color: "#f5f5f5" }}>
          kapyn
        </div>

        {/* Text block, anchored to the footer so short headlines leave more photo */}
        <div style={{ position: "absolute", left: 64, right: 64, top: 600, bottom: 176, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", alignSelf: "flex-start", fontSize: 24, fontWeight: 700, letterSpacing: "0.14em", padding: "10px 22px", borderRadius: 999, color: label, background: bg, border: `1px solid ${accent}88`, marginBottom: 28 }}>
            {(cat?.name ?? "AI news").toUpperCase()}
          </div>
          <div style={{ display: "block", fontSize: 62, lineHeight: 1.08, fontWeight: 700, letterSpacing: "-0.025em", color: "#E8E4DE", lineClamp: 3 }}>
            {title}
          </div>
          <div style={{ display: "block", marginTop: 24, fontSize: 34, lineHeight: 1.36, color: "#b9b3aa", lineClamp: 2 }}>
            {dek}
          </div>
        </div>

        <div style={{ position: "absolute", left: 64, right: 64, bottom: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 600, color: "#0a0a0a", background: "#f5f5f5", padding: "16px 30px", borderRadius: 999 }}>
            Read more at kapyn.app ↗
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#8a857e" }}>via {story.sourceName}</div>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
