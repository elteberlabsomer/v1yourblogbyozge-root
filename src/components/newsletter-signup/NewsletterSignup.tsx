'use client';

import type { FormEvent } from 'react';
import { useId, useState } from 'react';
import Link from 'next/link';

import styles from './NewsletterSignup.module.css';

type NewsletterSignupStatus = 'idle' | 'submitting' | 'success';

export type NewsletterSignupProps = {
  onSubmit: (email: string) => Promise<void>;
};

type MailIconProps = {
  className?: string;
};

function MailIcon({ className }: MailIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4.2-8 4.8-8-4.8V6l8 4.8L20 6v2.2Z" />
    </svg>
  );
}

export function NewsletterSignup({ onSubmit }: NewsletterSignupProps) {
  const emailId = useId();
  const consentId = useId();

  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<NewsletterSignupStatus>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== 'idle') return;

    setStatus('submitting');

    try {
      await onSubmit(email.trim());
      setStatus('success');
    } catch {
      setStatus('idle');
    }
  }

  return (
    <section className={styles.card} aria-label="Newsletter signup">
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.lead}>
            <div className={styles.badge} aria-hidden="true">
              <MailIcon className={styles.badgeIcon} />
            </div>

            <div className={styles.leadText}>
              <h2 className={styles.title}>Let’s Stay In Touch</h2>
              <p className={styles.subtitle}>
                Thoughtful stories to explore and get inspired — a fresh perspective, every week.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          {status === 'success' ? (
            <p className={styles.success} aria-live="polite">
              Thanks, you’re on the list.
            </p>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className="u-sr-only" htmlFor={emailId}>
                  Email address
                </label>

                <input
                  id={emailId}
                  className={styles.input}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="Your email address.."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button className={styles.button} type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
              </button>

              <div className={styles.privacy}>
                <input
                  id={consentId}
                  className={styles.checkbox}
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />

                <label className={styles.privacyLabel} htmlFor={consentId}>
                  By submitting, you agree to our{' '}
                  <Link className={styles.privacyLink} href="/pages/terms">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link className={styles.privacyLink} href="/pages/privacy">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
