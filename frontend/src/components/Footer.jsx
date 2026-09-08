import { useContentStore } from '../store/contentStore';
import { SocialIconRow } from './SocialLinks';

export const Footer = () => {
  const content     = useContentStore(s => s.content);
  const footer      = content?.footer  || {};
  const hero        = content?.hero    || {};
  const socialLinks = content?.socialLinks || footer.socials || [];
  const name        = hero.name?.split(' ')[0] || 'Esubalew';

  return (
    <footer
      style={{
        background: 'var(--void)',
        borderTop: '1px solid var(--border-faint)',
        padding: '2.5rem 0',
      }}
    >
      <div
        className="container-main"
        style={{
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Left — wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 24, height: 24, background: 'var(--orange)', borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 800, color: '#fff',
            }}
          >
            {name[0]}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            {name} · {new Date().getFullYear()}
          </span>
        </div>

        {/* Center — social icons */}
        <SocialIconRow links={socialLinks} className="gap-5" />

        {/* Right — built-with */}
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Built with React + Three.js
        </p>
      </div>
    </footer>
  );
};

export default Footer;
