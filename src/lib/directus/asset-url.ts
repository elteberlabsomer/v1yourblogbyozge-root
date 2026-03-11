type AssetUrlOptions = {
  key?: string;  // Deprecated - use variant instead
  variant?: 'cover' | 'thumb' | 'square' | 'inline';
};

const DIRECTUS_TRANSFORMS = {
  cover: 'width=1200&quality=80&format=webp',
  thumb: 'width=400&height=300&fit=cover&quality=75&format=webp',
  square: 'width=600&height=600&fit=cover&quality=75&format=webp',
  inline: 'width=800&quality=80&format=webp',
} as const;

function getDirectusBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? process.env.DIRECTUS_URL ?? '';
  return raw.replace(/\/+$/, '');
}

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function applyTransform(url: URL, variant?: 'cover' | 'thumb' | 'square' | 'inline'): void {
  if (!variant) return;
  
  const transform = DIRECTUS_TRANSFORMS[variant];
  const params = new URLSearchParams(transform);
  
  // Remove old key parameter if exists
  url.searchParams.delete('key');
  
  // Apply new transform parameters
  params.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
}

/**
 * Accepts either:
 * - Directus file id (uuid)
 * - Directus /assets URL
 * - Any other URL/path (returned as-is)
 */
export function directusAssetUrl(input: string | null | undefined, options?: AssetUrlOptions): string {
  if (!input) {
    return '';
  }

  const { key, variant } = options || {};

  // Local/static paths
  if (input.startsWith('/')) {
    return input;
  }

  // Full URL (directus assets or anything else)
  if (input.startsWith('http://') || input.startsWith('https://')) {
    try {
      const url = new URL(input);
      // Only rewrite if it is an /assets/* URL
      if (url.pathname.includes('/assets/')) {
        if (variant) {
          applyTransform(url, variant);
        } else if (key) {
          // Fallback to old key system for backward compatibility
          url.searchParams.set('key', key);
        }
        return url.toString();
      }
      return input;
    } catch {
      return input;
    }
  }

  // Raw file id (uuid)
  if (looksLikeUuid(input)) {
    const base = getDirectusBaseUrl();
    if (!base) {
      return '';
    }

    const url = new URL(`${base}/assets/${input}`);
    if (variant) {
      applyTransform(url, variant);
    } else if (key) {
      // Fallback to old key system
      url.searchParams.set('key', key);
    }
    return url.toString();
  }

  return input;
}
