import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useContentStore } from '../store/contentStore';

// ─── Tech logos as SVG text — brand colours, no external CDN ───────────────
const BRAND = {
  React:       '#61DAFB',
  'Node.js':   '#3C873A',
  MongoDB:     '#47A248',
  Express:     '#AAAAAA',
  TypeScript:  '#3178C6',
  JavaScript:  '#F7DF1E',
  PostgreSQL:  '#336791',
  Python:      '#3572A5',
  Flutter:     '#02569B',
  Tailwind:    '#38BDF8',
  Docker:      '#2496ED',
  NestJS:      '#E0234E',
  Redux:       '#764ABC',
  GraphQL:     '#E10098',
  AWS:         '#FF9900',
  Git:         '#F05032',
  'Next.js':   '#FFFFFF',
  PHP:         '#777BB4',
};

const DEFAULT_SKILLS = [
  { name: 'React',      level: 92 },
  { name: 'Node.js',    level: 88 },
  { name: 'MongoDB',    level: 85 },
  { name: 'TypeScript', level: 80 },
  { name: 'Express',    level: 87 },
  { name: 'JavaScript', level: 93 },
  { name: 'PostgreSQL', level: 72 },
  { name: 'Python',     level: 68 },
  { name: 'Flutter',    level: 65 },
  { name: 'Tailwind',   level: 90 },
  { name: 'Docker',     level: 60 },
  { name: 'NestJS',     level: 70 },
];

// ─── Single skill bar ──────────────────────────────────────────────────────
function SkillBar({ name, level, index, inView }) {
  const color = BRAND[name] || 'var(--orange)';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginBottom: 28 }}
    >
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
          {name}
        </span>
        <span
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}
        >
          {level}%
        </span>
      </div>

      {/* Track */}
      <div style={{ position: 'relative', height: 2, background: 'var(--border-faint)', borderRadius: 2 }}>
        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : { width: 0 }}
          transition={{ delay: 0.3 + index * 0.05, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: color, borderRadius: 2 }}
        />
        {/* Trailing dot */}
        <motion.div
          initial={{ left: 0, opacity: 0 }}
          animate={inView ? { left: `${level}%`, opacity: 1 } : {}}
          transition={{ delay: 0.3 + index * 0.05, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute', top: '50%', transform: 'translate(-50%,-50%)',
            width: 6, height: 6, borderRadius: '50%', background: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Marquee strip ─────────────────────────────────────────────────────────
function TechMarquee({ skills }) {
  const doubled = [...skills, ...skills]; // seamless loop

  return (
    <div
      style={{ overflow: 'hidden', borderTop: '1px solid var(--border-faint)', borderBottom: '1px solid var(--border-faint)', padding: '1.25rem 0' }}
      aria-hidden="true"
    >
      <div className="marquee-track">
        {doubled.map((s, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '0 2.5rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: BRAND[s.name] || 'var(--orange)', display: 'inline-block', flexShrink: 0 }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Category columns ──────────────────────────────────────────────────────
function SkillColumn({ title, skills, startIndex, inView }) {
  return (
    <div>
      <p
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--orange)', marginBottom: 28, fontWeight: 500,
        }}
      >
        {title}
      </p>
      {skills.map((s, i) => (
        <SkillBar key={s.name} name={s.name} level={s.level} index={startIndex + i} inView={inView} />
      ))}
    </div>
  );
}

// ─── SKILLS SECTION ─────────────────────────────────────────────────────────
export const SkillsSection = () => {
  const { content } = useContentStore();
  const { skills: skillsData } = content || {};
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  // Build flat list from CMS categories, or use defaults
  let allSkills = DEFAULT_SKILLS;
  if (skillsData?.categories?.length) {
    allSkills = [];
    skillsData.categories.forEach(cat => {
      (cat.items || []).forEach(item => {
        allSkills.push({ name: item.name, level: item.level || 70 });
      });
    });
  }

  // Split into 2 columns
  const mid   = Math.ceil(allSkills.length / 2);
  const colA  = allSkills.slice(0, mid);
  const colB  = allSkills.slice(mid);

  return (
    <section
      id="skills"
      ref={sectionRef}
      style={{ background: 'var(--void)', paddingTop: 'clamp(5rem,10vw,9rem)', paddingBottom: 'clamp(5rem,10vw,9rem)' }}
    >
      {/* Marquee strip at top */}
      <TechMarquee skills={allSkills} />

      <div className="container-main" style={{ marginTop: 'clamp(3rem,6vw,6rem)' }}>
        {/* Eyebrow */}
        <div className="section-eyebrow">Technical Proficiency</div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-h2"
          style={{ color: 'var(--text-primary)', marginBottom: '4rem', maxWidth: 600 }}
        >
          The stack I ship<br />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>to production.</span>
        </motion.h2>

        {/* 2-column bars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,320px), 1fr))',
            gap: 'clamp(2rem,5vw,6rem)',
          }}
        >
          <SkillColumn title="Frontend + Mobile" skills={colA} startIndex={0} inView={inView} />
          <SkillColumn title="Backend + Infrastructure" skills={colB} startIndex={mid} inView={inView} />
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
