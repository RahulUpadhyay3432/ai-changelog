"use client";

import { Bookmark } from "lucide-react";
import { CardStack } from "@/components/feed/CardStack";

export default function SavedPage() {
  // localStorage integration — empty for now
  const savedStories: never[] = [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0a0a0a",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "16px 20px 8px",
          flexShrink: 0,
        }}
      >
        <Bookmark size={20} color="#f5f5f5" strokeWidth={2} />
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#f5f5f5",
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          Saved
        </h1>
      </div>

      {savedStories.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            color: "#525252",
            padding: "40px 20px",
          }}
        >
          <Bookmark size={40} strokeWidth={1.5} />
          <p style={{ fontSize: "16px", margin: 0, fontWeight: 500 }}>
            Nothing saved yet
          </p>
          <p
            style={{
              fontSize: "14px",
              margin: 0,
              color: "#404040",
              textAlign: "center",
            }}
          >
            Tap the bookmark icon on any story to save it here.
          </p>
        </div>
      ) : (
        <CardStack items={savedStories} />
      )}
    </div>
  );
}
