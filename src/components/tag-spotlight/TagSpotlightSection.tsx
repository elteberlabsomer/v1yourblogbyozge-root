'use client';

import { useState, useEffect } from 'react';
import { TagSpotlight, type TagSpotlightPost } from '@/components/tag-spotlight/TagSpotlight';

type RawTag = {
  slug: string;
  label: string;
};

type RawPost = {
  slug: string;
  title: string;
  coverSrc: string;
  coverAlt: string;
  tags: RawTag[];
};

type Props = {
  posts: RawPost[];
};

const COLUMNS = 3;
const MIN_POSTS = 3;

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
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

function buildCards(posts: RawPost[], seed: number) {
  const tagIndex = new Map<
    string,
    { tagSlug: string; tagLabel: string; posts: TagSpotlightPost[] }
  >();

  for (const p of posts) {
    for (const t of p.tags) {
      const key = t.slug.toLowerCase();
      if (!key || key === 'videos') continue;

      const existing = tagIndex.get(key);
      const spotPost: TagSpotlightPost = {
        slug: p.slug,
        title: p.title,
        coverSrc: p.coverSrc,
        coverAlt: p.coverAlt,
      };

      if (existing) {
        existing.posts.push(spotPost);
      } else {
        tagIndex.set(key, {
          tagSlug: t.slug,
          tagLabel: t.label || t.slug,
          posts: [spotPost],
        });
      }
    }
  }

  // Sadece MIN_POSTS filtrele, sıralama YOK — shuffle zaten rastgele yapıyor
  const buckets = Array.from(tagIndex.values()).filter(
    (b) => b.posts.length >= MIN_POSTS,
  );

  // Tüm bucket'ları shuffle et
  const shuffled = seededShuffle(buckets, seed);

  const cards: Array<{ tagSlug: string; tagLabel: string; posts: TagSpotlightPost[] }> = [];

  for (const c of shuffled) {
    // Bu bucket'ın postlarını da ayrıca shuffle et
    const shuffledPosts = seededShuffle(
      c.posts,
      seed ^ c.tagSlug.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
    );
    const cardPosts = shuffledPosts.slice(0, 4);
    if (cardPosts.length < MIN_POSTS) continue;
    cards.push({ tagSlug: c.tagSlug, tagLabel: c.tagLabel, posts: cardPosts });
    if (cards.length === COLUMNS) break;
  }

  return cards;
}

export function TagSpotlightSection({ posts }: Props) {
  const [tagCards, setTagCards] = useState<
    Array<{ tagSlug: string; tagLabel: string; posts: TagSpotlightPost[] }>
  >([]);

  useEffect(() => {
    // Her mount'ta tamamen rastgele — cache'den bağımsız, client'ta çalışır
    const seed = Math.floor(Math.random() * 2_147_483_647);
    setTagCards(buildCards(posts, seed));
  }, [posts]);

  if (tagCards.length === 0) return null;

  return (
    <>
      {tagCards.map((c) => (
        <TagSpotlight
          key={c.tagSlug}
          tagSlug={c.tagSlug}
          tagLabel={c.tagLabel}
          posts={c.posts}
          limit={4}
        />
      ))}
    </>
  );
}