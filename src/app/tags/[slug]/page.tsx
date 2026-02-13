import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MainGrid } from '@/components/main-grid/MainGrid';
import { PostWallSquare } from '@/components/post-wall-square/PostWallSquare';
import { QuoteSpotlight } from '@/components/quote-spotlight/QuoteSpotlight';
import { TopicSpotlight, type TopicSpotlightPost } from '@/components/tag-spotlight/TagSpotlight';

import {
  getTagBySlug,
  listPostsByTagSlug,
  listPostsByTopicSlug,
  listTags,
  listTopics,
} from '@/lib/content/queries';

import styles from './page.module.css';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const tag = await getTagBySlug(slug);
  if (!tag) {
    return {
      title: 'Not found',
      robots: { index: false, follow: false },
    };
  }

  const title = `Tag: ${tag.label}`;
  const description = `Posts tagged "${tag.label}".`;
  const canonicalUrl = `/tags/${tag.slug}`;

  const posts = await listPostsByTagSlug(slug);
  const first = posts[0] as any;

  const coverSrc = toText(first?.cover?.src);
  const coverAlt = toText(first?.cover?.alt) || title;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const imageUrl = coverSrc ? new URL(coverSrc, siteUrl).toString() : null;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title,
      description,
      ...(imageUrl ? { images: [{ url: imageUrl, alt: coverAlt }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export async function generateStaticParams() {
  const tags = await listTags();
  return tags.map((t) => ({ slug: t.slug }));
}

function toText(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
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
  if (items.length === 0) {
    return [];
  }
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

export default async function TagDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const tag = await getTagBySlug(slug);
  if (!tag) {
    notFound();
  }

  const allTagPosts = await listPostsByTagSlug(slug);
  const latest14 = allTagPosts.slice(0, 14);
  const heroPosts = latest14.slice(0, 4);
  const gridPosts = latest14.slice(4, 14);

  // Bottom 3: random categories (topics), deterministic by tag slug
  const topics = await listTopics();
  const spotlightTopics = pickRandom(topics, 3, hashSeed(slug));

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
    }),
  );

  return (
    <section className={styles.page}>
      {/* HERO (not constrained to 1280) */}
      <section className={styles.heroBleed} aria-label={`${tag.label} latest`}>
        <div className={styles.tiles} aria-label="Latest 4 posts">
          {heroPosts.map((post, index) => (
            <div key={post.slug} className={styles.tile}>
              <PostWallSquare
                href={`/blog/${post.slug}`}
                title={post.title}
                imageSrc={post.cover?.src ?? '/demo/archive/01.jpg'}
                imageAlt={post.cover?.alt ?? post.title}
                badge={{ label: tag.label, href: `/tags/${tag.slug}` }}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Everything below is locked inside l-container (1280) */}
      <section className="l-section">
        <div className="l-container">
          <div className={styles.stack}>
            <section className={`${styles.block} ${styles.quoteBlock}`} aria-label="Quote spotlight">
              <QuoteSpotlight />
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
