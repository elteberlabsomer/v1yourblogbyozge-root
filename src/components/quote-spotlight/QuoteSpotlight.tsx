'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { QuoteSpotlightItem } from '@/lib/quoteSpotlightItems';
import { QUOTE_SPOTLIGHT_ITEMS } from '@/lib/quoteSpotlightItems';

import styles from './QuoteSpotlight.module.css';

type QuoteSpotlightProps = {
  items?: readonly QuoteSpotlightItem[];
};

const ROTATION_MS = 2 * 60 * 60 * 1000;

function getActiveIndex(length: number, now: number) {
  if (length <= 1) {
    return 0;
  }

  return Math.floor(now / ROTATION_MS) % length;
}

export function QuoteSpotlight({ items = QUOTE_SPOTLIGHT_ITEMS }: QuoteSpotlightProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let timeoutId: number | null = null;

    const updateActiveIndex = () => {
      setActiveIndex(getActiveIndex(items.length, Date.now()));
    };

    const scheduleNextRotation = () => {
      const now = Date.now();
      const msUntilNextRotation = ROTATION_MS - (now % ROTATION_MS);

      timeoutId = window.setTimeout(() => {
        updateActiveIndex();
        scheduleNextRotation();
      }, msUntilNextRotation + 250);
    };

    updateActiveIndex();
    scheduleNextRotation();

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [items]);

  const item = items[activeIndex] ?? items[0] ?? null;

  if (!item) {
    return null;
  }

  const ctaLabel = item.ctaLabel ?? 'Learn Why and How';

  return (
    <section className={styles.banner} aria-label="Quote spotlight">
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.quoteText}>{item.quoteText}</p>

          <div className={styles.footer}>
            <Link className={styles.cta} href={item.href}>
              <span className={styles.ctaLabel}>{ctaLabel}</span>
              <span className={styles.ctaIcon} aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}