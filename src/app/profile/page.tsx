import { User, Bell, Info, ChevronRight } from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    title: "Preferences",
    items: [
      { label: "Notification Settings", icon: Bell },
      { label: "Category Subscriptions", icon: ChevronRight },
    ],
  },
  {
    title: "About",
    items: [{ label: "About AI Changelog", icon: Info }],
  },
];

export default function ProfilePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0a0a0a",
        overflowY: "auto",
      }}
      className="scrollbar-none"
    >
      {/* Avatar section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 20px 32px",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={32} color="#525252" strokeWidth={1.5} />
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#f5f5f5",
              margin: 0,
            }}
          >
            Reader
          </p>
          <p style={{ fontSize: "13px", color: "#525252", margin: "4px 0 0" }}>
            Following all categories
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: "24px",
        }}
      >
        {[
          { value: "0", label: "Saved" },
          { value: "7", label: "Categories" },
          { value: "0", label: "Streak" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "16px",
              borderRight:
                i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
          >
            <span
              style={{ fontSize: "22px", fontWeight: 700, color: "#f5f5f5" }}
            >
              {stat.value}
            </span>
            <span style={{ fontSize: "12px", color: "#525252" }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Settings sections */}
      {SETTINGS_SECTIONS.map((section) => (
        <div key={section.title} style={{ marginBottom: "24px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#525252",
              margin: "0 0 8px",
              padding: "0 20px",
            }}
          >
            {section.title}
          </p>
          <div
            style={{
              background: "#111111",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {section.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "none",
                    border: "none",
                    borderBottom:
                      i < section.items.length - 1
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "none",
                    cursor: "pointer",
                    color: "#f5f5f5",
                    fontSize: "15px",
                  }}
                >
                  <span>{item.label}</span>
                  <ChevronRight size={16} color="#525252" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Version */}
      <p
        style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#404040",
          marginTop: "auto",
          padding: "24px",
        }}
      >
        AI Changelog v1.0.0 · What happened in AI today.
      </p>
    </div>
  );
}
