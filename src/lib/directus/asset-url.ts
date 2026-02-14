type AssetUrlOptions = {
  key?: string;
};

function getDirectusBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? process.env.DIRECTUS_URL ?? '';
  return raw.replace(/\/+$/, '');
}

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
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

  const key = options?.key;

  // Local/static paths
  if (input.startsWith('/')) {
    return input;
  }

  // Full URL (directus assets or anything else)
  if (input.startsWith('http://') || input.startsWith('https://')) {
    if (!key) {
      return input;
    }

    try {
      const url = new URL(input);
      // Only rewrite if it is an /assets/* URL
      if (url.pathname.includes('/assets/')) {
        url.searchParams.set('key', key);
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
    if (key) {
      url.searchParams.set('key', key);
    }
    return url.toString();
  }

  return input;
}
