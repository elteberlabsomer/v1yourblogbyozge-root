'use client';

import dynamic from 'next/dynamic';
import type { StreamEntry } from '@/lib/post-stream/types';

const LazyPostStreamReader = dynamic(
  () => import('@/components/post-stream-reader/PostStreamReader').then((mod) => mod.PostStreamReader),
  {
    ssr: false,
    loading: () => null,
  },
);

type PostStreamReaderLazyProps = {
  initialSlug: string;
  initialItems: StreamEntry[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  batchSize?: number;
};

export function PostStreamReaderLazy(props: PostStreamReaderLazyProps) {
  return <LazyPostStreamReader {...props} />;
}
