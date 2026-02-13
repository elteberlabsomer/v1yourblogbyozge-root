import type { ContentProvider } from '@/lib/content/provider';
import type { Post } from '@/lib/content/types';
import { DEMO_POSTS, getDemoAllSlugs, getDemoPostBySlug } from '@/lib/demo/demoPosts';

function byDateDesc(a: { dateIso: string }, b: { dateIso: string }): number {
  return b.dateIso.localeCompare(a.dateIso);
}

function mapDemoToPost(demo: ReturnType<typeof getDemoPostBySlug>): Post | null {
  if (!demo) {
    return null;
  }

  return {
    slug: demo.slug,
    authorName: demo.authorName,
    dateIso: demo.dateIso,
    title: demo.title,
    summary: demo.summary,
    cover: {
      src: demo.coverSrc,
      alt: demo.coverAlt,
    },
    topic: {
      slug: demo.topicSlug,
      label: demo.categoryLabel,
    },
    tags: demo.tags.map((t) => ({ slug: t.slug, label: t.label })),
    body: demo.body,
  };
}

export const demoPostsProvider: ContentProvider = {
  async listPosts(options) {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    const sorted = [...DEMO_POSTS].sort(byDateDesc);
    const items = sorted.slice(offset, offset + limit).map((p) => mapDemoToPost(p) as Post);

    return {
      items,
      total: sorted.length,
    };
  },

  async getPostBySlug(slug) {
    return mapDemoToPost(getDemoPostBySlug(slug));
  },

  async listAllSlugs() {
    return getDemoAllSlugs();
  },
};
