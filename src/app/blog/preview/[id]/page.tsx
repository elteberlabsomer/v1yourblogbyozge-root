import { redirect } from 'next/navigation';
import { content } from '@/lib/content';
import { directusAssetUrl } from '@/lib/directus/asset-url';
import { PostHeader } from '@/components/post-header/PostHeader';
import { PostBody } from '@/components/post-body/PostBody';
import styles from '@/app/blog/[slug]/page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    preview?: string;
    token?: string;
    version?: string;
  }>;
};

export default async function PreviewPostPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { preview, token, version } = await searchParams;

  const post = await content.getPostById(id, { token, version });

  if (!post) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Post bulunamadı</h1>
        <p>ID: {id}</p>
      </main>
    );
  }

  if (preview !== 'true') {
    redirect(`/blog/${post.slug}`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourblogbyosge.com';
  const shareUrl = `${siteUrl}/blog/${post.slug}`;
  const coverImageId = post.cover?.src?.match(/\/assets\/([a-f0-9-]+)/)?.[1];
  const coverSrc = coverImageId ? directusAssetUrl(coverImageId) : (post.cover?.src ?? '');

  return (
    <main className={styles.main}>
      <article className={styles.article}>
        <PostHeader
          authorName={post.authorName}
          dateIso={post.dateIso}
          categoryLabel={post.topic?.label ?? 'Uncategorized'}
          topicSlug={post.topic?.slug ?? ''}
          title={post.title}
          summary={post.summary}
          coverSrc={coverSrc}
          coverAlt={post.cover?.alt ?? post.title}
          shareUrl={shareUrl}
          coverPriority
        />

        <PostBody html={post.body
          .map((block) => {
            if (block.kind === 'html') return block.html;
            if (block.kind === 'h2') return `<h2>${block.text}</h2>`;
            return `<p>${block.text}</p>`;
          })
          .join('')}
        />

        <footer className={styles.tagsRow} aria-label="Post tags">
          {(post.tags ?? []).map((tag) => (
            <a key={tag.slug} href={`/tags/${tag.slug}`} className={styles.tagLink}>
              #{tag.label}
            </a>
          ))}
        </footer>
      </article>
    </main>
  );
}
