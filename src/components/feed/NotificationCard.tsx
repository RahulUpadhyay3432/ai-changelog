"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import posthog from "posthog-js";
import {
  subscribeToNotifications,
  recordNotifSkip,
  recordNotifDismissed,
} from "@/lib/notifications";

interface NotificationCardProps {
  onDone: () => void;
}

export function NotificationCard({ onDone }: NotificationCardProps) {
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    setLoading(true);
    posthog.capture("notification_card_accepted");
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await subscribeToNotifications();
      posthog.capture("notification_subscribed");
      recordNotifDismissed();
    } else {
      posthog.capture("notification_permission_denied");
      recordNotifSkip();
    }
    setLoading(false);
    onDone();
  };

  const handleSkip = () => {
    posthog.capture("notification_card_skipped");
    recordNotifSkip();
    onDone();
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 32px 48px",
        background: "#0a0a0a",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "20px",
          background: "rgba(37,99,235,0.08)",
          border: "1px solid rgba(37,99,235,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "32px",
        }}
      >
        <Bell size={30} color="#2563eb" strokeWidth={1.5} />
      </div>

      {/* Headline */}
      <p
        style={{
          margin: "0 0 12px",
          fontSize: "24px",
          fontWeight: 600,
          color: "#E8E4DE",
          letterSpacing: "-0.02em",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        Stay in the loop
      </p>

      {/* Subtext */}
      <p
        style={{
          margin: "0 0 48px",
          fontSize: "15px",
          color: "#525252",
          textAlign: "center",
          lineHeight: 1.65,
          maxWidth: "260px",
        }}
      >
        One notification when new AI dispatches land. No noise, no spam.
      </p>

      {/* Enable button */}
      <button
        onClick={handleEnable}
        disabled={loading}
        style={{
          width: "100%",
          maxWidth: "300px",
          padding: "15px",
          borderRadius: "14px",
          background: "#2563eb",
          border: "none",
          color: "#fff",
          fontSize: "15px",
          fontWeight: 600,
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "opacity 0.15s",
          marginBottom: "12px",
        }}
      >
        {loading ? "Setting up…" : "Enable notifications"}
      </button>

      {/* Skip */}
      <button
        onClick={handleSkip}
        style={{
          background: "none",
          border: "none",
          color: "#404040",
          fontSize: "13px",
          cursor: "pointer",
          padding: "10px 20px",
        }}
      >
        Not now
      </button>
    </div>
  );
}
