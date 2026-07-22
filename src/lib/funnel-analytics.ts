export type FunnelEvent = "page_view" | "quote_start" | "quote_submit" | "book_click";

/**
 * Safely tracks conversion funnel events for Meta Pixel, Google Analytics (gtag),
 * and Google Tag Manager (dataLayer) without blocking UI or adding heavy scripts.
 */
export function trackFunnelEvent(event: FunnelEvent, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  try {
    // 1. Google Analytics / Tag Manager
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", event, data);
    }
    if (Array.isArray((window as any).dataLayer)) {
      (window as any).dataLayer.push({ event, ...data });
    }

    // 2. Meta Pixel (fbq)
    if (typeof (window as any).fbq === "function") {
      const metaEventMap: Record<FunnelEvent, string> = {
        page_view: "PageView",
        quote_start: "InitiateCheckout",
        quote_submit: "Lead",
        book_click: "Schedule",
      };
      (window as any).fbq("trackCustom", event, data);
      if (metaEventMap[event]) {
        (window as any).fbq("track", metaEventMap[event], data);
      }
    }
  } catch {
    // Ignore errors silently to avoid affecting runtime UI
  }
}
