const DEFAULT_TIMEOUT_MS = 10000;

export function getApiBaseUrl(): string {
  const value = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!value) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL. Configure it in your environment.');
  }
  const isHttps = /^https:\/\//i.test(value);
  const isLocalDev = /^http:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+):\d+/i.test(value);
  if (!isHttps && !isLocalDev) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must use HTTPS (except local dev URLs).');
  }
  return value.replace(/\/+$/, '');
}

export function getApiTimeoutMs(): number {
  const value = process.env.EXPO_PUBLIC_API_TIMEOUT_MS;
  if (!value) {
    return DEFAULT_TIMEOUT_MS;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}
