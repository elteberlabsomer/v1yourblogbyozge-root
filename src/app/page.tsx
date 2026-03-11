import { content } from '@/lib/content';
import type { Post } from '@/lib/content/types';

import { PostWallSquare } from '@/components/post-wall-square/PostWallSquare';
import { QuoteSpotlight } from '@/components/quote-spotlight/QuoteSpotlight';
import { MainGrid, type MainGridPost } from '@/components/main-grid/MainGrid';
import { SocialMediaCard } from '@/components/social-media-card/SocialMediaCard';
import { VideoGrid, type VideoGridPost } from '@/components/video-grid/VideoGrid';
import { HomeNewsletterSignup } from '@/components/home/HomeNewsletterSignup';
import { TagSpotlightSection } from '@/components/tag-spotlight/TagSpotlightSection';


import styles from './page.module.css';
export const revalidate = 900;

const SIX_HOURS_MS = 15 * 60 * 1000;
const TAG_SPOTLIGHT_MIN_POSTS = 2;
const TAG_SPOTLIGHT_COLUMNS = 3;
const TAG_SPOTLIGHT_TOP_POOL = 24;

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const AVATAR =
  'https://cms.yourblogbyosge.com/assets/e5279d49-8702-4f0a-9b09-2b156224ffb7?width=128&height=128&fit=cover&quality=75&format=avif';

function parseDateIso(dateIso?: string) {
  if (!dateIso) {
    return 0;
  }
  const t = Date.parse(dateIso);
  return Number.isNaN(t) ? 0 : t;
}

function byDateDesc(a: { dateIso?: string }, b: { dateIso?: string }) {
  return parseDateIso(b.dateIso) - parseDateIso(a.dateIso);
}

function mapPostToMainGridPost(p: Post): MainGridPost {
  return {
    slug: p.slug,
    title: p.title,
    topic: p.topic ? { slug: p.topic.slug, label: p.topic.label } : null,
    cover: p.cover ? { src: p.cover.src, alt: p.cover.alt } : null,
  };
}

function mapPostToVideoGridPost(p: Post): VideoGridPost {
  return {
    slug: p.slug,
    title: p.title,
    dateIso: p.dateIso,
    coverSrc: p.cover?.src ?? '',
    coverAlt: p.cover?.alt ?? p.title,
    categoryLabel: p.topic?.label ?? '',
    topicSlug: p.topic?.slug ?? null,
  };
}

function toSpotlightPosts(raw: Post[]) {
  const posts = [...raw]
    .sort(byDateDesc)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      coverSrc: p.cover?.src ?? '',
      coverAlt: p.cover?.alt ?? p.title,
    }));

  return posts;
}

function normalizeSlug(input: unknown): string {
  return typeof input === 'string' ? input.trim().toLowerCase() : '';
}

function hasTag(post: Post, tagSlug: string) {
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const needle = normalizeSlug(tagSlug);
  return tags.some((t) => normalizeSlug((t as any)?.slug) === needle);
}

export default async function HomePage() {
  const { items } = await content.listPosts({ limit: 240 });

  const latest14 = items.slice(0, 14);
  const heroPosts = latest14.slice(0, 4);
  const gridPosts = latest14.slice(4, 14);

  const videosRaw = items.filter((p) => hasTag(p, 'videos'));

  const latestSlugs = new Set(latest14.map((p) => p.slug));

  const spotlightPool = items.filter((p) => !latestSlugs.has(p.slug));

  const spotlightPosts = spotlightPool.map((p) => ({
    slug: p.slug,
    title: p.title,
    coverSrc: p.cover?.src ?? '',
    coverAlt: p.cover?.alt ?? p.title,
    tags: Array.isArray(p.tags)
      ? p.tags.map((t: any) => ({
          slug: String(t?.slug ?? '').trim(),
          label: String(t?.label ?? '').trim(),
        }))
      : [],
  }));

  const videosForHome = videosRaw.filter((p) => !latestSlugs.has(p.slug));
  const videoPosts = [...videosForHome].sort(byDateDesc).map(mapPostToVideoGridPost);

  const showVideoSection = videoPosts.length > 1;

  return (
    <div className={styles.page}>

      {/* 4-up hero (full-bleed) */}
      <section className={styles.hero} aria-label="Hero">
        <div className={styles.tiles} aria-label="Hero tiles">
          {heroPosts.map((post, index) => {
            const badge =
              post.topic?.label && post.topic?.slug
                ? { label: post.topic.label, href: `/topics/${post.topic.slug}` }
                : undefined;

            const imageSrc = post.cover?.src && post.cover.src.length > 0 ? post.cover.src : '/demo/archive/01.jpg';
            const imageAlt = post.cover?.alt && post.cover.alt.length > 0 ? post.cover.alt : post.title;

            return (
              <div key={post.slug} className={styles.tile}>
                <PostWallSquare
                  href={`/blog/${post.slug}`}
                  title={post.title}
                  imageSrc={imageSrc}
                  imageAlt={imageAlt}
                  badge={badge}
                  priority={index === 0}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* QuoteSpotlight (inside 1280 container) */}
      <div className="l-section" aria-label="Quote spotlight">
        <div className={`l-container ${styles.deferredSection}`}>
          <QuoteSpotlight />
        </div>
      </div>

      {/* 10-up main grid (inside 1280 container) */}
      <section className="l-section" aria-label="Latest posts">
        <div className={`l-container ${styles.deferredSection}`}>
          <MainGrid
            posts={gridPosts.map(mapPostToMainGridPost)}
            ariaLabel="Latest posts"
            className={styles.mainGrid}
          />
        </div>
      </section>

      {/* Social (inside 960 container) */}
      <section className="l-section" aria-label="Social media">
        <div className={`l-container ${styles.deferredSection}`}>
          <div className={styles.socialNarrow}>
            <div className={styles.socialGrid} aria-label="Social media">
              <SocialMediaCard
                variant="twitter"
                href="https://x.com/gulemeyenoske"
                handle="@gulemeyenoske"
                subtitle="Follow me on Twitter"
                avatarSrc={AVATAR}
                avatarAlt="Profile"
                ctaLabel="Follow"
              />

              <SocialMediaCard
                variant="reddit"
                href="https://www.reddit.com/user/gulemeyenoske/"
                handle="u/gulemeyenoske"
                subtitle="Join me on Reddit"
                avatarSrc={AVATAR}
                avatarAlt="Profile"
                ctaLabel="Follow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* VideoGrid (same shell + layout rules as dev page) */}
      {showVideoSection ? (
        <section className="l-section" aria-label="Featured videos">
          <div className={`l-container ${styles.deferredSection}`}>
            <div className={styles.videoPanel}>
              <header className={styles.videoHeader}>
                <h2 className={styles.videoTitle}>FEATURED VIDEOS</h2>
              </header>

              <div className={styles.videoShell}>
                <VideoGrid posts={videoPosts} limit={6} />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="l-section" aria-label="Newsletter signup">
        <div className={`l-container ${styles.deferredSection}`}>
          <HomeNewsletterSignup />
        </div>
      </section>

      <section className="l-section" aria-label="Tag spotlight">
        <div className={`l-container ${styles.deferredSection}`}>
          <div className={styles.tagGrid} aria-label="Tags">
            <TagSpotlightSection posts={spotlightPosts} />
          </div>
        </div>
      </section>
    </div>
  );
}