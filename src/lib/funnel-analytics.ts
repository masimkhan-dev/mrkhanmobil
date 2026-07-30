export type FunnelEvent = "page_view" | "quote_start" | "quote_submit" | "book_click";

/**
 * Checks if the user has given consent for analytics.
 * (No tracking cookies used on site).
 */
export function hasAnalyticsConsent(): boolean {
  return false;
}

/**
 * No-op analytics initializer (no tracking cookies used).
 */
export function initAnalytics() {
  // Tracking disabled — no analytics or marketing cookies used
}

/**
 * Funnel event tracker (no-op when tracking is disabled).
 */
export function trackFunnelEvent(event: FunnelEvent, data?: Record<string, unknown>) {
  // Tracking disabled — no analytics or marketing cookies used
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics Disabled]", event, data);
  }
}
