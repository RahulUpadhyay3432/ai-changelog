import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ArrowRight } from "lucide-react";
import { BLOG_POSTS, getPost, postTools, type BlogTool } from "@/lib/blog-content";
import { MermaidDiagram } from "@/components/blog/MermaidDiagram";
import { GOLD, GOLD_SOFT, GOLD_BORDER, HAIRLINE, SG } from "@/lib/design-tokens";
import styles from "../blog.module.css";

const APP_URL = "https://kapyn.app";

export const revalidate = 3600;

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found", robots: { index: false, follow: true } };
  const url = `${APP_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.deck,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.deck,
      url,
      siteName: "Kapyn",
      type: "article",
      publishedTime: post.date,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.deck },
  };
}

function faviconFor(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return `/api/favicon?domain=${encodeURIComponent(host)}`;
  } catch {
    return null;
  }
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function ToolCard({ tool }: { tool: BlogTool }) {
  const fav = faviconFor(tool.url);
  let host = tool.url;
  try { host = new URL(tool.url).hostname.replace(/^www\./, ""); } catch {}
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "flex", gap: "12px", textDecoration: "none", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "14px", padding: "14px 15px" }}
    >
      <span style={{ flexShrink: 0, width: "36px", height: "36px", borderRadius: "9px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {fav ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fav} alt="" width={24} height={24} loading="lazy" style={{ display: "block" }} />
        ) : null}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: SG, fontSize: "15px", fontWeight: 600, color: "#f5f5f5" }}>
          {tool.name}
          <ArrowUpRight size={13} strokeWidth={2.2} color="#737373" style={{ flexShrink: 0 }} />
        </span>
        <span style={{ display: "block", fontSize: "13px", color: "#a3a3a3", lineHeight: 1.45, margin: "3px 0 2px" }}>{tool.valueLine}</span>
        <span style={{ fontSize: "12px", color: "#5c6470", fontFamily: SG }}>{host}</span>
      </span>
    </a>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const tools = postTools(post);
  const url = `${APP_URL}/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.deck,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "Kapyn", url: APP_URL },
    publisher: { "@type": "Organization", name: "Kapyn", url: APP_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: post.title,
    itemListElement: tools.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      url: t.url,
      description: t.valueLine,
    })),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />

      <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: "#a3a3a3", textDecoration: "none", margin: "0 0 18px" }}>
        <ArrowLeft size={14} strokeWidth={2.3} /> All posts
      </Link>

      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerGlow} aria-hidden />
        <div className={styles.bannerInner}>
          <span style={{ display: "inline-block", fontFamily: SG, fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: GOLD, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: "100px", padding: "3px 10px" }}>
            {post.tag}
          </span>
          <h1 style={{ fontFamily: SG, fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f6f4f0", letterSpacing: "-0.03em", lineHeight: 1.1, margin: "14px 0 0" }}>
            {post.title}
          </h1>
          <p style={{ fontSize: "16px", color: "#cbc7bf", lineHeight: 1.55, margin: "14px 0 0", maxWidth: "560px" }}>{post.deck}</p>
          <p style={{ fontSize: "13px", color: "#9a96b0", margin: "16px 0 0" }}>
            By Kapyn · {fmtDate(post.date)} · {post.readingMin} min read
          </p>
        </div>
      </div>

      {/* Intro */}
      {post.intro.map((para, i) => (
        <p key={i} style={{ fontSize: "16.5px", color: "#d5d2cb", lineHeight: 1.7, margin: i === 0 ? "0" : "16px 0 0" }}>{para}</p>
      ))}

      {/* Sections */}
      {post.sections.map((sec) => (
        <section key={sec.heading} style={{ margin: "34px 0 0" }}>
          <h2 style={{ fontFamily: SG, fontSize: "22px", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", margin: 0 }}>{sec.heading}</h2>
          <p style={{ fontSize: "15.5px", color: "#b3afa8", lineHeight: 1.65, margin: "10px 0 0" }}>{sec.intro}</p>
          {sec.diagram && <MermaidDiagram chart={sec.diagram} />}
          <div className={styles.toolGrid}>
            {sec.tools.map((t) => <ToolCard key={t.name} tool={t} />)}
          </div>
        </section>
      ))}

      {/* Closing */}
      <p style={{ fontSize: "16.5px", color: "#d5d2cb", lineHeight: 1.7, margin: "34px 0 0" }}>{post.closing}</p>

      {/* CTA → Radar */}
      <div style={{ margin: "30px 0 0", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "20px 22px" }}>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <h3 style={{ fontFamily: SG, fontSize: "17px", fontWeight: 700, color: "#f5f5f5", margin: 0 }}>Find these on the Radar</h3>
          <p style={{ fontSize: "14px", color: "#a3a3a3", margin: "6px 0 0", lineHeight: 1.5 }}>Every tool here lives on Kapyn Radar. Save the ones that fit into a Loadout and find them again.</p>
        </div>
        <Link href="/radar/browse" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#ffffff", background: GOLD, borderRadius: "12px", padding: "12px 20px", textDecoration: "none" }}>
          Open the Radar <ArrowRight size={16} strokeWidth={2.4} />
        </Link>
      </div>
    </article>
  );
}
