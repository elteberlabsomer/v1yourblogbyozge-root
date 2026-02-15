'use client';

import { NewsletterSignup } from './NewsletterSignup';

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function NewsletterSignupDemo() {
  async function handleSubmit(email: string) {
    void email;
    await sleep(450);
  }

  return <NewsletterSignup onSubmit={handleSubmit} />;
}
