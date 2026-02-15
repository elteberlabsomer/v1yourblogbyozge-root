'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PostShareActions } from '@/components/post-share-actions/PostShareActions';
import styles from './PostHeader.module.css';

export type PostHeaderProps = {
  authorName: string;
  dateIso: string;
  categoryLabel: string;
  topicSlug: string;
  title: string;
  summary: string;
  coverSrc: string;
  coverAlt: string;
  shareUrl: string;
};

function formatDateEn(dateIso: string): string {
  const d = new Date(dateIso);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(d);
}

export function PostHeader(props: PostHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.meta} aria-label="Post meta">
        <Link className={styles.metaItem} href="/pages/about">
          <svg
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {props.authorName}
        </Link>

        <span className={styles.metaDivider} aria-hidden="true" />

        <span className={styles.metaItem}>
          <svg
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <time dateTime={props.dateIso}>{formatDateEn(props.dateIso)}</time>
        </span>

        <span className={styles.metaDivider} aria-hidden="true" />

        <Link className={styles.category} href={`/topics/${props.topicSlug}`}>
          #{props.categoryLabel}
        </Link>
      </div>

      <h1 className={styles.title}>{props.title}</h1>

      <p className={styles.summary}>{props.summary}</p>

      <PostShareActions url={props.shareUrl} title={props.title} />

      {props.coverSrc ? (
        <figure className={styles.cover}>
          <Image
            className={styles.coverImg}
            src={props.coverSrc}
            alt={props.coverAlt}
            width={1200}
            height={675}
            priority
          />
        </figure>
      ) : null}
    </header>
  );
}
