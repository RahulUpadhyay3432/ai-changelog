"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radar, LayoutGrid, Bookmark, Home, Trophy, Plug, Newspaper, Activity } from "lucide-react";
import styles from "./layout.module.css";

const NAV_ITEMS = [
  { href: "/radar", label: "Today", Icon: Radar, exact: true },
  { href: "/radar/pulse", label: "Pulse", Icon: Activity, exact: true },
  { href: "/radar/browse", label: "Browse", Icon: LayoutGrid, exact: true },
  { href: "/radar/mcp", label: "MCP", Icon: Plug, exact: true },
  { href: "/radar/toolkit", label: "Toolkit", Icon: Bookmark, exact: false },
  { href: "/radar/hackathons", label: "Hackathons", Icon: Trophy, exact: true },
] as const;

const GOLD = "#3b82f6";
const SG = "Space Grotesk, sans-serif";

export function RadarSideNav() {
  const pathname = usePathname();

  return (
    <aside className={styles.sideNav}>
      {/* Wordmark */}
      <Link href="/" style={{ padding: "0 20px 20px", fontFamily: SG, fontSize: "20px", fontWeight: 800, color: "var(--kt-text-primary, #f6f4f0)", letterSpacing: "-0.04em", textDecoration: "none", cursor: "pointer", transition: "opacity 0.15s ease" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        kapyn
      </Link>

      {/* Radar nav items */}
      {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 20px",
              textDecoration: "none",
              fontFamily: SG,
              fontSize: "14px",
              fontWeight: active ? 600 : 450,
              color: active ? GOLD : "var(--kt-text-muted, #a29d94)",
              background: active ? "rgba(59,130,246,0.08)" : "transparent",
              borderLeft: active ? `2px solid ${GOLD}` : "2px solid transparent",
              transition: "color 0.15s ease, background 0.15s ease",
            }}
          >
            <Icon size={17} strokeWidth={active ? 2.3 : 1.7} />
            {label}
          </Link>
        );
      })}

      {/* Divider */}
      <div style={{ margin: "12px 20px", height: "1px", background: "var(--kt-hairline, rgba(255,255,255,0.07))" }} />

      {/* Exit affordances — Feed (phone app) + Home (landing hub) */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 20px",
          textDecoration: "none",
          fontFamily: SG,
          fontSize: "14px",
          fontWeight: 450,
          color: "var(--kt-text-muted, #a29d94)",
          borderLeft: "2px solid transparent",
          transition: "color 0.15s ease",
        }}
      >
        <Newspaper size={17} strokeWidth={1.7} />
        Feed
      </Link>
      <Link
        href="/home"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 20px",
          textDecoration: "none",
          fontFamily: SG,
          fontSize: "14px",
          fontWeight: 450,
          color: "var(--kt-text-muted, #a29d94)",
          borderLeft: "2px solid transparent",
          transition: "color 0.15s ease",
        }}
      >
        <Home size={17} strokeWidth={1.7} />
        Home
      </Link>
    </aside>
  );
}
