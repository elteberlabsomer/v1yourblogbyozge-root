import styles from './PostBody.module.css';
import { YouTubeEmbedHydrator } from './YouTubeEmbedHydrator';

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseAttr(source: string, name: string): string {
  const pattern = new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  return source.match(pattern)?.[2] ?? '';
}

function toLazyYouTubeEmbed(src: string, title: string): string | null {
  try {
    const normalized = src.startsWith('//') ? `https:${src}` : src;
    const original = new URL(normalized);
    const parts = original.pathname.split('/embed/');
    const videoId = parts[1]?.split(/[/?#]/)[0]?.trim();

    if (!videoId) {
      return null;
    }

    const params = new URLSearchParams(original.search);
    params.set('autoplay', '1');
    params.set('rel', '0');
    params.set('modestbranding', '1');

    const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
    const posterSrc = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const posterFallbackSrc = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
    const safeTitle = title || 'YouTube video player';
    const ariaLabel = title ? `Play video: ${title}` : 'Play YouTube video';

    return `
      <div class="video-wrapper video-wrapper--lazy" data-yt-wrapper="true">
        <button
          type="button"
          class="video-embed-trigger"
          data-yt-activate="true"
          data-yt-src="${escapeHtmlAttr(embedSrc)}"
          data-yt-title="${escapeHtmlAttr(safeTitle)}"
          aria-label="${escapeHtmlAttr(ariaLabel)}"
        >
          <img
            class="video-embed-poster"
            src="${escapeHtmlAttr(posterSrc)}"
            alt="${escapeHtmlAttr(safeTitle)}"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            onerror="this.onerror=null;this.src='${escapeHtmlAttr(posterFallbackSrc)}';"
          />
          <span class="video-embed-scrim" aria-hidden="true"></span>
          <span class="video-embed-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M8 6.5v11l9-5.5-9-5.5z"></path>
            </svg>
          </span>
          <span class="video-embed-text">Play video</span>
        </button>
      </div>
    `;
  } catch {
    return null;
  }
}

function wrapIframes(html: string): string {
  return html.replace(
    /<iframe\b([^>]*)\bsrc=(['"])([^'"]*(?:youtube(?:-nocookie)?\.com\/embed\/[^'"]+))\2([^>]*)><\/iframe>/gi,
    (match, before, _quote, src, after) => {
      const attrs = `${before} ${after}`;
      const title = parseAttr(attrs, 'title');
      return toLazyYouTubeEmbed(src, title) ?? match;
    }
  );
}

export function PostBody(props: { html: string }) {
  const processedHtml = wrapIframes(props.html);

  return (
    <>
      <div className={styles.content} dangerouslySetInnerHTML={{ __html: processedHtml }} />
      <YouTubeEmbedHydrator />
    </>
  );
}
