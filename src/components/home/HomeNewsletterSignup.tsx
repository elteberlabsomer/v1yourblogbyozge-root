"use client";

import { NewsletterSignup } from "../newsletter-signup/NewsletterSignup";

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), ms);
  });
}

export function HomeNewsletterSignup() {
  async function handleSubmit(email: string) {
    void email;
    await sleep(450);
  }

  return <NewsletterSignup onSubmit={handleSubmit} />;
}
