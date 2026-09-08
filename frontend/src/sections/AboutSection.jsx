import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useContentStore } from '../store/contentStore';

// ─── Animated stat ─────────────────────────────────────────────────────────
function StatBlock({ value, suffix = '', label, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'relative', paddingBottom: 24 }}
    >
      {/* Rule above */}
      <div style={{ width: '100%', height: 1, background: 'var(--border-faint)', marginBottom: 20 }} />

      <div
        className="font-display"
        style={{ fontSize: 'clamp(2.5rem,4vw,3.5rem)', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}
      >
        <span style={{ color: 'var(--orange)' }}>{inView ? value : 0}</span>
        <span style={{ fontSize: '0.55em', color: 'var(--text-secondary)', marginLeft: 3 }}>{suffix}</span>
      </div>
      <p style={{ marginTop: 8, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
        {label}
      </p>
    </motion.div>
  );
}

// ─── Trait pill ────────────────────────────────────────────────────────────
function TraitPill({ text }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '5px 14px',
        borderRadius: 3,
        border: '1px solid var(--border-subtle)',
        fontSize: 12,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
        fontFamily: 'JetBrains Mono, monospace',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      {text}
    </span>
  );
}

// ─── ABOUT SECTION ─────────────────────────────────────────────────────────
export const AboutSection = () => {
  const { content } = useContentStore();
  const { about } = content || {};
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });

  const stats = about?.stats?.length ? about.stats : [
    { value: 3,  suffix: '+', label: 'Years of production code' },
    { value: 15, suffix: '+', label: 'Full-stack systems shipped' },
    { value: 3,  suffix: '',  label: 'Live production stacks' },
  ];

  const traits = ['MERN Stack', 'Microservices', 'WebSocket', 'REST + GraphQL', 'System Design', 'DevOps'];

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{ background: 'var(--ink)', paddingTop: 'clamp(5rem,10vw,9rem)', paddingBottom: 'clamp(5rem,10vw,9rem)' }}
    >
      <div className="container-main">
        {/* Eyebrow */}
        <div className="section-eyebrow">About</div>

        {/* ── Asymmetric 2-column ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,420px),1fr))',
            gap: 'clamp(3rem,6vw,8rem)',
            alignItems: 'start',
          }}
        >
          {/* LEFT — large editorial heading + image */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-h1"
              style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}
            >
              Building<br />
              <em style={{ fontStyle: 'normal', color: 'var(--orange)' }}>systems</em>,<br />
              not just apps.
            </motion.h2>

            {/* Portrait — angled frame, no round shape */}
            {(about?.image || true) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', maxWidth: 400 }}
              >
                {/* Orange corner accent — top-left */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute', top: -12, left: -12, width: 48, height: 48,
                    borderTop: '2px solid var(--orange)', borderLeft: '2px solid var(--orange)',
                    zIndex: 2,
                  }}
                />
                {/* Orange corner — bottom-right */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute', bottom: -12, right: -12, width: 48, height: 48,
                    borderBottom: '2px solid var(--orange)', borderRight: '2px solid var(--orange)',
                    zIndex: 2,
                  }}
                />
                <img
                  src={about?.image || '/images/esu.png'}
                  alt="Esubalew Molla"
                  style={{
                    display: 'block', width: '100%',
                    aspectRatio: '4/5', objectFit: 'cover',
                    filter: 'grayscale(20%) contrast(1.05)',
                    borderRadius: 2,
                  }}
                  loading="lazy"
                />
              </motion.div>
            )}
          </div>

          {/* RIGHT — body text + stats + traits */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-body-lg"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}
            >
              {about?.description ||
                `I'm Esubalew — a full-stack engineer based in Ethiopia, currently interning at Askuala Link. 
                I architect and ship distributed systems that handle real-world production loads: 
                from JWT + TOTP 2FA backends to live WebSocket-synced admin dashboards.`}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-body-lg"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2.5rem' }}
            >
              My approach is architecture-first: I think in event flows, caching layers, 
              and separation of concerns before writing the first line of code. 
              The result is software that scales — and doesn't break at 3 AM.
            </motion.p>

            {/* Trait tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.35, duration: 0.7 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '3rem' }}
            >
              {traits.map(t => <TraitPill key={t} text={t} />)}
            </motion.div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0 2rem' }}>
              {stats.map((s, i) => (
                <StatBlock key={i} index={i} value={s.value} suffix={s.suffix} label={s.label} />
              ))}
            </div>

            {/* CTA */}
            <motion.a
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.6 }}
              href="#contact"
              className="link-underline"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                marginTop: '2.5rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--orange)', textDecoration: 'none',
              }}
            >
              Start a conversation
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
