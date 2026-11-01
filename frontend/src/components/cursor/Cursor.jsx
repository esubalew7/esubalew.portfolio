import { useEffect, useState, useCallback } from 'react';
import { useCursor } from '../../hooks/useCursor';
import { getInteractionState } from '../../utils/cursorInteractions';

function shouldDisable() {
  if (typeof window === 'undefined') return true;
  const isTouch   = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile  = window.innerWidth < 768;
  return isTouch || isMobile || isReduced;
}

export function Cursor({ children }) {
  const { setCoreRef, setRingRef, setInteraction, resetInteraction } = useCursor();
  const [enabled, setEnabled] = useState(() => !shouldDisable());

  useEffect(() => {
    const onResize = () => setEnabled(window.innerWidth >= 768 && !shouldDisable());
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onMouseOver = useCallback(e => {
    const target = e.target;
    if (!target) return;
    if (target.closest('input, textarea')) {
      setInteraction('text');
      return;
    }
    const explicit = getInteractionState(target);
    if (explicit) {
      setInteraction(explicit.state);
      return;
    }
    if (target.closest('a, button, [role="button"], select, [data-cursor], .interactive')) {
      setInteraction('hover');
    }
  }, [setInteraction]);

  const onMouseOut = useCallback(e => {
    const related = e.relatedTarget;
    if (!related || !related.closest) {
      resetInteraction();
      return;
    }
    const explicit = getInteractionState(e.target);
    const relatedExplicit = getInteractionState(related);
    if (explicit && (!relatedExplicit || relatedExplicit.state !== explicit.state)) {
      resetInteraction();
      return;
    }
    if (!related.closest('a, button, [role="button"], input, textarea, select, [data-cursor], .interactive')) {
      resetInteraction();
    }
  }, [resetInteraction]);

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout',  onMouseOut,  { passive: true });
    return () => {
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout',  onMouseOut);
    };
  }, [enabled, onMouseOver, onMouseOut]);

  if (!enabled) return <>{children}</>;

  return (
    <>
      {/* Lagging glowing ring follower */}
      <div
        ref={setRingRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          pointerEvents: 'none',
          zIndex: 99998,
          borderRadius: '50%',
          border: '1.5px solid rgba(255, 77, 0, 0.5)',
          background: 'rgba(255, 77, 0, 0.04)',
          boxShadow: '0 0 12px rgba(255, 77, 0, 0.25)',
          opacity: 0,
          transition: 'opacity 0.2s ease, border-color 0.2s ease, background 0.2s ease',
          willChange: 'transform',
        }}
      />
      {/* Core glowing accent dot */}
      <div
        ref={setCoreRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          pointerEvents: 'none',
          zIndex: 99999,
          borderRadius: '50%',
          background: '#FF4D00',
          boxShadow: '0 0 8px rgba(255, 77, 0, 0.8)',
          opacity: 0,
          transition: 'opacity 0.15s ease',
          willChange: 'transform',
        }}
      />
      {children}
    </>
  );
}

export default Cursor;
