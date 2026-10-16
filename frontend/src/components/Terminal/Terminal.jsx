import { useEffect } from 'react';
import { motion } from 'framer-motion';
import TerminalViewport from './TerminalViewport';
import { useTerminalModal } from '../../context/TerminalContext';

export const Terminal = ({
  className = '',
  isMaximized: propIsMaximized,
}) => {
  const {
    lines,
    input,
    setInput,
    executeCommand,
    navigateHistory,
    autocomplete,
    handleInterrupt,
    viewportRef,
    inputRef,
    commandCount,
    promptPrefix,
    terminalTitle,
    windowState,
    maximizeTerminal,
    restoreTerminal,
    minimizeTerminal,
    closeTerminal,
  } = useTerminalModal();

  const isMaximized = propIsMaximized !== undefined ? propIsMaximized : windowState === 'maximized';

  // Automatically focus command prompt on mount and when maximized state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef?.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [isMaximized, inputRef]);

  // Sizing and container styles
  const containerClasses = isMaximized
    ? 'w-full h-full'
    : 'w-full h-[min(480px,calc(100vh-4rem))]';

  const windowCardClasses = isMaximized
    ? 'h-full w-full flex flex-col rounded-none overflow-hidden border-0 bg-[#0c0c0c] shadow-2xl'
    : 'h-full w-full flex flex-col rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#0c0c0c] shadow-[0_12px_48px_rgba(0,0,0,0.6)]';

  return (
    <>
      <style>{`
        @keyframes dotPulse {
          0%, 20% { opacity: 0.3; }
          40% { opacity: 1; }
          60%, 100% { opacity: 0.3; }
        }
        .processing-dots {
          animation: dotPulse 1.2s ease-in-out infinite;
        }
      `}</style>

      <div className={`relative ${containerClasses} ${className} transition-[height,width] duration-250`}>
        <div className={windowCardClasses}>
          {/* Windows / VSCode-style Header */}
          <header className="h-8 shrink-0 flex items-center justify-between bg-[#1a1a1a] border-b border-[#2a2a2a] px-3 select-none">
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-3.5 h-3.5 text-[#569cd6] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 8h2v2H7V8zm4 0h6v2h-6V8zm-4 4h2v2H7v-2zm4 0h6v2h-6v-2z" />
              </svg>
              <span className="text-[11px] text-[#b0b0b0] font-mono truncate font-medium">
                {terminalTitle || 'Command Prompt'}
              </span>
            </div>

            <div className="hidden sm:block text-center flex-1 px-2">
              <span className="text-[10px] text-[#666] font-mono select-none">
                {commandCount > 0 ? `${commandCount} cmd history` : 'Interactive Shell'}
              </span>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Minimize Button */}
              <button
                type="button"
                onClick={minimizeTerminal}
                className="w-[28px] h-[22px] flex items-center justify-center rounded-sm hover:bg-[#333] text-[#888] hover:text-[#eee] transition-colors"
                aria-label="Minimize terminal"
                title="Minimize terminal"
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 1" fill="currentColor">
                  <rect width="10" height="1.5" />
                </svg>
              </button>

              {/* Maximize / Restore Button */}
              <button
                type="button"
                onClick={isMaximized ? restoreTerminal : maximizeTerminal}
                className="w-[28px] h-[22px] flex items-center justify-center rounded-sm hover:bg-[#333] text-[#888] hover:text-[#eee] transition-colors"
                aria-label={isMaximized ? 'Restore terminal size' : 'Maximize terminal'}
                title={isMaximized ? 'Restore to original position' : 'Maximize terminal (full screen)'}
              >
                {isMaximized ? (
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

              {/* Close Button */}
              <button
                type="button"
                onClick={closeTerminal}
                className="w-[28px] h-[22px] flex items-center justify-center rounded-sm hover:bg-[#e81123] hover:text-white text-[#888] transition-colors"
                aria-label="Close terminal"
                title="Close terminal"
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M1 1L9 9M9 1L1 9" />
                </svg>
              </button>
            </div>
          </header>

          {/* Viewport */}
          <TerminalViewport
            ref={viewportRef}
            lines={lines}
            input={input}
            onInputChange={setInput}
            onSubmit={executeCommand}
            onNavigateHistory={navigateHistory}
            onAutocomplete={autocomplete}
            onInterrupt={handleInterrupt}
            inputRef={inputRef}
            promptPrefix={promptPrefix}
          />
        </div>
      </div>
    </>
  );
};

export default Terminal;
