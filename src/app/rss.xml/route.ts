import { content } from '@/lib/content';

export const revalidate = 900;

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const siteTitle = 'YourBlog';
const siteDescription = 'A personal blog exploring Art, History, Literature, Music, Science, Screen, Sports, Technology, and True Crime - one story at a time.';

function absoluteUrl(path: string): string {
  return new URL(path, `${siteUrl}/`).toString();
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toCdata(value: string): string {
  return `<![CDATA[${value.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
}

export async function GET() {
  const { items } = await content.listPosts({ limit: 200 });
  const feedUrl = absoluteUrl('/rss.xml');
  const homeUrl = absoluteUrl('/');

  const itemsXml = items
    .map((post) => {
      const postUrl = absoluteUrl(`/blog/${post.slug}`);
      const title = escapeXml(post.title || 'Untitled');
      const description = toCdata(post.summary || '');
      const pubDate = new Date(post.dateIso || Date.now()).toUTCString();

      return [
        '<item>',
        `<title>${title}</title>`,
        `<link>${postUrl}</link>`,
        `<guid>${postUrl}</guid>`,
        `<pubDate>${pubDate}</pubDate>`,
        `<description>${description}</description>`,
        '</item>',
      ].join('');
    })
    .join('');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${escapeXml(siteTitle)}</title>`,
    `<link>${homeUrl}</link>`,
    `<description>${escapeXml(siteDescription)}</description>`,
    `<language>en-us</language>`,
    `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    itemsXml,
    '</channel>',
    '</rss>',
  ].join('');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
    },
  });
}
