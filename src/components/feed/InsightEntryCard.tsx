"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import posthog from "posthog-js";
import type { Insight } from "@/lib/types";

interface InsightEntryCardProps {
  insight: Insight;
}

export function InsightEntryCard({ insight }: InsightEntryCardProps) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!insight.coverImageUrl || sharing) return;
    setSharing(true);
    try {
      const res = await fetch(insight.coverImageUrl);
      const blob = await res.blob();
      const file = new File([blob], "kapyn-insight.png", {
        type: blob.type || "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: insight.title });
        posthog.capture("insight_shared", { insight_title: insight.title });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "kapyn-insight.png";
        a.click();
        URL.revokeObjectURL(url);
        posthog.capture("insight_downloaded", { insight_title: insight.title });
      }
    } catch {
      // user cancelled the share sheet, or the fetch failed — ignore
    } finally {
      setSharing(false);
    }
  };

  if (!insight.coverImageUrl) {
    return <div style={{ height: "100%", background: "#0d0d0d" }} />;
  }

  return (
    <div
      style={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#0d0d0d",
        userSelect: "none",
      }}
    >
      {/* Blurred fill — soft continuation of the image behind the letterbox
          gaps, so any aspect-ratio mismatch reads as depth, not black bars */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={insight.coverImageUrl}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(28px) brightness(0.5)",
          transform: "scale(1.15)",
        }}
      />

      {/* Sharp, complete image — never cropped. The bottom inset keeps the
          baked-in watermark clear of the bottom nav. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          paddingBottom: "18px",
          boxSizing: "border-box",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={insight.coverImageUrl}
          alt={insight.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            display: "block",
          }}
        />
      </div>

      {/* Share — the only interactive element on the card */}
      <button
        onClick={handleShare}
        aria-label="Share this insight"
        style={{
          position: "absolute",
          bottom: "16px",
          right: "14px",
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          opacity: sharing ? 0.5 : 1,
          transition: "opacity 0.2s ease",
          zIndex: 2,
        }}
      >
        <Share2 size={17} color="#fff" strokeWidth={2} />
      </button>
    </div>
  );
}
