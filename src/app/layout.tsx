import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import {
  DM_Sans as DMSans,
  Lora as LoraFont,
  Work_Sans as WorkSans,
} from 'next/font/google';
import './globals.css';

import { SiteChrome } from '@/components/chrome/SiteChrome';
import { DelayedAnalytics } from '@/components/analytics/DelayedAnalytics';

const dmSans = DMSans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const workSans = WorkSans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-work-sans',
  display: 'swap',
});

const lora = LoraFont({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? 'qYxBlupRk_F93sVcyZgfMec3M6gIt_d6GzTrQdZ0NiA';
const bingSiteVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'YourBlog',
    template: '%s · YourBlog',
  },
  description:
    'A personal blog exploring Art, History, Literature, Music, Science, Screen, Sports, Technology, and True Crime - one story at a time.',
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': `${siteUrl}/rss.xml`,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'YourBlog',
    url: '/',
    title: 'YourBlog',
    description:
      'A personal blog exploring Art, History, Literature, Music, Science, Screen, Sports, Technology, and True Crime - one story at a time.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YourBlog',
    description:
      'A personal blog exploring Art, History, Literature, Music, Science, Screen, Sports, Technology, and True Crime - one story at a time.',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: googleSiteVerification,
    ...(bingSiteVerification
      ? {
          other: {
            'msvalidate.01': bingSiteVerification,
          },
        }
      : {}),
  },
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${workSans.variable} ${lora.variable}`}
    >
      <body>
        <SiteChrome>{children}</SiteChrome>
        {gaId ? <DelayedAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}