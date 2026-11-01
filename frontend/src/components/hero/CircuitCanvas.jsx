/**
 * CircuitCanvas — fullscreen WebGL hero background
 *
 * Technique: pure Three.js (no R3F overhead) raw canvas.
 * What it renders:
 *   1. A sparse grid of circuit-board-like line segments (LineSegments, GLSL shader)
 *   2. Signal pulses that travel along those lines (animated via shader uniform)
 *   3. Node dot at each intersection (Points geometry)
 *   4. Dynamic Dark / Light mode adaptation with reactive uniform colors and blending
 *   5. Scroll-velocity reactive intensity — faster scroll = brighter pulse bursts
 *
 * Performance:
 *   - Single draw call for lines (LineSegments), single for nodes (Points)
 *   - Pure GPU animation — zero CPU buffer uploads per frame
 *   - DPR clamped to 1.5
 *   - IntersectionObserver halts loop when off-screen
 *   - prefers-reduced-motion: freezes time uniform
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ─── Grid config ───────────────────────────────────────────────────────────
const COLS        = 22;
const ROWS        = 14;
const JITTER      = 0.35;   // how much nodes deviate from perfect grid
const DENSITY     = 0.48;   // fraction of possible edges that get drawn
const ACCENT      = new THREE.Color(0xFF4D00);
const DIM_DARK    = new THREE.Color(0x1A2030);
const DIM_LIGHT   = new THREE.Color(0xCBD5E1);
const BG_DARK     = 0x080A0E;
const BG_LIGHT    = 0xF5F5F0;

// ─── Shaders ───────────────────────────────────────────────────────────────
const LINE_VERT = /* glsl */`
  attribute float aPulse;     // per-vertex pulse phase (0–1 along edge)
  varying   float vBrightness;

  uniform float uTime;
  uniform float uIntensity;   // scroll-driven 0–1

  void main() {
    // Signal wave: a cosine pulse that travels along the edge over time
    // aPulse encodes normalized distance along edge (0 = start, 1 = end)
    float wave     = cos((aPulse - mod(uTime * 0.38, 1.0)) * 6.2831) * 0.5 + 0.5;
    wave           = pow(wave, 6.0);                 // sharpen the pulse
    float base     = 0.06 + 0.04 * sin(uTime * 0.5 + aPulse * 12.0);
    vBrightness    = base + wave * (0.7 + uIntensity * 0.9);

    gl_Position    = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LINE_FRAG = /* glsl */`
  varying float vBrightness;
  uniform vec3  uAccent;
  uniform vec3  uDim;
  uniform float uIsDark;

  void main() {
    vec3 col = mix(uDim, uAccent, vBrightness);
    // In dark mode: lower alpha + additive blending
    // In light mode: crisp subtle trace with high-visibility accent pulse
    float alpha = uIsDark > 0.5
      ? (vBrightness * 0.85 + 0.06)
      : clamp(vBrightness * 1.1 + 0.32, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

const NODE_VERT = /* glsl */`
  attribute float aPhase;
  uniform   float uTime;
  uniform   float uIntensity;
  varying   float vAlpha;

  void main() {
    float pulse = 0.4 + 0.6 * abs(sin(uTime * 0.6 + aPhase * 6.28));
    vAlpha      = pulse * (0.5 + uIntensity * 0.6);
    gl_PointSize = 2.5 + 2.0 * pulse + uIntensity * 3.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NODE_FRAG = /* glsl */`
  varying float vAlpha;
  uniform vec3  uAccent;
  uniform float uIsDark;

  void main() {
    vec2  uv  = gl_PointCoord - 0.5;
    float d   = length(uv);
    if (d > 0.5) discard;
    float a   = (1.0 - smoothstep(0.2, 0.5, d)) * vAlpha;
    if (uIsDark < 0.5) {
      a = clamp(a * 1.35, 0.0, 1.0);
    }
    gl_FragColor = vec4(uAccent, a);
  }
`;

// ─── Build scene geometry ──────────────────────────────────────────────────
function buildScene(scene, w, h, isDark = true) {
  const aspect  = w / h;
  const scaleX  = aspect * 10;
  const scaleY  = 10;

  // Generate node grid with jitter
  const nodes = [];
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      const x = ((c / COLS) - 0.5) * 2 * scaleX + (Math.random() - 0.5) * JITTER * (scaleX / COLS) * 2;
      const y = ((r / ROWS) - 0.5) * 2 * scaleY + (Math.random() - 0.5) * JITTER * (scaleY / ROWS) * 2;
      nodes.push(new THREE.Vector3(x, y, 0));
    }
  }

  // Build edges — only between nearby grid neighbours
  const edgePositions = [];
  const aPulse        = [];

  const stride = COLS + 1;
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      const idx = r * stride + c;
      const A   = nodes[idx];
      if (!A) continue;

      // Right neighbour
      if (c < COLS && Math.random() < DENSITY) {
        const B = nodes[idx + 1];
        edgePositions.push(A.x, A.y, 0, B.x, B.y, 0);
        aPulse.push(0, 1);
      }
      // Down neighbour
      if (r < ROWS && Math.random() < DENSITY) {
        const B = nodes[idx + stride];
        edgePositions.push(A.x, A.y, 0, B.x, B.y, 0);
        aPulse.push(0, 1);
      }
    }
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
  lineGeo.setAttribute('aPulse',   new THREE.Float32BufferAttribute(aPulse, 1));

  const lineMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:      { value: 0 },
      uIntensity: { value: 0 },
      uAccent:    { value: new THREE.Color(ACCENT) },
      uDim:       { value: new THREE.Color(isDark ? DIM_DARK : DIM_LIGHT) },
      uIsDark:    { value: isDark ? 1.0 : 0.0 },
    },
    vertexShader:   LINE_VERT,
    fragmentShader: LINE_FRAG,
    transparent:    true,
    blending:       isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite:     false,
  });

  scene.add(new THREE.LineSegments(lineGeo, lineMat));

  // Node dots
  const nodePos   = [];
  const nodePhase = [];
  nodes.forEach((n) => {
    nodePos.push(n.x, n.y, 0);
    nodePhase.push(Math.random() * Math.PI * 2);
  });

  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePos, 3));
  nodeGeo.setAttribute('aPhase',   new THREE.Float32BufferAttribute(nodePhase, 1));

  const nodeMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:      { value: 0 },
      uIntensity: { value: 0 },
      uAccent:    { value: new THREE.Color(ACCENT) },
      uIsDark:    { value: isDark ? 1.0 : 0.0 },
    },
    vertexShader:   NODE_VERT,
    fragmentShader: NODE_FRAG,
    transparent:    true,
    blending:       isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite:     false,
  });

  scene.add(new THREE.Points(nodeGeo, nodeMat));

  return { lineMat, nodeMat };
}

// ─── Component ────────────────────────────────────────────────────────────
export default function CircuitCanvas({ isDarkMode = true }) {
  const mountRef    = useRef(null);
  const rafRef      = useRef(null);
  const stateRef    = useRef({});
  const isDarkRef   = useRef(isDarkMode);
  isDarkRef.current = isDarkMode;

  const scrollRef   = useRef({ lastY: 0, velocity: 0, intensity: 0 });
  const reducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const isMobileDevice = W < 768;
    const DPR = isMobileDevice ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H);
    renderer.setClearColor(isDarkRef.current ? BG_DARK : BG_LIGHT, 1);
    el.appendChild(renderer.domElement);

    // ── Scene & Camera ──
    const scene  = new THREE.Scene();
    const aspect = W / H;
    const camera = new THREE.OrthographicCamera(
      -aspect * 10, aspect * 10, 10, -10, 0.1, 100
    );
    camera.position.z = 5;

    // ── Geometry ──
    const { lineMat, nodeMat } = buildScene(scene, W, H, isDarkRef.current);
    stateRef.current = { renderer, scene, camera, lineMat, nodeMat, clock: new THREE.Clock() };

    // ── Scroll intensity ──
    const onScroll = () => {
      const s = scrollRef.current;
      const delta = Math.abs(window.scrollY - s.lastY);
      s.lastY = window.scrollY;
      s.velocity = Math.min(delta / 80, 1);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Animate (stops completely when offscreen or tab hidden) ──
    let isIntersecting = true;

    const stopLoop = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const animate = () => {
      if (!isIntersecting || document.hidden) {
        stopLoop();
        return;
      }

      const { clock } = stateRef.current;
      const t = reducedMotion ? 0 : clock.getElapsedTime();

      // Decay scroll intensity
      const s = scrollRef.current;
      s.intensity += (s.velocity - s.intensity) * 0.12;
      s.velocity  *= 0.88;

      lineMat.uniforms.uTime.value      = t;
      lineMat.uniforms.uIntensity.value = s.intensity;
      nodeMat.uniforms.uTime.value      = t;
      nodeMat.uniforms.uIntensity.value = s.intensity;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };

    const startLoop = () => {
      if (!rafRef.current && isIntersecting && !document.hidden) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    startLoop();

    // ── Visibility ──
    const io = new IntersectionObserver(([e]) => {
      isIntersecting = e.isIntersecting;
      if (isIntersecting) {
        startLoop();
      } else {
        stopLoop();
      }
    }, { threshold: 0 });
    io.observe(el);

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else if (isIntersecting) {
        startLoop();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // ── Resize ──
    const onResize = () => {
      const nW = window.innerWidth;
      const nH = window.innerHeight;
      renderer.setSize(nW, nH);
      camera.left   = -(nW / nH) * 10;
      camera.right  =  (nW / nH) * 10;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      stopLoop();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      io.disconnect();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  // ── Dynamic Theme Switching ──
  useEffect(() => {
    const { renderer, lineMat, nodeMat } = stateRef.current;
    if (renderer) {
      renderer.setClearColor(isDarkMode ? BG_DARK : BG_LIGHT, 1);
    }
    if (lineMat) {
      lineMat.uniforms.uDim.value.copy(isDarkMode ? DIM_DARK : DIM_LIGHT);
      lineMat.uniforms.uIsDark.value = isDarkMode ? 1.0 : 0.0;
      lineMat.blending = isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending;
      lineMat.needsUpdate = true;
    }
    if (nodeMat) {
      nodeMat.uniforms.uIsDark.value = isDarkMode ? 1.0 : 0.0;
      nodeMat.blending = isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending;
      nodeMat.needsUpdate = true;
    }
  }, [isDarkMode]);

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
}
