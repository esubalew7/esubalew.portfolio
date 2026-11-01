import { useCallback, useEffect, useRef } from 'react';

export function useCursor() {
  const coreRef = useRef(null);
  const ringRef = useRef(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const isVisible = useRef(false);
  const interactionState = useRef('default');
  const animFrameId = useRef(null);

  const setCoreRef = useCallback(node => { coreRef.current = node; }, []);
  const setRingRef = useCallback(node => { ringRef.current = node; }, []);

  const setInteraction = useCallback(state => {
    interactionState.current = state;
    if (coreRef.current) {
      coreRef.current.dataset.interaction = state;
      if (state === 'text') coreRef.current.style.opacity = '0';
    }
    if (ringRef.current) {
      ringRef.current.dataset.interaction = state;
      if (state === 'text') ringRef.current.style.opacity = '0';
    }
  }, []);

  const resetInteraction = useCallback(() => {
    setInteraction('default');
    if (isVisible.current) {
      if (coreRef.current) coreRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
    }
  }, [setInteraction]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Guard against touch devices and reduced-motion preferences
    const isTouch = 'ontouchstart' in window ||
      (navigator.maxTouchPoints > 0) ||
      window.matchMedia('(pointer: coarse)').matches;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      if (coreRef.current) coreRef.current.style.display = 'none';
      if (ringRef.current) ringRef.current.style.display = 'none';
      return;
    }

    const startLoop = () => {
      if (!animFrameId.current && !document.hidden) {
        animFrameId.current = requestAnimationFrame(loop);
      }
    };

    const stopLoop = () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
    };

    const loop = () => {
      if (document.hidden) {
        stopLoop();
        return;
      }

      if (ringRef.current && isVisible.current) {
        const lerpFactor = 0.28;
        const dx = mousePos.current.x - ringPos.current.x;
        const dy = mousePos.current.y - ringPos.current.y;

        ringPos.current.x += dx * lerpFactor;
        ringPos.current.y += dy * lerpFactor;

        const isHover = interactionState.current === 'hover';
        const scale = isHover ? 1.5 : 1;

        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;

        // Pause loop when cursor has settled into idle position (< 0.1px delta)
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1 && !isHover) {
          ringPos.current.x = mousePos.current.x;
          ringPos.current.y = mousePos.current.y;
          animFrameId.current = null;
          return;
        }
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      const isText = interactionState.current === 'text';
      if (!isVisible.current) {
        isVisible.current = true;
        ringPos.current = { x: e.clientX, y: e.clientY };
        if (coreRef.current) coreRef.current.style.opacity = isText ? '0' : '1';
        if (ringRef.current) ringRef.current.style.opacity = isText ? '0' : '1';
      } else if (!isText) {
        if (coreRef.current && coreRef.current.style.opacity === '0') coreRef.current.style.opacity = '1';
        if (ringRef.current && ringRef.current.style.opacity === '0') ringRef.current.style.opacity = '1';
      }
      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      startLoop();
    };

    const onMouseLeave = () => {
      isVisible.current = false;
      if (coreRef.current) coreRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
      stopLoop();
    };

    const onMouseEnter = () => {
      isVisible.current = true;
      if (coreRef.current) coreRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
      startLoop();
    };

    const onMouseDown = () => {
      if (ringRef.current) {
        ringRef.current.style.transform += ' scale(0.85)';
      }
      startLoop();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      }
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    document.addEventListener('mouseenter', onMouseEnter, { passive: true });
    document.addEventListener('mousedown', onMouseDown, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      stopLoop();
    };
  }, []);

  return { setCoreRef, setRingRef, setInteraction, resetInteraction };
}

export default useCursor;
