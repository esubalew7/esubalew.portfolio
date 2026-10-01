import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useContentStore } from '../store/contentStore';
import { getCloudinaryUrl } from '../utils/cloudinary';
import { scrollToSectionById } from '../utils/sectionNavigation';

// ─── Monospace system specs configuration ──────────────────────────────────
const SYSTEM_PROFILE_DATA = [
  { key: 'STACK', value: 'MERN · PERN · Flutter' },
  { key: 'ARCH', value: 'Microservices' },
  { key: 'AUTH', value: 'JWT + TOTP 2FA' },
  { key: 'REALTIME', value: 'Socket.IO' },
  { key: 'DB', value: 'MongoDB · PostgreSQL' },
  { key: 'INFRA', value: 'Docker · Cloudinary' },
  { key: 'TOOLS', value: 'Swagger · Postman · Git' },
  { key: 'STATUS', value: 'AVAILABLE', isStatus: true },
];

export const AboutSection = () => {
  const { content } = useContentStore();
  const { about } = content || {};
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();

  // Resolved stats with fallback
  const stats = Array.isArray(about?.stats) && about.stats.length > 0
    ? about.stats
    : [
        { value: 3, suffix: '+', label: 'Years of production code' },
        { value: 15, suffix: '+', label: 'Full-stack systems shipped' },
        { value: 3, suffix: '', label: 'Live production stacks' },
      ];

  // Editorial description splitting at sentence boundary around "My approach"
  const rawDescription =
    about?.description ||
    "I'm Esubalew — a full-stack engineer based in Ethiopia, currently interning at Askuala Link. I architect and ship distributed systems that handle real-world production loads: from JWT + TOTP 2FA backends to live WebSocket-synced admin dashboards.";

  let paragraph1 = rawDescription;
  let paragraph2 =
    "My approach is architecture first: I think in event flows, caching layers, and separation of concerns before writing the first line of code. The result is software that scales and doesn't break at 3 AM.";

  if (rawDescription.includes('My approach')) {
    const splitIndex = rawDescription.indexOf('My approach');
    paragraph1 = rawDescription.slice(0, splitIndex).trim();
    paragraph2 = rawDescription.slice(splitIndex).trim();
  }

  const photoSrc = getCloudinaryUrl(about?.image, {
    fallback: '/images/esu.png',
    width: 800,
  });

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        background: 'var(--ink, #0D1117)',
        paddingTop: 'clamp(5rem, 9vw, 8.5rem)',
        paddingBottom: 'clamp(5rem, 9vw, 8.5rem)',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid var(--border-faint, rgba(255, 255, 255, 0.04))',
      }}
    >
      {/* Scoped CSS for keyframes, photo filters, and responsive 3-panel grid */}
      <style>{`
        @keyframes stamp-border-pulse {
          0%, 100% {
            border-color: var(--orange);
            box-shadow: 0 0 0 0 rgba(255, 77, 0, 0.4);
          }
          50% {
            border-color: rgba(255, 77, 0, 0.5);
            box-shadow: 0 0 14px 2px rgba(255, 77, 0, 0.25);
          }
        }

        @keyframes green-status-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
          }
          50% {
            opacity: 0.4;
            transform: scale(0.85);
            box-shadow: 0 0 8px 1px rgba(16, 185, 129, 0.25);
          }
        }

        .about-three-panel-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: start;
        }

        @media (min-width: 992px) {
          .about-three-panel-grid {
            grid-template-columns: 35fr 40fr 25fr;
            gap: clamp(1.75rem, 2.5vw, 3rem);
          }
        }

        .about-photo-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: var(--ink-raised, #141921);
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
        }

        .about-photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(100%) sepia(20%);
          transition: filter 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .about-photo-frame:hover .about-photo-img {
          filter: grayscale(0%) sepia(0%);
          transform: scale(1.03);
        }

        .about-stamp-badge {
          position: absolute;
          bottom: 16px;
          left: 12px;
          transform: rotate(-12deg);
          border: 2px solid var(--orange);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--orange);
          background: rgba(255, 77, 0, 0.08);
          padding: 5px 12px;
          border-radius: 2px;
          animation: stamp-border-pulse 2.5s infinite ease-in-out;
          pointer-events: none;
          z-index: 4;
          user-select: none;
        }

        .stat-row-container {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: clamp(0.75rem, 1.5vw, 1.5rem);
          align-items: start;
        }

        @media (max-width: 520px) {
          .stat-row-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>

      <div className="container-main">
        {/* Eyebrow */}
        <div className="section-eyebrow">About</div>

        {/* ── THREE-PANEL COMPOSITION ── */}
        <div className="about-three-panel-grid">
          {/* ══════════════════════════════════════════════════════════════════
              PANEL 1 — PHOTO (35% width)
              ══════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0 }}
            style={{ width: '100%' }}
          >
            {/* Outer container holding corner brackets and aspect-ratio frame */}
            <div style={{ position: 'relative', width: '100%' }}>
              {/* Corner bracket accent: top-left */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: -8,
                  left: -8,
                  width: 32,
                  height: 32,
                  borderTop: '2px solid var(--orange)',
                  borderLeft: '2px solid var(--orange)',
                  zIndex: 5,
                  pointerEvents: 'none',
                }}
              />

              {/* Corner bracket accent: bottom-right */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  bottom: -8,
                  right: -8,
                  width: 32,
                  height: 32,
                  borderBottom: '2px solid var(--orange)',
                  borderRight: '2px solid var(--orange)',
                  zIndex: 5,
                  pointerEvents: 'none',
                }}
              />

              {/* Photo Frame (3/4 aspect ratio, grayscale -> full color on hover) */}
              <div className="about-photo-frame">
                <img
                  src={photoSrc}
                  alt="Esubalew Molla"
                  className="about-photo-img"
                  loading="lazy"
                  decoding="async"
                />

                {/* Rubber stamp badge: rotated -12deg with pulsing border */}
                <div className="about-stamp-badge">
                  AVAILABLE FOR HIRE
                </div>
              </div>
            </div>

            {/* Below photo: Name in large mono + credential summary */}
            <div style={{ marginTop: '1.25rem' }}>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 'clamp(1.15rem, 1.4vw, 1.35rem)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary, #F0F2F5)',
                }}
              >
                ESUBALEW MOLLA
              </div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  color: 'var(--text-secondary, #8B939E)',
                  letterSpacing: '0.02em',
                  marginTop: '6px',
                  lineHeight: 1.5,
                }}
              >
                Bahir Dar, Ethiopia · CS Student · Engineer
              </div>
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════════════════
              PANEL 2 — EDITORIAL TEXT (40% width)
              ══════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ width: '100%' }}
          >
            {/* Section index mark */}
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                letterSpacing: '0.15em',
                color: 'var(--text-muted, #4A5260)',
                marginBottom: '1rem',
              }}
            >
              [001]
            </div>

            {/* Large display heading: Syne 800 with orange 'systems' */}
            <h2
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(2.5rem, 3.6vw, 4rem)',
                lineHeight: 1.04,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary, #F0F2F5)',
                marginBottom: '1.75rem',
              }}
            >
              I don't just<br />
              write code.<br />
              I ship <span style={{ color: 'var(--orange)' }}>systems</span>.
            </h2>

            {/* Two editorial paragraphs */}
            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)',
                color: 'var(--text-secondary, #8B939E)',
                lineHeight: 1.75,
                marginBottom: '1.25rem',
              }}
            >
              {paragraph1}
            </p>

            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)',
                color: 'var(--text-secondary, #8B939E)',
                lineHeight: 1.75,
                marginBottom: '2rem',
              }}
            >
              {paragraph2}
            </p>

            {/* Horizontal rule */}
            <div
              style={{
                width: '100%',
                height: 1,
                background: 'var(--border-faint, rgba(255, 255, 255, 0.05))',
                marginBottom: '2rem',
              }}
            />

            {/* Stat blocks row: flex row, 3 blocks left-aligned */}
            <div className="stat-row-container">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    delay: shouldReduceMotion ? 0 : 0.35 + i * 0.1,
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ textAlign: 'left' }}
                >
                  <div
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      fontWeight: 800,
                      fontSize: '2.5rem',
                      lineHeight: 1,
                      color: 'var(--orange)',
                      display: 'flex',
                      alignItems: 'baseline',
                    }}
                  >
                    {s.value}
                    {s.suffix && (
                      <span style={{ fontSize: '0.6em', marginLeft: 2 }}>{s.suffix}</span>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '10px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted, #4A5260)',
                      marginTop: '6px',
                      lineHeight: 1.35,
                    }}
                  >
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Orange text link */}
            <div style={{ marginTop: '2.5rem' }}>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSectionById('contact');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--orange)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'gap 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.gap = '12px';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.gap = '8px';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span>Start a conversation</span>
                <span aria-hidden="true" style={{ fontSize: '14px' }}>→</span>
              </a>
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════════════════
              PANEL 3 — SYSTEM PROFILE (25% width)
              ══════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            style={{
              width: '100%',
              background: 'var(--ink-raised, #141921)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            {/* Terminal Title Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-faint, rgba(255, 255, 255, 0.05))',
                background: 'rgba(0, 0, 0, 0.15)',
              }}
            >
              {/* Traffic light dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 12 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    backgroundColor: '#EF4444',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    backgroundColor: '#F59E0B',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    display: 'inline-block',
                  }}
                />
              </div>

              {/* Title file label */}
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  color: 'var(--text-muted, #4A5260)',
                  letterSpacing: '0.06em',
                }}
              >
                sys_profile.json
              </span>
            </div>

            {/* Monospace KEY: VALUE list */}
            <div
              style={{
                padding: 'clamp(1rem, 1.5vw, 1.25rem)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                lineHeight: 2.1,
              }}
            >
              {SYSTEM_PROFILE_DATA.map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      color: 'var(--text-muted, #4A5260)',
                      width: 76,
                      flexShrink: 0,
                      fontWeight: 500,
                    }}
                  >
                    {item.key}:
                  </span>

                  {item.isStatus ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#10B981',
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: '#10B981',
                          display: 'inline-block',
                          animation: 'green-status-pulse 2s infinite ease-in-out',
                        }}
                      />
                      {item.value}
                    </span>
                  ) : (
                    <span
                      style={{
                        color: 'var(--text-primary, #F0F2F5)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
