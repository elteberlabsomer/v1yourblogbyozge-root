import Image from 'next/image';
import Link from 'next/link';

import styles from './VideoGrid.module.css';

export type VideoGridPost = {
  slug: string;
  title: string;
  dateIso?: string;
  coverSrc?: string;
  coverAlt?: string;
  categoryLabel: string;
  topicSlug?: string | null;
};

type VideoGridProps = {
  posts: VideoGridPost[];
  limit?: number;
};

function resolveCoverSrc(post: { coverSrc?: string }, fallbackSrc: string) {
  return post.coverSrc && post.coverSrc.length > 0 ? post.coverSrc : fallbackSrc;
}

function resolveCoverAlt(post: { coverAlt?: string; title: string }) {
  return post.coverAlt && post.coverAlt.length > 0 ? post.coverAlt : post.title;
}

function CategoryLabel({
  categoryLabel,
  topicSlug,
}: {
  categoryLabel: string;
  topicSlug?: string | null;
}) {
  if (topicSlug) {
    return (
      <Link href={`/topics/${topicSlug}`} className={styles.categoryLink}>
        {categoryLabel}
      </Link>
    );
  }

  return <span className={styles.categoryText}>{categoryLabel}</span>;
}

function PlayIcon({ size }: { size: 'lg' | 'sm' }) {
  const cls = size === 'lg' ? styles.playIconLg : styles.playIconSm;

  return (
    <svg className={cls} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M10 8.5v7l6-3.5-6-3.5z" fill="currentColor" />
    </svg>
  );
}

export function VideoGrid({ posts, limit = 6 }: VideoGridProps) {
  const safeLimit = Math.max(2, limit);
  const featured = posts[0];

  if (!featured) {
    return null;
  }

  const sideList = posts.slice(1, safeLimit);

  const fallbackCoverSrc =
    featured.coverSrc && featured.coverSrc.length > 0
      ? featured.coverSrc
      : '/demo/archive/01.jpg';

  return (
    <div data-video-grid>
      <article data-video-grid-featured className={styles.hero}>
        <div className={styles.heroMedia}>
          <Image
            src={resolveCoverSrc(featured, fallbackCoverSrc)}
            alt={resolveCoverAlt(featured)}
            fill
            priority
            className={styles.heroImg}
            sizes="(max-width: 430px) 100vw, (max-width: 1024px) 100vw, 60vw"
          />

          <div className={styles.scrim} aria-hidden="true" />

          <div className={styles.playOverlay} aria-hidden="true">
            <PlayIcon size="lg" />
          </div>

          <Link
            href={`/blog/${featured.slug}`}
            className={styles.mediaLink}
            aria-label={`Play: ${featured.title}`}
          >
            <span className={styles.hit} aria-hidden="true" />
          </Link>

          <div className={styles.heroContent}>
            <CategoryLabel
              categoryLabel={featured.categoryLabel}
              topicSlug={featured.topicSlug}
            />

            <h3 className={styles.heroTitle}>
              <Link href={`/blog/${featured.slug}`} className={styles.heroTitleLink}>
                {featured.title}
              </Link>
            </h3>
          </div>
        </div>
      </article>

      <aside data-video-grid-rail aria-label="Featured videos list">
        <ul data-video-grid-list className={styles.listReset}>
          {sideList.map((post) => (
            <li key={post.slug} data-video-grid-row className={styles.row}>
              <div className={styles.rowMedia}>
                <Image
                  src={resolveCoverSrc(post, fallbackCoverSrc)}
                  alt={resolveCoverAlt(post)}
                  fill
                  className={styles.rowImg}
                  sizes="240px"
                />

                <div className={styles.playOverlaySm} aria-hidden="true">
                  <PlayIcon size="sm" />
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className={styles.mediaLinkSm}
                  aria-label={`Play: ${post.title}`}
                >
                  <span className={styles.hit} aria-hidden="true" />
                </Link>
              </div>

              <div className={styles.rowBody}>
                <h4 className={styles.rowTitle}>
                  <Link href={`/blog/${post.slug}`} className={styles.rowTitleLink}>
                    {post.title}
                  </Link>
                </h4>

                <CategoryLabel
                  categoryLabel={post.categoryLabel}
                  topicSlug={post.topicSlug}
                />
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
