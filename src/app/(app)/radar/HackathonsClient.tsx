"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, MapPin, Users, ArrowRight } from "lucide-react";
import posthog from "posthog-js";
import type { Hackathon } from "@/lib/hackathons";
import { CoverImage, usePressTap, GOLD, GOLD_SOFT, CANVAS, SURFACE, HAIRLINE, INNER_HIGHLIGHT, SG, TEXT } from "./radar-shared";
import { HackathonDetailSheet } from "./HackathonDetailSheet";

type LocFilter = "all" | "online" | "inperson";
type StateFilter = "all" | "open" | "upcoming";

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ flexShrink: 0, fontFamily: SG, fontSize: "13px", fontWeight: active ? 700 : 500, color: active ? "#0a0a0a" : TEXT.body, background: active ? GOLD : "rgba(255,255,255,0.05)", border: `1px solid ${active ? GOLD : HAIRLINE}`, borderRadius: "100px", padding: "6px 13px", cursor: "pointer", whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

// Tapping a card opens the in-app brief (HackathonDetailSheet); only its
// "Register" button leaves the app. Tap-guarded so a vertical scroll never opens.
function HackathonCard({ h, onOpen }: { h: Hackathon; onOpen: (h: Hackathon) => void }) {
  const open = h.openState.toLowerCase() === "open";
  const tap = usePressTap(() => onOpen(h));
  return (
    <motion.button
      {...tap}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 440, damping: 28 }}
      style={{ display: "block", width: "100%", textAlign: "left", color: "inherit", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", overflow: "hidden", boxShadow: INNER_HIGHLIGHT, cursor: "pointer", padding: 0 }}
    >
      <div style={{ position: "relative" }}>
        <CoverImage src={h.imageUrl} category="startups" height={116} radius={0} />
        <span style={{ position: "absolute", top: "10px", left: "10px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: open ? "#0a0a0a" : TEXT.primary, background: open ? GOLD : "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", borderRadius: "100px", padding: "3px 9px" }}>
          {open ? "Open now" : "Upcoming"}
        </span>
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <span style={{ fontSize: "15px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em", lineHeight: 1.25, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{h.title}</span>
        {h.dates && <span style={{ display: "block", fontSize: "12.5px", color: TEXT.muted, marginTop: "5px" }}>{h.dates}</span>}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px", marginTop: "10px" }}>
          {h.prize && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12.5px", fontWeight: 600, color: GOLD }}>
              <Trophy size={13} strokeWidth={2} /> {h.prize}
            </span>
          )}
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12.5px", color: TEXT.muted }}>
            <MapPin size={13} strokeWidth={2} /> {h.isOnline ? "Online" : h.location || "In-person"}
          </span>
          {h.participants != null && h.participants > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12.5px", color: TEXT.muted }}>
              <Users size={13} strokeWidth={2} /> {h.participants.toLocaleString()}
            </span>
          )}
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "12px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: GOLD }}>
          View details <ArrowRight size={14} strokeWidth={2.4} />
        </span>
      </div>
    </motion.button>
  );
}

export function HackathonsClient({ hackathons }: { hackathons: Hackathon[] }) {
  const [loc, setLoc] = useState<LocFilter>("all");
  const [state, setState] = useState<StateFilter>("all");
  const [detail, setDetail] = useState<Hackathon | null>(null);

  const open = (h: Hackathon) => {
    setDetail(h);
    posthog.capture("radar_hackathon_brief_opened", { source: h.source, scope: "list" });
  };

  const visible = useMemo(
    () =>
      hackathons
        .filter((h) => loc === "all" || (loc === "online" ? h.isOnline : !h.isOnline))
        .filter((h) => state === "all" || h.openState.toLowerCase() === state),
    [hackathons, loc, state],
  );

  return (
    <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", overflowX: "hidden", background: CANVAS, paddingBottom: "28px" }}>
      {/* Header */}
      <div style={{ padding: "22px 24px 12px" }}>
        <Link href="/radar" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", color: TEXT.muted, textDecoration: "none", marginBottom: "14px" }}>
          <ArrowLeft size={15} strokeWidth={2} /> Today
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <span style={{ flexShrink: 0, width: "40px", height: "40px", borderRadius: "11px", background: GOLD_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trophy size={20} color={GOLD} strokeWidth={2} />
          </span>
          <div>
            <h1 style={{ fontFamily: SG, fontSize: "27px", fontWeight: 700, color: TEXT.primary, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Hackathons</h1>
            <p style={{ fontSize: "13.5px", color: TEXT.muted, margin: "3px 0 0" }}>AI &amp; tech hackathons to go build in</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "8px 24px 6px", overflowX: "auto" }}>
        <Pill active={loc === "all"} onClick={() => setLoc("all")}>All</Pill>
        <Pill active={loc === "online"} onClick={() => setLoc("online")}>Online</Pill>
        <Pill active={loc === "inperson"} onClick={() => setLoc("inperson")}>In-person</Pill>
      </div>
      <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "0 24px 16px", overflowX: "auto" }}>
        <Pill active={state === "all"} onClick={() => setState("all")}>Any status</Pill>
        <Pill active={state === "open"} onClick={() => setState("open")}>Open now</Pill>
        <Pill active={state === "upcoming"} onClick={() => setState("upcoming")}>Upcoming</Pill>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <Trophy size={26} color="#3a3a3a" strokeWidth={1.6} style={{ marginBottom: "12px" }} />
          <p style={{ fontSize: "14px", color: TEXT.muted, lineHeight: 1.5, margin: 0, maxWidth: "260px", marginInline: "auto" }}>
            {hackathons.length === 0 ? "No hackathons loaded yet — check back after the next refresh." : "Nothing matches this filter."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "0 20px" }}>
          {visible.map((h, i) => <HackathonCard key={`${h.source}-${i}`} h={h} onOpen={open} />)}
        </div>
      )}

      <HackathonDetailSheet hackathon={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
