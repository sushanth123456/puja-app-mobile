export function logInfo(message: string, data?: unknown) {
  // Centralized logging hook; replace with Sentry/Datadog in production.
  console.log(`[PujaConnect][INFO] ${message}`, data ?? '');
}

export function logError(message: string, error?: unknown) {
  console.error(`[PujaConnect][ERROR] ${message}`, error ?? '');
}
