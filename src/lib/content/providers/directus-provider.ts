import type { ContentProvider } from '@/lib/content/provider';
import type { ListPostsOptions, ListPostsResult, Post } from '@/lib/content/types';
import { directusAssetUrl } from '@/lib/directus/asset-url';

type DirectusPostItem = {
  slug: string;
  status?: string;
  title?: string;
  summary?: string;
  date_created?: string;
  cover_image?: string | null;
  topic?: {
    slug: string;
    label: string;
  } | null;
  tags?: Array<{
    tags_id?: {
      slug: string;
      label: string;
    } | null;
  }>;
};

type DirectusItemsResponse<T> = {
  data: T;
  meta?: {
    filter_count?: number;
    total_count?: number;
  };
};

function requireDirectusBaseUrl(): string {
  const raw = process.env.DIRECTUS_URL ?? process.env.NEXT_PUBLIC_DIRECTUS_URL;
  if (!raw) {
    throw new Error('DIRECTUS_URL is not set.');
  }
  return raw.replace(/\/+$/, '');
}

function asNonEmptyString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function mapDirectusToPost(item: DirectusPostItem): Post {
  const authorName = process.env.NEXT_PUBLIC_AUTHOR_NAME ?? 'Ozge';
  const dateIso = asNonEmptyString(item.date_created) || new Date().toISOString();
  const title = asNonEmptyString(item.title);
  const summary = asNonEmptyString(item.summary);
  const coverId = item.cover_image ?? '';

  return {
    slug: item.slug,
    authorName,
    dateIso,
    title,
    summary,
    cover: {
      src: coverId ? directusAssetUrl(coverId, { key: 'thumb' }) : '',
      alt: title || 'Cover image',
    },
    topic: item.topic?.slug && item.topic?.label ? { slug: item.topic.slug, label: item.topic.label } : undefined,
    tags: (item.tags ?? [])
      .map((t) => t.tags_id)
      .filter((t): t is NonNullable<typeof t> => Boolean(t?.slug && t?.label))
      .map((t) => ({ slug: t.slug, label: t.label })),
    body: [],
  };
}

async function directusFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = requireDirectusBaseUrl();
  const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Directus request failed (${res.status}): ${text}`);
  }

  return (await res.json()) as T;
}

async function listPostsPaged(options?: ListPostsOptions): Promise<ListPostsResult> {
  const requestedLimit = options?.limit ?? 50;
  const startOffset = options?.offset ?? 0;

  const pageSize = 100;
  const items: Post[] = [];

  let offset = startOffset;
  let total = 0;

  while (items.length < requestedLimit) {
    const remaining = requestedLimit - items.length;
    const limit = Math.min(pageSize, remaining);

    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      sort: '-date_created',
      'filter[status][_eq]': 'published',
      fields: [
        'slug',
        'status',
        'title',
        'summary',
        'date_created',
        'cover_image',
        'topic.slug',
        'topic.label',
        'tags.tags_id.slug',
        'tags.tags_id.label',
      ].join(','),
      meta: 'filter_count',
    });

    const json = await directusFetchJson<DirectusItemsResponse<DirectusPostItem[]>>(`/items/posts?${params.toString()}`);
    const batch = json.data ?? [];

    if (typeof json.meta?.filter_count === 'number') {
      total = json.meta.filter_count;
    }

    items.push(...batch.map(mapDirectusToPost));

    if (batch.length < limit) {
      break;
    }

    offset += limit;
  }

  return {
    items,
    total: total || items.length,
  };
}

export const directusProvider: ContentProvider = {
  async listPosts(options) {
    return listPostsPaged(options);
  },

  async getPostBySlug(slug) {
    const params = new URLSearchParams({
      limit: '1',
      'filter[slug][_eq]': slug,
      'filter[status][_eq]': 'published',
      fields: [
        'slug',
        'status',
        'title',
        'summary',
        'date_created',
        'cover_image',
        'topic.slug',
        'topic.label',
        'tags.tags_id.slug',
        'tags.tags_id.label',
      ].join(','),
    });

    const json = await directusFetchJson<DirectusItemsResponse<DirectusPostItem[]>>(`/items/posts?${params.toString()}`);
    const first = json.data?.[0];
    return first ? mapDirectusToPost(first) : null;
  },

  async listAllSlugs() {
    const pageSize = 200;
    const slugs: string[] = [];

    let offset = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(offset),
        sort: '-date_created',
        'filter[status][_eq]': 'published',
        fields: 'slug',
      });

      const json = await directusFetchJson<DirectusItemsResponse<Array<{ slug: string }>>>(
        `/items/posts?${params.toString()}`,
      );
      const batch = json.data ?? [];
      slugs.push(...batch.map((p) => p.slug));

      if (batch.length < pageSize) {
        break;
      }
      offset += pageSize;
    }

    return slugs;
  },
};
