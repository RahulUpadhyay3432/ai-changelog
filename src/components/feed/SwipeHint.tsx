"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function SwipeHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("kapyn_visited")) {
      localStorage.setItem("kapyn_visited", "1");
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3200);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            pointerEvents: "none",
          }}
        >
          {/* Animated arrow */}
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 1, repeat: 2, ease: "easeInOut", repeatDelay: 0.3 }}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 14V4M9 4L4.5 8.5M9 4L13.5 8.5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>

          {/* Label */}
          <div
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 100,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            Swipe up for next story
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
