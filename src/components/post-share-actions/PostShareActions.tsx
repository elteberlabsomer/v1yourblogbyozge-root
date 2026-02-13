'use client';

import styles from './PostShareActions.module.css';

type PostShareActionsProps = {
  url: string;
  title: string;
};

function openShareWindow(shareUrl: string) {
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
}

export function PostShareActions({ url, title }: PostShareActionsProps) {
  function onTwitter() {
    const shareUrl = `https://twitter.com/intent/tweet?url=${
      encodeURIComponent(url)
    }&text=${
      encodeURIComponent(title)}`;
    openShareWindow(shareUrl);
  }

  function onFacebook() {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    openShareWindow(shareUrl);
  }

  function onReddit() {
    const shareUrl = `https://www.reddit.com/submit?url=${
      encodeURIComponent(url)
    }&title=${
      encodeURIComponent(title)}`;
    openShareWindow(shareUrl);
  }

  return (
    <div className={styles.shareButtons} aria-label="Share">
      <button
        type="button"
        className={`${styles.shareBtn} ${styles.twitter}`}
        onClick={onTwitter}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
        </svg>
        Twitter
      </button>

      <button
        type="button"
        className={`${styles.shareBtn} ${styles.facebook}`}
        onClick={onFacebook}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
        Facebook
      </button>

      <button
        type="button"
        className={`${styles.shareBtn} ${styles.reddit}`}
        onClick={onReddit}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="10" r="1"></circle>
          <circle cx="15" cy="10" r="1"></circle>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.5 10c.17 0 .33-.01.5-.02.01.34.02.67.02 1.02 0 4.41-3.59 8-8 8z"></path>
        </svg>
        Reddit
      </button>
    </div>
  );
}