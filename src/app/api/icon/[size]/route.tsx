import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeStr } = await params;
  const size = Math.min(Math.max(parseInt(sizeStr, 10) || 192, 16), 1024);

  const fontSize = Math.round(size * 0.48);
  const radius = Math.round(size * 0.22);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "#0E0D0C",
          borderRadius: radius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Subtle warm radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            background:
              "radial-gradient(ellipse at 55% 38%, rgba(212,165,116,0.18) 0%, transparent 65%)",
          }}
        />
        {/* Lettermark */}
        <span
          style={{
            fontSize,
            fontWeight: 500,
            color: "#E8E4DE",
            fontFamily: "serif",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          k
        </span>
      </div>
    ),
    { width: size, height: size }
  );
}
