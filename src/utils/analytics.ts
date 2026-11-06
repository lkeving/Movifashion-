import { authFetch, getSessionId } from './api';

export interface AnalyticsEvent {
  eventType: 'page_view' | 'view_product' | 'add_to_cart' | 'initiate_checkout' | 'compra' | 'search' | 'consulta_asistente' | 'filter_change';
  productId?: string;
  category?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

const eventQueue: AnalyticsEvent[] = [];
let flushTimeout: any = null;

async function flushQueue() {
  if (eventQueue.length === 0) return;
  const batch = [...eventQueue];
  eventQueue.length = 0;

  try {
    await authFetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: getSessionId(),
        events: batch,
      }),
    });
  } catch (err) {
    // Silently handle event tracking errors to never interrupt user shopping experience
    console.debug('[ANALYTICS] Buffer flush error:', err);
  }
}

export function trackEvent(
  eventType: AnalyticsEvent['eventType'],
  data: { productId?: string; category?: string; metadata?: Record<string, any> } = {}
) {
  eventQueue.push({
    eventType,
    productId: data.productId,
    category: data.category,
    metadata: data.metadata,
    timestamp: new Date().toISOString(),
  });

  if (flushTimeout) clearTimeout(flushTimeout);
  if (eventQueue.length >= 5) {
    flushQueue();
  } else {
    flushTimeout = setTimeout(flushQueue, 2000);
  }
}
