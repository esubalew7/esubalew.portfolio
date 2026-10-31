import React, { useState, useRef, useMemo, useEffect, useCallback, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useContentStore, defaultContent } from '../store/contentStore';
import { useTheme } from '../context/ThemeContext';

// ─── Station Data Builder ─────────────────────────────────────────────────────
// Calculates deterministic world-space coordinates with connected, balanced spacing
// Consumes CMS-driven categories and verified certificates
function buildStations(categories = [], certs = []) {
  const stations = [];
  let xOffset = 0;
  // Compact, connected spacing: cards feel like a cohesive career continuum
  // STANDARD_SPACING = 6.0 gives ~1.4 units gap between inactive cards (~1.12 units when active)
  // CERT_SPACING = 7.5 gives ~1.4 units gap before the wider certificate station
  const STANDARD_SPACING = 6.0;
  const CERT_SPACING = 7.5;

  (categories || []).forEach((cat, catIdx) => {
    (cat.items || []).forEach((item, itemIdx) => {
      stations.push({
        id: item._id || item.id || `station-${catIdx}-${itemIdx}`,
        type: /education/i.test(cat.name || '') ? 'education' : 'work',
        index: stations.length,
        xPos: xOffset,
        role: item.role || item.title || '',
        company: item.company || item.institution || item.organization || '',
        duration: item.duration || item.period || '',
        location: item.location || '',
        bullets: item.bullets || [],
        tags: item.tags || item.skills || [],
        logo: item.logo || '',
        isCurrent: /present/i.test(item.duration || item.period || '') || Boolean(item.current),
        description: item.description || (item.bullets || []).slice(0, 2).join(' '),
      });
      xOffset += STANDARD_SPACING;
    });
  });

  // Certificate station positioned after the last experience station if certificates exist
  if (Array.isArray(certs) && certs.length > 0) {
    const certXPos = stations.length > 0
      ? stations[stations.length - 1].xPos + CERT_SPACING
      : 0;

    stations.push({
      id: 'certificates',
      type: 'certificates',
      index: stations.length,
      xPos: certXPos,
      certs: certs,
    });
  }

  return stations;
}

// ─── WebGL Canvas Error Boundary (Safe Fallback) ──────────────────────────────
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.warn('[ObservatoryCanvas] WebGL context fallback:', err);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ─── Section Header (Positioned with Definite Clearance Below Navbar) ─────────
function SectionHeader({ eyebrow = 'Career Record', title = "Where I've built\nreal systems.", resumeUrl = '/resume.pdf', resumeText = 'Resume' }) {
  const titleLines = String(title).split('\n');

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{
        // Guaranteed breathing room below fixed navbar (~96px)
        top: 'clamp(6.25rem, 11vh, 8.5rem)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start gap-4">
          {/* LEFT: Eyebrow + H2 */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-px bg-accent" />
              <span className="font-code text-[11px] tracking-[0.18em] uppercase text-accent font-semibold">
                {eyebrow}
              </span>
            </div>
            <h2 className="font-sans font-extrabold leading-[1.05] tracking-tight text-[clamp(1.75rem,3.8vw,2.75rem)] text-content-primary">
              {titleLines[0]}
              {titleLines.length > 1 && (
                <>
                  <br />
                  <span className="text-content-muted">{titleLines.slice(1).join(' ')}</span>
                </>
              )}
            </h2>
          </div>

          {/* RIGHT: Resume Button */}
          <a
            href={resumeUrl || '/resume.pdf'}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex items-center gap-2 font-code text-[11px] uppercase tracking-[0.12em] text-content-muted border border-border-default rounded-sm px-3.5 py-2 hover:border-accent hover:text-content-primary transition-colors duration-200 backdrop-blur-md bg-surface-base/80 no-underline cursor-pointer"
          >
            <span>{resumeText || 'Resume'}</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── StarField Component (R3F) ────────────────────────────────────────────────
function StarField({ isDarkMode }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(1200 * 3);
    for (let i = 0; i < 1200; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, []);

  const accentPositions = useMemo(
    () =>
      new Float32Array([
        -8, 3, -5,
        12, -2, -8,
        4, 6, -3,
        22, 4, -4,
      ]),
    []
  );

  return (
    <group>
      {/* Ambient background stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1200}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color={isDarkMode ? '#ffffff' : '#94a3b8'}
          transparent
          opacity={isDarkMode ? 0.6 : 0.25}
          sizeAttenuation
        />
      </points>

      {/* Larger accent orange stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={4}
            array={accentPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.18}
          color="#FF4D00"
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

// ─── CameraRig Component (Responsive Framing & Scroll-Driven Travel) ──────────
function CameraRig({ stations, scrollProgress, inView, isMobile, isTablet }) {
  const { camera } = useThree();
  const targetX = useRef(0);

  // maxX accurately reaches the last station (certificates)
  const maxX = stations.length > 0 ? stations[stations.length - 1].xPos : 0;
  // Responsive camera Z distance: keeps station framed comfortably on all screen ratios
  const targetZ = isMobile ? 12.0 : isTablet ? 9.8 : 8.4;

  useFrame((_, delta) => {
    if (!inView) return;
    targetX.current = scrollProgress * maxX;
    const lerpFactor = Math.min(1, delta * 5.5);

    // Smooth lerp along X axis
    camera.position.x += (targetX.current - camera.position.x) * lerpFactor;

    // Stable Y and Z coordinates: camera looks straight ahead along Z
    camera.position.y += (0 - camera.position.y) * lerpFactor;
    camera.position.z += (targetZ - camera.position.z) * lerpFactor;

    // Look straight ahead at the station plane
    camera.lookAt(camera.position.x, 0, 0);
  });

  return null;
}

// ─── ExperiencePanelContent (HTML with Large, High-Readability Typography & Company Logo) ────
function ExperiencePanelContent({ station, isDarkMode, isMobile, isTablet }) {
  const descriptionSnippet =
    station.description?.length > 140
      ? `${station.description.slice(0, 140)}...`
      : station.description || '';

  // Viewport-aware font sizes for clear readability across all devices
  const stationLabelSize = isMobile ? 11 : isTablet ? 11.5 : 12;
  const durationSize = isMobile ? 11.5 : isTablet ? 12 : 12.5;
  const companySize = isMobile ? 22 : isTablet ? 25 : 27;
  const roleSize = isMobile ? 13.5 : isTablet ? 14.5 : 15.5;
  const descSize = isMobile ? 12.5 : isTablet ? 13 : 13.5;
  const tagSize = isMobile ? 9.5 : isTablet ? 10 : 10.5;
  const hintSize = isMobile ? 10.5 : 11;

  // Responsive logo container dimensions (48–60px)
  const logoBoxSize = isMobile ? 48 : isTablet ? 54 : 60;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: isMobile ? '18px' : '24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Space Grotesk, Outfit, system-ui, sans-serif',
        color: isDarkMode ? '#F0F2F5' : '#0D1117',
        userSelect: 'none',
      }}
    >
      {/* Top Header Row: Station Label + Duration Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: stationLabelSize,
            letterSpacing: '0.16em',
            color: '#FF4D00',
            textTransform: 'uppercase',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
          }}
        >
          {`STATION ${String(station.index + 1).padStart(2, '0')}`}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {station.isCurrent && (
            <span
              className="station-pulse-dot"
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10b981',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
          )}
          <span
            style={{
              fontSize: durationSize,
              letterSpacing: '0.06em',
              color: station.isCurrent
                ? (isDarkMode ? '#10b981' : '#059669')
                : (isDarkMode ? '#8B939E' : '#6b7280'),
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 500,
            }}
          >
            {station.duration || 'Past'}
          </span>
        </div>
      </div>

      {/* Organization Area: Optional Logo + Company Name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 6,
        }}
      >
        {station.logo && (
          <div
            style={{
              width: logoBoxSize,
              height: logoBoxSize,
              flexShrink: 0,
              borderRadius: 8,
              padding: 5,
              backgroundColor: isDarkMode ? '#161B22' : '#ffffff',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <img
              src={station.logo}
              alt={`${station.company} logo`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
              onError={(e) => {
                e.currentTarget.parentElement.style.display = 'none';
              }}
            />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: companySize,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: isDarkMode ? '#ffffff' : '#0D1117',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {station.company}
          </div>

          {station.location && (
            <div
              style={{
                fontSize: 11,
                color: isDarkMode ? '#8B939E' : '#6b7280',
                fontFamily: 'JetBrains Mono, monospace',
                marginTop: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {station.location}
            </div>
          )}
        </div>
      </div>

      {/* Role Title: 14–16px, readable subtitle */}
      <div
        style={{
          fontSize: roleSize,
          fontWeight: 600,
          color: isDarkMode ? '#D0D7DE' : '#24292F',
          marginBottom: 10,
          lineHeight: 1.35,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {station.role}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          marginBottom: 10,
        }}
      />

      {/* Description: 13–14px, controlled 3-line clamp */}
      {descriptionSnippet && (
        <div
          style={{
            fontSize: descSize,
            lineHeight: 1.55,
            color: isDarkMode ? '#8B939E' : '#52596A',
            marginBottom: 10,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {descriptionSnippet}
        </div>
      )}

      {/* Tech Tags: 10–11px, compact JetBrains Mono */}
      {station.tags?.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 5,
            marginBottom: 10,
          }}
        >
          {station.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: tagSize,
                padding: '3px 8px',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                borderRadius: 3,
                color: isDarkMode ? '#8B939E' : '#52596A',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Click Hint: 10.5–11px, JetBrains Mono */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 'auto',
          paddingTop: 6,
          fontSize: hintSize,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#FF4D00',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 600,
        }}
      >
        <span>↗ TAP TO EXPAND</span>
      </div>
    </div>
  );
}

// ─── CertificatesPanelContent (HTML in R3F with Certificate Image Previews) ───
function CertificatesPanelContent({ station, isDarkMode, isMobile }) {
  const certs = station.certs || [];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: isMobile ? '16px' : '24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Space Grotesk, Outfit, system-ui, sans-serif',
        color: isDarkMode ? '#F0F2F5' : '#0D1117',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.16em',
          color: '#FF4D00',
          textTransform: 'uppercase',
          marginBottom: 4,
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 600,
        }}
      >
        CREDENTIALS RECORD
      </div>
      <div
        style={{
          fontSize: isMobile ? 20 : 25,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          marginBottom: 12,
          color: isDarkMode ? '#ffffff' : '#0D1117',
        }}
      >
        Verified Certifications
      </div>

      {/* 2x2 Certificate Cards Grid with Image Previews */}
      {certs.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: isDarkMode ? '#8B939E' : '#6b7280' }}>
            Certifications will be added soon.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 8 : 12,
            flex: 1,
          }}
        >
        {certs.slice(0, 4).map((cert) => (
          <div
            key={cert.id || cert.name}
            style={{
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderRadius: 4,
              padding: isMobile ? '8px' : '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              overflow: 'hidden',
            }}
          >
            <div>
              {/* Real Certificate Image Preview */}
              {cert.image && (
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '16 / 10',
                    borderRadius: 3,
                    overflow: 'hidden',
                    marginBottom: 8,
                    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                    backgroundColor: isDarkMode ? '#10141d' : '#f0f2f5',
                  }}
                >
                  <img
                    src={cert.image}
                    alt={`${cert.name} certificate issued by ${cert.issuer}`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                    onError={(e) => {
                      // Graceful fallback: hide broken image container
                      e.currentTarget.parentElement.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Issuer & Date */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 3,
                }}
              >
                <span
                  style={{
                    fontSize: 9.5,
                    letterSpacing: '0.1em',
                    color: cert.issuerColor || cert.color || '#FF4D00',
                    textTransform: 'uppercase',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                  }}
                >
                  {cert.issuer}
                </span>
                <span
                  style={{
                    fontSize: 9.5,
                    color: isDarkMode ? '#8B939E' : '#6b7280',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {cert.date}
                </span>
              </div>

              {/* Certificate Title */}
              <div
                style={{
                  fontSize: isMobile ? 11.5 : 13,
                  fontWeight: 700,
                  color: isDarkMode ? '#F0F2F5' : '#0D1117',
                  lineHeight: 1.25,
                  marginBottom: 4,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {cert.name}
              </div>
            </div>

            {/* Bottom Accent line */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 6,
                borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  color: isDarkMode ? '#8B939E' : '#6b7280',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {(cert.skills || []).slice(0, 2).join(' · ')}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: '#FF4D00',
                  fontFamily: 'JetBrains Mono, monospace',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Verified →
              </span>
            </div>
          </div>
        ))}
      </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 12,
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#FF4D00',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 600,
        }}
      >
        <span>↗ TAP TO EXPAND</span>
      </div>
    </div>
  );
}

// ─── StationPanel Component (3D Mesh + Drei <Html> Overlay) ───────────────────
function StationPanel({
  station,
  isDarkMode,
  onSelect,
  activeId,
  inView,
  isMobile,
  isTablet,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const isActive = activeId === station.id;
  const isAnyActive = Boolean(activeId);
  const isCerts = station.type === 'certificates';

  // Responsive station Y position for guaranteed navbar clearance:
  // Positions station lower in the viewport safe area so top of card never reaches navbar
  const stationY = isMobile ? -0.55 : isTablet ? -0.60 : -0.65;

  // Responsive world-space geometry dimensions: 1 unit = 100 CSS px with distanceFactor={4}
  const W = isCerts
    ? (isMobile ? 4.6 : isTablet ? 7.2 : 7.6)
    : (isMobile ? 4.0 : isTablet ? 4.4 : 4.6);
  const H = 5.8;

  const W_PX = Math.round(W * 100);
  const H_PX = Math.round(H * 100);

  // Controlled active & hover scaling: active brings card forward without ballooning
  const scaleTarget = isActive
    ? (isCerts || isMobile ? 1.05 : 1.08)
    : isAnyActive
    ? 0.95
    : hovered
    ? 1.03
    : 1.0;

  const zTarget = isActive
    ? 1.4
    : isAnyActive
    ? -0.4
    : hovered
    ? 0.3
    : 0;

  const rotYTarget = isActive
    ? 0
    : hovered
    ? -0.02
    : -0.05;

  const opacityTarget = isActive
    ? 1.0
    : isAnyActive
    ? 0.4
    : 0.95;

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current || !inView) return;
    const m = meshRef.current;
    const lerpFactor = Math.min(1, delta * 7.5);
    m.scale.x += (scaleTarget - m.scale.x) * lerpFactor;
    m.scale.y += (scaleTarget - m.scale.y) * lerpFactor;
    m.position.z += (zTarget - m.position.z) * lerpFactor;
    m.rotation.y += (rotYTarget - m.rotation.y) * lerpFactor;
  });

  const borderColor = isActive || hovered
    ? '#FF4D00'
    : isDarkMode
    ? '#1c2030'
    : '#e2e8f0';

  return (
    <group
      ref={meshRef}
      position={[station.xPos, stationY, 0]}
    >
      {/* 3D Physical Background Mesh */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(station);
        }}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial
          color={isDarkMode ? '#0D1117' : '#FAFAF8'}
          roughness={0.7}
          metalness={0.1}
          transparent
          opacity={opacityTarget}
        />
      </mesh>

      {/* Frame Border Edges */}
      {/* Top Edge */}
      <mesh position={[0, H / 2, 0.002]}>
        <boxGeometry args={[W, 0.03, 0.01]} />
        <meshBasicMaterial color={borderColor} />
      </mesh>
      {/* Bottom Edge */}
      <mesh position={[0, -H / 2, 0.002]}>
        <boxGeometry args={[W, 0.03, 0.01]} />
        <meshBasicMaterial color={isDarkMode ? '#1c2030' : '#e2e8f0'} />
      </mesh>
      {/* Left Edge */}
      <mesh position={[-W / 2, 0, 0.002]}>
        <boxGeometry args={[0.03, H, 0.01]} />
        <meshBasicMaterial color={isDarkMode ? '#1c2030' : '#e2e8f0'} />
      </mesh>
      {/* Right Edge */}
      <mesh position={[W / 2, 0, 0.002]}>
        <boxGeometry args={[0.03, H, 0.01]} />
        <meshBasicMaterial color={isDarkMode ? '#1c2030' : '#e2e8f0'} />
      </mesh>

      {/* Top Accent Bar in #FF4D00 */}
      <mesh position={[0, H / 2 - 0.06, 0.004]}>
        <boxGeometry args={[W * 0.35, 0.02, 0.01]} />
        <meshBasicMaterial color="#FF4D00" />
      </mesh>

      {/* Active Accent Glow Ring */}
      {isActive && (
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[W + 0.16, H + 0.16]} />
          <meshBasicMaterial color="#FF4D00" transparent opacity={0.35} />
        </mesh>
      )}

      {/* HTML Content with exact 1 unit = 100px scaling via distanceFactor={4} */}
      <Html
        transform
        distanceFactor={4}
        position={[0, 0, 0.03]}
        zIndexRange={isActive ? [80, 100] : [10, 50]}
        style={{
          width: `${W_PX}px`,
          height: `${H_PX}px`,
          boxSizing: 'border-box',
          pointerEvents: 'auto',
          cursor: 'pointer',
          opacity: opacityTarget,
          transition: 'opacity 0.25s ease',
        }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label={`Open details for ${station.company || 'Certificates'}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(station);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(station);
            }
          }}
          onMouseEnter={() => {
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onMouseLeave={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
          style={{
            width: '100%',
            height: '100%',
            outline: 'none',
          }}
        >
          {isCerts ? (
            <CertificatesPanelContent
              station={station}
              isDarkMode={isDarkMode}
              isMobile={isMobile}
            />
          ) : (
            <ExperiencePanelContent
              station={station}
              isDarkMode={isDarkMode}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          )}
        </div>
      </Html>
    </group>
  );
}

// ─── ObservatoryCanvas Component (Uniform Across All Devices) ─────────────────
function ObservatoryCanvas({
  stations,
  scrollProgress,
  isDarkMode,
  onSelect,
  activeId,
  inView,
  isMobile,
  isTablet,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: isDarkMode ? '#080A0E' : '#F5F5F0',
        transition: 'background-color 0.3s',
      }}
    >
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        camera={{
          position: [0, 0, isMobile ? 12.0 : isTablet ? 9.8 : 8.4],
          fov: 50,
        }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
      >
        <color attach="background" args={[isDarkMode ? '#080A0E' : '#F5F5F0']} />
        <fog attach="fog" args={[isDarkMode ? '#080A0E' : '#F5F5F0', 22, 50]} />

        <Suspense fallback={null}>
          <StarField isDarkMode={isDarkMode} />
          <CameraRig
            stations={stations}
            scrollProgress={scrollProgress}
            inView={inView}
            isMobile={isMobile}
            isTablet={isTablet}
          />
          {stations.map((station) => (
            <StationPanel
              key={station.id}
              station={station}
              isDarkMode={isDarkMode}
              onSelect={onSelect}
              activeId={activeId}
              inView={inView}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          ))}
          <ambientLight intensity={isDarkMode ? 0.45 : 0.75} />
          <directionalLight
            position={[5, 6, 6]}
            intensity={isDarkMode ? 0.85 : 1.0}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// ─── StationDetail (DOM Overlay with Certificate Zoom & Accessibility) ────────
function StationDetail({ station, onClose, isDarkMode }) {
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (previewImage) {
          setPreviewImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Prevent background scrolling while modal drawer is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, previewImage]);

  const isCerts = station.type === 'certificates';

  const drawer = (
    <div className="station-detail-root">
      {/* Backdrop — clicks close the drawer */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ zIndex: 1100 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <motion.div
        key="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={station.company ? `${station.company} details` : 'Credentials record'}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        style={{
          zIndex: 1101,
          backgroundColor: isDarkMode
            ? 'rgba(13, 17, 23, 0.98)'
            : 'rgba(250, 250, 248, 0.98)',
        }}
        className="station-detail-panel fixed right-0 top-0 bottom-0 w-full max-w-[520px] h-[100dvh] shadow-2xl border-l border-border-default flex flex-col"
      >
        {/* Sticky Header with Close Button */}
        <div
          className="sticky top-0 z-[1102] flex items-center justify-between px-6 py-4 border-b border-border-subtle"
          style={{
            backgroundColor: isDarkMode
              ? 'rgba(13, 17, 23, 0.96)'
              : 'rgba(250, 250, 248, 0.96)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Station index label */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-code text-[11px] uppercase tracking-[0.18em] text-accent font-semibold">
              Station {String(station.index + 1).padStart(2, '0')}&nbsp;·&nbsp;{station.type}
            </span>
          </div>

          {/* Close button with min 44x44px touch target */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close experience details"
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-sm border border-border-default text-content-secondary hover:text-content-primary hover:border-accent hover:bg-surface-raised bg-surface-base transition-colors duration-200 cursor-pointer flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 space-y-6">
          {/* Company, Optional Logo & Role */}
          <div className="flex items-start gap-4">
            {station.logo && !isCerts && (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-border-default bg-surface-base p-2 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                <img
                  src={station.logo}
                  alt={`${station.company} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.parentElement.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-content-primary leading-tight">
                {station.company || (isCerts ? 'Credentials Record' : '')}
              </h3>
              {station.role && (
                <div className="font-sans text-base text-content-secondary mt-1 font-medium">
                  {station.role}
                </div>
              )}
            </div>
          </div>

          {/* Duration + Location */}
          {!isCerts && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 font-code text-[11px]">
                {station.isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block flex-shrink-0" />
                )}
                <span className={station.isCurrent ? 'text-success font-semibold' : 'text-content-muted'}>
                  {station.duration || 'Past'}
                </span>
              </div>
              {station.location && (
                <div className="flex items-center gap-1.5 font-code text-[11px] text-content-muted">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>{station.location}</span>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-border-subtle" />

          {/* Work / Education details */}
          {!isCerts && (
            <>
              {station.description && (
                <p className="font-sans text-[0.95rem] leading-relaxed text-content-secondary">
                  {station.description}
                </p>
              )}

              {station.bullets?.length > 0 && (
                <div>
                  <div className="font-code text-[10px] uppercase tracking-[0.16em] text-accent font-semibold mb-3">
                    Key Responsibilities & Impact
                  </div>
                  <div className="space-y-3">
                    {station.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="text-accent font-code text-[13px] mt-0.5 flex-shrink-0">→</span>
                        <span className="font-sans text-[0.92rem] text-content-secondary leading-relaxed">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {station.tags?.length > 0 && (
                <div>
                  <div className="font-code text-[10px] uppercase tracking-[0.16em] text-content-muted font-semibold mb-3">
                    Technologies & Architecture
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {station.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-code text-[11px] uppercase tracking-wider px-3 py-1 rounded-sm border border-border-subtle bg-surface-raised text-content-secondary hover:border-accent hover:text-accent transition-colors duration-150"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Certificates details with Real Images & Click to Enlarge */}
          {isCerts && station.certs?.length > 0 && (
            <div className="space-y-4">
              {station.certs.map((cert) => (
                <div
                  key={cert.id || cert.name}
                  className="p-4 border border-border-subtle rounded-sm bg-surface-raised flex flex-col gap-3"
                >
                  {/* Certificate Image Preview with click-to-enlarge action */}
                  {cert.image && (
                    <div
                      className="relative w-full aspect-[16/10] rounded-sm overflow-hidden border border-border-subtle bg-black/30 cursor-pointer group"
                      onClick={() => setPreviewImage(cert.image)}
                    >
                      <img
                        src={cert.image}
                        alt={`${cert.name} certificate issued by ${cert.issuer}`}
                        loading="lazy"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.parentElement.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-code text-[10px] uppercase tracking-wider">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                        <span>Click to Enlarge</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span
                        style={{ color: cert.issuerColor || cert.color || '#FF4D00' }}
                        className="font-code text-[10px] uppercase tracking-wider font-bold"
                      >
                        {cert.issuer}
                      </span>
                      <span className="font-code text-[10px] text-content-muted flex-shrink-0">
                        {cert.date}
                      </span>
                    </div>
                    <h4 className="font-sans font-bold text-base text-content-primary mb-2 leading-snug">
                      {cert.name}
                    </h4>
                    {cert.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {cert.skills.map((skill) => (
                          <span
                            key={skill}
                            className="font-code text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm border border-border-subtle bg-surface-base text-content-muted"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-border-subtle flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-code text-[10px] text-content-muted">
                        Verified
                      </span>
                    </div>
                    <a
                      href={cert.credentialUrl || cert.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-code text-[10px] uppercase tracking-wider text-accent hover:underline flex items-center gap-1 transition-colors duration-150"
                    >
                      <span>View Credential</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Accessible Enlarged Certificate Image Viewer Modal */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Certificate Image Viewer"
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-surface-base border border-border-default rounded-sm p-2 flex flex-col items-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              aria-label="Close certificate preview"
              className="absolute -top-3 -right-3 w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-surface-raised border border-border-default text-content-primary hover:border-accent hover:text-accent flex items-center justify-center cursor-pointer shadow-lg z-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={previewImage}
              alt="Enlarged certificate preview"
              className="max-h-[80vh] w-auto object-contain rounded-xs"
            />
          </div>
        </div>
      )}
    </div>
  );

  // Mount directly into document.body to escape all parent stacking contexts
  return createPortal(
    <AnimatePresence>{drawer}</AnimatePresence>,
    document.body
  );
}

// ─── ScrollHint Component (DOM Overlay) ───────────────────────────────────────
function ScrollHint({ progress, total }) {
  const activeStationIndex = Math.min(
    total - 1,
    Math.max(0, Math.round(progress * (total - 1)))
  );
  const isAtStart = progress < 0.05;

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-1.5">
      {/* Progress Dots */}
      <div className="flex gap-2 items-center">
        {Array.from({ length: total }).map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 transition-all duration-300 rounded-full ${
              idx === activeStationIndex
                ? 'w-8 bg-accent'
                : 'w-1.5 bg-border-default'
            }`}
          />
        ))}
      </div>

      {/* Index Progress */}
      <div className="font-code text-[10px] text-content-muted uppercase tracking-[0.14em]">
        {activeStationIndex + 1} / {total}
      </div>

      {/* Scroll Down Hint */}
      {isAtStart && (
        <div className="flex flex-col items-center mt-0.5 text-content-muted animate-pulse">
          <span className="font-code text-[8px] uppercase tracking-widest mb-0.5">Scroll</span>
          <svg className="w-3.5 h-3.5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ─── MobileExperienceList Component (Strictly Fallback for WebGL Failure) ─────
function MobileExperienceList({ stations, eyebrow = 'Career Record', title = "Where I've built\nreal systems.", resumeUrl = '/resume.pdf', resumeText = 'Resume', isDarkMode }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const titleLines = String(title).split('\n');
  const workAndEduStations = stations.filter((s) => s.type !== 'certificates');
  const certStation = stations.find((s) => s.type === 'certificates');

  return (
    <div className="py-20 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-px bg-accent" />
            <span className="font-code text-[11px] tracking-[0.18em] uppercase text-accent font-semibold">
              {eyebrow}
            </span>
          </div>
          <h2 className="font-sans font-extrabold leading-[1.0] tracking-tight text-3xl text-content-primary">
            {titleLines[0]}
            {titleLines.length > 1 && (
              <>
                <br />
                <span className="text-content-muted">{titleLines.slice(1).join(' ')}</span>
              </>
            )}
          </h2>
        </div>

        <a
          href={resumeUrl || '/resume.pdf'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-code text-[10px] uppercase tracking-[0.12em] text-content-muted border border-border-default rounded-sm px-3 py-1.5 hover:border-accent hover:text-content-primary transition-colors duration-200 no-underline"
        >
          <span>{resumeText || 'Resume'}</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </a>
      </div>

      {/* Stations Accordion with semantic <button> elements */}
      <div className="space-y-4">
        {workAndEduStations.map((station) => {
          const isExpanded = expandedId === station.id;
          return (
            <div key={station.id} className="border-b border-border-subtle py-5">
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => toggleExpand(station.id)}
                className="w-full text-left cursor-pointer select-none bg-transparent border-0 p-0 focus:outline-none"
              >
                {/* Date & Type Indicator */}
                <div className="flex items-center gap-2 mb-2 font-code text-[11px]">
                  {station.isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block flex-shrink-0" />
                  )}
                  <span className={station.isCurrent ? 'text-success font-semibold' : 'text-content-muted'}>
                    {station.duration || 'Past'}
                  </span>
                  <span className="text-content-muted opacity-40">·</span>
                  <span className="text-content-muted font-code text-[10px] uppercase tracking-wider">
                    {station.type}
                  </span>
                </div>

                {/* Company & Role with Optional Logo */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    {station.logo && (
                      <div className="w-11 h-11 rounded-lg border border-border-default bg-surface-base p-1.5 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                        <img
                          src={station.logo}
                          alt={`${station.company} logo`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.parentElement.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-sans font-bold text-xl text-content-primary leading-snug">
                        {station.company}
                      </h3>
                      <div className="font-sans text-sm text-content-secondary mt-0.5 font-medium">
                        {station.role}
                      </div>
                    </div>
                  </div>

                  <div className={`w-5 h-5 text-content-muted transition-transform duration-300 mt-1 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Tags preview */}
                {station.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {station.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="font-code text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm border border-border-subtle bg-surface-raised text-content-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>

              {/* Collapsible Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mt-4 pt-4 border-t border-border-subtle/50 space-y-4"
                  >
                    {station.description && (
                      <p className="font-sans text-[0.92rem] text-content-secondary leading-relaxed">
                        {station.description}
                      </p>
                    )}

                    {station.bullets?.length > 0 && (
                      <div className="space-y-2.5">
                        <div className="font-code text-[10px] uppercase tracking-[0.16em] text-accent font-semibold">
                          Responsibilities
                        </div>
                        {station.bullets.map((bullet, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <span className="text-accent font-code text-[12px] flex-shrink-0 mt-[1px]">
                              →
                            </span>
                            <span className="font-sans text-[0.88rem] text-content-secondary leading-relaxed">
                              {bullet}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Certifications Block */}
      {certStation?.certs?.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border-subtle">
          <div className="flex items-center gap-2 mb-2 font-code text-[10px] uppercase tracking-[0.16em] text-accent font-semibold">
            Station {String(certStation.index + 1).padStart(2, '0')} · Credentials
          </div>
          <h3 className="font-sans font-bold text-xl text-content-primary mb-6">
            Certifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {certStation.certs.map((cert) => (
              <div
                key={cert.id || cert.name}
                className="p-4 border border-border-subtle rounded-sm bg-surface-raised flex flex-col justify-between"
              >
                <div>
                  {cert.image && (
                    <div className="w-full aspect-[16/10] rounded-sm overflow-hidden mb-3 border border-border-subtle">
                      <img
                        src={cert.image}
                        alt={`${cert.name} certificate issued by ${cert.issuer}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.parentElement.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-2">
                    <span
                      style={{ color: cert.issuerColor || cert.color || '#FF4D00' }}
                      className="font-code text-[10px] uppercase tracking-wider font-bold"
                    >
                      {cert.issuer}
                    </span>
                    <span className="font-code text-[10px] text-content-muted">
                      {cert.date}
                    </span>
                  </div>
                  <h4 className="font-sans font-bold text-sm text-content-primary mt-1 mb-2">
                    {cert.name}
                  </h4>
                  {cert.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {cert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="font-code text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-border-subtle bg-surface-base text-content-muted"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-border-subtle flex justify-end">
                  <a
                    href={cert.credentialUrl || cert.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-code text-[9px] uppercase tracking-wider text-accent hover:underline flex items-center gap-1"
                  >
                    <span>Verify</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ExperienceSection Export ───────────────────────────────────────────
export const ExperienceSection = () => {
  const { content } = useContentStore();
  const { isDarkMode } = useTheme();
  const scrollContainerRef = useRef(null);
  const sectionRef = useRef(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStation, setActiveStation] = useState(null);
  const [inView, setInView] = useState(true);

  // Responsive device classification for camera distance, station Y, and typography sizing:
  // Mobile (< 768px), Tablet (768px - 1023px), Desktop (>= 1024px)
  // All devices use the SAME 3D Observatory experience!
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );
  const [isTablet, setIsTablet] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024
  );

  useEffect(() => {
    const mobileMq = window.matchMedia('(max-width: 767px)');
    const tabletMq = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');

    const handleMobile = (e) => setIsMobile(e.matches);
    const handleTablet = (e) => setIsTablet(e.matches);

    setIsMobile(mobileMq.matches);
    setIsTablet(tabletMq.matches);

    mobileMq.addEventListener('change', handleMobile);
    tabletMq.addEventListener('change', handleTablet);

    return () => {
      mobileMq.removeEventListener('change', handleMobile);
      tabletMq.removeEventListener('change', handleTablet);
    };
  }, []);

  // IntersectionObserver to pause rendering when section is scrolled out of view
  useEffect(() => {
    const target = scrollContainerRef.current || sectionRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Prepare stations data
  const categories = content?.experience?.categories || [];
  const certs = content?.certificates || [];

  const eyebrow = content?.experience?.eyebrow || 'Career Record';
  const title = content?.experience?.title || "Where I've built\nreal systems.";
  const resumeUrl = content?.experience?.resumeUrl || content?.resume?.url || '/resume.pdf';
  const resumeText = content?.experience?.resumeText || 'Resume';

  const stations = useMemo(() => buildStations(categories, certs), [
    categories,
    certs,
  ]);
  const stationCount = stations.length;

  // Scroll listener for 3D camera travel (desktop/tablet only, RAF throttled)
  useEffect(() => {
    if (isMobile || !inView) return;

    let ticking = false;
    let rafId = null;

    const updateScrollProgress = () => {
      if (!scrollContainerRef.current) {
        ticking = false;
        return;
      }
      const el = scrollContainerRef.current;
      const rect = el.getBoundingClientRect();
      const totalScrollable = el.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) {
        ticking = false;
        return;
      }
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      setScrollProgress(progress);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(updateScrollProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [stationCount, isMobile, inView]);

  if (stationCount === 0) {
    return (
      <section
        id="experience"
        ref={sectionRef}
        className="bg-canvas py-32 px-4 sm:px-6 relative"
        style={{ isolation: 'isolate' }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-default font-code text-[11px] uppercase tracking-wider text-accent">
            <span>{eyebrow}</span>
          </div>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-content-primary">
            {title.replace('\n', ' ')}
          </h2>
          <p className="font-sans text-content-secondary text-sm max-w-md mx-auto">
            Career record is currently being updated.
          </p>
        </div>
      </section>
    );
  }

  // Mobile layout: render lightweight dedicated mobile experience list directly
  // Avoids mounting expensive 3D Canvas, 600vh scroll container, and Drei <Html> projections
  if (isMobile) {
    return (
      <section
        id="experience"
        ref={sectionRef}
        className="bg-canvas relative"
        style={{ isolation: 'isolate' }}
      >
        <MobileExperienceList
          stations={stations}
          eyebrow={eyebrow}
          title={title}
          resumeUrl={resumeUrl}
          resumeText={resumeText}
          isDarkMode={isDarkMode}
        />
      </section>
    );
  }

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="bg-canvas relative"
      style={{ isolation: 'isolate' }}
    >
      {/* Scroll spacer creating vertical scrollable height */}
      <div
        ref={scrollContainerRef}
        style={{ height: `${(stationCount + 1) * 100}vh` }}
        className="relative"
      >
        {/* Sticky viewport container with dynamic viewport support */}
        <div
          className="sticky w-full overflow-hidden"
          style={{
            top: 0,
            height: '100vh',
            height: '100dvh',
          }}
        >
          {/* Section header with clearance below navbar */}
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            resumeUrl={resumeUrl}
            resumeText={resumeText}
          />

          {/* Full-bleed R3F Canvas: UNIFORM across Desktop, Tablet, and Mobile */}
          <CanvasErrorBoundary
            fallback={
              <MobileExperienceList
                stations={stations}
                eyebrow={eyebrow}
                title={title}
                resumeUrl={resumeUrl}
                resumeText={resumeText}
                isDarkMode={isDarkMode}
              />
            }
          >
            <ObservatoryCanvas
              stations={stations}
              scrollProgress={scrollProgress}
              isDarkMode={isDarkMode}
              onSelect={setActiveStation}
              activeId={activeStation?.id}
              inView={inView}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </CanvasErrorBoundary>

          {/* Scroll hint indicator */}
          <ScrollHint progress={scrollProgress} total={stationCount} />
        </div>
      </div>

      {/* Station detail slide-out drawer (Portaled to document.body) */}
      <AnimatePresence>
        {activeStation && (
          <StationDetail
            station={activeStation}
            onClose={() => setActiveStation(null)}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default ExperienceSection;
