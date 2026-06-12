import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          padding: "80px",
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
            background:
              "radial-gradient(ellipse at 100% 0%, #7c3aed35 0%, transparent 65%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "500px",
            height: "350px",
            background:
              "radial-gradient(ellipse at 0% 100%, #2563eb18 0%, transparent 65%)",
            display: "flex",
          }}
        />

        {/* Wordmark */}
        <span
          style={{
            fontSize: 48,
            fontWeight: 500,
            color: "#E8E4DE",
            letterSpacing: "-2px",
          }}
        >
          kapyn
        </span>

        {/* Main message */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <p
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#F0EDE8",
              lineHeight: 1.15,
              margin: 0,
              maxWidth: 900,
            }}
          >
            What happened in AI today.
          </p>
          <p
            style={{
              fontSize: 28,
              color: "#737373",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Every story that matters, distilled to 30 seconds.
          </p>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {["AI / Models", "Dev Tools", "Open Source", "Startups", "Research"].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 100,
                  padding: "8px 20px",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#737373",
                  letterSpacing: "0.04em",
                  display: "flex",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
