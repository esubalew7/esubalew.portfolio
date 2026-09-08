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
    if (coreRef.current) coreRef.current.dataset.interaction = state;
    if (ringRef.current) ringRef.current.dataset.interaction = state;
  }, []);

  const resetInteraction = useCallback(() => {
    setInteraction('default');
  }, [setInteraction]);

  useEffect(() => {
    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible.current) {
        isVisible.current = true;
        ringPos.current = { x: e.clientX, y: e.clientY };
        if (coreRef.current) coreRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }
      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const onMouseLeave = () => {
      isVisible.current = false;
      if (coreRef.current) coreRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    const onMouseEnter = () => {
      isVisible.current = true;
      if (coreRef.current) coreRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    const onMouseDown = () => {
      if (ringRef.current) {
        ringRef.current.style.transform += ' scale(0.85)';
      }
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    document.addEventListener('mouseenter', onMouseEnter, { passive: true });
    document.addEventListener('mousedown', onMouseDown, { passive: true });

    // Smooth RAF loop for the trailing ring
    const loop = () => {
      if (ringRef.current && isVisible.current) {
        const lerpFactor = 0.18;
        ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpFactor;
        ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpFactor;

        const isHover = interactionState.current === 'hover';
        const scale = isHover ? 1.5 : 1;

        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mousedown', onMouseDown);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return { setCoreRef, setRingRef, setInteraction, resetInteraction };
}

export default useCursor;
