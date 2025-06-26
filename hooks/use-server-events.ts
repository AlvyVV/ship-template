import { useEffect, useState } from 'react';

export interface ServerEvent {
  type: string;
  message?: string;
  timestamp?: string;
  [key: string]: any;
}

/**
 * 通用 SSE 订阅 Hook
 * @param url SSE 地址，如 "/api/events/stream"
 */
export function useServerEvents(url: string) {
  const [events, setEvents] = useState<ServerEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // EventSource 仅在浏览器环境可用
    if (typeof window === 'undefined') return;

    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log('[SSE] connection opened');
    };

    eventSource.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] event received:', data);
        setEvents(prev => [...prev, data]);
      } catch (err) {
        console.error('Failed to parse SSE data:', err);
      }
    };

    eventSource.onerror = err => {
      setIsConnected(false);
      setError('SSE connection error');
      console.error('[SSE] error:', err);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [url]);

  return { events, isConnected, error } as const;
}
