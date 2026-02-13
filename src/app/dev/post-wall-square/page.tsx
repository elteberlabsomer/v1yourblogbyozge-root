import { PostWallSquare } from "@/components/post-wall-square/PostWallSquare";
import { DEMO_POSTS } from "@/lib/demo";
import styles from "./page.module.css";

const HERO_LIMIT = 4;
const DEMO_THUMB_COUNT = 6;

function getThumbSrc(index: number): string {
  const n = (index % DEMO_THUMB_COUNT) + 1;
  const pad = String(n).padStart(2, "0");
  return `/demo/${pad}.jpg`;
}

export default function Page() {
  const posts = DEMO_POSTS.slice(0, HERO_LIMIT);

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-label="Dev hero preview">
        <div className={styles.tiles} aria-label="Tiles">
          {posts.map((post, index) => {
            const badge =
              post.categoryLabel && post.topicSlug
                ? {
                    label: post.categoryLabel,
                    href: `/topics/${post.topicSlug}`,
                  }
                : undefined;

            return (
              <div key={post.slug} className={styles.tile}>
                <PostWallSquare
                  href={`/blog/${post.slug}`}
                  title={post.title}
                  imageSrc={getThumbSrc(index)}
                  badge={badge}
                  priority={index === 0}
                />
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
