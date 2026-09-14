export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;
  const ga = (window as Window & { gtag?: (command: string, eventName: string, params?: AnalyticsParams) => void }).gtag;
  if (typeof ga !== "function") return;
  ga("event", name, { ...params, page_path: window.location.pathname });
}
