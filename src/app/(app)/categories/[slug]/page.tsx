import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CATEGORIES, getCategoryBySlug } from "@/lib/categories";
import { fetchNewsItems } from "@/lib/supabase";
import type { CategorySlug } from "@/lib/types";

const APP_URL = "https://kapyn.app";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 1800;

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug as CategorySlug);
  if (!category) return {};

  const title = `${category.name} News — Kapyn`;
  const description = `${category.description}. Distilled to 30-second reads, updated daily.`;

  return {
    title,
    description,
    alternates: { canonical: `${APP_URL}/categories/${slug}` },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/categories/${slug}`,
      siteName: "Kapyn",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug as CategorySlug);
  if (!category) notFound();

  const stories = await fetchNewsItems(slug as CategorySlug).catch(() => []);

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        background: "var(--kt-canvas, #0a0a0a)",
        display: "flex",
        flexDirection: "column",
      }}
      className="scrollbar-none"
    >
      {/* Header */}
      <div style={{ padding: "16px 20px 0", flexShrink: 0 }}>
        <Link
          href="/categories"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "2px",
            color: "var(--kt-text-muted, #525252)",
            fontSize: "13px",
            textDecoration: "none",
            marginBottom: "20px",
          }}
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
          Categories
        </Link>

        <span
          style={{
            display: "inline-block",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: category.colorLabel,
            background: `${category.colorAccent}15`,
            border: `1px solid ${category.colorAccent}30`,
            padding: "3px 10px",
            borderRadius: "100px",
            marginBottom: "10px",
          }}
        >
          {category.name}
        </span>

        <p
          style={{
            fontSize: "13px",
            color: "var(--kt-text-muted, #525252)",
            margin: "0 0 4px",
            lineHeight: 1.55,
          }}
        >
          {category.description}
        </p>

        <p
          style={{
            fontSize: "11px",
            color: "var(--kt-text-muted, #404040)",
            margin: "0 0 16px",
            fontWeight: 500,
          }}
        >
          {stories.length} {stories.length === 1 ? "story" : "stories"} in the last 48h
        </p>

        <div
          style={{
            height: "1px",
            background: "var(--kt-read-surface-2, rgba(255,255,255,0.05))",
            margin: "0 -20px",
          }}
        />
      </div>

      {/* Story list */}
      {stories.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--kt-text-muted, #404040)",
            fontSize: "14px",
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          No stories in the last 48 hours.
        </div>
      ) : (
        <div style={{ flex: 1, paddingBottom: "80px" }}>
          {stories.map((story, i) => (
            <Link
              key={story.id}
              href={`/story/${story.id}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom:
                    i < stories.length - 1
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "none",
                }}
              >
                <h2
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--kt-text-primary, #E8E4DE)",
                    lineHeight: 1.35,
                    margin: "0 0 6px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {story.title}
                </h2>

                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--kt-text-muted, #737373)",
                    lineHeight: 1.55,
                    margin: "0 0 10px",
                  }}
                >
                  {story.summary.length > 140
                    ? story.summary.slice(0, 137) + "…"
                    : story.summary}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    color: "var(--kt-text-muted, #404040)",
                    fontWeight: 500,
                  }}
                >
                  <span style={{ color: category.colorLabel }}>
                    {story.sourceName}
                  </span>
                  <span style={{ color: "var(--kt-hairline, rgba(255,255,255,0.12))" }}>·</span>
                  <span>
                    {new Date(story.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
