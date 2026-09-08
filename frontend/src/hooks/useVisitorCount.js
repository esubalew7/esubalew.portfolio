import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://portfolio-backend-gxhv.onrender.com');

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://portfolio-backend-gxhv.onrender.com');

/**
 * useVisitorCount Hook
 * Fetches today's visitor count from the backend analytics API,
 * records the visitor page impression, and listens for live Socket.IO
 * telemetry updates ('visitor:count_update').
 */
export function useVisitorCount() {
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch initial count from backend analytics route
    const fetchTodayCount = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/analytics/today`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && typeof json.count === 'number') {
            setCount(json.count);
          }
        }
      } catch (err) {
        console.warn('[useVisitorCount] Fallback count used:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // 2. Track this visit to telemetry once per session/mount
    const recordVisit = async () => {
      if (hasTrackedRef.current) return;
      hasTrackedRef.current = true;
      try {
        await fetch(`${API_BASE_URL}/api/analytics/visit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: window.location.pathname || '/' }),
        });
      } catch (err) {
        // Silently handle tracking error
      }
    };

    fetchTodayCount();
    recordVisit();

    // 3. Setup Socket.IO listener for live telemetry
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join:portfolio');
      socket.emit('join:visitor_room');
    });

    socket.on('visitor:count_update', (data) => {
      if (isMounted && data && typeof data.count === 'number') {
        setCount(data.count);
      }
    });

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return { count, loading };
}

export default useVisitorCount;
