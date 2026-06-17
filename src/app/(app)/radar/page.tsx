import { getRadarTools, getRadarCards, getRadarEssentials } from "@/lib/knowledge";
import type { RadarTool, RadarItem } from "@/lib/knowledge";

// Server-rendered browse surface — the radar reads the cached engine (entity
// value-lines + trending tools + essentials). ISR every 30 min.
export const revalidate = 1800;

// ─── Shared styles ───────────────────────────────────────────────────────────
const eyebrow: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#525252",
  margin: "0 0 2px",
  padding: "0 24px",
};
const subLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "#404040",
  margin: "0 0 10px",
  padding: "0 24px",
};
const panel: React.CSSProperties = {
  background: "#111111",
  borderTop: "1px solid rgba(255,255,255,0.04)",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

function Row({
  name,
  valueLine,
  meta,
  badge,
  href,
}: {
  name: string;
  valueLine: string;
  meta?: string | null;
  badge?: string | null;
  href?: string | null;
}) {
  const inner = (
    <>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px" }}>
        <span style={{ fontSize: "15px", fontWeight: 600, color: "#ededed", letterSpacing: "-0.01em" }}>
          {name}
        </span>
        {badge && (
          <span
            style={{
              flexShrink: 0,
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#737373",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "100px",
              padding: "2px 8px",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <p style={{ fontSize: "14px", color: "#9a9a9a", lineHeight: 1.5, margin: "4px 0 0" }}>{valueLine}</p>
      {meta && (
        <span style={{ display: "block", fontSize: "11px", color: "#525252", marginTop: "6px", fontVariantNumeric: "tabular-nums" }}>
          {meta}
        </span>
      )}
    </>
  );

  const rowStyle: React.CSSProperties = {
    display: "block",
    padding: "14px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    textDecoration: "none",
    color: "inherit",
  };

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={rowStyle} className="radar-row">
      {inner}
    </a>
  ) : (
    <div style={rowStyle}>{inner}</div>
  );
}

function Section({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "28px" }}>
      <p style={eyebrow}>{label}</p>
      <p style={subLabel}>{sub}</p>
      <div style={panel}>{children}</div>
    </section>
  );
}

function sourceBadge(t: RadarTool): string {
  return t.source === "github" ? "GitHub" : t.source === "producthunt" ? "Product Hunt" : "";
}

export default async function RadarPage() {
  const [tools, entities, essentials] = await Promise.all([
    getRadarTools(10),
    getRadarCards(21, 2, 12),
    getRadarEssentials(40),
  ]);

  const curated = essentials.filter((e) => e.source === "curated");
  const canon = essentials.filter((e) => e.source === "github").slice(0, 12);

  // Group curated essentials by category (meta), preserving accessible-first order.
  const catOrder: string[] = [];
  const byCat = new Map<string, RadarTool[]>();
  for (const e of curated) {
    const c = e.meta ?? "Other";
    if (!byCat.has(c)) {
      byCat.set(c, []);
      catOrder.push(c);
    }
    byCat.get(c)!.push(e);
  }

  return (
    <div
      className="scrollbar-none"
      style={{ height: "100%", overflowY: "auto", background: "#0a0a0a", paddingBottom: "24px" }}
    >
      {/* Header */}
      <div style={{ padding: "28px 24px 20px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#f5f5f5", margin: 0, letterSpacing: "-0.03em" }}>
          Radar
        </h1>
        <p style={{ fontSize: "13px", color: "#737373", margin: "4px 0 0", lineHeight: 1.5 }}>
          What is new, moving, and worth knowing in AI — filtered to what you can act on.
        </p>
      </div>

      {/* What's new — trending tools */}
      {tools.length > 0 && (
        <Section label="What's new" sub="Fresh launches from GitHub & Product Hunt">
          {tools.map((t) => (
            <Row key={`${t.source}-${t.url}`} name={t.name} valueLine={t.valueLine} badge={sourceBadge(t)} meta={t.meta} href={t.url} />
          ))}
        </Section>
      )}

      {/* On the radar — entity value-line cards */}
      {entities.length > 0 && (
        <Section label="On the radar" sub="Models, tools & companies moving in AI now">
          {entities.map((e: RadarItem) => (
            <Row
              key={e.entity.id}
              name={e.entity.canonicalName}
              valueLine={e.valueLine ?? ""}
              badge={e.entity.entityType}
              meta={`${e.entity.mentionCount} ${e.entity.mentionCount === 1 ? "source" : "sources"}`}
              href={e.latestStory?.sourceUrl}
            />
          ))}
        </Section>
      )}

      {/* Essentials — curated, grouped by category */}
      {curated.length > 0 && (
        <section style={{ marginBottom: "28px" }}>
          <p style={eyebrow}>Essentials</p>
          <p style={subLabel}>The tools every AI builder should know</p>
          {catOrder.map((cat) => (
            <div key={cat} style={{ marginBottom: "14px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#737373", margin: "0 0 6px", padding: "0 24px", letterSpacing: "0.01em" }}>
                {cat}
              </p>
              <div style={panel}>
                {byCat.get(cat)!.map((e) => (
                  <Row key={e.url} name={e.name} valueLine={e.valueLine} href={e.url} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Popular open-source — the stars-based canon */}
      {canon.length > 0 && (
        <Section label="Popular open-source" sub="Most-starred, still-maintained AI projects">
          {canon.map((t) => (
            <Row key={t.url} name={t.name} valueLine={t.valueLine} meta={t.meta} href={t.url} />
          ))}
        </Section>
      )}
    </div>
  );
}
