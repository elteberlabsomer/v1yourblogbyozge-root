import { SocialMediaCard } from '@/components/social-media-card/SocialMediaCard';

import styles from './page.module.css';

const AVATAR =
  'https://pbs.twimg.com/profile_images/1967148637877608448/sY1X17Wg_400x400.jpg';

export default function DevSocialMediaCardPage() {
  return (
    <div className={styles.root}>
      <div className={styles.grid}>
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
          href="https://reddit.com/u/gulemeyenoske"
          handle="u/gulemeyenoske"
          subtitle="Join me on Reddit"
          avatarSrc={AVATAR}
          avatarAlt="Profile"
          ctaLabel="Follow"
        />
      </div>
    </div>
  );
}
