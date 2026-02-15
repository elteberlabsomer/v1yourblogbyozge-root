import Link from 'next/link';
import { TwitterIcon } from './icons/TwitterIcon';
import { RedditIcon } from './icons/RedditIcon';

const TOPICS_COL1 = [
  { href: '/topics/art', label: 'Art' },
  { href: '/topics/history', label: 'History' },
  { href: '/topics/literature', label: 'Literature' },
  { href: '/topics/music', label: 'Music' },
  { href: '/topics/relationships', label: 'Relationships' },
];

const TOPICS_COL2 = [
  { href: '/topics/science', label: 'Science' },
  { href: '/topics/screen', label: 'Screen' },
  { href: '/topics/sports', label: 'Sports' },
  { href: '/topics/technology', label: 'Technology' },
  { href: '/topics/true-crime', label: 'True Crime' },
];

const LEGAL = [
  { href: '/pages/privacy', label: 'Privacy Policy' },
  { href: '/pages/cookies', label: 'Cookie Policy' },
  { href: '/pages/terms', label: 'Terms & Conditions' },
];

const PAGES = [
  { href: '/pages/about', label: 'About Me' },
  { href: '/pages/contact', label: 'Contact' },
];

export function Footer() {
  return (
    <footer className="c-chrome-footer" aria-label="Footer">
      <div className="c-chrome-footer__container">
        <div className="c-chrome-footer__grid">
          <div className="c-chrome-footer__brand">
            <div className="c-chrome-footer__logo">YourBlog</div>
            <p className="c-chrome-footer__desc">
              Stories that invite you to think, explore, and get inspired. A fresh perspective
              every day.
            </p>

            <div className="c-chrome-footer__social" aria-label="Social">
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

          <nav className="c-chrome-footer__column" aria-label="Topics 1">
            <div className="c-chrome-footer__title">Topics</div>
            {TOPICS_COL1.map((item) => (
              <Link key={item.href} href={item.href} className="c-chrome-footer__link">
                {item.label}
              </Link>
            ))}
          </nav>

          <nav className="c-chrome-footer__column" aria-label="Topics 2">
            <div
              className="c-chrome-footer__title c-chrome-footer__title--spacer"
              aria-hidden="true"
            >
              Topics
            </div>
            {TOPICS_COL2.map((item) => (
              <Link key={item.href} href={item.href} className="c-chrome-footer__link">
                {item.label}
              </Link>
            ))}
          </nav>

          <nav className="c-chrome-footer__column" aria-label="Legal and pages">
            <div className="c-chrome-footer__title">Legal</div>

            {LEGAL.map((item) => (
              <a
                key={item.href + item.label}
                href={item.href}
                className="c-chrome-footer__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </a>
            ))}

            <div className="c-chrome-footer__columnDivider" />

            {PAGES.map((item) => (
              <Link key={item.href} href={item.href} className="c-chrome-footer__link">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="c-chrome-footer__bottom">
          <p className="c-chrome-footer__copyright">© 2026 Blog. All rights reserved.</p>
          <div className="c-chrome-footer__bottomLinks">
            <a href="/sitemap.xml" className="c-chrome-footer__bottomLink">
              Sitemap
            </a>
            <a href="/rss.xml" className="c-chrome-footer__bottomLink">
              RSS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
