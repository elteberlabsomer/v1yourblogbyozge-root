'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';

import styles from './ContactCard.module.css';

type Status = 'idle' | 'sending' | 'success' | 'error';

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function ContactCard() {
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const consentId = useId();
  const websiteId = useId();

  const [status, setStatus] = useState<Status>('idle');
  const [errorText, setErrorText] = useState<string>('');

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [consent, setConsent] = useState<boolean>(false);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!normalizeEmail(email)) return false;
    if (!message.trim()) return false;
    if (!consent) return false;
    return status !== 'sending';
  }, [name, email, message, consent, status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatus('sending');
    setErrorText('');

    const payload = {
      name: name.trim(),
      email: normalizeEmail(email),
      message: message.trim(),
      consent,
      website: (e.currentTarget.elements.namedItem('website') as HTMLInputElement | null)?.value,
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || 'Request failed.');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      setConsent(false);
    } catch (err) {
      setStatus('error');
      setErrorText(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <section className={styles.root} aria-label="Contact">
      <div className={styles.card}>
        <div className={styles.lead}>
          <div className={styles.badge} aria-hidden="true">
            <svg viewBox="0 0 24 24" className={styles['badge-icon']}>
              <path
                d="M4 6h16v12H4V6zm0 0l8 7 8-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className={styles['lead-text']}>
            <h2 className={styles.title}>Contact</h2>
            <p className={styles.subtitle}>
              Send a message and we’ll get back to you by email.
            </p>

            <p className={styles.meta}>
              Or email directly:{' '}
              <a className={styles['meta-link']} href="mailto:gulemeyenosgeguler@gmail.com">
                gulemeyenosgeguler@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div className={styles.formcol}>
          {status === 'success' ? (
            <div className={styles.notice} role="status" aria-live="polite">
              <p className={styles['notice-title']}>Message sent.</p>
              <p className={styles['notice-text']}>Thanks — we’ll reply by email.</p>

              <button
                type="button"
                className={styles['notice-button']}
                onClick={() => setStatus('idle')}
              >
                Send another
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={onSubmit}>
              <div className={styles.honeypot}>
                <label className={styles.label} htmlFor={websiteId}>
                  Website
                </label>
                <input id={websiteId} name="website" className={styles.input} type="text" />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={nameId}>
                  Name
                </label>
                <input
                  id={nameId}
                  className={styles.input}
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={emailId}>
                  Email
                </label>
                <input
                  id={emailId}
                  className={styles.input}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={messageId}>
                  Message
                </label>
                <textarea
                  id={messageId}
                  className={styles.textarea}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                />
              </div>

              <div className={styles['consent-row']}>
                <input
                  id={consentId}
                  className={styles.checkbox}
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />

                <label className={styles['consent-text']} htmlFor={consentId}>
                  By submitting, you agree to our{' '}
                  <Link className={styles['consent-link']} href="/pages/terms">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link className={styles['consent-link']} href="/pages/privacy">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {status === 'error' ? (
                <p className={styles.error} role="alert">
                  {errorText}
                </p>
              ) : null}

              <button className={styles.button} type="submit" disabled={!canSubmit}>
                {status === 'sending' ? 'SENDING…' : 'SEND MESSAGE'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
