import type { ReactNode } from 'react';

import { Prose } from '@/components/prose/Prose';

import styles from './LegalPage.module.css';

type LegalPageProps = {
  title: string;
  updatedAtIso: string;
  children: ReactNode;
};

function formatUpdatedAt(dateIso: string): string {
  const date = new Date(dateIso);

  if (Number.isNaN(date.getTime())) return dateIso;

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function LegalPage({ title, updatedAtIso, children }: LegalPageProps) {
  const updatedAtLabel = formatUpdatedAt(updatedAtIso);

  return (
    <section className="l-section">
      <div className="l-container">
        <div className={`l-prose ${styles.root}`}>
          <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>

            <p className={styles.meta}>
              Last updated:{' '}
              <time dateTime={updatedAtIso} className={styles['meta-time']}>
                {updatedAtLabel}
              </time>
            </p>
          </header>

          <Prose>{children}</Prose>
        </div>
      </div>
    </section>
  );
}
