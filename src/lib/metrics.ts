import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

const METRICS_ENDPOINT = '/v1/metrics';
const BATCH_SIZE = 20;
const BATCH_TIMEOUT = 10000; // 10 seconds

interface MetricPayload {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  labels?: Record<string, string>;
}

interface BatchedMetrics {
  metrics: MetricPayload[];
  userAgent: string;
  url: string;
  timestamp: number;
}

let metricsBatch: MetricPayload[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

/**
 * Send metrics batch to backend
 */
async function flushMetricsBatch(): Promise<void> {
  if (metricsBatch.length === 0) return;

  const payload: BatchedMetrics = {
    metrics: [...metricsBatch],
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: Date.now(),
  };

  try {
    await fetch(METRICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.error('Failed to send metrics:', error);
  }

  metricsBatch = [];
}

/**
 * Schedule batch flush
 */
function scheduleBatchFlush(): void {
  if (batchTimeout) clearTimeout(batchTimeout);

  if (metricsBatch.length >= BATCH_SIZE) {
    flushMetricsBatch();
  } else {
    batchTimeout = setTimeout(flushMetricsBatch, BATCH_TIMEOUT);
  }
}

/**
 * Track a metric
 */
export const trackMetric = (
  name: string,
  value: number,
  unit: string = 'none',
  labels?: Record<string, string>
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Metric] ${name}: ${value}${unit}`);
  }

  metricsBatch.push({
    name,
    value,
    unit,
    timestamp: Date.now(),
    labels,
  });

  scheduleBatchFlush();
};

/**
 * Track page load timing
 */
export const trackPageLoadTiming = (): void => {
  if (!window.performance) return;

  const navigationTiming = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (navigationTiming) {
    trackMetric('page_load_duration_ms', navigationTiming.loadEventEnd - navigationTiming.fetchStart, 'ms');
    trackMetric('dom_interactive_time_ms', navigationTiming.domInteractive - navigationTiming.fetchStart, 'ms');
    trackMetric('dom_content_loaded_time_ms', navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart, 'ms');
    trackMetric('page_load_dns_ms', navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart, 'ms');
    trackMetric('page_load_tcp_ms', navigationTiming.connectEnd - navigationTiming.connectStart, 'ms');
    trackMetric('page_load_ttfb_ms', navigationTiming.responseStart - navigationTiming.fetchStart, 'ms');
  }
};

/**
 * Track resource timing (images, scripts, etc.)
 */
export const trackResourceTiming = (): void => {
  if (!window.performance) return;

  const resources = window.performance.getEntriesByType('resource');
  const durations: { [key: string]: number[] } = {};

  resources.forEach((resource: PerformanceEntry) => {
    const perfResource = resource as PerformanceResourceTiming;
    const type = resource.name.split('.').pop()?.toLowerCase() || 'unknown';

    if (!durations[type]) durations[type] = [];
    durations[type].push(perfResource.duration);
  });

  // Calculate averages
  Object.entries(durations).forEach(([type, times]) => {
    const avg = times.reduce((a, b) => a + b) / times.length;
    trackMetric(`resource_load_${type}_avg_ms`, Math.round(avg), 'ms', {
      resource_type: type,
      count: String(times.length),
    });
  });
};

/**
 * Track Web Vitals
 */
export const trackWebVitals = (): void => {
  // Largest Contentful Paint (LCP)
  onLCP((metric) => {
    trackMetric('web_vital_lcp', Math.round(metric.value), 'ms', {
      rating: metric.rating || 'unknown',
    });
  });

  // Cumulative Layout Shift (CLS)
  onCLS((metric) => {
    trackMetric('web_vital_cls', Math.round(metric.value * 1000) / 1000, 'unitless', {
      rating: metric.rating || 'unknown',
    });
  });

  // Interaction to Next Paint (INP) - replaces FID
  onINP((metric) => {
    trackMetric('web_vital_inp', Math.round(metric.value), 'ms', {
      rating: metric.rating || 'unknown',
    });
  });

  // First Contentful Paint (FCP)
  onFCP((metric) => {
    trackMetric('web_vital_fcp', Math.round(metric.value), 'ms', {
      rating: metric.rating || 'unknown',
    });
  });

  // Time to First Byte (TTFB)
  onTTFB((metric) => {
    trackMetric('web_vital_ttfb', Math.round(metric.value), 'ms', {
      rating: metric.rating || 'unknown',
    });
  });
};

/**
 * Track API latency
 */
export const trackAPILatency = (
  endpoint: string,
  method: string,
  duration: number,
  status: number
): void => {
  trackMetric('frontend_api_latency_ms', Math.round(duration), 'ms', {
    endpoint: endpoint.split('?')[0], // Remove query params
    method,
    status: String(status),
  });
};

/**
 * Track errors
 */
export const trackError = (
  message: string,
  stack?: string,
  context?: Record<string, string>
): void => {
  trackMetric('frontend_error_total', 1, 'count', {
    message: message.substring(0, 50),
    type: context?.type || 'unknown',
    ...context,
  });

  if (process.env.NODE_ENV === 'development' && stack) {
    console.error('[Frontend Error]', message, stack);
  }
};

/**
 * Track user actions
 */
export const trackUserAction = (
  action: string,
  duration?: number,
  metadata?: Record<string, string>
): void => {
  trackMetric(`user_action_${action}`, duration || 1, duration ? 'ms' : 'count', metadata);
};

/**
 * Setup global error tracking
 */
export const setupErrorTracking = (): void => {
  // Track uncaught errors
  window.addEventListener('error', (event) => {
    trackError(event.message, event.filename, {
      type: 'uncaught_error',
      line: String(event.lineno),
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackError(String(event.reason), undefined, {
      type: 'unhandled_rejection',
    });
  });
};

/**
 * Setup performance observers for newer metrics
 */
export const setupPerformanceObservers = (): void => {
  if (!window.PerformanceObserver) return;

  // Observe long tasks
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const perfEntry = entry as PerformanceLongTaskTiming;
        trackMetric('performance_long_task_ms', Math.round(perfEntry.duration), 'ms', {
          name: perfEntry.name.substring(0, 50),
        });
      }
    }).observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // Long task observation not supported
  }

  // Observe paint entries
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        trackMetric(
          `paint_${entry.name}`,
          Math.round(entry.startTime),
          'ms'
        );
      }
    }).observe({ entryTypes: ['paint'] });
  } catch (e) {
    // Paint observation not supported
  }
};

/**
 * Initialize all metrics tracking
 */
export const initializeMetrics = (): void => {
  // Setup error tracking
  setupErrorTracking();

  // Setup performance observers
  setupPerformanceObservers();

  // Track initial app load
  trackMetric('app_load', 1, 'count');

  // Track Web Vitals
  trackWebVitals();

  // Track page timing
  setTimeout(trackPageLoadTiming, 0);

  // Track resource timing
  setTimeout(trackResourceTiming, 1000);

  // Flush metrics on page unload
  window.addEventListener('beforeunload', () => {
    flushMetricsBatch();
  });
};

/**
 * Get current metrics batch (for testing)
 */
export const getMetricsBatch = (): MetricPayload[] => [...metricsBatch];

/**
 * Clear metrics batch (for testing)
 */
export const clearMetricsBatch = (): void => {
  metricsBatch = [];
  if (batchTimeout) clearTimeout(batchTimeout);
};
