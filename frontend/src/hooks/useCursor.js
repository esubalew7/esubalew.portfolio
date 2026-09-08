import { useCallback, useEffect, useRef } from 'react';

export function useCursor() {
  const coreRef = useRef(null);
  const ringRef = useRef(null);
  const setCoreRef = useCallback(node => { coreRef.current = node; }, []);
  const setRingRef = useCallback(node => { ringRef.current = node; }, []);
  const setInteraction = useCallback(state => {
    if (coreRef.current) coreRef.current.dataset.interaction = state;
    if (ringRef.current) ringRef.current.dataset.interaction = state;
  }, []);
  const resetInteraction = useCallback(() => setInteraction('default'), [setInteraction]);

  useEffect(() => {
    const move = event => {
      const x = `${event.clientX}px`;
      const y = `${event.clientY}px`;
      if (coreRef.current) coreRef.current.style.transform = `translate(${x}, ${y})`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${x}, ${y})`;
    };
    document.addEventListener('mousemove', move, { passive: true });
    return () => document.removeEventListener('mousemove', move);
  }, []);

  return { setCoreRef, setRingRef, setInteraction, resetInteraction };
}
