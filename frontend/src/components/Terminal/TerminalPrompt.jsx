import { forwardRef, useState, useEffect } from 'react';

export function PromptPrefix({ prefix = 'E C:\\esubalew\\portfolio>' }) {
  // If prefix starts with "E " or has a drive pattern, format nicely
  if (prefix.includes('portfolio>')) {
    return (
      <span className="shrink-0 select-none font-mono text-[13px] leading-[1.4] whitespace-nowrap mr-2">
        <span className="text-[#569cd6]">E</span>
        <span className="text-[#888]"> </span>
        <span className="text-[#d4d4d4]">C:\esubalew\portfolio</span>
        <span className="text-[#569cd6]">&gt;</span>
      </span>
    );
  }

  // Standard unix style e.g. guest@portfolio:~$
  return (
    <span className="shrink-0 select-none font-mono text-[13px] leading-[1.4] whitespace-nowrap mr-2">
      <span className="text-[#4ade80]">{prefix}</span>
    </span>
  );
}

const TerminalPrompt = forwardRef(
  (
    {
      value,
      onChange,
      onSubmit,
      onNavigateHistory,
      onAutocomplete,
      onInterrupt,
      promptPrefix,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleKeyDown = (e) => {
      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onInterrupt();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit(value);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onNavigateHistory(-1);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onNavigateHistory(1);
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        onAutocomplete();
      }
    };

    return (
      <>
        <style>{`
          @keyframes terminalCursorBlink {
            0%, 49.9% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
          .terminal-cursor-active {
            background-color: #569cd6;
            box-shadow: 0 0 6px rgba(86, 156, 214, 0.45);
            animation: terminalCursorBlink 1.06s steps(1) infinite;
          }
          .terminal-cursor-inactive {
            background-color: #52525b;
            border: 1px solid #71717a;
            opacity: 0.85;
            animation: none;
          }
          @media (prefers-reduced-motion: reduce) {
            .terminal-cursor-active {
              animation: none !important;
              opacity: 1 !important;
            }
          }
        `}</style>

        <div
          className="flex items-stretch pt-0.5 cursor-text"
          onClick={() => {
            if (ref && 'current' in ref && ref.current) {
              ref.current.focus({ preventScroll: true });
            }
          }}
        >
          <PromptPrefix prefix={promptPrefix} />
          <div className="relative flex-1 min-w-0">
            <input
              ref={ref}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              aria-label="Terminal command input"
              className="w-full bg-transparent text-transparent outline-none border-none p-0 m-0 font-mono text-[13px] leading-[1.4] caret-transparent selection:bg-[#264f78]"
            />
            <span
              className="absolute inset-0 pointer-events-none font-mono text-[13px] leading-[1.4] text-[#d4d4d4] whitespace-pre"
              aria-hidden="true"
            >
              {value}
              <span
                className={`inline-block w-[7.5px] h-[14.5px] align-[-2px] ml-px transition-colors duration-150 ${
                  isFocused ? 'terminal-cursor-active' : 'terminal-cursor-inactive'
                }`}
                title={isFocused ? 'Terminal input active' : 'Click or press Tab to type in terminal'}
              />
            </span>
          </div>
        </div>
      </>
    );
  }
);

TerminalPrompt.displayName = 'TerminalPrompt';

export default TerminalPrompt;
