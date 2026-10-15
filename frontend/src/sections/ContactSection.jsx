import React, { useState, useRef, useEffect, Suspense, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import { useContentStore } from '../store/contentStore';
import { useTrackSection } from '../hooks/useVisitorTracking';
import { ContactSkeleton } from '../components/SkeletonLoader';
import { EASINGS, SPRINGS } from '../animations/variants';
import api from '../utils/api';

/* ═══════════════════════════════════════════════════════════════
   CANVAS ERROR BOUNDARY
   Renders null fallback if WebGL is unavailable or errors occur
   ═══════════════════════════════════════════════════════════════ */
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[ConnectionGraph] WebGL canvas error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════════════════════════
   SIGNAL PULSE
   Animated particle traveling from center node to active orbit node
   ═══════════════════════════════════════════════════════════════ */
function SignalPulse({ start, end, color, active }) {
  const meshRef = useRef();
  const matRef = useRef();
  const progressRef = useRef(0);

  const startVec = useMemo(() => new THREE.Vector3(...start), [start]);
  const endVec = useMemo(() => new THREE.Vector3(...end), [end]);

  useFrame((_, delta) => {
    if (!meshRef.current || !matRef.current) return;
    if (!active) {
      meshRef.current.visible = false;
      progressRef.current = 0;
      return;
    }
    meshRef.current.visible = true;
    progressRef.current = (progressRef.current + delta * 1.5) % 1;
    const p = progressRef.current;
    meshRef.current.position.lerpVectors(startVec, endVec, p);
    matRef.current.opacity = Math.sin(p * Math.PI) * 0.95;
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[0.045, 12, 12]} />
      <meshBasicMaterial ref={matRef} color={color} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3D CONNECTION SCENE
   Interactive graph showing communication channels around center
   ═══════════════════════════════════════════════════════════════ */
function ConnectionScene({ hoveredChannel, isDarkMode }) {
  const groupRef = useRef();
  const centerRingRef = useRef();

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.2;
    groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.08;

    if (centerRingRef.current) {
      centerRingRef.current.rotation.z += 0.01;
      centerRingRef.current.rotation.x += 0.005;
    }
  });

  const RADIUS = 1.6;
  const CHANNELS = useMemo(() => [
    {
      id: 'email',
      angle: -Math.PI / 2,
      color: '#3b82f6',
      label: 'Email',
      x: Math.cos(-Math.PI / 2) * RADIUS,
      y: Math.sin(-Math.PI / 2) * RADIUS * 0.6,
      z: Math.sin(-Math.PI / 2) * 0.3,
    },
    {
      id: 'telegram',
      angle: -Math.PI / 2 + 2.094,
      color: '#0088cc',
      label: 'Telegram',
      x: Math.cos(-Math.PI / 2 + 2.094) * RADIUS,
      y: Math.sin(-Math.PI / 2 + 2.094) * RADIUS * 0.6,
      z: Math.sin(-Math.PI / 2 + 2.094) * 0.3,
    },
    {
      id: 'linkedin',
      angle: -Math.PI / 2 + 4.189,
      color: '#0a66c2',
      label: 'LinkedIn',
      x: Math.cos(-Math.PI / 2 + 4.189) * RADIUS,
      y: Math.sin(-Math.PI / 2 + 4.189) * RADIUS * 0.6,
      z: Math.sin(-Math.PI / 2 + 4.189) * 0.3,
    },
  ], []);

  // Background dots: 25 points scattered in a 6x4x2 volume
  const bgPoints = useMemo(() => {
    const count = 25;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = ((i * 17) % 60 - 30) / 10;
      positions[i * 3 + 1] = ((i * 29) % 40 - 20) / 10;
      positions[i * 3 + 2] = ((i * 13) % 20 - 10) / 10;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      bgPoints.dispose();
    };
  }, [bgPoints]);

  const centerColor = isDarkMode ? '#3b82f6' : '#2563eb';

  return (
    <group ref={groupRef}>
      {/* Background Dots */}
      <points geometry={bgPoints}>
        <pointsMaterial
          size={0.03}
          color={centerColor}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </points>

      {/* Center Node */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color={centerColor}
          emissive={centerColor}
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Center Glow Ring */}
      <mesh ref={centerRingRef} position={[0, 0, 0]}>
        <torusGeometry args={[0.28, 0.015, 16, 32]} />
        <meshBasicMaterial
          color={centerColor}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Connection Lines, Signal Pulses, & Orbit Nodes */}
      {CHANNELS.map((ch) => {
        const isHovered = hoveredChannel === ch.id;
        const nodePos = [ch.x, ch.y, ch.z];

        return (
          <React.Fragment key={ch.id}>
            {/* Connection Line */}
            <Line
              points={[[0, 0, 0], nodePos]}
              color={isDarkMode ? '#ffffff' : '#000000'}
              transparent
              opacity={isHovered ? 0.35 : 0.08}
              lineWidth={isHovered ? 1.5 : 0.8}
            />

            {/* Signal Pulse traveling center -> orbit */}
            <SignalPulse
              start={[0, 0, 0]}
              end={nodePos}
              color={ch.color}
              active={isHovered}
            />

            {/* Orbit Node */}
            <group position={nodePos}>
              <mesh>
                <sphereGeometry args={[0.14, 12, 12]} />
                <meshStandardMaterial
                  color={ch.color}
                  emissive={ch.color}
                  emissiveIntensity={isHovered ? 0.8 : 0.2}
                  roughness={0.2}
                  metalness={0.5}
                  transparent
                  opacity={0.9}
                />
              </mesh>

              {/* Glow ring on hovered node */}
              {isHovered && (
                <mesh>
                  <torusGeometry args={[0.18, 0.012, 12, 24]} />
                  <meshBasicMaterial
                    color={ch.color}
                    transparent
                    opacity={0.5}
                  />
                </mesh>
              )}

              {/* Drei HTML label */}
              <Html
                position={[0, -0.28, 0]}
                center
                occlude={false}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: ch.color,
                  opacity: isHovered ? 1 : 0.5,
                  userSelect: 'none',
                  transition: 'opacity 0.3s',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {ch.label}
              </Html>
            </group>
          </React.Fragment>
        );
      })}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONNECTION GRAPH CANVAS (Desktop Sticky Widget)
   ═══════════════════════════════════════════════════════════════ */
function ConnectionGraph({ hoveredChannel, isDarkMode }) {
  return (
    <div
      className="hidden lg:block w-[380px] h-[380px] sticky top-32 rounded-lg overflow-hidden border border-border-subtle bg-surface-base/20 backdrop-blur-sm self-start"
      aria-hidden="true"
    >
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          dpr={[1, 1.4]}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <color attach="background" args={[isDarkMode ? '#07080b' : '#f3f4f7']} />
          <Suspense fallback={null}>
            <ConnectionScene
              hoveredChannel={hoveredChannel}
              isDarkMode={isDarkMode}
            />
            <ambientLight intensity={0.6} />
            <pointLight
              position={[3, 3, 2]}
              intensity={0.8}
              color={isDarkMode ? '#3b82f6' : '#2563eb'}
            />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHANNEL TILE COMPONENT
   Real <a> tag — one-click direct communication channel
   ═══════════════════════════════════════════════════════════════ */
function ChannelTile({ tile, onHover, onLeave, isDarkMode, index }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover(tile.id);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onLeave();
  };

  return (
    <motion.a
      href={tile.href}
      target={tile.target}
      rel={tile.rel}
      aria-label={tile.ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: EASINGS.editorial }}
      className="contact-tile group flex flex-col justify-between p-4 sm:p-5 md:p-6 rounded-[6px] border border-border-default no-underline cursor-pointer relative overflow-hidden transition-all duration-200 bg-white dark:bg-surface-base"
      style={{
        borderColor: isHovered ? tile.color : undefined,
        backgroundColor: isHovered
          ? (isDarkMode ? `${tile.color}14` : `${tile.color}0d`)
          : undefined,
        boxShadow: isHovered
          ? `0 8px 28px ${tile.color}26, inset 3px 0 0 0 ${tile.color}`
          : undefined,
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* Mobile Layout (< sm) */}
      <div className="flex sm:hidden items-center gap-3.5 w-full">
        <div
          className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0 transition-colors duration-200"
          style={{ backgroundColor: `${tile.color}18` }}
        >
          {tile.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-sans font-bold text-[1rem] text-content-primary leading-tight">
              {tile.name}
            </span>
            <span
              className="font-code text-[8px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-sm border"
              style={{
                borderColor: `${tile.color}30`,
                color: tile.color,
                backgroundColor: `${tile.color}08`,
              }}
            >
              {tile.actionChip}
            </span>
          </div>
          <div className="font-code text-[10px] text-content-muted truncate">
            {tile.value}
          </div>
          <div className="font-code text-[9px] text-content-muted uppercase tracking-wider mt-0.5">
            {tile.bottom}
          </div>
        </div>
        <div style={{ color: tile.color }} className="flex-shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Desktop & Tablet Layout (sm+) */}
      <div className="hidden sm:flex flex-col h-full w-full">
        {/* Top Row */}
        <div className="flex justify-between items-start mb-4">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center transition-colors duration-200"
            style={{
              backgroundColor: isHovered ? `${tile.color}24` : `${tile.color}14`,
            }}
          >
            {tile.icon}
          </div>
          <span
            className="font-code text-[8px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-sm border"
            style={{
              borderColor: `${tile.color}30`,
              color: tile.color,
              backgroundColor: `${tile.color}08`,
            }}
          >
            {tile.actionChip}
          </span>
        </div>

        {/* Channel Name */}
        <h3 className="font-sans font-bold text-[1.1rem] md:text-[1.2rem] text-content-primary mb-1">
          {tile.name}
        </h3>

        {/* Channel Value */}
        <p className="font-code text-[10px] text-content-muted truncate mb-4">
          {tile.value}
        </p>

        {/* Bottom Row */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-code text-[9px] text-content-muted uppercase tracking-wider">
            {tile.bottom}
          </span>
          <motion.span
            className="inline-flex items-center justify-center"
            style={{ color: tile.color }}
            animate={isHovered ? { opacity: 1, x: 4 } : { opacity: 0, x: -4 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </motion.span>
        </div>
      </div>
    </motion.a>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPACT MESSAGE FORM
   Secondary contact path — streamlined bottom-border inputs
   ═══════════════════════════════════════════════════════════════ */
function CompactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const validateField = (field, value) => {
    let err = '';
    const val = (value || '').trim();
    if (field === 'name') {
      if (!val) err = 'Name is required';
      else if (val.length < 2) err = 'Name must be at least 2 characters';
    } else if (field === 'email') {
      if (!val) err = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) err = 'Please enter a valid email address';
    } else if (field === 'message') {
      if (!val) err = 'Message is required';
      else if (val.length < 5) err = 'Message must be at least 5 characters';
      else if (val.length > 400) err = 'Message must not exceed 400 characters';
    }
    setErrors(prev => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
    setFocusedField(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > 400) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });

    const nameErr = validateField('name', formData.name);
    const emailErr = validateField('email', formData.email);
    const msgErr = validateField('message', formData.message);

    if (nameErr || emailErr || msgErr) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await api.post('/api/contact', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTouched({});
      setErrors({});

      setTimeout(() => {
        setSubmitStatus('idle');
      }, 4000);
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBorderColor = (field) => {
    if (errors[field] && touched[field]) return '#ef4444';
    if (focusedField === field) return 'var(--accent)';
    return 'var(--border-default)';
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      {/* Row 1: Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Name */}
        <div>
          <label
            htmlFor="contact-name"
            className="font-code text-[9px] uppercase tracking-[0.14em] text-content-muted mb-1 block"
          >
            Your Name *
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => setFocusedField('name')}
            onBlur={() => handleBlur('name')}
            placeholder="Esubalew Molla"
            className="contact-input w-full bg-transparent border-none py-2.5 text-content-primary font-sans text-[0.95rem] outline-none caret-accent transition-[border-color] duration-200"
            style={{
              borderBottom: `1px solid ${getBorderColor('name')}`,
            }}
          />
          <AnimatePresence>
            {errors.name && touched.name && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="font-code text-[9px] text-red-500 dark:text-red-400 mt-1"
              >
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="contact-email"
            className="font-code text-[9px] uppercase tracking-[0.14em] text-content-muted mb-1 block"
          >
            Your Email *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => handleBlur('email')}
            placeholder="you@example.com"
            className="contact-input w-full bg-transparent border-none py-2.5 text-content-primary font-sans text-[0.95rem] outline-none caret-accent transition-[border-color] duration-200"
            style={{
              borderBottom: `1px solid ${getBorderColor('email')}`,
            }}
          />
          <AnimatePresence>
            {errors.email && touched.email && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="font-code text-[9px] text-red-500 dark:text-red-400 mt-1"
              >
                {errors.email}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Row 2: Message */}
      <div className="mb-4">
        <label
          htmlFor="contact-message"
          className="font-code text-[9px] uppercase tracking-[0.14em] text-content-muted mb-1 block"
        >
          Your Message *
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={3}
          maxLength={400}
          value={formData.message}
          onChange={handleChange}
          onFocus={() => setFocusedField('message')}
          onBlur={() => handleBlur('message')}
          placeholder="Tell me about your project, timeline, or just say hello..."
          className="contact-textarea w-full bg-transparent border-none py-2.5 text-content-primary font-sans text-[0.95rem] outline-none resize-none caret-accent transition-[border-color] duration-200"
          style={{
            borderBottom: `1px solid ${getBorderColor('message')}`,
          }}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            <AnimatePresence>
              {errors.message && touched.message && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="font-code text-[9px] text-red-500 dark:text-red-400"
                >
                  {errors.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <span
            className={`font-code text-[8px] transition-colors duration-200 ${
              formData.message.length > 380
                ? 'text-red-500 dark:text-red-400 font-semibold'
                : 'text-content-muted'
            }`}
          >
            {formData.message.length}/400
          </span>
        </div>
      </div>

      {/* Row 3: Submit Row */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
        <span className="font-code text-[8px] text-content-muted uppercase tracking-wider select-none">
          🔒 Private · Never shared
        </span>

        <div className="w-full sm:w-auto">
          <AnimatePresence mode="wait">
            {submitStatus === 'success' ? (
              <motion.div
                key="success"
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-flex items-center gap-2 text-success font-code text-[11px] uppercase tracking-[0.1em] py-2.5 px-4"
              >
                <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Message Sent</span>
              </motion.div>
            ) : isSubmitting ? (
              <motion.button
                key="submitting"
                type="button"
                disabled
                aria-disabled="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-accent opacity-70 text-accent-foreground font-code text-[11px] uppercase tracking-[0.1em] rounded-sm cursor-not-allowed w-full sm:w-auto"
              >
                <div className="flex items-center gap-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground animate-pulse [animation-delay:300ms]" />
                </div>
              </motion.button>
            ) : (
              <motion.button
                key="idle"
                type="submit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-2.5 bg-accent hover:bg-accent-hover text-accent-foreground font-code text-[11px] uppercase tracking-[0.1em] rounded-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,77,0,0.3)] cursor-pointer w-full sm:w-auto"
              >
                <span>Send Message</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error message row */}
      {submitStatus === 'error' && errorMessage && (
        <motion.div
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-l-[3px] border-red-500 bg-red-500/10 px-3 py-2 mt-3 font-code text-[10px] text-red-500 dark:text-red-400 rounded-r-sm"
        >
          {errorMessage}
        </motion.div>
      )}
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOCATION & SOCIAL BAR
   Full-width bottom footer for contact section
   ═══════════════════════════════════════════════════════════════ */
function LocationBar({ contactInfo, resumeUrl, githubUrl, phoneUrl }) {
  const locationText = contactInfo?.location || 'Bahir Dar, Ethiopia';
  const phoneText = phoneUrl || contactInfo?.phone || '+251 915795794';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-border-subtle flex flex-wrap items-center justify-between gap-4">
      {/* Left: Location info */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <svg className="w-3.5 h-3.5 text-content-muted flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="font-code text-[10px] text-content-muted uppercase tracking-wider">
          {locationText}
        </span>
        <span className="text-content-muted select-none">·</span>
        <span className="font-code text-[10px] text-content-muted">
          Open to remote worldwide
        </span>
      </div>

      {/* Center: Quick social links (GitHub + Phone) */}
      <div className="flex items-center gap-5">
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="text-content-muted hover:text-content-primary transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
        )}
        {phoneText && (
          <a
            href={`tel:${phoneText.replace(/\s+/g, '')}`}
            className="flex items-center gap-1.5 text-content-muted hover:text-content-primary transition-colors font-code text-[10px]"
            aria-label={`Call ${phoneText}`}
          >
            <svg className="w-3.5 h-3.5 text-content-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="hidden sm:inline">{phoneText}</span>
          </a>
        )}
      </div>

      {/* Right: Resume download */}
      <a
        href={resumeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 font-code text-[10px] uppercase tracking-[0.1em] text-content-muted hover:text-accent transition-colors"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
        <span>Download Resume ↗</span>
      </a>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CONTACT SECTION ("Direct Channels" Design)
   ═══════════════════════════════════════════════════════════════ */
export const ContactSection = () => {
  useTrackSection('contact');

  const { isDarkMode } = useTheme();
  const contactInfo = useContentStore((state) => state.contactInfo);
  const content = useContentStore((state) => state.content);
  const socialLinks = useContentStore((state) => state.socialLinks) || content?.socialLinks || [];

  const [hoveredChannel, setHoveredChannel] = useState(null);

  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-80px' });

  // Fallback guards if contentStore is still loading
  if (!contactInfo && !content) {
    return <ContactSkeleton />;
  }

  // Resolve dynamic values with specified fallbacks
  const email = contactInfo?.email || 'esubalew392@gmail.com';
  
  const telegramSocial = Array.isArray(socialLinks)
    ? socialLinks.find((s) => (s.platform || '').toLowerCase() === 'telegram')
    : null;
  const telegramUrl = telegramSocial?.url || 'https://t.me/Esuman7';
  const telegramUsername = telegramUrl.includes('t.me/')
    ? `@${telegramUrl.split('t.me/')[1].replace(/[/_]/g, '')}`
    : '@Esuman7';

  const linkedinSocial = Array.isArray(socialLinks)
    ? socialLinks.find((s) => (s.platform || '').toLowerCase() === 'linkedin')
    : null;
  const linkedinUrl = linkedinSocial?.url || 'https://linkedin.com/in/esubalew-molla-7a584739b';

  const githubSocial = Array.isArray(socialLinks)
    ? socialLinks.find((s) => (s.platform || '').toLowerCase() === 'github')
    : null;
  const githubUrl = githubSocial?.url || 'https://github.com/esubalew7';

  const resumeUrl = content?.resume?.url || '/resume.pdf';

  // 3 Channel Tiles Data
  const TILES = [
    {
      id: 'email',
      name: 'Email',
      value: email,
      href: `mailto:${email}`,
      target: '_self',
      color: '#3b82f6',
      actionChip: 'One Click',
      bottom: 'Direct inbox · < 4h reply',
      ariaLabel: 'Contact via Email',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
    {
      id: 'telegram',
      name: 'Telegram',
      value: telegramUsername,
      href: telegramUrl,
      target: '_blank',
      rel: 'noopener noreferrer',
      color: '#0088cc',
      actionChip: 'Instant DM',
      bottom: 'Chat instantly · Mon–Sat',
      ariaLabel: 'Contact via Telegram',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0088cc">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>
      ),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      value: 'Esubalew Molla',
      href: linkedinUrl,
      target: '_blank',
      rel: 'noopener noreferrer',
      color: '#0a66c2',
      actionChip: 'Connect',
      bottom: 'Professional network · Open to work',
      ariaLabel: 'Contact via LinkedIn',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#0a66c2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="contact"
      role="region"
      aria-label="Contact Esubalew"
      className="bg-surface-raised dark:bg-canvas pt-20 pb-28 md:pt-24 md:pb-32 overflow-hidden relative"
    >
      {/* SECTION HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 md:mb-14">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASINGS.editorial }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-px bg-accent flex-shrink-0" />
              <span className="font-code text-[11px] tracking-[0.18em] uppercase text-accent font-medium">
                Open Channels
              </span>
            </div>

            {/* H2 */}
            <h2 className="font-sans font-extrabold leading-[1.0] tracking-tight">
              <span className="block text-[clamp(2.4rem,5vw,3.8rem)] text-content-primary">
                Ready to connect.
              </span>
              <span className="block text-[clamp(1.6rem,3vw,2.2rem)] font-normal text-content-secondary mt-1">
                Reach me directly — no waiting.
              </span>
            </h2>
          </div>

          {/* Right side: Availability chip */}
          <div className="flex-shrink-0">
            <div className="inline-flex items-center gap-2 font-code text-[10px] uppercase tracking-[0.1em] border border-border-default rounded-sm px-3 py-1.5 bg-success-subtle text-success border-success/30 dark:border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>Available · &lt; 4h response</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 md:gap-12 lg:gap-16 items-start">
        {/* LEFT COLUMN */}
        <div className="min-w-0">
          {/* Label above tiles */}
          <div className="font-code text-[9px] uppercase tracking-[0.18em] text-content-muted mb-4">
            01 — Direct Channels (Fastest)
          </div>

          {/* 3 TILES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
            {TILES.map((tile, idx) => (
              <ChannelTile
                key={tile.id}
                tile={tile}
                index={idx}
                isDarkMode={isDarkMode}
                onHover={setHoveredChannel}
                onLeave={() => setHoveredChannel(null)}
              />
            ))}
          </div>

          {/* DIVIDER */}
          <div className="flex items-center gap-4 mb-8" aria-hidden="true">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="font-code text-[9px] uppercase tracking-[0.16em] text-content-muted px-2 whitespace-nowrap">
              or leave a message
            </span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          {/* COMPACT FORM */}
          <div>
            <div className="font-code text-[9px] uppercase tracking-[0.18em] text-content-muted mb-5">
              02 — Send a Message
            </div>
            <CompactForm />
          </div>
        </div>

        {/* RIGHT COLUMN (Desktop 3D Graph) */}
        <ConnectionGraph
          hoveredChannel={hoveredChannel}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* LOCATION BAR */}
      <LocationBar
        contactInfo={contactInfo}
        resumeUrl={resumeUrl}
        githubUrl={githubUrl}
        phoneUrl={contactInfo?.phone}
      />
    </section>
  );
};

export default ContactSection;
