import { DEMO_POSTS, getDemoPostsByTag } from '@/lib/demo';

import { PostWallSquare } from '@/components/post-wall-square/PostWallSquare';
import { QuoteSpotlight } from '@/components/quote-spotlight/QuoteSpotlight';
import { MainGrid, type MainGridPost } from '@/components/main-grid/MainGrid';
import { SocialMediaCard } from '@/components/social-media-card/SocialMediaCard';
import { VideoGrid, type VideoGridPost } from '@/components/video-grid/VideoGrid';
import { NewsletterSignupDemo } from "@/components/newsletter-signup/NewsletterSignupDemo";
import { TagSpotlight, type TagSpotlightPost } from '@/components/tag-spotlight/TagSpotlight';

import styles from './page.module.css';

const AVATAR =
  'https://pbs.twimg.com/profile_images/1967148637877608448/sY1X17Wg_400x400.jpg';

function parseDateIso(dateIso?: string) {
  if (!dateIso) return 0;
  const t = Date.parse(dateIso);
  return Number.isNaN(t) ? 0 : t;
}

function byDateDesc(a: { dateIso?: string }, b: { dateIso?: string }) {
  return parseDateIso(b.dateIso) - parseDateIso(a.dateIso);
}

function mapDemoToMainGridPost(p: (typeof DEMO_POSTS)[number]): MainGridPost {
  return {
    slug: p.slug,
    title: p.title,
    categoryLabel: p.categoryLabel,
    topicSlug: p.topicSlug,
    coverSrc: p.coverSrc,
    coverAlt: p.coverAlt,
  };
}

function mapDemoToVideoGridPost(p: (typeof DEMO_POSTS)[number]): VideoGridPost {
  return {
    slug: p.slug,
    title: p.title,
    dateIso: p.dateIso,
    coverSrc: p.coverSrc,
    coverAlt: p.coverAlt,
    categoryLabel: p.categoryLabel,
    topicSlug: p.topicSlug,
  };
}

function toSpotlightPosts(
  raw: Array<{
    slug: string;
    title: string;
    coverSrc?: string;
    coverAlt?: string;
    dateIso?: string;
  }>,
) {
  const posts: TagSpotlightPost[] = [...raw]
    .sort(byDateDesc)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      coverSrc: p.coverSrc,
      coverAlt: p.coverAlt,
    }));

  return posts;
}

export default function HomePage() {
  const latest14 = [...DEMO_POSTS].sort(byDateDesc).slice(0, 14);
  const heroPosts = latest14.slice(0, 4);
  const gridPosts = latest14.slice(4, 14);

  const videosRaw = getDemoPostsByTag('videos');
  const commRaw = getDemoPostsByTag('communication');
  const sourcesRaw = getDemoPostsByTag('sources');

  const tagCards: Array<{
    tagSlug: string;
    tagLabel: string;
    posts: TagSpotlightPost[];
  }> = [
    { tagSlug: 'videos', tagLabel: 'videos', posts: toSpotlightPosts(videosRaw) },
    { tagSlug: 'communication', tagLabel: 'communication', posts: toSpotlightPosts(commRaw) },
    { tagSlug: 'sources', tagLabel: 'sources', posts: toSpotlightPosts(sourcesRaw) },
  ];

  const videoPosts = [...videosRaw].sort(byDateDesc).map(mapDemoToVideoGridPost);

  return (
    <main className={styles.page}>
      {/* 4-up hero (full-bleed) */}
      <section className={styles.hero} aria-label="Hero">
        <div className={styles.tiles} aria-label="Hero tiles">
          {heroPosts.map((post, index) => {
            const badge =
              post.categoryLabel && post.topicSlug
                ? { label: post.categoryLabel, href: `/topics/${post.topicSlug}` }
                : undefined;

            return (
              <div key={post.slug} className={styles.tile}>
                <PostWallSquare
                  href={`/blog/${post.slug}`}
                  title={post.title}
                  imageSrc={post.coverSrc}
                  imageAlt={post.coverAlt}
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
            posts={gridPosts.map(mapDemoToMainGridPost)}
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
