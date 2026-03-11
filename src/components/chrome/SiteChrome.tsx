'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

import { useChromeBehavior } from './useChromeBehavior';
import { Header } from './Header';
import { Footer } from './Footer';

type SiteChromeProps = {
  children: ReactNode;
};

const LazyDrawer = dynamic(
  () => import('./Drawer').then((mod) => mod.Drawer),
  { ssr: false, loading: () => null },
);

const LazySearchOverlay = dynamic(
  () => import('./SearchOverlay').then((mod) => mod.SearchOverlay),
  { ssr: false, loading: () => null },
);

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const isReaderMode = /^\/blog\/[^\/]+$/.test(pathname ?? '');

  const {
    drawerOpen,
    searchOpen,
    headerHidden,
    toggleDrawer,
    openSearch,
    closeDrawer,
    closeSearch,
  } = useChromeBehavior();

  return (
    <>
      <a className="c-chrome-skipLink" href="#main-content">
        Skip to content
      </a>

      <Header
        isHidden={headerHidden}
        isMenuOpen={drawerOpen}
        onMenuToggle={toggleDrawer}
        onSearchClick={openSearch}
      />

      {drawerOpen ? <LazyDrawer isOpen={drawerOpen} onClose={closeDrawer} /> : null}

      {searchOpen ? <LazySearchOverlay isOpen={searchOpen} onClose={closeSearch} /> : null}

      <main id="main-content" className="c-chrome-main">
        {children}
      </main>

      {isReaderMode ? null : <Footer />}
    </>
  );
}
