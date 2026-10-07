import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

const TRACK_WIDTH       = 28;    // px — width of the right edge track
const CAR_WIDTH         = 22;    // px — SVG car width
const CAR_HEIGHT        = 38;    // px — SVG car height (top-down view)
const TRACK_PADDING_TOP = 80;    // px — space at top (below fixed navbar)
const TRACK_PADDING_BTM = 40;    // px — space at bottom

/**
 * Top-down view SVG of the car driving along the road track
 */
function CarSVG({ isDarkMode, isScrolling, scrollDir }) {
  const accentColor = isDarkMode ? 'var(--accent, #3b82f6)' : '#475569';
  const bodyFill = isDarkMode ? '#1e293b' : '#334155';
  const bodyStroke = isDarkMode ? 'var(--accent, #3b82f6)' : '#475569';
  const windowFill = isDarkMode
    ? 'rgba(147, 197, 253, 0.25)'
    : 'rgba(186, 230, 253, 0.4)';
  const rearWindowFill = isDarkMode
    ? 'rgba(147, 197, 253, 0.15)'
    : 'rgba(186, 230, 253, 0.3)';

  return (
    <svg
      viewBox="0 0 22 38"
      width={CAR_WIDTH}
      height={CAR_HEIGHT}
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <filter id="headlightConeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 4 Wheels (corners): width 3, height 5, rx 1 */}
      <rect
        x="0"
        y="5"
        width="3"
        height="5"
        rx="1"
        fill={isDarkMode ? '#0f172a' : '#1e293b'}
        stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
        strokeWidth="0.5"
      />
      <rect
        x="19"
        y="5"
        width="3"
        height="5"
        rx="1"
        fill={isDarkMode ? '#0f172a' : '#1e293b'}
        stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
        strokeWidth="0.5"
      />
      <rect
        x="0"
        y="28"
        width="3"
        height="5"
        rx="1"
        fill={isDarkMode ? '#0f172a' : '#1e293b'}
        stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
        strokeWidth="0.5"
      />
      <rect
        x="19"
        y="28"
        width="3"
        height="5"
        rx="1"
        fill={isDarkMode ? '#0f172a' : '#1e293b'}
        stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
        strokeWidth="0.5"
      />

      {/* Main Car Body */}
      <rect
        x="2"
        y="2"
        width="18"
        height="34"
        rx="3"
        fill={bodyFill}
        stroke={bodyStroke}
        strokeWidth="0.8"
      />

      {/* Rear Window (top when facing down) */}
      <rect
        x="4.5"
        y="7"
        width="13"
        height="4"
        rx="1"
        fill={rearWindowFill}
      />

      {/* Roof / Cabin Mid Section */}
      <rect
        x="4"
        y="12"
        width="14"
        height="12"
        rx="1"
        fill={isDarkMode ? '#0f172a' : '#1e293b'}
        opacity="0.85"
      />

      {/* Front Windshield (near front) */}
      <rect
        x="4.5"
        y="25"
        width="13"
        height="5"
        rx="1"
        fill={windowFill}
      />

      {/* Center Detail Stripe */}
      <line
        x1="11"
        y1="6"
        x2="11"
        y2="31"
        stroke={isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />

      {/* Side Accent Trim (dark mode) */}
      {isDarkMode && (
        <line
          x1="3.2"
          y1="8"
          x2="3.2"
          y2="30"
          stroke={accentColor}
          strokeWidth="0.6"
          opacity="0.5"
        />
      )}

      {/* Tail Lights (Rear = Top of SVG when driving down) */}
      <ellipse
        cx="4.5"
        cy="3.5"
        rx="1.5"
        ry="1"
        fill="#ef4444"
        opacity={isDarkMode ? 0.9 : 0.7}
        filter={isDarkMode ? 'drop-shadow(0 0 2px #dc2626)' : 'none'}
      />
      <ellipse
        cx="17.5"
        cy="3.5"
        rx="1.5"
        ry="1"
        fill="#ef4444"
        opacity={isDarkMode ? 0.9 : 0.7}
        filter={isDarkMode ? 'drop-shadow(0 0 2px #dc2626)' : 'none'}
      />

      {/* Headlights (Front = Bottom of SVG when driving down) */}
      <ellipse
        cx="4.5"
        cy="34.5"
        rx="1.5"
        ry="1"
        fill={isDarkMode ? '#fef08a' : '#e2e8f0'}
        filter={isDarkMode ? 'drop-shadow(0 0 3px #fde047)' : 'none'}
      />
      <ellipse
        cx="17.5"
        cy="34.5"
        rx="1.5"
        ry="1"
        fill={isDarkMode ? '#fef08a' : '#e2e8f0'}
        filter={isDarkMode ? 'drop-shadow(0 0 3px #fde047)' : 'none'}
      />
    </svg>
  );
}

/**
 * CarScrollbar Component
 * High-performance top-down vehicle scrollbar fixed to the right screen edge.
 * Uses a RAF lerp loop with direct DOM updates to eliminate jitter and dropped frames.
 */
export const CarScrollbar = () => {
  const { isDarkMode } = useTheme();

  // State (only triggers re-renders on meaningful UI updates)
  const [isScrolling, setIsScrolling]       = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [_isDragging, _setIsDragging]       = useState(false);
  const [trackHeight, setTrackHeight]       = useState(0);
  const [isTouch, setIsTouch]               = useState(false);

  // Synchronized ref for drag state to prevent race conditions during pointer events
  const isDraggingRef = useRef(false);
  const isDragging = _isDragging;
  const setIsDragging = (val) => {
    isDraggingRef.current = val;
    _setIsDragging(val);
  };

  // High-frequency animation and tracking refs (zero re-render overhead)
  const targetProgressRef   = useRef(0);
  const renderedProgressRef = useRef(0);
  const trackHeightRef      = useRef(0);
  const scrollDirRef        = useRef(0);
  const lastScrollY         = useRef(0);
  const dragStartY          = useRef(0);
  const dragStartProg       = useRef(0);
  const scrollTimeoutRef    = useRef(null);
  const rafRef              = useRef(null);
  const carRef              = useRef(null);
  const glowRef             = useRef(null);
  const exhaustRef          = useRef(null);
  const lastLabelUpdate     = useRef(0);

  // Hide on touch/mobile devices
  useEffect(() => {
    setIsTouch(
      typeof window !== 'undefined' &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    );
  }, []);

  // Compute scroll progress
  const computeProgress = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.max(0, Math.min(1, window.scrollY / scrollable));
  }, []);

  // Scroll listener (updates targetProgressRef directly; throttles % state to 100ms)
  useEffect(() => {
    if (isTouch) return;

    const onScroll = () => {
      const prog = computeProgress();
      const dir  = window.scrollY >= lastScrollY.current ? 1 : -1;
      lastScrollY.current = window.scrollY;

      targetProgressRef.current = prog;
      scrollDirRef.current = dir;
      setIsScrolling(true);

      const now = Date.now();
      if (now - lastLabelUpdate.current > 100) {
        setScrollProgress(prog);
        lastLabelUpdate.current = now;
      }

      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        scrollDirRef.current = 0;
        setScrollProgress(computeProgress());
      }, 150);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const initialProg = computeProgress();
    targetProgressRef.current   = initialProg;
    renderedProgressRef.current = initialProg;
    setScrollProgress(initialProg);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, [computeProgress, isTouch]);

  // Track height measurement
  useEffect(() => {
    const measure = () => {
      if (typeof window !== 'undefined') {
        const height = Math.max(
          100,
          window.innerHeight - TRACK_PADDING_TOP - TRACK_PADDING_BTM
        );
        trackHeightRef.current = height;
        setTrackHeight(height);
      }
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  }, []);

  // RAF Lerp Animation Loop (runs continuously, GPU-composited direct DOM updates)
  useEffect(() => {
    if (isTouch) return;

    const animate = () => {
      const target  = targetProgressRef.current;
      const current = renderedProgressRef.current;
      const delta   = target - current;

      if (Math.abs(delta) < 0.0001) {
        renderedProgressRef.current = target;
      } else {
        renderedProgressRef.current = current + delta * 0.18;
      }

      if (carRef.current && trackHeightRef.current > 0) {
        const carY =
          TRACK_PADDING_TOP +
          renderedProgressRef.current * trackHeightRef.current -
          CAR_HEIGHT / 2;
        const clampedY = Math.max(
          TRACK_PADDING_TOP,
          Math.min(
            TRACK_PADDING_TOP + trackHeightRef.current - CAR_HEIGHT,
            carY
          )
        );

        carRef.current.style.top = `${clampedY}px`;

        if (glowRef.current) {
          const glowDir = scrollDirRef.current;
          glowRef.current.style.top =
            glowDir === -1
              ? `${clampedY - 36}px`
              : `${clampedY + CAR_HEIGHT}px`;
        }

        if (exhaustRef.current) {
          const glowDir = scrollDirRef.current;
          exhaustRef.current.style.top =
            glowDir === 1
              ? `${clampedY - 14}px`
              : `${clampedY + CAR_HEIGHT + 2}px`;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isTouch]);

  // Track click handler
  const handleTrackClick = (e) => {
    if (trackHeightRef.current <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY     = e.clientY - rect.top - TRACK_PADDING_TOP;
    const targetProg = Math.max(0, Math.min(1, clickY / trackHeightRef.current));
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: targetProg * scrollable, behavior: 'smooth' });
  };

  // Pointer drag handlers with OS-level Pointer Capture
  const handleCarPointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartY.current    = e.clientY;
    dragStartProg.current = targetProgressRef.current;
    setIsDragging(true);
  };

  const handleCarPointerMove = (e) => {
    if (!isDraggingRef.current || trackHeightRef.current <= 0) return;
    e.preventDefault();
    const deltaY    = e.clientY - dragStartY.current;
    const deltaProg = deltaY / trackHeightRef.current;
    const targetProg = Math.max(
      0,
      Math.min(1, dragStartProg.current + deltaProg)
    );
    targetProgressRef.current = targetProg;
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: targetProg * scrollable, behavior: 'auto' });
  };

  const handleCarPointerUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    setIsDragging(false);
  };

  if (isTouch) return null;

  // Road Lane Center Dashes Style
  const laneDashStyle = {
    position: 'absolute',
    left: '50%',
    top: TRACK_PADDING_TOP,
    width: 2,
    height: trackHeight,
    background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 8px, ${
      isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'
    } 8px, ${
      isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'
    } 16px)`,
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
  };

  // KM Marker Dots Style
  const dotStyle = (i) => ({
    position: 'absolute',
    left: 2,
    top: TRACK_PADDING_TOP + (i / 5) * trackHeight,
    width: 2,
    height: 2,
    borderRadius: '50%',
    background: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
    pointerEvents: 'none',
  });

  // Top Cap
  const topCapStyle = {
    position: 'absolute',
    top: TRACK_PADDING_TOP - 8,
    left: 0,
    width: '100%',
    height: 1,
    background: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
    pointerEvents: 'none',
  };

  // Bottom Cap
  const bottomCapStyle = {
    position: 'absolute',
    top: TRACK_PADDING_TOP + trackHeight,
    left: 0,
    width: '100%',
    height: 1,
    background: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
    pointerEvents: 'none',
  };

  // Headlight Glow Cone (Dark mode only)
  const headlightGlowStyle = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 20,
    height: 36,
    background:
      'radial-gradient(ellipse at top, rgba(254,240,138,0.15) 0%, transparent 100%)',
    pointerEvents: 'none',
  };

  // Progress Percentage Label Style
  const progressLabelStyle = {
    position: 'absolute',
    bottom: Math.max(8, TRACK_PADDING_BTM - 24),
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 7,
    letterSpacing: '0.1em',
    color: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
    userSelect: 'none',
    pointerEvents: 'none',
  };

  return (
    <div
      role="scrollbar"
      aria-valuenow={Math.round(scrollProgress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll position"
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        width: TRACK_WIDTH,
        height: '100vh',
        zIndex: 9997,
        cursor: 'pointer',
        background: isDarkMode
          ? 'rgba(15, 20, 30, 0.88)'
          : 'rgba(240, 244, 250, 0.92)',
        borderLeft: isDarkMode
          ? '1px solid rgba(255, 255, 255, 0.06)'
          : '1px solid rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={handleTrackClick}
    >
      {/* Lane markings */}
      <div style={laneDashStyle} aria-hidden="true" />

      {/* Road edge dots */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={dotStyle(i)} aria-hidden="true" />
      ))}

      {/* Top and bottom road caps */}
      <div style={topCapStyle} aria-hidden="true" />
      <div style={bottomCapStyle} aria-hidden="true" />

      {/* Headlight glow cone (dark mode only) */}
      {isDarkMode && (
        <div
          ref={glowRef}
          style={headlightGlowStyle}
          aria-hidden="true"
        />
      )}

      {/* Exhaust puffs container */}
      <div
        ref={exhaustRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: CAR_WIDTH,
          height: 20,
          pointerEvents: 'none',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={isScrolling ? 'exhaust-puff' : 'exhaust-puff-hidden'}
            style={{
              position: 'absolute',
              left: 4 + i * 6,
              top: 0,
              width: 5 + i * 1.5,
              height: 5 + i * 1.5,
              borderRadius: '50%',
              background: isDarkMode
                ? 'rgba(148, 163, 184, 0.5)'
                : 'rgba(100, 116, 139, 0.3)',
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>

      {/* The CAR — positioned along track via direct RAF DOM updates */}
      <div
        ref={carRef}
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: isDragging ? 'grabbing' : 'grab',
          width: CAR_WIDTH,
          height: CAR_HEIGHT,
          userSelect: 'none',
          touchAction: 'none',
        }}
        onPointerDown={handleCarPointerDown}
        onPointerMove={handleCarPointerMove}
        onPointerUp={handleCarPointerUp}
        onPointerCancel={handleCarPointerUp}
        onClick={(e) => e.stopPropagation()}
        aria-hidden="true"
      >
        <CarSVG
          isDarkMode={isDarkMode}
          isScrolling={isScrolling}
          scrollDir={scrollDirRef.current}
        />
      </div>

      {/* Scroll progress percentage */}
      <div style={progressLabelStyle} aria-hidden="true">
        {Math.round(scrollProgress * 100)}%
      </div>
    </div>
  );
};

export default CarScrollbar;
