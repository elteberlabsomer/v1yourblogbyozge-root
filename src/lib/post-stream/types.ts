import type { ContentRef, Post } from '@/lib/content/types';

export type SpotlightPost = {
  slug: string;
  title: string;
  coverSrc: string;
  coverAlt: string;
};

export type WallItem = {
  tag: ContentRef;
  post: Post;
};

export type TagSpotlightData = {
  tag: ContentRef;
  posts: SpotlightPost[];
};

export type StreamAfterData = {
  wallItemsMobile: WallItem[];
  latestFiveMobile: Post[];
  tagSpotlightsWide: TagSpotlightData[];
  latestSixWide: Post[];
};

export type StreamEntry = {
  post: Post;
  afterData: StreamAfterData;
};

export type StreamBatchResponse = {
  items: StreamEntry[];
  nextCursor: string | null;
  hasMore: boolean;
};
