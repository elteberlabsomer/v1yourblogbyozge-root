import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PostWallSquare } from '@/components/post-wall-square/PostWallSquare';
import { QuoteSpotlight } from '@/components/quote-spotlight/QuoteSpotlight';
import { MainGrid } from '@/components/main-grid/MainGrid';
import { TagSpotlight, type TagSpotlightPost } from '@/components/tag-spotlight/TagSpotlight';

import {
  getTopicBySlug,
  listPostsByTagSlug,
  listPostsByTopicSlug,
  listTopics,
} from '@/lib/content/queries';
import { directusAssetUrl } from '@/lib/directus/asset-url';

import styles from './page.module.css';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const topic = await getTopicBySlug(slug);
  if (!topic) {
    return {
      title: 'Not found',
      robots: { index: false, follow: false },
    };
  }

  const title = `Topic: ${topic.label}`;
  const description = `Latest posts in ${topic.label}.`;
  const canonicalUrl = `/topics/${topic.slug}`;

  const posts = await listPostsByTopicSlug(slug);
  const first = posts[0] as any;

  const coverSrc = pickCoverSrc(first);
  const coverAlt = pickCoverAlt(first);

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const imageUrl = new URL(coverSrc, siteUrl).toString();

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title,
      description,
      images: [{ url: imageUrl, alt: coverAlt || title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export async function generateStaticParams() {
  const topics = await listTopics();
  return topics.map((t) => ({ slug: t.slug }));
}

function toText(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
}

function pickCoverSrc(post: { cover?: { src?: string | null } | null }) {
  const src = toText(post.cover?.src);
  return src.length > 0 ? src : '/demo/archive/01.jpg';
}

function pickCoverAlt(post: { title: string; cover?: { alt?: string | null } | null }) {
  const alt = toText(post.cover?.alt);
  return alt.length > 0 ? alt : post.title;
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

export default async function TopicDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const topic = await getTopicBySlug(slug);
  if (!topic) {
    notFound();
  }

  const allTopicPosts = await listPostsByTopicSlug(slug);
  const latest14 = allTopicPosts.slice(0, 14);
  const heroPosts = latest14.slice(0, 4);
  const gridPosts = latest14.slice(4, 14);

  // Pick 3 tags (deterministic “random” by topic slug) from this topic’s posts
  const tagMap = new Map<string, { slug: string; label: string; count: number }>();

  allTopicPosts.forEach((p) => {
    (p.tags ?? []).forEach((t) => {
      const tagSlug = toText(t.slug).toLowerCase();
      const tagLabel = toText(t.label);
      if (tagSlug.length === 0 || tagLabel.length === 0) {
        return;
      }

      const existing = tagMap.get(tagSlug);
      if (existing) {
        existing.count += 1;
        return;
      }
      tagMap.set(tagSlug, { slug: tagSlug, label: tagLabel, count: 1 });
    });
  });

  const tagPool = Array.from(tagMap.values());
  const eligible = tagPool.filter((t) => t.count >= 2);
  const pool = eligible.length >= 3 ? eligible : tagPool;

  const spotlightTags = pickRandom(pool, 3, hashSeed(slug));

  const spotlightBlocks = await Promise.all(
    spotlightTags.map(async (t) => {
      const posts = await listPostsByTagSlug(t.slug);

      const mapped: TagSpotlightPost[] = posts.slice(0, 4).map((p) => ({
        slug: p.slug,
        title: p.title,
        coverSrc: directusAssetUrl(p.cover?.src ?? null, { key: 'portrait' }) || null,
        coverAlt: p.cover?.alt ?? null,
      }));

      return { tagSlug: t.slug, tagLabel: t.label, posts: mapped };
    }),
  );

  return (
    <section className={styles.page}>
      {/* HERO (not constrained to 1280) */}
      <section className={styles.heroBleed} aria-label={`${topic.label} latest`}>
        <div className={styles.tiles} aria-label="Latest 4 posts">
          {heroPosts.map((post, index) => (
            <div key={post.slug} className={styles.tile}>
              <PostWallSquare
                href={`/blog/${post.slug}`}
                title={post.title}
                imageSrc={directusAssetUrl(pickCoverSrc(post), { key: 'square' })}
                imageAlt={pickCoverAlt(post)}
                priority={index === 0}
                badge={{ label: topic.label, href: `/topics/${slug}` }}
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
              <MainGrid
                posts={gridPosts}
                className={styles.mainGrid}
                ariaLabel="Topic posts grid"
              />
            </section>

            {spotlightBlocks.length > 0 ? (
              <section className={styles.block} aria-label="Tag spotlight">
                <div className={styles.tagGrid}>
                  {spotlightBlocks.map((b) => (
                    <div key={b.tagSlug} className={styles.tagCell}>
                      <TagSpotlight
                        tagSlug={b.tagSlug}
                        tagLabel={b.tagLabel}
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
