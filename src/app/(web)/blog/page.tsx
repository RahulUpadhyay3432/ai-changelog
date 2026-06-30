import type { Metadata } from "next";
import { BLOG_POSTS, postTools } from "@/lib/blog-content";
import { GOLD, SG, TEXT } from "@/lib/design-tokens";
import { BlogIndexClient } from "@/components/blog/BlogIndexClient";

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

  // Top reads = most comprehensive (most tools), pick 7
  const topPosts = [...posts]
    .sort((a, b) => (toolCounts[b.slug] ?? 0) - (toolCounts[a.slug] ?? 0))
    .slice(0, 7);

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header style={{ margin: "4px 0 36px" }}>
        <span style={{ fontFamily: SG, fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: GOLD }}>
          The Kapyn Blog
        </span>
        <h1 style={{ fontFamily: SG, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.06, margin: "10px 0 0", color: TEXT.primary }}>
          Guides on the AI tools worth using
        </h1>
        <p style={{ fontSize: "15px", color: TEXT.muted, lineHeight: 1.55, margin: "12px 0 0", maxWidth: "520px" }}>
          {DESC}
        </p>
      </header>

      <BlogIndexClient posts={posts} tags={tags} toolCounts={toolCounts} topPosts={topPosts} />
    </>
  );
}
