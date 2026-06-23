"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, MapPin, Users, ArrowRight } from "lucide-react";
import posthog from "posthog-js";
import type { Hackathon } from "@/lib/hackathons";
import { CoverImage, usePressTap, GOLD, GOLD_SOFT, CANVAS, SURFACE, HAIRLINE, INNER_HIGHLIGHT, SG, TEXT } from "./radar-shared";
import { HackathonDetailSheet } from "./HackathonDetailSheet";

type LocFilter = "all" | "online" | "inperson";
type StateFilter = "all" | "open" | "upcoming";

// Desktop ≥900px → 2-col card grid; mobile stays single-column (mirrors the
// other radar pages). Full-width banner cards are too wide on desktop.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

// Keyword-derived topics over a hackathon's themes/title/org. Only chips that
// match at least one event are shown (no empty chips). First-match-agnostic — an
// event can carry several topics. Canonical order drives the chip row.
const TOPIC_ORDER = ["Agents", "GenAI / LLMs", "Vision", "Voice & audio", "Data / ML", "Web3", "Beginner"] as const;
const TOPIC_RULES: [string, RegExp][] = [
  ["Agents", /\bagent|autonomous|multi-?agent|agentic|automation|workflow/i],
  ["GenAI / LLMs", /\bllm\b|gen-?ai|generative|language model|\bgpt\b|gemini|claude|chatbot|\bprompt/i],
  ["Vision", /vision|image|video|computer-?vision|multimodal|\bar\b|\bvr\b|\bxr\b|3d\b/i],
  ["Voice & audio", /voice|speech|audio|music|\bsound\b|podcast/i],
  ["Data / ML", /\bml\b|machine learning|deep learning|\bdata\b|analytics|dataset|\bmlops\b/i],
  ["Web3", /web3|blockchain|crypto|solana|ethereum|\bdefi\b|\bnft\b|on-?chain/i],
  ["Beginner", /beginner|student|first hack|intro|newcomer|getting started|college|university/i],
];

function topicsFor(h: Hackathon): Set<string> {
  const hay = `${h.themes.join(" ")} ${h.title} ${h.organization ?? ""}`;
  const out = new Set<string>();
  for (const [label, re] of TOPIC_RULES) if (re.test(hay)) out.add(label);
  return out;
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ flexShrink: 0, fontFamily: SG, fontSize: "13px", fontWeight: active ? 700 : 500, color: active ? "#ffffff" : TEXT.body, background: active ? GOLD : "rgba(255,255,255,0.05)", border: `1px solid ${active ? GOLD : HAIRLINE}`, borderRadius: "100px", padding: "6px 13px", cursor: "pointer", whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

// Initials for the no-image cover fallback (e.g. "Smart India Hackathon" → "SI").
// Skips small stopwords so "Build with Gemini" → "BG", not "BW".
const STOP = new Set(["with", "the", "of", "and", "a", "an", "for", "to", "in", "on", "by"]);
function initialsOf(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter((w) => w && !STOP.has(w.toLowerCase()));
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
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
        {h.imageUrl ? (
          <CoverImage src={h.imageUrl} category="startups" fallbackIcon={Trophy} height={116} radius={0} />
        ) : (
          // Branded fallback — a designed cover, never an empty grey box
          // (refs: Devpost name-on-color, MLH initials-on-color, Devfolio).
          <div style={{ position: "relative", height: "116px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", overflow: "hidden", background: "linear-gradient(135deg, #21478f 0%, #182a52 48%, #0e1326 100%)" }}>
            <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(75% 110% at 100% 0%, rgba(59,130,246,0.42), transparent 62%)" }} />
            <span style={{ position: "relative", fontFamily: SG, fontSize: "40px", fontWeight: 700, letterSpacing: "-0.02em", color: "#f4f6fb", lineHeight: 1 }}>{initialsOf(h.title)}</span>
            <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.62)" }}>
              <Trophy size={12} strokeWidth={2.2} /> Hackathon
            </span>
          </div>
        )}
        <span style={{ position: "absolute", top: "10px", left: "10px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: open ? "#ffffff" : TEXT.primary, background: open ? GOLD : "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", borderRadius: "100px", padding: "3px 9px" }}>
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
  const isDesktop = useIsDesktop();
  const [loc, setLoc] = useState<LocFilter>("all");
  const [state, setState] = useState<StateFilter>("all");
  const [topic, setTopic] = useState<string>("all");
  const [detail, setDetail] = useState<Hackathon | null>(null);

  const open = (h: Hackathon) => {
    setDetail(h);
    posthog.capture("radar_hackathon_brief_opened", { source: h.source, scope: "list" });
  };

  const pickTopic = (t: string) => {
    setTopic(t);
    posthog.capture("radar_hackathon_topic_filter", { topic: t });
  };

  // Only surface topic chips that match ≥1 loaded hackathon — no empty chips.
  const availableTopics = useMemo(() => {
    const present = new Set<string>();
    for (const h of hackathons) for (const t of topicsFor(h)) present.add(t);
    return TOPIC_ORDER.filter((t) => present.has(t));
  }, [hackathons]);

  const visible = useMemo(
    () =>
      hackathons
        .filter((h) => loc === "all" || (loc === "online" ? h.isOnline : !h.isOnline))
        .filter((h) => state === "all" || h.openState.toLowerCase() === state)
        .filter((h) => topic === "all" || topicsFor(h).has(topic)),
    [hackathons, loc, state, topic],
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
      <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: topic === "all" && availableTopics.length === 0 ? "0 24px 16px" : "0 24px 10px", overflowX: "auto" }}>
        <Pill active={state === "all"} onClick={() => setState("all")}>Any status</Pill>
        <Pill active={state === "open"} onClick={() => setState("open")}>Open now</Pill>
        <Pill active={state === "upcoming"} onClick={() => setState("upcoming")}>Upcoming</Pill>
      </div>
      {availableTopics.length > 0 && (
        <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "0 24px 14px", overflowX: "auto" }}>
          <Pill active={topic === "all"} onClick={() => pickTopic("all")}>All topics</Pill>
          {availableTopics.map((t) => (
            <Pill key={t} active={topic === t} onClick={() => pickTopic(t)}>{t}</Pill>
          ))}
        </div>
      )}

      {/* Result count */}
      {visible.length > 0 && (
        <p style={{ fontSize: "12.5px", color: TEXT.muted, margin: "0 0 10px", padding: "0 24px" }}>
          {visible.length} hackathon{visible.length === 1 ? "" : "s"}
        </p>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <Trophy size={26} color="#3a3a3a" strokeWidth={1.6} style={{ marginBottom: "12px" }} />
          <p style={{ fontSize: "14px", color: TEXT.muted, lineHeight: 1.5, margin: 0, maxWidth: "260px", marginInline: "auto" }}>
            {hackathons.length === 0 ? "No hackathons loaded yet — check back after the next refresh." : "Nothing matches this filter."}
          </p>
        </div>
      ) : (
        <div style={isDesktop
          ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", padding: "0 20px", alignItems: "start" }
          : { display: "flex", flexDirection: "column", gap: "12px", padding: "0 20px" }}>
          {visible.map((h, i) => <HackathonCard key={`${h.source}-${i}`} h={h} onOpen={open} />)}
        </div>
      )}

      <HackathonDetailSheet hackathon={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
