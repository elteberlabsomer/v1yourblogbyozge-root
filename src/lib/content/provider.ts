import type { ListPostsOptions, ListPostsResult, Post } from '@/lib/content/types';

export type ContentProvider = {
  listPosts(options?: ListPostsOptions): Promise<ListPostsResult>;
  listPostsBefore(options: { beforeDateIso: string; limit: number; includeBody?: boolean }): Promise<Post[]>;
  listPostsByTag(options: { tagSlug: string; limit: number; offset?: number; excludeSlug?: string; includeBody?: boolean }): Promise<Post[]>;
  listPostsByTopic(options: { topicSlug: string; limit: number; offset?: number; excludeSlug?: string; includeBody?: boolean }): Promise<Post[]>;
  getPostBySlug(slug: string): Promise<Post | null>;
  listAllSlugs(): Promise<string[]>;
  getPostById(id: string, options?: { token?: string; version?: string }): Promise<Post | null>;
};
