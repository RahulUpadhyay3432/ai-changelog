import styles from "../../app/(web)/blog/blog.module.css";

// "On this page" — built from a post's level-2 headings. Inline (not a side rail)
// so it lives inside the centered narrow article column without a layout change.
export function ArticleToc({ items }: { items: { id: string; text: string }[] }) {
  if (items.length < 3) return null;
  return (
    <nav className={styles.toc} aria-label="On this page">
      <p className={styles.tocLabel}>On this page</p>
      <ol className={styles.tocList}>
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className={styles.tocLink}>
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
