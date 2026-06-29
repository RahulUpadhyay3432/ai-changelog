"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import { ALL_RESULTS, KIND_LABEL, KIND_ORDER, faviconFor, searchAll, totalResults } from "@/lib/search-index";
import { GOLD, HAIRLINE, SURFACE, TEXT, SG } from "@/lib/design-tokens";
import styles from "../layout.module.css";

function SearchInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  // Autofocus on mount.
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Sync query to URL without hard navigation.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("q", query);
    else params.delete("q");
    router.replace(`/search${params.size ? `?${params}` : ""}`, { scroll: false });
  }, [query, router, searchParams]);

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= 2;
  const grouped = hasQuery ? searchAll(trimmed) : null;
  const total = grouped ? totalResults(grouped) : 0;

  return (
    <main className={styles.main} style={{ paddingTop: "40px", paddingBottom: "60px" }}>
      {/* Heading */}
      <h1 style={{ fontFamily: SG, fontSize: "28px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.03em", margin: "0 0 6px" }}>
        Search Kapyn
      </h1>
      <p style={{ fontSize: "14px", color: TEXT.muted, margin: "0 0 28px" }}>
        Tools, MCP servers, AI skills, and guides — all in one place.
      </p>

      {/* Search input */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "14px", padding: "12px 16px", marginBottom: "32px" }}>
        <Search size={18} color={TEXT.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools, MCP servers, skills, guides…"
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            fontSize: "16px", color: TEXT.primary, caretColor: GOLD,
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear"
            style={{ background: "none", border: "none", color: TEXT.muted, cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "18px" }}
          >
            ×
          </button>
        )}
      </div>

      {/* Empty state */}
      {!hasQuery && (
        <div style={{ color: TEXT.muted, fontSize: "14px", lineHeight: 1.6 }}>
          <p style={{ margin: "0 0 20px" }}>
            Start typing to search across {ALL_RESULTS.length}+ tools, MCP servers, AI skills, and guides.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {["cursor", "claude", "supabase", "github", "mcp", "rag"].map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                style={{
                  fontFamily: SG, fontSize: "13px", fontWeight: 500, color: TEXT.body,
                  background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "100px",
                  padding: "6px 14px", cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {hasQuery && total === 0 && (
        <div style={{ color: TEXT.muted, fontSize: "14px", lineHeight: 1.7 }}>
          <p>No results for <strong style={{ color: TEXT.body }}>&ldquo;{trimmed}&rdquo;</strong>.</p>
          <p>
            Try the{" "}
            <Link href="/radar/browse" style={{ color: GOLD, textDecoration: "none" }}>
              radar browse
            </Link>{" "}
            for everything on the map.
          </p>
        </div>
      )}

      {/* Results */}
      {grouped && total > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
          {KIND_ORDER.filter((k) => grouped[k].length > 0).map((kind) => (
            <div key={kind}>
              <h2 style={{ fontFamily: SG, fontSize: "13px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: TEXT.muted, margin: "0 0 12px" }}>
                {KIND_LABEL[kind]} <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>({grouped[kind].length})</span>
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {grouped[kind].map((r) => {
                  const fav = faviconFor(r.siteUrl);
                  return (
                    <Link key={r.href} href={r.href} style={{ textDecoration: "none", display: "block" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "12px", color: "inherit" }}>
                        {fav && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={fav} alt="" width={22} height={22} style={{ borderRadius: "6px", flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontFamily: SG, fontSize: "14.5px", fontWeight: 600, color: TEXT.primary }}>{r.name}</span>
                            <span style={{ fontSize: "11px", fontWeight: 600, color: TEXT.muted, background: "rgba(255,255,255,0.05)", border: `1px solid ${HAIRLINE}`, borderRadius: "100px", padding: "1px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>{r.category}</span>
                          </div>
                          <span style={{ fontSize: "12.5px", color: TEXT.muted, display: "block", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.tagline}</span>
                        </div>
                        <ArrowUpRight size={15} color={TEXT.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}
