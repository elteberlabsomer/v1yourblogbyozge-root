import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';

const SEARCH_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=1800';

function searchHeaders(): HeadersInit {
  return {
    'Cache-Control': SEARCH_CACHE_CONTROL,
    'CDN-Cache-Control': SEARCH_CACHE_CONTROL,
    'Vercel-CDN-Cache-Control': SEARCH_CACHE_CONTROL,
  };
}

type SearchItem = {
  slug: string;
  title: string;
};

type DirectusItemsResponse<T> = {
  data: T;
};

function clampLimit(limitRaw: string | null) {
  const n = Number(limitRaw);
  if (!Number.isFinite(n)) return 8;
  if (n < 1) return 1;
  if (n > 20) return 20;
  return Math.floor(n);
}

function normalizeQuery(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

async function fetchSearchResults(query: string, limit: number): Promise<SearchItem[]> {
  const q = normalizeQuery(query);
  if (!q) {
    return [];
  }

  const base = process.env.DIRECTUS_URL ?? process.env.NEXT_PUBLIC_DIRECTUS_URL;
  if (!base) {
    throw new Error('DIRECTUS_URL is not set.');
  }

  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('fields', ['slug', 'title'].join(','));
  params.set('filter[status][_eq]', 'published');
  params.set('filter[_or][0][title][_icontains]', q);
  params.set('filter[_or][1][summary][_icontains]', q);
  params.set('filter[_or][2][slug][_icontains]', q);

  const normalizedBase = base.replace(/\/$/, '');
  const endpoint = `${normalizedBase}/items/posts?${params.toString()}`;

  const res = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Directus request failed (${res.status}).`);
  }

  const json = (await res.json()) as DirectusItemsResponse<Array<{ slug?: string; title?: string }>>;
  return (json.data ?? [])
    .map((x) => ({ slug: String(x.slug ?? ''), title: String(x.title ?? '') }))
    .filter((x) => x.slug.length > 0 && x.title.length > 0);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = normalizeQuery(url.searchParams.get('q') ?? '');
  const limit = clampLimit(url.searchParams.get('limit'));

  if (!q) {
    return NextResponse.json({ items: [] as SearchItem[] }, { headers: searchHeaders() });
  }

  try {
    const items = await unstable_cache(
      async () => fetchSearchResults(q, limit),
      ['search-index', q.toLowerCase(), String(limit)],
      { revalidate: 300, tags: ['search:index'] },
    )();

    return NextResponse.json({ items }, { headers: searchHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search request failed.';

    return NextResponse.json(
      { items: [] as SearchItem[], error: message },
      { status: message.includes('DIRECTUS_URL') ? 500 : 502, headers: searchHeaders() },
    );
  }
}