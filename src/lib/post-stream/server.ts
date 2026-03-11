import { unstable_cache } from 'next/cache';
import { content } from '@/lib/content';
import type { ContentRef, Post } from '@/lib/content/types';
import type { SpotlightPost, StreamAfterData, StreamBatchResponse, StreamEntry, WallItem } from '@/lib/post-stream/types';

export const INITIAL_STREAM_BATCH_SIZE = 1;
export const STREAM_BATCH_SIZE = 5;

const STREAM_REVALIDATE_SECONDS = 300;

async function fetchSpotlightTagPostsUncached(tagSlug: string, excludeSlug: string): Promise<Post[]> {
  return content.listPostsByTag({
    tagSlug,
    excludeSlug,
    limit: 4,
    includeBody: false,
  });
}

async function fetchTopicPostsForAfterDataUncached(topicSlug: string, excludeSlug: string): Promise<Post[]> {
  return content.listPostsByTopic({
    topicSlug,
    excludeSlug,
    limit: 6,
    includeBody: false,
  });
}

async function getSpotlightTagPosts(tagSlug: string, excludeSlug: string): Promise<Post[]> {
  return unstable_cache(
    async () => fetchSpotlightTagPostsUncached(tagSlug, excludeSlug),
    ['stream-spotlight-tag-posts', tagSlug, excludeSlug],
    { revalidate: STREAM_REVALIDATE_SECONDS, tags: [`stream:tag:${tagSlug}`] },
  )();
}

async function getTopicPostsForAfterData(topicSlug: string, excludeSlug: string): Promise<Post[]> {
  return unstable_cache(
    async () => fetchTopicPostsForAfterDataUncached(topicSlug, excludeSlug),
    ['stream-topic-after-posts', topicSlug, excludeSlug],
    { revalidate: STREAM_REVALIDATE_SECONDS, tags: [`stream:topic:${topicSlug}`] },
  )();
}

function uniqueTags(tags: ContentRef[] = []): ContentRef[] {
  const seen = new Set<string>();
  const out: ContentRef[] = [];

  for (const tag of tags) {
    if (!tag?.slug || seen.has(tag.slug)) {
      continue;
    }
    seen.add(tag.slug);
    out.push(tag);
  }

  return out;
}

function toSpotlightPosts(posts: Post[]): SpotlightPost[] {
  return posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    coverSrc: p.cover?.src ?? '',
    coverAlt: p.cover?.alt ?? p.title,
  }));
}

async function pickEligibleSpotlightTags(post: Post): Promise<Array<{ tag: ContentRef; posts: Post[] }>> {
  const out: Array<{ tag: ContentRef; posts: Post[] }> = [];

  for (const tag of uniqueTags(post.tags)) {
    const posts = await getSpotlightTagPosts(tag.slug, post.slug);

    if (posts.length > 0) {
      out.push({ tag, posts });
    }

    if (out.length === 2) {
      break;
    }
  }

  return out;
}

async function buildAfterDataUncached(post: Post): Promise<StreamAfterData> {
  const spotlightTagSets = await pickEligibleSpotlightTags(post);
  const topicSlug = post.topic?.slug ?? '';

  const topicPosts = topicSlug
    ? await getTopicPostsForAfterData(topicSlug, post.slug)
    : [];

  const usedMobile = new Set<string>([post.slug]);
  const wallItemsMobile: WallItem[] = [];

  for (const { tag, posts } of spotlightTagSets) {
    const picked = posts.find((candidate) => !usedMobile.has(candidate.slug));
    if (!picked) {
      continue;
    }

    usedMobile.add(picked.slug);
    wallItemsMobile.push({ tag, post: picked });
  }

  return {
    wallItemsMobile,
    latestFiveMobile: topicPosts.slice(0, 5),
    tagSpotlightsWide: spotlightTagSets.map(({ tag, posts }) => ({
      tag,
      posts: toSpotlightPosts(posts.slice(0, 4)),
    })),
    latestSixWide: topicPosts.slice(0, 6),
  };
}

export async function buildAfterData(post: Post): Promise<StreamAfterData> {
  return unstable_cache(
    async () => buildAfterDataUncached(post),
    ['stream-after-data', post.slug],
    { revalidate: STREAM_REVALIDATE_SECONDS, tags: [`stream:post:${post.slug}`] },
  )();
}

export async function buildStreamEntry(post: Post): Promise<StreamEntry> {
  return {
    post,
    afterData: await buildAfterData(post),
  };
}

async function listOlderPostsUncached(
  beforeDateIso: string,
  limit: number,
): Promise<{ items: Post[]; nextCursor: string | null; hasMore: boolean }> {
  const fetched = await content.listPostsBefore({
    beforeDateIso,
    limit: limit + 1,
    includeBody: true,
  });

  const items = fetched.slice(0, limit);
  const hasMore = fetched.length > limit;
  const nextCursor = items.length > 0 ? items[items.length - 1].dateIso : null;

  return { items, nextCursor, hasMore };
}

export async function listOlderPosts(beforeDateIso: string, limit: number): Promise<{ items: Post[]; nextCursor: string | null; hasMore: boolean }> {
  return unstable_cache(
    async () => listOlderPostsUncached(beforeDateIso, limit),
    ['stream-older-posts', beforeDateIso, String(limit)],
    { revalidate: STREAM_REVALIDATE_SECONDS, tags: ['stream:older-posts'] },
  )();
}

export async function buildInitialStreamBatch(initialPost: Post): Promise<StreamBatchResponse> {
  return unstable_cache(
    async () => {
      const older = await listOlderPosts(initialPost.dateIso, INITIAL_STREAM_BATCH_SIZE);
      const entries = await Promise.all(older.items.map(buildStreamEntry));

      return {
        items: entries,
        nextCursor: older.nextCursor,
        hasMore: older.hasMore,
      };
    },
    ['stream-initial-batch', initialPost.slug, initialPost.dateIso],
    { revalidate: STREAM_REVALIDATE_SECONDS, tags: [`stream:initial:${initialPost.slug}`] },
  )();
}

export async function buildStreamBatch(beforeDateIso: string, limit = STREAM_BATCH_SIZE): Promise<StreamBatchResponse> {
  return unstable_cache(
    async () => {
      const older = await listOlderPosts(beforeDateIso, limit);
      const entries = await Promise.all(older.items.map(buildStreamEntry));

      return {
        items: entries,
        nextCursor: older.nextCursor,
        hasMore: older.hasMore,
      };
    },
    ['stream-batch', beforeDateIso, String(limit)],
    { revalidate: STREAM_REVALIDATE_SECONDS, tags: ['stream:batch'] },
  )();
}