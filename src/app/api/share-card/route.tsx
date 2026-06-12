import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { getCategoryBySlug } from "@/lib/categories";
import type { CategorySlug } from "@/lib/types";

export const dynamic = "force-dynamic";

const W = 1080;
const H = 1920;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("news_items")
    .select("id, title, category_slug")
    .gte("published_at", cutoff)
    .order("published_at", { ascending: false })
    .limit(3);

  const stories = data ?? [];

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          padding: "120px 80px 100px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            marginBottom: "80px",
          }}
        >
          <div
            style={{
              border: "2px solid rgba(255,255,255,0.25)",
              borderRadius: "100px",
              padding: "16px 36px",
              fontSize: "32px",
              fontWeight: 700,
              color: "#E8E4DE",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Today in AI
          </div>
          <span style={{ fontSize: "32px", color: "#737373" }}>{today}</span>
        </div>

        {/* Headline */}
        <p
          style={{
            fontSize: "88px",
            fontWeight: 800,
            color: "#F0EDE8",
            lineHeight: 1.1,
            margin: "0 0 100px",
            letterSpacing: "-0.03em",
          }}
        >
          Top 3 AI stories you should know
        </p>

        {/* Story list */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {stories.map((story, i) => {
            const category = getCategoryBySlug(
              story.category_slug as CategorySlug
            );
            const title =
              story.title.length > 72
                ? story.title.slice(0, 69) + "..."
                : story.title;

            return (
              <div
                key={story.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "40px",
                  paddingTop: i === 0 ? "0" : "56px",
                  paddingBottom: "56px",
                  borderBottom:
                    i < stories.length - 1
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "none",
                }}
              >
                {/* Number circle */}
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    fontWeight: 600,
                    color: "#525252",
                    flexShrink: 0,
                    marginTop: "8px",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Content */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                >
                  {category && (
                    <div
                      style={{
                        border: `1.5px solid ${category.colorAccent}`,
                        borderRadius: "100px",
                        padding: "8px 28px",
                        fontSize: "24px",
                        fontWeight: 700,
                        color: category.colorAccent,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        display: "flex",
                        width: "fit-content",
                      }}
                    >
                      {category.name}
                    </div>
                  )}
                  <p
                    style={{
                      fontSize: "42px",
                      fontWeight: 500,
                      color: "#E8E4DE",
                      lineHeight: 1.3,
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            paddingTop: "48px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              width: "88px",
              height: "88px",
              background: "#181818",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "52px",
              color: "#E8E4DE",
              fontFamily: "serif",
            }}
          >
            k
          </div>
          <span
            style={{
              fontSize: "52px",
              fontWeight: 500,
              color: "#E8E4DE",
              letterSpacing: "-0.02em",
            }}
          >
            kapyn
          </span>
          <div style={{ flex: 1, display: "flex" }} />
          <span style={{ fontSize: "32px", color: "#404040" }}>kapyn.app</span>
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
