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
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <main
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          paddingBottom: "calc(60px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {children}
      </main>
      <BottomNav />
      <AddToHomeScreen />
    </div>
  );
}
