"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import { KIND_LABEL, KIND_ORDER, faviconFor, searchAll, type SearchResult } from "@/lib/search-index";
import { GOLD, HAIRLINE, SURFACE, TEXT, SG } from "@/lib/design-tokens";

// Global ⌘K / Ctrl-K command palette over the shared search index. Mounted on
// the full-width web/radar/landing surfaces (not the phone (app) frame), so it
// portals to document.body safely.
export function CommandPalette() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  // Flat, ordered result list (capped per group) for keyboard navigation.
  const results = useMemo<SearchResult[]>(() => {
    if (query.trim().length < 1) return [];
    const grouped = searchAll(query, 6);
    return KIND_ORDER.flatMap((k) => grouped[k]);
  }, [query]);

  useEffect(() => setActive(0), [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  // Global open shortcut: ⌘K / Ctrl-K (and "/" when not already typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      const el = document.activeElement;
      const typing = el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (!open && e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus input + lock scroll while open.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = useCallback(
    (r: SearchResult | undefined) => {
      if (!r) return;
      close();
      router.push(r.href);
    },
    [router, close],
  );

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[active]); }
  };

  if (!mounted || !open) return null;

  let flatIndex = -1;
  const grouped = searchAll(query, 6);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(6,6,6,0.66)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "12vh 20px 20px",
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: "600px", background: "#15140f", border: `1px solid ${HAIRLINE}`,
          borderRadius: "16px", boxShadow: "0 24px 60px rgba(0,0,0,0.55)", overflow: "hidden",
          display: "flex", flexDirection: "column", maxHeight: "70vh",
        }}
      >
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: `1px solid ${HAIRLINE}` }}>
          <Search size={18} color={TEXT.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search tools, MCP servers, skills, guides…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "16px", color: TEXT.primary, caretColor: GOLD }}
          />
          <kbd style={{ flexShrink: 0, fontFamily: SG, fontSize: "11px", fontWeight: 600, color: TEXT.muted, background: "rgba(255,255,255,0.05)", border: `1px solid ${HAIRLINE}`, borderRadius: "6px", padding: "2px 7px" }}>esc</kbd>
        </div>

        {/* Results */}
        <div className="scrollbar-none" style={{ overflowY: "auto", padding: "8px" }}>
          {query.trim().length < 1 ? (
            <p style={{ fontSize: "13px", color: TEXT.muted, padding: "18px 12px", margin: 0, lineHeight: 1.6 }}>
              Search {KIND_ORDER.length > 0 ? "everything" : ""} across the catalog, tools, MCP servers, AI skills, and guides.
            </p>
          ) : results.length === 0 ? (
            <p style={{ fontSize: "13px", color: TEXT.muted, padding: "18px 12px", margin: 0 }}>
              No matches for &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            KIND_ORDER.filter((k) => grouped[k].length > 0).map((kind) => (
              <div key={kind} style={{ marginBottom: "6px" }}>
                <p style={{ fontFamily: SG, fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: TEXT.muted, margin: "8px 10px 4px" }}>
                  {KIND_LABEL[kind]}
                </p>
                {grouped[kind].map((r) => {
                  flatIndex += 1;
                  const idx = flatIndex;
                  const isActive = idx === active;
                  const fav = faviconFor(r.siteUrl);
                  return (
                    <button
                      key={r.href}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => go(r)}
                      style={{
                        display: "flex", alignItems: "center", gap: "11px", width: "100%", textAlign: "left",
                        padding: "9px 10px", borderRadius: "10px", border: "none", cursor: "pointer",
                        background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                      }}
                    >
                      {fav ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fav} alt="" width={20} height={20} style={{ borderRadius: "5px", flexShrink: 0 }} />
                      ) : (
                        <span style={{ width: "20px", height: "20px", flexShrink: 0, borderRadius: "5px", background: "rgba(255,255,255,0.06)" }} />
                      )}
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: TEXT.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                        <span style={{ display: "block", fontSize: "12px", color: TEXT.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.tagline}</span>
                      </span>
                      {isActive && <CornerDownLeft size={14} color={TEXT.muted} strokeWidth={2} style={{ flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
