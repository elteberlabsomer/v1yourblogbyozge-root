'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import {
  DEMO_POSTS,
  getDemoPostBySlug,
  getDemoPostsByTag,
  getDemoPostsByTopic,
  type DemoPost,
} from '@/lib/demo';

import { PostHeader } from '@/components/post-header/PostHeader';
import { PostBody } from '@/components/post-body/PostBody';
import { PostWallSquare } from '@/components/post-wall-square/PostWallSquare';
import { MainGrid } from '@/components/main-grid/MainGrid';
import { TagSpotlight, TopicSpotlight } from '@/components/tag-spotlight/TagSpotlight';

import pageStyles from '@/app/blog/[slug]/page.module.css';

type Props = {
  initialSlug: string;
};

const WINDOW = 5;
const LOAD_AHEAD = 3;

const URL_DEBOUNCE_MS = 120;
const LINK_NAV_LOCK_MS = 2500;

function sortByDateDesc(a: { dateIso: string }, b: { dateIso: string }) {
  return b.dateIso.localeCompare(a.dateIso);
}

function hash32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: readonly T[], seedStr: string): T[] {
  const out = [...arr];
  const rnd = mulberry32(hash32(seedStr));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function toSpotlightPosts(
  posts: Array<{
    slug: string;
    title: string;
    coverSrc?: string | null;
    coverAlt?: string | null;
  }>,
) {
  return posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    coverSrc: p.coverSrc ?? '',
    coverAlt: p.coverAlt ?? p.title,
  }));
}

function pickOneByTag(
  tag: { slug: string; label: string },
  seed: string,
  exclude: Set<string>,
) {
  const candidates = getDemoPostsByTag(tag.slug)
    .filter((p) => !exclude.has(p.slug))
    .sort(sortByDateDesc);

  const shuffled = seededShuffle(candidates, seed);
  const picked = shuffled[0];
  if (!picked) {
    return null;
  }

  exclude.add(picked.slug);
  return picked;
}

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
  post,
  allByDate,
  onRef,
}: {
  post: DemoPost;
  allByDate: DemoPost[];
  onRef: (el: HTMLElement | null) => void;
}) {
  const shareUrl = `https://yourdomain.com/blog/${post.slug}`;

  const afterData = useMemo(() => {
    const usedMobile = new Set<string>([post.slug]);

    const selectedTagsMobile = post.tags.slice(0, 4);
    const wallItemsMobile = selectedTagsMobile
      .map((tag) => {
        const picked = pickOneByTag(tag, `${post.slug}:wall:${tag.slug}`, usedMobile);
        if (!picked) {
          return null;
        }
        return { tag, post: picked };
      })
      .filter(Boolean) as Array<{
      tag: { slug: string; label: string };
      post: { slug: string; title: string; coverSrc: string; coverAlt: string };
    }>;

    const topicCandidatesMobile = getDemoPostsByTopic(post.topicSlug)
      .filter((p) => !usedMobile.has(p.slug))
      .sort(sortByDateDesc);

    const topicSpotlightMobile = toSpotlightPosts(
      seededShuffle(topicCandidatesMobile, `${post.slug}:topic:${post.topicSlug}`).slice(0, 4),
    );

    const latestFiveMobile = allByDate.filter((p) => !usedMobile.has(p.slug)).slice(0, 5);

    const usedWide = new Set<string>([post.slug]);

    const selectedTagsWide = post.tags.slice(0, 2);
    const tagSpotlightsWide = selectedTagsWide.map((tag) => {
      const candidates = getDemoPostsByTag(tag.slug)
        .filter((p) => !usedWide.has(p.slug))
        .sort(sortByDateDesc);

      const picked = seededShuffle(candidates, `${post.slug}:tagspot:${tag.slug}`).slice(0, 4);
      for (const p of picked) {
        usedWide.add(p.slug);
      }

      return { tag, posts: toSpotlightPosts(picked) };
    });

    const latestSixWide = allByDate.filter((p) => !usedWide.has(p.slug)).slice(0, 6);

    return {
      wallItemsMobile,
      topicSpotlightMobile,
      latestFiveMobile,
      tagSpotlightsWide,
      latestSixWide,
    };
  }, [post.slug, post.topicSlug, allByDate]);

  return (
    <section ref={onRef} className={pageStyles.streamPost} data-stream-slug={post.slug}>
      <article className={pageStyles.article}>
        <PostHeader
          authorName="Özge Gülemeyen"
          dateIso={post.dateIso}
          categoryLabel={post.categoryLabel}
          topicSlug={post.topicSlug}
          title={post.title}
          summary={post.summary}
          coverSrc={post.coverSrc}
          coverAlt={post.coverAlt}
          shareUrl={shareUrl}
        />

        <PostBody>
          {post.body.map((block, idx) => {
            if (block.kind === 'h2') {
              return <h2 key={idx}>{block.text}</h2>;
            }
            return <p key={idx}>{block.text}</p>;
          })}
        </PostBody>

        <footer className={pageStyles.tagsRow} aria-label="Post tags" data-stream-tags>
          {post.tags.map((tag) => (
            <Link key={tag.slug} href={`/tags/${tag.slug}`} className={pageStyles.tagLink}>
              #{tag.label}
            </Link>
          ))}
        </footer>
      </article>

      <section className={pageStyles.after} aria-label="After post">
        <div className={pageStyles.afterMobile}>
          <div className={pageStyles.wallStack} aria-label="Related posts by selected tags">
            {afterData.wallItemsMobile.map(({ tag, post: p }, idx) => (
              <PostWallSquare
                key={`${tag.slug}:${p.slug}`}
                href={`/blog/${p.slug}`}
                title={p.title}
                imageSrc={p.coverSrc}
                imageAlt={p.coverAlt}
                badge={{ label: `#${tag.label}`, href: `/tags/${tag.slug}` }}
                priority={idx === 0}
              />
            ))}
          </div>

          <TopicSpotlight
            topicSlug={post.topicSlug}
            topicLabel={post.categoryLabel}
            posts={afterData.topicSpotlightMobile}
            limit={4}
          />

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
    </section>
  );
}

export function PostStreamReader({ initialSlug }: Props) {
  const ordered = useMemo(() => [...DEMO_POSTS].sort(sortByDateDesc), []);
  const total = ordered.length;

  const initialIndex = useMemo(() => {
    const p = getDemoPostBySlug(initialSlug);
    if (!p) {
      return 0;
    }
    const idx = ordered.findIndex((x) => x.slug === p.slug);
    return idx >= 0 ? idx : 0;
  }, [initialSlug, ordered]);

  // Append-only: render current post and extend DOWNWARD only. No removal -> no scroll jump.
  const renderStart = initialIndex;

  const [renderEnd, setRenderEnd] = useState(() =>
    Math.min(total - 1, renderStart + (WINDOW - 1)),
  );

  const renderEndRef = useRef<number>(renderEnd);
  useEffect(() => {
    renderEndRef.current = renderEnd;
  }, [renderEnd]);

  const allByDate = useMemo(() => [...ordered], [ordered]);

  const itemEls = useRef(new Map<string, HTMLElement>());

  const activeSlugRef = useRef<string>(ordered[renderStart]?.slug ?? '');
  const [activeSlug, setActiveSlug] = useState<string>(activeSlugRef.current);

  const navLockUntil = useRef<number>(0);
  const urlTimer = useRef<number | null>(null);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.('a');
      if (a) {
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
    const thresholds = buildThresholds();
    let observer: IntersectionObserver | null = null;

    const vis = new Map<string, { ratio: number; top: number; isIntersecting: boolean }>();

    const pickBest = () => {
      if (Date.now() < navLockUntil.current) {
        return;
      }

      let bestSlug: string | null = null;
      let bestRatio = 0;
      let bestTop = Number.POSITIVE_INFINITY;

      for (const [slug, v] of vis) {
        if (!v.isIntersecting) {
          continue;
        }

        if (v.ratio > bestRatio) {
          bestSlug = slug;
          bestRatio = v.ratio;
          bestTop = v.top;
          continue;
        }

        if (v.ratio === bestRatio && v.top < bestTop) {
          bestSlug = slug;
          bestTop = v.top;
        }
      }

      if (!bestSlug) {
        return;
      }

      if (bestSlug !== activeSlugRef.current) {
        activeSlugRef.current = bestSlug;
        setActiveSlug(bestSlug);

        const idx = ordered.findIndex((p) => p.slug === bestSlug);
        if (idx >= 0 && idx >= renderEndRef.current - LOAD_AHEAD && renderEndRef.current < total - 1) {
          setRenderEnd((prev) => Math.min(total - 1, prev + WINDOW));
        }
      }
    };

    const rebuild = () => {
      observer?.disconnect();
      vis.clear();

      const headerOffset = getHeaderOffset();
      const rootMargin = `-${Math.ceil(headerOffset)}px 0px -25% 0px`;

      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const slug = (e.target as HTMLElement).dataset.streamSlug;
            if (!slug) {
              continue;
            }

            vis.set(slug, {
              ratio: e.intersectionRatio,
              top: e.boundingClientRect.top,
              isIntersecting: e.isIntersecting,
            });
          }
          pickBest();
        },
        { root: null, rootMargin, threshold: thresholds },
      );

      for (const el of itemEls.current.values()) {
        observer.observe(el);
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
  }, [ordered, total]);

  // Attach new elements to the observer map as they mount.
  const indices = useMemo(() => {
    const out: number[] = [];
    for (let i = renderStart; i <= renderEnd; i++) {
      out.push(i);
    }
    return out;
  }, [renderStart, renderEnd]);

  return (
    <>
      {indices.map((idx) => {
        const post = ordered[idx];
        if (!post) {
          return null;
        }

        return (
          <PostStreamItem
            key={post.slug}
            post={post}
            allByDate={allByDate}
            onRef={(el) => {
              if (!el) {
                itemEls.current.delete(post.slug);
                return;
              }
              itemEls.current.set(post.slug, el);
            }}
          />
        );
      })}
    </>
  );
}
