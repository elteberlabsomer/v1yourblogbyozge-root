import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';

import { getDemoAllSlugs, getDemoCanonicalSlugForLegacySlug, getDemoPostBySlug } from '@/lib/demo';
import { PostStreamReader } from '@/components/post-stream-reader/PostStreamReader';

import styles from './page.module.css';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const canonical = getDemoCanonicalSlugForLegacySlug(slug);
  const effectiveSlug = canonical ?? slug;

  const post = getDemoPostBySlug(effectiveSlug);
  if (!post) {
    return {
      title: 'Not found',
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const canonicalUrl = `/blog/${post.slug}`;
  const imageUrl = new URL(post.coverSrc, siteUrl).toString();

  return {
    title: post.title,
    description: post.summary || undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: post.title,
      description: post.summary || undefined,
      images: [{ url: imageUrl, alt: post.coverAlt || post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary || undefined,
      images: [imageUrl],
    },
  };
}

export async function generateStaticParams() {
  const slugs = getDemoAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getDemoPostBySlug(slug);

  if (!post) {
    const canonical = getDemoCanonicalSlugForLegacySlug(slug);
    if (canonical) {
      permanentRedirect(`/blog/${canonical}`);
    }
    notFound();
  }

  return (
    <main className={styles.main}>
      <PostStreamReader initialSlug={slug} />
    </main>
  );
}
