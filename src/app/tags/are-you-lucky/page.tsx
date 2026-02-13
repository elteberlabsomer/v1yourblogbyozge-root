import { notFound } from "next/navigation";

import { MainGrid } from "@/components/main-grid/MainGrid";
import { TopicSpotlight, type TopicSpotlightPost } from "@/components/tag-spotlight/TagSpotlight";

import {
  getTagBySlug,
  listPostsByTagSlug,
  listPostsByTopicSlug,
  listTopics,
} from "@/lib/content/queries";

import styles from "./page.module.css";

const TAG_SLUG = "are-you-lucky";

function toText(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function hashSeed(input: string): number {
  // FNV-1a 32-bit
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRandom<T>(items: T[], count: number, seed: number): T[] {
  if (items.length === 0) return [];
  const rand = mulberry32(seed);
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }

  return copy.slice(0, Math.max(0, count));
}

export default async function AreYouLuckyTagPage() {
  const tag = await getTagBySlug(TAG_SLUG);
  if (!tag) notFound();

  const allTagPosts = await listPostsByTagSlug(TAG_SLUG);
  const gridPosts = allTagPosts.slice(0, 15);

  // Bottom 3: random categories (topics), deterministic by tag slug
  const topics = await listTopics();
  const spotlightTopics = pickRandom(topics, 3, hashSeed(TAG_SLUG));

  const spotlightBlocks = await Promise.all(
    spotlightTopics.map(async (t) => {
      const posts = await listPostsByTopicSlug(t.slug);

      const mapped: TopicSpotlightPost[] = posts.slice(0, 4).map((p) => ({
        slug: p.slug,
        title: p.title,
        coverSrc: toText(p.cover?.src) || null,
        coverAlt: toText(p.cover?.alt) || null,
      }));

      return { topicSlug: t.slug, topicLabel: t.label, posts: mapped };
    })
  );

  return (
    <section className={styles.page}>
      <section className="l-section">
        <div className="l-container">
          <div className={styles.stack}>
            <section className={`${styles.block} ${styles.intro}`} aria-label="Intro">
              <h3 className={styles.introSubtitle}>
                “Chances are you’re not one of the lucky ones — if you’ve found my blog, you’re not
                that unlucky either. And take a look at these people; you’ll quickly see who’s truly
                lucky and who isn’t.”
              </h3>
            </section>

            <section className={styles.block} aria-label="Main grid">
              <MainGrid posts={gridPosts} className={styles.mainGrid} ariaLabel="Tag posts grid" />
            </section>

            {spotlightBlocks.length > 0 ? (
              <section className={styles.block} aria-label="Category spotlight">
                <div className={styles.tagGrid}>
                  {spotlightBlocks.map((b) => (
                    <div key={b.topicSlug} className={styles.tagCell}>
                      <TopicSpotlight
                        topicSlug={b.topicSlug}
                        topicLabel={b.topicLabel}
                        posts={b.posts}
                        limit={4}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </section>
  );
}
