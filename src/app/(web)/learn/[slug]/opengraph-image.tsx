import { ImageResponse } from "next/og";
import { getEntityBySlug, getPublishedExplainer } from "@/lib/knowledge";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entity = await getEntityBySlug(slug);
  const name = entity?.canonicalName ?? "AI concept";
  const explainer = entity ? await getPublishedExplainer(entity.id) : null;
  const sub = (explainer?.definition ?? entity?.shortDesc ?? "AI & tech, explained.").slice(0, 130);
  const accent = "#7c3aed";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: "64px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "700px",
            height: "500px",
            background: `radial-gradient(ellipse at 100% 0%, ${accent}35 0%, transparent 65%)`,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 34, fontWeight: 500, color: "#E8E4DE", letterSpacing: "-1.5px" }}>
            kapyn
          </span>
          <span style={{ fontSize: 26, color: "#9b8fd6", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            AI Glossary
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1, justifyContent: "center" }}>
          <p style={{ fontSize: name.length > 28 ? 64 : 78, fontWeight: 700, color: "#F0EDE8", lineHeight: 1.1, margin: 0, maxWidth: 1040 }}>
            {name}
          </p>
          <p style={{ fontSize: 30, color: "#C8C4BE", fontWeight: 400, lineHeight: 1.4, margin: 0, maxWidth: 1000 }}>
            {sub}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 22, color: "#737373" }}>What it is · Why it matters · In the news</span>
          <span style={{ fontSize: 20, color: "#404040" }}>kapyn.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
