import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qRaw = url.searchParams.get('q') ?? '';
  const q = qRaw.trim();
  const limit = clampLimit(url.searchParams.get('limit'));

  if (!q) {
    return NextResponse.json({ items: [] as SearchItem[] });
  }

  const base = process.env.DIRECTUS_URL ?? process.env.NEXT_PUBLIC_DIRECTUS_URL;
  if (!base) {
    return NextResponse.json({ items: [] as SearchItem[], error: 'DIRECTUS_URL is not set.' }, { status: 500 });
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
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json(
      { items: [] as SearchItem[], error: `Directus request failed (${res.status}).` },
      { status: 502 },
    );
  }

  const json = (await res.json()) as DirectusItemsResponse<Array<{ slug?: string; title?: string }>>;
  const items: SearchItem[] = (json.data ?? [])
    .map((x) => ({ slug: String(x.slug ?? ''), title: String(x.title ?? '') }))
    .filter((x) => x.slug.length > 0 && x.title.length > 0);

  return NextResponse.json({ items });
}
