// Card-shaped loading placeholder that mirrors NewsCard's geometry (42% hero +
// category chip + title/summary lines + action row), so a cold fetch reads as
// "loading" instead of a frozen screen. Pure CSS pulse, reduced-motion aware
// (see .skeleton-block in globals.css).
export function FeedSkeleton() {
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "#0a0a0a" }}
    >
      {/* Hero — matches NewsCard's flex 0 0 42% */}
      <div className="skeleton-block" style={{ flex: "0 0 42%", borderRadius: "12px 12px 0 0" }} />

      {/* Content */}
      <div style={{ flex: 1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Category chip */}
        <div className="skeleton-block" style={{ width: "84px", height: "20px", borderRadius: "100px" }} />

        {/* Title — two lines */}
        <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "2px" }}>
          <div className="skeleton-block" style={{ width: "92%", height: "20px" }} />
          <div className="skeleton-block" style={{ width: "64%", height: "20px" }} />
        </div>

        {/* Summary — a few lines */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
          <div className="skeleton-block" style={{ width: "100%", height: "13px" }} />
          <div className="skeleton-block" style={{ width: "100%", height: "13px" }} />
          <div className="skeleton-block" style={{ width: "96%", height: "13px" }} />
          <div className="skeleton-block" style={{ width: "70%", height: "13px" }} />
        </div>

        {/* Action row */}
        <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
          <div className="skeleton-block" style={{ width: "44px", height: "44px", borderRadius: "50%" }} />
          <div className="skeleton-block" style={{ width: "44px", height: "44px", borderRadius: "50%" }} />
        </div>
      </div>
    </div>
  );
}
