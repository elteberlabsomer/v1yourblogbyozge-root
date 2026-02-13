import Link from "next/link";
import { listTags } from "@/lib/content/queries";
import styles from "./page.module.css";

export default async function TagsPage() {
  const tags = await listTags();
const tagsSorted = [...tags].sort((a, b) => {
  const ac = Number((a as any).count ?? 0);
  const bc = Number((b as any).count ?? 0);

  if (bc !== ac) return bc - ac; // desc
  return String((a as any).label ?? "").localeCompare(String((b as any).label ?? ""));
});

  return (
    <main className={styles.page}>
      <section className="l-section">
        <div className="l-container">
          <header className={styles.header}>
            <h1 className={styles.title}>Tags</h1>
            
          </header>

          <ul className={styles.list} aria-label="Tags list">
            {tagsSorted.map((t) => (
              <li key={t.slug} className={styles.item}>
                <div className={styles.row}>
                  <Link href={`/tags/${t.slug}`}>{t.label}</Link>
                  <span className={styles.count}>({t.count})</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
