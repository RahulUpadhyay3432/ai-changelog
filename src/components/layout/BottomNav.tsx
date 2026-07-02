"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Radar, Bookmark, User, LayoutGrid, Plug, Activity, Newspaper } from "lucide-react";

const GLOBAL_NAV = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/trending", label: "Trending", Icon: TrendingUp },
  { href: "/radar", label: "Radar", Icon: Radar },
  { href: "/saved", label: "Saved", Icon: Bookmark },
  { href: "/profile", label: "Profile", Icon: User },
] as const;

// Radar is its own space — entering it swaps the nav to Radar-specific
// sections (Today / Pulse / Browse / MCP) plus an exit back to the feed.
// "Feed" (not "Home") — Home means the landing everywhere else; the exit
// here goes to the news app at "/". Toolkit stays reachable via desktop
// side nav and /radar/toolkit.
const RADAR_NAV = [
  { href: "/radar", label: "Today", Icon: Radar },
  { href: "/radar/pulse", label: "Pulse", Icon: Activity },
  { href: "/radar/browse", label: "Browse", Icon: LayoutGrid },
  { href: "/radar/mcp", label: "MCP", Icon: Plug },
  { href: "/", label: "Feed", Icon: Newspaper },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const inRadar = pathname === "/radar" || pathname.startsWith("/radar/");
  const items = inRadar ? RADAR_NAV : GLOBAL_NAV;

  return (
    <nav
      style={{
        flexShrink: 0,
        height: "calc(48px + env(safe-area-inset-bottom, 0px))",
        background: "var(--kt-web-header-bg, rgba(10, 10, 10, 0.96))",
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
      {items.map(({ href, label, Icon }) => {
        const active = pathname === href;
        // Radar is the hero feature — its tab reads larger than the rest.
        const isRadar = label === "Radar" || label === "Today";
        // In Radar, "Home" is the way *out* — set it apart with a divider and a
        // brighter-than-inactive tint so "how do I get back" is always answerable.
        const isExit = inRadar && href === "/";
        const color = isExit ? (active ? "var(--kt-text-primary, #e8e8e8)" : "var(--kt-text-muted, #7d7d7d)") : active ? "var(--kt-text-primary, #e8e8e8)" : isRadar ? "var(--kt-text-muted, #8a8a8a)" : "var(--kt-text-muted, #404040)";
        return (
          <Fragment key={href}>
            {isExit && (
              <span aria-hidden style={{ alignSelf: "center", width: "1px", height: "22px", background: "var(--kt-hairline, rgba(255,255,255,0.10))" }} />
            )}
            <Link
              href={href}
              aria-label={isExit ? "Leave Radar — back to the Feed" : label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                padding: "4px 14px",
                color,
                textDecoration: "none",
                transition: "color 120ms ease, opacity 120ms ease",
              }}
            >
              <Icon size={isRadar ? 25 : 19} strokeWidth={active ? 2.3 : isRadar ? 2 : 1.7} />
              <span
                style={{
                  fontSize: isRadar ? "9.5px" : "9px",
                  fontWeight: active ? 600 : isRadar ? 600 : 400,
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </span>
            </Link>
          </Fragment>
        );
      })}
    </nav>
  );
}
