export function resolveImageSrc(input: string | null | undefined): string | null {
  if (!input) {
    return null;
  }

  const src = input.trim();
  if (!src) {
    return null;
  }

  if (/^https?:\/\//i.test(src)) {
    return src;
  }
  if (src.startsWith('/')) {
    return src;
  }

  return `/${src}`;
}

export function isRemoteImage(src: string): boolean {
  return /^https?:\/\//i.test(src);
}
