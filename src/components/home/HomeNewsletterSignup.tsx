'use client';

import { NewsletterSignup } from '../newsletter-signup/NewsletterSignup';

export function HomeNewsletterSignup() {
  async function handleSubmit(email: string) {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      throw new Error('Failed to subscribe.');
    }
  }

  return <NewsletterSignup onSubmit={handleSubmit} />;
}
