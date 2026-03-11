import { NextResponse } from 'next/server';
import { buildStreamBatch, STREAM_BATCH_SIZE } from '@/lib/post-stream/server';

const STREAM_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=1800';

function streamHeaders(): HeadersInit {
  return {
    'Cache-Control': STREAM_CACHE_CONTROL,
    'CDN-Cache-Control': STREAM_CACHE_CONTROL,
    'Vercel-CDN-Cache-Control': STREAM_CACHE_CONTROL,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const before = searchParams.get('before');
  const limitParam = Number(searchParams.get('limit') ?? String(STREAM_BATCH_SIZE));
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 12) : STREAM_BATCH_SIZE;

  if (!before) {
    return NextResponse.json({ error: 'Missing before cursor.' }, { status: 400, headers: streamHeaders() });
  }

  try {
    const batch = await buildStreamBatch(before, limit);
    return NextResponse.json(batch, {
      headers: streamHeaders(),
    });
  } catch (error) {
    console.error('Failed to build post stream batch.', error);
    return NextResponse.json({ error: 'Failed to build post stream batch.' }, { status: 500, headers: streamHeaders() });
  }
}