import type { Metadata } from 'next';
import Link from 'next/link';
import { Prose } from '@/components/prose/Prose';
import { SocialMediaCard } from '@/components/social-media-card/SocialMediaCard';

import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About',
};

const AVATAR =
  'https://pbs.twimg.com/profile_images/1967148637877608448/sY1X17Wg_400x400.jpg';

export default function AboutPage() {
  return (
    <section className="l-section">
      <div className="l-container">
        <div className={`l-prose ${styles.root}`}>
          <header className={styles.header}>
            <h1 className={styles.title}>Hi, I’m Özge.</h1>
            <p className={styles.lead}>
              I write to make sense of ideas — and to share the ones worth keeping.
            </p>
          </header>

          <div className={styles.socialGrid} aria-label="Social media">
            <SocialMediaCard
              variant="twitter"
              href="https://twitter.com/gulemeyenoske"
              handle="@gulemeyenoske"
              subtitle="Follow me on Twitter"
              avatarSrc={AVATAR}
              avatarAlt="Profile"
              ctaLabel="Follow"
            />

            <SocialMediaCard
              variant="reddit"
              href="https://reddit.com/user/gulemeyenoske"
              handle="u/gulemeyenoske"
              subtitle="Join me on Reddit"
              avatarSrc={AVATAR}
              avatarAlt="Profile"
              ctaLabel="Follow"
            />
          </div>

          <Prose className={styles.prose}>
            <p>
              This blog is a curated archive of essays, notes, and experiments across culture,
              technology, and the human side of the internet. Sometimes it’s deep dives, sometimes
              it’s quick observations — but it’s always written with care.
            </p>

            <h2>What you’ll find here</h2>
            <ul>
              <li>Essays and reflections</li>
              <li>Research-backed notes (with sources when possible)</li>
              <li>Short “things I learned” posts</li>
              <li>Occasional tools, templates, and experiments</li>
            </ul>

            <h2>Contact</h2>
           <p>
  If you’d like to reach me, use the{' '}
  <Link href="/pages/contact">contact page</Link>
  {' '}or email:{' '}
  <a href="mailto:gulemeyenosgeguler@gmail.com">gulemeyenosgeguler@gmail.com</a>
</p>

          </Prose>
        </div>
      </div>
    </section>
  );
}
