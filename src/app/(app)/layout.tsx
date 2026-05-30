import { BottomNav } from "@/components/layout/BottomNav";
import { AddToHomeScreen } from "@/components/pwa/AddToHomeScreen";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#050505",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      {/* Constrained phone-width column */}
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          height: "100dvh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          paddingTop: "env(safe-area-inset-top, 0px)",
          position: "relative",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 0 80px rgba(0,0,0,0.8)",
        }}
      >
        <main
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            paddingBottom: "calc(48px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {children}
        </main>
        <BottomNav />
        <AddToHomeScreen />
      </div>
    </div>
  );
}
