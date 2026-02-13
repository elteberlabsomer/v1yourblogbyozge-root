import Link from 'next/link';
import { TwitterIcon } from './icons/TwitterIcon';
import { RedditIcon } from './icons/RedditIcon';

type HeaderProps = {
  isHidden: boolean;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onSearchClick: () => void;
};

export function Header({
  isHidden, isMenuOpen, onMenuToggle, onSearchClick,
}: HeaderProps) {
  return (
    <header className={isHidden ? 'c-chrome-header is-hidden' : 'c-chrome-header'}>
      <div className="c-chrome-header__container">
        <button
          type="button"
          className="c-chrome-hamburger"
          onClick={onMenuToggle}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="chrome-drawer"
        >
          <span className="c-chrome-hamburger__bar" />
          <span className="c-chrome-hamburger__bar" />
          <span className="c-chrome-hamburger__bar" />
        </button>

        <Link href="/" className="c-chrome-brand" aria-label="Home">
          <span className="c-chrome-brand__mark">YourBlog</span>
        </Link>

        <nav className="c-chrome-nav" aria-label="Primary navigation">
          <Link href="/" className="c-chrome-nav__link">
            HomePage
          </Link>
          <Link href="/topics" className="c-chrome-nav__link">
            Topics
          </Link>
          <a
            href="https://www.google.com"
            className="c-chrome-nav__link c-chrome-nav__link--lucky"
            target="_blank"
            rel="noopener noreferrer"
          >
            Are You Lucky?
          </a>

          <Link href="/pages/about" className="c-chrome-nav__link">
            About Me
          </Link>
        </nav>

        <div className="c-chrome-actions">
          <button type="button" className="c-chrome-searchTrigger" onClick={onSearchClick} aria-label="Search">
            <svg
              className="c-chrome-searchTrigger__icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="c-chrome-searchTrigger__label">Search</span>
          </button>

          <a
            href="https://x.com/gulemeyenoske"
            className="c-chrome-socialBtn c-chrome-socialBtn--twitter"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <TwitterIcon />
          </a>

          <a
            href="https://www.reddit.com/user/gulemeyenoske/"
            className="c-chrome-socialBtn c-chrome-socialBtn--reddit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Reddit"
          >
            <RedditIcon />
          </a>
        </div>
      </div>
    </header>
  );
}
