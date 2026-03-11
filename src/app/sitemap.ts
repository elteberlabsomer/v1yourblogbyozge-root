import type { MetadataRoute } from 'next';

import { content } from '@/lib/content';
import { listTags, listTopics } from '@/lib/content/queries';

export const revalidate = 900;

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

function absoluteUrl(path: string): string {
  return new URL(path, `${siteUrl}/`).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [postsResult, topics, tags] = await Promise.all([
    content.listPosts({ limit: 5000 }),
    listTopics(),
    listTags(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/topics'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/pages/about'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/pages/contact'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: absoluteUrl('/pages/privacy'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/pages/terms'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/pages/cookies'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = postsResult.items.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.dateIso ? new Date(post.dateIso) : now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const topicRoutes: MetadataRoute.Sitemap = topics.map((topic) => ({
    url: absoluteUrl(`/topics/${topic.slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const tagRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: absoluteUrl(`/tags/${tag.slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes, ...topicRoutes, ...tagRoutes];
}
