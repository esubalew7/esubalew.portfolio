import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useContentStore } from '../store/contentStore';

// ─── BRAND color map (exact spec) ──────────────────────────────────────────
const BRAND = {
  JavaScript: '#F7DF1E',
  React: '#61DAFB',
  TypeScript: '#3178C6',
  'Node.js': '#3C873A',
  Express: '#888888',
  NestJS: '#E0234E',
  MongoDB: '#47A248',
  PostgreSQL: '#336791',
  Python: '#3572A5',
  Flutter: '#02569B',
  Tailwind: '#38BDF8',
  Docker: '#2496ED',
  Postman: '#FF6C37',
  Git: '#F05032',
  Swagger: '#85EA2D',
  'Next.js': '#FFFFFF',
};

// ─── Fallback skills dataset ───────────────────────────────────────────────
const DEFAULT_SKILLS = [
  { name: 'JavaScript', level: 93 },
  { name: 'React', level: 90 },
  { name: 'TypeScript', level: 80 },
  { name: 'Node.js', level: 88 },
  { name: 'Express', level: 87 },
  { name: 'NestJS', level: 70 },
  { name: 'MongoDB', level: 85 },
  { name: 'PostgreSQL', level: 72 },
  { name: 'Tailwind', level: 90 },
  { name: 'Flutter', level: 70 },
  { name: 'Docker', level: 65 },
  { name: 'Python', level: 68 },
  { name: 'Postman', level: 85 },
  { name: 'Git', level: 90 },
];

// Helper: 4-tier signal bar calculation
const getFilledCount = (level) => {
  if (level >= 85) return 4;
  if (level >= 70) return 3;
  if (level >= 55) return 2;
  return 1;
};

// Helper: concise category badges
const getCategoryShortBadge = (categoryName) => {
  if (!categoryName) return 'CORE';
  const clean = categoryName.toLowerCase();
  if (clean.includes('front')) return 'FRONTEND';
  if (clean.includes('back')) return 'BACKEND';
  if (clean.includes('data') || clean.includes('db')) return 'DATABASE';
  if (clean.includes('devops') || clean.includes('infra')) return 'DEVOPS';
  if (clean.includes('tool') || clean.includes('test')) return 'TOOLING';
  if (clean.includes('mobile')) return 'MOBILE';
  return categoryName.split(' ')[0].toUpperCase();
};

// ─── Single Tech Cell ──────────────────────────────────────────────────────
function TechCell({ item, categoryName, index, inView }) {
  const [isHovered, setIsHovered] = useState(false);
  const brandColor = BRAND[item.name] || 'var(--orange, #FF4D00)';
  const level = Number(item.level) || 75;
  const filledCount = getFilledCount(level);
  const statusText = level >= 80 ? 'Used in production' : 'Learning / building';
  const categoryBadge = getCategoryShortBadge(categoryName);
  const barHeights = [8, 12, 16, 20];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: index * 0.04,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? 'var(--ink-raised, #141921)' : 'var(--void, #080A0E)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '148px',
        position: 'relative',
        transition: 'background 0.25s ease, transform 0.25s ease',
        cursor: 'default',
        boxShadow: isHovered ? `inset 2px 0 0 0 ${brandColor}` : 'none',
      }}
    >
      {/* ── Hover Tooltip: Exact percentage (ONLY place number appears) ── */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          fontWeight: 600,
          color: brandColor,
          background: 'var(--ink-float, #1A2030)',
          border: `1px solid ${brandColor}40`,
          padding: '2px 6px',
          borderRadius: '3px',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(-4px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          pointerEvents: 'none',
          zIndex: 10,
          whiteSpace: 'nowrap',
        }}
      >
        {level}%
      </div>

      {/* ── ROW 1: Tech name + Category badge ── */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <h4
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '15px',
              fontWeight: 500,
              color: 'var(--text-primary, #F0F2F5)',
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            {item.name}
          </h4>

          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '9px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted, #4A5260)',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '2px 5px',
              borderRadius: '2px',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              lineHeight: 1,
              opacity: isHovered ? 0 : 1,
              transition: 'opacity 0.2s ease',
              flexShrink: 0,
            }}
          >
            {categoryBadge}
          </span>
        </div>
      </div>

      {/* ── ROW 2: Signal strength bars (4 ascending bars) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '3px',
          height: '24px',
          margin: '1rem 0 0.75rem 0',
        }}
        aria-label={`Signal strength: ${filledCount} of 4 bars`}
      >
        {barHeights.map((h, bIdx) => {
          const isFilled = bIdx < filledCount;
          const barColor = isFilled
            ? brandColor
            : 'var(--border-subtle, rgba(255, 255, 255, 0.08))';

          return (
            <div
              key={bIdx}
              style={{
                width: '4px',
                height: `${h}px`,
                backgroundColor: barColor,
                borderRadius: '1px',
                transformOrigin: 'bottom',
                transform: inView ? 'scaleY(1)' : 'scaleY(0)',
                transition: `transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${bIdx * 0.06}s, background-color 0.25s ease, filter 0.25s ease`,
                filter: isHovered && isFilled ? 'brightness(1.25)' : 'none',
              }}
            />
          );
        })}
      </div>

      {/* ── ROW 3: Production usage state ── */}
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          color: 'var(--text-muted, #4A5260)',
          letterSpacing: '0.04em',
          lineHeight: 1.3,
        }}
      >
        {statusText}
      </div>
    </motion.div>
  );
}

// ─── SKILLS SECTION ─────────────────────────────────────────────────────────
export const SkillsSection = () => {
  const { content } = useContentStore();
  const { skills: skillsData } = content || {};
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  // Resolve categories from CMS, or wrap fallback flat array into one "Core Skills" group
  const rawCategories = Array.isArray(skillsData?.categories) && skillsData.categories.length > 0
    ? skillsData.categories
    : [{ name: 'Core Skills', items: DEFAULT_SKILLS }];

  // Clean empty categories if any
  const categories = rawCategories
    .map((cat) => ({
      ...cat,
      items: Array.isArray(cat.items) ? cat.items : [],
    }))
    .filter((cat) => cat.items.length > 0);

  let globalIndexCounter = 0;

  return (
    <section
      id="skills"
      ref={sectionRef}
      style={{
        background: 'var(--void, #080A0E)',
        paddingTop: 'clamp(5rem, 9vw, 8.5rem)',
        paddingBottom: 'clamp(5rem, 9vw, 8.5rem)',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid var(--border-faint, rgba(255, 255, 255, 0.04))',
      }}
    >
      <div className="container-main">
        {/* Eyebrow */}
        <div className="section-eyebrow">Technical Arsenal</div>

        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-h2"
          style={{
            color: 'var(--text-primary, #F0F2F5)',
            marginBottom: 'clamp(3rem, 5vw, 4.5rem)',
            maxWidth: 620,
            lineHeight: 1.08,
          }}
        >
          The stack I ship<br />
          <span style={{ color: 'var(--text-secondary, #8B939E)' }}>
            to production.
          </span>
        </motion.h2>

        {/* ── Category Groups with 1px Gap Signal Grid ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2.5rem, 4.5vw, 3.5rem)' }}>
          {categories.map((category) => (
            <div key={category.name}>
              {/* Category label */}
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--orange, #FF4D00)',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ opacity: 0.5 }}>//</span>
                <span>{category.name}</span>
              </div>

              {/* 1px subtle grid line container */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '1px',
                  backgroundColor: 'var(--border-faint, rgba(255, 255, 255, 0.05))',
                  border: '1px solid var(--border-faint, rgba(255, 255, 255, 0.05))',
                  overflow: 'hidden',
                  borderRadius: '4px',
                }}
              >
                {category.items.map((item) => {
                  const currentIndex = globalIndexCounter++;
                  return (
                    <TechCell
                      key={item.name}
                      item={item}
                      categoryName={category.name}
                      index={currentIndex}
                      inView={inView}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── BOTTOM STRIP: Full-width horizontal dark bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: 'clamp(3rem, 5vw, 4.5rem)',
            background: 'var(--ink, #0D1117)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '4px',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'var(--orange, #FF4D00)',
              flexShrink: 0,
            }}
          />
          <p
            style={{
              margin: 0,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              color: 'var(--text-muted, #4A5260)',
              letterSpacing: '0.04em',
              lineHeight: 1.6,
            }}
          >
            Every skill above has been used in at least one production deployment.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsSection;
