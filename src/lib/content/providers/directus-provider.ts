import type { ContentProvider } from '@/lib/content/provider';
import type { ListPostsOptions, ListPostsResult, Post } from '@/lib/content/types';
import { directusAssetUrl } from '@/lib/directus/asset-url';

type DirectusPostItem = {
  id?: string;
  slug: string;
  status?: string;
  title?: string;
  summary?: string;
  content?: string;
  date_created?: string;
  cover_image?: string | null;
  cover_alt?: string | null;
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

const POST_BASE_FIELDS = [
  'slug',
  'status',
  'title',
  'summary',
  'date_created',
  'cover_image',
  'cover_alt',
  'topic.slug',
  'topic.label',
  'tags.tags_id.slug',
  'tags.tags_id.label',
].join(',');

const POST_FULL_FIELDS = [POST_BASE_FIELDS, 'content'].join(',');

function selectPostFields(includeBody = true): string {
  return includeBody ? POST_FULL_FIELDS : POST_BASE_FIELDS;
}

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
  const htmlContent = item.content || '';

  return {
    slug: item.slug,
    authorName,
    dateIso,
    title,
    summary,
    cover: {
      src: coverId ? directusAssetUrl(coverId) : '',
      alt: item.cover_alt || title || 'Cover image',
    },
    topic: item.topic?.slug && item.topic?.label ? { slug: item.topic.slug, label: item.topic.label } : undefined,
    tags: (item.tags ?? [])
      .map((t) => t.tags_id)
      .filter((t): t is NonNullable<typeof t> => Boolean(t?.slug && t?.label))
      .map((t) => ({ slug: t.slug, label: t.label })),
    body: htmlContent ? [{ kind: 'html' as const, html: htmlContent }] : [],
  };
}

async function directusFetchJson<T>(path: string, init?: RequestInit & { noCache?: boolean }): Promise<T> {
  const base = requireDirectusBaseUrl();
  const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;

  const { noCache, ...restInit } = init ?? {};

  const res = await fetch(url, {
    ...restInit,
    headers: {
      Accept: 'application/json',
      ...(restInit?.headers ?? {}),
    },
    ...(noCache ? { cache: 'no-store' as const } : { next: { revalidate: 900 } }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Directus request failed (${res.status}): ${text}`);
  }

  return (await res.json()) as T;
}

async function fetchPostsByParams(
  params: URLSearchParams,
  options?: { includeMeta?: boolean; includeBody?: boolean },
): Promise<DirectusItemsResponse<DirectusPostItem[]>> {
  const includeMeta = options?.includeMeta ?? false;
  const includeBody = options?.includeBody ?? true;

  params.set('fields', selectPostFields(includeBody));
  params.set('sort', '-date_created');
  params.set('filter[status][_eq]', 'published');

  if (includeMeta) {
    params.set('meta', 'filter_count');
  }

  return directusFetchJson<DirectusItemsResponse<DirectusPostItem[]>>(`/items/posts?${params.toString()}`);
}

async function listPostsPaged(options?: ListPostsOptions): Promise<ListPostsResult> {
  const requestedLimit = options?.limit ?? 50;
  const startOffset = options?.offset ?? 0;
  const includeBody = options?.includeBody ?? true;

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
    });

    const json = await fetchPostsByParams(params, { includeMeta: true, includeBody });
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

  async listPostsBefore({ beforeDateIso, limit, includeBody = true }) {
    if (!beforeDateIso || limit <= 0) {
      return [];
    }

    const params = new URLSearchParams({
      limit: String(limit),
      'filter[date_created][_lt]': beforeDateIso,
    });

    const json = await fetchPostsByParams(params, { includeBody });
    return (json.data ?? []).map(mapDirectusToPost);
  },

  async listPostsByTag({ tagSlug, limit, offset = 0, excludeSlug, includeBody = true }) {
    if (!tagSlug || limit <= 0) {
      return [];
    }

    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      'filter[tags][tags_id][slug][_eq]': tagSlug,
    });

    if (excludeSlug) {
      params.set('filter[slug][_neq]', excludeSlug);
    }

    const json = await fetchPostsByParams(params, { includeBody });
    return (json.data ?? []).map(mapDirectusToPost);
  },

  async listPostsByTopic({ topicSlug, limit, offset = 0, excludeSlug, includeBody = true }) {
    if (!topicSlug || limit <= 0) {
      return [];
    }

    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      'filter[topic][slug][_eq]': topicSlug,
    });

    if (excludeSlug) {
      params.set('filter[slug][_neq]', excludeSlug);
    }

    const json = await fetchPostsByParams(params, { includeBody });
    return (json.data ?? []).map(mapDirectusToPost);
  },

  async getPostBySlug(slug) {
    const params = new URLSearchParams({
      limit: '1',
      'filter[slug][_eq]': slug,
      'filter[status][_eq]': 'published',
      fields: selectPostFields(true),
    });

    const json = await directusFetchJson<DirectusItemsResponse<DirectusPostItem[]>>(`/items/posts?${params.toString()}`);
    const first = json.data?.[0];
    return first ? mapDirectusToPost(first) : null;
  },

  async listAllSlugs() {
    const pageSize = 200;
    const slugs: string[] = [];

    let offset = 0;
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

  async getPostById(id, options) {
    const { token, version } = options ?? {};

    const fields = ['id', selectPostFields(true)].join(',');

    const params = new URLSearchParams({ fields });

    const isRealVersion = version && version !== 'main';
    if (isRealVersion) {
      params.set('version', version);
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const json = await directusFetchJson<{ data: DirectusPostItem }>(
      `/items/posts/${id}?${params.toString()}`,
      { headers, noCache: true },
    );

    return json.data ? mapDirectusToPost(json.data) : null;
  },
};
