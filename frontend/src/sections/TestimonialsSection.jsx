import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useContentStore } from '../store/contentStore';

// ─── Star rating component ──────────────────────────────────────────────────
function StarRating({ rating = 5 }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < rating ? '#FF4D00' : 'none'}
          stroke={i < rating ? '#FF4D00' : 'var(--border-default)'}
          strokeWidth={1.5}
          className="shrink-0"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ))}
    </div>
  );
}

// ─── Single Testimonial Card ───────────────────────────────────────────────
function TestimonialCard({ item, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const text = item.text || item.feedback || '';
  const isLong = text.length > 150;

  const platformColors = {
    upwork: { text: '#14A800', bg: 'rgba(20, 168, 0, 0.08)', border: 'rgba(20, 168, 0, 0.25)' },
    linkedin: { text: '#38BDF8', bg: 'rgba(56, 189, 248, 0.08)', border: 'rgba(56, 189, 248, 0.25)' },
    direct: { text: '#FF4D00', bg: 'rgba(255, 77, 0, 0.08)', border: 'rgba(255, 77, 0, 0.25)' },
    fiverr: { text: '#1DBF73', bg: 'rgba(29, 191, 115, 0.08)', border: 'rgba(29, 191, 115, 0.25)' },
  };

  const pKey = (item.platform || 'Direct').toLowerCase().trim();
  const badgeStyle = platformColors[pKey] || platformColors.direct;

  return (
    <div
      style={{
        flex: '0 0 min(100%, 380px)',
        scrollSnapAlign: 'start',
        background: 'var(--ink-raised, #0D1117)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
        borderRadius: 6,
        padding: 'clamp(1.5rem, 3vw, 2rem)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
      }}
      className="group hover:border-[var(--orange)]/30 hover:shadow-[0_12px_36px_rgba(0,0,0,0.4)]"
    >
      <div>
        {/* Top bar: Rating + Platform */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <StarRating rating={item.rating || 5} />

          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '3px 9px',
              borderRadius: 3,
              color: badgeStyle.text,
              background: badgeStyle.bg,
              border: `1px solid ${badgeStyle.border}`,
              fontWeight: 600,
            }}
          >
            {item.platform || 'Direct'}
          </span>
        </div>

        {/* Quote body */}
        <div className="relative">
          <p
            style={{
              color: 'var(--text-secondary, #94A3B8)',
              fontSize: 14,
              lineHeight: 1.7,
              display: '-webkit-box',
              WebkitLineClamp: isExpanded ? 'unset' : 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontStyle: 'normal',
            }}
          >
            "{text}"
          </p>

          {isLong && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.08em',
                color: 'var(--orange, #FF4D00)',
                textTransform: 'uppercase',
                marginTop: 6,
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontWeight: 600,
              }}
              className="hover:underline"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>

      {/* Footer: Client Info & Date */}
      <div
        style={{
          marginTop: '1.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-faint, rgba(255, 255, 255, 0.04))',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <h4
            style={{
              color: 'var(--text-primary, #F8FAFC)',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            {item.name || 'Anonymous Client'}
          </h4>
          {(item.role || item.company) && (
            <p
              style={{
                color: 'var(--text-muted, #64748B)',
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {[item.role, item.company].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {Boolean(item.date) && (
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              color: 'var(--text-muted, #64748B)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {item.date}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── TESTIMONIALS SECTION ──────────────────────────────────────────────────
export const TestimonialsSection = () => {
  const { content } = useContentStore();
  const scrollContainerRef = useRef(null);
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: '-60px' });

  // Extract testimonials from content store with fallback to ensure section is always visible
  const rawList = Array.isArray(content?.testimonials)
    ? content.testimonials
    : Array.isArray(content?.testimonials?.items)
    ? content.testimonials.items
    : [];

  const defaultTestimonials = [
    {
      name: 'Marcus Vance',
      role: 'Founder & CTO',
      company: 'Vance Media Labs',
      platform: 'Upwork',
      rating: 5,
      text: 'Esubalew delivered our full-stack MERN application with exceptional precision. His architectural decisions around WebSocket state streaming cut our server latency by 45%. Clear communicator, proactive, and one of the best engineers on Upwork.',
      date: 'August 2024',
      enabled: true,
    },
    {
      name: 'Anonymous Client',
      role: 'Product Lead',
      company: 'FinTech Enterprise',
      platform: 'Direct',
      rating: 5,
      text: 'Hired Esubalew for critical backend security and TOTP 2FA architecture. He shipped the complete production auth pipeline in 4 days with zero vulnerabilities and complete documentation. Highly recommended.',
      date: 'October 2024',
      enabled: true,
    },
    {
      name: 'Elena Rostova',
      role: 'Engineering Director',
      company: 'CloudScale SaaS',
      platform: 'LinkedIn',
      rating: 5,
      text: 'A rare engineer who masters high-throughput Node.js microservices as well as sleek, responsive frontend interfaces. He hit every milestone on schedule with production-grade code quality.',
      date: 'December 2024',
      enabled: true,
    },
  ];

  const candidateList = rawList.length > 0 ? rawList : defaultTestimonials;
  const testimonials = candidateList.filter((t) => t.enabled !== false);

  if (testimonials.length === 0) return null;

  const scrollBy = (offset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const eyebrowText = content?.testimonials?.eyebrow || 'Client Feedback';
  const mainHeading = content?.testimonials?.headingTitle || 'Trusted by clients.\nProven in production.';
  const headingParts = mainHeading.split('\n');

  return (
    <section
      id="testimonials"
      style={{
        background: 'var(--ink, #080A0E)',
        paddingTop: 'clamp(5rem, 9vw, 8rem)',
        paddingBottom: 'clamp(5rem, 9vw, 8rem)',
        borderTop: '1px solid var(--border-faint, rgba(255, 255, 255, 0.04))',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container-main">
        {/* Eyebrow */}
        <div className="section-eyebrow">{eyebrowText}</div>

        {/* Section Heading + Navigation Arrows */}
        <div
          ref={headRef}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 20,
            marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
          }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-h2"
            style={{ color: 'var(--text-primary)' }}
          >
            {headingParts[0]}
            {headingParts.length > 1 && (
              <>
                <br />
                <span style={{ color: 'var(--text-secondary)' }}>{headingParts.slice(1).join(' ')}</span>
              </>
            )}
          </motion.h2>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-380)}
              aria-label="Scroll left"
              className="p-2.5 rounded border border-border-default text-content-muted hover:text-content-primary hover:border-accent hover:bg-surface-raised transition-all cursor-pointer"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollBy(380)}
              aria-label="Scroll right"
              className="p-2.5 rounded border border-border-default text-content-muted hover:text-content-primary hover:border-accent hover:bg-surface-raised transition-all cursor-pointer"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Horizontal Scroll-Snap Container ── */}
        <div
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            gap: '1.5rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingBottom: '1rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
          className="no-scrollbar"
        >
          {testimonials.map((item, index) => (
            <TestimonialCard
              key={item._id || `${item.name}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
