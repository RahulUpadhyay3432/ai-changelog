"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Share2, Download } from "lucide-react";
import posthog from "posthog-js";

interface ShareCardSheetProps {
  open: boolean;
  onClose: () => void;
  variant?: "today" | "weekly";
}

function SheetContent({ onClose, variant }: { onClose: () => void; variant: "today" | "weekly" }) {
  const [sharing, setSharing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const weekly = variant === "weekly";
  const cardSrc = weekly ? "/api/share-card?kind=weekly" : "/api/share-card";

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await fetch(cardSrc);
      const blob = await res.blob();
      const file = new File([blob], weekly ? "kapyn-week.png" : "kapyn-today.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: weekly ? "This week in AI, Kapyn" : "Today in AI, Kapyn" });
        posthog.capture("share_card_shared", { variant });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = weekly ? "kapyn-week.png" : "kapyn-today.png";
        a.click();
        URL.revokeObjectURL(url);
        posthog.capture("share_card_downloaded");
      }
    } catch {
      // user cancelled — ignore
    } finally {
      setSharing(false);
    }
  };

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        pointerEvents: "none",
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          pointerEvents: "all",
        }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80) onClose();
        }}
        style={{
          position: "relative",
          background: "var(--kt-surface, #111111)",
          borderRadius: "20px 20px 0 0",
          padding: "0 0 calc(env(safe-area-inset-bottom, 0px) + 28px)",
          pointerEvents: "all",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90dvh",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 4px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              background: "var(--kt-hairline, rgba(255,255,255,0.15))",
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 20px 16px",
            flexShrink: 0,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--kt-text-primary, #E8E4DE)",
                margin: "0 0 2px",
                letterSpacing: "-0.01em",
              }}
            >
              {weekly ? "This week. You're caught up" : "Today's top 3"}
            </p>
            <p style={{ fontSize: "12px", color: "var(--kt-text-muted, #525252)", margin: 0 }}>
              {weekly ? "The stories that mattered, share the recap" : "Share to Instagram, Twitter, or WhatsApp"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--kt-hairline, rgba(255,255,255,0.08))",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} color="#666" strokeWidth={2} />
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "var(--kt-read-surface-2, rgba(255,255,255,0.06))",
            flexShrink: 0,
          }}
        />

        {/* Card preview */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!imageLoaded && (
            <div
              style={{
                width: "100%",
                aspectRatio: "9/16",
                background: "var(--kt-read-surface, rgba(255,255,255,0.04))",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ fontSize: "13px", color: "var(--kt-text-muted, #404040)" }}>
                Generating card…
              </p>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardSrc}
            alt={weekly ? "This week's biggest AI stories" : "Today's top 3 AI stories"}
            onLoad={() => setImageLoaded(true)}
            style={{
              width: "100%",
              borderRadius: "12px",
              display: imageLoaded ? "block" : "none",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "var(--kt-read-surface-2, rgba(255,255,255,0.06))",
            flexShrink: 0,
          }}
        />

        {/* Share button */}
        <div style={{ padding: "16px 20px 0", flexShrink: 0 }}>
          <button
            onClick={handleShare}
            disabled={sharing}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              background: sharing
                ? "var(--kt-read-surface, rgba(255,255,255,0.04))"
                : "rgba(255,255,255,0.09)",
              border: "1px solid var(--kt-hairline, rgba(255,255,255,0.12))",
              color: sharing ? "var(--kt-text-muted, #525252)" : "var(--kt-text-primary, #E8E4DE)",
              fontSize: "15px",
              fontWeight: 600,
              cursor: sharing ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              letterSpacing: "-0.01em",
              transition: "all 0.2s ease",
            }}
          >
            {canShare ? (
              <Share2 size={16} strokeWidth={2.5} />
            ) : (
              <Download size={16} strokeWidth={2.5} />
            )}
            {sharing ? "Generating…" : canShare ? "Share" : "Save image"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function ShareCardSheet({ open, onClose, variant = "today" }: ShareCardSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const container =
    document.getElementById("phone-overlay-root") ?? document.body;

  return createPortal(
    <AnimatePresence>
      {open && <SheetContent onClose={onClose} variant={variant} />}
    </AnimatePresence>,
    container
  );
}
