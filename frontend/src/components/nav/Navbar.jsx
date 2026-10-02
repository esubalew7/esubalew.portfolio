import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useContentStore } from '../../store/contentStore';
import { scrollToSectionById, getSectionHref, SECTION_IDS } from '../../utils/sectionNavigation';
import { AvailabilityTicker } from '../common/AvailabilityTicker';

const NAV_LINKS = [
  { id: SECTION_IDS.HOME, label: 'Home' },
  { id: SECTION_IDS.ABOUT, label: 'About' },
  { id: SECTION_IDS.SKILLS, label: 'Skills' },
  { id: SECTION_IDS.PROJECTS, label: 'Work' },
  { id: SECTION_IDS.EXPERIENCE, label: 'Timeline' },
  { id: SECTION_IDS.CONTACT, label: 'Contact' },
];

// ─── Desktop link ──────────────────────────────────────────────────────────
const DesktopLink = memo(function DesktopLink({ link, isActive, pathname, onNavigate }) {
  return (
    <a
      href={getSectionHref(link.id, pathname)}
      onClick={e => onNavigate(e, link.id)}
      aria-current={isActive ? 'page' : undefined}
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        color: isActive ? 'var(--orange)' : 'var(--text-muted)',
        padding: '4px 0',
        position: 'relative',
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      {link.label}
      {isActive && (
        <motion.span
          layoutId="nav-underline"
          style={{
            position: 'absolute', bottom: -2, left: 0, right: 0,
            height: 1, background: 'var(--orange)',
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
    </a>
  );
});

// ─── NAVBAR ────────────────────────────────────────────────────────────────
export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const content = useContentStore(s => s.content);
  const hero = content?.hero || {};
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      // Active section detection
      for (const link of [...NAV_LINKS].reverse()) {
        const el = document.getElementById(link.id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActive(link.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onNavigate = useCallback((e, id) => {
    if (!isHome) return;
    e.preventDefault();
    setMenuOpen(false);
    scrollToSectionById(id);
  }, [isHome]);

  const logoName = hero.name?.split(' ')[0] || 'Esubalew';

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        transition: 'background 0.4s, border-color 0.4s',
        background: scrolled ? (isDarkMode ? 'rgba(13,17,23,0.92)' : 'rgba(250,250,248,0.92)') : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border-faint)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <AvailabilityTicker />
      <div
        className="container-main"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '4.5rem',
        }}
      >
        {/* Logo — monogram style */}
        <a
          href="/"
          style={{
            display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
          }}
        >
          {/* Orange square mark */}
          <span
            style={{
              width: 28, height: 28, background: 'var(--orange)', borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 800, color: '#fff',
              letterSpacing: '-0.04em',
            }}
          >
            {logoName[0]}
          </span>
          <span
            style={{
              fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700,
              color: 'var(--text-primary)', letterSpacing: '-0.01em',
            }}
          >
            {logoName}
          </span>
        </a>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" style={{ display: 'flex', gap: 32 }} className="hidden-mobile">
          {NAV_LINKS.map(link => (
            <DesktopLink
              key={link.id}
              link={link}
              isActive={active === link.id}
              pathname={location.pathname}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: '1px solid var(--border-subtle)',
              borderRadius: 3, cursor: 'pointer', color: 'var(--text-muted)',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {isDarkMode ? (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          {/* Hire Me — orange pill */}
          <a
            href="#contact"
            onClick={e => { if (isHome) { e.preventDefault(); scrollToSectionById('contact'); } }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '8px 18px', borderRadius: 3,
              background: 'var(--orange)', color: '#fff',
              textDecoration: 'none', fontWeight: 500,
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 20px var(--orange-glow)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
            className="hidden-mobile"
          >
            Hire Me
          </a>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            style={{
              width: 36, height: 36, background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: 0,
            }}
            className="show-mobile"
          >
            <motion.span animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} style={{ display: 'block', width: 20, height: 1, background: 'var(--text-primary)', transformOrigin: 'center' }} />
            <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} style={{ display: 'block', width: 20, height: 1, background: 'var(--text-primary)' }} />
            <motion.span animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} style={{ display: 'block', width: 20, height: 1, background: 'var(--text-primary)', transformOrigin: 'center' }} />
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: isDarkMode ? 'rgba(13,17,23,0.97)' : 'rgba(250,250,248,0.97)',
              borderBottom: '1px solid var(--border-subtle)',
              backdropFilter: 'blur(16px)',
              padding: '1.5rem',
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.id}
                href={getSectionHref(link.id, location.pathname)}
                onClick={e => onNavigate(e, link.id)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                style={{
                  display: 'block', padding: '14px 0',
                  borderBottom: '1px solid var(--border-faint)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: active === link.id ? 'var(--orange)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) { .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </header>
  );
};

export default Navbar;
