// TagSpotlight.tsx
import Image from 'next/image';
import Link from 'next/link';

import styles from './TagSpotlight.module.css';

export type TagSpotlightPost = {
  slug: string;
  title: string;
  coverSrc?: string | null;
  coverAlt?: string | null;
};

export type TopicSpotlightPost = TagSpotlightPost;

type BaseProps = {
  titleHref: string;
  titleText: string;
  posts: TagSpotlightPost[];
  limit?: number; // includes featured
  dataAttr: string;
};

type TagProps = {
  tagSlug: string;
  tagLabel: string;
  posts: TagSpotlightPost[];
  limit?: number; // includes featured
};

type TopicProps = {
  topicSlug: string;
  topicLabel: string;
  posts: TopicSpotlightPost[];
  limit?: number; // includes featured
};

function toText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function pickCoverSrc(post: TagSpotlightPost) {
  const v = toText(post.coverSrc);
  return v.length > 0 ? v : '';
}

function pickCoverAlt(post: TagSpotlightPost) {
  const v = toText(post.coverAlt);
  return v.length > 0 ? v : post.title;
}

function toHashtag(label: string) {
  const t = label.trim();
  if (!t) {
    return '#TAG';
  }
  return `#${t.toUpperCase()}`;
}

function toTopicTitle(label: string) {
  const t = label.trim();
  if (!t) {
    return 'TOPIC';
  }
  return t.toUpperCase();
}

function BaseSpotlight({ titleHref, titleText, posts, limit = 4, dataAttr }: BaseProps) {
  const safePosts = Array.isArray(posts) ? posts : [];
  const featured = safePosts[0];

  if (!featured) {
    return null;
  }

  const safeLimit = Math.max(2, limit);
  const sideList = safePosts.slice(1, safeLimit);

  const featuredCoverSrc = pickCoverSrc(featured);
  const featuredCoverAlt = pickCoverAlt(featured);
  const fallbackCoverSrc = '/demo/archive/01.jpg';

  const bgSrc = featuredCoverSrc.length > 0 ? featuredCoverSrc : fallbackCoverSrc;

  return (
    <article className={styles.root} data-spotlight={dataAttr}>
      <div className={styles.media} aria-hidden="true">
        <Image
          src={bgSrc}
          alt={featuredCoverAlt}
          fill
          className={styles.img}
          sizes="(max-width: 430px) 100vw, 420px"
        />
        <div className={styles.scrim} aria-hidden="true" />
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <h3 className={styles.tagTitle}>
            <Link href={titleHref} className={styles.tagLink}>
              {titleText}
            </Link>
          </h3>
        </header>

        <div className={styles.featuredBlock}>
          <div className={styles.featuredRow}>
            <span className={styles.featuredDot} aria-hidden="true" />
            <h4 className={styles.featuredTitle}>
              <Link href={`/blog/${featured.slug}`} className={styles.featuredLink}>
                {featured.title}
              </Link>
            </h4>
          </div>
        </div>

        <ul className={styles.list}>
          {sideList.map((p) => (
            <li key={p.slug} className={styles.item}>
              <span className={styles.dot} aria-hidden="true" />
              <Link href={`/blog/${p.slug}`} className={styles.itemLink}>
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function TagSpotlight({ tagSlug, tagLabel, posts, limit = 4 }: TagProps) {
  return (
    <BaseSpotlight
      titleHref={`/tags/${tagSlug}`}
      titleText={toHashtag(tagLabel)}
      posts={posts}
      limit={limit}
      dataAttr="tag"
    />
  );
}

export function TopicSpotlight({ topicSlug, topicLabel, posts, limit = 4 }: TopicProps) {
  return (
    <BaseSpotlight
      titleHref={`/topics/${topicSlug}`}
      titleText={toTopicTitle(topicLabel)}
      posts={posts}
      limit={limit}
      dataAttr="topic"
    />
  );
}
