import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { content } from '@/lib/content';
import { PostStreamReader } from '@/components/post-stream-reader/PostStreamReader';
import styles from './page.module.css';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await content.getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Not found',
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const canonicalUrl = `/blog/${post.slug}`;
  const imageUrl = post.cover?.src ? new URL(post.cover.src, siteUrl).toString() : '';

  return {
    title: post.title,
    description: post.summary || undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: post.title,
      description: post.summary || undefined,
      images: imageUrl ? [{ url: imageUrl, alt: post.cover?.alt || post.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary || undefined,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export async function generateStaticParams() {
  try {
    const slugs = await content.listAllSlugs();
    return slugs.map((slug: string) => ({ slug }));
  } catch (error) {
    console.warn('Could not fetch slugs at build time; falling back to on-demand rendering.', error);
    return [];
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await content.getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const allPostsResult = await content.listPosts({ limit: 100 });
  const allPosts = allPostsResult?.items?.length ? allPostsResult.items : [post];

  return (
    <main className={styles.main}>
      <PostStreamReader initialSlug={slug} serverPosts={allPosts} />
    </main>
  );
}