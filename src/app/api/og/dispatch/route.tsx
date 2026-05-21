import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const CATEGORY_COLORS: Record<string, { label: string; accent: string; bg: string }> = {
  "ai-models":      { label: "AI / Models",    accent: "#c4b5fd", bg: "rgba(124,58,237,0.15)" },
  "dev-tools":      { label: "Dev Tools",      accent: "#60a5fa", bg: "rgba(37,99,235,0.15)" },
  "startups":       { label: "Startups",       accent: "#4ade80", bg: "rgba(22,163,74,0.15)" },
  "research":       { label: "Research",       accent: "#22d3ee", bg: "rgba(8,145,178,0.15)" },
  "funding-ma":     { label: "Funding & M&A",  accent: "#fbbf24", bg: "rgba(217,119,6,0.15)" },
  "big-tech":       { label: "Big Tech",       accent: "#818cf8", bg: "rgba(79,70,229,0.15)" },
  "infrastructure": { label: "Infrastructure", accent: "#2dd4bf", bg: "rgba(15,118,110,0.15)" },
  "policy":         { label: "Policy",         accent: "#d8b4fe", bg: "rgba(147,51,234,0.15)" },
};

const SIZES = {
  square:    { width: 1080, height: 1080 },
  landscape: { width: 1200, height: 675  },
  story:     { width: 1080, height: 1920 },
};

function trunc(text: string, max: number): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const title      = p.get("title")    ?? "Untitled";
  const summary    = p.get("summary")  ?? "";
  const source     = p.get("source")   ?? "";
  const category   = p.get("category") ?? "";
  const formatKey  = (p.get("format")  ?? "square") as keyof typeof SIZES;

  const fmt  = SIZES[formatKey] ?? SIZES.square;
  const cat  = CATEGORY_COLORS[category] ?? { label: category, accent: "#E8E4DE", bg: "rgba(255,255,255,0.08)" };
  const isStory     = formatKey === "story";
  const isLandscape = formatKey === "landscape";

  const pad         = isLandscape ? 56 : isStory ? 90 : 72;
  const titleSize   = isLandscape ? 54 : isStory ? 80 : 66;
  const summarySize = isLandscape ? 22 : isStory ? 30 : 26;
  const wordmarkSize= isLandscape ? 32 : isStory ? 42 : 38;
  const titleMax    = isLandscape ? 120 : isStory ? 160 : 140;
  const summaryMax  = isLandscape ? 200 : isStory ? 280 : 240;

  return new ImageResponse(
    (
      <div
        style={{
          width:  "100%",
          height: "100%",
          background: "#0E0D0C",
          display: "flex",
          flexDirection: "column",
          padding: `${pad}px`,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Amber top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #D4A574 0%, rgba(212,165,116,0.3) 100%)",
          }}
        />

        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: isStory ? "120px" : isLandscape ? "44px" : "80px",
          }}
        >
          {/* Wordmark */}
          <div
            style={{
              fontSize: `${wordmarkSize}px`,
              fontWeight: 500,
              color: "#E8E4DE",
              letterSpacing: "-0.02em",
            }}
          >
            kapyn
          </div>

          {/* Category pill */}
          {cat.label && (
            <div
              style={{
                fontSize: isLandscape ? "13px" : "16px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: cat.accent,
                background: cat.bg,
                padding: isLandscape ? "6px 16px" : "8px 20px",
                borderRadius: "100px",
                textTransform: "uppercase",
              }}
            >
              {cat.label}
            </div>
          )}
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* Amber accent line under headline area */}
          <div
            style={{
              width: isLandscape ? "48px" : "60px",
              height: "2px",
              background: "#D4A574",
              marginBottom: isLandscape ? "20px" : "28px",
              opacity: 0.6,
            }}
          />

          {/* Headline */}
          <div
            style={{
              fontSize: `${titleSize}px`,
              fontWeight: 600,
              color: "#E8E4DE",
              lineHeight: 1.18,
              marginBottom: isLandscape ? "24px" : "36px",
              letterSpacing: "-0.01em",
            }}
          >
            {trunc(title, titleMax)}
          </div>

          {/* Summary */}
          {summary && (
            <div
              style={{
                fontSize: `${summarySize}px`,
                fontWeight: 400,
                color: "#8A8580",
                lineHeight: 1.6,
              }}
            >
              {trunc(summary, summaryMax)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: isStory ? "80px" : isLandscape ? "32px" : "56px",
          }}
        >
          <div
            style={{
              fontSize: isLandscape ? "14px" : "17px",
              fontWeight: 600,
              color: "#3a3a3a",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {source ? `via ${source}` : ""}
          </div>
          <div
            style={{
              fontSize: isLandscape ? "14px" : "17px",
              color: "#2e2e2e",
              letterSpacing: "0.04em",
            }}
          >
            kapyn.app
          </div>
        </div>
      </div>
    ),
    {
      width:  fmt.width,
      height: fmt.height,
    }
  );
}
