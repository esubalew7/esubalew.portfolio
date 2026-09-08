/* Minimal skeleton loaders that match the new design system.
   Each renders a dark void-colored placeholder with subtle pulse lines. */

const Bar = ({ w = '100%', h = 16, mb = 0 }) => (
  <div
    style={{
      width: w, height: h, borderRadius: 2,
      background: 'var(--border-faint)',
      marginBottom: mb,
      animation: 'skPulse 1.6s ease-in-out infinite',
    }}
  />
);

export const HeroSkeleton = () => (
  <section style={{ minHeight: '100svh', background: 'var(--void)', display: 'flex', alignItems: 'center', padding: 'clamp(2rem,6vw,6rem)' }}>
    <div style={{ maxWidth: 760 }}>
      <Bar w={120} h={12} mb={32} />
      <Bar w="70%" h={72} mb={16} />
      <Bar w="50%" h={72} mb={32} />
      <Bar w="85%" h={18} mb={10} />
      <Bar w="70%" h={18} mb={40} />
      <div style={{ display: 'flex', gap: 16 }}>
        <Bar w={160} h={48} />
        <Bar w={140} h={48} />
      </div>
    </div>
    <style>{`@keyframes skPulse { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
  </section>
);

export const AboutSkeleton = () => (
  <section style={{ background: 'var(--ink)', padding: 'clamp(4rem,8vw,8rem) clamp(1.25rem,4vw,4rem)' }}>
    <Bar w={60} h={10} mb={48} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '3rem' }}>
      <div>
        <Bar w="100%" h={400} mb={0} />
      </div>
      <div>
        <Bar w="60%" h={36} mb={24} />
        <Bar w="100%" h={14} mb={12} />
        <Bar w="90%" h={14} mb={12} />
        <Bar w="80%" h={14} mb={32} />
        <Bar w="100%" h={14} mb={12} />
        <Bar w="75%" h={14} mb={0} />
      </div>
    </div>
    <style>{`@keyframes skPulse { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
  </section>
);

export const SkillsSkeleton = () => (
  <section style={{ background: 'var(--void)', padding: 'clamp(4rem,8vw,8rem) clamp(1.25rem,4vw,4rem)' }}>
    <Bar w={60} h={10} mb={48} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '3rem' }}>
      {[...Array(8)].map((_, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Bar w={100} h={14} />
            <Bar w={32} h={14} />
          </div>
          <Bar w="100%" h={2} mb={28} />
        </div>
      ))}
    </div>
    <style>{`@keyframes skPulse { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
  </section>
);

export const ExperienceSkeleton = () => (
  <section style={{ background: 'var(--void)', padding: 'clamp(4rem,8vw,8rem) clamp(1.25rem,4vw,4rem)' }}>
    <Bar w={60} h={10} mb={48} />
    {[...Array(3)].map((_, i) => (
      <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1px 1fr', gap: '0 2.5rem', marginBottom: 48 }}>
        <div style={{ textAlign: 'right' }}><Bar w={60} h={12} /></div>
        <div />
        <div>
          <Bar w="50%" h={24} mb={12} />
          <Bar w="30%" h={12} mb={20} />
          <Bar w="90%" h={14} mb={8} />
          <Bar w="80%" h={14} mb={0} />
        </div>
      </div>
    ))}
    <style>{`@keyframes skPulse { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
  </section>
);

export const ContactSkeleton = () => (
  <section style={{ background: 'var(--ink)', padding: 'clamp(4rem,8vw,8rem) clamp(1.25rem,4vw,4rem)' }}>
    <Bar w={60} h={10} mb={48} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '4rem' }}>
      <div>
        <Bar w="60%" h={36} mb={24} />
        <Bar w="80%" h={14} mb={12} />
        <Bar w="70%" h={14} mb={0} />
      </div>
      <div>
        <Bar w="100%" h={1} mb={40} />
        <Bar w="100%" h={1} mb={40} />
        <Bar w="100%" h={1} mb={40} />
        <Bar w={160} h={48} mb={0} />
      </div>
    </div>
    <style>{`@keyframes skPulse { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
  </section>
);
