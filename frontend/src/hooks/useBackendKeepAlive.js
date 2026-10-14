import { useEffect, useRef } from 'react';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://127.0.0.1:5000'
    : 'https://portfolio-backend-gxhv.onrender.com');

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes (keeps Render free tier awake)

export function useBackendKeepAlive() {
  const lastPingRef = useRef(Date.now());

  useEffect(() => {
    let timerId = null;

    const pingBackend = async () => {
      try {
        const url = `${API_BASE_URL.replace(/\/$/, '')}/api/health`;
        await fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-store',
        });
        lastPingRef.current = Date.now();
      } catch (error) {
        // Silently swallow keep-alive failures
        console.debug('[KeepAlive] Ping failed:', error?.message || error);
      }
    };

    // Initial wake-up ping on mount
    pingBackend();

    // Schedule keep-alive ping every 14 minutes
    timerId = setInterval(pingBackend, PING_INTERVAL_MS);

    // If tab was hidden/suspended and becomes visible after 14+ min, ping immediately
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastPingRef.current;
        if (elapsed >= PING_INTERVAL_MS) {
          pingBackend();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerId) clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}

export default useBackendKeepAlive;
