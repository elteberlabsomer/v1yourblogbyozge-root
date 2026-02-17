// D:\Dev\v1yourblogbyozge\src\app\blog\page.tsx
import type { Metadata } from 'next';

import { PostGrid } from '@/components/post-grid/PostGrid';
import { content } from '@/lib/content';

import styles from './page.module.css';

export const revalidate = 0;
export const dynamic = 'force-dynamic';


export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const url = new URL('/blog', siteUrl).toString();

  return {
    title: 'Blog · YourBlog',
    description: 'Latest posts.',
    alternates: { canonical: url },
    openGraph: {
      title: 'Blog · YourBlog',
      description: 'Latest posts.',
      url,
      type: 'website',
    },
  };
}

export default async function BlogPage() {
  const res = await content.listPosts({ limit: 60 });
  const posts = res.items ?? [];

  return (
    <main className={styles.wrap}>
      <article className={styles.article}>
        <header className={styles.sectionHeader}>
          <h1 className={styles.h1}>Blog</h1>
          <p className={styles.sub}>Latest posts from the CMS.</p>
        </header>

        <hr className={styles.hr} />

        <PostGrid posts={posts} />

        <div className={styles.after} />
      </article>
    </main>
  );
}