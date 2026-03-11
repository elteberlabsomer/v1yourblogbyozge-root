import type { Metadata } from 'next';
import Link from 'next/link';

import { content } from '@/lib/content';
import type { Post } from '@/lib/content/types';

import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'List',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

function normalizeSlug(value: string): string {
  return decodeURIComponent(value).trim().toLowerCase();
}

function byTopicLabelAsc(
  a: { slug: string; label: string; posts: Post[] },
  b: { slug: string; label: string; posts: Post[] },
): number {
  return a.label.localeCompare(b.label);
}

function byDateDesc(a: Post, b: Post): number {
  return b.dateIso.localeCompare(a.dateIso);
}

export default async function ListPage() {
  const { items } = await content.listPosts({ limit: 5000, includeBody: false });
  const topicMap = new Map<string, { slug: string; label: string; posts: Post[] }>();

  items.forEach((post) => {
    if (!post.topic?.slug || !post.topic.label) {
      return;
    }

    const topicSlug = normalizeSlug(post.topic.slug);
    const existing = topicMap.get(topicSlug);

    if (existing) {
      existing.posts.push(post);
      return;
    }

    topicMap.set(topicSlug, {
      slug: topicSlug,
      label: post.topic.label,
      posts: [post],
    });
  });

  const topicsWithPosts = Array.from(topicMap.values())
    .map((entry) => ({
      ...entry,
      posts: entry.posts.sort(byDateDesc),
    }))
    .sort(byTopicLabelAsc);

  return (
    <div className={styles.page}>
      <div className="l-container">
        {topicsWithPosts.map(({ slug, label, posts }) => (
          <section key={slug} className={styles.section}>
            <h2 className={styles.topicTitle}>
              <Link href={`/topics/${slug}`} className={styles.topicLink}>
                {label}
              </Link>
            </h2>
            <ol className={styles.postList}>
              {posts.map((post, idx) => (
                <li key={post.slug} className={styles.postItem}>
                  <span className={styles.idx}>{idx + 1}.</span>

                  <div className={styles.postMain}>
                    <Link href={`/blog/${post.slug}`} className={styles.postLink}>
                      {post.title}
                    </Link>

                    {post.tags && post.tags.length > 0 ? (
                      <span className={styles.tagList} aria-label="Post tags">
                        {post.tags.map((tag) => (
                          <Link
                            key={`${post.slug}-${tag.slug}`}
                            href={`/tags/${tag.slug}`}
                            className={styles.tagLink}
                          >
                            #{tag.label}
                          </Link>
                        ))}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
