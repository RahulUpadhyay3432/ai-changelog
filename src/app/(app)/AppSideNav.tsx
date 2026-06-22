"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, Radar, TrendingUp, Bookmark, User, FileText, Home, type LucideIcon } from "lucide-react";
import { GOLD, TEXT, SG } from "@/lib/design-tokens";

// The nav list for the desktop app shell's left rail. The wordmark + tagline now
// live in AppPositioningPanel (rendered above this in the same rail), so the rail
// reads as one brand header → pitch → nav. Same nav language as the Radar
// sidebar. Hidden below the desktop breakpoint, where the phone's BottomNav takes over.
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
          color: on ? GOLD : dim ? "#615c57" : TEXT.muted,
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
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {PRIMARY.map((i) => item(i, false))}
      </div>
      <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "12px 12px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {SECONDARY.map((i) => item(i, true))}
      </div>
    </>
  );
}
