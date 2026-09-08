/**
 * Cursor — orange dot + lagging ring, desktop only
 * Replaces the blue cursor with the new orange accent system.
 * All physics logic preserved from original useCursor hook.
 */
import { useEffect, useState, useCallback } from 'react';
import { useCursor } from '../../hooks/useCursor';
import { getInteractionState } from '../../utils/cursorInteractions';

function shouldDisable() {
  if (typeof window === 'undefined') return true;
  const isTouch     = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
  const isReduced   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile    = window.innerWidth < 768;
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

  useEffect(() => {
    document.body.classList.toggle('cursor-hidden', enabled);
    return () => document.body.classList.remove('cursor-hidden');
  }, [enabled]);

  const onMouseOver = useCallback(e => {
    const interaction = getInteractionState(e.target);
    if (interaction) setInteraction(interaction.state);
  }, [setInteraction]);

  const onMouseOut = useCallback(e => {
    const related = e.relatedTarget;
    if (!related || !related.closest) { resetInteraction(); return; }
    const i = getInteractionState(e.target);
    const ri = getInteractionState(related);
    if (i && (!ri || ri.state !== i.state)) resetInteraction();
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
      {/* Lagging ring */}
      <div
        ref={setRingRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          pointerEvents: 'none', zIndex: 9998, borderRadius: '50%',
          border: '1px solid rgba(255,77,0,0.35)',
          boxShadow: '0 0 8px rgba(255,77,0,0.1)',
          willChange: 'transform, width, height',
        }}
      />
      {/* Core dot */}
      <div
        ref={setCoreRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          pointerEvents: 'none', zIndex: 9999, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #FF6B3D, #FF4D00)',
          boxShadow: '0 0 8px rgba(255,77,0,0.6)',
          willChange: 'transform, width, height',
        }}
      />
      {children}
    </>
  );
}

export default Cursor;
