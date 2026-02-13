"use client";

import Image from "next/image";
import Link from "next/link";

import styles from "./MainGrid.module.css";

type CoverLike = { src?: string | null; alt?: string | null };

export type MainGridPost = {
  slug: string;
  title: string;

  categoryLabel?: string | null;
  topicSlug?: string | null;

  topic?: { label?: string | null; slug?: string | null } | null;

  cover?: CoverLike | null;

  coverSrc?: string | null;
  coverAlt?: string | null;
};

type Props = {
  posts?: MainGridPost[];
  ariaLabel?: string;
  className?: string;
};

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function pickCoverSrc(post: MainGridPost) {
  const a = toText(post.cover?.src);
  if (a.length > 0) return a;

  const b = toText(post.coverSrc);
  if (b.length > 0) return b;

  return "";
}

function pickCoverAlt(post: MainGridPost) {
  const a = toText(post.cover?.alt);
  if (a.length > 0) return a;

  const b = toText(post.coverAlt);
  if (b.length > 0) return b;

  return post.title;
}

function pickCategory(post: MainGridPost) {
  const a = toText(post.categoryLabel);
  if (a.length > 0) return a;

  const b = toText(post.topic?.label);
  if (b.length > 0) return b;

  return "";
}

function pickTopicSlug(post: MainGridPost) {
  const a = toText(post.topicSlug);
  if (a.length > 0) return a;

  const b = toText(post.topic?.slug);
  if (b.length > 0) return b;

  return "";
}

function pickCategoryHref(post: MainGridPost) {
  const topicSlug = pickTopicSlug(post);
  if (topicSlug.length > 0) return `/topics/${topicSlug}`;
  return "";
}

export function MainGrid({ posts, ariaLabel = "Main grid", className }: Props) {
  const safePosts = Array.isArray(posts) ? posts : [];
  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  return (
    <ul className={rootClassName} aria-label={ariaLabel}>
      {safePosts.map((post) => {
        const coverSrc = pickCoverSrc(post);
        const coverAlt = pickCoverAlt(post);
        const category = pickCategory(post);
        const categoryHref = pickCategoryHref(post);

        return (
          <li key={post.slug} className={styles.item}>
            <article className={styles.card}>
              <Link
                href={`/blog/${post.slug}`}
                className={styles.mediaLink}
                aria-label={post.title}
              >
                <div className={styles.media}>
                  {coverSrc.length > 0 ? (
                    <Image
                      src={coverSrc}
                      alt={coverAlt}
                      fill
                      sizes="(max-width: 430px) 100vw, 430px"
                      className={styles.img}
                    />
                  ) : (
                    <div className={styles.mediaFallback} aria-hidden="true" />
                  )}
                </div>
              </Link>

              {category.length > 0 && categoryHref.length > 0 ? (
                <Link href={categoryHref} className={styles.categoryLink}>
                  {category}
                </Link>
              ) : category.length > 0 ? (
                <p className={styles.categoryText}>{category}</p>
              ) : null}

              <h3 className={styles.title}>
                <Link href={`/blog/${post.slug}`} className={styles.titleLink}>
                  {post.title}
                </Link>
              </h3>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
