import { useRef, useMemo } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useContentStore } from '../store/contentStore';

// ─── Single experience entry ───────────────────────────────────────────────
function ExperienceEntry({ item, index, total }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const isLast = index === total - 1;
  const startDate = item.startDate ? new Date(item.startDate).getFullYear() : item.period?.split('–')[0]?.trim() || '20XX';
  const endDate   = item.current ? 'Present' : item.endDate ? new Date(item.endDate).getFullYear() : item.period?.split('–')[1]?.trim() || '';

  return (
    <div
      ref={ref}
      style={{ display: 'grid', gridTemplateColumns: '120px 1px 1fr', gap: '0 2.5rem', position: 'relative' }}
    >
      {/* Date column */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.1, duration: 0.6 }}
        style={{ textAlign: 'right', paddingTop: 4, paddingBottom: isLast ? 0 : 56 }}
      >
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, letterSpacing: '0.08em',
            color: item.current ? 'var(--orange)' : 'var(--text-muted)',
            display: 'block',
          }}
        >
          {startDate}
        </span>
        {endDate && (
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>
            – {endDate}
          </span>
        )}
      </motion.div>

      {/* Center line + node */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Node dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.4, type: 'spring', stiffness: 300 }}
          style={{
            width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 6,
            background: item.current ? 'var(--orange)' : 'var(--border-default)',
            boxShadow: item.current ? '0 0 16px var(--orange-glow)' : 'none',
            zIndex: 1,
          }}
        />
        {/* Connecting line */}
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16,1,0.3,1] }}
            style={{
              flex: 1, width: 1, background: 'var(--border-faint)',
              transformOrigin: 'top', marginTop: 8,
            }}
          />
        )}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16,1,0.3,1] }}
        style={{ paddingBottom: isLast ? 0 : 56, paddingTop: 2 }}
      >
        {/* Role */}
        <h3
          style={{
            fontFamily: 'Syne, Space Grotesk, sans-serif',
            fontSize: 'clamp(1.1rem,2vw,1.4rem)',
            fontWeight: 700, color: 'var(--text-primary)',
            letterSpacing: '-0.02em', marginBottom: 6,
          }}
        >
          {item.title || item.role}
        </h3>

        {/* Company */}
        <p style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
              color: item.current ? 'var(--orange)' : 'var(--text-secondary)',
              letterSpacing: '0.04em',
            }}
          >
            {item.company || item.institution || item.organization}
          </span>
          {item.location && (
            <>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-default)', display: 'inline-block' }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                {item.location}
              </span>
            </>
          )}
        </p>

        {/* Description */}
        {item.description && (
          <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)', maxWidth: 680 }}>
            {item.description}
          </p>
        )}

        {/* Skills used */}
        {item.skills?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
            {item.skills.map(s => (
              <span
                key={s}
                style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 2,
                  border: '1px solid var(--border-faint)',
                  color: 'var(--text-muted)',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── EXPERIENCE SECTION ────────────────────────────────────────────────────
const ExperienceSection = () => {
  const { content } = useContentStore();
  const { experience } = content || {};
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: '-60px' });

  const items = useMemo(() => {
    const cats = experience?.categories || [];
    const all  = [];
    cats.forEach(cat => (cat.items || []).forEach(item => all.push(item)));
    return all;
  }, [experience]);

  // Fallback demo items
  const displayItems = items.length ? items : [
    {
      title: 'Frontend Developer Intern',
      company: 'Askuala Link Software Company',
      location: 'Ethiopia',
      startDate: '2024',
      current: true,
      description: 'Building enterprise-grade React + Node.js systems. Architecting microservice backends, real-time WebSocket dashboards, and TOTP 2FA authentication flows for production deployments.',
      skills: ['React', 'Node.js', 'MongoDB', 'Socket.IO', 'Express'],
    },
    {
      title: 'Full Stack Developer',
      company: 'Freelance',
      location: 'Remote',
      startDate: '2023',
      endDate: '2024',
      description: 'Delivered 8+ production MERN stack applications including real estate platforms, college management systems, and agricultural marketplaces for Ethiopian clients.',
      skills: ['MERN', 'REST API', 'JWT', 'Tailwind', 'Flutter'],
    },
    {
      title: 'Computer Science (B.Sc.)',
      company: 'University — Ethiopia',
      location: 'Ethiopia',
      startDate: '2022',
      endDate: 'Present',
      description: 'Third-year CS student. Core coursework in algorithms, distributed systems, database design, and operating systems — applied directly to production projects.',
      skills: ['Algorithms', 'Data Structures', 'System Design', 'DB Architecture'],
    },
  ];

  return (
    <section
      id="experience"
      style={{ background: 'var(--void)', paddingTop: 'clamp(5rem,10vw,9rem)', paddingBottom: 'clamp(5rem,10vw,9rem)' }}
    >
      <div className="container-main">
        {/* Eyebrow */}
        <div className="section-eyebrow">Timeline</div>

        <div
          ref={headRef}
          style={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'space-between', alignItems: 'flex-end',
            gap: 24, marginBottom: 'clamp(3rem,6vw,6rem)',
          }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
            className="font-display text-h2"
            style={{ color: 'var(--text-primary)' }}
          >
            Where I've built<br />
            <span style={{ color: 'var(--text-secondary)' }}>real things.</span>
          </motion.h2>

          <motion.a
            initial={{ opacity: 0 }}
            animate={headInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--text-muted)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid var(--border-subtle)',
              padding: '10px 20px', borderRadius: 3,
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            Full Resume
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </motion.a>
        </div>

        {/* Timeline entries */}
        <div>
          {displayItems.map((item, i) => (
            <ExperienceEntry key={item._id || i} item={item} index={i} total={displayItems.length} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
