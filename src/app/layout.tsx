import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import {
  DM_Sans as DMSans,
  Lora as LoraFont,
  Work_Sans as WorkSans,
} from 'next/font/google';
import './globals.css';

import { SiteChrome } from '@/components/chrome/SiteChrome';

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

export const metadata: Metadata = {
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  ),
  title: {
    default: 'YourBlog',
    template: '%s · YourBlog',
  },
  description: 'Editorial blog demo built with Next.js.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'YourBlog',
    url: '/',
    title: 'YourBlog',
    description: 'Editorial blog demo built with Next.js.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YourBlog',
    description: 'Editorial blog demo built with Next.js.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${workSans.variable} ${lora.variable}`}
    >
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
