"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Plug } from "lucide-react";
import posthog from "posthog-js";
import {
  MCP_SERVERS, MCP_CATEGORY_ORDER, MCP_CATEGORY_EMOJI, MCP_CATEGORY_SLUG,
  type McpServer, type McpCategory,
} from "@/lib/radar-mcp";
import {
  AI_SKILLS, SKILL_CATEGORY_ORDER, SKILL_CATEGORY_EMOJI, SKILL_CATEGORY_SLUG,
  type AiSkill, type SkillCategory,
} from "@/lib/radar-skills";
import { slugForUrl } from "@/lib/tools-registry";
import { FaceMark, MetricChip, CoverImage, GOLD, GOLD_SOFT, CANVAS, SURFACE, HAIRLINE, INNER_HIGHLIGHT, SG, TEXT, type RadarThing } from "./radar-shared";
import { logoFor, ogProxy } from "./radar-map";
import { RadarDetailSheet } from "./RadarDetailSheet";

export interface McpMeta { stars: number; createdAt: string }

type View = "mcp" | "skills";
const ALL = "All";

// Desktop ≥900px → 3-col card grids; mobile stays 2-col (mirrors RadarClient).
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
const PRESS = { type: "spring" as const, stiffness: 440, damping: 28 };

// ─── MCP ─────────────────────────────────────────────────────────────────────
function mcpThing(s: McpServer): RadarThing {
  return {
    id: s.url, kind: "tool", name: s.name, valueLine: s.tagline, face: "tool",
    metric: null, typeLabel: "MCP server", category: "MCP", url: s.url,
    recency: null, storyTitle: null, storySource: null,
    description: s.description, topics: [], categorySlug: MCP_CATEGORY_SLUG[s.category],
    imageUrl: ogProxy(s.url),
    logoUrl: logoFor(s.url),
  };
}

type McpSort = "popular" | "newest" | "az" | "official";
const MCP_SORTS: { id: McpSort; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "newest", label: "Newest" },
  { id: "az", label: "A–Z" },
  { id: "official", label: "Official" },
];

function compact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
}

function sortServers(list: McpServer[], sort: McpSort, meta: Record<string, McpMeta>): McpServer[] {
  const arr = [...list];
  if (sort === "popular") arr.sort((a, b) => (meta[b.url]?.stars ?? -1) - (meta[a.url]?.stars ?? -1));
  else if (sort === "newest") arr.sort((a, b) => new Date(meta[b.url]?.createdAt ?? 0).getTime() - new Date(meta[a.url]?.createdAt ?? 0).getTime());
  else if (sort === "az") arr.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "official") arr.sort((a, b) => (a.by === "official" ? 0 : 1) - (b.by === "official" ? 0 : 1));
  return arr;
}

function ServerCard({ server, stars, onOpen }: { server: McpServer; stars?: number; onOpen: (t: RadarThing) => void }) {
  const router = useRouter();
  const detailSlug = slugForUrl(server.url);
  const handleOpen = () => {
    if (detailSlug) {
      posthog.capture("radar_tool_opened", { slug: detailSlug, from: "mcp" });
      router.push(`/tools/${detailSlug}`);
    } else {
      onOpen(mcpThing(server));
    }
  };
  const openExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(server.url, "_blank", "noopener,noreferrer");
  };
  return (
    <motion.button
      onClick={handleOpen}
      whileTap={{ scale: 0.97 }}
      transition={PRESS}
      style={{ display: "flex", flexDirection: "column", textAlign: "left", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "10px", cursor: "pointer", color: "inherit", boxShadow: INNER_HIGHLIGHT, overflow: "hidden" }}
    >
      <CoverImage src={ogProxy(server.url)} category={MCP_CATEGORY_SLUG[server.category]} height={132} radius={11} style={{ marginBottom: "10px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px", minHeight: "20px" }}>
        <FaceMark face="tool" category={MCP_CATEGORY_SLUG[server.category]} logoUrl={logoFor(server.url)} size={26} />
        <span style={{ flex: 1, minWidth: 0, fontSize: "14.5px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{server.name}</span>
        {server.by === "official" && (
          <span style={{ flexShrink: 0, fontSize: "10px", fontWeight: 600, letterSpacing: "0.03em", color: GOLD, background: GOLD_SOFT, borderRadius: "100px", padding: "2px 8px" }}>Official</span>
        )}
      </div>
      <span style={{ fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4, marginTop: "4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{server.tagline}</span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginTop: "auto", paddingTop: "11px", borderTop: `1px solid ${HAIRLINE}` }}>
        {stars != null && stars > 0 ? <MetricChip>{compact(stars)} stars</MetricChip> : <span />}
        <span role="button" tabIndex={-1} aria-label="Open website" onClick={openExternal} style={{ flexShrink: 0, display: "inline-flex", padding: "2px", borderRadius: "6px", cursor: "pointer" }}>
          <ArrowUpRight size={15} strokeWidth={2} color={TEXT.muted} />
        </span>
      </div>
    </motion.button>
  );
}

// ─── Skills ──────────────────────────────────────────────────────────────────
function skillThing(s: AiSkill): RadarThing {
  return {
    id: s.url, kind: "tool", name: s.name, valueLine: s.tagline, face: "essential",
    metric: null, typeLabel: `${s.platform} skill`, category: s.category, url: s.url,
    recency: null, storyTitle: null, storySource: null,
    description: s.description, topics: [], categorySlug: SKILL_CATEGORY_SLUG[s.category],
    imageUrl: ogProxy(s.url),
    logoUrl: logoFor(s.url),
  };
}

type SkillSort = "featured" | "az" | "platform";
const SKILL_SORTS: { id: SkillSort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "az", label: "A–Z" },
  { id: "platform", label: "Platform" },
];

function sortSkills(list: AiSkill[], sort: SkillSort): AiSkill[] {
  const arr = [...list];
  if (sort === "az") arr.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "platform") arr.sort((a, b) => a.platform.localeCompare(b.platform) || a.name.localeCompare(b.name));
  return arr; // "featured" keeps the curated order
}

function SkillCard({ skill, onOpen }: { skill: AiSkill; onOpen: (t: RadarThing) => void }) {
  const router = useRouter();
  const detailSlug = slugForUrl(skill.url);
  const handleOpen = () => {
    if (detailSlug) {
      posthog.capture("radar_tool_opened", { slug: detailSlug, from: "skills" });
      router.push(`/tools/${detailSlug}`);
    } else {
      onOpen(skillThing(skill));
    }
  };
  const openExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(skill.url, "_blank", "noopener,noreferrer");
  };
  return (
    <motion.button
      onClick={handleOpen}
      whileTap={{ scale: 0.97 }}
      transition={PRESS}
      style={{ display: "flex", flexDirection: "column", textAlign: "left", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "10px", cursor: "pointer", color: "inherit", boxShadow: INNER_HIGHLIGHT, overflow: "hidden" }}
    >
      <CoverImage src={ogProxy(skill.url)} category={SKILL_CATEGORY_SLUG[skill.category]} height={132} radius={11} style={{ marginBottom: "10px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px", minHeight: "20px" }}>
        <FaceMark face="essential" category={SKILL_CATEGORY_SLUG[skill.category]} logoUrl={logoFor(skill.url)} size={26} />
        <span style={{ flex: 1, minWidth: 0, fontSize: "14.5px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{skill.name}</span>
        <span style={{ flexShrink: 0, fontSize: "10px", fontWeight: 600, letterSpacing: "0.03em", color: TEXT.muted, background: "rgba(255,255,255,0.05)", border: `1px solid ${HAIRLINE}`, borderRadius: "100px", padding: "2px 8px", whiteSpace: "nowrap" }}>{skill.platform}</span>
      </div>
      <span style={{ fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4, marginTop: "4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{skill.tagline}</span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "auto", paddingTop: "11px", borderTop: `1px solid ${HAIRLINE}` }}>
        <span role="button" tabIndex={-1} aria-label="Open website" onClick={openExternal} style={{ flexShrink: 0, display: "inline-flex", padding: "2px", borderRadius: "6px", cursor: "pointer" }}>
          <ArrowUpRight size={15} strokeWidth={2} color={TEXT.muted} />
        </span>
      </div>
    </motion.button>
  );
}

// ─── Shared chrome ───────────────────────────────────────────────────────────
function Chips({ items, active, onPick }: { items: { key: string; emoji: string }[]; active: string; onPick: (k: string) => void }) {
  return (
    <div className="scrollbar-none" style={{ position: "sticky", top: 0, zIndex: 4, display: "flex", gap: "8px", padding: "10px 20px 10px", overflowX: "auto", background: `linear-gradient(to bottom, ${CANVAS} 75%, transparent)` }}>
      {items.map((c) => {
        const on = c.key === active;
        return (
          <button
            key={c.key}
            onClick={() => onPick(c.key)}
            style={{
              flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "6px",
              fontFamily: SG, fontSize: "13px", fontWeight: on ? 700 : 500,
              color: on ? "#ffffff" : TEXT.body,
              background: on ? GOLD : "rgba(255,255,255,0.05)",
              border: `1px solid ${on ? GOLD : HAIRLINE}`,
              borderRadius: "100px", padding: "6px 13px", cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "13px" }}>{c.emoji}</span>{c.key}
          </button>
        );
      })}
    </div>
  );
}

function SortBar({ items, active, onPick }: { items: { id: string; label: string }[]; active: string; onPick: (k: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 24px 14px" }}>
      <span style={{ fontSize: "12px", color: TEXT.muted }}>Sort</span>
      <div className="scrollbar-none" style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
        {items.map((s) => {
          const on = s.id === active;
          return (
            <button key={s.id} onClick={() => onPick(s.id)} style={{ flexShrink: 0, fontFamily: SG, fontSize: "12.5px", fontWeight: on ? 700 : 500, color: on ? TEXT.primary : TEXT.muted, background: on ? "rgba(255,255,255,0.07)" : "transparent", border: `1px solid ${on ? HAIRLINE : "transparent"}`, borderRadius: "100px", padding: "5px 11px", cursor: "pointer", whiteSpace: "nowrap" }}>
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionHead({ emoji, title, count }: { emoji: string; title: string; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 24px", marginBottom: "11px" }}>
      <span style={{ fontSize: "15px" }}>{emoji}</span>
      <h2 style={{ fontFamily: SG, fontSize: "16px", fontWeight: 700, color: TEXT.primary, margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
      <span style={{ fontSize: "12px", color: TEXT.muted, fontVariantNumeric: "tabular-nums" }}>{count}</span>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function McpMarketClient({ meta = {}, initialView = "mcp", servers = MCP_SERVERS, skills = AI_SKILLS }: { meta?: Record<string, McpMeta>; initialView?: View; servers?: McpServer[]; skills?: AiSkill[] }) {
  const isDesktop = useIsDesktop();
  const [view, setView] = useState<View>(initialView);
  const [activeCat, setActiveCat] = useState<string>(ALL);
  const [mcpSort, setMcpSort] = useState<McpSort>("popular");
  const [skillSort, setSkillSort] = useState<SkillSort>("featured");
  const [detail, setDetail] = useState<RadarThing | null>(null);

  // MCP grouping
  const mcpByCat = useMemo(() => {
    const m = new Map<McpCategory, McpServer[]>();
    for (const s of servers) { if (!m.has(s.category)) m.set(s.category, []); m.get(s.category)!.push(s); }
    return m;
  }, [servers]);
  const mcpCats = useMemo(() => MCP_CATEGORY_ORDER.filter((c) => mcpByCat.has(c)), [mcpByCat]);

  // Skills grouping
  const skillsByCat = useMemo(() => {
    const m = new Map<SkillCategory, AiSkill[]>();
    for (const s of skills) { if (!m.has(s.category)) m.set(s.category, []); m.get(s.category)!.push(s); }
    return m;
  }, [skills]);
  const skillCats = useMemo(() => SKILL_CATEGORY_ORDER.filter((c) => skillsByCat.has(c)), [skillsByCat]);

  const switchView = (v: View) => { setView(v); setActiveCat(ALL); posthog.capture("radar_catalog_view", { view: v }); };

  const onOpen = (t: RadarThing, kind: View) => {
    setDetail(t);
    posthog.capture(kind === "mcp" ? "radar_mcp_opened" : "radar_skills_opened", { id: t.id });
  };

  const chipItems = view === "mcp"
    ? [{ key: ALL, emoji: "🔌" }, ...mcpCats.map((c) => ({ key: c, emoji: MCP_CATEGORY_EMOJI[c] }))]
    : [{ key: ALL, emoji: "✨" }, ...skillCats.map((c) => ({ key: c, emoji: SKILL_CATEGORY_EMOJI[c] }))];

  // Same items, with counts, for the desktop category sidebar.
  const sidebarItems = view === "mcp"
    ? [{ key: ALL, emoji: "🔌", count: servers.length }, ...mcpCats.map((c) => ({ key: c, emoji: MCP_CATEGORY_EMOJI[c], count: mcpByCat.get(c)?.length ?? 0 }))]
    : [{ key: ALL, emoji: "✨", count: skills.length }, ...skillCats.map((c) => ({ key: c, emoji: SKILL_CATEGORY_EMOJI[c], count: skillsByCat.get(c)?.length ?? 0 }))];
  const pickCat = (k: string) => { setActiveCat(k); posthog.capture(view === "mcp" ? "radar_mcp_category" : "radar_skills_category", { category: k }); };

  const visibleMcpCats = activeCat === ALL ? mcpCats : (mcpCats.includes(activeCat as McpCategory) ? [activeCat as McpCategory] : []);
  const visibleSkillCats = activeCat === ALL ? skillCats : (skillCats.includes(activeCat as SkillCategory) ? [activeCat as SkillCategory] : []);

  return (
    <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", overflowX: "hidden", background: CANVAS, paddingBottom: "28px" }}>
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
            <h1 style={{ fontFamily: SG, fontSize: "27px", fontWeight: 700, color: TEXT.primary, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.05 }}>MCP and skills</h1>
            <p style={{ fontSize: "13.5px", color: TEXT.muted, margin: "3px 0 0" }}>Connect and extend your assistant — servers and skills</p>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div style={{ padding: "0 24px 12px" }}>
        <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", border: `1px solid ${HAIRLINE}`, borderRadius: "100px", padding: "3px" }}>
          {([["mcp", "MCP servers"], ["skills", "Skills"]] as const).map(([v, label]) => {
            const on = view === v;
            return (
              <button key={v} onClick={() => switchView(v)} style={{ fontFamily: SG, fontSize: "13px", fontWeight: on ? 700 : 600, color: on ? "#ffffff" : TEXT.body, background: on ? GOLD : "transparent", border: "none", borderRadius: "100px", padding: "7px 16px", cursor: "pointer", whiteSpace: "nowrap" }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile category chips (desktop uses the sidebar below) */}
      {!isDesktop && (
        <Chips items={chipItems} active={activeCat} onPick={pickCat} />
      )}

      {/* Body: category sidebar (desktop) + sort + sections */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: isDesktop ? "8px" : "0" }}>
        {isDesktop && (
          <aside className="scrollbar-none" style={{ width: "200px", flexShrink: 0, position: "sticky", top: "12px", maxHeight: "calc(100dvh - 24px)", overflowY: "auto", padding: "8px 0 0 20px" }}>
            <p style={{ fontFamily: SG, fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: TEXT.muted, margin: "2px 0 8px 8px" }}>Categories</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {sidebarItems.map((c) => {
                const on = c.key === activeCat;
                return (
                  <button
                    key={c.key}
                    onClick={() => pickCat(c.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px", width: "100%", textAlign: "left",
                      fontFamily: SG, fontSize: "13px", fontWeight: on ? 700 : 500,
                      color: on ? "#ffffff" : TEXT.body,
                      background: on ? GOLD : "transparent",
                      border: `1px solid ${on ? GOLD : "transparent"}`,
                      borderRadius: "10px", padding: "8px 10px", cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: "13px", flexShrink: 0 }}>{c.emoji}</span>
                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.key}</span>
                    <span style={{ flexShrink: 0, fontSize: "11px", opacity: 0.6, fontVariantNumeric: "tabular-nums" }}>{c.count}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Sort */}
          {view === "mcp" ? (
            <SortBar items={MCP_SORTS} active={mcpSort} onPick={(k) => { setMcpSort(k as McpSort); posthog.capture("radar_mcp_sort", { sort: k }); }} />
          ) : (
            <SortBar items={SKILL_SORTS} active={skillSort} onPick={(k) => { setSkillSort(k as SkillSort); posthog.capture("radar_skills_sort", { sort: k }); }} />
          )}

          {/* Sections */}
          {view === "mcp"
            ? visibleMcpCats.map((cat) => {
                const servers = sortServers(mcpByCat.get(cat) ?? [], mcpSort, meta);
                if (servers.length === 0) return null;
                return (
                  <section key={cat} style={{ marginBottom: "26px" }}>
                    <SectionHead emoji={MCP_CATEGORY_EMOJI[cat]} title={cat} count={servers.length} />
                    <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr 1fr", gap: "10px", padding: "0 20px" }}>
                      {servers.map((s) => <ServerCard key={s.url} server={s} stars={meta[s.url]?.stars} onOpen={(t) => onOpen(t, "mcp")} />)}
                    </div>
                  </section>
                );
              })
            : visibleSkillCats.map((cat) => {
                const skills = sortSkills(skillsByCat.get(cat) ?? [], skillSort);
                if (skills.length === 0) return null;
                return (
                  <section key={cat} style={{ marginBottom: "26px" }}>
                    <SectionHead emoji={SKILL_CATEGORY_EMOJI[cat]} title={cat} count={skills.length} />
                    <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr 1fr", gap: "10px", padding: "0 20px" }}>
                      {skills.map((s) => <SkillCard key={s.url} skill={s} onOpen={(t) => onOpen(t, "skills")} />)}
                    </div>
                  </section>
                );
              })}
        </div>
      </div>

      <RadarDetailSheet thing={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
