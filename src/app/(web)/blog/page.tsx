import type { Metadata } from "next";
import { BLOG_POSTS, postTools } from "@/lib/blog-content";
import { GOLD, SG, TEXT } from "@/lib/design-tokens";
import { BlogIndexClient } from "@/components/blog/BlogIndexClient";
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

export default function BlogIndex() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

  const tags = [...new Set(posts.map((p) => p.tag))].sort();
  const toolCounts = Object.fromEntries(posts.map((p) => [p.slug, postTools(p).length]));

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

  return (
    <div className={styles.indexShell}>
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

      <BlogIndexClient posts={posts} tags={tags} toolCounts={toolCounts} />
    </div>
  );
}
