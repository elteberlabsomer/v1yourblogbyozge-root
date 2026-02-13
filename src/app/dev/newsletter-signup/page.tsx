'use client';

import { NewsletterSignup } from '../../../components/newsletter-signup/NewsletterSignup';

import styles from './page.module.css';

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), ms);
  });
}

export default function DevNewsletterSignupPage() {
  async function handleSubmit(email: string) {
    void email;
    await sleep(450);
  }

  return (
    <div className={styles.root}>
      <main className={styles.main}>
        <NewsletterSignup onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
