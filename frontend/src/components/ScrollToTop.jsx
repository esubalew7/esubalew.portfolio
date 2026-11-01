import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    let rafId = null;

    const updateVisibility = () => {
      const isVisible = window.scrollY > 500;
      setVisible(prev => (prev !== isVisible ? isVisible : prev));
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(updateVisibility);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateVisibility();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleScrollToTop = () => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          className="fixed scroll-to-top-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#080A0E] focus-visible:ring-offset-white"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
          transition={{ duration: prefersReducedMotion ? 0.05 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleScrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
          style={{
            position: 'fixed',
            zIndex: 500,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--orange)',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(255,77,0,0.3)',
            transition: 'box-shadow 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 4px 32px rgba(255,77,0,0.55)';
            if (!prefersReducedMotion) e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,77,0,0.3)';
            if (!prefersReducedMotion) e.currentTarget.style.transform = 'none';
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
