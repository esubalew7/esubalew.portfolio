import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

// Compact dimensions — sleek, lightweight, matches native scrollbar proportions
const TRACK_WIDTH       = 12;    // px — slim track width (native scrollbar standard)
const CAR_WIDTH         = 10;    // px — miniature SVG car width
const CAR_HEIGHT        = 18;    // px — miniature SVG car height
const TRACK_PADDING_TOP = 4;     // px — starts at the very top (0 dead-zone)
const TRACK_PADDING_BTM = 4;     // px — reaches the very bottom (0 dead-zone)

/**
 * Helper to compute available travel distance for the car thumb
 */
const getAvailableTravel = (height) => {
  return Math.max(1, height - TRACK_PADDING_TOP - TRACK_PADDING_BTM - CAR_HEIGHT);
};

/**
 * Top-down miniature vector SVG of the car driving along the road track
 */
function CarSVG({ isDarkMode, isScrolling, scrollDir }) {
  const accentColor = isDarkMode ? 'var(--orange, #FF4D00)' : '#E04400';
  const bodyFill = isDarkMode ? '#1e293b' : '#334155';
  const bodyStroke = isDarkMode ? 'var(--orange, #FF4D00)' : '#E04400';
  const windowFill = isDarkMode
    ? 'rgba(147, 197, 253, 0.3)'
    : 'rgba(186, 230, 253, 0.45)';
  const rearWindowFill = isDarkMode
    ? 'rgba(147, 197, 253, 0.2)'
    : 'rgba(186, 230, 253, 0.35)';

  return (
    <svg
      viewBox="0 0 22 38"
      width={CAR_WIDTH}
      height={CAR_HEIGHT}
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <filter id="headlightConeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 4 Wheels (corners) */}
      <rect
        x="0"
        y="5"
        width="3"
        height="5"
        rx="1"
        fill={isDarkMode ? '#0f172a' : '#1e293b'}
        stroke={isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'}
        strokeWidth="0.5"
      />
      <rect
        x="19"
        y="5"
        width="3"
        height="5"
        rx="1"
        fill={isDarkMode ? '#0f172a' : '#1e293b'}
        stroke={isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'}
        strokeWidth="0.5"
      />
      <rect
        x="0"
        y="28"
        width="3"
        height="5"
        rx="1"
        fill={isDarkMode ? '#0f172a' : '#1e293b'}
        stroke={isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'}
        strokeWidth="0.5"
      />
      <rect
        x="19"
        y="28"
        width="3"
        height="5"
        rx="1"
        fill={isDarkMode ? '#0f172a' : '#1e293b'}
        stroke={isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'}
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
        stroke={isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'}
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
          opacity="0.6"
        />
      )}

      {/* Tail Lights (Rear = Top of SVG when driving down) */}
      <ellipse
        cx="4.5"
        cy="3.5"
        rx="1.5"
        ry="1"
        fill="#ef4444"
        opacity={isDarkMode ? 0.95 : 0.75}
        filter={isDarkMode ? 'drop-shadow(0 0 2px #dc2626)' : 'none'}
      />
      <ellipse
        cx="17.5"
        cy="3.5"
        rx="1.5"
        ry="1"
        fill="#ef4444"
        opacity={isDarkMode ? 0.95 : 0.75}
        filter={isDarkMode ? 'drop-shadow(0 0 2px #dc2626)' : 'none'}
      />

      {/* Headlights (Front = Bottom of SVG when driving down) */}
      <ellipse
        cx="4.5"
        cy="34.5"
        rx="1.5"
        ry="1"
        fill={isDarkMode ? '#fef08a' : '#e2e8f0'}
        filter={isDarkMode ? 'drop-shadow(0 0 2px #fde047)' : 'none'}
      />
      <ellipse
        cx="17.5"
        cy="34.5"
        rx="1.5"
        ry="1"
        fill={isDarkMode ? '#fef08a' : '#e2e8f0'}
        filter={isDarkMode ? 'drop-shadow(0 0 2px #fde047)' : 'none'}
      />
    </svg>
  );
}

/**
 * CarScrollbar Component
 * Compact, high-precision miniature car scrollbar that behaves exactly like the native scrollbar:
 * - 0 dead zones at top and bottom of the page
 * - Proportional 1:1 mouse tracking when dragging
 * - Instant jump-to-scroll on track click
 * - Slim 12px profile matching native browser scrollbars
 */
export const CarScrollbar = () => {
  const { isDarkMode } = useTheme();

  // State (only triggers re-renders on meaningful UI updates)
  const [isScrolling, setIsScrolling]       = useState(false);
  const [_isDragging, _setIsDragging]       = useState(false);
  const [trackHeight, setTrackHeight]       = useState(0);
  const [isTouch, setIsTouch]               = useState(false);
  const [isHovered, setIsHovered]           = useState(false);

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

  // Hide on touch/mobile devices to preserve native momentum touch scrolling
  useEffect(() => {
    setIsTouch(
      typeof window !== 'undefined' &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    );
  }, []);

  // Compute scroll progress strictly between 0 and 1
  const computeProgress = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.max(0, Math.min(1, window.scrollY / scrollable));
  }, []);

  // Scroll listener (updates targetProgressRef directly with zero state re-renders)
  useEffect(() => {
    if (isTouch) return;

    const onScroll = () => {
      const prog = computeProgress();
      const dir  = window.scrollY >= lastScrollY.current ? 1 : -1;
      lastScrollY.current = window.scrollY;

      targetProgressRef.current = prog;
      scrollDirRef.current = dir;
      setIsScrolling(true);

      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        scrollDirRef.current = 0;
      }, 150);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const initialProg = computeProgress();
    targetProgressRef.current   = initialProg;
    renderedProgressRef.current = initialProg;

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, [computeProgress, isTouch]);

  // Track height measurement (spans full viewport window.innerHeight)
  useEffect(() => {
    const measure = () => {
      if (typeof window !== 'undefined') {
        const height = window.innerHeight;
        trackHeightRef.current = height;
        setTrackHeight(height);
      }
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  }, []);

  // RAF Lerp Animation Loop (runs smoothly at 60/120fps with direct DOM positioning)
  useEffect(() => {
    if (isTouch) return;

    const animate = () => {
      // When dragging, pointer move updates DOM directly for instantaneous 0-lag cursor lock
      if (!isDraggingRef.current) {
        const target  = targetProgressRef.current;
        const current = renderedProgressRef.current;
        const delta   = target - current;

        if (Math.abs(delta) < 0.0001) {
          renderedProgressRef.current = target;
        } else {
          // Snappy 0.25 lerp factor for instant responsive response without jitter
          renderedProgressRef.current = current + delta * 0.25;
        }

        const travel = getAvailableTravel(trackHeightRef.current);
        if (carRef.current && travel > 0) {
          const carY = TRACK_PADDING_TOP + renderedProgressRef.current * travel;
          const clampedY = Math.max(
            TRACK_PADDING_TOP,
            Math.min(TRACK_PADDING_TOP + travel, carY)
          );

          carRef.current.style.top = `${clampedY}px`;

          if (glowRef.current) {
            const glowDir = scrollDirRef.current;
            glowRef.current.style.top =
              glowDir === -1
                ? `${clampedY - 14}px`
                : `${clampedY + CAR_HEIGHT}px`;
          }

          if (exhaustRef.current) {
            const glowDir = scrollDirRef.current;
            exhaustRef.current.style.top =
              glowDir === 1
                ? `${clampedY - 8}px`
                : `${clampedY + CAR_HEIGHT + 2}px`;
          }


        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isTouch]);

  // Click on track to jump directly to target position (like native scrollbar)
  const handleTrackClick = (e) => {
    if (trackHeightRef.current <= 0) return;
    const travel = getAvailableTravel(trackHeightRef.current);
    if (travel <= 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top - TRACK_PADDING_TOP - CAR_HEIGHT / 2;
    const targetProg = Math.max(0, Math.min(1, clickY / travel));

    targetProgressRef.current = targetProg;
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: targetProg * scrollable, behavior: 'smooth' });
  };

  // Drag thumb with Pointer Capture API (locks directly 1:1 to mouse pointer)
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
    const travel = getAvailableTravel(trackHeightRef.current);
    if (travel <= 0) return;

    const deltaY    = e.clientY - dragStartY.current;
    const deltaProg = deltaY / travel;
    const targetProg = Math.max(
      0,
      Math.min(1, dragStartProg.current + deltaProg)
    );

    targetProgressRef.current   = targetProg;
    renderedProgressRef.current = targetProg; // zero lag during direct drag

    // Direct synchronous DOM update for true 0ms cursor alignment
    if (carRef.current) {
      const clampedY = TRACK_PADDING_TOP + targetProg * travel;
      carRef.current.style.top = `${clampedY}px`;
      if (glowRef.current) {
        glowRef.current.style.top = `${clampedY + CAR_HEIGHT}px`;
      }
      if (exhaustRef.current) {
        exhaustRef.current.style.top = `${clampedY - 8}px`;
      }

    }

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

  // Road Lane Center Dashes Style (slender 1px line down the center)
  const laneDashStyle = {
    position: 'absolute',
    left: '50%',
    top: TRACK_PADDING_TOP,
    width: 1,
    height: Math.max(0, trackHeight - TRACK_PADDING_TOP - TRACK_PADDING_BTM),
    background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, ${
      isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
    } 6px, ${
      isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
    } 12px)`,
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
  };

  // Subtle road edge marker dots (spaced evenly)
  const dotStyle = (i) => ({
    position: 'absolute',
    left: 1,
    top: TRACK_PADDING_TOP + (i / 5) * (trackHeight - TRACK_PADDING_TOP - TRACK_PADDING_BTM - 10),
    width: 1.5,
    height: 1.5,
    borderRadius: '50%',
    background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    pointerEvents: 'none',
  });

  // Top Cap
  const topCapStyle = {
    position: 'absolute',
    top: TRACK_PADDING_TOP - 2,
    left: 0,
    width: '100%',
    height: 1,
    background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    pointerEvents: 'none',
  };

  // Bottom Cap
  const bottomCapStyle = {
    position: 'absolute',
    bottom: TRACK_PADDING_BTM - 2,
    left: 0,
    width: '100%',
    height: 1,
    background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    pointerEvents: 'none',
  };

  // Headlight Glow Cone (Dark mode only, scaled for miniature car)
  const headlightGlowStyle = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 12,
    height: 16,
    background:
      'radial-gradient(ellipse at top, rgba(254,240,138,0.2) 0%, transparent 100%)',
    pointerEvents: 'none',
  };

  return (
    /* Main Right-Edge Scrollbar Track */
    <div
      role="scrollbar"
      aria-valuenow={Math.round(targetProgressRef.current * 100)}
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
            ? (isHovered || isDragging ? 'rgba(255, 255, 255, 0.04)' : 'rgba(13, 17, 23, 0.45)')
            : (isHovered || isDragging ? 'rgba(0, 0, 0, 0.04)' : 'rgba(245, 245, 240, 0.55)'),
          borderLeft: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.05)'
            : '1px solid rgba(0, 0, 0, 0.06)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          transition: 'background 0.2s ease',
        }}
        onClick={handleTrackClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slender lane centerline markings */}
        <div style={laneDashStyle} aria-hidden="true" />

        {/* Subtle marker dots */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={dotStyle(i)} aria-hidden="true" />
        ))}

        {/* Top and bottom road terminal caps */}
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

        {/* Directional exhaust puffs container */}
        <div
          ref={exhaustRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: CAR_WIDTH,
            height: 12,
            pointerEvents: 'none',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={isScrolling ? 'exhaust-puff' : 'exhaust-puff-hidden'}
              style={{
                position: 'absolute',
                left: 1 + i * 2.5,
                top: 0,
                width: 2.2 + i * 0.7,
                height: 2.2 + i * 0.7,
                borderRadius: '50%',
                background: isDarkMode
                  ? 'rgba(148, 163, 184, 0.5)'
                  : 'rgba(100, 116, 139, 0.35)',
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>

        {/* The Miniature Car Thumb — positioned along track via direct RAF DOM updates */}
        <div
          ref={carRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: TRACK_PADDING_TOP,
            transform: 'translateX(-50%)',
            cursor: isDragging ? 'grabbing' : 'grab',
            width: CAR_WIDTH,
            height: CAR_HEIGHT,
            userSelect: 'none',
            touchAction: 'none',
            zIndex: 2,
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
      </div>
  );
};

export default CarScrollbar;
