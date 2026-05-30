import type { Metadata } from "next";
import { fetchNewsItemById } from "@/lib/supabase";
import { getCategoryBySlug } from "@/lib/categories";
import { ClientRedirect } from "./ClientRedirect";

const APP_URL = "https://kapyn.vercel.app";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const story = await fetchNewsItemById(id);

  if (!story) {
    return { title: "Kapyn — AI & tech news in 30-second reads" };
  }

  const category = getCategoryBySlug(story.categorySlug as never);
  const prefix = "Kapyn — AI & tech news in 30-second reads. ";
  const maxSummary = 155 - prefix.length;
  const truncated = story.summary.length > maxSummary
    ? story.summary.slice(0, maxSummary - 3) + "..."
    : story.summary;
  const description = prefix + truncated;

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
      card: "summary_large_image",
      title: story.title,
      description,
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  const story = await fetchNewsItemById(id);
  const category = story ? getCategoryBySlug(story.categorySlug as never) : null;
  const accent = category?.colorAccent ?? "#7c3aed";

  return (
    <>
      <ClientRedirect to={APP_URL} />
      {/* Fallback visible while JS loads / for crawlers */}
      <div
        style={{
          minHeight: "100dvh",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 32, fontWeight: 500, color: "#E8E4DE", letterSpacing: "-1px" }}>
          kapyn
        </span>
        <span style={{ fontSize: 16, color: "#555" }}>
          Opening…
        </span>
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: accent,
            animation: "none",
          }}
        />
      </div>
    </>
  );
}
