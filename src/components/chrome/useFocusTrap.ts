import { useEffect } from 'react';
import type { RefObject } from 'react';

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean,
) {
  useEffect(() => {
    if (!isActive) {
      return () => undefined;
    }

    const container = containerRef.current;
    if (!container) {
      return () => undefined;
    }

    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const getFocusable = () => (
      Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter(
        (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'),
      )
    );

    const focusables = getFocusable();
    const first = focusables[0];

    if (first) {
      first.focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        return;
      }

      const items = getFocusable();
      if (items.length === 0) {
        return;
      }

      const f = items[0];
      const l = items[items.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === f) {
          e.preventDefault();
          l.focus();
        }
      } else if (document.activeElement === l) {
        e.preventDefault();
        f.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isActive, containerRef]);
}
