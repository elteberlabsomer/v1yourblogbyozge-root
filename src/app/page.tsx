import { content } from '@/lib/content';
import type { Post } from '@/lib/content/types';

import { PostWallSquare } from '@/components/post-wall-square/PostWallSquare';
import { QuoteSpotlight } from '@/components/quote-spotlight/QuoteSpotlight';
import { MainGrid, type MainGridPost } from '@/components/main-grid/MainGrid';
import { SocialMediaCard } from '@/components/social-media-card/SocialMediaCard';
import { VideoGrid, type VideoGridPost } from '@/components/video-grid/VideoGrid';
import { NewsletterSignupDemo } from '@/components/newsletter-signup/NewsletterSignupDemo';
import { TagSpotlight, type TagSpotlightPost } from '@/components/tag-spotlight/TagSpotlight';

import styles from './page.module.css';

const AVATAR =
  'https://pbs.twimg.com/profile_images/1967148637877608448/sY1X17Wg_400x400.jpg';

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
  const posts: TagSpotlightPost[] = [...raw]
    .sort(byDateDesc)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      coverSrc: p.cover?.src ?? '',
      coverAlt: p.cover?.alt ?? p.title,
    }));

  return posts;
}

function hasTag(post: Post, tagSlug: string) {
  const tags = Array.isArray(post.tags) ? post.tags : [];
  return tags.some((t) => t.slug === tagSlug);
}

export default async function HomePage() {
  const { items } = await content.listPosts({ limit: 120 });

  const latest14 = items.slice(0, 14);
  const heroPosts = latest14.slice(0, 4);
  const gridPosts = latest14.slice(4, 14);

  const videosRaw = items.filter((p) => hasTag(p, 'videos'));
  const commRaw = items.filter((p) => hasTag(p, 'communication'));
  const sourcesRaw = items.filter((p) => hasTag(p, 'sources'));

  const tagCards: Array<{
    tagSlug: string;
    tagLabel: string;
    posts: TagSpotlightPost[];
  }> = [
    { tagSlug: 'videos', tagLabel: 'videos', posts: toSpotlightPosts(videosRaw) },
    { tagSlug: 'communication', tagLabel: 'communication', posts: toSpotlightPosts(commRaw) },
    { tagSlug: 'sources', tagLabel: 'sources', posts: toSpotlightPosts(sourcesRaw) },
  ];

  const videoPosts = [...videosRaw].sort(byDateDesc).map(mapPostToVideoGridPost);

  const heroFallback = '/demo/archive/01.jpg';

  return (
    <main className={styles.page}>
      {/* 4-up hero (full-bleed) */}
      <section className={styles.hero} aria-label="Hero">
        <div className={styles.tiles} aria-label="Hero tiles">
          {heroPosts.map((post, index) => {
            const badge =
              post.topic?.label && post.topic?.slug
                ? { label: post.topic.label, href: `/topics/${post.topic.slug}` }
                : undefined;

            const imageSrc = post.cover?.src && post.cover.src.length > 0 ? post.cover.src : heroFallback;
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
        <div className="l-container">
          <QuoteSpotlight />
        </div>
      </div>

      {/* 10-up main grid (inside 1280 container) */}
      <section className="l-section" aria-label="Latest posts">
        <div className="l-container">
          <MainGrid
            posts={gridPosts.map(mapPostToMainGridPost)}
            ariaLabel="Latest posts"
            className={styles.mainGrid}
          />
        </div>
      </section>

      {/* Social (inside 960 container) */}
      <section className="l-section" aria-label="Social media">
        <div className="l-container">
          <div className={styles.socialNarrow}>
            <div className={styles.socialGrid} aria-label="Social media">
              <SocialMediaCard
                variant="twitter"
                href="https://twitter.com/gulemeyenoske"
                handle="@gulemeyenoske"
                subtitle="Follow me on Twitter"
                avatarSrc={AVATAR}
                avatarAlt="Profile"
                ctaLabel="Follow"
              />

              <SocialMediaCard
                variant="reddit"
                href="https://reddit.com/user/gulemeyenoske"
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
      <section className="l-section" aria-label="Featured videos">
        <div className="l-container">
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

      <section className="l-section" aria-label="Newsletter signup">
        <div className="l-container">
          <NewsletterSignupDemo />
        </div>
      </section>

      <section className="l-section" aria-label="Tag spotlight">
        <div className="l-container">
          <div className={styles.tagGrid} aria-label="Tags">
            {tagCards.map((c) => (
              <TagSpotlight
                key={c.tagSlug}
                tagSlug={c.tagSlug}
                tagLabel={c.tagLabel}
                posts={c.posts}
                limit={4}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
