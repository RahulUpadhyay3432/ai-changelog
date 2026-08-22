import Link from "next/link";
import { unstable_cache } from "next/cache";
import { getRadarTools } from "@/lib/knowledge";
import { getTrending } from "@/lib/trending";
import { QRCodeBlock } from "@/components/landing/QRCodeBlock";
import { GOLD, SURFACE, HAIRLINE, TEXT, SG } from "@/lib/design-tokens";

// Desktop-only right rail: live "On the Radar today" + "Trending now", replacing
// the old QR "best on mobile" panel. Data is cached for 30 min so it doesn't
// re-query Supabase on every app navigation (the layout wraps all app routes).
const loadPanel = unstable_cache(
  async () => {
    const [tools, trending] = await Promise.all([
      getRadarTools(6).catch(() => []),
      getTrending(36, 3, 0).catch(() => ({ top: [], rest: [] })),
    ]);
    return { tools: tools.slice(0, 5), stories: trending.top.slice(0, 3) };
  },
  ["app-rail-panel-v1"],
  { revalidate: 1800 }
);

function faviconFor(url: string): string | null {
  try {
    return `/api/favicon?domain=${encodeURIComponent(new URL(url).hostname.replace(/^www\./, ""))}`;
  } catch {
    return null;
  }
}

function Kicker({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", ...style }}>
      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
      <span style={{ fontFamily: SG, fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: TEXT.muted }}>{children}</span>
    </div>
  );
}

export async function RadarRailPanel() {
  const { tools, stories } = await loadPanel();

  return (
    <>
      <Kicker>On the Radar today</Kicker>
      <div style={{ margin: "6px 0 0" }}>
        {tools.length === 0 ? (
          <p style={{ fontSize: "13px", color: TEXT.muted, padding: "10px 4px" }}>Catalog refreshing, check back shortly.</p>
        ) : (
          tools.map((t) => {
            const fav = faviconFor(t.url);
            return (
              <a key={t.url} href={t.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: "11px", alignItems: "center", padding: "11px 4px", borderBottom: `1px solid ${HAIRLINE}`, textDecoration: "none" }}>
                <span style={{ flexShrink: 0, width: "34px", height: "34px", borderRadius: "9px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {fav ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fav} alt="" width={22} height={22} loading="lazy" style={{ display: "block" }} />
                  ) : null}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "block", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: TEXT.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
                  <span style={{ display: "block", fontSize: "12px", color: TEXT.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.valueLine}</span>
                </span>
                {t.meta && <span style={{ fontSize: "11px", color: TEXT.muted, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{t.meta}</span>}
              </a>
            );
          })
        )}
      </div>

      <Kicker style={{ marginTop: "22px" }}>Trending now</Kicker>
      <div style={{ margin: "6px 0 0" }}>
        {stories.length === 0 ? (
          <p style={{ fontSize: "13px", color: TEXT.muted, padding: "10px 4px" }}>No trending stories yet.</p>
        ) : (
          stories.map((s, i) => (
            <Link key={s.id} href={`/story/${s.id}`} style={{ display: "flex", gap: "11px", alignItems: "flex-start", padding: "10px 4px", borderBottom: `1px solid ${HAIRLINE}`, textDecoration: "none" }}>
              <span style={{ fontFamily: SG, fontSize: "13px", fontWeight: 700, color: GOLD, flexShrink: 0, width: "16px" }}>{i + 1}</span>
              <span style={{ fontSize: "13px", color: TEXT.body, lineHeight: 1.4 }}>{s.title}</span>
            </Link>
          ))
        )}
      </div>

      <div style={{ marginTop: "auto", display: "flex", gap: "13px", alignItems: "center", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "14px", padding: "14px" }}>
        <div style={{ flexShrink: 0, width: "50px", height: "50px", background: "#fff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <div style={{ transform: "scale(0.36)" }}>
            <QRCodeBlock />
          </div>
        </div>
        <div>
          <div style={{ fontFamily: SG, fontSize: "13.5px", fontWeight: 600, color: TEXT.primary }}>Get the 30-second daily</div>
          <div style={{ fontSize: "12px", color: TEXT.muted, marginTop: "3px", lineHeight: 1.4 }}>Scan to add Kapyn to your phone.</div>
        </div>
      </div>
    </>
  );
}
