import { BottomNav } from "@/components/layout/BottomNav";
import { AddToHomeScreen } from "@/components/pwa/AddToHomeScreen";
import styles from "./layout.module.css";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.outer}>
      <div className={styles.phoneShell}>
        <div className={styles.phoneBezel}>
          <div className={styles.column}>
            <main className={styles.main}>
              {children}
            </main>
            <BottomNav />
            <AddToHomeScreen />
          </div>
        </div>
      </div>
    </div>
  );
}
