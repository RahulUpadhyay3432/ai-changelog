"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trophy, MapPin, Users, Calendar, Building2, ArrowUpRight, type LucideIcon } from "lucide-react";
import posthog from "posthog-js";
import type { Hackathon } from "@/lib/hackathons";
import { CoverImage, GOLD, SG, TEXT } from "./radar-shared";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

// One labelled meta line — muted icon + warm value. Mirrors the radar card meta.
function MetaRow({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Icon size={16} color={TEXT.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: "13.5px", color: TEXT.muted, width: "84px", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "14px", color: TEXT.body, fontWeight: 500, minWidth: 0 }}>{value}</span>
    </div>
  );
}

function Sheet({ hackathon: h, onClose }: { hackathon: Hackathon; onClose: () => void }) {
  const isDesktop = useIsDesktop();
  const open = h.openState.toLowerCase() === "open";
  const brief = h.description?.trim();
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", justifyContent: "flex-end", pointerEvents: "none" }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", pointerEvents: "all" }}
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => { if (info.offset.y > 80) onClose(); }}
        style={{
          position: "relative",
          width: isDesktop ? "min(600px, 100%)" : undefined,
          alignSelf: isDesktop ? "center" : undefined,
          background: "#111111", borderRadius: "20px 20px 0 0", padding: "0 0 calc(env(safe-area-inset-bottom, 0px) + 18px)", pointerEvents: "all", minHeight: "58dvh", maxHeight: "94dvh", display: "flex", flexDirection: "column", overflow: "hidden"
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0", flexShrink: 0, position: "absolute", top: 0, left: 0, right: 0, zIndex: 2 }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.4)" }} />
        </div>

        {/* Cover image with open/upcoming badge + close */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <CoverImage src={h.imageUrl} category="startups" height={150} radius={0} />
          <span style={{ position: "absolute", top: "14px", left: "16px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: open ? "#ffffff" : TEXT.primary, background: open ? GOLD : "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", borderRadius: "100px", padding: "4px 10px" }}>
            {open ? "Open now" : "Upcoming"}
          </span>
          <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: "12px", right: "12px", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color="#e8e8e8" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "16px 20px 0", overflowY: "auto", flex: 1 }}>
          <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: "#f3efe9", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{h.title}</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "11px", marginTop: "16px" }}>
            {h.dates && <MetaRow Icon={Calendar} label="When" value={h.dates} />}
            {h.prize && <MetaRow Icon={Trophy} label="Prize pool" value={h.prize} />}
            <MetaRow Icon={MapPin} label="Where" value={h.isOnline ? "Online" : h.location || "In-person"} />
            {h.participants != null && h.participants > 0 && <MetaRow Icon={Users} label="Registered" value={h.participants.toLocaleString()} />}
            {h.organization && <MetaRow Icon={Building2} label="Host" value={h.organization} />}
          </div>

          {brief && (
            <p style={{ fontSize: "14.5px", lineHeight: 1.6, color: "#cfcbc4", margin: "18px 0 0" }}>{brief}</p>
          )}

          {h.themes.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "16px" }}>
              {h.themes.slice(0, 8).map((t) => (
                <span key={t} style={{ fontSize: "12px", fontWeight: 500, color: TEXT.body, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "100px", padding: "4px 11px" }}>{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Footer — Register is the only external hop */}
        <div style={{ padding: "14px 20px 0", flexShrink: 0 }}>
          <a
            href={h.url} target="_blank" rel="noopener noreferrer"
            onClick={() => posthog.capture("radar_hackathon_opened", { source: h.source, online: h.isOnline })}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", fontFamily: SG, fontSize: "15px", fontWeight: 600, color: "#ffffff", background: GOLD, border: "none", borderRadius: "13px", padding: "14px", textDecoration: "none" }}
          >
            Register <ArrowUpRight size={17} strokeWidth={2.4} />
          </a>
        </div>
      </motion.div>
    </div>
  );
}

export function HackathonDetailSheet({ hackathon, onClose }: { hackathon: Hackathon | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  const container = document.getElementById("phone-overlay-root") ?? document.body;
  return createPortal(
    <AnimatePresence>{hackathon && <Sheet hackathon={hackathon} onClose={onClose} />}</AnimatePresence>,
    container
  );
}
