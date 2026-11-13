export type KdtTrackEventName =
  | 'page_view'
  | 'click_quote_cta'
  | 'open_estimator'
  | 'apply_estimator_config'
  | 'click_zalo'
  | 'submit_lead_success';

export interface FunnelMetrics {
  page_view: number;
  click_quote_cta: number;
  open_estimator: number;
  apply_estimator_config: number;
  click_zalo: number;
  submit_lead_success: number;
  lastUpdatedAt: string;
}

const METRICS_STORAGE_KEY = 'kdt89_funnel_metrics';

const DEFAULT_METRICS: FunnelMetrics = {
  page_view: 0,
  click_quote_cta: 0,
  open_estimator: 0,
  apply_estimator_config: 0,
  click_zalo: 0,
  submit_lead_success: 0,
  lastUpdatedAt: '',
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function getFunnelMetrics(): FunnelMetrics {
  if (typeof window === 'undefined') return { ...DEFAULT_METRICS };
  try {
    const raw = localStorage.getItem(METRICS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_METRICS };
    return { ...DEFAULT_METRICS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_METRICS };
  }
}

export function resetFunnelMetrics(): FunnelMetrics {
  const empty = { ...DEFAULT_METRICS, lastUpdatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(empty));
  } catch {
    // ignore storage errors
  }
  return empty;
}

export function trackEvent(
  eventName: KdtTrackEventName,
  params: Record<string, string | number | boolean | undefined> = {}
): void {
  if (typeof window === 'undefined') return;

  const cleanParams: Record<string, string | number | boolean> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) cleanParams[k] = v;
  });

  // 1. Update local funnel metrics for Admin reporting
  try {
    const current = getFunnelMetrics();
    current[eventName] = (current[eventName] || 0) + 1;
    current.lastUpdatedAt = new Date().toISOString();
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // ignore storage errors
  }

  // 2. Push to Google Tag Manager dataLayer
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: `kdt89_${eventName}`,
      event_category: 'kdt89_funnel',
      ...cleanParams,
    });
  } catch {
    // ignore
  }

  // 3. Dispatch to Google Analytics 4 / Google Ads gtag if installed
  try {
    if (typeof window.gtag === 'function') {
      const gaName =
        eventName === 'submit_lead_success'
          ? 'generate_lead'
          : eventName === 'page_view'
          ? 'page_view'
          : `kdt89_${eventName}`;
      window.gtag('event', gaName, cleanParams);
    }
  } catch {
    // ignore
  }

  // 4. Dispatch to Meta Pixel (Facebook Ads) if installed
  try {
    if (typeof window.fbq === 'function') {
      if (eventName === 'page_view') {
        window.fbq('track', 'PageView', cleanParams);
      } else if (eventName === 'submit_lead_success') {
        window.fbq('track', 'Lead', cleanParams);
      } else if (eventName === 'click_zalo') {
        window.fbq('track', 'Contact', cleanParams);
      } else {
        window.fbq('trackCustom', `KDT89_${eventName}`, cleanParams);
      }
    }
  } catch {
    // ignore
  }
}
