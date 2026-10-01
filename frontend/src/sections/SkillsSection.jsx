import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useContentStore } from '../store/contentStore';
import { SkillsSkeleton } from '../components/SkeletonLoader';

// ─── 1. ORBIT DEFINITIONS (4 distinct tilted layers) ────────────────────────
const ORBIT_CONFIGS = [
  {
    id: 'orbit-1',
    name: 'Frontend',
    duration: 18,
    tiltX: 72,
    tiltZ: 12,
    radius: 135,
    skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS'],
    angles: [0, 72, 144, 216, 288],
    darkBorder: 'rgba(56, 189, 248, 0.14)',
    lightBorder: 'rgba(2, 132, 199, 0.20)',
    accentColor: '#38BDF8',
  },
  {
    id: 'orbit-2',
    name: 'Backend',
    duration: 26,
    tiltX: 58,
    tiltZ: -22,
    radius: 215,
    skills: ['Node.js', 'Express', 'NestJS', 'Redis', 'RabbitMQ'],
    angles: [36, 108, 180, 252, 324],
    darkBorder: 'rgba(16, 185, 129, 0.14)',
    lightBorder: 'rgba(5, 150, 105, 0.20)',
    accentColor: '#10B981',
  },
  {
    id: 'orbit-3',
    name: 'Data & Infrastructure',
    duration: 34,
    tiltX: 64,
    tiltZ: 30,
    radius: 295,
    skills: ['MongoDB', 'PostgreSQL', 'Docker', 'Microservices'],
    angles: [15, 105, 195, 285],
    darkBorder: 'rgba(129, 140, 248, 0.14)',
    lightBorder: 'rgba(99, 102, 241, 0.20)',
    accentColor: '#818CF8',
  },
  {
    id: 'orbit-4',
    name: 'Mobile & Tools',
    duration: 44,
    tiltX: 52,
    tiltZ: -8,
    radius: 375,
    skills: ['Flutter', 'Git', 'Postman', 'Swagger'],
    angles: [60, 150, 240, 330],
    darkBorder: 'rgba(245, 158, 11, 0.14)',
    lightBorder: 'rgba(217, 119, 6, 0.20)',
    accentColor: '#F59E0B',
  },
];

// ─── 2. SKILL METADATA (Experience + Production Status) ─────────────────────
const SKILL_META = {
  JavaScript: { exp: '3+ yrs', status: 'production' },
  TypeScript: { exp: '2+ yrs', status: 'production' },
  React: { exp: '3+ yrs', status: 'production' },
  'Next.js': { exp: '1+ yr', status: 'production' },
  'Tailwind CSS': { exp: '2+ yrs', status: 'production' },
  'Node.js': { exp: '3+ yrs', status: 'production' },
  Express: { exp: '3+ yrs', status: 'production' },
  NestJS: { exp: '1+ yr', status: 'production' },
  Redis: { exp: '1+ yr', status: 'production' },
  RabbitMQ: { exp: '< 1 yr', status: 'learning' },
  MongoDB: { exp: '3+ yrs', status: 'production' },
  PostgreSQL: { exp: '2+ yrs', status: 'production' },
  Docker: { exp: '1+ yr', status: 'production' },
  Microservices: { exp: '1+ yr', status: 'production' },
  Flutter: { exp: '1+ yr', status: 'production' },
  Git: { exp: '3+ yrs', status: 'production' },
  Postman: { exp: '3+ yrs', status: 'production' },
  Swagger: { exp: '2+ yrs', status: 'production' },
};

// ─── 3. SIMPLE ICONS SLUGS & OFFICIAL BRAND COLORS ─────────────────────────
const SLUG_MAP = {
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  React: 'react',
  'Next.js': 'nextdotjs',
  'Tailwind CSS': 'tailwindcss',
  'Node.js': 'nodedotjs',
  Express: 'express',
  NestJS: 'nestjs',
  Redis: 'redis',
  RabbitMQ: 'rabbitmq',
  MongoDB: 'mongodb',
  PostgreSQL: 'postgresql',
  Docker: 'docker',
  Microservices: 'microservices',
  Flutter: 'flutter',
  Git: 'git',
  Postman: 'postman',
  Swagger: 'swagger',
};

const BRAND_MAP = {
  JavaScript: '#F7DF1E',
  TypeScript: '#3178C6',
  React: '#61DAFB',
  'Next.js': '#000000',
  'Tailwind CSS': '#06B6D4',
  'Node.js': '#5FA04E',
  Express: '#000000',
  NestJS: '#E0234E',
  Redis: '#DC382D',
  RabbitMQ: '#FF6600',
  MongoDB: '#47A248',
  PostgreSQL: '#4169E1',
  Docker: '#2496ED',
  Microservices: '#A78BFA',
  Flutter: '#02569B',
  Git: '#F05032',
  Postman: '#FF6C37',
  Swagger: '#85EA2D',
};

// Helper to determine orbit category for any given skill name
const SKILL_TO_ORBIT = {};
ORBIT_CONFIGS.forEach((orbit) => {
  orbit.skills.forEach((skill) => {
    SKILL_TO_ORBIT[skill] = orbit.name;
  });
});

// ─── 4. CDN URL BUILDER ────────────────────────────────────────────────────
function getIconUrl(slug, hex, isDark) {
  let cleanHex = (hex || '').replace('#', '');
  if (isDark) {
    if (cleanHex === '000000' || slug === 'nextdotjs' || slug === 'express') {
      cleanHex = 'FFFFFF';
    }
  } else {
    if (cleanHex === '000000' || slug === 'nextdotjs' || slug === 'express') {
      cleanHex = '555555';
    }
  }
  return `https://cdn.simpleicons.org/${slug}/${cleanHex}`;
}

// Initials fallback generator
function getInitials(name) {
  if (!name) return 'SK';
  const parts = name.split(/[\s.-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Custom Microservices SVG icon
function MicroservicesIcon({ size = 18, color = '#A78BFA' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size} aria-label="Microservices">
      <circle cx="12" cy="12" r="2.5" fill={color} />
      <circle cx="5" cy="7" r="1.8" fill={color} opacity="0.75" />
      <circle cx="19" cy="7" r="1.8" fill={color} opacity="0.75" />
      <circle cx="5" cy="17" r="1.8" fill={color} opacity="0.75" />
      <circle cx="19" cy="17" r="1.8" fill={color} opacity="0.75" />
      <line x1="12" y1="9.5" x2="6.5" y2="8.2" stroke={color} strokeWidth="0.9" opacity="0.6" />
      <line x1="12" y1="9.5" x2="17.5" y2="8.2" stroke={color} strokeWidth="0.9" opacity="0.6" />
      <line x1="12" y1="14.5" x2="6.5" y2="15.8" stroke={color} strokeWidth="0.9" opacity="0.6" />
      <line x1="12" y1="14.5" x2="17.5" y2="15.8" stroke={color} strokeWidth="0.9" opacity="0.6" />
    </svg>
  );
}

// ─── 5. STARFIELD BACKGROUND (70 golden angle stars) ────────────────────────
const STARFIELD_DOTS = Array.from({ length: 70 }, (_, i) => {
  const angle = i * 137.508 * (Math.PI / 180);
  const r = 385 * Math.sqrt((i + 1) / 70);
  const cx = 410 + r * Math.cos(angle);
  const cy = 410 + r * Math.sin(angle);
  const radius = i % 2 === 0 ? 0.6 : 1.2;
  const op = 0.15 + (i % 5) * 0.04;
  return { cx: Math.round(cx), cy: Math.round(cy), r: radius, opacity: op };
});

function Starfield({ isDark }) {
  const baseOpacity = isDark ? 0.25 : 0.10;
  return (
    <svg
      viewBox="0 0 820 820"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    >
      {STARFIELD_DOTS.map((dot, idx) => (
        <circle
          key={idx}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={isDark ? '#8B939E' : '#9CA3AF'}
          opacity={dot.opacity * (baseOpacity / 0.25)}
        />
      ))}
    </svg>
  );
}

// ─── 6. NUCLEUS (THREE.JS CANVAS COMPONENT) ─────────────────────────────────
function Nucleus({ isDarkMode }) {
  const canvasRef = useRef(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let animId = null;
    let renderer = null;
    let scene = null;
    let camera = null;
    let observer = null;
    let isIntersecting = true;
    let icoMesh = null;
    let torusMesh = null;

    import('three')
      .then((THREE) => {
        if (!isMounted || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const width = 140;
        const height = 140;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
        camera.position.z = 3.6;

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
        });
        renderer.setSize(width, height, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0x000000, 0);

        const coreGroup = new THREE.Group();
        scene.add(coreGroup);

        // Inner solid sphere
        const sphereGeo = new THREE.SphereGeometry(0.5, 24, 24);
        const sphereMat = new THREE.MeshBasicMaterial({
          color: isDarkMode ? 0x0e1017 : 0xffffff,
          transparent: true,
          opacity: 0.95,
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        coreGroup.add(sphere);

        // Wireframe Icosahedron
        const icoGeo = new THREE.IcosahedronGeometry(1.1, 1);
        const icoMat = new THREE.MeshBasicMaterial({
          color: isDarkMode ? 0x3b82f6 : 0x2563eb,
          wireframe: true,
          transparent: true,
          opacity: isDarkMode ? 0.35 : 0.25,
        });
        icoMesh = new THREE.Mesh(icoGeo, icoMat);
        coreGroup.add(icoMesh);

        // Outer glow Torus ring
        const torusGeo = new THREE.TorusGeometry(1.3, 0.03, 16, 64);
        const torusMat = new THREE.MeshBasicMaterial({
          color: isDarkMode ? 0x3b82f6 : 0x2563eb,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
        });
        torusMesh = new THREE.Mesh(torusGeo, torusMat);
        torusMesh.rotation.x = Math.PI / 3;
        coreGroup.add(torusMesh);

        let lastTime = performance.now();
        const animate = (time) => {
          if (!isMounted) return;
          animId = requestAnimationFrame(animate);
          if (!isIntersecting) return;

          const dt = Math.min((time - lastTime) * 0.001, 0.1);
          lastTime = time;

          if (icoMesh) {
            icoMesh.rotation.x += 0.18 * dt;
            icoMesh.rotation.y += 0.28 * dt;
          }
          if (torusMesh) {
            torusMesh.rotation.z += 0.15 * dt;
            torusMesh.rotation.y += 0.1 * dt;
          }

          renderer.render(scene, camera);
        };
        animId = requestAnimationFrame(animate);

        // Viewport intersection observer to pause rendering when off-screen
        observer = new IntersectionObserver(
          (entries) => {
            if (entries[0]) {
              isIntersecting = entries[0].isIntersecting;
            }
          },
          { threshold: 0.05 }
        );
        if (canvas.parentElement) {
          observer.observe(canvas.parentElement);
        }
      })
      .catch((err) => {
        console.warn('Three.js failed to initialize in Nucleus:', err);
        if (isMounted) setHasError(true);
      });

    return () => {
      isMounted = false;
      if (animId) cancelAnimationFrame(animId);
      if (observer) observer.disconnect();
      if (renderer) renderer.dispose();
    };
  }, [isDarkMode]);

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none select-none z-20"
      style={{ width: 140, height: 140 }}
    >
      {hasError ? (
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center border border-blue-500/30"
          style={{
            background: isDarkMode
              ? 'radial-gradient(circle, #1a2030 0%, #0e1017 70%)'
              : 'radial-gradient(circle, #ffffff 0%, #e2e8f0 70%)',
            boxShadow: '0 0 24px rgba(59,130,246,0.2)',
          }}
        >
          <div
            className="w-14 h-14 rounded-full border border-dashed border-blue-400/40 animate-spin"
            style={{ animationDuration: '10s' }}
          />
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] block"
          style={{ background: 'transparent' }}
          width={140}
          height={140}
          aria-label="Full Stack 3D Nucleus Core"
        />
      )}
      <span
        className="font-mono text-[9px] tracking-[0.22em] uppercase font-bold text-center mt-[-4px] opacity-80"
        style={{ color: isDarkMode ? '#3b82f6' : '#2563eb' }}
      >
        FULL STACK
      </span>
    </div>
  );
}

// ─── 7. SKILL DETAIL SPECS & PREMIUM VERTICAL FOCUS CARD ────────────────────
const SKILL_DETAILS = {
  JavaScript: {
    category: 'Frontend & Backend',
    level: 'Advanced',
    description: 'Core web programming language for reactive UI rendering, event loops, and full-stack logic.',
    tags: ['ESNext', 'Async/Await', 'DOM APIs', 'Event Loop', 'Closures'],
  },
  TypeScript: {
    category: 'Full-Stack Type System',
    level: 'Advanced',
    description: 'Enterprise typed JavaScript ensuring compile-time contracts, strict types, and robust refactoring.',
    tags: ['Type Safety', 'Generics', 'Interfaces', 'Strict Mode', 'AST'],
  },
  React: {
    category: 'Frontend UI Library',
    level: 'Advanced',
    description: 'Building interactive, scalable user interfaces using component-driven architecture.',
    tags: ['React 19', 'Hooks', 'SPA', 'Vite', 'Component UI'],
  },
  'Next.js': {
    category: 'Full-Stack React Framework',
    level: 'Advanced',
    description: 'Production React framework for high-performance SSR, Server Components, and edge rendering.',
    tags: ['App Router', 'SSR', 'Server Actions', 'Edge API', 'SEO'],
  },
  'Tailwind CSS': {
    category: 'Design Systems & UI',
    level: 'Advanced',
    description: 'Utility-first CSS framework for building ultra-fast, responsive, and custom design systems.',
    tags: ['Utility CSS', 'Design Tokens', 'Dark Mode', 'Responsive', 'Flexbox'],
  },
  'Node.js': {
    category: 'Backend Architecture',
    level: 'Advanced',
    description: 'High-throughput asynchronous runtime powering distributed backends and event streams.',
    tags: ['Event Loop', 'Streams', 'Async I/O', 'V8 Engine', 'Microservices'],
  },
  Express: {
    category: 'Backend Framework',
    level: 'Advanced',
    description: 'Fast, minimalist server framework for scalable REST APIs, authentication, and middleware.',
    tags: ['REST APIs', 'Middleware', 'JWT Auth', 'CORS', 'Routing'],
  },
  NestJS: {
    category: 'Enterprise Microservices',
    level: 'Intermediate',
    description: 'Structured enterprise TypeScript backend framework built on dependency injection and modules.',
    tags: ['Dependency Injection', 'Decorators', 'Microservices', 'DTOs', 'Guards'],
  },
  Redis: {
    category: 'In-Memory Data Store',
    level: 'Intermediate',
    description: 'Ultra-fast in-memory data cache for high-speed session storage, rate limiting, and pub/sub queues.',
    tags: ['In-Memory', 'Pub/Sub', 'TTL Caching', 'Session Store', 'Key-Value'],
  },
  RabbitMQ: {
    category: 'Message Broker Systems',
    level: 'Active Learner',
    description: 'Distributed message broker orchestrating decoupled asynchronous queues and event architectures.',
    tags: ['AMQP', 'Queues', 'Exchanges', 'Event-Driven', 'Consumers'],
  },
  MongoDB: {
    category: 'NoSQL Database',
    level: 'Advanced',
    description: 'Scalable document database for dynamic JSON-like data, aggregations, and high-throughput MERN apps.',
    tags: ['Mongoose', 'Aggregation', 'Indexing', 'NoSQL', 'Transactions'],
  },
  PostgreSQL: {
    category: 'Relational Database',
    level: 'Advanced',
    description: 'Enterprise ACID relational database for complex relational modeling and indexed query pipelines.',
    tags: ['ACID', 'Complex Joins', 'Prisma', 'Indexing', 'Relational'],
  },
  Docker: {
    category: 'DevOps & Containers',
    level: 'Intermediate',
    description: 'Containerization engine providing reproducible build environments across dev and production clouds.',
    tags: ['Containers', 'Dockerfile', 'Compose', 'Multi-stage', 'CI/CD'],
  },
  Microservices: {
    category: 'Distributed Systems',
    level: 'Advanced',
    description: 'Decoupled service mesh architecture communicating via lightweight API gateways and event buses.',
    tags: ['Service Mesh', 'API Gateway', 'Decoupled', 'RPC', 'Resilience'],
  },
  Flutter: {
    category: 'Cross-Platform Mobile',
    level: 'Intermediate',
    description: 'Multi-platform UI framework compiling native iOS, Android, and web applications from a single codebase.',
    tags: ['Dart', 'Widgets', 'State Mgmt', 'Cross-Platform', 'Native APIs'],
  },
  Git: {
    category: 'Version Control',
    level: 'Advanced',
    description: 'Industry-standard distributed version control for GitFlow workflows, branching, and team CI/CD.',
    tags: ['Branching', 'Rebase', 'GitFlow', 'CI/CD Hooks', 'Version History'],
  },
  Postman: {
    category: 'API Testing & QA',
    level: 'Advanced',
    description: 'Complete API lifecycle suite for automated endpoint testing, mock servers, and integration tests.',
    tags: ['API Testing', 'Newman CLI', 'Env Variables', 'Automated QA', 'Collections'],
  },
  Swagger: {
    category: 'API Documentation',
    level: 'Advanced',
    description: 'OpenAPI specification toolkit for creating standardized, interactive, and machine-readable API contracts.',
    tags: ['OpenAPI 3.0', 'Schema Specs', 'API Contracts', 'Interactive Docs', 'Mocking'],
  },
};

function SkillFocusCard({
  skill,
  orbitLabel,
  brandColor,
  meta,
  isDark,
  isMobile,
}) {
  if (!skill) return null;
  const slug = SLUG_MAP[skill] || 'javascript';
  const orbitBadge = `${orbitLabel || SKILL_TO_ORBIT[skill] || 'Core'} Orbit`;
  const isMicroservices = skill === 'Microservices';
  const isProduction = meta?.status === 'production';
  const color = brandColor || BRAND_MAP[skill] || '#38BDF8';
  const details = SKILL_DETAILS[skill] || {
    category: 'Full-Stack',
    level: 'Advanced',
    description: 'Production-ready technology utilized across modern web and software stacks.',
    tags: ['Production', 'Full-Stack', 'Modern Web'],
  };

  const expFormatted = (meta?.exp || '3+ yrs')
    .replace('yrs', 'Years')
    .replace('yr', 'Year');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: isMobile ? 30 : 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: isMobile ? 20 : 10 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute z-50 pointer-events-none select-none ${
        isMobile
          ? 'bottom-4 left-4 right-4 w-auto rounded-[20px]'
          : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] w-[300px] md:w-[340px] rounded-[20px]'
      }`}
      style={{
        backgroundColor: isDark ? 'rgba(12, 16, 24, 0.78)' : 'rgba(255, 255, 255, 0.92)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: isDark
          ? '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 32px rgba(59, 130, 246, 0.18)'
          : '0 20px 50px rgba(15, 23, 42, 0.12)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        padding: '20px',
      }}
    >
      {/* ── TOP ROW: Icon + Tech Name + Orbit Badge ── */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: isDark ? `${color}18` : `${color}12`,
              border: `1px solid ${color}35`,
            }}
          >
            {isMicroservices ? (
              <MicroservicesIcon size={24} color={color} />
            ) : (
              <img
                src={getIconUrl(slug, color, isDark)}
                alt={skill}
                width={24}
                height={24}
                style={{ objectFit: 'contain', width: 24, height: 24, display: 'block' }}
              />
            )}
          </div>
          <div className="min-w-0">
            <h3
              className="font-sans font-extrabold text-base tracking-tight truncate leading-snug"
              style={{ color: isDark ? '#F0F2F5' : '#0D1117' }}
            >
              {skill}
            </h3>
          </div>
        </div>

        <span
          className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold shrink-0"
          style={{
            backgroundColor: `${color}18`,
            border: `1px solid ${color}35`,
            color: color,
          }}
        >
          {orbitBadge}
        </span>
      </div>

      {/* ── SHORT PROFESSIONAL DESCRIPTION ── */}
      <p
        className="font-sans text-xs leading-relaxed mb-3.5 text-left"
        style={{ color: isDark ? '#8B939E' : '#52596A' }}
      >
        {details.description}
      </p>

      {/* ── DIVIDER ── */}
      <div
        className="w-full mb-3"
        style={{
          height: 1,
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
        }}
      />

      {/* ── 2-COLUMN INFORMATION GRID ── */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3.5 text-left">
        {/* Experience */}
        <div>
          <span
            className="font-mono text-[9px] uppercase tracking-wider block"
            style={{ color: isDark ? '#8B939E' : '#9CA3AF' }}
          >
            Experience
          </span>
          <span
            className="font-sans text-xs font-bold"
            style={{ color: isDark ? '#F0F2F5' : '#0D1117' }}
          >
            {expFormatted}
          </span>
        </div>

        {/* Status */}
        <div>
          <span
            className="font-mono text-[9px] uppercase tracking-wider block"
            style={{ color: isDark ? '#8B939E' : '#9CA3AF' }}
          >
            Status
          </span>
          <span
            className="font-sans text-xs font-semibold flex items-center gap-1.5"
            style={{ color: isProduction ? '#10B981' : '#F59E0B' }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: isProduction ? '#10B981' : '#F59E0B' }}
            />
            {isProduction ? 'Production' : 'Learning'}
          </span>
        </div>

        {/* Category */}
        <div>
          <span
            className="font-mono text-[9px] uppercase tracking-wider block"
            style={{ color: isDark ? '#8B939E' : '#9CA3AF' }}
          >
            Category
          </span>
          <span
            className="font-sans text-xs font-medium truncate block"
            style={{ color: isDark ? '#D1D5DB' : '#374151' }}
            title={details.category}
          >
            {details.category}
          </span>
        </div>

        {/* Level */}
        <div>
          <span
            className="font-mono text-[9px] uppercase tracking-wider block"
            style={{ color: isDark ? '#8B939E' : '#9CA3AF' }}
          >
            Level
          </span>
          <span
            className="font-mono text-xs font-bold"
            style={{ color: color }}
          >
            {details.level}
          </span>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div
        className="w-full mb-3"
        style={{
          height: 1,
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
        }}
      />

      {/* ── TECHNOLOGY TAGS ── */}
      <div className="flex flex-wrap gap-1.5 mb-3.5">
        {details.tags.map((tag) => (
          <span
            key={tag}
            className="font-mono text-[9px] px-2 py-0.5 rounded-sm"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid rgba(0, 0, 0, 0.06)',
              color: isDark ? '#D1D5DB' : '#4B5563',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* ── BOTTOM SECTION: Progress Bar + Label + Footer Hint ── */}
      <div className="space-y-1.5 text-left">
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: '100%',
              background: `linear-gradient(90deg, ${color}, #3b82f6, #60a5fa)`,
            }}
          />
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <span
            className="font-sans text-[10px] font-medium"
            style={{ color: isDark ? '#8B939E' : '#6B7280' }}
          >
            Used across multiple production projects
          </span>
        </div>

        <div
          className="font-mono text-[9px] uppercase tracking-wider text-center pt-2"
          style={{
            color: isDark ? '#8B939E' : '#9CA3AF',
            opacity: 0.75,
          }}
        >
          Hover another node to inspect • Move cursor away to resume orbit
        </div>
      </div>
    </motion.div>
  );
}

// ─── 8. SKILL NODE (SINGLE ORBITING ELEMENT) ────────────────────────────────
function SkillNode({
  skill,
  initialAngle,
  radius,
  duration,
  isDark,
  isActive,
  hasActiveSkill,
  onHover,
  onLeave,
  onClick,
}) {
  const [imgError, setImgError] = useState(false);
  const brandColor = BRAND_MAP[skill] || '#38BDF8';
  const slug = SLUG_MAP[skill] || 'javascript';
  const isMicroservices = skill === 'Microservices';

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 1,
        height: 1,
        transform: `rotate(${initialAngle}deg) translateX(${radius}px)`,
        transformStyle: 'preserve-3d',
        pointerEvents: 'none',
      }}
    >
      {/* Counter-rotation keeps icon and label perfectly upright */}
      <div
        className="orbit-counter"
        style={{
          '--orbit-duration': `${duration}s`,
          animationPlayState: isActive ? 'paused' : 'running',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          transformStyle: 'preserve-3d',
          pointerEvents: 'none',
        }}
      >
        {/* Visual circular button */}
        <button
          type="button"
          onClick={onClick}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
          onFocus={onHover}
          onBlur={onLeave}
          aria-label={`Skill ${skill}`}
          style={{
            position: 'relative',
            width: 46,
            height: 46,
            borderRadius: '50%',
            backgroundColor: isDark
              ? 'rgba(14, 16, 23, 0.92)'
              : 'rgba(255, 255, 255, 0.95)',
            border: isActive
              ? `1.5px solid ${brandColor}`
              : isDark
              ? '1.5px solid rgba(255, 255, 255, 0.1)'
              : '1.5px solid rgba(0, 0, 0, 0.08)',
            boxShadow: isActive
              ? `0 0 25px ${brandColor}60, 0 0 50px ${brandColor}30`
              : isDark
              ? '0 2px 10px rgba(0, 0, 0, 0.5)'
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
            opacity: isActive ? 1 : hasActiveSkill ? 0.6 : 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isActive ? 'scale(1.18)' : hasActiveSkill ? 'scale(0.96)' : 'scale(1)',
            zIndex: isActive ? 40 : 10,
            pointerEvents: 'auto',
          }}
        >
          {/* Active pulse ring */}
          {isActive && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: `1.5px solid ${brandColor}`,
                animation: 'nodeRingPulse 1.6s cubic-bezier(0, 0.2, 0.8, 1) infinite',
              }}
            />
          )}

          {/* Node Icon */}
          {isMicroservices ? (
            <MicroservicesIcon size={20} color={brandColor} />
          ) : imgError ? (
            <span
              className="font-mono text-[9px] font-bold tracking-tight select-none"
              style={{ color: brandColor }}
            >
              {getInitials(skill)}
            </span>
          ) : (
            <img
              src={getIconUrl(slug, brandColor, isDark)}
              alt={skill}
              width={20}
              height={20}
              loading="lazy"
              decoding="async"
              style={{ objectFit: 'contain', width: 20, height: 20, display: 'block' }}
              onError={() => setImgError(true)}
            />
          )}
        </button>

        {/* Node Label — always visible below the node */}
        <div
          style={{
            position: 'absolute',
            top: 52,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: isActive ? 35 : 5,
            opacity: isActive ? 1 : hasActiveSkill ? 0.6 : 1,
            transition: 'opacity 0.25s ease',
          }}
        >
          <span
            className="font-mono text-[9px] tracking-widest uppercase transition-colors duration-200 select-none block text-center"
            style={{
              color: isActive
                ? brandColor
                : isDark
                ? '#8B939E'
                : '#52596A',
              fontWeight: isActive ? 700 : 500,
            }}
          >
            {skill}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── 9. ORBIT RING (INCLUDES RING BORDER & SPINNER WRAPPER) ─────────────────
function OrbitRing({
  orbit,
  isPaused,
  isDark,
  activeSkill,
  onHoverSkill,
  onLeaveSkill,
  onClickSkill,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: `${orbit.radius * 2}px`,
        height: `${orbit.radius * 2}px`,
        marginLeft: `-${orbit.radius}px`,
        marginTop: `-${orbit.radius}px`,
        borderRadius: '50%',
        border: `1px solid ${isDark ? orbit.darkBorder : orbit.lightBorder}`,
        transform: `rotateX(${orbit.tiltX}deg) rotateZ(${orbit.tiltZ}deg)`,
        transformStyle: 'preserve-3d',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {/* Orbit Spinner with Layer 2 inline animationPlayState */}
      <div
        className="orbit-spinner"
        style={{
          '--orbit-duration': `${orbit.duration}s`,
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          transformStyle: 'preserve-3d',
          pointerEvents: 'none',
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {orbit.skills.map((skillName, idx) => (
          <SkillNode
            key={skillName}
            skill={skillName}
            initialAngle={orbit.angles[idx]}
            radius={orbit.radius}
            duration={orbit.duration}
            isDark={isDark}
            isActive={activeSkill === skillName}
            hasActiveSkill={Boolean(activeSkill)}
            onHover={() => onHoverSkill(skillName)}
            onLeave={onLeaveSkill}
            onClick={() => onClickSkill(skillName)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── 10. RIGHT SIDE PANEL (DESKTOP ONLY) ────────────────────────────────────
function SkillsList({
  activeSkill,
  setActiveSkill,
  skillMeta,
  isDark,
}) {
  const activeMeta = activeSkill ? skillMeta[activeSkill] : null;
  const activeBrand = activeSkill ? BRAND_MAP[activeSkill] || '#38BDF8' : '#38BDF8';
  const activeSlug = activeSkill ? SLUG_MAP[activeSkill] || 'javascript' : null;
  const activeOrbit = activeSkill ? SKILL_TO_ORBIT[activeSkill] : null;

  return (
    <div className="hidden lg:flex flex-col w-[280px] shrink-0 gap-4 select-none">
      {/* Top: Active Skill Detail Card */}
      <div
        className="rounded-md p-4 min-h-[96px] flex flex-col justify-center transition-all duration-200"
        style={{
          backgroundColor: isDark ? '#141921' : '#EDEDE8',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)',
          borderLeft: activeSkill
            ? `3px solid ${activeBrand}`
            : isDark
              ? '3px solid rgba(255,255,255,0.1)'
              : '3px solid rgba(0,0,0,0.1)',
        }}
      >
        <AnimatePresence mode="wait">
          {activeSkill ? (
            <motion.div
              key={activeSkill}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-1"
            >
              <div className="flex items-center gap-2">
                {activeSkill === 'Microservices' ? (
                  <MicroservicesIcon size={18} color={activeBrand} />
                ) : (
                  <img
                    src={getIconUrl(activeSlug, activeBrand, isDark)}
                    alt={activeSkill}
                    width={18}
                    height={18}
                    style={{ objectFit: 'contain' }}
                  />
                )}
                <span
                  className="font-sans font-bold text-sm"
                  style={{ color: isDark ? '#F0F2F5' : '#0D1117' }}
                >
                  {activeSkill}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-[9px] uppercase font-bold" style={{ color: activeBrand }}>
                  {activeOrbit}
                </span>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: isDark ? '#8B939E' : '#52596A' }}
                >
                  {activeMeta?.exp} · {activeMeta?.status === 'production' ? 'Prod' : 'Active'}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[10px] text-center"
              style={{ color: isDark ? '#8B939E' : '#9CA3AF' }}
            >
              Hover any node to inspect
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Middle: Full Skill List organized by orbit */}
      <div
        className="rounded-md p-4 space-y-4"
        style={{
          backgroundColor: isDark ? 'rgba(14, 16, 23, 0.65)' : 'rgba(255, 255, 255, 0.7)',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
        }}
      >
        {ORBIT_CONFIGS.map((orbit) => (
          <div key={orbit.id}>
            <div
              className="font-mono text-[9px] uppercase tracking-[0.16em] mb-2 font-semibold"
              style={{ color: orbit.accentColor }}
            >
              {orbit.name}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {orbit.skills.map((skill) => {
                const isActive = activeSkill === skill;
                const brand = BRAND_MAP[skill] || '#38BDF8';
                const slug = SLUG_MAP[skill] || 'javascript';
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setActiveSkill(isActive ? null : skill)}
                    onMouseEnter={() => setActiveSkill(skill)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-sm border font-mono text-[10px] transition-all duration-150 cursor-pointer text-left"
                    style={{
                      backgroundColor: isActive
                        ? `${brand}15`
                        : isDark
                          ? '#080A0E'
                          : '#FFFFFF',
                      borderColor: isActive
                        ? brand
                        : isDark
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.08)',
                      color: isActive
                        ? brand
                        : isDark
                          ? '#8B939E'
                          : '#52596A',
                    }}
                  >
                    {skill === 'Microservices' ? (
                      <MicroservicesIcon size={12} color={isActive ? brand : isDark ? '#8B939E' : '#52596A'} />
                    ) : (
                      <img
                        src={getIconUrl(slug, brand, isDark)}
                        alt=""
                        width={12}
                        height={12}
                        style={{ objectFit: 'contain' }}
                      />
                    )}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: CMS Admin note card */}
      <div
        className="rounded-sm p-3 font-mono text-[9px] leading-relaxed"
        style={{
          backgroundColor: isDark ? '#141921' : '#EDEDE8',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          color: isDark ? '#8B939E' : '#9CA3AF',
        }}
      >
        ↑ Orbit assignment follows skills.categories order in Admin → Skills Editor
      </div>
    </div>
  );
}

// ─── 11. MOBILE FLAT SKILL GRID (< 640px) ───────────────────────────────────
function MobileSkillGrid({
  activeSkill,
  setActiveSkill,
  isDark,
}) {
  return (
    <div className="block lg:hidden w-full max-w-lg mx-auto mt-8 px-4 space-y-6">
      {ORBIT_CONFIGS.map((orbit) => (
        <div key={orbit.id}>
          <div
            className="font-mono text-[9px] uppercase tracking-[0.16em] mb-2 font-bold"
            style={{ color: orbit.accentColor }}
          >
            {orbit.name}
          </div>
          <div className="flex flex-wrap gap-2">
            {orbit.skills.map((skill) => {
              const isActive = activeSkill === skill;
              const brand = BRAND_MAP[skill] || '#38BDF8';
              const slug = SLUG_MAP[skill] || 'javascript';
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setActiveSkill(isActive ? null : skill)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border font-mono text-[10px] transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isActive
                      ? `${brand}20`
                      : isDark
                        ? 'rgba(14, 16, 23, 0.9)'
                        : '#FFFFFF',
                    borderColor: isActive
                      ? brand
                      : isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.08)',
                    color: isActive
                      ? brand
                      : isDark
                        ? '#F0F2F5'
                        : '#0D1117',
                  }}
                >
                  {skill === 'Microservices' ? (
                    <MicroservicesIcon size={14} color={isActive ? brand : isDark ? '#8B939E' : '#52596A'} />
                  ) : (
                    <img
                      src={getIconUrl(slug, brand, isDark)}
                      alt=""
                      width={14}
                      height={14}
                      style={{ objectFit: 'contain' }}
                    />
                  )}
                  <span>{skill}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 12. MAIN EXPORTED COMPONENT ────────────────────────────────────────────
export const SkillsSection = () => {
  const { content, loading } = useContentStore();
  const themeContext = useTheme();

  // Dark/Light mode detection
  const [isDarkClass, setIsDarkClass] = useState(true);
  useEffect(() => {
    const updateDarkState = () => {
      const hasLightClass = document.documentElement.classList.contains('light');
      setIsDarkClass(!hasLightClass);
    };
    updateDarkState();
    const observer = new MutationObserver(updateDarkState);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const isDarkMode = themeContext?.isDarkMode ?? isDarkClass;

  // Orbit animation pause state
  const [isPaused, setIsPaused] = useState(false);

  // Active skill for hover / inspect
  const [activeSkill, setActiveSkill] = useState(null);

  // Hover handlers: hovering node pauses entire orbital system; leaving resumes
  const handleHover = (skill) => {
    setActiveSkill(skill);
    setIsPaused(true);
  };

  const handleLeave = () => {
    setActiveSkill(null);
    setIsPaused(false);
  };

  // Mobile viewport detection for responsive orbit scaling
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Merge CMS skills with hardcoded skills (override metadata where CMS has records)
  const mergedSkillMeta = useMemo(() => {
    const merged = { ...SKILL_META };
    const categories = content?.skills?.categories;
    if (Array.isArray(categories) && categories.length > 0) {
      categories.forEach((cat) => {
        if (Array.isArray(cat.items)) {
          cat.items.forEach((item) => {
            if (item && item.name && merged[item.name]) {
              if (item.level) {
                merged[item.name] = {
                  ...merged[item.name],
                  exp: item.level >= 80 ? '3+ yrs' : item.level >= 50 ? '2+ yrs' : '1+ yr',
                  status: item.level >= 60 ? 'production' : 'learning',
                };
              }
            }
          });
        }
      });
    }
    return merged;
  }, [content?.skills?.categories]);

  // Loading skeleton state
  if (loading && !content) {
    return <SkillsSkeleton />;
  }

  return (
    <section
      id="skills"
      className="relative overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: isDarkMode ? '#07080b' : '#fafafc',
        paddingTop: 'clamp(2.5rem, 5vw, 4rem)',
        paddingBottom: 'clamp(2.5rem, 5vw, 4rem)',
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial space glow behind orbital canvas */}
      {isDarkMode && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.04) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─── SECTION HEADER ─── */}
        <div
          className="flex flex-col items-center text-center"
          style={{ marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}
        >
          {/* Eyebrow Label with 28px horizontal line */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-7 h-[1px]"
              style={{ backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb' }}
            />
            <span
              className="font-mono text-[11px] tracking-[0.18em] uppercase font-bold"
              style={{ color: isDarkMode ? '#3b82f6' : '#2563eb' }}
            >
              Technical Arsenal
            </span>
          </div>

          {/* H2 Heading */}
          <h2 className="font-sans font-extrabold text-4xl md:text-5xl tracking-tight leading-tight mb-4">
            <span style={{ color: isDarkMode ? '#F0F2F5' : '#0D1117' }}>
              The stack I ship{' '}
            </span>
            <span style={{ color: isDarkMode ? '#8B939E' : '#52596A' }}>
              to production.
            </span>
          </h2>

          {/* Stat row */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 font-mono text-xs mb-5">
            <span style={{ color: isDarkMode ? '#8B939E' : '#9CA3AF' }}>
              18 technologies
            </span>
            <span style={{ color: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}>•</span>
            <span style={{ color: isDarkMode ? '#8B939E' : '#9CA3AF' }}>
              4 orbit layers
            </span>
            <span style={{ color: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}>•</span>
            <span style={{ color: isDarkMode ? '#8B939E' : '#9CA3AF' }}>
              Production-grade
            </span>
          </div>

          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className="px-3 py-1.5 rounded-sm font-mono text-[10px] tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-2"
            style={{
              border: isDarkMode
                ? '1px solid rgba(255, 255, 255, 0.14)'
                : '1px solid rgba(0, 0, 0, 0.12)',
              color: isDarkMode ? '#8B939E' : '#52596A',
              backgroundColor: isDarkMode ? 'rgba(14, 16, 23, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: isPaused ? '#F59E0B' : '#10B981' }}
            />
            {isPaused ? 'Resume Orbit' : 'Pause Orbit'}
          </button>
        </div>

        {/* ─── MAIN CONTENT: ORBITAL CANVAS + RIGHT PANEL ─── */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10">
          {/* ORBITAL CANVAS CONTAINER */}
          <div
            className={`relative w-full max-w-[820px] mx-auto select-none ${isPaused ? 'orbits-paused' : ''
              }`}
            style={{
              height: isMobile ? 400 : 820,
              perspective: '1000px',
              perspectiveOrigin: '50% 50%',
            }}
          >
            {/* STARFIELD SVG BACKGROUND */}
            <Starfield isDark={isDarkMode} />

            {/* 3D PERSPECTIVE CONTAINER */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transformStyle: 'preserve-3d',
                transform: isMobile ? 'scale(0.65)' : 'none',
                transformOrigin: '50% 50%',
              }}
            >
              {/* NUCLEUS CENTER CORE (Three.js wireframe icosahedron) */}
              <Nucleus isDarkMode={isDarkMode} />

              {/* 4 3D ORBIT RINGS */}
              {ORBIT_CONFIGS.map((orbit) => (
                <OrbitRing
                  key={orbit.id}
                  orbit={orbit}
                  isPaused={isPaused}
                  isDark={isDarkMode}
                  activeSkill={activeSkill}
                  onHoverSkill={handleHover}
                  onLeaveSkill={handleLeave}
                  onClickSkill={(skill) =>
                    setActiveSkill((curr) => {
                      if (curr === skill) {
                        setIsPaused(false);
                        return null;
                      }
                      setIsPaused(true);
                      return skill;
                    })
                  }
                />
              ))}
            </div>

            {/* FIXED FOCUS CARD & SPOTLIGHT ON HOVER */}
            <AnimatePresence>
              {activeSkill && (
                <>
                  {/* Subtle radial spotlight behind card */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.08 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="absolute pointer-events-none select-none z-40 hidden sm:block"
                    style={{
                      width: 440,
                      height: 440,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -20%)',
                      background: `radial-gradient(circle, ${BRAND_MAP[activeSkill] || '#38BDF8'} 0%, #3b82f6 50%, transparent 70%)`,
                      filter: 'blur(48px)',
                    }}
                    aria-hidden="true"
                  />

                  <SkillFocusCard
                    skill={activeSkill}
                    orbitLabel={SKILL_TO_ORBIT[activeSkill]}
                    brandColor={BRAND_MAP[activeSkill]}
                    meta={mergedSkillMeta[activeSkill]}
                    isDark={isDarkMode}
                    isMobile={isMobile}
                  />
                </>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT SIDE PANEL (Desktop only) */}
          <SkillsList
            activeSkill={activeSkill}
            setActiveSkill={(skill) => {
              setActiveSkill(skill);
              setIsPaused(Boolean(skill));
            }}
            skillMeta={mergedSkillMeta}
            isDark={isDarkMode}
          />
        </div>

        {/* MOBILE FLAT SKILL GRID (< 640px) */}
        <MobileSkillGrid
          activeSkill={activeSkill}
          setActiveSkill={(skill) => {
            setActiveSkill(skill);
            setIsPaused(Boolean(skill));
          }}
          isDark={isDarkMode}
        />
      </div>
    </section>
  );
};

export default SkillsSection;