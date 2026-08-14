import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BLOG_POSTS, getPost, postTools, tableOfContents } from "@/lib/blog-content";
import { BlogBody } from "@/components/blog/BlogBody";
import { ArticleToc } from "@/components/blog/ArticleToc";
import { ShareRow } from "@/components/blog/ShareRow";
import { BlogReader } from "@/components/blog/BlogReader";
import { GOLD, GOLD_SOFT, GOLD_BORDER, SG } from "@/lib/design-tokens";
import { READING } from "../theme";
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
      modifiedTime: post.updated ?? post.date,
      images: post.hero?.src ? [{ url: post.hero.src }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.deck,
      images: post.hero?.src ? [post.hero.src] : undefined,
    },
  };
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const tools = postTools(post);
  const toc = tableOfContents(post);
  const url = `${APP_URL}/blog/${post.slug}`;
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 2);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.deck,
    image: post.hero?.src ? [{ "@type": "ImageObject", url: post.hero.src }] : undefined,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { "@type": "Organization", name: "Kapyn", url: APP_URL },
    publisher: {
      "@type": "Organization",
      name: "Kapyn",
      url: APP_URL,
      logo: { "@type": "ImageObject", url: `${APP_URL}/icon-192.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    articleSection: post.tag,
    wordCount: post.readingMin * 250,
    inLanguage: "en-US",
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

      <BlogReader
        toc={toc}
        url={url}
        title={post.title}
        hero={
          <header className={styles.hero}>
            <Link href="/blog" className={styles.heroBack}>
              <ArrowLeft size={14} strokeWidth={2.3} /> All posts
            </Link>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.hero.src} alt={post.hero.alt} className={styles.heroImg} />
            <div className={styles.heroOverlay} aria-hidden />
            <div className={styles.heroInner}>
              <span style={{ display: "inline-block", fontFamily: SG, fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", background: "rgba(59,130,246,0.85)", border: `1px solid ${GOLD_BORDER}`, borderRadius: "100px", padding: "3px 10px" }}>
                {post.tag}
              </span>
              <h1 className={styles.heroTitle}>{post.title}</h1>
              <p className={styles.heroDeck}>{post.deck}</p>
            </div>
          </header>
        }
      >
        {/* Byline */}
        <div className={styles.byline}>
          <span className={styles.avatar} aria-hidden>K</span>
          <div style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: READING.heading }}>Kapyn</span>
            <span style={{ display: "block", fontSize: "12.5px", color: READING.muted }}>
              {fmtDate(post.date)} · {post.readingMin} min read
              {post.updated && <> · Updated {fmtDate(post.updated)}</>}
            </span>
          </div>
          <div className={styles.tabletShare}>
            <ShareRow url={url} title={post.title} />
          </div>
        </div>

        {/* Mobile / tablet inline TOC (the sticky rail covers desktop) */}
        <div className={styles.tocMobileWrap}>
          <ArticleToc items={toc} />
        </div>

        <BlogBody body={post.body} />

        {/* CTA → Radar */}
        <div style={{ margin: "44px 0 0", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", background: READING.surface, border: `1px solid ${READING.hairline}`, borderRadius: "16px", padding: "22px 24px" }}>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <h3 style={{ fontFamily: SG, fontSize: "17px", fontWeight: 700, color: READING.heading, margin: 0 }}>Find these on the Radar</h3>
            <p style={{ fontSize: "14px", color: READING.muted, margin: "6px 0 0", lineHeight: 1.5 }}>Every tool here lives on Kapyn Radar. Save the ones that fit into a Loadout and find them again.</p>
          </div>
          <Link href="/radar/browse" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#ffffff", background: GOLD, borderRadius: "12px", padding: "12px 20px", textDecoration: "none" }}>
            Open the Radar <ArrowRight size={16} strokeWidth={2.4} />
          </Link>
        </div>

        {/* Keep reading */}
        {related.length > 0 && (
          <section style={{ margin: "52px 0 0" }}>
            <h2 style={{ fontFamily: SG, fontSize: "13px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: READING.muted, margin: "0 0 16px" }}>
              Keep reading
            </h2>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.relatedCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.hero.src} alt="" className={styles.relatedThumb} loading="lazy" />
                  <div style={{ padding: "14px 16px 16px" }}>
                    <span style={{ display: "inline-block", fontFamily: SG, fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: GOLD, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: "100px", padding: "2px 9px" }}>
                      {p.tag}
                    </span>
                    <h3 style={{ fontFamily: SG, fontSize: "16px", fontWeight: 700, color: READING.heading, letterSpacing: "-0.02em", lineHeight: 1.25, margin: "10px 0 0" }}>{p.title}</h3>
                    <p style={{ fontSize: "13px", color: READING.muted, lineHeight: 1.5, margin: "6px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.deck}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </BlogReader>
    </article>
  );
}
