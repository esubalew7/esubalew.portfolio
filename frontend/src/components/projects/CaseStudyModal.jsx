import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCloudinaryUrl } from '../../utils/cloudinary';

/**
 * CaseStudyModal Component
 * Full-screen modal that breaks down a project's engineering case study:
 * - Problem Statement
 * - Engineered Solution
 * - Tech Stack
 * - Measurable Outcome (e.g., "Reduced load time by 60%")
 */
export const CaseStudyModal = ({ project, onClose }) => {
  // Lock body scroll and listen for ESC key while modal is open
  useEffect(() => {
    if (!project) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const caseStudy = project.caseStudy || {};
  const problem =
    caseStudy.problem ||
    'Legacy architecture suffered from unoptimized state distribution, high network overhead, and fragmented communication channels.';
  const solution =
    caseStudy.solution ||
    project.description ||
    'Architected an end-to-end full stack system with optimized database indexing, reactive state streaming, and enterprise authentication.';
  const outcome =
    caseStudy.outcome ||
    'Successfully deployed to production with zero data integrity loss and significant throughput improvements under load.';

  const techStack = Array.isArray(caseStudy.techStack) && caseStudy.techStack.length > 0
    ? caseStudy.techStack
    : Array.isArray(project.technologies)
    ? project.technologies
    : [];

  const metrics = Array.isArray(caseStudy.metrics) && caseStudy.metrics.length > 0
    ? caseStudy.metrics
    : [
        { label: 'System Uptime', value: '99.9%' },
        { label: 'Architecture', value: (project.category || 'MERN').toUpperCase() },
        { label: 'Status', value: 'Production' },
      ];

  const liveUrl = project.liveLink || project.liveUrl || '#';
  const githubUrl = project.githubLink || project.githubUrl || '#';

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(1rem, 3vw, 2.5rem)',
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(8, 10, 14, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '920px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--ink, #0d1117)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
            borderRadius: '8px',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 77, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top header bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid var(--border-faint, rgba(255, 255, 255, 0.06))',
              background: 'rgba(13, 17, 23, 0.6)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--orange)',
                  background: 'rgba(255, 77, 0, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '3px',
                }}
              >
                Case Study • {(project.category || 'MERN').toUpperCase()}
              </span>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                }}
              >
                Deep-Dive Architecture
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '6px 12px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--orange)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <span>ESC</span>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
            {/* Title & Banner Image */}
            <h2
              id="case-study-title"
              className="font-display"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                marginBottom: '1rem',
                letterSpacing: '-0.02em',
              }}
            >
              {project.title}
            </h2>

            {/* Measurable Outcome Banner */}
            <div
              style={{
                margin: '1.5rem 0 2rem',
                padding: '1.25rem 1.5rem',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, rgba(255, 77, 0, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%)',
                border: '1px solid rgba(255, 77, 0, 0.25)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'var(--orange)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--orange)',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  Measurable Impact & Outcome
                </p>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {outcome}
                </p>
              </div>
            </div>

            {/* Metrics Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                marginBottom: '2.5rem',
              }}
            >
              {metrics.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    borderRadius: '4px',
                    background: 'var(--ink-raised, #161b22)',
                    border: '1px solid var(--border-faint)',
                  }}
                >
                  <span
                    className="font-display"
                    style={{
                      display: 'block',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.2,
                    }}
                  >
                    {m.value}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                    }}
                  >
                    {m.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Problem & Solution Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
                gap: '1.75rem',
                marginBottom: '2.5rem',
              }}
            >
              {/* Problem */}
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.03)',
                  borderLeft: '3px solid #ef4444',
                  borderTop: '1px solid var(--border-faint)',
                  borderRight: '1px solid var(--border-faint)',
                  borderBottom: '1px solid var(--border-faint)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#ef4444',
                      fontWeight: 600,
                    }}
                  >
                    01 • Problem Statement
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.75,
                    color: 'var(--text-secondary)',
                    margin: 0,
                  }}
                >
                  {problem}
                </p>
              </div>

              {/* Solution */}
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.03)',
                  borderLeft: '3px solid #10b981',
                  borderTop: '1px solid var(--border-faint)',
                  borderRight: '1px solid var(--border-faint)',
                  borderBottom: '1px solid var(--border-faint)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#10b981',
                      fontWeight: 600,
                    }}
                  >
                    02 • Engineered Solution
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.75,
                    color: 'var(--text-secondary)',
                    margin: 0,
                  }}
                >
                  {solution}
                </p>
              </div>
            </div>

            {/* Tech Stack */}
            <div style={{ marginBottom: '2.5rem' }}>
              <p
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '12px',
                }}
              >
                03 • Technology Stack & Tools Used
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '5px 12px',
                      borderRadius: '3px',
                      background: 'var(--ink-raised, #161b22)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px',
                alignItems: 'center',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-faint)',
              }}
            >
              {liveUrl && liveUrl !== '#' && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    background: 'var(--orange)',
                    color: '#fff',
                    borderRadius: '4px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 20px var(--orange-glow)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <span>Launch Live App</span>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              )}

              {githubUrl && githubUrl !== '#' && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    borderRadius: '4px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--text-primary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Repository</span>
                </a>
              )}

              <button
                onClick={onClose}
                style={{
                  marginLeft: 'auto',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Close Window
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CaseStudyModal;
