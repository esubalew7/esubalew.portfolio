import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentStore } from '../../store/contentStore';
import { scrollToSectionById } from '../../utils/sectionNavigation';

/**
 * AvailabilityTicker Component
 * Displays real-time freelance availability read directly from the backend CMS (hero.available).
 * Features an emerald pulse dot, responsive microcopy, and direct CTA scroll.
 */
export const AvailabilityTicker = () => {
  const { content } = useContentStore();
  const [dismissed, setDismissed] = useState(false);

  const available = content?.hero?.available ?? true;
  const banner = content?.hero?.availabilityBanner || {};

  if (dismissed || banner.visible === false) return null;

  const handleContactClick = (e) => {
    const targetLink = banner.buttonLink || '#contact';
    if (targetLink.startsWith('#')) {
      e.preventDefault();
      scrollToSectionById(targetLink.replace('#', ''));
    }
  };

  const badgeText = available
    ? banner.badgeText || 'Available for freelance'
    : banner.bookedBadgeText || 'Currently booked';
  const subText = available
    ? banner.subText || 'Response time < 24h'
    : banner.bookedSubText || 'Accepting inquiries for next quarter';
  const buttonText = available
    ? banner.buttonText || 'Book a Call'
    : banner.bookedButtonText || 'Inquire';
  const buttonLink = banner.buttonLink || '#contact';

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Availability Status"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          width: '100%',
          zIndex: 1001,
          background: 'rgba(8, 10, 14, 0.75)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '6px 16px',
          overflow: 'hidden',
        }}
      >
        <div
          className="container-main"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {/* Status badge with pulse */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 8,
                height: 8,
              }}
            >
              {available && (
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    opacity: 0.75,
                    animation: 'pulsePing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }}
                />
              )}
              <span
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: available ? '#10b981' : '#f59e0b',
                  boxShadow: available ? '0 0 10px #10b981' : '0 0 10px #f59e0b',
                }}
              />
            </span>

            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.08em',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              <strong style={{ color: available ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                {badgeText}
              </strong>
              <span style={{ color: 'var(--border-subtle)', margin: '0 8px' }}>—</span>
              <span className="hidden-xs" style={{ color: 'var(--text-primary)' }}>
                {subText}
              </span>
            </span>
          </div>

          {/* Quick CTA + Close button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a
              href={buttonLink}
              onClick={handleContactClick}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--orange)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 2,
                border: '1px solid rgba(255, 77, 0, 0.25)',
                background: 'rgba(255, 77, 0, 0.05)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--orange)';
                e.currentTarget.style.background = 'rgba(255, 77, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 77, 0, 0.25)';
                e.currentTarget.style.background = 'rgba(255, 77, 0, 0.05)';
              }}
            >
              {buttonText}
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>

            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss availability banner"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <style>{`
          @keyframes pulsePing {
            0% { transform: scale(1); opacity: 0.8; }
            75%, 100% { transform: scale(2.6); opacity: 0; }
          }
          @media (max-width: 520px) {
            .hidden-xs { display: none !important; }
          }
        `}</style>
      </motion.aside>
    </AnimatePresence>
  );
};

export default AvailabilityTicker;
