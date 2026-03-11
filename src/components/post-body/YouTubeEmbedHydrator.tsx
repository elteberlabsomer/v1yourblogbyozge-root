"use client";

import { useEffect } from 'react';

let bindCount = 0;
let teardown: null | (() => void) = null;

function bindListener() {
  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const trigger = target?.closest?.('[data-yt-activate="true"]') as HTMLButtonElement | null;
    if (!trigger) {
      return;
    }

    event.preventDefault();

    const src = trigger.getAttribute('data-yt-src');
    if (!src) {
      return;
    }

    const title = trigger.getAttribute('data-yt-title') || 'YouTube video player';
    const wrapper = trigger.closest('.video-wrapper');
    if (!wrapper) {
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = title;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('frameborder', '0');

    wrapper.replaceChildren(iframe);
  };

  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}

export function YouTubeEmbedHydrator() {
  useEffect(() => {
    bindCount += 1;

    if (!teardown) {
      teardown = bindListener();
    }

    return () => {
      bindCount -= 1;
      if (bindCount <= 0 && teardown) {
        teardown();
        teardown = null;
        bindCount = 0;
      }
    };
  }, []);

  return null;
}
