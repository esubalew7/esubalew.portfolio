import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Float } from '@react-three/drei';
import { useProjects } from '../context/ProjectContext';
import { useTheme } from '../context/ThemeContext';
import { useContentStore } from '../store/contentStore';
import { useTrackSection } from '../hooks/useVisitorTracking';
import { EASINGS } from '../animations/variants';
import { getCloudinaryUrl } from '../utils/cloudinary';

// ─── Constants & Category Styles ─────────────────────────────────────────────
const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800';

const CATEGORY_STYLES = {
  mern: { label: 'MERN', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  frontend: { label: 'Frontend', bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  backend: { label: 'Backend', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  mobile: { label: 'Mobile', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
};

const getCategoryStyle = (category) =>
  CATEGORY_STYLES[(category || '').toLowerCase().trim()] || CATEGORY_STYLES.frontend;

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'MERN', value: 'mern' },
  { label: 'Frontend', value: 'frontend' },
  { label: 'Backend', value: 'backend' },
  { label: 'Mobile', value: 'mobile' },
];

// ─── Canvas Error Boundary ───────────────────────────────────────────────────
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[ProjectCanvas] WebGL context fallback:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ─── R3F 3D Mesh Component ───────────────────────────────────────────────────
function ProjectMesh({ project, isDarkMode, inView, liveUrl, hasLiveLink }) {
  const meshRef = useRef();
  const scanlineMatRef = useRef();
  const initialZRef = useRef(-2);
  const [hovered, setHovered] = useState(false);

  const imageUrl =
    getCloudinaryUrl(project.image, { width: 800, fallback: FALLBACK_IMG }) ||
    project.image ||
    FALLBACK_IMG;

  const texture = useTexture(imageUrl);

  useEffect(() => {
    if (hasLiveLink) {
      document.body.style.cursor = hovered ? 'pointer' : 'auto';
    }
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, hasLiveLink]);

  useFrame((state) => {
    if (!inView || !meshRef.current) return;
    const t = state.clock.getElapsedTime();

    // Initial mount smooth push-in
    if (initialZRef.current < 0) {
      initialZRef.current += (0 - initialZRef.current) * 0.05;
      meshRef.current.position.z = initialZRef.current;
    }

    // Mouse parallax — smooth lerp toward mouse position (amplified on hover)
    const multiplier = hovered ? 1.3 : 1.0;
    meshRef.current.rotation.y +=
      (state.mouse.x * 0.18 * multiplier - meshRef.current.rotation.y) * 0.06;
    meshRef.current.rotation.x +=
      (-state.mouse.y * 0.12 * multiplier - meshRef.current.rotation.x) * 0.06;

    // Update scanline time uniform
    if (scanlineMatRef.current?.uniforms?.uTime) {
      scanlineMatRef.current.uniforms.uTime.value = t;
    }
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (hasLiveLink) {
      window.open(liveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Float
      speed={hovered ? 0.7 : 1.2}
      rotationIntensity={0.08}
      floatIntensity={0.15}
      floatingRange={[-0.04, 0.04]}
    >
      <group
        ref={meshRef}
        position={[0, 0, -2]}
        onPointerOver={() => hasLiveLink && setHovered(true)}
        onPointerOut={() => hasLiveLink && setHovered(false)}
        onPointerDown={handlePointerDown}
      >
        {/* Main Project Texture Plane */}
        <mesh>
          <planeGeometry args={[3.6, 2.2, 1, 1]} />
          <meshStandardMaterial
            map={texture}
            roughness={hovered ? 0.2 : 0.35}
            metalness={0.05}
            toneMapped={false}
          />
        </mesh>

        {/* Frame Border (slightly larger plane behind) */}
        <mesh position={[0, 0, -0.015]}>
          <planeGeometry args={[3.68, 2.28]} />
          <meshBasicMaterial
            color={hovered ? 'var(--orange, #FF4D00)' : isDarkMode ? '#1c202d' : '#e5e7eb'}
            transparent
            opacity={hovered ? 0.95 : 0.85}
          />
        </mesh>

        {/* Scanline Overlay Plane (in front) */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[3.6, 2.2]} />
          <shaderMaterial
            ref={scanlineMatRef}
            transparent
            depthWrite={false}
            uniforms={{
              uTime: { value: 0 },
              uOpacity: { value: 0.06 },
            }}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              varying vec2 vUv;
              uniform float uTime;
              uniform float uOpacity;
              void main() {
                float scanline = step(0.5, fract(vUv.y * 80.0));
                gl_FragColor = vec4(0.0, 0.0, 0.0, scanline * uOpacity);
              }
            `}
          />
        </mesh>
      </group>
    </Float>
  );
}

// ─── Project Canvas Component (Desktop R3F) ──────────────────────────────────
function ProjectCanvas({ project, index, isDarkMode, inView, liveUrl, hasLiveLink }) {
  const fallbackStaticImage = (
    <a
      href={hasLiveLink ? liveUrl : undefined}
      target={hasLiveLink ? '_blank' : undefined}
      rel={hasLiveLink ? 'noopener noreferrer' : undefined}
      className={`w-full h-full relative aspect-video overflow-hidden rounded-md bg-surface-raised flex items-center justify-center group ${hasLiveLink ? 'cursor-pointer' : ''
        }`}
    >
      <img
        src={
          getCloudinaryUrl(project.image, { width: 800, fallback: FALLBACK_IMG }) ||
          project.image ||
          FALLBACK_IMG
        }
        alt={project.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="scanline-overlay pointer-events-none" />
      {hasLiveLink && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="font-code text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-sm bg-black/80 text-white backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-1.5">
            Visit Live
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        </div>
      )}
    </a>
  );

  const handleClick = () => {
    if (hasLiveLink) {
      window.open(liveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && hasLiveLink) {
      e.preventDefault();
      window.open(liveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={hasLiveLink ? 'link' : undefined}
      tabIndex={hasLiveLink ? 0 : undefined}
      title={hasLiveLink ? `Open ${project.title} live demo` : project.title}
      className={`w-full h-[clamp(300px,45vw,520px)] relative group select-none ${hasLiveLink ? 'cursor-pointer' : ''
        }`}
    >
      <CanvasErrorBoundary fallback={fallbackStaticImage}>
        <Canvas
          camera={{ position: [0, 0, 3.5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <ProjectMesh
              project={project}
              index={index}
              isDarkMode={isDarkMode}
              inView={inView}
              liveUrl={liveUrl}
              hasLiveLink={hasLiveLink}
            />
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 3, 2]} intensity={0.8} />
            <pointLight
              position={[-3, -2, 1]}
              intensity={0.4}
              color={isDarkMode ? '#3b82f6' : '#2563eb'}
            />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>

      {/* Floating Visit Live Badge on Hover */}
      {hasLiveLink && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="font-code text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-sm bg-black/80 text-white backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-1.5">
            Visit Live
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Sticky Filter Dock ──────────────────────────────────────────────────────
function StickyFilterDock({ activeFilter, setActiveFilter, filteredCount, totalCount, isDarkMode, filters = FILTERS }) {
  const [dockVisible, setDockVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset;
      if (currentScrollY > lastScrollYRef.current + 8) {
        setDockVisible(false);
      } else if (currentScrollY < lastScrollYRef.current - 8) {
        setDockVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: dockVisible ? 'translateY(0)' : 'translateY(-100%)',
      }}
      className={
        isDarkMode
          ? 'bg-surface-base/80 backdrop-blur-md border-b border-border-subtle'
          : 'bg-canvas/80 backdrop-blur-md border-b border-border-subtle'
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
        {/* LEFT: Project count */}
        <div className="font-code text-[11px] text-content-muted">
          {filteredCount} of {totalCount} projects
        </div>

        {/* RIGHT: Filter chips row */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-nowrap py-1">
          {filters.map((chip) => {
            const isActive = activeFilter === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => setActiveFilter(chip.value)}
                className={
                  isActive
                    ? 'bg-accent text-accent-foreground font-code text-[10px] uppercase tracking-[0.1em] px-3 py-1 rounded-sm whitespace-nowrap cursor-pointer transition-colors duration-150'
                    : 'border border-border-default text-content-muted font-code text-[10px] uppercase tracking-[0.1em] px-3 py-1 rounded-sm hover:border-accent hover:text-content-primary whitespace-nowrap cursor-pointer transition-colors duration-150'
                }
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Marquee Divider ─────────────────────────────────────────────────────────
function MarqueeDivider() {
  const tickerText =
    '· PRODUCTION GRADE · MERN STACK · FULL STACK DEVELOPER · REAL WORLD SYSTEMS · OPEN TO WORK · ESUBALEW MOLLA ';
  const repeatedText = tickerText.repeat(6);

  return (
    <div
      className="w-full h-8 md:h-10 border-y border-border-subtle overflow-hidden flex items-center relative select-none bg-surface-raised/20"
      aria-hidden="true"
    >
      <div className="project-marquee-track">
        <span className="font-code text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-content-muted whitespace-nowrap">
          {repeatedText}
        </span>
        <span className="font-code text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-content-muted whitespace-nowrap">
          {repeatedText}
        </span>
      </div>
    </div>
  );
}

// ─── Progress Rail (Fixed Left Edge) ─────────────────────────────────────────
function ProgressRail({ count, activeIndex, isVisible }) {
  if (count <= 1) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 'clamp(16px, 2vw, 28px)',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
      }}
      className={`hidden md:flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive
                ? 'bg-accent scale-150 shadow-[0_0_8px_var(--orange-glow)]'
                : 'bg-border-default'
              }`}
          />
        );
      })}

      <div
        className="font-code text-[9px] text-content-muted mt-3 select-none tracking-[0.12em] uppercase"
        style={{ writingMode: 'vertical-lr' }}
      >
        {activeIndex + 1} / {count}
      </div>
    </div>
  );
}

// ─── Project Stage (100svh per project) ──────────────────────────────────────
function ProjectStage({ project, index, isDarkMode, onVisible }) {
  const stageRef = useRef(null);
  const rightColRef = useRef(null);
  const [touchTilt, setTouchTilt] = useState(false);

  const stageInView = useInView(stageRef, { amount: 0.4 });
  const rightColInView = useInView(rightColRef, { once: true, margin: '-80px' });

  useEffect(() => {
    if (stageInView && onVisible) {
      onVisible();
    }
  }, [stageInView, onVisible]);

  const categoryStyle = getCategoryStyle(project.category);
  const liveUrl = project.liveLink || project.liveUrl || '#';
  const githubUrl = project.githubLink || project.githubUrl || '#';
  const hasLiveLink = Boolean(liveUrl && liveUrl !== '#');

  const techStack = Array.isArray(project.technologies)
    ? project.technologies
    : typeof project.technologies === 'string'
      ? project.technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : Array.isArray(project.techStack)
        ? project.techStack
        : [];

  return (
    <section
      ref={stageRef}
      className="min-h-auto md:min-h-[100svh] flex items-center relative overflow-hidden py-16 md:py-20 select-none"
    >
      {/* ── WATERMARK INDEX NUMBER ── */}
      <span
        aria-hidden="true"
        className={`absolute right-[clamp(1rem,4vw,4rem)] top-1/2 -translate-y-1/2 font-sans font-extrabold text-[clamp(5rem,15vw,10rem)] md:text-[clamp(8rem,18vw,16rem)] leading-none select-none pointer-events-none -z-0 transition-opacity duration-700 ${stageInView ? 'opacity-100' : 'opacity-0'
          } ${isDarkMode ? 'text-white/[0.018]' : 'text-black/[0.04]'}`}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* ── INNER CONTAINER: 2-COLUMN GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 md:grid-cols-2 gap-[clamp(2rem,6vw,6rem)] items-center relative z-10">
        {/* ── LEFT COLUMN: 3D Canvas (Desktop) / Static Image (Mobile) ── */}
        <div className="w-full">
          {/* Desktop R3F Canvas */}
          <div className="hidden md:block">
            <ProjectCanvas
              project={project}
              index={index}
              isDarkMode={isDarkMode}
              inView={stageInView}
              liveUrl={liveUrl}
              hasLiveLink={hasLiveLink}
            />
          </div>

          {/* Mobile Static Image with Touch Tilt & Link */}
          <div className="block md:hidden">
            <a
              href={hasLiveLink ? liveUrl : undefined}
              target={hasLiveLink ? '_blank' : undefined}
              rel={hasLiveLink ? 'noopener noreferrer' : undefined}
              className={`block w-full relative aspect-video overflow-hidden rounded-md bg-surface-raised group ${hasLiveLink ? 'cursor-pointer' : ''
                }`}
            >
              <img
                src={
                  getCloudinaryUrl(project.image, { width: 800, fallback: FALLBACK_IMG }) ||
                  project.image ||
                  FALLBACK_IMG
                }
                alt={project.title}
                loading="lazy"
                onTouchStart={() => setTouchTilt(true)}
                onTouchEnd={() => setTouchTilt(false)}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                style={{
                  transform: touchTilt
                    ? 'perspective(600px) rotateX(3deg) rotateY(-6deg)'
                    : 'none',
                  filter: touchTilt ? 'grayscale(0%)' : 'grayscale(20%)',
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMG;
                }}
              />
              <div className="scanline-overlay pointer-events-none" />

              {hasLiveLink && (
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <span className="font-code text-[9px] uppercase tracking-wider px-2 py-1 rounded-sm bg-black/80 text-white/95 backdrop-blur-sm border border-white/10 flex items-center gap-1 shadow-sm">
                    Live
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </span>
                </div>
              )}
            </a>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Editorial Typography ── */}
        <div ref={rightColRef} className="flex flex-col justify-center">
          {/* ROW 1 — Meta Bar */}
          <div className="flex items-center gap-3 mb-6">
            <span className="font-code text-[11px] text-content-muted">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="w-8 h-px bg-border-default" />
            <span
              className={`font-code text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-sm border ${categoryStyle.bg} ${categoryStyle.border} ${categoryStyle.text}`}
            >
              {categoryStyle.label}
            </span>

            {hasLiveLink && (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse rounded-full" />
                <span className="font-code text-[9px] text-emerald-400 uppercase font-semibold">
                  LIVE
                </span>
              </div>
            )}
          </div>

          {/* ROW 2 — Project Title */}
          <motion.h3
            initial={{ opacity: 0, x: -24 }}
            animate={rightColInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: EASINGS.easeOutExpo }}
            className="font-sans font-extrabold text-[clamp(1.8rem,4vw,3.2rem)] leading-[1.05] tracking-tight text-content-primary mb-4"
          >
            {project.title}
          </motion.h3>

          {/* ROW 3 — Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={rightColInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: EASINGS.easeOutExpo }}
            className="font-sans text-base text-content-secondary leading-relaxed mb-6 line-clamp-4"
          >
            {project.description}
          </motion.p>

          {/* ROW 4 — Tech Stack Tags with Stagger */}
          <div className="mb-8">
            <div className="font-code text-[9px] uppercase tracking-[0.16em] text-content-muted mb-2">
              Stack
            </div>
            <div className="flex flex-wrap gap-1.5">
              {techStack.map((tag, tagIndex) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, y: 8 }}
                  animate={rightColInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + tagIndex * 0.06,
                    ease: EASINGS.easeOutExpo,
                  }}
                  className="font-code text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm border border-border-subtle bg-surface-raised text-content-secondary hover:border-accent hover:text-accent transition-colors duration-150"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* ROW 5 — Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={rightColInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.45, ease: EASINGS.easeOutExpo }}
            className="flex gap-3 flex-wrap"
          >
            {/* Button 1 — Live Demo */}
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-foreground font-code text-[11px] uppercase tracking-[0.1em] rounded-sm transition-all duration-200 hover:shadow-[0_0_24px_rgba(255,77,0,0.3)] no-underline cursor-pointer"
            >
              <span>Live Demo</span>
              <svg
                className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            {/* Button 2 — Source */}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 border border-border-default hover:border-accent text-content-secondary hover:text-content-primary font-code text-[11px] uppercase tracking-[0.1em] rounded-sm transition-colors duration-200 no-underline cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Source</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Section Header Component ────────────────────────────────────────────────
function SectionHeader({ totalCount, eyebrow, title }) {
  const displayEyebrow = eyebrow || 'Selected Work';

  const renderTitle = () => {
    if (!title) {
      return (
        <>
          <span className="text-content-primary">What I've built</span>
          <br />
          <span className="text-content-secondary">for production.</span>
        </>
      );
    }
    const parts = title.split('\n');
    if (parts.length > 1) {
      return (
        <>
          <span className="text-content-primary">{parts[0]}</span>
          <br />
          <span className="text-content-secondary">{parts.slice(1).join(' ')}</span>
        </>
      );
    }
    return <span className="text-content-primary">{title}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        {/* LEFT */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-px bg-accent" />
            <span className="font-code text-[11px] tracking-[0.18em] uppercase text-accent">
              {displayEyebrow}
            </span>
          </div>
          <h2 className="font-sans font-extrabold text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.0] tracking-tight">
            {renderTitle()}
          </h2>
        </div>

        {/* RIGHT */}
        <div className="font-code text-[11px] text-content-muted sm:text-right">
          <div>{totalCount} projects</div>
          <div className="mt-1 animate-bounce text-accent">Scroll to explore ↓</div>
        </div>
      </div>
    </div>
  );
}

// ─── Fallback Loading Stages ─────────────────────────────────────────────────
function LoadingStages() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-border-subtle border-t-accent animate-spin mb-4" />
      <p className="font-code text-[11px] text-content-muted tracking-widest uppercase">
        Loading showcase projects...
      </p>
    </div>
  );
}

// ─── Fallback Error State ────────────────────────────────────────────────────
function ErrorState({ error }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center py-16">
      <p className="font-code text-[13px] text-content-muted">
        Failed to load projects: {error}
      </p>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center py-16">
      <p className="font-code text-[13px] text-content-muted">
        No projects in this category.
      </p>
    </div>
  );
}

// ─── Full Section Assembly ───────────────────────────────────────────────────
export const ProjectsSection = () => {
  const { projects, loading, error } = useProjects();
  const { isDarkMode } = useTheme();
  const { content } = useContentStore();
  const projectsSection = content?.projectsSection;
  useTrackSection?.('projects');

  const [activeFilter, setActiveFilter] = useState('all');
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [isRailVisible, setIsRailVisible] = useState(false);
  const sectionRef = useRef(null);

  const safeProjects = Array.isArray(projects) ? projects : [];
  const filteredProjects = safeProjects.filter(
    (p) =>
      activeFilter === 'all' ||
      (p.category || '').toLowerCase().trim() === activeFilter
  );

  const dynamicFilters = useMemo(() => {
    if (Array.isArray(projectsSection?.filters) && projectsSection.filters.length > 0) {
      return projectsSection.filters.map((f) => ({
        label: f.label,
        value: (f.id || f.label).toLowerCase().trim(),
      }));
    }
    return FILTERS;
  }, [projectsSection?.filters]);

  // Section-level intersection observer to show/hide fixed ProgressRail
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsRailVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="w-full bg-canvas relative"
      style={{ background: 'var(--bg-app, var(--void))' }}
    >
      {/* Fixed Progress Rail (Desktop Only) */}
      <ProgressRail
        count={filteredProjects.length}
        activeIndex={activeProjectIndex}
        isVisible={isRailVisible}
      />

      {/* Section Header */}
      <SectionHeader
        totalCount={safeProjects.length}
        eyebrow={projectsSection?.eyebrow}
        title={projectsSection?.title}
      />

      {/* Sticky Filter Dock */}
      <StickyFilterDock
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        filteredCount={filteredProjects.length}
        totalCount={safeProjects.length}
        isDarkMode={isDarkMode}
        filters={dynamicFilters}
      />

      {/* Loading State */}
      {loading && <LoadingStages />}

      {/* Error State: only show full blocking error if there are no projects to display */}
      {!loading && error && filteredProjects.length === 0 && <ErrorState error={error} />}

      {/* Empty State */}
      {!loading && !error && filteredProjects.length === 0 && <EmptyState />}

      {/* Project Stages with Marquee Dividers */}
      {!loading &&
        filteredProjects.length > 0 &&
        filteredProjects.map((project, index) => (
          <React.Fragment key={project._id || project.id || index}>
            <ProjectStage
              project={project}
              index={index}
              isDarkMode={isDarkMode}
              onVisible={() => setActiveProjectIndex(index)}
            />
            {index < filteredProjects.length - 1 && <MarqueeDivider />}
          </React.Fragment>
        ))}
    </section>
  );
};

export default ProjectsSection;
