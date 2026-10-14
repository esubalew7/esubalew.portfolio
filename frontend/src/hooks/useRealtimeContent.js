import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useContentStore } from '../store/contentStore';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://127.0.0.1:5000'
    : 'https://portfolio-backend-gxhv.onrender.com');

/**
 * Custom React hook for real-time portfolio CMS synchronization.
 * - Joins the visitor/portfolio room on connect
 * - Automatically re-subscribes and refetches after network reconnection
 * - Listens for 'content_updated' and 'content:update' socket events
 */
export function useRealtimeContent() {
  const fetchContent = useContentStore((s) => s.fetchContent);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initial content fetch on component mount
    fetchContent();

    // Initialize Socket.IO connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // Join room function
    const joinRooms = () => {
      // Emits to join portfolio & visitor_room
      socket.emit('join:portfolio');
      socket.emit('join:visitor_room');
      console.log('[Socket] Joined visitor/portfolio room');
    };

    // Connection established
    socket.on('connect', () => {
      console.log(`[Socket] Connected: ${socket.id}`);
      joinRooms();
    });

    // Reconnection handler: re-subscribe and refetch content to catch up
    socket.io.on('reconnect', (attempt) => {
      console.log(`[Socket] Reconnected after ${attempt} attempts. Re-joining room & refetching content...`);
      joinRooms();
      fetchContent();
    });

    // Content update event listeners
    const handleContentUpdated = (payload) => {
      console.log('[Socket] content_updated event received:', payload);
      fetchContent();
    };

    socket.on('content_updated', handleContentUpdated);
    socket.on('content:update', handleContentUpdated);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket] Connection error:', error.message);
    });

    // Cleanup on unmount
    return () => {
      socket.off('content_updated', handleContentUpdated);
      socket.off('content:update', handleContentUpdated);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchContent]);

  return { socket: socketRef.current };
}

export default useRealtimeContent;
