"use client";

import { useState, useEffect } from "react";
import { User, Bell, Bookmark, Flame, Sparkles, Sliders } from "lucide-react";
import { getSavedStories, getStreak } from "@/lib/storage";

export default function ProfilePage() {
  const [savedCount, setSavedCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSavedCount(getSavedStories().length);
    setStreakCount(getStreak());
    setIsLoading(false);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0a0a0a",
        overflowY: "auto",
      }}
      className="scrollbar-none"
    >
      {/* Avatar section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "45px 20px 32px",
          gap: "16px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <User size={36} color="#a3a3a3" strokeWidth={1.5} />
          <div
            style={{
              position: "absolute",
              inset: "-4px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.04)",
              pointerEvents: "none",
            }}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <p
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#f5f5f5",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Reader
            </p>
            <Sparkles size={16} color="#fbbf24" style={{ opacity: streakCount > 0 ? 1 : 0.3 }} />
          </div>
        </div>
      </div>

      {/* Stats row — Saved + Streak only */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "0 20px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            flex: 1,
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "16px",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Bookmark size={16} color="#fbbf24" style={{ opacity: savedCount > 0 ? 1 : 0.4 }} />
          <span
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#f5f5f5",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginTop: "4px",
            }}
          >
            {isLoading ? "—" : savedCount}
          </span>
          <span style={{ fontSize: "11px", color: "#737373", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Saved
          </span>
        </div>

        <div
          style={{
            flex: 1,
            background: streakCount > 0 ? "rgba(249, 115, 22, 0.04)" : "rgba(255, 255, 255, 0.02)",
            border: streakCount > 0 ? "1px solid rgba(249, 115, 22, 0.2)" : "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "16px",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            boxShadow: streakCount > 0 ? "0 0 16px rgba(249, 115, 22, 0.08)" : "none",
            transition: "all 0.3s ease",
          }}
        >
          <Flame
            size={18}
            color={streakCount > 0 ? "#f97316" : "#525252"}
            fill={streakCount > 0 ? "#f97316" : "none"}
            className={streakCount > 0 ? "animate-bounce" : ""}
            style={{ animationDuration: "2s" }}
          />
          <span
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: streakCount > 0 ? "#f97316" : "#f5f5f5",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginTop: "2px",
            }}
          >
            {isLoading ? "—" : `${streakCount}d`}
          </span>
          <span style={{ fontSize: "11px", color: streakCount > 0 ? "#ea580c" : "#737373", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Streak
          </span>
        </div>
      </div>

      {/* Preferences section */}
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#525252",
            margin: "0 0 10px",
            padding: "0 24px",
          }}
        >
          Preferences
        </p>
        <div
          style={{
            background: "#111111",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {/* Notifications row */}
          <button
            disabled
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              background: "none",
              border: "none",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              cursor: "default",
              color: "#737373",
              fontSize: "15px",
              fontWeight: 500,
              opacity: 0.7,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Bell size={16} color="#525252" strokeWidth={2} />
              <span>Notifications</span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#525252", letterSpacing: "0.04em" }}>
              SOON
            </span>
          </button>

          {/* Category Preferences row */}
          <button
            disabled
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              background: "none",
              border: "none",
              cursor: "default",
              color: "#737373",
              fontSize: "15px",
              fontWeight: 500,
              opacity: 0.7,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Sliders size={16} color="#525252" strokeWidth={2} />
              <span>Category Preferences</span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#525252", letterSpacing: "0.04em" }}>
              SOON
            </span>
          </button>
        </div>
      </div>

      {/* About section */}
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#525252",
            margin: "0 0 10px",
            padding: "0 24px",
          }}
        >
          About
        </p>
        <div
          style={{
            background: "#111111",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            padding: "16px 24px",
          }}
        >
          <p style={{ fontSize: "14px", color: "#a3a3a3", lineHeight: 1.6, margin: "0 0 12px", fontWeight: 500 }}>
            Kapyn delivers AI and tech news in 30-second reads — no noise, no paywalls.
          </p>
          <p style={{ fontSize: "13px", color: "#525252", lineHeight: 1.6, margin: 0 }}>
            Sources: OpenAI Blog · Google DeepMind · Hugging Face · TechCrunch AI · VentureBeat · The Verge · Ars Technica · MIT Tech Review · Microsoft AI
          </p>
        </div>
      </div>

      <p
        style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#404040",
          marginTop: "auto",
          padding: "24px",
        }}
      >
        Kapyn v1.0.0 · What happened in AI today.
      </p>
    </div>
  );
}
