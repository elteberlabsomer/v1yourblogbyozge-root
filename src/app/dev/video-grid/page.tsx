import { getDemoPostsByTag } from "@/lib/demo";
import { VideoGrid, type VideoGridPost } from "@/components/video-grid/VideoGrid";

import styles from "./page.module.css";

function parseDateIso(dateIso?: string) {
  if (!dateIso) return 0;
  const t = Date.parse(dateIso);
  return Number.isNaN(t) ? 0 : t;
}

function byDateDesc(a: { dateIso?: string }, b: { dateIso?: string }) {
  return parseDateIso(b.dateIso) - parseDateIso(a.dateIso);
}

export default function DevVideoGridPage() {
  const raw = getDemoPostsByTag("videos");

  const posts: VideoGridPost[] = [...raw]
    .sort(byDateDesc)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      dateIso: p.dateIso,
      coverSrc: p.coverSrc,
      coverAlt: p.coverAlt,
      categoryLabel: p.categoryLabel,
      topicSlug: p.topicSlug,
    }));

  return (
    <main className={styles.page}>
      <section className={styles.section}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h2 className={styles.sectionTitle}>FEATURED VIDEOS</h2>
          </header>

          <div className={styles.gridShell}>
            <VideoGrid posts={posts} limit={6} />
          </div>
        </div>
      </section>
    </main>
  );
}
