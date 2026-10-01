import React, { Suspense, useEffect, useRef, useState, useCallback, lazy } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useContentStore } from '../store/contentStore';
import { useTypewriter } from '../hooks/useTypewriter';
import { useVisitorCount } from '../hooks/useVisitorCount';
import { scrollToSectionById } from '../utils/sectionNavigation';

// Lazy-load the WebGL canvas so critical text renders in <100ms
const CircuitCanvas = lazy(() => import('../components/hero/CircuitCanvas'));

// ─── Availability pill ─────────────────────────────────────────────────────
function StatusPill({ available = true }) {
  const isAvailable = available !== false;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex items-center gap-2 px-3 py-1.5"
      style={{
        background: isAvailable ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
        border: isAvailable ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(245,158,11,0.25)',
        borderRadius: 100,
      }}
    >
      <span className="relative flex" style={{ width: 6, height: 6, flexShrink: 0 }}>
        <span
          className="animate-ping absolute inline-flex rounded-full opacity-75"
          style={{ width: '100%', height: '100%', background: isAvailable ? '#10b981' : '#f59e0b' }}
        />
        <span
          className="relative inline-flex rounded-full"
          style={{ width: 6, height: 6, background: isAvailable ? '#10b981' : '#f59e0b' }}
        />
      </span>
      <span
        className="font-mono"
        style={{
          fontSize: 11,
          letterSpacing: '0.12em',
          color: isAvailable ? '#10b981' : '#f59e0b',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {isAvailable ? 'Available for freelance' : 'Taking Q4 Inquiries'}
      </span>
    </motion.div>
  );
}

// ─── Live visitor telemetry pill ──────────────────────────────────────────
function VisitorPill({ count = 1 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex items-center gap-2 px-3 py-1.5"
      style={{
        background: 'rgba(255,77,0,0.06)',
        border: '1px solid rgba(255,77,0,0.2)',
        borderRadius: 100,
      }}
    >
      <span className="relative flex" style={{ width: 6, height: 6, flexShrink: 0 }}>
        <span className="animate-ping absolute inline-flex rounded-full bg-orange-400 opacity-75" style={{ width: '100%', height: '100%' }} />
        <span className="relative inline-flex rounded-full bg-orange-400" style={{ width: 6, height: 6 }} />
      </span>
      <span
        className="font-mono"
        style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-secondary)' }}
      >
        <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{count}</strong>{' '}
        {count === 1 ? 'engineer' : 'engineers'} viewed this today
      </span>
    </motion.div>
  );
}

// ─── Index number (editorial device) ──────────────────────────────────────
function IndexMark({ n = '01' }) {
  return (
    <span
      className="font-mono absolute"
      style={{
        fontSize: 10,
        letterSpacing: '0.15em',
        color: 'var(--text-muted)',
        top: 6,
        right: 0,
      }}
    >
      {n}
    </span>
  );
}

// ─── Metric chip ──────────────────────────────────────────────────────────
function MetricChip({ value, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-0.5"
      style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 16 }}
    >
      <span
        className="font-display"
        style={{ fontSize: 'clamp(1.4rem,2.5vw,2rem)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}
      >
        {value}
      </span>
      <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </span>
    </motion.div>
  );
}

// ─── Tech stack badge row ──────────────────────────────────────────────────
const TECH_BADGES = [
  { name: 'React', slug: 'react', color: '61DAFB' },
  { name: 'Next.js', slug: 'nextdotjs', color: 'white' },
  { name: 'Node.js', slug: 'nodedotjs', color: '5FA04E' },
  { name: 'MongoDB', slug: 'mongodb', color: '47A248' },
  { name: 'PostgreSQL', slug: 'postgresql', color: '4169E1' },
  { name: 'MySQL', slug: 'mysql', color: '4479A1' },
  { name: 'Flutter', slug: 'flutter', color: '02569B' },
  { name: 'Docker', slug: 'docker', color: '2496ED' },
  { name: 'TypeScript', slug: 'typescript', color: '3178C6' },
  { name: 'Express', slug: 'express', color: 'white' },
  { name: 'NestJS', slug: 'nestjs', color: 'E0234E' },
];

function TechBadgeRow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        marginTop: '2.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(1rem, 2.5vw, 1.85rem)',
        flexWrap: 'wrap',
      }}
      aria-label="Core Technology Stack"
    >
      {TECH_BADGES.map((badge) => (
        <span
          key={badge.slug}
          title={badge.name}
          aria-label={badge.name}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.6,
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          <img
            src={`https://cdn.simpleicons.org/${badge.slug}/${badge.color}`}
            alt={badge.name}
            width={24}
            height={24}
            loading="lazy"
            decoding="async"
            style={{
              width: 24,
              height: 24,
              display: 'block',
            }}
          />
        </span>
      ))}
    </motion.div>
  );
}

// ─── CTA buttons ──────────────────────────────────────────────────────────
function CTARow({ primaryLink = '#projects', resumeUrl = '/resume.pdf' }) {
  const handlePrimaryClick = (e) => {
    if (!primaryLink || primaryLink === '#projects' || primaryLink.startsWith('#')) {
      e.preventDefault();
      const targetId = primaryLink ? primaryLink.replace('#', '') : 'projects';
      scrollToSectionById(targetId);
    }
  };

  const handleResumeClick = (e) => {
    if (resumeUrl && resumeUrl.startsWith('/')) {
      e.preventDefault();
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.setAttribute('download', 'Esubalew_Molla_Resume.pdf');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-wrap items-center gap-4"
    >
      {/* Primary — filled orange */}
      <a
        href={primaryLink || '#projects'}
        onClick={handlePrimaryClick}
        data-cursor="hover"
        className="group relative inline-flex items-center gap-2.5 overflow-hidden font-mono"
        style={{
          padding: '12px 28px',
          background: 'var(--orange)',
          color: '#fff',
          borderRadius: 4,
          fontSize: 13,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontWeight: 500,
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'box-shadow 0.3s',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 32px var(--orange-glow)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* Sheen sweep */}
        <span
          className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
          aria-hidden="true"
        />
        <span className="relative">Selected Work</span>
        <svg
          width="16"
          height="16"
          style={{ width: 16, height: 16, flexShrink: 0 }}
          className="relative transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </a>

      {/* Secondary — ghost */}
      <a
        href={resumeUrl}
        download="Esubalew_Molla_Resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleResumeClick}
        data-cursor="hover"
        className="inline-flex items-center gap-2 font-mono link-underline"
        style={{
          fontSize: 13,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          padding: '12px 4px',
          cursor: 'pointer',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <svg
          width="16"
          height="16"
          style={{ width: 16, height: 16, flexShrink: 0 }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Download CV
      </a>
    </motion.div>
  );
}

// ─── Scroll indicator ─────────────────────────────────────────────────────
function ScrollCue() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 select-none pointer-events-none"
    >
      <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        Scroll
      </span>
      {/* Vertical tick — no floating, just a static line that 'grows' once */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 2.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, var(--orange), transparent)', transformOrigin: 'top' }}
      />
    </motion.div>
  );
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────
const TYPEWRITER_ROLES = [
  'Full Stack Engineer.',
  'System Architect.',
  'MERN Specialist.',
  'Distributed Systems.',
  'Real-Time Platforms.',
];

export const HeroSection = () => {
  const { content } = useContentStore();
  const { hero, resume } = content || {};
  const { count: visitorCount } = useVisitorCount();
  const [canvasReady, setCanvasReady] = useState(false);
  const sectionRef = useRef(null);

  const { scrollY } = useScroll();
  // Subtle parallax on the text block only — canvas stays fixed
  const textY = useTransform(scrollY, [0, 600], [0, 80]);

  const name = hero?.name || 'Esubalew Molla';
  const desc = hero?.description ||
    'Building production-grade distributed systems, MERN platforms, and real-time web architecture from API design to deployment pipeline.';
  const resumeUrl = resume?.url || '/resume.pdf';

  const role = useTypewriter(TYPEWRITER_ROLES, 70, 35, 2400);

  // Mount canvas after first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => setCanvasReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section
      id="home"
      ref={sectionRef}
      style={{ position: 'relative', minHeight: '100svh', overflow: 'hidden', background: 'var(--void)' }}
    >
      {/* ── Full-bleed WebGL circuit canvas ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {canvasReady && (
          <Suspense fallback={null}>
            <CircuitCanvas />
          </Suspense>
        )}
      </div>

      {/* ── Vignette gradient to keep text readable ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 120% 80% at 30% 50%, transparent 20%, rgba(8,10,14,0.7) 65%, rgba(8,10,14,0.97) 100%)',
        }}
      />

      {/* ── Left edge accent bar ── */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', left: 0, top: '10%', bottom: '10%',
          width: 3, background: 'var(--orange)', zIndex: 10, transformOrigin: 'top',
        }}
        aria-hidden="true"
      />

      {/* ── Editorial content block ── */}
      <motion.div
        style={{ y: textY }}
        className="container-main"
      >
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            minHeight: '100svh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: '7rem',
            paddingBottom: '7rem',
            maxWidth: 780,
          }}
        >
          {/* Status & Visitor Telemetry Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            <StatusPill available={hero?.available} />
            <VisitorPill count={visitorCount} />
          </div>

          {/* ── Name — display-scale ── */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-display"
            style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: 0 }}
          >
            {name.split(' ')[0]}
            <br />
            <span style={{ color: 'var(--text-secondary)', WebkitTextStroke: '1px rgba(240,242,245,0.25)', WebkitTextFillColor: 'transparent' }}>
              {name.split(' ').slice(1).join(' ')}
            </span>
          </motion.h1>

          {/* ── Typewriter role ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <span
              className="font-mono"
              style={{ fontSize: 'clamp(1rem,1.8vw,1.3rem)', color: 'var(--orange)', letterSpacing: '-0.01em' }}
            >
              {role}
              <span
                style={{ display: 'inline-block', width: 2, height: '1em', background: 'var(--orange)', marginLeft: 3, verticalAlign: 'middle' }}
                className="animate-pulse"
              />
            </span>
          </motion.div>

          {/* ── Description ── */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-body-lg"
            style={{ color: 'var(--text-secondary)', marginTop: '1.75rem', maxWidth: 600, lineHeight: 1.75 }}
          >
            {desc}
          </motion.p>

          {/* ── CTAs ── */}
          <div style={{ marginTop: '2.5rem' }}>
            <CTARow primaryLink={hero?.cta?.primary?.link || '#projects'} resumeUrl={resumeUrl} />
          </div>

          {/* ── Metrics strip ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            style={{
              marginTop: '4rem',
              display: 'flex',
              gap: 40,
              flexWrap: 'wrap',
              paddingTop: '2rem',
              borderTop: '1px solid var(--border-faint)',
            }}
          >
            <MetricChip value="3+" label="Years building" delay={1.2} />
            <MetricChip value="15+" label="Systems shipped" delay={1.3} />
            <MetricChip value="3" label="Production stacks" delay={1.4} />
            <MetricChip value="2FA" label="Auth architecture" delay={1.5} />
          </motion.div>

          {/* ── Official Tech Stack Badges ── */}
          <TechBadgeRow />
        </div>
      </motion.div>

      <ScrollCue />
    </section>
  );
};

export default HeroSection;
