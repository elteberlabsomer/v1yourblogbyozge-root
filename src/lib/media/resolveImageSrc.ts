type ImageVariant = 'cover' | 'thumb' | 'inline';

const DIRECTUS_TRANSFORMS: Record<ImageVariant, Record<string, string>> = {
  cover: {
    width: '1200',
    quality: '80',
    format: 'webp',
  },
  thumb: {
    width: '400',
    height: '300',
    fit: 'cover',
    quality: '75',
    format: 'webp',
  },
  inline: {
    width: '800',
    quality: '80',
    format: 'webp',
  },
};

function getPublicDirectusBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? '';
  return raw.replace(/\/+$/, '');
}

function looksLikeAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function looksLikeDirectusAssetPath(value: string): boolean {
  return /\/assets\/[a-f0-9-]+/i.test(value);
}

function applyDirectusTransform(url: URL, variant: ImageVariant): void {
  const transform = DIRECTUS_TRANSFORMS[variant];

  url.searchParams.delete('key');
  url.searchParams.delete('width');
  url.searchParams.delete('height');
  url.searchParams.delete('fit');
  url.searchParams.delete('quality');
  url.searchParams.delete('format');

  Object.entries(transform).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
}

export function resolveImageSrc(
  input: string | null | undefined,
  variant: ImageVariant = 'cover',
): string | null {
  if (!input) {
    return null;
  }

  const src = input.trim();
  if (!src) {
    return null;
  }

  if (looksLikeAbsoluteUrl(src)) {
    try {
      const url = new URL(src);

      if (looksLikeDirectusAssetPath(url.pathname)) {
        applyDirectusTransform(url, variant);
        return url.toString();
      }

      return src;
    } catch {
      return src;
    }
  }

  if (src.startsWith('/assets/')) {
    const base = getPublicDirectusBaseUrl();

    if (!base) {
      return src;
    }

    try {
      const url = new URL(src, `${base}/`);
      applyDirectusTransform(url, variant);
      return url.toString();
    } catch {
      return src;
    }
  }

  if (src.startsWith('/')) {
    return src;
  }

  return `/${src}`;
}

export function isRemoteImage(src: string): boolean {
  return /^https?:\/\//i.test(src);
}