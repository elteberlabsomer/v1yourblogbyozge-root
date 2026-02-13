import { content } from "@/lib/content";
import type { ContentRef, Post } from "@/lib/content/types";

export type TaxonomyItem = ContentRef & { count: number };

function normalizeSlug(input: string): string {
  return decodeURIComponent(input).trim().toLowerCase();
}

function byDateDesc(a: Post, b: Post): number {
  return b.dateIso.localeCompare(a.dateIso);
}

export async function listTopics(): Promise<TaxonomyItem[]> {
  const { items } = await content.listPosts({ limit: 5000 });

  const map = new Map<string, TaxonomyItem>();

  items.forEach((post) => {
    if (!post.topic) return;

    const slug = normalizeSlug(post.topic.slug);
    const label = post.topic.label;

    const existing = map.get(slug);
    if (existing) {
      existing.count += 1;
      return;
    }

    map.set(slug, { slug, label, count: 1 });
  });

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export async function getTopicBySlug(slugInput: string): Promise<TaxonomyItem | null> {
  const slug = normalizeSlug(slugInput);
  const topics = await listTopics();
  return topics.find((t) => t.slug === slug) ?? null;
}

export async function listTags(): Promise<TaxonomyItem[]> {
  const { items } = await content.listPosts({ limit: 5000 });

  const map = new Map<string, TaxonomyItem>();

  items.forEach((post) => {
    (post.tags ?? []).forEach((tag) => {
      const slug = normalizeSlug(tag.slug);
      const label = tag.label;

      const existing = map.get(slug);
      if (existing) {
        existing.count += 1;
        return;
      }

      map.set(slug, { slug, label, count: 1 });
    });
  });

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export async function getTagBySlug(slugInput: string): Promise<TaxonomyItem | null> {
  const slug = normalizeSlug(slugInput);
  const tags = await listTags();
  return tags.find((t) => t.slug === slug) ?? null;
}

export async function listPostsByTopicSlug(slugInput: string): Promise<Post[]> {
  const slug = normalizeSlug(slugInput);
  const { items } = await content.listPosts({ limit: 5000 });

  return items
    .filter((p) => p.topic && normalizeSlug(p.topic.slug) === slug)
    .sort(byDateDesc);
}

export async function listPostsByTagSlug(slugInput: string): Promise<Post[]> {
  const slug = normalizeSlug(slugInput);
  const { items } = await content.listPosts({ limit: 5000 });

  return items
    .filter((p) => (p.tags ?? []).some((t) => normalizeSlug(t.slug) === slug))
    .sort(byDateDesc);
}
