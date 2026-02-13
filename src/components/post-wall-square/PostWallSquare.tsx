"use client";

import Image from "next/image";
import Link from "next/link";

import styles from "./PostWallSquare.module.css";

type Badge = {
  label: string;
  href: string;
};

export type PostWallSquareProps = {
  href: string;
  title: string;
  imageSrc: string;
  imageAlt?: string;
  badge?: Badge;
  priority?: boolean;
};

export function PostWallSquare({
  href,
  title,
  imageSrc,
  imageAlt,
  badge,
  priority = false,
}: PostWallSquareProps) {
  return (
    <article className={styles.root}>
      <div className={styles.media}>
        <Image
          src={imageSrc}
          alt={imageAlt ?? title}
          fill
          className={styles.img}
          sizes="(max-width: 430px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
        />

        <div className={styles.scrim} aria-hidden="true" />

        <Link href={href} className={styles.mediaLink} aria-label={title}>
          <span aria-hidden="true" />
        </Link>

        {badge ? (
          <div className={styles.corner}>
            <Link href={badge.href} className={styles.badge}>
              <span className={styles.badgeText}>{badge.label}</span>
            </Link>
          </div>
        ) : null}

        <div className={styles.content}>
          <h3 className={styles.title}>
            <Link href={href} className={styles.titleLink}>
              {title}
            </Link>
          </h3>
        </div>
      </div>
    </article>
  );
}
