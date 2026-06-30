"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog-content";
import { GOLD, GOLD_SOFT, GOLD_BORDER, SG, TEXT } from "@/lib/design-tokens";
import styles from "../../app/(web)/blog/blog.module.css";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function tagChip(tag: string, small?: boolean) {
  return (
    <span style={{ display: "inline-block", fontFamily: SG, fontSize: small ? "10.5px" : "11.5px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: GOLD, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: "100px", padding: small ? "2px 9px" : "3px 10px" }}>
      {tag}
    </span>
  );
}

function postMeta(p: BlogPost, toolCount: number) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "12px 0 0", fontSize: "12.5px", color: TEXT.muted }}>
      <span>{fmtDate(p.date)}</span>
      <span aria-hidden>·</span>
      <span>{p.readingMin} min read</span>
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
}: {
  posts: BlogPost[];
  tags: string[];
  toolCounts: Record<string, number>;
}) {
  const [activeTag, setActiveTag] = useState<string>("All");

  const filtered = activeTag === "All" ? posts : posts.filter((p) => p.tag === activeTag);
  const [featured, ...rest] = filtered;

  return (
    <>
      {/* Tag filter */}
      <div className={styles.filterBar}>
        {["All", ...tags].map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`${styles.filterChip} ${activeTag === tag ? styles.filterChipActive : ""}`}
          >
            {tag}
            {tag !== "All" && (
              <span style={{ marginLeft: "6px", color: "inherit", opacity: 0.55, fontWeight: 400, fontSize: "12px" }}>
                {posts.filter((p) => p.tag === tag).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Featured (first in filtered set) */}
      {featured && (
        <Link href={`/blog/${featured.slug}`} className={styles.featuredCard}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={featured.hero.src} alt="" className={styles.featuredThumb} />
          <div className={styles.featuredBody}>
            {tagChip(featured.tag)}
            <h2 style={{ fontFamily: SG, fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.025em", lineHeight: 1.15, margin: "12px 0 0" }}>
              {featured.title}
            </h2>
            <p style={{ fontSize: "15px", color: TEXT.muted, lineHeight: 1.55, margin: "10px 0 0", maxWidth: "560px" }}>{featured.deck}</p>
            {postMeta(featured, toolCounts[featured.slug] ?? 0)}
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", margin: "16px 0 0", color: GOLD, fontWeight: 600, fontFamily: SG, fontSize: "14px" }}>
              Read the article <ArrowRight size={15} strokeWidth={2.4} />
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
                {tagChip(p.tag, true)}
                <h2 style={{ fontFamily: SG, fontSize: "18px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.02em", lineHeight: 1.22, margin: "10px 0 0" }}>
                  {p.title}
                </h2>
                <p style={{ fontSize: "13.5px", color: TEXT.muted, lineHeight: 1.5, margin: "8px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.deck}</p>
                {postMeta(p, toolCounts[p.slug] ?? 0)}
              </div>
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p style={{ fontSize: "15px", color: TEXT.muted, margin: "40px 0", textAlign: "center" }}>No posts in this category yet.</p>
      )}
    </>
  );
}
