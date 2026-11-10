/**
 * Returns a normalised http(s) URL, or '' if the value is empty or uses any other
 * scheme (e.g. javascript:). Everything that ends up in an href goes through this.
 */
export function toSafeUrl(value) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}
