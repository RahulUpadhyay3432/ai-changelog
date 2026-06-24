import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS, postTools } from "@/lib/blog-content";
import { GOLD, GOLD_SOFT, GOLD_BORDER, SG, TEXT } from "@/lib/design-tokens";
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
  const [featured, ...rest] = posts;

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
      image: p.hero?.src,
      url: `${APP_URL}/blog/${p.slug}`,
      author: { "@type": "Organization", name: "Kapyn" },
    })),
  };

  const tagChip = (tag: string, small?: boolean) => (
    <span style={{ display: "inline-block", fontFamily: SG, fontSize: small ? "10.5px" : "11.5px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: GOLD, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: "100px", padding: small ? "2px 9px" : "3px 10px" }}>
      {tag}
    </span>
  );

  const meta = (p: (typeof posts)[number]) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "12px 0 0", fontSize: "12.5px", color: TEXT.muted }}>
      <span>{fmtDate(p.date)}</span>
      <span aria-hidden>·</span>
      <span>{p.readingMin} min read</span>
      <span aria-hidden>·</span>
      <span>{postTools(p).length} tools</span>
    </div>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header style={{ margin: "4px 0 30px" }}>
        <span style={{ fontFamily: SG, fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: GOLD }}>
          The Kapyn Blog
        </span>
        <h1 style={{ fontFamily: SG, fontSize: "clamp(30px, 5vw, 42px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.06, margin: "12px 0 0", color: TEXT.primary }}>
          Guides on the AI and tools worth using
        </h1>
        <p style={{ fontSize: "16px", color: TEXT.muted, lineHeight: 1.55, margin: "14px 0 0", maxWidth: "560px" }}>
          {DESC}
        </p>
      </header>

      {/* Featured (newest) */}
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
            {meta(featured)}
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", margin: "16px 0 0", color: GOLD, fontWeight: 600, fontFamily: SG, fontSize: "14px" }}>
              Read the article <ArrowRight size={15} strokeWidth={2.4} />
            </span>
          </div>
        </Link>
      )}

      {/* Rest — grid with thumbnails */}
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
              {meta(p)}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
