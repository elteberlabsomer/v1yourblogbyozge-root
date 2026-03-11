import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { content } from '@/lib/content';
import type { Post } from '@/lib/content/types';
import {
  buildInitialStreamBatch,
  buildStreamEntry,
  STREAM_BATCH_SIZE,
} from '@/lib/post-stream/server';
import { PostHeader } from '@/components/post-header/PostHeader';
import { PostBody } from '@/components/post-body/PostBody';
import { PostWallSquare } from '@/components/post-wall-square/PostWallSquare';
import { MainGrid } from '@/components/main-grid/MainGrid';
import { TagSpotlight } from '@/components/tag-spotlight/TagSpotlight';
import { PostStreamReaderLazy } from '@/components/post-stream-reader/PostStreamReaderLazy';
import styles from './page.module.css';

type PageProps = {
  params: Promise<{ slug: string }>;
};

type AssetDimensions = {
  width: number;
  height: number;
};

type DirectusFileRecord = {
  id: string;
  width?: number | null;
  height?: number | null;
};

type DirectusFilesResponse = {
  data?: DirectusFileRecord[];
};

type DirectusImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif';
type DirectusImageFit = 'cover' | 'contain' | 'inside' | 'outside';

const BODY_IMAGE_WIDTHS = [480, 640, 768] as const;
const BODY_IMAGE_SIZES =
  '(max-width: 430px) calc(100vw - 32px), (max-width: 1024px) min(100vw - 64px, 720px), 720px';
const DIRECTUS_ASSET_ID_PATTERN =
  /\/assets\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:[/?#]|$)/i;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamicParams = true;
export const revalidate = 900;

function getDirectusBaseUrl(): string {
  const raw = process.env.DIRECTUS_URL ?? process.env.NEXT_PUBLIC_DIRECTUS_URL ?? '';
  return raw.replace(/\/+$/, '');
}

function buildDirectusAssetUrl(
  assetId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: DirectusImageFormat;
    fit?: DirectusImageFit;
  },
): string {
  const base = getDirectusBaseUrl();
  if (!base) {
    return '';
  }

  const params = new URLSearchParams();

  if (options?.width) {
    params.set('width', String(options.width));
  }

  if (options?.height) {
    params.set('height', String(options.height));
  }

  if (options?.quality) {
    params.set('quality', String(options.quality));
  }

  if (options?.format) {
    params.set('format', options.format);
  }

  if (options?.fit) {
    params.set('fit', options.fit);
  }

  const query = params.toString();
  return `${base}/assets/${assetId}${query ? `?${query}` : ''}`;
}

function parseNumericAttr(fragment: string, name: 'width' | 'height'): number | null {
  const match = fragment.match(new RegExp(String.raw`${name}=["']?(\d+)["']?`, 'i'));
  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function stripResponsiveImageAttrs(fragment: string): string {
  return fragment
    .replace(/\s+srcset=["'][^"']*["']/gi, '')
    .replace(/\s+sizes=["'][^"']*["']/gi, '')
    .replace(/\s+loading=["'][^"']*["']/gi, '')
    .replace(/\s+decoding=["'][^"']*["']/gi, '')
    .replace(/\s+fetchpriority=["'][^"']*["']/gi, '')
    .replace(/\s+width=["'][^"']*["']/gi, '')
    .replace(/\s+height=["'][^"']*["']/gi, '');
}

function extractDirectusAssetId(value: string): string | null {
  if (!value) {
    return null;
  }

  if (UUID_PATTERN.test(value)) {
    return value;
  }

  const match = value.match(DIRECTUS_ASSET_ID_PATTERN);
  return match?.[1] ?? null;
}

function collectDirectusAssetIds(html: string): string[] {
  const ids = new Set<string>();

  html.replace(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, (_match, src: string) => {
    const assetId = extractDirectusAssetId(src);
    if (assetId) {
      ids.add(assetId);
    }
    return _match;
  });

  return Array.from(ids);
}

async function fetchDirectusAssetDimensions(
  assetIds: string[],
): Promise<Map<string, AssetDimensions>> {
  if (assetIds.length === 0) {
    return new Map();
  }

  const base = getDirectusBaseUrl();
  if (!base) {
    return new Map();
  }

  const params = new URLSearchParams({
    fields: 'id,width,height',
    limit: String(assetIds.length),
  });
  params.set('filter[id][_in]', assetIds.join(','));

  const directusToken = process.env.DIRECTUS_TOKEN;

  try {
    const res = await fetch(`${base}/files?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        ...(directusToken ? { Authorization: `Bearer ${directusToken}` } : {}),
      },
      next: { revalidate: 900 },
    });

    if (!res.ok) {
      return new Map();
    }

    const json = (await res.json()) as DirectusFilesResponse;
    const map = new Map<string, AssetDimensions>();

    for (const record of json.data ?? []) {
      const width = typeof record.width === 'number' ? record.width : 0;
      const height = typeof record.height === 'number' ? record.height : 0;

      if (width > 0 && height > 0) {
        map.set(record.id, { width, height });
      }
    }

    return map;
  } catch {
    return new Map();
  }
}

function replaceBodyImagesWithResponsiveMarkup(
  html: string,
  dimensionsByAssetId: Map<string, AssetDimensions>,
): string {
  return html.replace(
    /<img([^>]*?)src=["']([^"']*\/assets\/[^"'?]+(?:\?[^"']*)?)["']([^>]*)>/gi,
    (_match, beforeSrc, originalSrc, afterSrc) => {
      const combinedAttrs = `${beforeSrc} ${afterSrc}`;
      const assetId = extractDirectusAssetId(originalSrc);
      const metadataDimensions = assetId ? dimensionsByAssetId.get(assetId) : undefined;
      const declaredWidth = parseNumericAttr(combinedAttrs, 'width');
      const declaredHeight = parseNumericAttr(combinedAttrs, 'height');
      const fallbackDimensions =
        declaredWidth && declaredHeight
          ? { width: declaredWidth, height: declaredHeight }
          : undefined;
      const dimensions = metadataDimensions ?? fallbackDimensions;

      const sanitizedBefore = stripResponsiveImageAttrs(beforeSrc);
      const sanitizedAfter = stripResponsiveImageAttrs(afterSrc);
      const cleanBaseUrl = originalSrc.replace(/\?.*$/, '');
      const srcset = BODY_IMAGE_WIDTHS.map(
        (width) => `${cleanBaseUrl}?width=${width}&quality=72&format=webp ${width}w`,
      ).join(', ');
      const widthAttr = dimensions ? ` width="${dimensions.width}"` : '';
      const heightAttr = dimensions ? ` height="${dimensions.height}"` : '';

      return `<img${sanitizedBefore}src="${cleanBaseUrl}?width=768&quality=72&format=webp" srcset="${srcset}" sizes="${BODY_IMAGE_SIZES}" loading="lazy" decoding="async" fetchpriority="low"${widthAttr}${heightAttr}${sanitizedAfter}>`;
    },
  );
}

function buildSocialImageUrl(coverSrc: string | undefined, siteUrl: string): string {
  if (!coverSrc) {
    return '';
  }

  const assetId = extractDirectusAssetId(coverSrc);

  if (assetId) {
    const directusUrl = buildDirectusAssetUrl(assetId, {
      width: 1200,
      height: 630,
      fit: 'cover',
      quality: 82,
      format: 'jpg',
    });

    if (directusUrl) {
      return directusUrl;
    }
  }

  try {
    return new URL(coverSrc, siteUrl).toString();
  } catch {
    return '';
  }
}

async function bodyToHtml(post: Post): Promise<string> {
  const rawHtml = post.body
    .map((block) => {
      if (block.kind === 'html') return block.html;
      if (block.kind === 'h2') return `<h2>${block.text}</h2>`;
      return `<p>${block.text}</p>`;
    })
    .join('');

  const assetIds = collectDirectusAssetIds(rawHtml);
  const dimensionsByAssetId = await fetchDirectusAssetDimensions(assetIds);

  return replaceBodyImagesWithResponsiveMarkup(rawHtml, dimensionsByAssetId);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await content.getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Not found',
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  const canonicalUrl = `/blog/${post.slug}`;
  const socialImageUrl = buildSocialImageUrl(post.cover?.src, siteUrl);
  const socialImageAlt = post.cover?.alt || post.title;

  return {
    title: post.title,
    description: post.summary || undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: post.title,
      description: post.summary || undefined,
      images: socialImageUrl
        ? [
            {
              url: socialImageUrl,
              width: 1200,
              height: 630,
              alt: socialImageAlt,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary || undefined,
      images: socialImageUrl ? [socialImageUrl] : [],
    },
  };
}

export async function generateStaticParams() {
  try {
    const slugs = await content.listAllSlugs();
    return slugs.map((slug: string) => ({ slug }));
  } catch (error) {
    console.warn(
      'Could not fetch slugs at build time; falling back to on-demand rendering.',
      error,
    );
    return [];
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await content.getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const [currentEntry, initialBatch, html] = await Promise.all([
    buildStreamEntry(post),
    buildInitialStreamBatch(post),
    bodyToHtml(post),
  ]);

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/blog/${post.slug}`;

  return (
    <main className={styles.main}>
      <section className={styles.streamPost} data-current-post-slug={post.slug}>
        <article className={styles.article}>
          <PostHeader
            authorName={post.authorName}
            dateIso={post.dateIso}
            categoryLabel={post.topic?.label ?? 'Uncategorized'}
            topicSlug={post.topic?.slug ?? ''}
            title={post.title}
            summary={post.summary}
            coverSrc={post.cover?.src ?? ''}
            coverAlt={post.cover?.alt ?? post.title}
            shareUrl={shareUrl}
            coverPriority
          />

          <PostBody html={html} />

          <footer className={styles.tagsRow} aria-label="Post tags" data-stream-tags>
            {(post.tags ?? []).map((tag) => (
              <Link key={tag.slug} href={`/tags/${tag.slug}`} className={styles.tagLink}>
                #{tag.label}
              </Link>
            ))}
          </footer>
        </article>

        <section className={styles.after} aria-label="After post">
          <div className={styles.afterMobile}>
            <div className={styles.wallStack} aria-label="Related posts by selected tags">
              {currentEntry.afterData.wallItemsMobile.map(({ tag, post: relatedPost }, idx) => (
                <PostWallSquare
                  key={`${tag.slug}:${relatedPost.slug}`}
                  href={`/blog/${relatedPost.slug}`}
                  title={relatedPost.title}
                  imageSrc={relatedPost.cover?.src ?? ''}
                  imageAlt={relatedPost.cover?.alt ?? relatedPost.title}
                  badge={{ label: `#${tag.label}`, href: `/tags/${tag.slug}` }}
                  priority={idx === 0}
                />
              ))}
            </div>

            <MainGrid posts={currentEntry.afterData.latestFiveMobile} ariaLabel="Latest posts" />
          </div>

          <div className={styles.afterWide}>
            <div className={styles.spotlightRow} aria-label="Tag spotlights">
              {currentEntry.afterData.tagSpotlightsWide[0] ? (
                <TagSpotlight
                  tagSlug={currentEntry.afterData.tagSpotlightsWide[0].tag.slug}
                  tagLabel={currentEntry.afterData.tagSpotlightsWide[0].tag.label}
                  posts={currentEntry.afterData.tagSpotlightsWide[0].posts}
                  limit={4}
                />
              ) : null}

              {currentEntry.afterData.tagSpotlightsWide[1] ? (
                <TagSpotlight
                  tagSlug={currentEntry.afterData.tagSpotlightsWide[1].tag.slug}
                  tagLabel={currentEntry.afterData.tagSpotlightsWide[1].tag.label}
                  posts={currentEntry.afterData.tagSpotlightsWide[1].posts}
                  limit={4}
                />
              ) : null}
            </div>

            <MainGrid
              posts={currentEntry.afterData.latestSixWide}
              ariaLabel="Latest posts grid"
              className={styles.latestSixGrid}
            />
          </div>
        </section>
      </section>

      <PostStreamReaderLazy
        initialSlug={slug}
        initialItems={initialBatch.items}
        initialNextCursor={initialBatch.nextCursor}
        initialHasMore={initialBatch.hasMore}
        batchSize={STREAM_BATCH_SIZE}
      />
    </main>
  );
}