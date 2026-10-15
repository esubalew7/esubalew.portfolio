import React, { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTheme } from '../context/ThemeContext';
import { useContentStore } from '../store/contentStore';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { AboutSkeleton } from '../components/SkeletonLoader';
import { getCloudinaryUrl } from '../utils/cloudinary';
import { scrollToSectionById } from '../utils/sectionNavigation';

/**
 * Catches WebGL canvas crashes gracefully without breaking the layout
 */
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('[AboutSection:CanvasErrorBoundary] WebGL Error:', error, info);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/**
 * 3D Rotating Icosahedron wireframe
 */
function IcosahedronMesh({ isDarkMode }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.08;
    meshRef.current.rotation.y = t * 0.12;
  });

  return (
    <mesh ref={meshRef} scale={2.2}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial
        color={isDarkMode ? '#3b82f6' : '#2563eb'}
        wireframe
        transparent
        opacity={isDarkMode ? 0.07 : 0.05}
      />
    </mesh>
  );
}

/**
 * Background R3F Canvas positioned behind the dossier photo
 */
function IcosahedronBg({ isDarkMode }) {
  const containerRef = useRef(null);
  const [isOnScreen, setIsOnScreen] = useState(false);

  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') {
      setIsOnScreen(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOnScreen(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="hidden md:block pointer-events-none select-none"
      style={{
        position: 'absolute',
        inset: '-20%',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 3.5], fov: 45 }}
          dpr={[1, 1.2]}
          gl={{ antialias: false, alpha: true }}
          frameloop={isOnScreen ? 'always' : 'never'}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <Suspense fallback={null}>
            <IcosahedronMesh isDarkMode={isDarkMode} />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

/**
 * Top full-width bar indicating personnel file classification and status
 */
function PersonnelFileBar({ available = true, dossierRef, clearanceLevel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full border-t border-b border-border-subtle py-3"
      style={{
        background: 'var(--panel-subtle-bg, rgba(255, 255, 255, 0.015))',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* LEFT: monospace text row */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-code text-[9px] uppercase tracking-[0.2em] text-accent font-semibold">
            Personnel File
          </span>
          <span className="text-content-muted text-[10px] hidden min-[420px]:inline">·</span>
          <span className="font-code text-[9px] text-content-muted uppercase tracking-[0.16em] hidden min-[420px]:inline">
            {dossierRef || 'Ref: ESU-2024'}
          </span>
          <span className="text-content-muted text-[10px] hidden min-[420px]:inline">·</span>
          <span className="font-code text-[9px] text-content-muted uppercase tracking-[0.16em] hidden min-[420px]:inline">
            {clearanceLevel || 'Clearance: Senior Engineer'}
          </span>
        </div>

        {/* RIGHT: Status indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              available ? 'bg-success animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span
            className={`font-code text-[9px] uppercase tracking-[0.12em] font-medium ${
              available ? 'text-success' : 'text-amber-500'
            }`}
          >
            {available ? 'Status: Active' : 'Status: Booked'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Photo with dossier corner brackets and watermark file stamp
 */
function PhotoBlock({ image, name, isDarkMode, clearanceLevel, personnelId }) {
  const photoSrc = getCloudinaryUrl(image, {
    fallback: '/images/esu.png',
    width: 800,
  });

  return (
    <div className="relative w-full max-w-full md:max-w-[340px] mx-auto md:mx-0">
      {/* 4 Corner Brackets (no rounded borders, dossier technical frame) */}
      <div
        aria-hidden="true"
        className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 pointer-events-none z-10"
        style={{ borderColor: 'var(--accent, #FF4D00)' }}
      />
      <div
        aria-hidden="true"
        className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 pointer-events-none z-10"
        style={{ borderColor: 'var(--accent, #FF4D00)' }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 pointer-events-none z-10"
        style={{ borderColor: 'var(--accent, #FF4D00)' }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 pointer-events-none z-10"
        style={{ borderColor: 'var(--accent, #FF4D00)' }}
      />

      {/* 3D Holographic Wireframe behind the portrait */}
      <IcosahedronBg isDarkMode={isDarkMode} />

      {/* Dossier Image Frame */}
      <div className="relative w-full aspect-[4/3] md:aspect-[3/4] overflow-hidden bg-surface-raised dark:bg-surface-base border border-border-subtle group">
        <img
          src={photoSrc}
          alt={name || 'Esubalew Molla'}
          className="w-full h-full object-cover object-top block transition-[filter,transform] duration-500 group-hover:scale-[1.02]"
          style={{
            filter: isDarkMode
              ? 'grayscale(15%) contrast(1.06) brightness(0.95)'
              : 'grayscale(10%) contrast(1.05) brightness(1.0)',
            borderRadius: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'grayscale(0%) contrast(1.0) brightness(1.0)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = isDarkMode
              ? 'grayscale(15%) contrast(1.06) brightness(0.95)'
              : 'grayscale(10%) contrast(1.05) brightness(1.0)';
          }}
          loading="lazy"
          decoding="async"
        />

        {/* File Stamp Overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3 sm:p-3.5 flex items-end justify-between pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
          }}
        >
          <div>
            <div className="font-code text-[8px] text-white/80 uppercase tracking-[0.14em] font-medium leading-tight">
              {name || 'Esubalew Molla'}
            </div>
            <div className="font-code text-[7px] text-white/50 uppercase tracking-[0.1em] mt-0.5">
              {clearanceLevel || 'Senior Engineer'}
            </div>
          </div>
          <div className="font-code text-[8px] text-accent uppercase tracking-[0.1em] font-bold">
            {personnelId || 'ID: ESU-001'}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Vertical metrics and credential table with horizontal borders
 */
function MetricsTable({
  stats = [],
  location,
  resumeUrl = '/resume.pdf',
  education = 'Bahir Dar University',
  academicYear = '3rd Year · CS',
}) {
  const defaultStats = [
    { value: 3, suffix: '+', label: 'Years of production code' },
    { value: 15, suffix: '+', label: 'Systems Shipped' },
    { value: 3, suffix: '', label: 'Live production stacks' },
  ];
  const resolvedStats = Array.isArray(stats) && stats.length > 0 ? stats : defaultStats;

  return (
    <div className="mt-6 w-full max-w-full md:max-w-[340px] mx-auto md:mx-0">
      <div className="border-t border-border-subtle">
        {resolvedStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between py-3 border-b border-border-subtle"
          >
            <span className="font-code text-[9px] text-content-muted uppercase tracking-[0.14em]">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-sans font-extrabold text-[1.4rem] text-content-primary leading-none">
                <AnimatedCounter
                  from={0}
                  to={typeof stat.value === 'number' ? stat.value : parseInt(stat.value, 10) || 0}
                />
              </span>
              {stat.suffix && (
                <span className="font-sans font-bold text-[0.9rem] text-accent">
                  {stat.suffix}
                </span>
              )}
            </div>
          </motion.div>
        ))}

        {/* Education row */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.1 + resolvedStats.length * 0.08,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex items-center justify-between py-3 border-b border-border-subtle"
        >
          <span className="font-code text-[9px] text-content-muted uppercase tracking-[0.14em]">
            Education
          </span>
          <span className="font-sans text-[0.8rem] text-content-secondary font-medium">
            {education || 'Bahir Dar University'}
          </span>
        </motion.div>

        {/* Year row */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.1 + (resolvedStats.length + 1) * 0.08,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex items-center justify-between py-3 border-b border-border-subtle"
        >
          <span className="font-code text-[9px] text-content-muted uppercase tracking-[0.14em]">
            Year
          </span>
          <span className="font-sans text-[0.8rem] text-content-secondary font-medium">
            {academicYear || '3rd Year · CS'}
          </span>
        </motion.div>

        {/* Location row */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.1 + (resolvedStats.length + 2) * 0.08,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex items-center justify-between py-3 border-b border-border-subtle"
        >
          <span className="font-code text-[9px] text-content-muted uppercase tracking-[0.14em]">
            Based
          </span>
          <span className="font-sans text-[0.8rem] text-content-secondary font-medium">
            {location || 'Bahir Dar, Ethiopia'}
          </span>
        </motion.div>
      </div>

      {/* Resume File Link */}
      <div className="mt-6">
        <a
          href={resumeUrl || '/resume.pdf'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-code text-[10px] uppercase tracking-[0.14em] text-content-muted hover:text-accent cursor-pointer transition-colors duration-150"
        >
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Download Resume ↗</span>
        </a>
      </div>
    </div>
  );
}

const TICKER_ITEMS = [
  'MERN Stack',
  'PERN Stack',
  'Flutter',
  'Node.js',
  'React',
  'TypeScript',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Socket.IO',
  'REST API',
  'Microservices',
  'NestJS',
  'Redis',
  'RabbitMQ',
  'JWT Auth',
  '2FA',
  'Swagger',
  'Postman',
  'Git',
];

/**
 * Continuous auto-scrolling tech competencies ticker
 */
function CompetenciesTicker({ competencies }) {
  const items = Array.isArray(competencies) && competencies.length > 0
    ? competencies.map((c) => (typeof c === 'string' ? c : c.text || c.name || ''))
    : TICKER_ITEMS;

  return (
    <div
      className="overflow-hidden border-t border-b border-border-subtle py-2 mb-8 select-none"
      aria-hidden="true"
    >
      <div className="about-ticker-track">
        {[...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 px-4">
            <span className="w-1 h-1 rounded-full bg-accent opacity-60 flex-shrink-0" />
            <span className="font-code text-[10px] uppercase tracking-[0.12em] text-content-muted whitespace-nowrap">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Statement block with the signature redaction sweep reveal
 */
function StatementBlock({ description, inView }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const text =
    description ||
    "I'm Esubalew — a full-stack engineer based in Ethiopia, currently interning at Askuala Link. I architect and ship distributed systems that handle real-world production loads: from JWT + TOTP 2FA backends to live WebSocket-synced admin dashboards. My approach is architecture first: I think in event flows, caching layers, and separation of concerns before writing the first line of code. The result is software that scales and doesn't break at 3 AM.";

  const isLong = text.length > 280;
  const displayText = isLong && !isExpanded ? text.slice(0, 280) + '...' : text;

  return (
    <div className="mb-8 relative">
      {/* Large opening quote mark */}
      <span
        aria-hidden="true"
        className="font-sans font-extrabold text-[3.5rem] md:text-[5rem] leading-none text-accent opacity-20 absolute -top-5 -left-3 md:-top-6 md:-left-4 select-none pointer-events-none"
      >
        &ldquo;
      </span>

      {/* Redaction Reveal Overlay */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'var(--accent, #FF4D00)',
          transformOrigin: 'right',
        }}
        initial={{ scaleX: 1 }}
        animate={inView ? { scaleX: 0 } : { scaleX: 1 }}
        transition={{
          delay: 0.6,
          duration: 0.8,
          ease: [0.76, 0, 0.24, 1],
        }}
      />

      {/* Description paragraph */}
      <p className="font-sans text-[1rem] md:text-[1.05rem] leading-[1.85] text-content-secondary relative z-10">
        {displayText}
      </p>

      {/* Read more toggle link */}
      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="font-code text-[10px] text-accent uppercase tracking-[0.1em] cursor-pointer mt-2 inline-block bg-transparent border-none p-0 relative z-10 hover:underline"
        >
          {isExpanded ? 'Read less ↑' : 'Read more ↓'}
        </button>
      )}
    </div>
  );
}

/**
 * Compact assignment block representing current role and university track
 */
function AssignmentBlock({ assignments }) {
  const defaultAssignments = [
    {
      id: 'asg-1',
      organization: 'Askuala Link Software Co.',
      role: 'Frontend Developer Intern',
      period: '2024 — Present',
      status: 'active',
      current: true,
    },
    {
      id: 'asg-2',
      organization: 'Bahir Dar University',
      role: 'B.Sc. Computer Science',
      period: '2022 — Present',
      status: 'completed',
      current: false,
    },
  ];

  const items = Array.isArray(assignments) && assignments.length > 0
    ? assignments.filter((a) => a.visible !== false)
    : defaultAssignments;

  return (
    <div className="mb-8">
      <div className="font-code text-[9px] uppercase tracking-[0.2em] text-content-muted mb-3 font-semibold">
        02 — Current Assignment
      </div>

      {items.map((item, idx) => {
        const isActive = item.status === 'active' || Boolean(item.current);
        const isLast = idx === items.length - 1;
        return (
          <div
            key={item.id || item._id || idx}
            className={`flex items-start justify-between py-3 ${!isLast ? 'border-b border-border-subtle' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  isActive ? 'bg-success animate-pulse' : 'bg-border-strong'
                }`}
              />
              <div>
                <div className="font-sans font-semibold text-[0.9rem] text-content-primary">
                  {item.organization || item.company}
                </div>
                <div className="font-code text-[9px] text-content-muted mt-0.5">
                  {item.role || item.title}
                </div>
              </div>
            </div>
            <div className="font-code text-[9px] text-content-muted">
              {item.period || item.duration}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Left Column Container
 */
function LeftColumn({ about, hero, contactInfo, isDarkMode, education, academicYear }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <PhotoBlock
        image={about?.image}
        name={hero?.name}
        isDarkMode={isDarkMode}
        clearanceLevel={about?.clearanceLevel}
        personnelId={about?.personnelId}
      />
      <MetricsTable
        stats={about?.stats}
        location={contactInfo?.location}
        resumeUrl={about?.resume?.url || '/resume.pdf'}
        education={education}
        academicYear={academicYear}
      />
    </motion.div>
  );
}

/**
 * Right Column Container
 */
function RightColumn({ about, hero, inView, socialLinks = [], education }) {
  const handleContactClick = (e) => {
    const link = about?.cta?.link || '#contact';
    if (link.startsWith('#')) {
      e.preventDefault();
      const targetId = link.replace('#', '');
      scrollToSectionById(targetId);
    }
  };

  const githubUrl =
    socialLinks.find(
      (s) => s.platform?.toLowerCase() === 'github' && s.enabled !== false
    )?.url || 'https://github.com/esubalew7';

  const linkedinUrl =
    socialLinks.find(
      (s) => s.platform?.toLowerCase() === 'linkedin' && s.enabled !== false
    )?.url || 'https://linkedin.com/in/esubalew-molla-7a584739b';

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {/* SECTION INDEX LABEL */}
      <div className="font-code text-[9px] uppercase tracking-[0.2em] text-accent mb-6 md:mb-8 font-semibold">
        {about?.eyebrow || '01 — Identity & Background'}
      </div>

      {/* NAME BLOCK */}
      <div className="mb-6 md:mb-8">
        <h2 className="font-sans font-extrabold text-[clamp(2.2rem,4.5vw,3.5rem)] leading-none tracking-[-0.025em] text-content-primary mb-2">
          {hero?.name || 'Esubalew Molla'}
        </h2>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-code text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-sm border border-border-default bg-[var(--orange-dim,rgba(255,77,0,0.1))] text-accent font-medium">
            {hero?.titles?.[0] || 'Full Stack Engineer'}
          </span>
          <span className="w-1 h-1 rounded-full bg-border-strong" />
          <span className="font-code text-[10px] text-content-muted">
            {education || 'Bahir Dar University'}
          </span>
        </div>
      </div>

      {/* COMPETENCIES TICKER */}
      <CompetenciesTicker competencies={about?.competencies} />

      {/* STATEMENT BLOCK with Redaction reveal */}
      <StatementBlock description={about?.description} inView={inView} />

      {/* ASSIGNMENT BLOCK */}
      <AssignmentBlock assignments={about?.assignments} />

      {/* CTA ROW */}
      <div className="flex items-center gap-6 flex-wrap pt-6 border-t border-border-subtle">
        <a
          href={about?.cta?.link || '#contact'}
          onClick={handleContactClick}
          className="font-code text-[11px] uppercase tracking-[0.1em] bg-accent text-accent-foreground px-5 py-2.5 rounded-sm flex items-center gap-2.5 hover:bg-accent-hover transition-all duration-200"
          style={{
            boxShadow: '0 0 20px rgba(255,77,0,0.2)',
          }}
        >
          <span>→ {about?.cta?.text || 'Start a Conversation'}</span>
        </a>

        <div className="flex items-center gap-4">
          {/* GitHub */}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="text-content-muted hover:text-content-primary transition-colors duration-150 p-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
          )}

          {/* LinkedIn */}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="text-content-muted hover:text-content-primary transition-colors duration-150 p-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.92 0 1.66-.74 1.66-1.66a1.66 1.66 0 1 0-3.32 0c0 .92.74 1.66 1.66 1.66m1.39 9.74v-8.37H5.07v8.37h2.78z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * AboutSection — "The Dossier"
 * Professional intelligence brief design for a senior contractor.
 */
export const AboutSection = () => {
  const { content, loading } = useContentStore();
  const { isDarkMode } = useTheme();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-60px' });

  const { about, hero, contactInfo, resume, socialLinks } = content || {};

  if (loading && !about) {
    return <AboutSkeleton />;
  }

  const available = hero?.available ?? true;

  // Resolve education institution and degree/year from CMS about.education or education assignment
  const eduAssignment = Array.isArray(about?.assignments)
    ? about.assignments.find((a) =>
        /university|college|school|b\.sc|bachelor|degree|student/i.test(`${a.organization || ''} ${a.role || ''}`)
      )
    : null;

  const resolvedEducation =
    about?.education?.institution ||
    eduAssignment?.organization ||
    'Bahir Dar University';

  const resolvedAcademicYear =
    about?.education?.degree ||
    about?.education?.year ||
    eduAssignment?.role ||
    '3rd Year · CS';

  return (
    <section
      id="about"
      ref={sectionRef}
      role="region"
      aria-label="About Esubalew"
      className="bg-surface-raised dark:bg-surface-base pt-20 pb-24 md:pt-24 md:pb-32 overflow-hidden relative border-t border-border-subtle"
    >
      {/* Full-width Personnel File Bar at the very top */}
      <PersonnelFileBar
        available={available}
        dossierRef={about?.dossierRef}
        clearanceLevel={about?.clearanceLevel}
      />

      {/* Two-Column Grid Inner Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10 md:gap-14 lg:gap-20 items-start">
          <LeftColumn
            about={{ ...about, resume }}
            hero={hero}
            contactInfo={contactInfo}
            isDarkMode={isDarkMode}
            education={resolvedEducation}
            academicYear={resolvedAcademicYear}
          />
          <RightColumn
            about={about}
            hero={hero}
            contactInfo={contactInfo}
            socialLinks={socialLinks}
            inView={inView}
            education={resolvedEducation}
          />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
