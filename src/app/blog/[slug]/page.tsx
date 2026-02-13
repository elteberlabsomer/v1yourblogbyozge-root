import { notFound } from "next/navigation";

import { getDemoAllSlugs, getDemoPostBySlug } from "@/lib/demo";
import { PostStreamReader } from "@/components/post-stream-reader/PostStreamReader";

import styles from "./page.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = getDemoAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getDemoPostBySlug(slug);

  if (!post) notFound();

  return (
    <main className={styles.main}>
      <PostStreamReader initialSlug={slug} />
    </main>
  );
}
