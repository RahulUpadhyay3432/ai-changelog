// Bare layout for embeddable widgets — no header/footer chrome, so the widget
// drops cleanly into an <iframe> on any site. Root layout still supplies html/
// body/fonts. Each embed widget links back to kapyn.app (earned backlinks).
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "#0c0b0a", minHeight: "100dvh" }}>{children}</div>;
}
