import React, { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export const AnimatedCounter = ({ from = 0, to = 0, duration = 1.5, delay = 0 }) => {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(to);
      return;
    }

    if (!inView) return;

    let startTime = null;
    let frameId;
    const numericTo = typeof to === 'number' ? to : parseFloat(to) || 0;
    const numericFrom = typeof from === 'number' ? from : parseFloat(from) || 0;

    const timeout = setTimeout(() => {
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        // Ease out expo curve
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(numericFrom + (numericTo - numericFrom) * ease);
        setCount(current);

        if (progress < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          setCount(numericTo);
        }
      };

      frameId = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [inView, from, to, duration, delay, shouldReduceMotion]);

  return <span ref={ref}>{shouldReduceMotion ? to : count}</span>;
};

export default AnimatedCounter;
