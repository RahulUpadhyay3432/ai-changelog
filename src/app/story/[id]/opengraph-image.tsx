import { ImageResponse } from "next/og";
import { fetchNewsItemById } from "@/lib/supabase";
import { getCategoryBySlug } from "@/lib/categories";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await fetchNewsItemById(id);

  const title = story?.title ?? "AI news, distilled";
  const category = story ? getCategoryBySlug(story.categorySlug as never) : null;
  const accent = category?.colorAccent ?? "#7c3aed";
  const colorLabel = category?.colorLabel ?? "#c4b5fd";
  const categoryName = category?.name ?? "AI";

  const displayTitle = title.length > 90 ? title.slice(0, 87) + "..." : title;

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
        {/* Background glow */}
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
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "400px",
            height: "300px",
            background: `radial-gradient(ellipse at 0% 100%, ${accent}18 0%, transparent 65%)`,
            display: "flex",
          }}
        />

        {/* Logo + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span
            style={{
              fontSize: 38,
              fontWeight: 500,
              color: "#E8E4DE",
              letterSpacing: "-1.5px",
            }}
          >
            kapyn
          </span>
          <span
            style={{
              fontSize: 28,
              color: "#C8C4BE",
              fontWeight: 400,
              letterSpacing: "0.01em",
            }}
          >
            AI & tech news in 30-second reads
          </span>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", paddingTop: 32, paddingBottom: 32 }}>
          <p
            style={{
              fontSize: displayTitle.length > 60 ? 52 : 62,
              fontWeight: 700,
              color: "#F0EDE8",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: 1000,
            }}
          >
            {displayTitle}
          </p>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              background: `${accent}22`,
              border: `1.5px solid ${accent}44`,
              borderRadius: 100,
              padding: "10px 24px",
              fontSize: 20,
              fontWeight: 700,
              color: colorLabel,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {categoryName}
          </div>
          <span style={{ fontSize: 20, color: "#404040", fontWeight: 400 }}>
            kapyn.vercel.app
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
