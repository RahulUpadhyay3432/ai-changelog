import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchNewsItemById } from "@/lib/supabase";
import { getCategoryBySlug } from "@/lib/categories";
import { formatTimeAgo } from "@/lib/mock-data";

const APP_URL = "https://kapyn.vercel.app";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const story = await fetchNewsItemById(id);

  if (!story) {
    return { title: "Story not found — Kapyn" };
  }

  const tagline = " · Kapyn — AI & tech news in 30-second reads.";
  const maxSummary = 155 - tagline.length;
  const truncated = story.summary.length > maxSummary
    ? story.summary.slice(0, maxSummary - 3) + "..."
    : story.summary;
  const description = truncated + tagline;

  return {
    title: `${story.title} — Kapyn`,
    description,
    openGraph: {
      title: story.title,
      description,
      url: `${APP_URL}/story/${story.id}`,
      siteName: "Kapyn",
      type: "article",
      publishedTime: story.publishedAt,
    },
    twitter: {
      card: "summary",
      title: story.title,
      description,
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  const story = await fetchNewsItemById(id);

  if (!story) notFound();

  const category = getCategoryBySlug(story.categorySlug as never);
  const timeAgo = formatTimeAgo(story.publishedAt);
  const accent = category?.colorAccent ?? "#7c3aed";
  const colorLabel = category?.colorLabel ?? "#c4b5fd";

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 0 env(safe-area-inset-bottom, 24px)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "20px 24px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "22px",
            fontWeight: 500,
            color: "#E8E4DE",
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-space-grotesk), sans-serif",
          }}
        >
          kapyn
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "#525252",
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}
        >
          AI news, distilled
        </span>
      </div>

      {/* Story card */}
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "24px 24px 0",
          flex: 1,
        }}
      >
        {/* Category + time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "14px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: colorLabel,
              background: `${accent}14`,
              border: `1px solid ${accent}22`,
              padding: "3px 10px",
              borderRadius: "100px",
            }}
          >
            {category?.name ?? story.categorySlug}
          </span>
          <span style={{ fontSize: "11px", color: "#555", fontWeight: 500 }}>
            {timeAgo}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 600,
            lineHeight: 1.3,
            color: "#E8E4DE",
            margin: "0 0 16px",
            letterSpacing: "-0.01em",
          }}
        >
          {story.title}
        </h1>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            marginBottom: "16px",
          }}
        />

        {/* Summary */}
        <p
          style={{
            fontSize: "16px",
            lineHeight: 1.65,
            color: "#9A9A9A",
            margin: "0 0 24px",
          }}
        >
          {story.summary}
        </p>

        {/* Source + read original */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "#444",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {story.sourceName}
          </span>
          <a
            href={story.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "13px",
              color: colorLabel,
              fontWeight: 500,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Read original →
          </a>
        </div>

        {/* CTA */}
        <a
          href={APP_URL}
          style={{
            display: "block",
            width: "100%",
            padding: "16px",
            background: `${accent}18`,
            border: `1px solid ${accent}30`,
            borderRadius: "16px",
            textAlign: "center",
            textDecoration: "none",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#E8E4DE",
              marginBottom: "4px",
            }}
          >
            Read more AI news on Kapyn
          </div>
          <div style={{ fontSize: "13px", color: "#666" }}>
            Swipe through the stories that matter · Free
          </div>
        </a>
      </div>
    </div>
  );
}
