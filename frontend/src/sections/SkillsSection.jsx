/**
 * OrbitalSkillsSection.jsx
 *
 * Design: A 3D heliocentric orbital system.
 * - Central core = "FULL STACK" nucleus with a wireframe geodesic shell (Three.js, lazy-loaded)
 * - 4 elliptical orbits, each tilted at a different angle (CSS 3D perspective)
 * - Each node = official tech icon (inline SVG, no external CDN dependency)
 * - Nodes spin around their orbit continuously on GPU (CSS animation, zero JS per-frame)
 * - Hover a node → it lifts out of orbit, glows, shows a tooltip card
 * - CMS-driven: reads from contentStore skills.categories — falls back to full hardcoded set
 * - Admin note: categories order in CMS controls orbit assignment
 *
 * Performance:
 * - Orbits are pure CSS transforms + animation → zero JS per frame
 * - Central wireframe is one Three.js BufferGeometry → ~3 draw calls
 * - DPR clamped to 1.5
 * - IntersectionObserver halts wireframe loop when off-screen
 * - prefers-reduced-motion: pauses all orbit animations, keeps static layout
 */

import { useRef, useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

// ─── DESIGN TOKENS (matches portfolio system) ─────────────────────────────
const T = {
  void: '#0C0A08',
  ink: '#111009',
  inkRaised: '#1A1712',
  inkFloat: '#232018',
  primary: '#F2EDE6',
  secondary: '#8A8278',
  muted: '#4D4843',
  accent: '#D4860A',   // Precision Amber
  accentGlow: 'rgba(212,134,10,0.22)',
  border: 'rgba(242,237,230,0.07)',
  borderSub: 'rgba(242,237,230,0.12)',
};

// ─── OFFICIAL TECH ICONS (inline SVG paths, brand colours) ────────────────
const ICONS = {
  JavaScript: {
    color: '#F7DF1E', bg: '#323330',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
        <rect width="32" height="32" fill="#323330" />
        <path d="M6 6h20v20H6z" fill="#F7DF1E" />
        <path d="M20.5 22.5c.4.7 1 1.2 2 1.2 1 0 1.5-.5 1.5-1.2 0-.8-.6-1.1-1.6-1.6l-.5-.2c-1.6-.7-2.6-1.5-2.6-3.3 0-1.6 1.2-2.9 3.1-2.9 1.3 0 2.3.5 3 1.5l-1.6 1c-.4-.7-.8-.9-1.4-.9-.7 0-1.1.4-1.1 1 0 .7.4 1 1.4 1.4l.5.2c1.9.8 2.9 1.6 2.9 3.4 0 2-1.5 3.1-3.6 3.1-2 0-3.3-1-3.9-2.2l1.9-1.5zM11.5 22.7c.3.5.6.9 1.2.9.6 0 1-.2 1-1.1v-6.1h2.1V22.5c0 1.9-1.1 2.7-2.7 2.7-1.4 0-2.3-.8-2.7-1.7l1.1-1.8z" fill="#323330" />
      </svg>
    ),
  },
  TypeScript: {
    color: '#3178C6', bg: '#1a1a1a',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#3178C6" />
        <path d="M18.2 23.4v2.1c.4.2.8.3 1.3.4.5.1 1 .1 1.5.1.5 0 1-.1 1.5-.2.5-.1.9-.3 1.2-.6.3-.3.6-.6.8-1 .2-.4.3-.9.3-1.5 0-.4 0-.8-.1-1.1-.1-.3-.3-.6-.5-.9-.2-.3-.5-.5-.9-.7-.4-.2-.8-.4-1.4-.6-.4-.1-.7-.3-1-.4-.3-.1-.5-.2-.6-.3-.2-.1-.3-.2-.4-.4-.1-.1-.1-.3-.1-.5 0-.2 0-.3.1-.5.1-.1.2-.2.3-.3.1-.1.3-.1.5-.2.2 0 .4-.1.6-.1.2 0 .4 0 .6.1.2 0 .4.1.5.2.2.1.3.2.5.3.1.1.3.3.4.4v-2c-.3-.1-.7-.2-1.1-.3-.4-.1-.9-.1-1.3-.1-.5 0-1 .1-1.4.2-.4.1-.8.3-1.1.6-.3.3-.6.6-.8 1-.2.4-.3.9-.3 1.4 0 .7.2 1.3.5 1.7.4.4.9.8 1.7 1.1.4.2.8.3 1.1.4.3.1.5.2.7.4.2.1.3.3.4.4.1.2.1.3.1.5 0 .2 0 .3-.1.5-.1.2-.2.3-.3.4-.1.1-.3.2-.5.2-.2 0-.5.1-.7.1-.5 0-.9-.1-1.4-.3-.4-.3-.8-.6-1.1-1zM14.1 17H17v-2H8v2h2.9v9h3.2v-9z" fill="white" />
      </svg>
    ),
  },
  React: {
    color: '#61DAFB', bg: '#20232a',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#20232a" />
        <circle cx="16" cy="16" r="2.2" fill="#61DAFB" />
        <ellipse cx="16" cy="16" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.1" fill="none" />
        <ellipse cx="16" cy="16" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.1" fill="none" transform="rotate(60 16 16)" />
        <ellipse cx="16" cy="16" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.1" fill="none" transform="rotate(120 16 16)" />
      </svg>
    ),
  },
  'Next.js': {
    color: '#ffffff', bg: '#000000',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#000" />
        <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm4.8 16.8L11.2 9.6H9.6v12.8h1.6V11.9l8.9 11.5c.2-.2.5-.4.7-.6z" fill="white" />
        <path d="M20.8 9.6h1.6v12.8h-1.6z" fill="white" />
      </svg>
    ),
  },
  'Node.js': {
    color: '#3C873A', bg: '#1a1a1a',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#1a1a1a" />
        <path d="M16 4L5 10v12l11 6 11-6V10L16 4zm0 2.2l9 4.9v10l-9 4.9-9-4.9v-10l9-4.9z" fill="#3C873A" />
        <path d="M16 8.5l-6.5 3.7v7.5l6.5 3.7 6.5-3.7v-7.5L16 8.5zm0 2l4.5 2.6v5l-4.5 2.6-4.5-2.6v-5L16 10.5z" fill="#3C873A" opacity="0.6" />
      </svg>
    ),
  },
  Express: {
    color: '#CCCCCC', bg: '#1a1a1a',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#1a1a1a" />
        <text x="4" y="20" fontFamily="monospace" fontWeight="bold" fontSize="9" fill="#CCCCCC">EXP</text>
        <path d="M4 22h24" stroke="#CCCCCC" strokeWidth="1.2" />
      </svg>
    ),
  },
  NestJS: {
    color: '#E0234E', bg: '#1a0a0e',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#1a0a0e" />
        <path d="M20.5 8.5c-1-1.5-2.5-2.5-4-2.8 .5.8.7 1.7.5 2.6C15.5 7 14 6.5 12.5 6.5c-3.3 0-6 2.7-6 6 0 .8.2 1.6.5 2.3.8-1.5 2.3-2.5 4-2.5.8 0 1.5.2 2.1.6-.4.6-.7 1.4-.7 2.1 0 2.2 1.8 4 4 4 1.1 0 2.1-.4 2.8-1.1 1.5-1.2 2.3-3 2.3-5 0-1.7-.6-3.3-1-4.4z" fill="#E0234E" />
        <path d="M19.5 14.5c0 1.9-1.6 3.5-3.5 3.5s-3.5-1.6-3.5-3.5 1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5z" fill="#E0234E" opacity="0.5" />
      </svg>
    ),
  },
  MongoDB: {
    color: '#47A248', bg: '#0d1a0d',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#0d1a0d" />
        <path d="M16 4c-1 3-4.5 5.5-4.5 10.5 0 2.5 1 4.7 2.5 6.2v4.3c0 .6.4 1 1 1s1-.4 1-1v-4.3c1.5-1.5 2.5-3.7 2.5-6.2C18.5 9.5 17 7 16 4z" fill="#47A248" />
        <path d="M16 4c1 3 2.5 5 3.5 8-1.5.5-2.5.5-3.5.5V4z" fill="#47A248" opacity="0.6" />
      </svg>
    ),
  },
  PostgreSQL: {
    color: '#336791', bg: '#0d1520',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#0d1520" />
        <ellipse cx="16" cy="10" rx="8" ry="5" stroke="#336791" strokeWidth="1.5" fill="none" />
        <rect x="8" y="10" width="16" height="12" fill="none" stroke="#336791" strokeWidth="1.5" />
        <ellipse cx="16" cy="22" rx="8" ry="3" stroke="#336791" strokeWidth="1.5" fill="#0d1520" />
        <line x1="8" y1="14" x2="24" y2="14" stroke="#336791" strokeWidth="0.8" />
        <line x1="8" y1="18" x2="24" y2="18" stroke="#336791" strokeWidth="0.8" />
      </svg>
    ),
  },
  Flutter: {
    color: '#54C5F8', bg: '#0d1a2a',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#0d1a2a" />
        <polygon points="9,16 16,8 23,16 18,16 16,14 14,16" fill="#54C5F8" />
        <polygon points="9,20 16,12 18,14 13,20 18,26 16,26" fill="#54C5F8" />
        <polygon points="13,20 18,14 23,20 18,26" fill="#01579B" />
      </svg>
    ),
  },
  Tailwind: {
    color: '#38BDF8', bg: '#0d1a22',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#0d1a22" />
        <path d="M8 14c.7-3 2.7-4.5 6-4.5 4.5 0 5.3 2.3 7.5 2.7 1.5.3 2.8-.4 4-2.2-.7 3-2.7 4.5-6 4.5-4.5 0-5.3-2.3-7.5-2.7-1.5-.3-2.8.4-4 2.2zM4 20c.7-3 2.7-4.5 6-4.5 4.5 0 5.3 2.3 7.5 2.7 1.5.3 2.8-.4 4-2.2-.7 3-2.7 4.5-6 4.5-4.5 0-5.3-2.3-7.5-2.7-1.5-.3-2.8.4-4 2.2z" fill="#38BDF8" />
      </svg>
    ),
  },
  Docker: {
    color: '#2496ED', bg: '#0d1520',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#0d1520" />
        <rect x="6" y="14" width="4" height="4" rx="0.5" fill="#2496ED" />
        <rect x="11" y="14" width="4" height="4" rx="0.5" fill="#2496ED" />
        <rect x="16" y="14" width="4" height="4" rx="0.5" fill="#2496ED" />
        <rect x="11" y="9" width="4" height="4" rx="0.5" fill="#2496ED" />
        <rect x="16" y="9" width="4" height="4" rx="0.5" fill="#2496ED" />
        <path d="M26 16c-.5-1-1.8-1.5-3-1.3-.3-1.5-1.5-2.7-3.2-2.7v1.5c1 0 1.7.7 1.7 1.7v.3H6.5c-.3 2.7.8 5 2.8 6.3 1.5 1 3.3 1.2 5.2 1.2 4.5 0 8.2-2 9.5-6.5.8.1 1.5-.1 2-.5z" fill="#2496ED" opacity="0.7" />
      </svg>
    ),
  },
  Git: {
    color: '#F05032', bg: '#1a0d0a',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#1a0d0a" />
        <path d="M27.5 14.6L17.4 4.5c-.7-.7-1.8-.7-2.5 0l-2.4 2.4 3 3c.7-.3 1.5-.1 2 .4.5.5.7 1.3.4 2l2.9 2.9c.7-.3 1.5-.1 2 .4.8.8.8 2 0 2.8-.8.8-2 .8-2.8 0-.6-.6-.7-1.4-.4-2.1l-2.7-2.7v7c.5.2.9.6 1.1 1.1.8.8.8 2 0 2.8-.8.8-2 .8-2.8 0-.8-.8-.8-2 0-2.8.3-.3.7-.5 1.1-.6v-7c-.4-.1-.8-.3-1.1-.6-.6-.6-.7-1.5-.4-2.2L11 9.5 4.5 15.9c-.7.7-.7 1.8 0 2.5l10.1 10.1c.7.7 1.8.7 2.5 0L27.5 17c.7-.7.7-1.8 0-2.4z" fill="#F05032" />
      </svg>
    ),
  },
  Postman: {
    color: '#FF6C37', bg: '#1a0e0a',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#1a0e0a" />
        <circle cx="16" cy="16" r="10" fill="#FF6C37" opacity="0.15" stroke="#FF6C37" strokeWidth="1" />
        <circle cx="16" cy="16" r="6" fill="#FF6C37" opacity="0.3" />
        <circle cx="16" cy="16" r="3" fill="#FF6C37" />
        <line x1="16" y1="16" x2="22" y2="12" stroke="#FF6C37" strokeWidth="1.5" />
      </svg>
    ),
  },
  Swagger: {
    color: '#85EA2D', bg: '#0d1a05',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#0d1a05" />
        <circle cx="16" cy="16" r="10" fill="#85EA2D" opacity="0.15" stroke="#85EA2D" strokeWidth="1" />
        <circle cx="16" cy="16" r="7" fill="#85EA2D" opacity="0.25" />
        <text x="12" y="20" fontFamily="monospace" fontWeight="bold" fontSize="10" fill="#85EA2D">S</text>
      </svg>
    ),
  },
  Redis: {
    color: '#DC382D', bg: '#1a0908',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#1a0908" />
        <ellipse cx="16" cy="20" rx="10" ry="4" fill="#DC382D" opacity="0.4" />
        <ellipse cx="16" cy="16" rx="10" ry="4" fill="#DC382D" opacity="0.6" />
        <ellipse cx="16" cy="12" rx="10" ry="4" fill="#DC382D" />
      </svg>
    ),
  },
  RabbitMQ: {
    color: '#FF6600', bg: '#1a0e05',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#1a0e05" />
        <rect x="6" y="10" width="20" height="15" rx="2" fill="#FF6600" opacity="0.3" stroke="#FF6600" strokeWidth="1" />
        <rect x="10" y="14" width="4" height="4" rx="0.5" fill="#FF6600" />
        <rect x="18" y="14" width="4" height="4" rx="0.5" fill="#FF6600" />
        <path d="M16 6 L18 10 L14 10 Z" fill="#FF6600" />
        <path d="M20 7 L21 10 L19 10 Z" fill="#FF6600" opacity="0.7" />
      </svg>
    ),
  },
  Microservices: {
    color: '#A78BFA', bg: '#12101a',
    svg: (
      <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#12101a" />
        <circle cx="16" cy="16" r="3" fill="#A78BFA" />
        <circle cx="8" cy="10" r="2" fill="#A78BFA" opacity="0.7" />
        <circle cx="24" cy="10" r="2" fill="#A78BFA" opacity="0.7" />
        <circle cx="8" cy="22" r="2" fill="#A78BFA" opacity="0.7" />
        <circle cx="24" cy="22" r="2" fill="#A78BFA" opacity="0.7" />
        <line x1="16" y1="13" x2="10" y2="11" stroke="#A78BFA" strokeWidth="0.8" opacity="0.6" />
        <line x1="16" y1="13" x2="22" y2="11" stroke="#A78BFA" strokeWidth="0.8" opacity="0.6" />
        <line x1="16" y1="19" x2="10" y2="21" stroke="#A78BFA" strokeWidth="0.8" opacity="0.6" />
        <line x1="16" y1="19" x2="22" y2="21" stroke="#A78BFA" strokeWidth="0.8" opacity="0.6" />
      </svg>
    ),
  },
};

// ─── ORBIT CONFIG ─────────────────────────────────────────────────────────
// Each orbit: radius (px from center), tilt angle, speed (deg/sec),
// skills assigned, orbit color
const ORBIT_CONFIGS = [
  {
    id: 'o1',
    radius: 115,
    tiltX: 70,
    tiltZ: 15,
    duration: 18,   // seconds for full rotation
    color: 'rgba(97, 218, 251, 0.15)',
    label: 'Frontend',
    skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind'],
  },
  {
    id: 'o2',
    radius: 175,
    tiltX: 60,
    tiltZ: -20,
    duration: 26,
    color: 'rgba(60, 135, 58, 0.12)',
    label: 'Backend',
    skills: ['Node.js', 'Express', 'NestJS', 'Redis', 'RabbitMQ'],
  },
  {
    id: 'o3',
    radius: 230,
    tiltX: 65,
    tiltZ: 35,
    duration: 34,
    color: 'rgba(212, 134, 10, 0.1)',
    label: 'Data & Infra',
    skills: ['MongoDB', 'PostgreSQL', 'Docker', 'Microservices'],
  },
  {
    id: 'o4',
    radius: 285,
    tiltX: 55,
    tiltZ: -10,
    duration: 44,
    color: 'rgba(124, 58, 237, 0.08)',
    label: 'Mobile & Tools',
    skills: ['Flutter', 'Git', 'Postman', 'Swagger'],
  },
];

// ─── SKILL NODE COMPONENT ─────────────────────────────────────────────────
function SkillNode({ skill, angle, orbitRadius, orbitDuration, orbitTiltX, orbitTiltZ, orbitColor, isActive, onHover, onLeave }) {
  const icon = ICONS[skill] || null;
  const color = icon?.color || T.accent;
  const nodeId = `node-${skill.replace(/[^a-z]/gi, '')}`;

  // Each node counter-rotates so the icon stays upright
  // The node is placed at the edge of orbit using CSS variables
  return (
    <div
      id={nodeId}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 1,
        height: 1,
        // Rotate to the node's initial angle offset, then animate the whole orbit
        transform: `rotate(${angle}deg) translateX(${orbitRadius}px)`,
      }}
    >
      {/* Counter-rotate so icon stays upright */}
      <div
        style={{
          transform: `rotate(-${angle}deg)`,
          position: 'relative',
          width: 1,
          height: 1,
        }}
      >
        {/* Orbit counter-animation to keep icon upright as it goes around */}
        <div
          className="orbit-counter"
          style={{
            '--orbit-duration': `${orbitDuration}s`,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Node pill */}
          <button
            aria-label={`${skill} — hover for details`}
            onMouseEnter={() => onHover(skill)}
            onMouseLeave={onLeave}
            onFocus={() => onHover(skill)}
            onBlur={onLeave}
            style={{
              position: 'relative',
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: isActive
                ? `radial-gradient(circle at 38% 38%, ${color}28, ${color}10)`
                : `rgba(26,23,18,0.92)`,
              border: `1.5px solid ${isActive ? color : 'rgba(242,237,230,0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s, background 0.3s',
              boxShadow: isActive
                ? `0 0 22px ${color}50, 0 0 44px ${color}20, inset 0 0 12px ${color}10`
                : '0 2px 12px rgba(0,0,0,0.5)',
              transform: isActive ? 'scale(1.25)' : 'scale(1)',
              zIndex: isActive ? 20 : 1,
            }}
          >
            {icon ? (
              <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon.svg}
              </div>
            ) : (
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color, fontWeight: 700, letterSpacing: '0.04em' }}>
                {skill.slice(0, 3).toUpperCase()}
              </span>
            )}

            {/* Pulse ring on active */}
            {isActive && (
              <span style={{
                position: 'absolute',
                inset: -6,
                borderRadius: '50%',
                border: `1px solid ${color}`,
                opacity: 0.4,
                animation: 'nodeRingPulse 1.4s ease-out infinite',
                pointerEvents: 'none',
              }} />
            )}
          </button>

          {/* Label below node */}
          <div style={{
            position: 'absolute',
            top: 52,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            letterSpacing: '0.1em',
            color: isActive ? color : T.muted,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            transition: 'color 0.3s',
          }}>
            {skill}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ORBIT RING + NODES ───────────────────────────────────────────────────
function OrbitRing({ config, activeSkill, onHover, onLeave }) {
  const { id, radius, tiltX, tiltZ, duration, color, skills } = config;
  const nodeCount = skills.length;
  const angleStep = 360 / nodeCount;

  return (
    <div
      className="orbit-ring"
      style={{
        '--orbit-duration': `${duration}s`,
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: radius * 2,
        height: radius * 2,
        marginLeft: -radius,
        marginTop: -radius,
        borderRadius: '50%',
        border: `1px solid ${color}`,
        // 3D tilt via CSS perspective transform
        transform: `rotateX(${tiltX}deg) rotateZ(${tiltZ}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* The ring rotates; nodes counter-rotate to stay upright */}
      <div
        className="orbit-spinner"
        style={{
          '--orbit-duration': `${duration}s`,
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
        }}
      >
        {skills.map((skill, i) => (
          <SkillNode
            key={skill}
            skill={skill}
            angle={i * angleStep}
            orbitRadius={radius}
            orbitDuration={duration}
            orbitTiltX={tiltX}
            orbitTiltZ={tiltZ}
            orbitColor={color}
            isActive={activeSkill === skill}
            onHover={onHover}
            onLeave={onLeave}
          />
        ))}
      </div>
    </div>
  );
}

// ─── CENTRAL NUCLEUS ──────────────────────────────────────────────────────
function Nucleus() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let THREE, renderer, scene, camera, geo, mat, mesh, clock;

    const init = async () => {
      try {
        THREE = await import('three');
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(140, 140);
        renderer.setClearColor(0x000000, 0);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
        camera.position.z = 3;
        clock = new THREE.Clock();

        // Icosahedron wireframe
        geo = new THREE.IcosahedronGeometry(1.1, 1);
        mat = new THREE.MeshBasicMaterial({
          color: 0xD4860A,
          wireframe: true,
          opacity: 0.35,
          transparent: true,
        });
        mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        // Inner sphere
        const inner = new THREE.Mesh(
          new THREE.SphereGeometry(0.55, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x111009, transparent: true, opacity: 0.95 })
        );
        scene.add(inner);

        // Outer glow ring
        const ringGeo = new THREE.TorusGeometry(1.3, 0.008, 8, 80);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xD4860A, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
        scene.add(new THREE.Mesh(ringGeo, ringMat));

        const animate = () => {
          rafRef.current = requestAnimationFrame(animate);
          if (!visibleRef.current) return;
          const t = clock.getElapsedTime();
          mesh.rotation.x = t * 0.18;
          mesh.rotation.y = t * 0.28;
          renderer.render(scene, camera);
        };
        animate();
      } catch (e) {
        // Three.js unavailable — canvas stays blank, static CSS fallback shows
      }
    };

    init();

    const io = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      io.disconnect();
      try { renderer?.dispose(); } catch { }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      {/* Three.js canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
      {/* Fallback label */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: T.accent,
          opacity: 0.85,
          marginTop: 4,
        }}>
          FULL STACK
        </span>
      </div>
    </div>
  );
}

// ─── TOOLTIP CARD ─────────────────────────────────────────────────────────
function TooltipCard({ skill }) {
  const icon = ICONS[skill];
  const color = icon?.color || T.accent;

  // Find which orbit this skill belongs to
  const orbitInfo = ORBIT_CONFIGS.find(o => o.skills.includes(skill));

  const META = {
    JavaScript: { exp: '3+ yrs', use: 'Production · All projects', note: 'Primary scripting language' },
    TypeScript: { exp: '2+ yrs', use: 'Production · MERN & NestJS', note: 'Typed development standard' },
    React: { exp: '3+ yrs', use: 'Production · Portfolio · Internship', note: 'Primary UI framework' },
    'Next.js': { exp: '1+ yr', use: 'Production · Full-stack apps', note: 'SSR & static generation' },
    Tailwind: { exp: '2+ yrs', use: 'Production · All frontends', note: 'Utility-first CSS' },
    'Node.js': { exp: '3+ yrs', use: 'Production · All backends', note: 'Primary runtime' },
    Express: { exp: '3+ yrs', use: 'Production · REST APIs', note: 'Lightweight server framework' },
    NestJS: { exp: '1+ yr', use: 'Production · Microservices', note: 'Enterprise Node framework' },
    Redis: { exp: '1+ yr', use: 'Production · Caching layer', note: 'In-memory data store' },
    RabbitMQ: { exp: '< 1 yr', use: 'Learning · Message queues', note: 'Async event messaging' },
    MongoDB: { exp: '3+ yrs', use: 'Production · MERN stack', note: 'Primary NoSQL database' },
    PostgreSQL: { exp: '2+ yrs', use: 'Production · PERN stack', note: 'Primary relational DB' },
    Docker: { exp: '1+ yr', use: 'Production · Deployment', note: 'Containerization' },
    Microservices: { exp: '1+ yr', use: 'Production · Architecture', note: 'Distributed system design' },
    Flutter: { exp: '1+ yr', use: 'Production · Mobile apps', note: 'Cross-platform mobile' },
    Git: { exp: '3+ yrs', use: 'Daily · All projects', note: 'Version control' },
    Postman: { exp: '3+ yrs', use: 'Daily · API testing', note: 'API development tool' },
    Swagger: { exp: '2+ yrs', use: 'Production · API docs', note: 'OpenAPI documentation' },
  };

  const meta = META[skill] || { exp: '—', use: 'Used in projects', note: '' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 16,
        width: 240,
        background: T.inkFloat,
        border: `1px solid ${color}30`,
        borderRadius: 6,
        padding: '1rem 1.25rem',
        boxShadow: `0 16px 48px rgba(0,0,0,0.7), 0 0 24px ${color}18`,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
          {icon?.svg}
        </div>
        <div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.primary, margin: 0 }}>
            {skill}
          </p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', color, textTransform: 'uppercase', margin: 0 }}>
            {orbitInfo?.label || 'Core skill'}
          </p>
        </div>
      </div>

      {/* Meta rows */}
      {[
        { label: 'EXP', value: meta.exp },
        { label: 'USED', value: meta.use },
        { label: 'NOTE', value: meta.note },
      ].map(row => (
        <div key={row.label} style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'flex-start' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: T.muted, letterSpacing: '0.1em', flexShrink: 0, width: 32, paddingTop: 1 }}>
            {row.label}
          </span>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: T.secondary, lineHeight: 1.4 }}>
            {row.value}
          </span>
        </div>
      ))}

      {/* Color accent line at bottom */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 1, marginTop: 10 }} />
    </motion.div>
  );
}

// ─── LEGEND ───────────────────────────────────────────────────────────────
function OrbitLegend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
      {ORBIT_CONFIGS.map(o => (
        <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 1, background: o.color.replace('0.1', '0.6').replace('0.12', '0.6').replace('0.08', '0.6').replace('0.15', '0.6') }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: T.muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Orbit {ORBIT_CONFIGS.indexOf(o) + 1} — {o.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── SKILLS LIST (mobile fallback + side panel) ────────────────────────────
function SkillsList({ activeSkill }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 420, overflowY: 'auto' }}>
      {ORBIT_CONFIGS.map(orbit => (
        <div key={orbit.id}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.accent, marginBottom: 8, marginTop: 12 }}>
            {orbit.label}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {orbit.skills.map(skill => {
              const icon = ICONS[skill];
              const color = icon?.color || T.accent;
              const isAct = activeSkill === skill;
              return (
                <div
                  key={skill}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 10px',
                    borderRadius: 3,
                    background: isAct ? `${color}18` : 'transparent',
                    border: `1px solid ${isAct ? color : T.border}`,
                    transition: 'all 0.2s',
                  }}
                >
                  {icon && <div style={{ width: 14, height: 14, flexShrink: 0 }}>{icon.svg}</div>}
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: isAct ? color : T.secondary, letterSpacing: '0.06em' }}>
                    {skill}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN SECTION ─────────────────────────────────────────────────────────
export const OrbitalSkillsSection = () => {
  const [activeSkill, setActiveSkill] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-120px' });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleHover = useCallback((skill) => { setActiveSkill(skill); setIsPaused(true); }, []);
  const handleLeave = useCallback(() => { setActiveSkill(null); setIsPaused(false); }, []);

  // All 18 skills count
  const totalSkills = ORBIT_CONFIGS.reduce((s, o) => s + o.skills.length, 0);

  return (
    <section
      id="skills"
      ref={sectionRef}
      style={{ background: T.void, paddingTop: 'clamp(5rem,10vw,9rem)', paddingBottom: 'clamp(5rem,10vw,9rem)', overflow: 'hidden' }}
    >
      {/* ── CSS for orbit animations ── */}
      <style>{`
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbitSpinReverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes nodeRingPulse {
          0%   { transform: scale(1);   opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes coreGlow {
          0%,100% { box-shadow: 0 0 30px rgba(212,134,10,0.15), 0 0 60px rgba(212,134,10,0.06); }
          50%      { box-shadow: 0 0 50px rgba(212,134,10,0.25), 0 0 90px rgba(212,134,10,0.10); }
        }
        .orbit-spinner {
          animation: orbitSpin var(--orbit-duration, 30s) linear infinite;
        }
        .orbit-counter {
          animation: orbitSpinReverse var(--orbit-duration, 30s) linear infinite;
        }
        .orbits-paused .orbit-spinner,
        .orbits-paused .orbit-counter {
          animation-play-state: paused !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .orbit-spinner, .orbit-counter { animation: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 clamp(1.25rem,4vw,4rem)' }}>

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 'clamp(3rem,6vw,5rem)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
            <div style={{ width: 28, height: 1, background: T.accent }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.accent }}>
              Technical Arsenal
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.05, margin: 0 }}>
              <span style={{ color: T.primary }}>The stack I ship</span><br />
              <span style={{ color: T.secondary }}>to production.</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: T.muted, letterSpacing: '0.08em' }}>
                {totalSkills} technologies · {ORBIT_CONFIGS.length} orbits
              </span>
              {/* Pause/resume toggle */}
              <button
                onClick={() => setIsPaused(p => !p)}
                title={isPaused ? 'Resume orbits' : 'Pause orbits'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  border: `1px solid ${T.border}`,
                  borderRadius: 3,
                  background: 'transparent',
                  cursor: 'pointer',
                  color: T.muted,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
              >
                {isPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Main layout: orbital canvas + side panel ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 280px',
          gap: 'clamp(2rem,4vw,4rem)',
          alignItems: 'center',
        }}>

          {/* ── Orbital canvas ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            {/* 3D perspective container */}
            <div
              className={isPaused ? 'orbits-paused' : ''}
              style={{
                position: 'relative',
                width: 640,
                height: 640,
                maxWidth: '100%',
                perspective: '900px',
                perspectiveOrigin: '50% 50%',
              }}
            >
              {/* Deep space background radial glow */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at 50% 50%, rgba(212,134,10,0.04) 0%, rgba(11,9,7,0) 70%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Grid of faint star dots */}
              <svg
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }}
                viewBox="0 0 640 640"
              >
                {[...Array(60)].map((_, i) => {
                  const x = (((i * 137.508) % 640));
                  const y = (((i * 97.31) % 640));
                  const r = i % 5 === 0 ? 1.2 : 0.6;
                  return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r} fill={T.secondary} opacity={0.3 + (i % 4) * 0.12} />;
                })}
              </svg>

              {/* Orbital rings + nodes — positioned from center */}
              <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
                {ORBIT_CONFIGS.map(config => (
                  <OrbitRing
                    key={config.id}
                    config={config}
                    activeSkill={activeSkill}
                    onHover={handleHover}
                    onLeave={handleLeave}
                  />
                ))}
              </div>

              {/* Central nucleus — absolutely centered */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'coreGlow 3s ease-in-out infinite',
                borderRadius: '50%',
                zIndex: 10,
              }}>
                <Nucleus />
              </div>

              {/* Tooltip portal — positioned relative to canvas center */}
              <AnimatePresence>
                {activeSkill && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 200,
                  }}>
                    <TooltipCard skill={activeSkill} />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Orbit legend below canvas */}
            <OrbitLegend />
          </motion.div>

          {/* ── Right panel: skill list + active detail ── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            style={{ display: isMobile ? 'none' : 'block' }}
          >
            {/* Active skill detail */}
            <AnimatePresence mode="wait">
              {activeSkill ? (
                <motion.div
                  key={activeSkill}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  style={{ marginBottom: '1.5rem' }}
                >
                  <div style={{
                    padding: '1.25rem',
                    background: T.inkRaised,
                    border: `1px solid ${ICONS[activeSkill]?.color || T.accent}30`,
                    borderRadius: 4,
                    borderLeft: `3px solid ${ICONS[activeSkill]?.color || T.accent}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 24, height: 24, flexShrink: 0 }}>{ICONS[activeSkill]?.svg}</div>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: T.primary }}>{activeSkill}</span>
                    </div>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.08em', color: T.muted, margin: 0 }}>
                      Hover any node on the orbital to explore
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ marginBottom: '1.5rem' }}
                >
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 12 }}>
                    Hover any node to inspect
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full skill list */}
            <SkillsList activeSkill={activeSkill} />

            {/* CMS note */}
            <div style={{
              marginTop: '1.5rem',
              padding: '10px 14px',
              background: T.inkRaised,
              border: `1px solid ${T.border}`,
              borderRadius: 3,
            }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.08em', color: T.muted, margin: 0 }}>
                ↑ Skills are editable via the Admin Dashboard → Skills Editor. Category order controls orbit assignment.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── Mobile: flat skill grid fallback ── */}
        {isMobile && (
          <div style={{ marginTop: '2rem' }}>
            <SkillsList activeSkill={activeSkill} />
          </div>
        )}

        {/* ── Bottom strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{
            marginTop: 'clamp(3rem,5vw,4rem)',
            padding: '1.25rem 1.5rem',
            background: T.ink,
            borderRadius: 4,
            border: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2D6A4F', boxShadow: '0 0 8px #2D6A4F', flexShrink: 0, animation: 'nodeRingPulse 2s ease-out infinite' }} />
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.06em', color: T.muted, margin: 0 }}>
            Every technology in this system has shipped to at least one production deployment.
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default OrbitalSkillsSection;