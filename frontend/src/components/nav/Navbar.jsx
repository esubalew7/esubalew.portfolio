import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useContentStore } from '../../store/contentStore';
import { useTerminalModal } from '../../context/TerminalContext';
import { scrollToSectionById, getSectionHref, SECTION_IDS } from '../../utils/sectionNavigation';

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
      className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--orange)] rounded-xs"
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        color: isActive ? 'var(--orange)' : 'var(--text-secondary)',
        padding: '4px 0',
        position: 'relative',
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
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
  const { toggleTerminal, showEntryPoint, shortcut: terminalShortcut } = useTerminalModal();
  const location = useLocation();
  const navigate = useNavigate();
  const content = useContentStore(s => s.content);
  const hero = content?.hero || {};
  const isHome = location.pathname === '/';

  const logoName = content?.navbar?.brandName?.split(' ')[0] || hero.name?.split(' ')[0] || 'Esubalew';
  const ctaText = content?.navbar?.ctaText || 'Hire Me';
  const ctaLink = content?.navbar?.ctaLink || '#contact';

  const dynamicNavLinks = useMemo(() => {
    const LABEL_TO_SECTION = {
      home: 'home',
      about: 'about',
      skills: 'skills',
      work: 'projects',
      projects: 'projects',
      timeline: 'experience',
      experience: 'experience',
      testimonials: 'testimonials',
      feedback: 'testimonials',
      contact: 'contact',
    };

    const items = content?.navbar?.navItems;
    if (Array.isArray(items) && items.length > 0) {
      return items
        .filter((item) => item.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((item) => {
          const rawId = (item.id || item.path || '').replace('#', '').trim();
          const cleanLabel = (item.label || '').toLowerCase().trim();
          const targetId = rawId || LABEL_TO_SECTION[cleanLabel] || cleanLabel;
          return {
            id: targetId,
            label: item.label,
          };
        });
    }
    return NAV_LINKS;
  }, [content?.navbar?.navItems]);

  useEffect(() => {
    let ticking = false;
    let rafId = null;

    const updateActiveSection = () => {
      const scrollY = window.scrollY;
      const isScrolled = scrollY > 40;
      setScrolled(prev => (prev !== isScrolled ? isScrolled : prev));

      // Active section detection
      for (const link of [...dynamicNavLinks].reverse()) {
        const el = document.getElementById(link.id);
        if (el && scrollY >= el.offsetTop - 120) {
          setActive(prev => (prev !== link.id ? link.id : prev));
          break;
        }
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(updateActiveSection);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateActiveSection();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [dynamicNavLinks]);

  const onNavigate = useCallback((e, id) => {
    if (!isHome) return;
    e.preventDefault();
    setMenuOpen(false);
    scrollToSectionById(id);
  }, [isHome]);

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
          {dynamicNavLinks.map(link => (
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
          {/* Terminal button */}
          {showEntryPoint && (
            <button
              onClick={toggleTerminal}
              aria-label="Open Developer Terminal"
              title={`Developer Terminal (${terminalShortcut})`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]"
              style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: '1px solid var(--border-subtle)',
                borderRadius: 3, cursor: 'pointer', color: 'var(--text-muted)',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]"
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
            href={ctaLink}
            onClick={e => {
              if (isHome && ctaLink.startsWith('#')) {
                e.preventDefault();
                scrollToSectionById(ctaLink.replace('#', ''));
              }
            }}
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
            className="hidden-mobile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] focus-visible:ring-offset-2"
          >
            {ctaText}
          </a>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="show-mobile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]"
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
            {dynamicNavLinks.map((link, i) => (
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

            {showEntryPoint && (
              <motion.button
                onClick={() => {
                  setMenuOpen(false);
                  toggleTerminal();
                }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: dynamicNavLinks.length * 0.05, duration: 0.3 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 0',
                  borderBottom: '1px solid var(--border-faint)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                <span>Terminal ({terminalShortcut})</span>
              </motion.button>
            )}
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
