import { motion } from 'framer-motion';
import { useContentStore } from '../store/contentStore';
import { Terminal } from '../components/Terminal';
import { EASINGS } from '../animations/variants';

export const TerminalSection = () => {
  const content = useContentStore((s) => s.content) || {};
  const terminalConfig = content.terminal || {};

  const title = terminalConfig.title || 'Interactive Console';
  const subtitle = terminalConfig.subtitle || 'Use this interactive terminal to explore my skills, experience, projects, or download my resume. Type help to begin.';

  return (
    <section
      id="terminal"
      role="region"
      aria-label="Interactive Developer Terminal"
      className="bg-surface-raised dark:bg-canvas py-20 md:py-28 overflow-hidden relative border-t border-border-subtle"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASINGS.editorial }}
          className="mb-10 md:mb-12"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4">
            <span className="w-7 h-px bg-accent flex-shrink-0" />
            <span className="font-code text-[11px] tracking-[0.18em] uppercase text-accent font-medium">
              Developer CLI
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-sans font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-tight text-content-primary mb-3">
            {title}
          </h2>

          <p className="font-sans text-content-secondary max-w-2xl text-[0.95rem] leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Terminal Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASINGS.editorial }}
          className="w-full relative rounded-xl overflow-hidden shadow-2xl border border-border-default bg-[#0c0c0c]"
        >
          <Terminal isEmbedded={true} />
        </motion.div>
      </div>
    </section>
  );
};

export default TerminalSection;
