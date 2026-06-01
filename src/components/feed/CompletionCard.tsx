"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, animate, type PanInfo } from "framer-motion";
import { Check, Flame } from "lucide-react";
import posthog from "posthog-js";
import { getStreak, getPushOptedIn, getPushDismissed, setPushOptedIn, setPushDismissed } from "@/lib/storage";
import { FeedbackSheet } from "@/components/feedback/FeedbackSheet";

interface CompletionCardProps {
  readCount: number;
  onBackToTop: () => void;
  onRefresh: () => Promise<void>;
  caughtUpToast: boolean;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const output = new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export function CompletionCard({
  readCount,
  onBackToTop,
  onRefresh,
  caughtUpToast,
}: CompletionCardProps) {
  const y = useMotionValue(0);
  const [streak, setStreak] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [pushSubscribing, setPushSubscribing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setStreak(getStreak());
    const supported = typeof window !== "undefined" && "PushManager" in window;
    if (supported && !getPushOptedIn() && !getPushDismissed()) {
      setShowPushPrompt(true);
      posthog.capture("push_permission_prompted");
    }
  }, []);

  const handlePushEnable = async () => {
    setPushSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushDismissed();
        setShowPushPrompt(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      setPushOptedIn();
      setShowPushPrompt(false);
      posthog.capture("push_notification_opted_in", { source: "completion_card" });
    } catch {
      setPushDismissed();
      setShowPushPrompt(false);
    } finally {
      setPushSubscribing(false);
    }
  };

  const handlePushDismiss = () => {
    setPushDismissed();
    setShowPushPrompt(false);
    posthog.capture("push_notification_dismissed");
  };

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;

    if (offset.y > 80 || velocity.y > 500) {
      setIsRefreshing(true);
      await animate(y, 56, { duration: 0.12 });
      await onRefresh();
      setIsRefreshing(false);
      animate(y, 0, { type: "spring", stiffness: 380, damping: 30 });
    } else {
      animate(y, 0, { type: "spring", stiffness: 380, damping: 30 });
    }
  };

  const baseDelay = 0.35;
  const pushDelay = baseDelay + (streak > 0 ? 0.4 : 0.3);

  return (
    <motion.div
      drag="y"
      dragMomentum={false}
      dragConstraints={{ top: 0, bottom: 200 }}
      onDragEnd={handleDragEnd}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        y,
        touchAction: "none",
        cursor: "grab",
        background: "#0a0a0a",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Centered content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 36px",
          pointerEvents: "none",
        }}
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: 1 }}
          transition={{
            delay: baseDelay,
            duration: 0.35,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(212, 165, 116, 0.08)",
            border: "1px solid rgba(212, 165, 116, 0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "28px",
          }}
        >
          <Check size={28} color="#D4A574" strokeWidth={2.5} />
        </motion.div>

        {/* Main line */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: baseDelay + 0.1, duration: 0.35, ease: "easeOut" }}
          style={{
            fontSize: "26px",
            fontWeight: 500,
            color: "#E8E4DE",
            margin: "0 0 8px",
            letterSpacing: "-0.01em",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          You&apos;re all caught up
        </motion.p>

        {/* Read count */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: baseDelay + 0.2, duration: 0.35, ease: "easeOut" }}
          style={{
            fontSize: "14px",
            fontWeight: 400,
            color: "#525252",
            margin: "0 0 20px",
            textAlign: "center",
          }}
        >
          You read {readCount} dispatch{readCount !== 1 ? "es" : ""} today
        </motion.p>

        {/* Streak */}
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: baseDelay + 0.3, duration: 0.35, ease: "easeOut" }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginBottom: "32px",
            }}
          >
            <Flame size={13} color="#f97316" fill="#f97316" />
            <span style={{ fontSize: "13px", color: "#f97316", fontWeight: 600 }}>
              {streak} day streak
            </span>
          </motion.div>
        )}

        {/* Push opt-in prompt */}
        {showPushPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pushDelay, duration: 0.35, ease: "easeOut" }}
            style={{
              pointerEvents: "auto",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "20px 20px 16px",
              textAlign: "center",
              marginBottom: "24px",
              maxWidth: "280px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "#a3a3a3",
                margin: "0 0 16px",
                lineHeight: 1.5,
              }}
            >
              Get a quiet morning briefing?
              <br />
              One notification per day.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={handlePushEnable}
                disabled={pushSubscribing}
                style={{
                  background: "#D4A574",
                  border: "none",
                  color: "#0a0a0a",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: pushSubscribing ? "wait" : "pointer",
                  padding: "8px 20px",
                  borderRadius: "20px",
                  opacity: pushSubscribing ? 0.7 : 1,
                }}
              >
                {pushSubscribing ? "Setting up…" : "Enable"}
              </button>
              <button
                onClick={handlePushDismiss}
                style={{
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#525252",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  padding: "8px 16px",
                  borderRadius: "20px",
                }}
              >
                Not now
              </button>
            </div>
          </motion.div>
        )}

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: pushDelay + (showPushPrompt ? 0.1 : 0),
            duration: 0.4,
          }}
          style={{
            fontSize: "12px",
            color: "#2a2a2a",
            margin: "0 0 24px",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Come back later for fresh intelligence.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: pushDelay + 0.1,
            duration: 0.4,
          }}
          style={{ pointerEvents: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}
        >
          <button
            onClick={() => setShowFeedback(true)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px",
              color: "#a3a3a3",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              padding: "9px 22px",
              letterSpacing: "0.01em",
            }}
          >
            Share feedback
          </button>
          <button
            onClick={onBackToTop}
            style={{
              background: "none",
              border: "none",
              color: "#4a4a4a",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              padding: "6px 0",
              letterSpacing: "0.01em",
            }}
          >
            Back to top →
          </button>
        </motion.div>
      </div>

      <FeedbackSheet open={showFeedback} onClose={() => setShowFeedback(false)} />

      {/* Pull-to-refresh spinner */}
      {isRefreshing && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
          <div className="refresh-spinner" />
        </div>
      )}

      {/* "Still all caught up" toast */}
      <AnimatePresence>
        {caughtUpToast && (
          <motion.div
            initial={{ opacity: 0, y: 6, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 4, x: "-50%", transition: { duration: 0.3 } }}
            style={{
              position: "absolute",
              bottom: "80px",
              left: "50%",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              color: "#737373",
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 500,
              whiteSpace: "nowrap",
              border: "1px solid rgba(255,255,255,0.08)",
              pointerEvents: "none",
            }}
          >
            Still all caught up ✓
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
