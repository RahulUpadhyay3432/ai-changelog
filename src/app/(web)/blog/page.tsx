import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS, postTools } from "@/lib/blog-content";
import { GOLD, GOLD_SOFT, GOLD_BORDER, HAIRLINE, SG } from "@/lib/design-tokens";
import styles from "./blog.module.css";

const APP_URL = "https://kapyn.app";

export const revalidate = 3600;

const DESC =
  "Guides and deep dives on the AI and front-end tools worth using — calm, sourced, and free. From the team behind Kapyn Radar.";

export const metadata: Metadata = {
  title: "The Kapyn Blog",
  description: DESC,
  alternates: { canonical: `${APP_URL}/blog` },
  openGraph: {
    title: "The Kapyn Blog",
    description: DESC,
    url: `${APP_URL}/blog`,
    siteName: "Kapyn",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "The Kapyn Blog", description: DESC },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogIndex() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "The Kapyn Blog",
    url: `${APP_URL}/blog`,
    description: DESC,
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.deck,
      datePublished: p.date,
      url: `${APP_URL}/blog/${p.slug}`,
      author: { "@type": "Organization", name: "Kapyn" },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header style={{ margin: "4px 0 28px" }}>
        <span style={{ fontFamily: SG, fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: GOLD }}>
          The Kapyn Blog
        </span>
        <h1 style={{ fontFamily: SG, fontSize: "clamp(30px, 5vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, margin: "12px 0 0", color: "#f5f5f5" }}>
          Guides on the AI and tools worth using
        </h1>
        <p style={{ fontSize: "16px", color: "#a3a3a3", lineHeight: 1.55, margin: "14px 0 0", maxWidth: "560px" }}>
          {DESC}
        </p>
      </header>

      <div className={styles.posts}>
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            style={{ display: "block", textDecoration: "none", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "22px 22px" }}
          >
            <span style={{ display: "inline-block", fontFamily: SG, fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: GOLD, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: "100px", padding: "3px 10px" }}>
              {p.tag}
            </span>
            <h2 style={{ fontFamily: SG, fontSize: "21px", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", lineHeight: 1.2, margin: "12px 0 0" }}>
              {p.title}
            </h2>
            <p style={{ fontSize: "14.5px", color: "#a3a3a3", lineHeight: 1.55, margin: "8px 0 0" }}>{p.deck}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "14px 0 0", fontSize: "13px", color: "#737373" }}>
              <span>{fmtDate(p.date)}</span>
              <span aria-hidden>·</span>
              <span>{p.readingMin} min read</span>
              <span aria-hidden>·</span>
              <span>{postTools(p).length} tools</span>
              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "4px", color: GOLD, fontWeight: 600, fontFamily: SG }}>
                Read <ArrowRight size={14} strokeWidth={2.4} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
