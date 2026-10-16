import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';

/**
 * useVisitorTracking
 * Tracks page visits to the backend analytics system.
 * Deduplicates calls across React StrictMode remounts and session navigation.
 */
export function useVisitorTracking() {
  const location = useLocation();
  const trackedPagesRef = useRef(new Set());

  useEffect(() => {
    const pagePath = location.pathname || window.location.pathname || '/';
    
    // Avoid double tracking in React StrictMode
    if (trackedPagesRef.current.has(pagePath)) return;
    trackedPagesRef.current.add(pagePath);

    // Track visit
    api.post('/api/analytics/visit', { page: pagePath }).catch((err) => {
      // Gracefully swallow analytics errors to avoid impacting user experience
      console.debug('[Analytics] Visit tracking failed:', err.message);
    });
  }, [location.pathname]);
}

/**
 * useTrackSection
 * Tracks entry into high-value portfolio sections (e.g., projects, contact).
 * Deduplicates per session to avoid repeated network calls on scroll.
 */
export function useTrackSection(sectionName) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!sectionName || hasTrackedRef.current) return;

    const storageKey = `tracked_sec_${sectionName}`;
    try {
      if (sessionStorage.getItem(storageKey)) {
        hasTrackedRef.current = true;
        return;
      }
    } catch {
      // sessionStorage not accessible in some iframe/restricted modes
    }

    hasTrackedRef.current = true;
    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch {
      // ignore
    }

    api.post('/api/analytics/visit', { page: `/#${sectionName}` }).catch((err) => {
      console.debug(`[Analytics] Section tracking failed for ${sectionName}:`, err.message);
    });
  }, [sectionName]);
}
