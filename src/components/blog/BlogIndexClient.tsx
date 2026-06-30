"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog-content";
import { GOLD, GOLD_SOFT, GOLD_BORDER, SG, TEXT } from "@/lib/design-tokens";
import styles from "../../app/(web)/blog/blog.module.css";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TagPill({ tag, small }: { tag: string; small?: boolean }) {
  return (
    <span style={{ display: "inline-block", fontFamily: SG, fontSize: small ? "10.5px" : "11.5px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: GOLD, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: "100px", padding: small ? "2px 9px" : "3px 10px" }}>
      {tag}
    </span>
  );
}

function PostMeta({ p, toolCount }: { p: BlogPost; toolCount: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0 0", fontSize: "12px", color: TEXT.muted }}>
      <span>{fmtDate(p.date)}</span>
      <span aria-hidden>·</span>
      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
        <Clock size={11} strokeWidth={2} style={{ flexShrink: 0 }} />
        {p.readingMin} min
      </span>
      {toolCount > 0 && (
        <>
          <span aria-hidden>·</span>
          <span>{toolCount} tools</span>
        </>
      )}
    </div>
  );
}

export function BlogIndexClient({
  posts,
  tags,
  toolCounts,
  topPosts,
}: {
  posts: BlogPost[];
  tags: string[];
  toolCounts: Record<string, number>;
  topPosts: BlogPost[];
}) {
  const [activeTag, setActiveTag] = useState<string>("All");

  const filtered = activeTag === "All" ? posts : posts.filter((p) => p.tag === activeTag);
  const [featured, ...rest] = filtered;

  return (
    <div className={styles.indexLayout}>
      {/* ── Left sidebar: category nav ───────────────────────────────────────── */}
      <aside className={styles.leftSidebar}>
        <p className={styles.sidebarLabel}>Browse by type</p>
        <ul className={styles.navTagList}>
          {["All", ...tags].map((tag) => {
            const count = tag === "All" ? posts.length : posts.filter((p) => p.tag === tag).length;
            return (
              <li key={tag}>
                <button
                  onClick={() => setActiveTag(tag)}
                  className={activeTag === tag ? styles.navTagActive : styles.navTag}
                >
                  <span>{tag}</span>
                  <span className={styles.navTagCount}>{count}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Mobile chips — shown only on small screens */}
        <div className={styles.mobileChips}>
          {["All", ...tags].map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`${styles.filterChip} ${activeTag === tag ? styles.filterChipActive : ""}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Center: featured + grid ───────────────────────────────────────────── */}
      <div className={styles.centerCol}>
        {/* Featured */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className={styles.featuredCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featured.hero.src} alt="" className={styles.featuredThumb} />
            <div className={styles.featuredBody}>
              <TagPill tag={featured.tag} />
              <h2 style={{ fontFamily: SG, fontSize: "clamp(20px, 2.5vw, 26px)", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.025em", lineHeight: 1.15, margin: "10px 0 0" }}>
                {featured.title}
              </h2>
              <p style={{ fontSize: "14px", color: TEXT.muted, lineHeight: 1.55, margin: "8px 0 0" }}>{featured.deck}</p>
              <PostMeta p={featured} toolCount={toolCounts[featured.slug] ?? 0} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", margin: "14px 0 0", color: GOLD, fontWeight: 600, fontFamily: SG, fontSize: "13.5px" }}>
                Read the article <ArrowRight size={14} strokeWidth={2.4} />
              </span>
            </div>
          </Link>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className={styles.postGrid}>
            {rest.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.postCard}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.hero.src} alt="" className={styles.postThumb} loading="lazy" />
                <div className={styles.postCardBody}>
                  <TagPill tag={p.tag} small />
                  <h2 style={{ fontFamily: SG, fontSize: "16px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.02em", lineHeight: 1.25, margin: "8px 0 0" }}>
                    {p.title}
                  </h2>
                  <p style={{ fontSize: "13px", color: TEXT.muted, lineHeight: 1.5, margin: "6px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.deck}</p>
                  <PostMeta p={p} toolCount={toolCounts[p.slug] ?? 0} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <p style={{ fontSize: "15px", color: TEXT.muted, margin: "60px 0", textAlign: "center" }}>No posts in this category yet.</p>
        )}
      </div>

      {/* ── Right sidebar: top reads ──────────────────────────────────────────── */}
      <aside className={styles.rightSidebar}>
        <p className={styles.sidebarLabel}>Top reads</p>
        <ul className={styles.topReadsList}>
          {topPosts.map((p, i) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className={styles.topReadCard}>
                <span className={styles.topReadRank}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ display: "block", flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: SG, fontSize: "13.5px", fontWeight: 600, color: TEXT.primary, lineHeight: 1.3, letterSpacing: "-0.01em" }}>{p.title}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "5px", fontSize: "11.5px", color: TEXT.muted }}>
                    <TagPill tag={p.tag} small />
                    <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <Clock size={10} strokeWidth={2} />
                      {p.readingMin} min
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
