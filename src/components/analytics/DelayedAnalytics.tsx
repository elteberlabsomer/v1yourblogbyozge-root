'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

type DelayedAnalyticsProps = {
  gaId: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __ybAnalyticsEnabled?: boolean;
  }
}

const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
const FALLBACK_DELAY_MS = 6000;

export function DelayedAnalytics({ gaId }: DelayedAnalyticsProps) {
  const [enabled, setEnabled] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (window.__ybAnalyticsEnabled) {
      setEnabled(true);
      return undefined;
    }

    const enableAnalytics = () => {
      if (hasTriggeredRef.current) {
        return;
      }

      hasTriggeredRef.current = true;
      window.__ybAnalyticsEnabled = true;
      setEnabled(true);
      cleanup();
      window.clearTimeout(timerId);
    };

    const cleanup = () => {
      INTERACTION_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, enableAnalytics);
      });
    };

    INTERACTION_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, enableAnalytics, { passive: true });
    });

    const timerId = window.setTimeout(enableAnalytics, FALLBACK_DELAY_MS);

    return () => {
      cleanup();
      window.clearTimeout(timerId);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <Script
        id="ga-lib"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            transport_type: 'beacon'
          });
        `}
      </Script>
    </>
  );
}
