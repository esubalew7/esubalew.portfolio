import React, { Suspense } from 'react';
import { useContentStore } from '../store/contentStore';
import { HeroSection } from '../sections/HeroSection';

// All non-hero sections are lazy-loaded for optimal bundle splitting
const AboutSection = React.lazy(() =>
  import('../sections/AboutSection').then(m => ({ default: m.AboutSection || m.default }))
);
const SkillsSection = React.lazy(() =>
  import('../sections/SkillsSection').then(m => ({ default: m.SkillsSection || m.default }))
);
const ProjectsSection = React.lazy(() =>
  import('../sections/ProjectsSection').then(m => ({ default: m.ProjectsSection || m.default }))
);
const TestimonialsSection = React.lazy(() =>
  import('../sections/TestimonialsSection').then(m => ({ default: m.TestimonialsSection || m.default }))
);
const ExperienceSection = React.lazy(() =>
  import('../sections/ExperienceSection').then(m => ({ default: m.default || m.ExperienceSection }))
);
const ContactSection = React.lazy(() =>
  import('../sections/ContactSection').then(m => ({ default: m.ContactSection || m.default }))
);

// Minimal inline fallback — matches void background, no CLS
const SectionFallback = () => (
  <div
    style={{
      minHeight: '40vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--void)',
    }}
    aria-hidden="true"
  >
    <div
      style={{
        width: 24, height: 24, borderRadius: '50%',
        border: '2px solid var(--border-subtle)',
        borderTopColor: 'var(--orange)',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const lazy = (Component) => (
  <Suspense fallback={<SectionFallback />}>
    <Component />
  </Suspense>
);

export const Home = () => {
  const sections = useContentStore(s => s.content?.sections || {});

  return (
    <div style={{ position: 'relative' }}>
      {/* Hero — always present, full-bleed behind navbar */}
      {sections.hero !== false && <HeroSection />}

      {/* Content sections — conditional via CMS toggles */}
      {sections.about        !== false && lazy(AboutSection)}
      {sections.skills       !== false && lazy(SkillsSection)}
      {sections.projects     !== false && lazy(ProjectsSection)}
      {sections.testimonials !== false && lazy(TestimonialsSection)}
      {sections.experience   !== false && lazy(ExperienceSection)}
      {sections.contact      !== false && lazy(ContactSection)}
    </div>
  );
};

export default Home;
