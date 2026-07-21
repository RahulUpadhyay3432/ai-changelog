import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { getCategoryBySlug } from "@/lib/categories";
import { getTrending } from "@/lib/trending";
import type { CategorySlug } from "@/lib/types";

export const dynamic = "force-dynamic";

const W = 1080;
const H = 1920;

export async function GET(req: Request) {
  const weekly = new URL(req.url).searchParams.get("kind") === "weekly";
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let stories: { id: string; title: string; category_slug: string }[];
  if (weekly) {
    // The stories that actually mattered this week — ranked by coverage x recency
    // over a 7-day window, not raw recency. Anti-FOMO: "you're caught up."
    const { top } = await getTrending(24 * 7, 3, 0);
    stories = top.map((s) => ({ id: s.id, title: s.title, category_slug: s.categorySlug }));
  } else {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("news_items")
      .select("id, title, category_slug")
      .gte("published_at", cutoff)
      .order("published_at", { ascending: false })
      .limit(3);
    stories = (data ?? []).slice(0, 3);
  }

  const dateLabel = weekly
    ? "This week"
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const categories = stories.map((s) =>
    getCategoryBySlug(s.category_slug as CategorySlug)
  );

  const accent0 = categories[0]?.colorAccent ?? "#7c3aed";
  const accent1 = categories[1]?.colorAccent ?? "#2563eb";
  const accent2 = categories[2]?.colorAccent ?? "#0891b2";

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          background: "#080808",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* ── Background atmosphere ── */}

        {/* Top-right glow — primary category */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 900,
            height: 900,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent0}55 0%, ${accent0}18 40%, transparent 70%)`,
            display: "flex",
          }}
        />

        {/* Bottom-left glow — secondary */}
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: -150,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent1}30 0%, ${accent2}12 45%, transparent 70%)`,
            display: "flex",
          }}
        />

        {/* Subtle horizontal scan lines for texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
            display: "flex",
          }}
        />

        {/* ── Content ── */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: "80px 72px 72px",
          }}
        >
          {/* Top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "64px",
            }}
          >
            {/* Wordmark */}
            <span
              style={{
                fontSize: "38px",
                fontWeight: 700,
                color: "#E8E4DE",
                letterSpacing: "-0.03em",
                display: "flex",
              }}
            >
              kapyn
            </span>

            {/* Date pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "100px",
                padding: "10px 24px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: accent0,
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 600,
                  color: "#a3a3a3",
                  letterSpacing: "0.02em",
                  display: "flex",
                }}
              >
                {dateLabel}
              </span>
            </div>
          </div>

          {/* Hero headline */}
          <div style={{ marginBottom: "64px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#404040",
                display: "flex",
              }}
            >
              {weekly ? "This week in AI" : "Today in AI"}
            </span>
            <p
              style={{
                fontSize: "80px",
                fontWeight: 800,
                color: "#F0EDE8",
                lineHeight: 1.05,
                margin: 0,
                letterSpacing: "-0.04em",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {weekly ? "The stories that mattered" : "3 stories worth knowing"}
            </p>
          </div>

          {/* Story cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              flex: 1,
            }}
          >
            {stories.map((story, i) => {
              const cat = categories[i];
              const accent = cat?.colorAccent ?? "#7c3aed";
              const colorLabel = cat?.colorLabel ?? "#c4b5fd";
              const colorBg = cat?.colorBg ?? "#1a0533";
              const title =
                story.title.length > 72
                  ? story.title.slice(0, 69) + "..."
                  : story.title;

              return (
                <div
                  key={story.id}
                  style={{
                    display: "flex",
                    flex: 1,
                    borderRadius: "20px",
                    overflow: "hidden",
                    background: `${colorBg}cc`,
                    border: `1px solid ${accent}25`,
                    position: "relative",
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    style={{
                      width: "5px",
                      background: accent,
                      flexShrink: 0,
                      display: "flex",
                    }}
                  />

                  {/* Card glow */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "60%",
                      background: `linear-gradient(180deg, ${accent}12 0%, transparent 100%)`,
                      display: "flex",
                    }}
                  />

                  {/* Watermark number */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -20,
                      right: 24,
                      fontSize: "160px",
                      fontWeight: 900,
                      color: `${accent}14`,
                      lineHeight: 1,
                      display: "flex",
                      letterSpacing: "-0.05em",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: "16px",
                      padding: "32px 40px 32px 36px",
                      position: "relative",
                      flex: 1,
                    }}
                  >
                    {/* Category badge */}
                    {cat && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "fit-content",
                        }}
                      >
                        <div
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: accent,
                            flexShrink: 0,
                            display: "flex",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: colorLabel,
                            display: "flex",
                          }}
                        >
                          {cat.name}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <p
                      style={{
                        fontSize: "38px",
                        fontWeight: 700,
                        color: "#EEEBe6",
                        lineHeight: 1.25,
                        margin: 0,
                        letterSpacing: "-0.02em",
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

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "40px",
              paddingTop: "32px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#E8E4DE",
                  letterSpacing: "-0.02em",
                  display: "flex",
                }}
              >
                kapyn.app
              </span>
              <span
                style={{
                  fontSize: "20px",
                  color: "#383838",
                  display: "flex",
                }}
              >
                AI news, distilled to 30 seconds
              </span>
            </div>

            {/* k icon */}
            <div
              style={{
                width: "72px",
                height: "72px",
                background: "#161616",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "42px",
                color: "#E8E4DE",
                fontFamily: "serif",
              }}
            >
              k
            </div>
          </div>
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
