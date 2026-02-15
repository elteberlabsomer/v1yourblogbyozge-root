'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useFocusTrap } from './useFocusTrap';

type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SearchItem = {
  slug: string;
  title: string;
};

type ApiResponse = {
  items: SearchItem[];
  error?: string;
};

const MAX_RESULTS = 8;

function toPostHref(slug: string) {
  return `/blog/${slug}`;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useFocusTrap(overlayRef, isOpen);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeActiveIndex = useMemo(() => {
    if (!results.length) return 0;
    return Math.max(0, Math.min(activeIndex, results.length - 1));
  }, [activeIndex, results.length]);

  const resetLocalState = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;

    setQuery('');
    setActiveIndex(0);
    setResults([]);
    setIsLoading(false);
    setError(null);
  }, []);

  const closeAndReset = useCallback(() => {
    resetLocalState();
    onClose();
  }, [onClose, resetLocalState]);

  useEffect(() => {
    if (!isOpen) {
      resetLocalState();
      return;
    }

    const t = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(t);
  }, [isOpen, resetLocalState]);

  useEffect(() => {
    if (!isOpen) return;

    const q = query.trim();

    if (!q) {
      abortRef.current?.abort();
      abortRef.current = null;
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const debounced = window.setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/posts/search-index?q=${encodeURIComponent(q)}&limit=${MAX_RESULTS}` as const, {
          signal: ac.signal,
          cache: 'no-store',
        });

        const json = (await res.json()) as ApiResponse;

        if (!res.ok) {
          setResults([]);
          setError(json.error ?? 'Search request failed.');
          setIsLoading(false);
          return;
        }

        const next = Array.isArray(json.items) ? json.items : [];
        setResults(next.slice(0, MAX_RESULTS));
        setIsLoading(false);
        setActiveIndex(0);
      } catch (e) {
        if ((e as { name?: string }).name === 'AbortError') return;
        setResults([]);
        setError('Search request failed.');
        setIsLoading(false);
      }
    }, 200);

    return () => window.clearTimeout(debounced);
  }, [isOpen, query]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeAndReset();
        return;
      }

      if (!results.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }

      if (e.key === 'Enter') {
        const hit = results[safeActiveIndex];
        if (!hit) return;
        closeAndReset();
        router.push(toPostHref(hit.slug));
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeAndReset, isOpen, results, router, safeActiveIndex]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="c-chrome-backdrop is-active" onClick={closeAndReset} aria-hidden="true" />

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
          {isLoading ? <div className="c-chrome-search__empty">Loading...</div> : null}

          {!isLoading && error ? <div className="c-chrome-search__empty">{error}</div> : null}

          {!isLoading && !error && query.trim() && results.length === 0 ? (
            <div className="c-chrome-search__empty">No results</div>
          ) : null}

          {!isLoading && !error
            ? results.map((post, idx) => {
                const isActive = idx === safeActiveIndex;
                const itemClass = isActive ? 'c-chrome-search__item is-active' : 'c-chrome-search__item';

                return (
                  <Link
                    key={post.slug}
                    href={toPostHref(post.slug)}
                    className={itemClass}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={closeAndReset}
                  >
                    {post.title}
                  </Link>
                );
              })
            : null}
        </div>
      </div>
    </>,
    document.body,
  );
}
