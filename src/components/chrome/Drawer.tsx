'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useFocusTrap } from './useFocusTrap';
import { TwitterIcon } from './icons/TwitterIcon';
import { RedditIcon } from './icons/RedditIcon';

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Drawer({ isOpen, onClose }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(drawerRef, isOpen);

  return (
    <>
      <div
        className={isOpen ? 'c-chrome-backdrop is-active' : 'c-chrome-backdrop'}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        id="chrome-drawer"
        ref={drawerRef}
        className={isOpen ? 'c-chrome-drawer is-open' : 'c-chrome-drawer'}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="c-chrome-drawer__top">
          <button
            type="button"
            className="c-chrome-drawer__closeX"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="c-chrome-drawer__section" aria-label="Primary navigation">
          <Link href="/" className="c-chrome-drawer__link" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" />
              <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" />
            </svg>
            HomePage
          </Link>

          <Link href="/topics" className="c-chrome-drawer__link" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" />
            </svg>
            Topics
          </Link>

          <a
            href="https://www.google.com"
            className="c-chrome-drawer__link c-chrome-drawer__link--lucky"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" />
              <path d="M12 17h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
            Are You Lucky?
          </a>

        </nav>

        <div className="c-chrome-drawer__divider" />

        <nav className="c-chrome-drawer__section c-chrome-drawer__section--legal" aria-label="Legal">
         <Link href="/pages/privacy" className="c-chrome-drawer__legalLink" onClick={onClose}>
  Privacy Policy
</Link>

<Link href="/pages/cookies" className="c-chrome-drawer__legalLink" onClick={onClose}>
  Cookie Policy
</Link>

<Link href="/pages/terms" className="c-chrome-drawer__legalLink" onClick={onClose}>
  Terms & Conditions
</Link>

          <Link href="/pages/about" className="c-chrome-drawer__legalLink" onClick={onClose}>
            About Me
          </Link>
          <Link href="/pages/contact" className="c-chrome-drawer__legalLink" onClick={onClose}>
            Contact
          </Link>
        </nav>

        <div className="c-chrome-drawer__divider" />

        <div className="c-chrome-drawer__social">
          <a
            href="https://twitter.com"
            className="c-chrome-socialBtn c-chrome-socialBtn--twitter"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <TwitterIcon />
          </a>

          <a
            href="https://reddit.com"
            className="c-chrome-socialBtn c-chrome-socialBtn--reddit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Reddit"
          >
            <RedditIcon />
          </a>
        </div>
      </div>
    </>
  );
}
