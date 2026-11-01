import { motion } from 'framer-motion';
import { useContentStore } from '../store/contentStore';
import { useTerminalModal } from '../context/TerminalContext';
import { Terminal } from '../components/Terminal';
import { EASINGS } from '../animations/variants';

export const TerminalSection = () => {
  const content = useContentStore((s) => s.content) || {};
  const terminalConfig = content.terminal || {};

  const title = terminalConfig.title || 'Interactive Console';
  const subtitle =
    terminalConfig.subtitle ||
    'Use this interactive terminal to explore my skills, experience, projects, or download my resume. Type help to begin.';

  const {
    windowState,
    openTerminal,
    restoreTerminal,
  } = useTerminalModal();

  return (
    <section
      id="terminal"
      role="region"
      aria-label="Interactive Developer Terminal"
      className="bg-surface-raised dark:bg-canvas py-2.5 sm:py-3 overflow-hidden relative border-t border-border-subtle"
      style={{ scrollMarginTop: '6.5rem' }}
    >
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Sleek single-line bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.4, ease: EASINGS.editorial }}
          className="mb-2 sm:mb-2.5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-4 h-px bg-accent flex-shrink-0" />
              <span className="font-code text-[10px] tracking-[0.16em] uppercase text-accent font-medium shrink-0">
                Developer CLI
              </span>
              <span className="text-border-default text-xs shrink-0">/</span>
              <h2 className="font-sans font-extrabold text-sm sm:text-base lg:text-lg text-content-primary truncate">
                {title}
              </h2>
            </div>
            <p className="font-sans text-content-secondary text-[11px] sm:text-xs text-right hidden sm:block truncate max-w-md">
              {subtitle}
            </p>
          </div>
        </motion.div>

        {/* Dynamic Presentation Based on Window State */}
        <div className="w-full relative">
          {/* 1. Normal State: Embedded Terminal Window */}
          {windowState === 'normal' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full relative rounded-xl overflow-hidden shadow-2xl border border-border-default bg-[#0c0c0c]"
            >
              <Terminal isMaximized={false} />
            </motion.div>
          )}

          {/* 2. Maximized State: Section Placeholder Frame (Layout Stability) */}
          {windowState === 'maximized' && (
            <div className="w-full h-[280px] sm:h-[340px] rounded-xl border border-dashed border-[#2a2a2a] bg-[#0c0c0c]/60 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#569cd6] mb-3 shadow-md">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <p className="font-mono text-sm text-[#ccc] mb-1 font-semibold">
                Terminal is currently expanded to Full Screen
              </p>
              <p className="font-mono text-xs text-[#777] mb-5 max-w-sm leading-relaxed">
                Use the restore control (❐) in the upper right or click below to bring the terminal window back into this section.
              </p>
              <button
                type="button"
                onClick={restoreTerminal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-[#569cd6] text-white font-mono text-xs rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                <span>❐</span>
                <span>Restore to Page Section</span>
              </button>
            </div>
          )}

          {/* 3. Minimized State: Section Placeholder Frame */}
          {windowState === 'minimized' && (
            <div className="w-full h-[220px] sm:h-[260px] rounded-xl border border-dashed border-[#2a2a2a] bg-[#0c0c0c]/40 flex flex-col items-center justify-center p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-emerald-400 mb-2.5 shadow-md">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="font-mono text-sm text-[#ccc] mb-1 font-semibold">
                Terminal is minimized to bottom-right dock
              </p>
              <p className="font-mono text-xs text-[#777] mb-4 max-w-sm leading-relaxed">
                Click the floating card in the corner of your screen or click below to restore it here.
              </p>
              <button
                type="button"
                onClick={restoreTerminal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-[#569cd6] text-white font-mono text-xs rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                <span>&gt;_</span>
                <span>Restore Terminal Here</span>
              </button>
            </div>
          )}

          {/* 4. Closed State: Terminal Invitation Card */}
          {windowState === 'closed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: EASINGS.editorial }}
              className="w-full rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#141414] to-[#0c0c0c] shadow-[0_16px_48px_rgba(0,0,0,0.5)] p-6 sm:p-10 text-center flex flex-col items-center justify-center relative overflow-hidden group"
            >
              {/* Subtle decorative background code grid */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none font-mono text-[10px] leading-3 overflow-hidden select-none p-4" aria-hidden="true">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="whitespace-nowrap">
                    {`> const system = { status: 'standby', clearance: 'authorized', mode: 'developer_cli' };`}
                  </div>
                ))}
              </div>

              {/* Terminal Icon Badge */}
              <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#569cd6] mb-5 shadow-lg group-hover:border-[#569cd6] transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="font-sans font-extrabold text-2xl sm:text-3xl text-white mb-3">
                Explore My Developer Terminal
              </h3>

              {/* Description */}
              <p className="font-sans text-gray-400 max-w-xl text-sm sm:text-base leading-relaxed mb-8">
                Discover my skills, projects, experience, and background through interactive terminal commands.
              </p>

              {/* Action Button */}
              <button
                type="button"
                onClick={openTerminal}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#569cd6] hover:bg-[#488bc2] text-white font-mono text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                aria-label="Open Developer Terminal"
              >
                <span className="font-bold">&gt;_</span>
                <span>Open Developer Terminal</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TerminalSection;
