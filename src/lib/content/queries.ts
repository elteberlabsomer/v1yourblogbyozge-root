import { unstable_cache } from 'next/cache';
import { content } from '@/lib/content';
import type { ContentRef, Post } from '@/lib/content/types';

export type TaxonomyItem = ContentRef & { count: number };

type DirectusItemsResponse<T> = {
  data?: T;
};

type DirectusTaxonomyRecord = {
  slug?: string | null;
  label?: string | null;
};

const PAGED_QUERY_SIZE = 100;
const MAX_POST_SCAN = 5000;
const TAXONOMY_REVALIDATE_SECONDS = 900;
const TAXONOMY_PAGE_SIZE = 200;

function normalizeSlug(input: string): string {
  return decodeURIComponent(input).trim().toLowerCase();
}

function byDateDesc(a: Post, b: Post): number {
  return b.dateIso.localeCompare(a.dateIso);
}

function directusBaseUrl(): string | null {
  const raw = process.env.DIRECTUS_URL ?? process.env.NEXT_PUBLIC_DIRECTUS_URL ?? '';
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function toTaxonomyListFromMap(map: Map<string, TaxonomyItem>): TaxonomyItem[] {
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function buildTagCountMap(items: Post[]): Map<string, number> {
  const counts = new Map<string, number>();

  items.forEach((post: Post) => {
    (post.tags ?? []).forEach((tag: ContentRef) => {
      if (!tag?.slug || !tag.label) {
        return;
      }

      const slug = normalizeSlug(tag.slug);
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    });
  });

  return counts;
}

async function fetchDirectusTaxonomyCollection(collection: 'topics' | 'tags'): Promise<ContentRef[]> {
  const base = directusBaseUrl();
  if (!base) {
    return [];
  }

  const out: ContentRef[] = [];
  const seen = new Set<string>();

  for (let offset = 0; ; offset += TAXONOMY_PAGE_SIZE) {
    const params = new URLSearchParams({
      fields: 'slug,label',
      sort: 'label',
      limit: String(TAXONOMY_PAGE_SIZE),
      offset: String(offset),
    });

    try {
      const res = await fetch(`${base}/items/${collection}?${params.toString()}`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: TAXONOMY_REVALIDATE_SECONDS },
      });

      if (!res.ok) {
        return [];
      }

      const json = (await res.json()) as DirectusItemsResponse<DirectusTaxonomyRecord[]>;
      const batch = json.data ?? [];

      batch.forEach((item) => {
        if (!isNonEmptyString(item.slug) || !isNonEmptyString(item.label)) {
          return;
        }

        const slug = normalizeSlug(item.slug);
        if (seen.has(slug)) {
          return;
        }

        seen.add(slug);
        out.push({ slug, label: item.label.trim() });
      });

      if (batch.length < TAXONOMY_PAGE_SIZE) {
        break;
      }
    } catch {
      return [];
    }
  }

  return out.sort((a, b) => a.label.localeCompare(b.label));
}

async function fetchDirectusTaxonomyItem(
  collection: 'topics' | 'tags',
  slugInput: string,
): Promise<ContentRef | null> {
  const slug = normalizeSlug(slugInput);
  const base = directusBaseUrl();
  if (!base || !slug) {
    return null;
  }

  const params = new URLSearchParams({
    fields: 'slug,label',
    limit: '1',
    'filter[slug][_eq]': slug,
  });

  try {
    const res = await fetch(`${base}/items/${collection}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: TAXONOMY_REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as DirectusItemsResponse<DirectusTaxonomyRecord[]>;
    const item = json.data?.[0];

    if (!item || !isNonEmptyString(item.slug) || !isNonEmptyString(item.label)) {
      return null;
    }

    return {
      slug: normalizeSlug(item.slug),
      label: item.label.trim(),
    };
  } catch {
    return null;
  }
}

const listAllPostsLiteCached = unstable_cache(
  async (): Promise<Post[]> => {
    const { items } = await content.listPosts({ limit: MAX_POST_SCAN, includeBody: false });
    return items.sort(byDateDesc);
  },
  ['taxonomy-all-posts-lite'],
  { revalidate: TAXONOMY_REVALIDATE_SECONDS, tags: ['taxonomy:all-posts-lite'] },
);

const listTopicsFromPostsCached = unstable_cache(
  async (): Promise<TaxonomyItem[]> => {
    const items = await listAllPostsLiteCached();
    const map = new Map<string, TaxonomyItem>();

    items.forEach((post: Post) => {
      if (!post.topic?.slug || !post.topic.label) {
        return;
      }

      const slug = normalizeSlug(post.topic.slug);
      const existing = map.get(slug);

      if (existing) {
        existing.count += 1;
        return;
      }

      map.set(slug, { slug, label: post.topic.label, count: 1 });
    });

    return toTaxonomyListFromMap(map);
  },
  ['taxonomy-topics-from-posts'],
  { revalidate: TAXONOMY_REVALIDATE_SECONDS, tags: ['taxonomy:topics-from-posts'] },
);

const listTagsFromPostsCached = unstable_cache(
  async (): Promise<TaxonomyItem[]> => {
    const items = await listAllPostsLiteCached();
    const map = new Map<string, TaxonomyItem>();

    items.forEach((post: Post) => {
      (post.tags ?? []).forEach((tag: ContentRef) => {
        if (!tag?.slug || !tag.label) {
          return;
        }

        const slug = normalizeSlug(tag.slug);
        const existing = map.get(slug);

        if (existing) {
          existing.count += 1;
          return;
        }

        map.set(slug, { slug, label: tag.label, count: 1 });
      });
    });

    return toTaxonomyListFromMap(map);
  },
  ['taxonomy-tags-from-posts'],
  { revalidate: TAXONOMY_REVALIDATE_SECONDS, tags: ['taxonomy:tags-from-posts'] },
);

const listDirectusTopicsCached = unstable_cache(
  async (): Promise<ContentRef[]> => fetchDirectusTaxonomyCollection('topics'),
  ['taxonomy-topics-directus'],
  { revalidate: TAXONOMY_REVALIDATE_SECONDS, tags: ['taxonomy:topics'] },
);

const listDirectusTagsCached = unstable_cache(
  async (): Promise<ContentRef[]> => fetchDirectusTaxonomyCollection('tags'),
  ['taxonomy-tags-directus'],
  { revalidate: TAXONOMY_REVALIDATE_SECONDS, tags: ['taxonomy:tags'] },
);

const listTagCountMapCached = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const items = await listAllPostsLiteCached();
    const counts = buildTagCountMap(items);
    return Object.fromEntries(counts.entries());
  },
  ['taxonomy-tag-count-map'],
  { revalidate: TAXONOMY_REVALIDATE_SECONDS, tags: ['taxonomy:tag-counts'] },
);

async function fetchPostsByTopicSlugUncached(slug: string): Promise<Post[]> {
  const items: Post[] = [];

  for (let offset = 0; offset < MAX_POST_SCAN; offset += PAGED_QUERY_SIZE) {
    const batch = await content.listPostsByTopic({
      topicSlug: slug,
      limit: PAGED_QUERY_SIZE,
      offset,
      includeBody: false,
    });

    items.push(...batch);

    if (batch.length < PAGED_QUERY_SIZE) {
      break;
    }
  }

  return items.sort(byDateDesc);
}

async function fetchPostsByTagSlugUncached(slug: string): Promise<Post[]> {
  const items: Post[] = [];

  for (let offset = 0; offset < MAX_POST_SCAN; offset += PAGED_QUERY_SIZE) {
    const batch = await content.listPostsByTag({
      tagSlug: slug,
      limit: PAGED_QUERY_SIZE,
      offset,
      includeBody: false,
    });

    items.push(...batch);

    if (batch.length < PAGED_QUERY_SIZE) {
      break;
    }
  }

  return items.sort(byDateDesc);
}

const listTopicsCached = unstable_cache(
  async (): Promise<TaxonomyItem[]> => {
    const directusTopics = await listDirectusTopicsCached();

    if (directusTopics.length > 0) {
      return directusTopics.map((topic: ContentRef) => ({ ...topic, count: 0 }));
    }

    return listTopicsFromPostsCached();
  },
  ['taxonomy-topics'],
  { revalidate: TAXONOMY_REVALIDATE_SECONDS, tags: ['taxonomy:topics:resolved'] },
);

const listTagsCached = unstable_cache(
  async (): Promise<TaxonomyItem[]> => {
    const directusTags = await listDirectusTagsCached();

    if (directusTags.length > 0) {
      const countMap = await listTagCountMapCached();
      return directusTags.map((tag: ContentRef) => ({
        ...tag,
        count: countMap[tag.slug] ?? 0,
      }));
    }

    return listTagsFromPostsCached();
  },
  ['taxonomy-tags'],
  { revalidate: TAXONOMY_REVALIDATE_SECONDS, tags: ['taxonomy:tags:resolved'] },
);

export async function listTopics(): Promise<TaxonomyItem[]> {
  return listTopicsCached();
}

export async function getTopicBySlug(slugInput: string): Promise<TaxonomyItem | null> {
  const slug = normalizeSlug(slugInput);
  const fromDirectus = await fetchDirectusTaxonomyItem('topics', slug);

  if (fromDirectus) {
    return { ...fromDirectus, count: 0 };
  }

  const topics = await listTopicsCached();
  return topics.find((t: TaxonomyItem) => t.slug === slug) ?? null;
}

export async function listTags(): Promise<TaxonomyItem[]> {
  return listTagsCached();
}

export async function getTagBySlug(slugInput: string): Promise<TaxonomyItem | null> {
  const slug = normalizeSlug(slugInput);
  const fromDirectus = await fetchDirectusTaxonomyItem('tags', slug);

  if (fromDirectus) {
    return { ...fromDirectus, count: 0 };
  }

  const tags = await listTagsCached();
  return tags.find((t: TaxonomyItem) => t.slug === slug) ?? null;
}

export async function listPostsByTopicSlug(slugInput: string): Promise<Post[]> {
  const slug = normalizeSlug(slugInput);

  return unstable_cache(
    async () => fetchPostsByTopicSlugUncached(slug),
    ['taxonomy-posts-by-topic', slug],
    { revalidate: TAXONOMY_REVALIDATE_SECONDS, tags: [`taxonomy:topic:${slug}`] },
  )();
}

export async function listPostsByTagSlug(slugInput: string): Promise<Post[]> {
  const slug = normalizeSlug(slugInput);

  return unstable_cache(
    async () => fetchPostsByTagSlugUncached(slug),
    ['taxonomy-posts-by-tag', slug],
    { revalidate: TAXONOMY_REVALIDATE_SECONDS, tags: [`taxonomy:tag:${slug}`] },
  )();
}