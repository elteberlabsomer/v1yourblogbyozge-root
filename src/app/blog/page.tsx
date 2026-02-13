import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import styles from './page.module.css';

import { getDemoPostBySlug } from '@/lib/demo';
import { PostHeader } from '@/components/post-header/PostHeader';
import { PostBody } from '@/components/post-body/PostBody';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

type RouteParams = Promise<{ slug: string }>;

type BodyBlock = {
  kind: string;
  text: string;
};

function renderBody(body: unknown): ReactNode {
  if (!body) return null;

  if (Array.isArray(body)) {
    return body.map((b, idx) => {
      const block = b as Partial<BodyBlock>;

      const kind = String(block.kind || '');
      const text = String(block.text || '');

      if (!text) return null;

      if (kind === 'h2') return <h2 key={idx}>{text}</h2>;
      if (kind === 'h3') return <h3 key={idx}>{text}</h3>;

      return <p key={idx}>{text}</p>;
    });
  }

  if (typeof body === 'string') {
    return body
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((t, idx) => <p key={`${idx}-${t.slice(0, 24)}`}>{t}</p>);
  }

  return null;
}

export async function generateMetadata({ params }: { params: RouteParams }) {
  const { slug } = await params;

  const post = getDemoPostBySlug(slug);

  if (!post) return { title: 'Not found' };

  return {
    title: post.title,
    description: post.summary || undefined,
  };
}

export default async function BlogPostPage({ params }: { params: RouteParams }) {
  const { slug } = await params;

  const post = getDemoPostBySlug(slug);

  if (!post) notFound();

  const shareUrl = `${SITE_URL}/blog/${slug}`;

  return (
    <main className={styles.root}>
      <PostHeader
        authorName={post.authorName}
        dateIso={post.dateIso}
        categoryLabel={post.categoryLabel}
        topicSlug={post.topicSlug}
        title={post.title}
        summary={post.summary}
        coverSrc={post.coverSrc}
        coverAlt={post.coverAlt}
        shareUrl={shareUrl}
      />

      <PostBody>{renderBody(post.body)}</PostBody>
    </main>
  );
}
