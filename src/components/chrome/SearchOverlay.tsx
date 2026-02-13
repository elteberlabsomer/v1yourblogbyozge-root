'use client';

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useFocusTrap } from './useFocusTrap';
import { DEMO_POSTS } from '@/lib/demo/demoPosts';

type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MAX_RESULTS = 8;

function toPostHref(slug: string) {
  return `/blog/${slug}`;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(overlayRef, isOpen);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [];
    }

    return DEMO_POSTS
      .filter((post) => post.title.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
  }, [query]);

  const safeActiveIndex = results.length === 0
    ? 0
    : Math.min(activeIndex, results.length - 1);

  const resetLocal = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
  }, []);

  const closeAndReset = useCallback(() => {
    resetLocal();
    onClose();
  }, [resetLocal, onClose]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeAndReset();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (results.length > 0) {
          setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (results.length > 0) {
          setActiveIndex((prev) => Math.max(prev - 1, 0));
        }
      } else if (e.key === 'Enter') {
        const item = results[safeActiveIndex];
        if (item) {
          e.preventDefault();
          closeAndReset();
          router.push(toPostHref(item.slug));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isOpen,
    results,
    safeActiveIndex,
    closeAndReset,
    router,
  ]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="c-chrome-backdrop is-active"
        onClick={closeAndReset}
        aria-hidden="true"
      />

      <div
        ref={overlayRef}
        className="c-chrome-search"
        role="dialog"
        aria-modal="true"
        aria-label="Search posts"
      >
        <input
          ref={inputRef}
          type="search"
          className="c-chrome-search__input"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
        />

        <div className="c-chrome-search__results">
          {query.trim() && results.length === 0 && (
            <div className="c-chrome-search__empty">No results</div>
          )}

          {results.map((post, idx) => {
            const isActive = idx === safeActiveIndex;
            const itemClass = isActive
              ? 'c-chrome-search__item is-active'
              : 'c-chrome-search__item';

            return (
              <Link
                key={post.slug}
                href={toPostHref(post.slug)}
                className={itemClass}
                onClick={closeAndReset}
              >
                {post.title}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
