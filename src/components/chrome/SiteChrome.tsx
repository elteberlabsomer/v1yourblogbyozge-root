'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { useChromeBehavior } from './useChromeBehavior';
import { Header } from './Header';
import { Drawer } from './Drawer';
import { SearchOverlay } from './SearchOverlay';
import { Footer } from './Footer';

type SiteChromeProps = {
  children: ReactNode;
};

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

      <Drawer isOpen={drawerOpen} onClose={closeDrawer} />

      <SearchOverlay isOpen={searchOpen} onClose={closeSearch} />

      <main id="main-content" className="c-chrome-main">
        {children}
      </main>

      {isReaderMode ? null : <Footer />}
    </>
  );
}
