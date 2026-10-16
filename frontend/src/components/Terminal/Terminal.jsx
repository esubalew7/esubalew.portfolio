import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TerminalViewport from './TerminalViewport';
import { useTerminal } from './useTerminal';
import { useContentStore } from '../../store/contentStore';
import { useProjects } from '../../context/ProjectContext';

export const Terminal = ({
  className = '',
  isEmbedded = false,
  onClose = null,
}) => {
  const inputRef = useRef(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const content = useContentStore((s) => s.content) || {};
  const { projects } = useProjects();

  const terminalConfig = content.terminal || {};
  const terminalTitle = terminalConfig.title || 'Command Prompt';

  const {
    lines,
    input,
    setInput,
    executeCommand,
    clearTerminal,
    navigateHistory,
    autocomplete,
    handleInterrupt,
    viewportRef,
    commandCount,
    promptPrefix,
  } = useTerminal({ content, projects });

  // Focus input automatically on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleCloseOrClear = () => {
    if (onClose) {
      onClose();
    } else {
      clearTerminal();
    }
  };

  const heightClass = isMaximized
    ? 'h-[85vh] sm:h-[90vh]'
    : isEmbedded
    ? 'h-[360px] sm:h-[440px] md:h-[500px]'
    : 'h-[440px] sm:h-[540px]';

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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className={`relative w-full ${heightClass} ${className} transition-[height] duration-300`}
      >
        <div className="h-full flex flex-col rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#0c0c0c] shadow-[0_12px_48px_rgba(0,0,0,0.6)]">
          {/* Windows / VSCode-style Header */}
          <header className="h-8 shrink-0 flex items-center justify-between bg-[#1a1a1a] border-b border-[#2a2a2a] px-3 select-none">
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-3.5 h-3.5 text-[#569cd6] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 8h2v2H7V8zm4 0h6v2h-6V8zm-4 4h2v2H7v-2zm4 0h6v2h-6v-2z" />
              </svg>
              <span className="text-[11px] text-[#b0b0b0] font-mono truncate">
                {terminalTitle}
              </span>
            </div>

            <div className="hidden sm:block text-center flex-1 px-2">
              <span className="text-[10px] text-[#666] font-mono select-none">
                {commandCount > 0 ? `${commandCount} cmd history` : 'Interactive Shell'}
              </span>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                className="w-[28px] h-[22px] flex items-center justify-center rounded-sm hover:bg-[#333] text-[#888] hover:text-[#ccc] text-xs leading-none transition-colors"
                aria-label="Focus terminal input"
                title="Focus input"
              >
                _
              </button>
              <button
                type="button"
                onClick={() => setIsMaximized((prev) => !prev)}
                className="w-[28px] h-[22px] flex items-center justify-center rounded-sm hover:bg-[#333] text-[#888] hover:text-[#ccc] text-xs leading-none transition-colors"
                aria-label={isMaximized ? 'Restore terminal size' : 'Maximize terminal'}
                title={isMaximized ? 'Restore' : 'Maximize'}
              >
                {isMaximized ? '❐' : '□'}
              </button>
              <button
                type="button"
                onClick={handleCloseOrClear}
                className="w-[28px] h-[22px] flex items-center justify-center rounded-sm hover:bg-[#e81123] hover:text-white text-[#888] text-xs leading-none transition-colors"
                aria-label={onClose ? 'Close terminal' : 'Clear terminal'}
                title={onClose ? 'Close (Esc)' : 'Clear history'}
              >
                ×
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
      </motion.div>
    </>
  );
};

export default Terminal;
