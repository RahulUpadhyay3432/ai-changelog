"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import posthog from "posthog-js";

interface FeedbackSheetProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackSheet({ open, onClose }: FeedbackSheetProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setPortalRoot(document.getElementById("phone-overlay-root"));
  }, []);

  useEffect(() => {
    if (open) {
      setMessage("");
      setDone(false);
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      setDone(true);
      posthog.capture("feedback_submitted", { message_length: message.trim().length });
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch {
      // silent fail — user doesn't need to know
      setDone(true);
      setTimeout(() => onClose(), 1800);
    } finally {
      setSubmitting(false);
    }
  };

  const sheet = (
    <AnimatePresence>
      {open && (
        <>
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
              background: "rgba(0,0,0,0.6)",
              zIndex: 40,
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#111111",
              borderRadius: "20px 20px 0 0",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              padding: "24px 20px 32px",
              zIndex: 50,
            }}
          >
            {/* Handle */}
            <div
              style={{
                width: "36px",
                height: "4px",
                borderRadius: "2px",
                background: "rgba(255,255,255,0.12)",
                margin: "0 auto 20px",
              }}
            />

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#E8E4DE", margin: 0 }}>
                Share feedback
              </p>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  color: "#525252",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {done ? (
              <div
                style={{
                  padding: "32px 0",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "28px" }}>🙏</span>
                <p style={{ fontSize: "15px", color: "#E8E4DE", margin: 0, fontWeight: 500 }}>
                  Thank you — means a lot.
                </p>
              </div>
            ) : (
              <>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's working? What's not? What would make this indispensable for you?"
                  maxLength={2000}
                  rows={5}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "14px",
                    fontSize: "14px",
                    color: "#E8E4DE",
                    resize: "none",
                    outline: "none",
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                    boxSizing: "border-box",
                    caretColor: "#D4A574",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "12px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#404040" }}>
                    {message.length}/2000
                  </span>
                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || submitting}
                    style={{
                      background: message.trim() ? "#D4A574" : "rgba(255,255,255,0.06)",
                      border: "none",
                      borderRadius: "20px",
                      padding: "10px 24px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: message.trim() ? "#0a0a0a" : "#525252",
                      cursor: message.trim() ? "pointer" : "default",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {submitting ? "Sending…" : "Send"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!portalRoot) return null;
  return createPortal(sheet, portalRoot);
}
