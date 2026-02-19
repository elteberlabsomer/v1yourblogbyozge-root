import type { ListPostsOptions, ListPostsResult, Post } from '@/lib/content/types';

export type GetPostBySlugOptions = {
  includeDraft?: boolean;
};

export type ContentProvider = {
  listPosts(options?: ListPostsOptions): Promise<ListPostsResult>;
  getPostBySlug(slug: string, options?: GetPostBySlugOptions): Promise<Post | null>;
  listAllSlugs(): Promise<string[]>;
};
