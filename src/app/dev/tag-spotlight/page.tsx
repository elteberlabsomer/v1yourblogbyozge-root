import { getDemoPostsByTag } from "@/lib/demo";
import {
  TagSpotlight,
  type TagSpotlightPost,
} from "@/components/tag-spotlight/TagSpotlight";

import styles from "./page.module.css";

function parseDateIso(dateIso?: string) {
  if (!dateIso) return 0;
  const t = Date.parse(dateIso);
  return Number.isNaN(t) ? 0 : t;
}

function byDateDesc(a: { dateIso?: string }, b: { dateIso?: string }) {
  return parseDateIso(b.dateIso) - parseDateIso(a.dateIso);
}

function toSpotlightPosts(raw: Array<{ slug: string; title: string; coverSrc?: string; coverAlt?: string; dateIso?: string }>) {
  const posts: TagSpotlightPost[] = [...raw]
    .sort(byDateDesc)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      coverSrc: p.coverSrc,
      coverAlt: p.coverAlt,
    }));

  return posts;
}

export default function DevTagSpotlightPage() {
  const videosRaw = getDemoPostsByTag("videos");
  const commRaw = getDemoPostsByTag("communication");
  const sourcesRaw = getDemoPostsByTag("sources");

  const cards = [
    {
      tagSlug: "videos",
      tagLabel: "videos",
      posts: toSpotlightPosts(videosRaw),
    },
    {
      tagSlug: "communication",
      tagLabel: "communication",
      posts: toSpotlightPosts(commRaw),
    },
    {
      tagSlug: "sources",
      tagLabel: "sources",
      posts: toSpotlightPosts(sourcesRaw),
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {cards.map((c) => (
                        <TagSpotlight
              key={c.tagSlug}
              tagSlug={c.tagSlug}
              tagLabel={c.tagLabel}
              posts={c.posts}
              limit={4}
            />
            
          ))}
        </div>
      </div>
    </main>
  );
}
