"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Copy, Check, Loader2 } from "lucide-react";
import type { NewsItem } from "@/lib/types";
import posthog from "posthog-js";

type Format = "square" | "landscape" | "story";
type Stage  = "format" | "generating" | "preview";

const FORMATS: { key: Format; label: string; sub: string; aspect: string }[] = [
  { key: "square",    label: "Square",    sub: "Instagram · WhatsApp",       aspect: "1:1"   },
  { key: "landscape", label: "Landscape", sub: "Twitter/X · LinkedIn",       aspect: "16:9"  },
  { key: "story",     label: "Story",     sub: "Instagram Stories · TikTok", aspect: "9:16"  },
];

interface ShareSheetProps {
  item: NewsItem;
  onClose: () => void;
}

export function ShareSheet({ item, onClose }: ShareSheetProps) {
  const [stage,    setStage]    = useState<Stage>("format");
  const [format,   setFormat]   = useState<Format>("square");
  const [blobUrl,  setBlobUrl]  = useState<string | null>(null);
  const [blob,     setBlob]     = useState<Blob | null>(null);
  const [copied,   setCopied]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const generateImage = useCallback(async (fmt: Format) => {
    setFormat(fmt);
    setStage("generating");
    setError(null);

    try {
      const params = new URLSearchParams({
        title:    item.title,
        summary:  item.summary ?? "",
        source:   item.sourceName ?? "",
        category: item.categorySlug ?? "",
        format:   fmt,
      });

      const res = await fetch(`/api/og/dispatch?${params.toString()}`);
      if (!res.ok) throw new Error("Generation failed");

      const imgBlob = await res.blob();
      const url     = URL.createObjectURL(imgBlob);
      setBlob(imgBlob);
      setBlobUrl(url);
      setStage("preview");

      posthog.capture("dispatch_card_generated", {
        dispatch_id: item.id,
        category:    item.categorySlug,
        format:      fmt,
      });
    } catch {
      setError("Couldn't generate image. Try again.");
      setStage("format");
    }
  }, [item]);

  const handleShare = useCallback(async () => {
    if (!blob) return;
    const file = new File([blob], `kapyn-${item.id}.png`, { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: item.title, files: [file] });
        posthog.capture("dispatch_shared", {
          dispatch_id:  item.id,
          category:     item.categorySlug,
          format:       format,
          share_method: "native_image",
        });
      } else {
        // Fallback: share URL
        await navigator.share({ title: item.title, url: item.sourceUrl });
        posthog.capture("dispatch_shared", {
          dispatch_id:  item.id,
          category:     item.categorySlug,
          format:       format,
          share_method: "native_url_fallback",
        });
      }
    } catch {
      // User cancelled — no-op
    }
  }, [blob, item, format]);

  const handleSave = useCallback(() => {
    if (!blobUrl) return;
    const a  = document.createElement("a");
    a.href   = blobUrl;
    a.download = `kapyn-${item.id}-${format}.png`;
    a.click();
    posthog.capture("dispatch_shared", {
      dispatch_id:  item.id,
      category:     item.categorySlug,
      format:       format,
      share_method: "save_image",
    });
  }, [blobUrl, item, format]);

  const handleCopy = useCallback(async () => {
    if (!blob) return;
    try {
      const item2 = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([item2]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      posthog.capture("dispatch_shared", {
        dispatch_id:  item.id,
        category:     item.categorySlug,
        format:       format,
        share_method: "copy_image",
      });
    } catch {
      // Clipboard API not supported — fallback silent
    }
  }, [blob, item, format]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(item.sourceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    posthog.capture("dispatch_shared", {
      dispatch_id:  item.id,
      category:     item.categorySlug,
      format:       null,
      share_method: "copy_link",
    });
  }, [item]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          zIndex: 40,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "#111",
          borderRadius: "20px 20px 0 0",
          border: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "none",
          padding: "0 0 env(safe-area-inset-bottom, 16px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.12)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 12px" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#E8E4DE", margin: 0 }}>
            {stage === "format"     ? "Share dispatch"    : ""}
            {stage === "generating" ? "Generating card…"  : ""}
            {stage === "preview"    ? "Your card"         : ""}
          </p>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#555", padding: "4px" }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <p style={{ fontSize: "13px", color: "#ef4444", textAlign: "center", margin: "0 20px 12px", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: "8px" }}>
            {error}
          </p>
        )}

        {/* ── FORMAT SELECTION ── */}
        {stage === "format" && (
          <div style={{ padding: "4px 20px 16px" }}>
            {/* Format tiles */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {FORMATS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => generateImage(f.key)}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "14px 8px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {/* Aspect ratio preview box */}
                  <div style={{
                    background: "rgba(212,165,116,0.12)",
                    border: "1px solid rgba(212,165,116,0.25)",
                    borderRadius: "4px",
                    width:  f.key === "story" ? "22px" : f.key === "landscape" ? "40px" : "30px",
                    height: f.key === "story" ? "38px" : f.key === "landscape" ? "22px" : "30px",
                    marginBottom: "2px",
                  }} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#E8E4DE" }}>{f.label}</span>
                  <span style={{ fontSize: "10px", color: "#525252", textAlign: "center", lineHeight: 1.3 }}>{f.sub}</span>
                </button>
              ))}
            </div>

            {/* Copy link secondary */}
            <button
              onClick={handleCopyLink}
              style={{
                width: "100%",
                background: "none",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px",
                padding: "13px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                color: copied ? "#4ade80" : "#737373",
                fontSize: "13px",
                fontWeight: 500,
                transition: "color 0.2s ease",
              }}
            >
              {copied ? <Check size={15} strokeWidth={2.5} /> : <Copy size={15} strokeWidth={2} />}
              {copied ? "Link copied!" : "Copy article link"}
            </button>
          </div>
        )}

        {/* ── GENERATING ── */}
        {stage === "generating" && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px 48px",
            gap: "14px",
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            >
              <Loader2 size={24} color="#D4A574" strokeWidth={2} />
            </motion.div>
            <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
              Building your card…
            </p>
          </div>
        )}

        {/* ── PREVIEW ── */}
        {stage === "preview" && blobUrl && (
          <div style={{ padding: "0 20px 20px" }}>
            {/* Image preview */}
            <div style={{
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: "16px",
              background: "#0E0D0C",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blobUrl}
                alt="Kapyn share card"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  maxHeight: "280px",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                onClick={handleShare}
                style={{
                  flex: 1,
                  padding: "13px 0",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
                  border: "none",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                }}
              >
                <Share2 size={15} strokeWidth={2.5} />
                Share
              </button>

              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  padding: "13px 0",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "#a3a3a3",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                }}
              >
                <Download size={15} strokeWidth={2} />
                Save
              </button>

              <button
                onClick={handleCopy}
                style={{
                  padding: "13px 16px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: copied ? "#4ade80" : "#a3a3a3",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.2s ease",
                }}
              >
                {copied ? <Check size={15} strokeWidth={2.5} /> : <Copy size={15} strokeWidth={2} />}
              </button>
            </div>

            {/* Change format */}
            <button
              onClick={() => { setStage("format"); setBlobUrl(null); setBlob(null); }}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: "#404040",
                fontSize: "12px",
                cursor: "pointer",
                padding: "8px 0",
              }}
            >
              Change format
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
