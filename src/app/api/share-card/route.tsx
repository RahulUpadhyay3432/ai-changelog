import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { getCategoryBySlug } from "@/lib/categories";
import type { CategorySlug } from "@/lib/types";

export const dynamic = "force-dynamic";

const W = 1080;
const H = 1920;
const PAD = 90;

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

  const INNER_W = W - PAD * 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          padding: `100px ${PAD}px 90px`,
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            marginBottom: "72px",
            width: INNER_W,
          }}
        >
          <div
            style={{
              border: "2px solid rgba(255,255,255,0.22)",
              borderRadius: "100px",
              padding: "14px 32px",
              fontSize: "28px",
              fontWeight: 700,
              color: "#E8E4DE",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "flex",
              flexShrink: 0,
            }}
          >
            Today in AI
          </div>
          <span style={{ fontSize: "30px", color: "#525252", display: "flex" }}>
            {today}
          </span>
        </div>

        {/* Headline */}
        <p
          style={{
            fontSize: "84px",
            fontWeight: 800,
            color: "#F0EDE8",
            lineHeight: 1.1,
            margin: "0 0 80px",
            letterSpacing: "-0.03em",
            width: INNER_W,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          Top 3 AI stories you should know
        </p>

        {/* Stories */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: INNER_W,
            flex: 1,
          }}
        >
          {stories.map((story, i) => {
            const category = getCategoryBySlug(
              story.category_slug as CategorySlug
            );
            const title =
              story.title.length > 68
                ? story.title.slice(0, 65) + "..."
                : story.title;

            return (
              <div
                key={story.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "36px",
                  paddingTop: i === 0 ? "0" : "52px",
                  paddingBottom: "52px",
                  borderBottom:
                    i < stories.length - 1
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "none",
                  width: INNER_W,
                }}
              >
                {/* Number */}
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "#444",
                    flexShrink: 0,
                    marginTop: "6px",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Text content — constrained to remaining width */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    width: INNER_W - 72 - 36,
                    overflow: "hidden",
                  }}
                >
                  {category && (
                    <div
                      style={{
                        border: `1.5px solid ${category.colorAccent}`,
                        borderRadius: "100px",
                        padding: "7px 24px",
                        fontSize: "22px",
                        fontWeight: 700,
                        color: category.colorAccent,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        display: "flex",
                        width: "fit-content",
                        maxWidth: "100%",
                      }}
                    >
                      {category.name}
                    </div>
                  )}
                  <p
                    style={{
                      fontSize: "38px",
                      fontWeight: 500,
                      color: "#E8E4DE",
                      lineHeight: 1.3,
                      margin: 0,
                      letterSpacing: "-0.01em",
                      display: "flex",
                      flexWrap: "wrap",
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
            gap: "24px",
            paddingTop: "44px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            width: INNER_W,
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "#181818",
              borderRadius: "18px",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "46px",
              color: "#E8E4DE",
              fontFamily: "serif",
              flexShrink: 0,
            }}
          >
            k
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 500,
              color: "#E8E4DE",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            kapyn
          </span>
          <div style={{ flex: 1, display: "flex" }} />
          <span
            style={{
              fontSize: "28px",
              color: "#383838",
              display: "flex",
            }}
          >
            kapyn.app
          </span>
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
