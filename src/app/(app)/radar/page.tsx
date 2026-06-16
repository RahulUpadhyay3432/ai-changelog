import { getRadarEntities, type Entity } from "@/lib/knowledge";

// Refresh every 30 min — ingestion runs daily, so this stays current cheaply.
export const revalidate = 1800;

type EntityType = Entity["entityType"];

const GROUPS: { type: EntityType; label: string; blurb: string }[] = [
  { type: "model", label: "Models", blurb: "New and updated models gaining attention" },
  { type: "tool", label: "Tools & Projects", blurb: "Tools, agents, and open-source projects on the move" },
  { type: "company", label: "Companies", blurb: "Who's shipping and making news" },
];

const PER_GROUP = 12;

function timeAgo(iso: string | null): string {
  if (!iso) return "recently";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function EntityRow({ entity }: { entity: Entity }) {
  return (
    <div
      style={{
        padding: "14px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ fontSize: "15px", fontWeight: 600, color: "#E8E4DE", letterSpacing: "-0.01em" }}>
        {entity.canonicalName}
      </div>
      {entity.shortDesc && (
        <div style={{ fontSize: "13px", color: "#A09A90", lineHeight: 1.45, marginTop: "3px" }}>
          {entity.shortDesc.length > 120 ? entity.shortDesc.slice(0, 117) + "…" : entity.shortDesc}
        </div>
      )}
      <div style={{ fontSize: "11px", color: "#525252", marginTop: "6px", letterSpacing: "0.02em" }}>
        {entity.mentionCount} {entity.mentionCount === 1 ? "source" : "sources"} · {timeAgo(entity.lastMentionedAt)}
      </div>
    </div>
  );
}

export default async function RadarPage() {
  const entities = await getRadarEntities(60);

  const groups = GROUPS.map((g) => ({
    ...g,
    items: entities.filter((e) => e.entityType === g.type).slice(0, PER_GROUP),
  })).filter((g) => g.items.length > 0);

  return (
    <div
      style={{ height: "100%", background: "#0a0a0a", overflowY: "auto" }}
      className="scrollbar-none"
    >
      {/* Header */}
      <div style={{ padding: "40px 24px 20px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#f5f5f5", letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>
          On the radar
        </h1>
        <p style={{ fontSize: "14px", color: "#737373", lineHeight: 1.5, margin: "10px 0 0" }}>
          The models, tools, and companies moving in AI right now — ranked by how many sources are covering them.
        </p>
      </div>

      {groups.length === 0 ? (
        <p style={{ padding: "0 24px", fontSize: "14px", color: "#525252" }}>
          Kapyn is still mapping what&apos;s new. Check back soon.
        </p>
      ) : (
        groups.map((g) => (
          <section key={g.type} style={{ padding: "0 24px", marginBottom: "32px" }}>
            <div style={{ marginBottom: "8px" }}>
              <h2
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#737373",
                  margin: 0,
                }}
              >
                {g.label}
              </h2>
              <p style={{ fontSize: "12px", color: "#404040", margin: "3px 0 0" }}>{g.blurb}</p>
            </div>
            <div>
              {g.items.map((entity) => (
                <EntityRow key={entity.id} entity={entity} />
              ))}
            </div>
          </section>
        ))
      )}

      <p style={{ textAlign: "center", fontSize: "12px", color: "#404040", padding: "8px 24px 32px" }}>
        Updated continuously from Kapyn&apos;s news stream.
      </p>
    </div>
  );
}
