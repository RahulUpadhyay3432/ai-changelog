"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plug } from "lucide-react";
import posthog from "posthog-js";
import {
  MCP_SERVERS, MCP_CATEGORY_ORDER, MCP_CATEGORY_EMOJI, MCP_CATEGORY_SLUG,
  type McpServer, type McpCategory,
} from "@/lib/radar-mcp";
import { FaceMark, GOLD, GOLD_SOFT, CANVAS, HAIRLINE, SG, TEXT, type RadarThing } from "./radar-shared";
import { logoFor } from "./radar-map";
import { RadarDetailSheet } from "./RadarDetailSheet";

function mcpThing(s: McpServer): RadarThing {
  return {
    id: s.url, kind: "tool", name: s.name, valueLine: s.tagline, face: "tool",
    metric: null, typeLabel: "MCP server", category: "MCP", url: s.url,
    recency: null, storyTitle: null, storySource: null,
    description: s.description, topics: [], categorySlug: MCP_CATEGORY_SLUG[s.category],
    logoUrl: logoFor(s.url),
  };
}

const ALL = "All";

function ServerRow({ server, onOpen }: { server: McpServer; onOpen: (t: RadarThing) => void }) {
  return (
    <motion.button
      onClick={() => onOpen(mcpThing(server))}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 440, damping: 28 }}
      className="radar-row"
      style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", textAlign: "left", padding: "12px 24px", background: "transparent", border: "none", borderBottom: `1px solid ${HAIRLINE}`, cursor: "pointer", color: "inherit" }}
    >
      <FaceMark face="tool" category={MCP_CATEGORY_SLUG[server.category]} logoUrl={logoFor(server.url)} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <span style={{ fontSize: "15px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{server.name}</span>
          {server.by === "official" && (
            <span style={{ flexShrink: 0, fontSize: "10px", fontWeight: 600, letterSpacing: "0.03em", color: GOLD, background: GOLD_SOFT, borderRadius: "100px", padding: "1px 7px" }}>Official</span>
          )}
        </span>
        <span style={{ display: "block", fontSize: "13px", color: TEXT.muted, lineHeight: 1.4, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{server.tagline}</span>
      </div>
    </motion.button>
  );
}

export function McpMarketClient() {
  const [activeCat, setActiveCat] = useState<string>(ALL);
  const [detail, setDetail] = useState<RadarThing | null>(null);

  const byCategory = useMemo(() => {
    const m = new Map<McpCategory, McpServer[]>();
    for (const s of MCP_SERVERS) {
      if (!m.has(s.category)) m.set(s.category, []);
      m.get(s.category)!.push(s);
    }
    return m;
  }, []);

  const cats = useMemo(
    () => [ALL, ...MCP_CATEGORY_ORDER.filter((c) => byCategory.has(c))],
    [byCategory],
  );

  const visibleCats = activeCat === ALL ? MCP_CATEGORY_ORDER.filter((c) => byCategory.has(c)) : [activeCat as McpCategory];

  const onOpen = (t: RadarThing) => {
    setDetail(t);
    posthog.capture("radar_mcp_opened", { id: t.id });
  };

  return (
    <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", background: CANVAS, paddingBottom: "28px" }}>
      {/* Header */}
      <div style={{ padding: "22px 24px 12px" }}>
        <Link href="/radar" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", color: TEXT.muted, textDecoration: "none", marginBottom: "14px" }}>
          <ArrowLeft size={15} strokeWidth={2} /> Today
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <span style={{ flexShrink: 0, width: "40px", height: "40px", borderRadius: "11px", background: GOLD_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plug size={20} color={GOLD} strokeWidth={2} />
          </span>
          <div>
            <h1 style={{ fontFamily: SG, fontSize: "27px", fontWeight: 700, color: TEXT.primary, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.05 }}>MCP market</h1>
            <p style={{ fontSize: "13.5px", color: TEXT.muted, margin: "3px 0 0" }}>Connect your AI to the tools you already use</p>
          </div>
        </div>
      </div>

      {/* Category quick-nav chips */}
      <div className="scrollbar-none" style={{ position: "sticky", top: 0, zIndex: 4, display: "flex", gap: "8px", padding: "10px 20px 12px", overflowX: "auto", background: `linear-gradient(to bottom, ${CANVAS} 75%, transparent)` }}>
        {cats.map((c) => {
          const active = c === activeCat;
          const emoji = c === ALL ? "🔌" : MCP_CATEGORY_EMOJI[c as McpCategory];
          return (
            <button
              key={c}
              onClick={() => { setActiveCat(c); posthog.capture("radar_mcp_category", { category: c }); }}
              style={{
                flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "6px",
                fontFamily: SG, fontSize: "13px", fontWeight: active ? 700 : 500,
                color: active ? "#0a0a0a" : TEXT.body,
                background: active ? GOLD : "rgba(255,255,255,0.05)",
                border: `1px solid ${active ? GOLD : HAIRLINE}`,
                borderRadius: "100px", padding: "6px 13px", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: "13px" }}>{emoji}</span>{c}
            </button>
          );
        })}
      </div>

      {/* Sections */}
      {visibleCats.map((cat) => {
        const servers = byCategory.get(cat) ?? [];
        if (servers.length === 0) return null;
        return (
          <section key={cat} style={{ marginBottom: "26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 24px", marginBottom: "10px" }}>
              <span style={{ fontSize: "15px" }}>{MCP_CATEGORY_EMOJI[cat]}</span>
              <h2 style={{ fontFamily: SG, fontSize: "16px", fontWeight: 700, color: TEXT.primary, margin: 0, letterSpacing: "-0.01em" }}>{cat}</h2>
              <span style={{ fontSize: "12px", color: TEXT.muted, fontVariantNumeric: "tabular-nums" }}>{servers.length}</span>
            </div>
            <div style={{ borderTop: `1px solid ${HAIRLINE}` }}>
              {servers.map((s) => <ServerRow key={s.url} server={s} onOpen={onOpen} />)}
            </div>
          </section>
        );
      })}

      <RadarDetailSheet thing={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
