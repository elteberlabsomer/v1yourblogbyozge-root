import { DEMO_POSTS } from "@/lib/demo";
import { MainGrid, type MainGridPost } from "@/components/main-grid/MainGrid";

import styles from "./page.module.css";

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRandom<T>(items: T[], count: number, seed: number): T[] {
  const rand = mulberry32(seed);
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }

  return copy.slice(0, count);
}

function mapDemoToGridPost(p: (typeof DEMO_POSTS)[number]): MainGridPost {
  return {
    slug: p.slug,
    title: p.title,
    categoryLabel: p.categoryLabel,
    topicSlug: p.topicSlug,
    coverSrc: p.coverSrc,
    coverAlt: p.coverAlt,
  };
}

export default function DevMainGridPage() {
  const picked = pickRandom(DEMO_POSTS, 10, 20260205).map(mapDemoToGridPost);

  return (
    <main className={styles.wrap}>
      <h1 className={styles.h1}>MainGrid (Dev)</h1>

      <MainGrid
        posts={picked}
        ariaLabel="Dev main grid"
        className={styles.grid5}
      />
    </main>
  );
}
