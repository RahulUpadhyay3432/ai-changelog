"use client";

import { useState } from "react";
import { Layers, Plus, Check } from "lucide-react";
import posthog from "posthog-js";
import { STARTER_PACKS, type StarterPack } from "@/lib/radar-packs";
import { getToolDepth, getVerdict } from "@/lib/radar-tool-depth";
import { createLoadout, assignToolToLoadout } from "@/lib/storage";
import { FaceMark, VerdictBadge, GOLD, SG, TEXT, SURFACE, HAIRLINE, CANVAS } from "./radar-shared";
import { logoFor } from "./radar-map";

// Save every tool in a pack into a fresh named Loadout (on-device). Returns the
// count saved. Reuses the exact Loadout primitives the detail sheet uses.
function savePack(pack: StarterPack): number {
  const lo = createLoadout(pack.name);
  if (!lo) return 0;
  for (const t of pack.tools) {
    assignToolToLoadout(
      {
        id: t.url,
        name: t.name,
        valueLine: getToolDepth(t.url)?.whatItIs ?? "",
        category: pack.name,
        face: "essential",
        url: t.url,
        savedAt: new Date().toISOString(),
      },
      lo.id
    );
  }
  return pack.tools.length;
}

export function PacksClient() {
  const [savedId, setSavedId] = useState<string | null>(null);

  const onSave = (pack: StarterPack) => {
    const n = savePack(pack);
    if (n === 0) return;
    setSavedId(pack.id);
    posthog.capture("starter_pack_saved", { pack: pack.id, tools: n });
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
    window.setTimeout(() => setSavedId((cur) => (cur === pack.id ? null : cur)), 2200);
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", background: CANVAS }} className="scrollbar-none">
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "22px 18px 40px" }}>
        {/* Header */}
        <span style={{ fontFamily: SG, fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: TEXT.muted }}>
          Starter packs
        </span>
        <h1 style={{ fontFamily: SG, fontSize: "26px", fontWeight: 700, letterSpacing: "-0.02em", color: TEXT.primary, margin: "6px 0 6px" }}>
          The stack to actually use
        </h1>
        <p style={{ fontSize: "14px", lineHeight: 1.5, color: TEXT.body, margin: "0 0 20px" }}>
          Hand-picked stacks for a real job — not 12,000 tools. Save one as a Loadout in a tap.
        </p>

        {/* Packs */}
        {STARTER_PACKS.map((pack) => {
          const saved = savedId === pack.id;
          return (
            <div key={pack.id} style={{ background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "18px", padding: "16px 16px 14px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={16} color={GOLD} strokeWidth={2.2} />
                <h2 style={{ fontFamily: SG, fontSize: "17px", fontWeight: 700, color: TEXT.primary, margin: 0, letterSpacing: "-0.01em" }}>{pack.name}</h2>
              </div>
              <p style={{ fontSize: "13.5px", color: TEXT.muted, lineHeight: 1.5, margin: "6px 0 12px" }}>{pack.blurb}</p>

              <div style={{ display: "flex", flexDirection: "column", marginBottom: "13px" }}>
                {pack.tools.map((t) => {
                  const v = getVerdict(t.url);
                  return (
                    <a
                      key={t.url}
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", textDecoration: "none", color: "inherit" }}
                    >
                      <FaceMark face="essential" logoUrl={logoFor(t.url)} label={t.name} size={26} />
                      <span style={{ flex: 1, minWidth: 0, fontSize: "14px", fontWeight: 600, color: TEXT.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                      {v && <VerdictBadge verdict={v} />}
                    </a>
                  );
                })}
              </div>

              <button
                onClick={() => onSave(pack)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  padding: "11px", borderRadius: "13px", cursor: "pointer",
                  fontFamily: SG, fontSize: "14px", fontWeight: 600,
                  color: saved ? "#4ade80" : TEXT.primary,
                  background: saved ? "rgba(74,222,128,0.10)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${saved ? "rgba(74,222,128,0.26)" : HAIRLINE}`,
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
              >
                {saved ? <><Check size={15} strokeWidth={2.4} /> Saved to Loadout</> : <><Plus size={15} strokeWidth={2.4} /> Save as Loadout</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
