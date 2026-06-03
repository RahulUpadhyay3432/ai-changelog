"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Bookmark, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/trending", label: "Trending", Icon: TrendingUp },
  { href: "/saved", label: "Saved", Icon: Bookmark },
  { href: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [debug, setDebug] = useState("");

  useEffect(() => {
    // Measure actual env(safe-area-inset-bottom) value and window height
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;bottom:0;height:env(safe-area-inset-bottom,0px);pointer-events:none;opacity:0";
    document.body.appendChild(probe);
    const sab = probe.offsetHeight;
    document.body.removeChild(probe);
    setDebug(`sab=${sab}px ih=${window.innerHeight}px vvh=${Math.round(window.visualViewport?.height ?? 0)}px`);
  }, []);

  return (
    <nav
      style={{
        /* In normal flex flow — .column flex-direction:column pushes this
           to the bottom naturally. No absolute positioning needed.
           .main (flex:1) above it gets exactly the right remaining height. */
        flexShrink: 0,
        height: "calc(48px + env(safe-area-inset-bottom, 0px))",
        background: "rgba(10, 10, 10, 0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        zIndex: 50,
      }}
    >
      {debug ? (
        <div style={{ position: "absolute", top: "-20px", left: 0, right: 0, textAlign: "center",
          fontSize: "9px", color: "#ff0", background: "rgba(0,0,0,0.8)", padding: "2px" }}>
          {debug}
        </div>
      ) : null}
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              padding: "4px 14px",
              color: active ? "#e8e8e8" : "#404040",
              textDecoration: "none",
              transition: "color 120ms ease, opacity 120ms ease",
            }}
          >
            <Icon size={19} strokeWidth={active ? 2.2 : 1.7} />
            <span
              style={{
                fontSize: "9px",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.02em",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
