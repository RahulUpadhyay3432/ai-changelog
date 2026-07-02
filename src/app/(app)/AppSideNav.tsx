"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, Radar, TrendingUp, Bookmark, User, FileText, Home, type LucideIcon } from "lucide-react";
import { GOLD, TEXT, SG } from "@/lib/design-tokens";
import { ThemeToggle } from "@/components/ThemeToggle";

// Desktop-only left rail for the app shell — the same nav language as the Radar
// sidebar, so the feed and Radar read as one product. Hidden below the desktop
// breakpoint, where the phone's BottomNav takes over.
const PRIMARY: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: "Feed", href: "/", Icon: Newspaper },
  { label: "Radar", href: "/radar", Icon: Radar },
  { label: "Trending", href: "/trending", Icon: TrendingUp },
  { label: "Saved", href: "/saved", Icon: Bookmark },
  { label: "Profile", href: "/profile", Icon: User },
];
const SECONDARY: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: "Blog", href: "/blog", Icon: FileText },
  { label: "Home", href: "/home", Icon: Home },
];

export function AppSideNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const item = ({ label, href, Icon }: { label: string; href: string; Icon: LucideIcon }, dim: boolean) => {
    const on = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "11px 12px",
          borderRadius: "10px", textDecoration: "none", fontFamily: SG, fontSize: "14.5px",
          fontWeight: on ? 600 : 500,
          color: on ? GOLD : dim ? "var(--kt-text-muted, #615c57)" : TEXT.muted,
          background: on ? "rgba(59,130,246,0.10)" : "transparent",
          borderLeft: on ? `2px solid ${GOLD}` : "2px solid transparent",
          transition: "color 0.15s ease, background 0.15s ease",
        }}
      >
        <Icon size={18} strokeWidth={on ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
        {label}
      </Link>
    );
  };

  return (
    <>
      <Link href="/" style={{ fontFamily: SG, fontSize: "21px", fontWeight: 800, letterSpacing: "-0.04em", color: TEXT.primary, textDecoration: "none", padding: "0 12px 22px", transition: "opacity 0.15s ease" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        kapyn
      </Link>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {PRIMARY.map((i) => item(i, false))}
      </div>
      <div style={{ height: "1px", background: "var(--kt-hairline, rgba(255,255,255,0.08))", margin: "12px 12px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {SECONDARY.map((i) => item(i, true))}
      </div>
      <div style={{ marginTop: "auto", padding: "0 12px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <ThemeToggle />
        <div style={{ fontSize: "12px", color: "var(--kt-text-muted, #615c57)", lineHeight: 1.5 }}>
          Calm intelligence for AI.<br />No paywall, ever.
        </div>
      </div>
    </>
  );
}
