import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Terminal from './Terminal';
import { useTerminalModal } from '../../context/TerminalContext';

export const TerminalModal = () => {
  const {
    windowState,
    preMinimizedState,
    restoreTerminal,
    closeTerminal,
    terminalTitle,
  } = useTerminalModal();

  // If normal or closed, the portal renders nothing
  if (typeof document === 'undefined') return null;

  return (
    <>
      {/* 1. Full-Screen Maximized Overlay (rendered via Portal) */}
      {windowState === 'maximized' &&
        createPortal(
          <div
            className="fixed inset-0 z-[2000] w-screen h-screen m-0 p-0 bg-[#0c0c0c] overflow-hidden select-none"
            style={{ width: '100vw', height: '100vh', height: '100dvh' }}
            role="dialog"
            aria-modal="true"
            aria-label="Developer Terminal Full Screen"
          >
            <Terminal isMaximized={true} />
          </div>,
          document.body
        )}

      {/* 2. Minimized Floating Terminal Card (rendered via Portal) */}
      {windowState === 'minimized' &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              onClick={restoreTerminal}
              className="fixed bottom-5 right-5 z-[2050] flex items-center gap-3 px-4 py-2.5 bg-[#141414]/95 hover:bg-[#1a1a1a] border border-[#333] hover:border-[#569cd6] text-white rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-md cursor-pointer transition-all select-none group"
              role="button"
              aria-label={`Restore Terminal (${preMinimizedState === 'maximized' ? 'Full Screen' : 'Embedded Section'})`}
              title={`Click to restore ${terminalTitle} to ${preMinimizedState === 'maximized' ? 'full screen' : 'original position'}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-2 font-mono text-xs text-gray-200">
                <span className="text-[#569cd6] font-bold">&gt;_</span>
                <span className="font-semibold">{terminalTitle || 'Developer Terminal'}</span>
                <span className="text-[10px] text-[#777] font-normal hidden sm:inline">(minimized)</span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    restoreTerminal();
                  }}
                  className="w-6 h-6 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
                  aria-label="Restore terminal"
                  title={`Restore to ${preMinimizedState === 'maximized' ? 'full screen' : 'embedded section'}`}
                >
                  {preMinimizedState === 'maximized' ? (
                    <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M2.5 2.5V0.5H9.5V7.5H7.5" />
                      <rect x="0.5" y="2.5" width="7" height="7" />
                    </svg>
                  ) : (
                    <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="0.5" y="0.5" width="9" height="9" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTerminal();
                  }}
                  className="w-6 h-6 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#e81123] rounded transition-colors"
                  aria-label="Close terminal"
                  title="Close terminal"
                >
                  <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1 1L9 9M9 1L1 9" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default TerminalModal;
