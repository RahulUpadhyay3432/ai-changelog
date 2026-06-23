"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, MapPin, Users, ArrowRight, Search, X } from "lucide-react";
import posthog from "posthog-js";
import type { Hackathon } from "@/lib/hackathons";
import { usePressTap, GOLD, GOLD_SOFT, CANVAS, SURFACE, HAIRLINE, INNER_HIGHLIGHT, SG, TEXT } from "./radar-shared";
import { HackathonDetailSheet } from "./HackathonDetailSheet";

type LocFilter = "all" | "online" | "inperson";
type StateFilter = "all" | "open" | "upcoming" | "ended";
type SourceFilter = "all" | "devpost" | "unstop" | "mlh" | "curated";
type HackathonSort = "popular" | "az";

const SORT_OPTIONS: { id: HackathonSort; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "az", label: "A–Z" },
];

// Desktop ≥900px → 3-col card grid; mobile stays single-column.
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

// Keyword-derived topics from a hackathon's themes/title/org. Only chips that
// match ≥1 loaded event are shown. Canonical order drives the chip row.
const TOPIC_ORDER = [
  "Agents", "GenAI / LLMs", "Vision", "Voice & audio", "Data / ML",
  "Web3", "Robotics", "Fintech", "Healthcare / Bio", "Climate",
  "Gaming", "AR / VR / XR", "Security", "Open Source", "Hardware / IoT",
  "Social good", "Beginner",
] as const;

const TOPIC_RULES: [string, RegExp][] = [
  ["Agents", /\bagent|autonomous|multi-?agent|agentic|automation|workflow/i],
  ["GenAI / LLMs", /\bllm\b|gen-?ai|generative|language model|\bgpt\b|gemini|claude|chatbot|\bprompt/i],
  ["Vision", /\bvision\b|image|computer-?vision|multimodal|object detect/i],
  ["Voice & audio", /voice|speech|audio|music|\bsound\b|podcast/i],
  ["Data / ML", /\bml\b|machine learning|deep learning|\bdata\b|analytics|dataset|\bmlops\b/i],
  ["Web3", /web3|blockchain|crypto|solana|ethereum|\bdefi\b|\bnft\b|on-?chain/i],
  ["Robotics", /robot|autonomous vehicle|drone|mechatron|embedded/i],
  ["Fintech", /fintech|finance|payment|banking|insurtech|lending|wealth/i],
  ["Healthcare / Bio", /health|medical|biotech|clinical|patient|pharma|genomic|bioinform/i],
  ["Climate", /climate|sustainab|green|carbon|energy|renewable|environment|eco\b/i],
  ["Gaming", /\bgame\b|gaming|gamif|esport|vr game|ar game/i],
  ["AR / VR / XR", /\bar\b|\bvr\b|\bxr\b|augmented reality|virtual reality|mixed reality|spatial|3d\b/i],
  ["Security", /security|cyber|hacking|ctf|vulnerab|exploit|privacy|encrypt/i],
  ["Open Source", /open.?source|oss\b|github|open contrib/i],
  ["Hardware / IoT", /hardware|iot\b|internet of things|embedded|raspberry|arduino|fpga/i],
  ["Social good", /social good|nonprofit|ngo|impact|accessibility|inclusion|education|civic/i],
  ["Beginner", /beginner|student|first hack|intro|newcomer|getting started|college|university/i],
];

function topicsFor(h: Hackathon): Set<string> {
  const hay = `${h.themes.join(" ")} ${h.title} ${h.organization ?? ""}`;
  const out = new Set<string>();
  for (const [label, re] of TOPIC_RULES) if (re.test(hay)) out.add(label);
  return out;
}

function sortHackathons(list: Hackathon[], sort: HackathonSort): Hackathon[] {
  if (sort === "az") return [...list].sort((a, b) => a.title.localeCompare(b.title));
  // popular: participants desc (nulls last)
  return [...list].sort((a, b) => {
    if (a.participants == null && b.participants == null) return 0;
    if (a.participants == null) return 1;
    if (b.participants == null) return -1;
    return b.participants - a.participants;
  });
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, fontFamily: SG, fontSize: "13px",
        fontWeight: active ? 700 : 500,
        color: active ? "#ffffff" : TEXT.body,
        background: active ? GOLD : "rgba(255,255,255,0.05)",
        border: `1px solid ${active ? GOLD : HAIRLINE}`,
        borderRadius: "100px", padding: "6px 13px", cursor: "pointer", whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function TogglePill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, fontFamily: SG, fontSize: "13px",
        fontWeight: active ? 700 : 500,
        color: active ? GOLD : TEXT.body,
        background: active ? `${GOLD}18` : "rgba(255,255,255,0.05)",
        border: `1px solid ${active ? GOLD : HAIRLINE}`,
        borderRadius: "100px", padding: "6px 13px", cursor: "pointer", whiteSpace: "nowrap",
        display: "inline-flex", alignItems: "center", gap: "5px",
      }}
    >
      {children}
    </button>
  );
}

function SortBar({ active, onPick }: { active: HackathonSort; onPick: (k: HackathonSort) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 24px 10px" }}>
      <span style={{ fontSize: "12px", color: TEXT.muted, flexShrink: 0 }}>Sort</span>
      <div className="scrollbar-none" style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
        {SORT_OPTIONS.map((s) => {
          const on = s.id === active;
          return (
            <button
              key={s.id}
              onClick={() => onPick(s.id)}
              style={{
                flexShrink: 0, fontFamily: SG, fontSize: "12.5px",
                fontWeight: on ? 700 : 500,
                color: on ? TEXT.primary : TEXT.muted,
                background: on ? "rgba(255,255,255,0.07)" : "transparent",
                border: `1px solid ${on ? HAIRLINE : "transparent"}`,
                borderRadius: "100px", padding: "5px 11px", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Initials for the no-image cover fallback (e.g. "Smart India Hackathon" → "SI").
const STOP = new Set(["with", "the", "of", "and", "a", "an", "for", "to", "in", "on", "by"]);
function initialsOf(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter((w) => w && !STOP.has(w.toLowerCase()));
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function HackathonCard({ h, onOpen }: { h: Hackathon; onOpen: (h: Hackathon) => void }) {
  const state = h.openState.toLowerCase();
  const open = state === "open";
  const ended = state === "ended";
  const tap = usePressTap(() => onOpen(h));

  const badgeText = open ? "Open now" : ended ? "Ended" : "Upcoming";
  const badgeBg = open ? GOLD : "rgba(0,0,0,0.55)";
  const badgeColor = open ? "#ffffff" : ended ? "#888888" : TEXT.primary;

  return (
    <motion.button
      {...tap}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 440, damping: 28 }}
      style={{ display: "block", width: "100%", textAlign: "left", color: "inherit", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", overflow: "hidden", boxShadow: INNER_HIGHLIGHT, cursor: "pointer", padding: 0, opacity: ended ? 0.7 : 1 }}
    >
      <div style={{ position: "relative" }}>
        {h.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={h.imageUrl} alt="" loading="lazy" draggable={false} style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover", background: "#0c0c0c", filter: ended ? "grayscale(0.4)" : "none" }} />
        ) : (
          <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", overflow: "hidden", background: ended ? "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)" : "linear-gradient(135deg, #21478f 0%, #182a52 48%, #0e1326 100%)" }}>
            {!ended && <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(75% 110% at 100% 0%, rgba(59,130,246,0.42), transparent 62%)" }} />}
            <span style={{ position: "relative", fontFamily: SG, fontSize: "40px", fontWeight: 700, letterSpacing: "-0.02em", color: ended ? "#555" : "#f4f6fb", lineHeight: 1 }}>{initialsOf(h.title)}</span>
            <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: ended ? "#444" : "rgba(255,255,255,0.62)" }}>
              <Trophy size={12} strokeWidth={2.2} /> Hackathon
            </span>
          </div>
        )}
        <span style={{ position: "absolute", top: "10px", left: "10px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: badgeColor, background: badgeBg, backdropFilter: "blur(6px)", borderRadius: "100px", padding: "3px 9px" }}>
          {badgeText}
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
  const [search, setSearch] = useState("");
  const [loc, setLoc] = useState<LocFilter>("all");
  const [state, setState] = useState<StateFilter>("all");
  const [source, setSource] = useState<SourceFilter>("all");
  const [topic, setTopic] = useState<string>("all");
  const [hasPrize, setHasPrize] = useState(false);
  const [sort, setSort] = useState<HackathonSort>("popular");
  const [detail, setDetail] = useState<Hackathon | null>(null);

  const isFiltered = search !== "" || loc !== "all" || state !== "all" || source !== "all" || topic !== "all" || hasPrize;

  const clearFilters = () => {
    setSearch(""); setLoc("all"); setState("all"); setSource("all");
    setTopic("all"); setHasPrize(false);
  };

  const openDetail = (h: Hackathon) => {
    setDetail(h);
    posthog.capture("radar_hackathon_brief_opened", { source: h.source, scope: "list" });
  };

  // Only surface topic chips that match ≥1 loaded hackathon — no empty chips.
  const availableTopics = useMemo(() => {
    const present = new Set<string>();
    for (const h of hackathons) for (const t of topicsFor(h)) present.add(t);
    return TOPIC_ORDER.filter((t) => present.has(t));
  }, [hackathons]);

  // Only surface source chips that exist in the loaded data.
  const availableSources = useMemo(() => {
    const present = new Set<string>();
    for (const h of hackathons) present.add(h.source.toLowerCase());
    return (["devpost", "unstop", "mlh", "curated"] as SourceFilter[]).filter((s) => present.has(s));
  }, [hackathons]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = hackathons
      .filter((h) => {
        if (!q) return true;
        const hay = `${h.title} ${h.organization ?? ""} ${h.themes.join(" ")}`.toLowerCase();
        return hay.includes(q);
      })
      .filter((h) => loc === "all" || (loc === "online" ? h.isOnline : !h.isOnline))
      .filter((h) => state === "all" || h.openState.toLowerCase() === state)
      .filter((h) => source === "all" || h.source.toLowerCase() === source)
      .filter((h) => topic === "all" || topicsFor(h).has(topic))
      .filter((h) => !hasPrize || h.prize != null);
    return sortHackathons(filtered, sort);
  }, [hackathons, search, loc, state, source, topic, hasPrize, sort]);

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

      {/* Search */}
      <div style={{ padding: "0 24px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "rgba(255,255,255,0.04)", border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "9px 13px" }}>
          <Search size={15} color="#5c5c5c" strokeWidth={2} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hackathons"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#ededed", fontSize: "14px" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }}>
              <X size={14} color="#5c5c5c" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Mode filter */}
      <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "0 24px 8px", overflowX: "auto" }}>
        <Pill active={loc === "all"} onClick={() => setLoc("all")}>All</Pill>
        <Pill active={loc === "online"} onClick={() => setLoc("online")}>Online</Pill>
        <Pill active={loc === "inperson"} onClick={() => setLoc("inperson")}>In-person</Pill>
      </div>

      {/* Status filter */}
      <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "0 24px 8px", overflowX: "auto" }}>
        <Pill active={state === "all"} onClick={() => setState("all")}>Any status</Pill>
        <Pill active={state === "open"} onClick={() => setState("open")}>Open now</Pill>
        <Pill active={state === "upcoming"} onClick={() => setState("upcoming")}>Upcoming</Pill>
        <Pill active={state === "ended"} onClick={() => setState("ended")}>Ended</Pill>
      </div>

      {/* Source filter — only shown when >1 source is present */}
      {availableSources.length > 1 && (
        <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "0 24px 8px", overflowX: "auto" }}>
          <Pill active={source === "all"} onClick={() => setSource("all")}>All sources</Pill>
          {availableSources.map((s) => (
            <Pill key={s} active={source === s} onClick={() => { setSource(s); posthog.capture("radar_hackathon_source_filter", { source: s }); }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Pill>
          ))}
        </div>
      )}

      {/* Topic filter */}
      {availableTopics.length > 0 && (
        <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "0 24px 8px", overflowX: "auto" }}>
          <Pill active={topic === "all"} onClick={() => setTopic("all")}>All topics</Pill>
          {availableTopics.map((t) => (
            <Pill key={t} active={topic === t} onClick={() => { setTopic(t); posthog.capture("radar_hackathon_topic_filter", { topic: t }); }}>
              {t}
            </Pill>
          ))}
        </div>
      )}

      {/* Has-prize toggle */}
      <div className="scrollbar-none" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 24px 4px", overflowX: "auto" }}>
        <TogglePill active={hasPrize} onClick={() => { setHasPrize((v) => !v); posthog.capture("radar_hackathon_prize_filter", { on: !hasPrize }); }}>
          <Trophy size={12} strokeWidth={2.2} /> Has prize
        </TogglePill>
      </div>

      {/* Sort */}
      <SortBar active={sort} onPick={(k) => { setSort(k); posthog.capture("radar_hackathon_sort", { sort: k }); }} />

      {/* Result count + clear filters */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px 10px" }}>
        <p style={{ fontSize: "12.5px", color: TEXT.muted, margin: 0 }}>
          {visible.length} hackathon{visible.length === 1 ? "" : "s"}
        </p>
        {isFiltered && (
          <button
            onClick={clearFilters}
            style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "12.5px", color: GOLD, fontFamily: SG, fontWeight: 600 }}
          >
            <X size={12} strokeWidth={2.5} /> Clear filters
          </button>
        )}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <Trophy size={26} color="#3a3a3a" strokeWidth={1.6} style={{ marginBottom: "12px" }} />
          <p style={{ fontSize: "14px", color: TEXT.muted, lineHeight: 1.5, margin: 0, maxWidth: "260px", marginInline: "auto" }}>
            {hackathons.length === 0 ? "No hackathons loaded yet — check back after the next refresh." : "Nothing matches these filters."}
          </p>
          {isFiltered && (
            <button onClick={clearFilters} style={{ marginTop: "14px", background: "none", border: `1px solid ${HAIRLINE}`, borderRadius: "100px", padding: "7px 16px", color: TEXT.muted, fontSize: "13px", cursor: "pointer", fontFamily: SG }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div style={isDesktop
          ? { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", padding: "0 20px", alignItems: "start" }
          : { display: "flex", flexDirection: "column", gap: "12px", padding: "0 20px" }}>
          {visible.map((h, i) => <HackathonCard key={`${h.source}-${i}`} h={h} onOpen={openDetail} />)}
        </div>
      )}

      <HackathonDetailSheet hackathon={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
