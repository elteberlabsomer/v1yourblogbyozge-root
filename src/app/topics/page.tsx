import type { Metadata } from 'next';
import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import Link from 'next/link';

import { listTopics } from '@/lib/content/queries';

import artCover from '@/lib/demo/topic-covers/art.png';
import historyCover from '@/lib/demo/topic-covers/history.webp';
import literatureCover from '@/lib/demo/topic-covers/literature.jpg';
import musicCover from '@/lib/demo/topic-covers/music.jpg';
import relationshipsCover from '@/lib/demo/topic-covers/relationships.avif';
import scienceCover from '@/lib/demo/topic-covers/science.jpg';
import screenCover from '@/lib/demo/topic-covers/screen.webp';
import sportsCover from '@/lib/demo/topic-covers/sports.jpg';
import technologyCover from '@/lib/demo/topic-covers/technology.jpg';
import trueCrimeCover from '@/lib/demo/topic-covers/true-crime.webp';

import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Browse all topics.',
  alternates: { canonical: '/topics' },
};

type TopicCover = string | StaticImageData;

type TopicCard = {
  slug: string;
  label: string;
  cover: TopicCover | null;
};

const TOPIC_COVERS: Record<string, StaticImageData> = {
  art: artCover,
  history: historyCover,
  literature: literatureCover,
  music: musicCover,
  relationships: relationshipsCover,
  science: scienceCover,
  screen: screenCover,
  sports: sportsCover,
  technology: technologyCover,
  'true-crime': trueCrimeCover,
};

function toTitle(value: string) {
  return value
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(' ');
}

export default async function TopicsPage() {
  const topics = await listTopics();

  const cards: TopicCard[] = topics.slice(0, 10).map((t) => {
    const coverFromTopic = TOPIC_COVERS[t.slug] ?? null;

    return {
      slug: t.slug,
      label: t.label ?? toTitle(t.slug),
      cover: coverFromTopic,
    };
  });

  const gridCards = cards.slice(0, 9);
  const featureCard = cards[9] ?? null;

  return (
    <div className={styles.page}>
      <div className="l-container">
        <header className={styles.header}>
          <p className={styles.kicker}>Curated Directory</p>

        </header>

        <ul className={styles.grid}>
          {gridCards.map((c, idx) => (
            <li key={c.slug} className={styles.item}>
              <Link href={`/topics/${c.slug}`} className={styles.card}>
                {c.cover ? (
                  <Image
                    className={styles.cardImage}
                    src={c.cover}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="(max-width: 1280px) 33vw, 420px"
                    priority={idx < 2}
                  />
                ) : (
                  <div className={styles.cardImageFallback} aria-hidden="true" />
                )}

                <div className={styles.cardOverlay}>
                  <h2 className={styles.cardTitle}>{c.label}</h2>
                  <span className={styles.cardArrow} aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {featureCard ? (
          <div className={styles.featureRow}>
            <div className={styles.featureItem}>
              <Link href={`/topics/${featureCard.slug}`} className={styles.card}>
                {featureCard.cover ? (
                  <Image
                    className={styles.cardImage}
                    src={featureCard.cover}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="(max-width: 1280px) 60vw, 720px"
                    priority={false}
                  />
                ) : (
                  <div
                    className={styles.cardImageFallback}
                    aria-hidden="true"
                  />
                )}

                <div className={styles.cardOverlay}>
                  <h2 className={styles.cardTitle}>{featureCard.label}</h2>
                  <span className={styles.cardArrow} aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
