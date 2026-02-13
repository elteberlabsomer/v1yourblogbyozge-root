'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

import type { QuoteSpotlightItem } from '../../lib/demo/quoteSpotlightItems';
import { QUOTE_SPOTLIGHT_ITEMS } from '../../lib/demo/quoteSpotlightItems';

import styles from './QuoteSpotlight.module.css';

type QuoteSpotlightProps = {
  items?: readonly QuoteSpotlightItem[];
};

type QuoteScale = 's1' | 's2' | 's3' | 's4';

function stableHash(input: string) {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

function pickStableIndex(seed: string, maxExclusive: number) {
  if (maxExclusive <= 1) {
    return 0;
  }
  return stableHash(seed) % maxExclusive;
}

function scaleClass(scale: QuoteScale) {
  if (scale === 's1') {
    return styles.scaleS1;
  }
  if (scale === 's2') {
    return styles.scaleS2;
  }
  if (scale === 's3') {
    return styles.scaleS3;
  }
  return styles.scaleS4;
}

export function QuoteSpotlight({ items = QUOTE_SPOTLIGHT_ITEMS }: QuoteSpotlightProps) {
  const seed = useId();

  const maxExclusive = items.length;
  const pickedIndex = pickStableIndex(seed, maxExclusive);
  const item = maxExclusive === 0 ? null : items[pickedIndex] ?? null;

  const [scale, setScale] = useState<QuoteScale>('s1');
  const [allowGrow, setAllowGrow] = useState(false);

  const quoteBoxRef = useRef<HTMLDivElement | null>(null);
  const quoteRef = useRef<HTMLQuoteElement | null>(null);

  useEffect(() => {
    if (!item) {
      return;
    }

    const box = quoteBoxRef.current;
    const quote = quoteRef.current;
    if (!box || !quote) {
      return;
    }

    const scales: QuoteScale[] = ['s1', 's2', 's3', 's4'];
    let frame = 0;

    const fit = () => {
      setAllowGrow(false);

      const tryFit = (i: number) => {
        const next = scales[i] ?? 's4';
        setScale(next);

        frame = window.requestAnimationFrame(() => {
          const boxH = box.clientHeight;
          const quoteH = quote.scrollHeight;

          const fits = quoteH <= boxH;
          if (fits) {
            return;
          }

          if (i < scales.length - 1) {
            tryFit(i + 1);
            return;
          }

          setAllowGrow(true);
        });
      };

      tryFit(0);
    };

    const ro = new ResizeObserver(() => fit());

    ro.observe(box);
    fit();

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      ro.disconnect();
    };
  }, [item]);

  if (!item) {
    return null;
  }

  const ctaLabel = item.ctaLabel ?? 'Why He Said It?';

  return (
    <section className={styles.banner} aria-label="Quote spotlight">
      <div
        className={[
          styles.content,
          scaleClass(scale),
          allowGrow ? styles.allowGrow : '',
        ].join(' ')}
      >
        <div className={styles.authorCol}>
          <div className={styles.avatarWrap}>
            <img className={styles.avatar} src={item.avatarSrc} alt={item.avatarAlt} />
          </div>
          <div className={styles.authorName}>{item.authorName}</div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.quoteBox} ref={quoteBoxRef}>
            <blockquote className={styles.quoteText} ref={quoteRef}>
              {item.quoteText}
            </blockquote>
          </div>

          <div className={styles.footer}>
            <Link className={styles.cta} href={item.whyHref}>
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
