"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp } from "lucide-react";
import { ShareRow } from "./ShareRow";
import styles from "../../app/(web)/blog/blog.module.css";

type TocItem = { id: string; text: string };

// Wide three-column reading shell: sticky scroll-spy TOC (left), the article
// (center, ~680px measure), and a sticky share + progress rail (right). The hero
// and article body are passed in already server-rendered; this component only
// adds the breakout grid, the rails, scroll-spy, and the reading-progress bar.
export function BlogReader({
  hero,
  toc,
  url,
  title,
  children,
}: {
  hero: ReactNode;
  toc: TocItem[];
  url: string;
  title: string;
  children: ReactNode;
}) {
  const [activeId, setActiveId] = useState<string>(toc[0]?.id ?? "");
  const progressRef = useRef<HTMLDivElement>(null);

  // Scroll-spy — highlight the heading currently in the top reading band.
  useEffect(() => {
    if (!toc.length) return;
    const headings = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!headings.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveId(top.target.id);
        }
      },
      { rootMargin: "-84px 0px -70% 0px", threshold: 0 }
    );
    headings.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [toc]);

  // Reading progress — width driven by a ref to avoid re-rendering on scroll.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const pct = max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0;
        if (progressRef.current) progressRef.current.style.width = `${pct}%`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <div className={styles.progressTrack} aria-hidden>
        <div ref={progressRef} className={styles.progressBar} />
      </div>

      <div className={styles.reader}>
        {hero}

        <div className={styles.readerGrid}>
          {/* Left rail — scroll-spy TOC (desktop) */}
          {toc.length >= 2 && (
            <aside className={styles.tocRail} aria-label="On this page">
              <p className={styles.tocRailLabel}>On this page</p>
              <ol className={styles.tocRailList}>
                {toc.map((it) => (
                  <li key={it.id}>
                    <a
                      href={`#${it.id}`}
                      className={activeId === it.id ? styles.tocRailActive : styles.tocRailLink}
                    >
                      {it.text}
                    </a>
                  </li>
                ))}
              </ol>
            </aside>
          )}

          {/* Center — the article */}
          <div className={styles.readerMain}>{children}</div>

          {/* Right rail — share + back to top (desktop) */}
          <aside className={styles.metaRail}>
            <div className={styles.metaSticky}>
              <ShareRow url={url} title={title} vertical />
              <button onClick={toTop} className={styles.toTop} aria-label="Back to top">
                <ArrowUp size={14} strokeWidth={2.2} /> Top
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
