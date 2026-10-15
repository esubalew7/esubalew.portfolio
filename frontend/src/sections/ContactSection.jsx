import React, { useState, useRef, useEffect, useMemo, Suspense, useCallback } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import { useContentStore } from '../store/contentStore';
import { useTrackSection } from '../hooks/useVisitorTracking';
import { ContactSkeleton } from '../components/SkeletonLoader';
import { EASINGS, SPRINGS } from '../animations/variants';
import api from '../utils/api';

/* ═══════════════════════════════════════════════════════════════
   CANVAS ERROR BOUNDARY
   Null fallback if WebGL is unavailable or encounters an error
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
    console.warn('[BlueprintCanvas] WebGL context unavailable or error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════════════════════════
   3D BLUEPRINT WIREFRAME ARCHITECTURE
   Assembles progressively as the user advances through steps
   ═══════════════════════════════════════════════════════════════ */
function BlueprintMesh({ step, isDarkMode, inView }) {
  const groupRef = useRef();
  const mainRef = useRef();
  const leftRef = useRef();
  const rightRef = useRef();
  const topRef = useRef();

  const mainGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 2, 2, 3, 3, 3)), []);
  const leftGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.8, 1.2, 0.8)), []);
  const rightGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.6, 0.6, 0.6)), []);
  const topGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(3.5, 0.1, 0.1)), []);

  const pointsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const coords = new Float32Array(40 * 3);
    for (let i = 0; i < 40; i++) {
      coords[i * 3]     = (Math.random() - 0.5) * 12;
      coords[i * 3 + 1] = (Math.random() - 0.5) * 8;
      coords[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(coords, 3));
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      mainGeo.dispose();
      leftGeo.dispose();
      rightGeo.dispose();
      topGeo.dispose();
      pointsGeo.dispose();
    };
  }, [mainGeo, leftGeo, rightGeo, topGeo, pointsGeo]);

  const lineColor = isDarkMode ? 0x3b82f6 : 0x2563eb;
  const baseOp = isDarkMode ? 0.45 : 0.30;
  const pointsOpacity = isDarkMode ? 0.2 : 0.08;

  const currentOpacityRef = useRef(baseOp * 0.3);

  useFrame(() => {
    if (!inView || !groupRef.current) return;

    const targetY = step === 1 ? 0.5 : step === 2 ? 0.2 : 0;
    const targetScale = step === 1 ? 0.85 : step === 2 ? 0.95 : 1.0;
    const targetOpacity = step === 1 ? baseOp * 0.3 : step === 2 ? baseOp * 0.65 : baseOp;

    // Smooth lerps
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.03;
    groupRef.current.scale.x += (targetScale - groupRef.current.scale.x) * 0.03;
    groupRef.current.scale.y += (targetScale - groupRef.current.scale.y) * 0.03;
    groupRef.current.scale.z += (targetScale - groupRef.current.scale.z) * 0.03;
    groupRef.current.rotation.y += 0.002;

    currentOpacityRef.current += (targetOpacity - currentOpacityRef.current) * 0.03;

    // Sub-box assembly targets
    const targetLeft = step === 1 ? [-2.8, -1.2, 0.8] : step === 2 ? [-2.1, -0.6, 0.3] : [-1.8, -0.4, 0];
    if (leftRef.current) {
      leftRef.current.position.x += (targetLeft[0] - leftRef.current.position.x) * 0.03;
      leftRef.current.position.y += (targetLeft[1] - leftRef.current.position.y) * 0.03;
      leftRef.current.position.z += (targetLeft[2] - leftRef.current.position.z) * 0.03;
    }

    const targetRight = step === 1 ? [2.5, 1.6, -0.8] : step === 2 ? [1.9, 1.0, -0.3] : [1.6, 0.8, 0];
    if (rightRef.current) {
      rightRef.current.position.x += (targetRight[0] - rightRef.current.position.x) * 0.03;
      rightRef.current.position.y += (targetRight[1] - rightRef.current.position.y) * 0.03;
      rightRef.current.position.z += (targetRight[2] - rightRef.current.position.z) * 0.03;
    }

    const targetTop = step === 1 ? [0.4, 2.2, 0.6] : step === 2 ? [0.1, 1.5, 0.2] : [0, 1.2, 0];
    if (topRef.current) {
      topRef.current.position.x += (targetTop[0] - topRef.current.position.x) * 0.03;
      topRef.current.position.y += (targetTop[1] - topRef.current.position.y) * 0.03;
      topRef.current.position.z += (targetTop[2] - topRef.current.position.z) * 0.03;
    }

    const meshes = [mainRef.current, leftRef.current, rightRef.current, topRef.current];
    meshes.forEach((m) => {
      if (m?.material) {
        m.material.opacity = currentOpacityRef.current;
      }
    });
  });

  return (
    <>
      <group ref={groupRef}>
        <lineSegments ref={mainRef} geometry={mainGeo} position={[0, 0, 0]}>
          <lineBasicMaterial color={lineColor} transparent opacity={baseOp * 0.3} depthWrite={false} />
        </lineSegments>
        <lineSegments ref={leftRef} geometry={leftGeo} position={[-2.8, -1.2, 0.8]}>
          <lineBasicMaterial color={lineColor} transparent opacity={baseOp * 0.3} depthWrite={false} />
        </lineSegments>
        <lineSegments ref={rightRef} geometry={rightGeo} position={[2.5, 1.6, -0.8]}>
          <lineBasicMaterial color={lineColor} transparent opacity={baseOp * 0.3} depthWrite={false} />
        </lineSegments>
        <lineSegments ref={topRef} geometry={topGeo} position={[0.4, 2.2, 0.6]}>
          <lineBasicMaterial color={lineColor} transparent opacity={baseOp * 0.3} depthWrite={false} />
        </lineSegments>
      </group>

      <points geometry={pointsGeo}>
        <pointsMaterial size={0.04} color={lineColor} transparent opacity={pointsOpacity} depthWrite={false} />
      </points>
    </>
  );
}

function BlueprintCanvas({ step, isDarkMode }) {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { margin: '80px' });

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none w-full h-full overflow-hidden"
      aria-hidden="true"
    >
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={typeof window !== 'undefined' && window.innerWidth < 640 ? [1, 1] : [1, 1.4]}
          gl={{ antialias: true, alpha: true }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <color attach="background" args={[isDarkMode ? '#07080b' : '#f3f4f7']} />
          <Suspense fallback={null}>
            <BlueprintMesh step={step} isDarkMode={isDarkMode} inView={inView} />
            <ambientLight intensity={0.6} />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LAYER 2 — PROGRESS RAIL (DOM)
   ═══════════════════════════════════════════════════════════════ */
function ProgressRail({ step, wizardConfig }) {
  const steps = wizardConfig?.steps?.map((s, idx) => ({
    num: String(idx + 1).padStart(2, '0'),
    title: s.progressTitle || ['What', 'Who', 'When'][idx] || `Step ${idx + 1}`,
  })) || [
    { num: '01', title: 'What' },
    { num: '02', title: 'Who' },
    { num: '03', title: 'When' },
  ];

  const descriptions = wizardConfig?.steps?.map((s, idx) => s.progressDesc || ['Define Project', 'Your Details', 'Timeline & Send'][idx] || '') || [
    'Define Project',
    'Your Details',
    'Timeline & Send',
  ];

  return (
    <div
      className="absolute top-0 left-0 right-0 z-20"
      role="navigation"
      aria-label={`Step ${step} of 3`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-center justify-between">
        {/* Left Eyebrow */}
        <span className="font-code text-[11px] uppercase tracking-[0.18em] text-accent font-medium select-none">
          Project Briefing
        </span>

        {/* Center Progress Steps */}
        <div className="flex items-center gap-2 sm:gap-3" aria-hidden="true">
          {steps.map((s, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isPast = step > stepNum;

            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-1.5 select-none">
                  <span
                    className={`font-code text-[10px] uppercase tracking-[0.1em] transition-colors duration-200 ${
                      isActive
                        ? 'text-content-primary font-medium'
                        : isPast
                        ? 'text-accent font-medium'
                        : 'text-content-muted'
                    }`}
                  >
                    <span className="inline sm:hidden">{s.num}</span>
                    <span className="hidden sm:inline">{`${s.num} ${s.title}`}</span>
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`w-4 sm:w-8 h-px transition-colors duration-200 ${
                      isPast ? 'bg-accent' : 'bg-border-subtle'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Step Description */}
        <span className="font-code text-[10px] text-content-muted uppercase tracking-wider select-none hidden sm:block">
          {descriptions[step - 1]}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TILES & SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function ProjectTypeTile({ value, title, desc, icon, selected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={`relative overflow-hidden p-4 sm:p-5 lg:p-6 rounded-[6px] text-left cursor-pointer transition-all duration-200 outline-none flex flex-col justify-between ${
        selected
          ? 'bg-accent/10 border-2 border-accent briefing-tile-selected'
          : 'bg-surface-base border border-border-default hover:border-accent'
      }`}
      style={{
        boxShadow: selected ? '0 0 0 1px var(--accent), 0 0 20px var(--accent-subtle)' : undefined,
      }}
    >
      <div>
        <div className={`transition-colors duration-200 ${selected ? 'text-accent' : 'text-content-muted'}`}>
          {icon}
        </div>
        <h4 className="font-sans font-bold text-[1rem] sm:text-[1.1rem] text-content-primary mt-3 mb-1">
          {title}
        </h4>
      </div>
      <p className="font-code text-[10px] text-content-muted uppercase tracking-wider">
        {desc}
      </p>
    </button>
  );
}

function TimelineTile({ value, number, title, desc, selected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={`flex items-start gap-4 p-5 rounded-[6px] text-left cursor-pointer transition-all duration-200 outline-none ${
        selected
          ? 'bg-accent/10 border-2 border-accent briefing-tile-selected'
          : 'bg-surface-base border border-border-default hover:border-accent'
      }`}
      style={{
        boxShadow: selected ? '0 0 0 1px var(--accent), 0 0 20px var(--accent-subtle)' : undefined,
      }}
    >
      <span
        className={`font-code font-bold text-[2rem] leading-none transition-colors duration-200 ${
          selected ? 'text-accent' : 'text-content-muted opacity-30'
        }`}
      >
        {number}
      </span>
      <div>
        <h4 className="font-sans font-bold text-[1.1rem] text-content-primary mb-1">
          {title}
        </h4>
        <p className="font-code text-[10px] text-content-muted uppercase tracking-wider">
          {desc}
        </p>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 1 — "What are we building?"
   ═══════════════════════════════════════════════════════════════ */
const DEFAULT_PROJECT_TYPES = [
  {
    id: 'web-app',
    label: 'Web App',
    description: 'React · Next.js · Full Stack',
  },
  {
    id: 'mobile-app',
    label: 'Mobile App',
    description: 'Flutter · Cross Platform',
  },
  {
    id: 'api-backend',
    label: 'API / Backend',
    description: 'Node · Express · NestJS',
  },
  {
    id: 'full-system',
    label: 'Full System',
    description: 'End-to-End Architecture',
  },
];

const PROJECT_TYPE_ICONS = {
  'web-app': (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  'mobile-app': (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  'api-backend': (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  'full-system': (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
};

function Step1({ formData, setFormData, onNext, wizardConfig }) {
  const [error, setError] = useState('');

  const rawTypes = Array.isArray(wizardConfig?.projectTypes) && wizardConfig.projectTypes.length > 0
    ? wizardConfig.projectTypes.filter((t) => t.visible !== false)
    : DEFAULT_PROJECT_TYPES;

  const tiles = rawTypes.map((t) => ({
    value: t.value || t.id,
    title: t.label || t.title,
    desc: t.description || t.desc,
    icon: PROJECT_TYPE_ICONS[t.value || t.id] || PROJECT_TYPE_ICONS['web-app'],
  }));

  const step1Info = wizardConfig?.steps?.[0];
  const step1Title = step1Info?.title || 'What are we\nbuilding?';
  const step1Sub = step1Info?.subtitle || step1Info?.description || 'Select your project type';
  const titleParts = step1Title.split('\n');

  const handleTileSelect = (val) => {
    setFormData((prev) => ({ ...prev, projectType: val }));
    if (error) setError('');
  };

  const handleContinue = () => {
    if (!formData.projectType) {
      setError('Please select a project type to continue');
      return;
    }
    onNext();
  };

  const isEnabled = Boolean(formData.projectType);

  return (
    <div className="max-w-5xl w-full mx-auto flex flex-col">
      {/* Heading */}
      <h2 className="font-sans font-extrabold text-[clamp(2rem,7vw,2.5rem)] sm:text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight text-content-primary mb-2">
        {titleParts[0]}
        {titleParts.length > 1 && (
          <>
            <br />
            <span className="text-accent">{titleParts.slice(1).join(' ')}</span>
          </>
        )}
      </h2>

      {/* Subtext */}
      <p className="font-code text-[12px] text-content-muted uppercase tracking-[0.12em] mb-8 sm:mb-10">
        {step1Sub}
      </p>

      {/* Project Type Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-8" role="radiogroup" aria-label="Project Types">
        {tiles.map((t) => (
          <ProjectTypeTile
            key={t.value}
            value={t.value}
            title={t.title}
            desc={t.desc}
            icon={t.icon}
            selected={formData.projectType === t.value}
            onSelect={handleTileSelect}
          />
        ))}
      </div>

      {/* Description Field */}
      <div className="mb-4">
        <textarea
          id="brief-project-description"
          name="description"
          rows={2}
          maxLength={200}
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value.slice(0, 200) }))}
          placeholder="Briefly describe what you want to build..."
          className="brief-textarea font-sans text-[1rem] text-content-primary bg-transparent border-none border-b border-border-default py-3 w-full outline-none resize-none caret-accent transition-[border-color] duration-200"
          style={{
            borderBottomColor: 'var(--border-default)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderBottomColor = 'var(--accent)'; }}
          onBlur={(e) => { e.currentTarget.style.borderBottomColor = 'var(--border-default)'; }}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="font-code text-[9px] text-content-muted uppercase tracking-wider select-none">
            Optional — skip to continue
          </span>
          <span className="font-code text-[9px] text-content-muted">
            {formData.description.length}/200
          </span>
        </div>
      </div>

      {/* Next Button */}
      <div className="self-end mt-6 sm:mt-8 flex flex-col items-end">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!isEnabled}
          className={`font-code text-[11px] uppercase tracking-[0.12em] px-7 py-3 rounded-sm inline-flex items-center gap-2.5 group transition-all duration-200 ${
            isEnabled
              ? 'bg-accent text-accent-foreground hover:bg-accent-hover cursor-pointer'
              : 'border border-border-default text-content-muted bg-transparent cursor-not-allowed'
          }`}
        >
          <span>Continue</span>
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>

        {error && (
          <p className="font-code text-[9px] text-red-400 mt-2 text-right">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 2 — "Who are you?"
   ═══════════════════════════════════════════════════════════════ */
function Step2({ formData, setFormData, errors, touched, onBlur, onChange, onNext, onBack, isDarkMode, wizardConfig }) {
  const [focusedField, setFocusedField] = useState(null);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isEnabled = Boolean(formData.name.trim() && isValidEmail(formData.email));

  const step2Info = wizardConfig?.steps?.[1];
  const step2Title = step2Info?.title || 'Tell me\nwho you are.';
  const step2Sub = step2Info?.subtitle || step2Info?.description || 'Your contact information';
  const titleParts = step2Title.split('\n');

  const getBorderColor = (fieldName) => {
    if (errors[fieldName] && touched[fieldName]) return '#ef4444';
    if (focusedField === fieldName) return 'var(--accent)';
    return isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  };

  return (
    <div className="max-w-5xl w-full mx-auto flex flex-col">
      {/* Heading */}
      <h2 className="font-sans font-extrabold text-[clamp(2rem,7vw,2.5rem)] sm:text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight text-content-primary mb-2">
        {titleParts[0]}
        {titleParts.length > 1 && (
          <>
            <br />
            <span className="text-accent">{titleParts.slice(1).join(' ')}</span>
          </>
        )}
      </h2>

      {/* Subtext */}
      <p className="font-code text-[12px] text-content-muted uppercase tracking-[0.12em] mb-8 sm:mb-12">
        {step2Sub}
      </p>

      {/* Field 1: Name */}
      <div
        style={{
          borderBottom: `1px solid ${getBorderColor('name')}`,
          paddingBottom: 20,
          marginBottom: 32,
        }}
        className="transition-[border-color] duration-200"
      >
        <label
          htmlFor="brief-name"
          className="font-code text-[9px] uppercase tracking-[0.16em] text-content-muted mb-2 block"
        >
          Your Name
        </label>
        <input
          id="brief-name"
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          onFocus={() => setFocusedField('name')}
          onBlur={() => {
            setFocusedField(null);
            onBlur('name');
          }}
          placeholder="Esubalew..."
          className="brief-input font-sans font-bold text-[clamp(1.3rem,5vw,2.2rem)] bg-transparent border-none outline-none w-full text-content-primary caret-accent"
        />
        {errors.name && touched.name && (
          <p className="font-code text-[9px] text-red-400 mt-2">
            {errors.name}
          </p>
        )}
      </div>

      {/* Field 2: Email Address */}
      <div
        style={{
          borderBottom: `1px solid ${getBorderColor('email')}`,
          paddingBottom: 20,
          marginBottom: 32,
        }}
        className="transition-[border-color] duration-200"
      >
        <label
          htmlFor="brief-email"
          className="font-code text-[9px] uppercase tracking-[0.16em] text-content-muted mb-2 block"
        >
          Email Address
        </label>
        <input
          id="brief-email"
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          onFocus={() => setFocusedField('email')}
          onBlur={() => {
            setFocusedField(null);
            onBlur('email');
          }}
          placeholder="you@company.com"
          className="brief-input font-sans font-bold text-[clamp(1.3rem,5vw,2.2rem)] bg-transparent border-none outline-none w-full text-content-primary caret-accent"
        />
        {errors.email && touched.email && (
          <p className="font-code text-[9px] text-red-400 mt-2">
            {errors.email}
          </p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6">
        <button
          type="button"
          onClick={onBack}
          className="font-code text-[11px] uppercase tracking-[0.12em] text-content-muted border border-border-default rounded-sm px-5 py-2.5 flex items-center gap-2 hover:border-accent hover:text-content-primary transition-colors cursor-pointer group"
        >
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!isEnabled}
          className={`font-code text-[11px] uppercase tracking-[0.12em] px-7 py-3 rounded-sm inline-flex items-center gap-2.5 group transition-all duration-200 ${
            isEnabled
              ? 'bg-accent text-accent-foreground hover:bg-accent-hover cursor-pointer'
              : 'border border-border-default text-content-muted bg-transparent cursor-not-allowed'
          }`}
        >
          <span>Continue</span>
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 3 — "When do you need this?"
   ═══════════════════════════════════════════════════════════════ */
const DEFAULT_TIMELINES = [
  {
    id: 'asap',
    label: 'As Soon As Possible',
    description: 'Ready to start immediately',
  },
  {
    id: '1-3-months',
    label: '1–3 Months',
    description: 'Planning phase, flexible start',
  },
  {
    id: '3-plus-months',
    label: '3+ Months',
    description: 'Long-term planning',
  },
];

function Step3({
  formData,
  setFormData,
  errors,
  isSubmitting,
  submitStatus,
  errorMessage,
  onSubmit,
  onBack,
  contactInfo,
  onReset,
  isDarkMode,
  wizardConfig,
}) {
  const [timelineError, setTimelineError] = useState('');

  const rawTimelines = Array.isArray(wizardConfig?.timelines) && wizardConfig.timelines.length > 0
    ? wizardConfig.timelines.filter((t) => t.visible !== false)
    : DEFAULT_TIMELINES;

  const tiles = rawTimelines.map((t, idx) => ({
    value: t.value || t.id,
    number: t.number || String(idx + 1).padStart(2, '0'),
    title: t.label || t.title,
    desc: t.description || t.desc,
  }));

  const step3Info = wizardConfig?.steps?.[2];
  const step3Title = step3Info?.title || 'When do you\nneed this?';
  const step3Sub = step3Info?.subtitle || step3Info?.description || 'Select your timeline';
  const titleParts = step3Title.split('\n');

  const submitText = wizardConfig?.submitButtonText || 'Send Brief';
  const submittingText = wizardConfig?.submittingButtonText || 'Sending...';
  const responseNotice = wizardConfig?.responseTimeText || wizardConfig?.responseTimeNotice || '⟳ Response within 4 hours';
  const privacyNotice = wizardConfig?.privacyText || wizardConfig?.privacyNotice || '✓ Your data is never shared';

  const handleTimelineSelect = (val) => {
    setFormData((prev) => ({ ...prev, timeline: val }));
    if (timelineError) setTimelineError('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.timeline) {
      setTimelineError('Please select a timeline');
      return;
    }
    onSubmit();
  };

  const isEnabled = Boolean(formData.timeline);

  // If status is success, replace full panel with SuccessScreen
  if (submitStatus === 'success') {
    return <SuccessScreen contactInfo={contactInfo} onReset={onReset} />;
  }

  return (
    <div className="max-w-5xl w-full mx-auto flex flex-col">
      {/* Heading */}
      <h2 className="font-sans font-extrabold text-[clamp(2rem,7vw,2.5rem)] sm:text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight text-content-primary mb-2">
        {titleParts[0]}
        {titleParts.length > 1 && (
          <>
            <br />
            <span className="text-accent">{titleParts.slice(1).join(' ')}</span>
          </>
        )}
      </h2>

      {/* Subtext */}
      <p className="font-code text-[12px] text-content-muted uppercase tracking-[0.12em] mb-8">
        {step3Sub}
      </p>

      {/* Timeline Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8" role="radiogroup" aria-label="Project Timeline">
        {tiles.map((t) => (
          <TimelineTile
            key={t.value}
            value={t.value}
            number={t.number}
            title={t.title}
            desc={t.desc}
            selected={formData.timeline === t.value}
            onSelect={handleTimelineSelect}
          />
        ))}
      </div>

      {timelineError && (
        <p className="font-code text-[9px] text-red-400 -mt-5 mb-4">
          {timelineError}
        </p>
      )}

      {/* Additional Message Field */}
      <div className="mb-4">
        <label
          htmlFor="brief-message"
          className="font-code text-[9px] uppercase tracking-[0.16em] text-content-muted mb-2 mt-4 block"
        >
          Additional notes (optional)
        </label>
        <textarea
          id="brief-message"
          name="message"
          rows={3}
          maxLength={400}
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value.slice(0, 400) }))}
          placeholder="Anything else I should know..."
          className="brief-textarea font-sans text-[1rem] text-content-primary bg-transparent border-none border-b border-border-default py-3 w-full outline-none resize-none caret-accent transition-[border-color] duration-200"
          style={{
            borderBottomColor: 'var(--border-default)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderBottomColor = 'var(--accent)'; }}
          onBlur={(e) => { e.currentTarget.style.borderBottomColor = 'var(--border-default)'; }}
        />
        <div className="flex justify-end items-center mt-2">
          <span className="font-code text-[9px] text-content-muted">
            {formData.message.length}/400
          </span>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8 border-t border-border-subtle pt-6">
        {/* Left commitments */}
        <div className="flex flex-col select-none">
          <span className="font-code text-[10px] text-content-muted">
            {responseNotice}
          </span>
          <span className="font-code text-[10px] text-content-muted mt-1">
            {privacyNotice}
          </span>
        </div>

        {/* Right buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBack}
            className="font-code text-[11px] uppercase tracking-[0.12em] text-content-muted border border-border-default rounded-sm px-5 py-3 flex items-center justify-center gap-2 hover:border-accent hover:text-content-primary transition-colors cursor-pointer group"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={!isEnabled || isSubmitting}
            className="font-code text-[11px] uppercase tracking-[0.12em] bg-accent text-accent-foreground px-8 py-3 rounded-sm flex items-center justify-center gap-2.5 hover:bg-accent-hover cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group"
            style={{
              boxShadow: isDarkMode
                ? '0 0 28px rgba(59,130,246,0.3)'
                : '0 0 28px rgba(37,99,235,0.2)',
            }}
          >
            {isSubmitting ? (
              <>
                <span className="w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0" />
                <span>{submittingText}</span>
              </>
            ) : (
              <>
                <span>{submitText}</span>
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="font-code text-[11px] text-red-500 dark:text-red-400 mt-4 p-3 bg-red-500/10 border-l-2 border-red-500">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUCCESS SCREEN (FULL-WIDTH REPLACEMENT)
   ═══════════════════════════════════════════════════════════════ */
function SuccessScreen({ contactInfo, onReset }) {
  return (
    <motion.div
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={{ clipPath: 'inset(0 0 0 0)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl w-full mx-auto flex flex-col items-center justify-center text-center py-12"
      role="status"
      aria-live="polite"
    >
      {/* Animated Checkmark */}
      <svg
        className="w-12 h-12 text-success"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          className="check-draw"
          d="M20 6L9 17L4 12"
        />
      </svg>

      <h3 className="font-sans font-extrabold text-3xl text-content-primary mt-6 mb-2">
        {contactInfo?.successTitle || contactInfo?.formTitle || contactInfo?.successMessage || 'Brief received.'}
      </h3>

      <div className="font-code text-[13px] text-content-muted">
        <p>{contactInfo?.successDescription || contactInfo?.formDescription || "I'll review your project and respond within 4 hours."}</p>
        <p className="mt-1">
          Sent to: {contactInfo?.email || 'esubalew392@gmail.com'}
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="font-code text-[10px] uppercase tracking-[0.12em] text-content-muted cursor-pointer underline-offset-4 hover:text-content-primary hover:underline mt-8 transition-colors"
      >
        Start a new brief
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — "THE BRIEFING ROOM"
   ═══════════════════════════════════════════════════════════════ */
export const ContactSection = () => {
  useTrackSection('contact');
  const themeContext = useTheme();
  const isDarkMode = themeContext?.isDarkMode ?? true;
  const shouldReduceMotion = useReducedMotion();

  const { content, loading } = useContentStore();
  const contactInfo = content?.contactInfo;

  const sectionRef = useRef(null);

  // Briefing Form State
  const [formData, setFormData] = useState({
    projectType: '',
    description: '',
    name: '',
    email: '',
    timeline: '',
    message: '',
  });

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Real-time blur validation
  const validateField = (name, val) => {
    const value = typeof val === 'string' ? val.trim() : '';
    if (name === 'name') {
      if (!value) return 'Name required';
      if (value.length < 2) return 'Name must be at least 2 characters';
    }
    if (name === 'email') {
      if (!value) return 'Email required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Valid email required';
    }
    return '';
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleStep2Next = () => {
    setTouched({ name: true, email: true });
    const nameErr = validateField('name', formData.name);
    const emailErr = validateField('email', formData.email);
    setErrors({ name: nameErr, email: emailErr });

    if (!nameErr && !emailErr) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const packedMessage = [
        `Project Type: ${formData.projectType}`,
        formData.description ? `Description: ${formData.description}` : null,
        `Timeline: ${formData.timeline}`,
        formData.message ? `Notes: ${formData.message}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      await api.post('/api/contact', {
        name: formData.name,
        email: formData.email,
        message: packedMessage,
      });

      setSubmitStatus('success');
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err?.message || 'Failed to dispatch brief. Please check connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      projectType: '',
      description: '',
      name: '',
      email: '',
      timeline: '',
      message: '',
    });
    setStep(1);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitStatus(null);
    setErrorMessage('');
  };

  if (loading && !contactInfo) {
    return <ContactSkeleton />;
  }

  // Curtain wipe transitions
  const curtainVariants = {
    enter: {
      clipPath: 'inset(100% 0% 0% 0%)',
      transition: {
        duration: shouldReduceMotion ? 0 : 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    center: {
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: {
        duration: shouldReduceMotion ? 0 : 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      clipPath: 'inset(0% 0% 100% 0%)',
      transition: {
        duration: shouldReduceMotion ? 0 : 0.45,
        ease: [0.4, 0, 1, 1],
      },
    },
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden min-h-screen flex flex-col justify-center bg-surface-raised dark:bg-canvas transition-colors duration-200"
      style={{
        minHeight: '100svh',
        backgroundColor: isDarkMode ? '#07080b' : '#f3f4f7',
      }}
    >
      {/* Layer 1 — Fullscreen R3F Background Blueprint */}
      <BlueprintCanvas step={step} isDarkMode={isDarkMode} />

      {/* Layer 2 — Progress Rail */}
      <ProgressRail step={step} wizardConfig={contactInfo?.wizard} />

      {/* Layer 3 — Step Panels */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={curtainVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8"
            >
              <Step1
                formData={formData}
                setFormData={setFormData}
                onNext={() => setStep(2)}
                wizardConfig={contactInfo?.wizard}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              variants={curtainVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8"
            >
              <Step2
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                touched={touched}
                onBlur={handleBlur}
                onChange={handleChange}
                onNext={handleStep2Next}
                onBack={() => setStep(1)}
                isDarkMode={isDarkMode}
                wizardConfig={contactInfo?.wizard}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              variants={curtainVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8"
            >
              <Step3
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                isSubmitting={isSubmitting}
                submitStatus={submitStatus}
                errorMessage={errorMessage}
                onSubmit={handleSubmit}
                onBack={() => setStep(2)}
                contactInfo={contactInfo}
                onReset={handleReset}
                isDarkMode={isDarkMode}
                wizardConfig={contactInfo?.wizard}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ContactSection;
