"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { directusAssetUrl } from '@/lib/directus/asset-url';
import type { StreamBatchResponse, StreamEntry } from '@/lib/post-stream/types';
import { PostBody } from '@/components/post-body/PostBody';
import { PostHeader } from '@/components/post-header/PostHeader';
import { PostWallSquare } from '@/components/post-wall-square/PostWallSquare';
import { MainGrid } from '@/components/main-grid/MainGrid';
import { TagSpotlight } from '@/components/tag-spotlight/TagSpotlight';
import pageStyles from '@/app/blog/[slug]/page.module.css';

type Props = {
  initialSlug: string;
  initialItems: StreamEntry[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  batchSize?: number;
};

const URL_DEBOUNCE_MS = 120;
const LINK_NAV_LOCK_MS = 5000;
const LOAD_AHEAD = 2;
const KEEP_BEHIND = 2;
const KEEP_AHEAD = 6;
const MAX_ITEMS = KEEP_BEHIND + KEEP_AHEAD + 2;
const AFTER_REVEAL_MARGIN = '900px 0px';
const DETAIL_COVER_SIZES = '(max-width: 430px) calc(100vw - 32px), (max-width: 1024px) min(100vw - 64px, 720px), 720px';

function getHeaderOffset(): number {
  const el = document.querySelector<HTMLElement>('[data-chrome-header]');
  if (!el) {
    return 0;
  }
  const rect = el.getBoundingClientRect();
  return Math.max(0, rect.bottom);
}

function buildThresholds(): number[] {
  const t: number[] = [0];
  for (let i = 1; i <= 20; i++) {
    t.push(i / 20);
  }
  return t;
}

function PostStreamItem({
  entry,
  onRef,
  isLead,
}: {
  entry: StreamEntry;
  onRef: (el: HTMLElement | null) => void;
  isLead: boolean;
}) {
  const { post, afterData } = entry;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const shareUrl = `${siteUrl}/blog/${post.slug}`;
  const coverImageId = post.cover?.src?.match(/\/assets\/([a-f0-9-]+)/)?.[1];
  const coverSrc = coverImageId ? directusAssetUrl(coverImageId) : (post.cover?.src ?? '');
  const afterSentinelRef = useRef<HTMLDivElement | null>(null);
  const [showAfter, setShowAfter] = useState(false);

  const setItemRef = useCallback((el: HTMLElement | null) => {
    onRef(el);
  }, [onRef]);

  useEffect(() => {
    if (showAfter) {
      return;
    }

    const target = afterSentinelRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShowAfter(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: AFTER_REVEAL_MARGIN,
        threshold: 0,
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [showAfter]);

  return (
    <section ref={setItemRef} className={pageStyles.streamPost} data-stream-slug={post.slug}>
      <article className={pageStyles.article}>
        <PostHeader
          authorName={post.authorName}
          dateIso={post.dateIso}
          categoryLabel={post.topic?.label ?? 'Uncategorized'}
          topicSlug={post.topic?.slug ?? ''}
          title={post.title}
          summary={post.summary}
          coverSrc={coverSrc}
          coverAlt={post.cover?.alt ?? post.title}
          shareUrl={shareUrl}
          coverPriority={isLead}
          coverSizes={DETAIL_COVER_SIZES}
        />

        <PostBody
          html={post.body
            .map((block) => {
              if (block.kind === 'html') return block.html;
              if (block.kind === 'h2') return `<h2>${block.text}</h2>`;
              return `<p>${block.text}</p>`;
            })
            .join('')}
        />

        <footer className={pageStyles.tagsRow} aria-label="Post tags" data-stream-tags>
          {(post.tags ?? []).map((tag) => (
            <Link key={tag.slug} href={`/tags/${tag.slug}`} className={pageStyles.tagLink}>
              #{tag.label}
            </Link>
          ))}
        </footer>

        <div ref={afterSentinelRef} className={pageStyles.afterSentinel} aria-hidden="true" />
      </article>

      {showAfter ? (
        <section className={pageStyles.after} aria-label="After post">
          <div className={pageStyles.afterMobile}>
            <div className={pageStyles.wallStack} aria-label="Related posts by selected tags">
              {afterData.wallItemsMobile.map(({ tag, post: relatedPost }, idx) => (
                <PostWallSquare
                  key={`${tag.slug}:${relatedPost.slug}`}
                  href={`/blog/${relatedPost.slug}`}
                  title={relatedPost.title}
                  imageSrc={relatedPost.cover?.src ?? ''}
                  imageAlt={relatedPost.cover?.alt ?? relatedPost.title}
                  badge={{ label: `#${tag.label}`, href: `/tags/${tag.slug}` }}
                  priority={isLead && idx === 0}
                />
              ))}
            </div>

            <MainGrid posts={afterData.latestFiveMobile} ariaLabel="Latest posts" />
          </div>

          <div className={pageStyles.afterWide}>
            <div className={pageStyles.spotlightRow} aria-label="Tag spotlights">
              {afterData.tagSpotlightsWide[0] ? (
                <TagSpotlight
                  tagSlug={afterData.tagSpotlightsWide[0].tag.slug}
                  tagLabel={afterData.tagSpotlightsWide[0].tag.label}
                  posts={afterData.tagSpotlightsWide[0].posts}
                  limit={4}
                />
              ) : null}

              {afterData.tagSpotlightsWide[1] ? (
                <TagSpotlight
                  tagSlug={afterData.tagSpotlightsWide[1].tag.slug}
                  tagLabel={afterData.tagSpotlightsWide[1].tag.label}
                  posts={afterData.tagSpotlightsWide[1].posts}
                  limit={4}
                />
              ) : null}
            </div>

            <MainGrid
              posts={afterData.latestSixWide}
              ariaLabel="Latest posts grid"
              className={pageStyles.latestSixGrid}
            />
          </div>
        </section>
      ) : null}
    </section>
  );
}

export function PostStreamReader({
  initialSlug,
  initialItems,
  initialNextCursor,
  initialHasMore,
  batchSize = 5,
}: Props) {
  const [items, setItems] = useState<StreamEntry[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const itemEls = useRef(new Map<string, HTMLElement>());
  const activeSlugRef = useRef<string>(initialSlug);
  const [activeSlug, setActiveSlug] = useState<string>(initialSlug);
  const navLockUntil = useRef<number>(Date.now() + 3000);
  const urlTimer = useRef<number | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  const fetchMore = async () => {
    if (!nextCursor || !hasMore || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        before: nextCursor,
        limit: String(batchSize),
      });

      const response = await fetch(`/api/stream?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stream batch (${response.status}).`);
      }

      const json = (await response.json()) as StreamBatchResponse;

      setItems((prev) => {
        const seen = new Set(prev.map((entry) => entry.post.slug));
        const nextEntries = json.items.filter((entry) => !seen.has(entry.post.slug));
        return [...prev, ...nextEntries];
      });
      setNextCursor(json.nextCursor);
      setHasMore(json.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.('a');
      if (anchor) {
        navLockUntil.current = Date.now() + LINK_NAV_LOCK_MS;
      }
    };

    window.addEventListener('pointerdown', onPointerDown, true);
    return () => window.removeEventListener('pointerdown', onPointerDown, true);
  }, []);

  useEffect(() => {
    if (!activeSlug) {
      return;
    }

    if (urlTimer.current !== null) {
      window.clearTimeout(urlTimer.current);
    }

    urlTimer.current = window.setTimeout(() => {
      if (Date.now() < navLockUntil.current) {
        return;
      }
      if (!window.location.pathname.startsWith('/blog/')) {
        return;
      }

      const nextPath = `/blog/${activeSlug}`;
      if (window.location.pathname !== nextPath) {
        window.history.replaceState({}, '', nextPath);
      }
    }, URL_DEBOUNCE_MS);

    return () => {
      if (urlTimer.current !== null) {
        window.clearTimeout(urlTimer.current);
      }
      urlTimer.current = null;
    };
  }, [activeSlug]);

  useEffect(() => {
    const activeIndex = items.findIndex((entry) => entry.post.slug === activeSlug);
    if (activeIndex < 0) {
      return;
    }

    if (hasMore && activeIndex >= items.length - 1 - LOAD_AHEAD) {
      void fetchMore();
    }

    if (items.length <= MAX_ITEMS || activeIndex <= KEEP_BEHIND) {
      return;
    }

    const removableCount = Math.min(activeIndex - KEEP_BEHIND, items.length - (KEEP_BEHIND + KEEP_AHEAD));
    if (removableCount <= 0) {
      return;
    }

    const anchorSlug = activeSlug;
    const anchorBeforeTop = itemEls.current.get(anchorSlug)?.getBoundingClientRect().top ?? null;

    setItems((prev) => prev.slice(removableCount));

    window.requestAnimationFrame(() => {
      if (anchorBeforeTop === null) {
        return;
      }

      const anchorAfterEl = itemEls.current.get(anchorSlug);
      if (!anchorAfterEl) {
        return;
      }

      const anchorAfterTop = anchorAfterEl.getBoundingClientRect().top;
      const delta = anchorAfterTop - anchorBeforeTop;

      if (Math.abs(delta) > 1) {
        window.scrollBy({ top: delta, left: 0, behavior: 'auto' });
      }
    });
  }, [activeSlug, hasMore, items, nextCursor]);

  useEffect(() => {
    const thresholds = buildThresholds();
    let observer: IntersectionObserver | null = null;

    const vis = new Map<string, { ratio: number; top: number; isIntersecting: boolean }>();

    const pickBest = () => {
      let bestSlug: string | null = null;
      let bestRatio = 0;
      let bestTop = Number.POSITIVE_INFINITY;

      for (const [slug, value] of vis) {
        if (!value.isIntersecting) {
          continue;
        }

        // Yeni post daha yüksek ratio'ya sahipse, onu seç
        if (value.ratio > bestRatio) {
          bestSlug = slug;
          bestRatio = value.ratio;
          bestTop = value.top;
          continue;
        }

        // Eğer ratio çok yakınsa (0.15'ten az fark), en üsttekini seç
        // Bu yukarı kaydırırken 1. post'un seçilmesini sağlar
        if (Math.abs(value.ratio - bestRatio) < 0.15 && value.top < bestTop) {
          bestSlug = slug;
          bestRatio = value.ratio;
          bestTop = value.top;
          continue;
        }

        // Eşit ratio'da en üsttekini seç
        if (value.ratio === bestRatio && value.top < bestTop) {
          bestSlug = slug;
          bestTop = value.top;
        }
      }

      if (!bestSlug) {
        return;
      }

      if (Date.now() >= navLockUntil.current && bestSlug !== activeSlugRef.current) {
        activeSlugRef.current = bestSlug;
        setActiveSlug(bestSlug);
      }
    };

    const rebuild = () => {
      observer?.disconnect();
      vis.clear();

      const headerOffset = getHeaderOffset();
      const rootMargin = `-${Math.ceil(headerOffset)}px 0px -25% 0px`;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const slug = (entry.target as HTMLElement).dataset.streamSlug;
            if (!slug) {
              continue;
            }

            vis.set(slug, {
              ratio: entry.intersectionRatio,
              top: entry.boundingClientRect.top,
              isIntersecting: entry.isIntersecting,
            });
          }

          pickBest();
        },
        { root: null, rootMargin, threshold: thresholds },
      );

      for (const element of itemEls.current.values()) {
        observer.observe(element);
      }

      pickBest();
    };

    const onResize = () => rebuild();

    window.addEventListener('resize', onResize);
    rebuild();

    return () => {
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
    };
  }, [items]);

  const renderedItems = useMemo(() => items, [items]);

  return (
    <>
      {renderedItems.map((entry) => (
        <PostStreamItem
          key={entry.post.slug}
          entry={entry}
          isLead={entry.post.slug === initialSlug}
          onRef={(el) => {
            if (!el) {
              itemEls.current.delete(entry.post.slug);
              return;
            }
            itemEls.current.set(entry.post.slug, el);
          }}
        />
      ))}

      {isLoading ? <div className={pageStyles.streamLoading} aria-hidden="true" /> : null}
    </>
  );
}