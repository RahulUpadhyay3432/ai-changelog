import type { Metadata } from "next";
import { fetchNewsItemById } from "@/lib/supabase";
import { getCategoryBySlug } from "@/lib/categories";
import { ClientRedirect } from "./ClientRedirect";
import { serializeJsonLd } from "@/lib/json-ld";

const APP_URL = "https://kapyn.app";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const story = await fetchNewsItemById(id);

  if (!story) {
    return {
      title: "Kapyn, AI & tech news in 30-second reads",
      description: "AI and tech news distilled into 30-second reads.",
    };
  }

  const description =
    story.summary.length > 155
      ? story.summary.slice(0, 152) + "..."
      : story.summary;

  return {
    title: `${story.title}, Kapyn`,
    description,
    alternates: {
      canonical: `${APP_URL}/story/${story.id}`,
    },
    openGraph: {
      title: story.title,
      description,
      url: `${APP_URL}/story/${story.id}`,
      siteName: "Kapyn",
      type: "article",
      publishedTime: story.publishedAt,
      images: [
        {
          url: `${APP_URL}/story/${story.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: story.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
      images: [`${APP_URL}/story/${story.id}/opengraph-image`],
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  const story = await fetchNewsItemById(id);
  const category = story ? getCategoryBySlug(story.categorySlug as never) : null;
  const accent = category?.colorAccent ?? "#7c3aed";
  const colorLabel = category?.colorLabel ?? "#c4b5fd";

  const redirectTo = story ? `${APP_URL}/?story=${id}` : APP_URL;

  const storyUrl = story ? `${APP_URL}/story/${story.id}` : null;
  const jsonLd = story
    ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": storyUrl,
        },
        headline: story.title,
        description: story.summary,
        articleSection: category?.name ?? story.categorySlug,
        datePublished: story.publishedAt,
        dateModified: story.publishedAt,
        inLanguage: "en",
        isAccessibleForFree: true,
        url: storyUrl,
        image: story.imageUrl
          ? { "@type": "ImageObject", url: story.imageUrl }
          : {
              "@type": "ImageObject",
              url: `${APP_URL}/story/${story.id}/opengraph-image`,
              width: 1200,
              height: 630,
            },
        author: {
          "@type": "Organization",
          name: story.sourceName,
        },
        publisher: {
          "@type": "Organization",
          name: "Kapyn",
          url: APP_URL,
          logo: {
            "@type": "ImageObject",
            url: `${APP_URL}/api/icon/192`,
            width: 192,
            height: 192,
          },
        },
      }
    : null;

  return (
    <>
      <ClientRedirect to={redirectTo} />

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      )}

      {/* Server-rendered content — visible to Google, shown briefly before JS redirect fires */}
      <div
        style={{
          minHeight: "100dvh",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          padding: "48px 24px",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          maxWidth: "640px",
          margin: "0 auto",
          gap: "32px",
        }}
      >
        {/* Wordmark */}
        <span
          style={{
            fontSize: "28px",
            fontWeight: 500,
            color: "#E8E4DE",
            letterSpacing: "-0.02em",
          }}
        >
          kapyn
        </span>

        {story ? (
          <>
            {/* Category badge */}
            <span
              style={{
                display: "inline-block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: colorLabel,
                background: `${accent}12`,
                border: `1px solid ${accent}20`,
                padding: "3px 10px",
                borderRadius: "100px",
                width: "fit-content",
              }}
            >
              {category?.name ?? story.categorySlug}
            </span>

            {/* Title */}
            <h1
              style={{
                fontSize: "clamp(24px, 4vw, 36px)",
                fontWeight: 600,
                color: "#E8E4DE",
                lineHeight: 1.25,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {story.title}
            </h1>

            {/* Summary */}
            <p
              style={{
                fontSize: "17px",
                lineHeight: 1.65,
                color: "#9a9a9a",
                margin: 0,
              }}
            >
              {story.summary}
            </p>

            {/* Source + date */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "12px",
                color: "#555",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <span>{story.sourceName}</span>
              <span>·</span>
              <span>
                {new Date(story.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </>
        ) : (
          <p style={{ fontSize: "16px", color: "#555" }}>Story not found.</p>
        )}

        <p style={{ fontSize: "13px", color: "#333", marginTop: "auto" }}>
          Opening Kapyn…
        </p>
      </div>
    </>
  );
}
