import { forwardRef } from 'react';
import TerminalLine from './TerminalLine';
import TerminalPrompt from './TerminalPrompt';

const TerminalViewport = forwardRef(
  (
    {
      lines,
      input,
      onInputChange,
      onSubmit,
      onNavigateHistory,
      onAutocomplete,
      onInterrupt,
      inputRef,
      promptPrefix,
    },
    viewportRef
  ) => {
    const handleClick = (e) => {
      if (e.target.closest('input') || e.target.closest('button') || e.target.closest('a')) return;
      const sel = window.getSelection()?.toString();
      if (sel) return;
      inputRef.current?.focus();
    };

    return (
      <div
        ref={viewportRef}
        onClick={handleClick}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-3 font-mono text-[13px] leading-[1.5rem] scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent select-text cursor-text"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="min-h-full flex flex-col justify-start">
          <div className="space-y-1">
            {lines.map((line) => (
              <TerminalLine
                key={line.id}
                line={line}
                promptPrefix={promptPrefix}
              />
            ))}
          </div>
          <div className="pt-2 pb-1">
            <TerminalPrompt
              ref={inputRef}
              value={input}
              onChange={onInputChange}
              onSubmit={onSubmit}
              onNavigateHistory={onNavigateHistory}
              onAutocomplete={onAutocomplete}
              onInterrupt={onInterrupt}
              promptPrefix={promptPrefix}
            />
          </div>
        </div>
      </div>
    );
  }
);

TerminalViewport.displayName = 'TerminalViewport';

export default TerminalViewport;
