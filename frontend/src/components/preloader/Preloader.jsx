/**
 * Preloader — "Engineer's Field Notes" design
 *
 * What it does:
 *  1. Phase "boot" (0–600ms):  monospace counter ticks 0→100 with jitter
 *  2. Phase "reveal" (600ms):  name stamps in letter-by-letter from left
 *  3. Phase "exit" (after data ready + min 3.2s): orange bar sweeps right→left, wipe out
 *
 * WHY no R3F NeuralNetwork here: the audit showed it added ~856 kB to the preloader
 * chunk. The new loader is pure CSS + requestAnimationFrame — renders in <50ms.
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentStore } from '../../store/contentStore';
import { useProjects } from '../../context/ProjectContext';

const NAME = 'ESUBALEW';
const MIN_MS = 3200;

function useLoaderState() {
  const contentLoading  = useContentStore(s => s.loading);
  const { loading: projLoading } = useProjects();

  const [counter,   setCounter]   = useState(0);
  const [nameChars, setNameChars] = useState(0);
  const [done,      setDone]      = useState(false);
  const startRef    = useRef(Date.now());
  const completedRef = useRef(false);

  // Counter tick — jittery random increment, reaches ~95 quickly then stalls
  useEffect(() => {
    let raf;
    const tick = () => {
      setCounter(prev => {
        if (prev >= 95) return prev;
        const step = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
        return Math.min(prev + step, 95);
      });
      raf = setTimeout(tick, 40 + Math.random() * 60);
    };
    raf = setTimeout(tick, 40);
    return () => clearTimeout(raf);
  }, []);

  // Stamp name letters after 600ms
  useEffect(() => {
    if (nameChars >= NAME.length) return;
    const t = setTimeout(() => setNameChars(p => p + 1), nameChars === 0 ? 600 : 90 + Math.random() * 60);
    return () => clearTimeout(t);
  }, [nameChars]);

  // Keep the intro bounded even when optional content sources are unavailable.
  useEffect(() => {
    const elapsed   = Date.now() - startRef.current;
    const remaining = Math.max(0, MIN_MS - elapsed);
    const t = setTimeout(() => {
      setCounter(100);
      setTimeout(() => setDone(true), 400);
    }, remaining);
    return () => clearTimeout(t);
  }, [contentLoading, projLoading]);

  return { counter, nameChars, done };
}

// ─── Scanline overlay ──────────────────────────────────────────────────────
function Scanlines() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)',
        zIndex: 2,
      }}
    />
  );
}

// ─── PRELOADER ─────────────────────────────────────────────────────────────
export const Preloader = ({ onComplete }) => {
  const { counter, nameChars, done } = useLoaderState();

  useEffect(() => {
    if (done && onComplete) {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
  }, [done, onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.65,0,0.35,1] } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#080A0E',
            display: 'flex', flexDirection: 'column',
            alignItems: 'flex-start', justifyContent: 'center',
            padding: 'clamp(2rem,6vw,6rem)',
            overflow: 'hidden',
          }}
        >
          <Scanlines />

          {/* Orange accent bar — top-left edge */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
            style={{
              position: 'absolute', left: 0, top: '15%', bottom: '15%',
              width: 3, background: '#FF4D00',
              transformOrigin: 'top', zIndex: 3,
            }}
          />

          {/* Counter — top-right corner */}
          <div
            style={{
              position: 'absolute', top: 'clamp(1.5rem,4vw,3rem)', right: 'clamp(1.5rem,4vw,3rem)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 'clamp(11px,1.5vw,13px)',
              letterSpacing: '0.12em', color: 'rgba(240,242,245,0.25)',
              zIndex: 3,
            }}
          >
            {String(counter).padStart(3, '0')} / 100
          </div>

          {/* Small system label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 'clamp(9px,1.2vw,11px)',
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#FF4D00', marginBottom: '1.5rem', zIndex: 3,
            }}
          >
            Portfolio v3.0 — Initialising
          </motion.p>

          {/* Name — large, letter-stamp animation */}
          <div style={{ position: 'relative', zIndex: 3, overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 'clamp(2px,0.8vw,8px)' }}>
              {NAME.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: '100%' }}
                  animate={i < nameChars ? { opacity: 1, y: 0 } : { opacity: 0, y: '100%' }}
                  transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }}
                  style={{
                    display: 'inline-block',
                    fontFamily: 'Syne, Space Grotesk, sans-serif',
                    fontSize: 'clamp(3rem,10vw,9rem)',
                    fontWeight: 800,
                    lineHeight: 0.9,
                    letterSpacing: '-0.04em',
                    color: '#F0F2F5',
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Sub-title */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={nameChars >= NAME.length ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
            style={{
              marginTop: '1.5rem', zIndex: 3,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 'clamp(11px,1.4vw,13px)', letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'rgba(240,242,245,0.35)',
            }}
          >
            Full Stack Engineer · Ethiopia
          </motion.p>

          {/* Progress bar — bottom */}
          <div
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 2, background: 'rgba(255,255,255,0.04)', zIndex: 3,
            }}
          >
            <motion.div
              animate={{ width: `${counter}%` }}
              transition={{ duration: 0.3, ease: 'linear' }}
              style={{ height: '100%', background: '#FF4D00', transformOrigin: 'left' }}
            />
          </div>

          {/* Exit wipe — orange flash sweep */}
          <AnimatePresence>
            {counter === 100 && (
              <motion.div
                key="wipe"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, transparent, #FF4D00 40%, #FF4D00 60%, transparent)',
                  opacity: 0.15, zIndex: 10, pointerEvents: 'none',
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
