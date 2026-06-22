import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GOLD, TEXT, SG } from "@/lib/design-tokens";
import { CURATED_ESSENTIALS } from "@/lib/radar-essentials";

// Desktop positioning panel for the app shell's left rail. A cold visitor lands
// on the live feed with no context; this states what Kapyn is, beside the phone
// that demos it. Radar leads as the differentiator, the 30-second brief is the
// daily habit beneath it — both expressions of "signal over noise". Server
// component: copy is static, the tool count is read at build/request time.
const TOOL_COUNT = CURATED_ESSENTIALS.length;

export function AppPositioningPanel() {
  return (
    <section style={{ display: "flex", flexDirection: "column", paddingBottom: "26px" }}>
      {/* Wordmark — the brand header for the whole rail */}
      <Link
        href="/home"
        style={{
          fontFamily: SG, fontSize: "21px", fontWeight: 800, letterSpacing: "-0.04em",
          color: TEXT.primary, textDecoration: "none", padding: "0 4px 22px",
        }}
      >
        kapyn
      </Link>

      {/* Live kicker */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 4px 14px" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
        <span style={{ fontFamily: SG, fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: TEXT.muted }}>
          Keep up with AI — without the noise
        </span>
      </div>

      {/* Display headline */}
      <h1 style={{
        margin: "0 0 12px", padding: "0 4px", fontFamily: SG, fontWeight: 700,
        fontSize: "clamp(26px, 2.4vw, 34px)", letterSpacing: "-0.04em", lineHeight: 1.05,
        color: TEXT.primary,
      }}>
        The calm signal layer for AI.
      </h1>

      {/* Subhead */}
      <p style={{ margin: "0 0 22px", padding: "0 4px", maxWidth: "270px", fontSize: "14.5px", lineHeight: 1.5, color: TEXT.body }}>
        Find the AI worth using, and know what changed today — curated, calm, no paywall.
      </p>

      {/* Two pillars — Radar leads (accent eyebrow), Brief is the quieter habit */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "0 4px", marginBottom: "24px" }}>
        <div>
          <div style={{ fontFamily: SG, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: GOLD, marginBottom: "5px" }}>
            Radar
          </div>
          <div style={{ fontSize: "14.5px", fontWeight: 600, color: TEXT.primary, marginBottom: "3px" }}>
            Find the AI worth using.
          </div>
          <div style={{ fontSize: "13px", lineHeight: 1.45, color: TEXT.muted }}>
            A curated map of the tools, models, MCP servers and skills worth your time — {TOOL_COUNT} tracked live.
          </div>
        </div>
        <div>
          <div style={{ fontFamily: SG, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TEXT.muted, marginBottom: "5px" }}>
            Brief
          </div>
          <div style={{ fontSize: "14.5px", fontWeight: 600, color: TEXT.primary, marginBottom: "3px" }}>
            What happened in AI, in 30 seconds a day.
          </div>
          <div style={{ fontSize: "13px", lineHeight: 1.45, color: TEXT.muted }}>
            The daily habit — demoed on the right.
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/"
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
          alignSelf: "flex-start", margin: "0 4px", padding: "12px 20px",
          fontFamily: SG, fontSize: "14.5px", fontWeight: 600, color: "#fff",
          background: GOLD, borderRadius: "12px", textDecoration: "none",
        }}
      >
        Open Kapyn
        <ArrowRight size={16} strokeWidth={2.2} />
      </Link>

      {/* Proof */}
      <div style={{ padding: "14px 4px 0", fontSize: "12px", color: TEXT.muted }}>
        No paywall, ever.
      </div>
    </section>
  );
}
