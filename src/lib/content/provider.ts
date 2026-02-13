import type { ListPostsOptions, ListPostsResult, Post } from "@/lib/content/types";

export type ContentProvider = {
  listPosts(options?: ListPostsOptions): Promise<ListPostsResult>;
  getPostBySlug(slug: string): Promise<Post | null>;
  listAllSlugs(): Promise<string[]>;
};
