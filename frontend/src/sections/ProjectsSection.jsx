import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';

// ─── Filter chip ───────────────────────────────────────────────────────────
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 18px',
        borderRadius: 3,
        border: active ? '1px solid var(--orange)' : '1px solid var(--border-subtle)',
        background: active ? 'var(--orange-dim)' : 'transparent',
        color: active ? 'var(--orange)' : 'var(--text-secondary)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

// ─── Project card — editorial layout ──────────────────────────────────────
function ProjectCard({ project, index }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const liveUrl   = project.liveLink || project.liveUrl   || '#';
  const githubUrl = project.githubLink || project.githubUrl || '#';
  const techStack = Array.isArray(project.technologies)
    ? project.technologies
    : typeof project.technologies === 'string'
    ? project.technologies.split(',').map(t => t.trim())
    : project.techStack || [];

  // Alternate layout: odd cards push image right
  const isRight = index % 2 !== 0;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: (index % 3) * 0.12, duration: 0.8, ease: [0.16,1,0.3,1] }}
      className="project-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,340px),1fr))',
        gap: 'clamp(1.5rem,3vw,4rem)',
        alignItems: 'center',
        padding: 'clamp(2rem,4vw,3.5rem) 0',
        borderTop: '1px solid var(--border-faint)',
        direction: isRight ? 'rtl' : 'ltr',
      }}
    >
      {/* Image */}
      <div style={{ direction: 'ltr', position: 'relative', overflow: 'hidden', borderRadius: 4, aspectRatio: '16/9', background: 'var(--ink-raised)' }}>
        <img
          src={project.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80'}
          alt={project.title}
          loading="lazy"
          style={{
            display: 'block', width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
            filter: hovered ? 'grayscale(0%)' : 'grayscale(25%)',
          }}
        />
        {/* Orange overlay reveal on hover */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,77,0,0.06)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.4s',
          }}
        />
        {/* Category chip */}
        <span
          style={{
            position: 'absolute', bottom: 12, left: 12,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 2,
            background: 'rgba(8,10,14,0.8)',
            color: 'var(--text-secondary)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {project.category || 'MERN'}
        </span>
      </div>

      {/* Content */}
      <div style={{ direction: 'ltr' }}>
        {/* Index */}
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            letterSpacing: '0.16em', color: 'var(--orange)', textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          {String(index + 1).padStart(2, '0')} — {project.category || 'MERN'}
        </p>

        {/* Title */}
        <h3
          className="font-display"
          style={{
            fontSize: 'clamp(1.4rem,2.5vw,2rem)', fontWeight: 700,
            color: 'var(--text-primary)', lineHeight: 1.15,
            marginBottom: 16, letterSpacing: '-0.02em',
            transition: 'color 0.2s',
          }}
        >
          {project.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)',
            marginBottom: 24, display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {project.description}
        </p>

        {/* Tech tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
          {techStack.slice(0, 5).map(t => (
            <span
              key={t}
              style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '3px 10px', borderRadius: 2,
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--orange)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            Live
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-muted)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            Source
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </motion.article>
  );
}

// ─── PROJECTS SECTION ──────────────────────────────────────────────────────
const FILTERS = [
  { label: 'All Work', value: 'all' },
  { label: 'MERN',     value: 'mern' },
  { label: 'Frontend', value: 'frontend' },
  { label: 'Backend',  value: 'backend' },
  { label: 'Mobile',   value: 'mobile' },
];

export const ProjectsSection = () => {
  const { projects, loading } = useProjects();
  const [filter, setFilter] = useState('all');
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: '-60px' });

  const filtered = (Array.isArray(projects) ? projects : []).filter(p =>
    filter === 'all' || (p.category || '').toLowerCase().trim() === filter
  );

  return (
    <section
      id="projects"
      style={{ background: 'var(--ink)', paddingTop: 'clamp(5rem,10vw,9rem)', paddingBottom: 'clamp(5rem,10vw,9rem)' }}
    >
      <div className="container-main">
        {/* Eyebrow */}
        <div className="section-eyebrow">Selected Work</div>

        {/* Heading + filters row */}
        <div
          ref={headRef}
          style={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'space-between', alignItems: 'flex-end',
            gap: 24, marginBottom: 'clamp(3rem,5vw,5rem)',
          }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
            className="font-display text-h2"
            style={{ color: 'var(--text-primary)' }}
          >
            What I've shipped<br />
            <span style={{ color: 'var(--text-secondary)' }}>to production.</span>
          </motion.h2>

          {/* Filter chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={headInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
          >
            {FILTERS.map(f => (
              <FilterChip
                key={f.value}
                label={f.label}
                active={filter === f.value}
                onClick={() => setFilter(f.value)}
              />
            ))}
          </motion.div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '2px solid var(--border-subtle)', borderTopColor: 'var(--orange)',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        )}

        {/* Cards */}
        {!loading && (
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, letterSpacing: '0.08em' }}>
                No projects match this filter.
              </p>
            ) : (
              filtered.map((p, i) => (
                <ProjectCard key={p._id || p.id || i} project={p} index={i} />
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
};

export default ProjectsSection;
