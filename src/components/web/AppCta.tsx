import Link from "next/link";
import { QRCodeBlock } from "@/components/landing/QRCodeBlock";
import styles from "./AppCta.module.css";

// The blog→app conversion unit. Renders on the /learn right rail (desktop) and
// as a block after the article (mobile) so SEO/LLM visitors who land on a
// concept page discover the Kapyn app instead of bouncing.
export function AppCta() {
  return (
    <div className={styles.card}>
      <div className={styles.eyebrow}>The Kapyn app</div>
      <p className={styles.pitch}>
        AI &amp; tech news, distilled to 30-second swipes. Every story that matters — no paywall,
        ever.
      </p>
      <Link href="/" className={styles.button}>
        Open Kapyn →
      </Link>
      <div className={styles.qrWrap}>
        <div className={styles.qr}>
          <QRCodeBlock />
        </div>
        <span className={styles.qrLabel}>Scan to read on your phone</span>
      </div>
    </div>
  );
}
