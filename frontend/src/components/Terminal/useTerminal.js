import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import CommandParser from './commandParser';
import { buildCommandRegistry } from './commandRegistry';
import { createLineId } from './terminalConstants';

export function useTerminal({ content = {}, projects = [] } = {}) {
  const terminalConfig = content.terminal || {};
  const configuredWelcome = (terminalConfig.welcomeMessage || '').trim();
  const defaultWelcome = `╔══════════════════════════════════════════════════════════════════╗
║           WELCOME TO ESUBALEW'S DEVELOPER TERMINAL           ║
╚══════════════════════════════════════════════════════════════════╝

Welcome! This interactive terminal allows you to explore my engineering
background, production projects, and distributed system stack.

Getting Started:
   • Type 'help' to view the complete list of available commands.
   • Use Arrow Keys ↑ / ↓ to navigate command history.
   • Press Tab to autocomplete commands.

Quick Navigation:
   • about          → Overview, background, and competencies
   • skills         → Technical stack and production arsenal
   • projects       → Production applications and repositories
   • experience     → Work history and engineering roles
   • contact        → Direct communication channels

Type 'help' and press Enter to begin exploring.`;

  const welcomeMessage = configuredWelcome || defaultWelcome;

  const registry = useMemo(() => {
    return buildCommandRegistry({ content, projects });
  }, [content, projects]);

  const parserRef = useRef(new CommandParser(registry));

  useEffect(() => {
    parserRef.current.updateRegistry(registry);
  }, [registry]);

  const viewportRef = useRef(null);
  const processTimeoutRef = useRef(null);
  const processingLineIdRef = useRef(null);

  const [lines, setLines] = useState([
    { id: createLineId(), type: 'welcome', content: welcomeMessage },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(null);
  const [savedInput, setSavedInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-scroll on lines update
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  const appendLine = useCallback((line) => {
    setLines((prev) => [...prev, { id: createLineId(), ...line }]);
  }, []);

  const handleSideEffect = useCallback((result) => {
    if (result.type === 'link' && result.url) {
      window.open(result.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (result.type === 'download' && result.fileUrl) {
      const link = document.createElement('a');
      link.href = result.fileUrl;
      link.download = result.fileName || 'Esubalew_Molla_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  const cancelProcessing = useCallback(() => {
    if (processTimeoutRef.current) {
      clearTimeout(processTimeoutRef.current);
      processTimeoutRef.current = null;
    }
    if (processingLineIdRef.current) {
      setLines((prev) => prev.filter((l) => l.id !== processingLineIdRef.current));
      processingLineIdRef.current = null;
    }
    setIsProcessing(false);
  }, []);

  const handleInterrupt = useCallback(() => {
    if (!isProcessing) {
      appendLine({ type: 'interrupt', content: '^C' });
      setInput('');
      setHistoryIndex(null);
      return;
    }

    cancelProcessing();
    appendLine({ type: 'interrupt', content: '^C' });
    appendLine({ type: 'abort', content: 'Command terminated.' });
    setInput('');
    setHistoryIndex(null);
  }, [isProcessing, cancelProcessing, appendLine]);

  const executeCommand = useCallback(
    (rawCommand) => {
      const command = (rawCommand || '').trim();
      if (!command) return;

      cancelProcessing();

      appendLine({ type: 'command', content: command });
      setCommandHistory((prev) => {
        const next = [...prev, command];
        return next.length > 100 ? next.slice(next.length - 100) : next;
      });

      const parsed = parserRef.current.parse(command);

      if (!parsed.valid) {
        appendLine({ type: 'error', content: parsed.error });
        setInput('');
        setHistoryIndex(null);
        setSavedInput('');
        return;
      }

      const result = parserRef.current.execute(parsed);

      if (result.type === 'clear') {
        setLines([]);
        setInput('');
        setHistoryIndex(null);
        setSavedInput('');
        return;
      }

      if (result.type === 'error') {
        appendLine({ type: 'error', content: result.output });
        setInput('');
        setHistoryIndex(null);
        setSavedInput('');
        return;
      }

      const processTime = result.processTime || 0;

      if (processTime > 0) {
        const pid = createLineId();
        processingLineIdRef.current = pid;
        setIsProcessing(true);
        setLines((prev) => [...prev, { id: pid, type: 'processing' }]);

        processTimeoutRef.current = setTimeout(() => {
          processTimeoutRef.current = null;
          processingLineIdRef.current = null;
          setIsProcessing(false);

          setLines((prev) => {
            const filtered = prev.filter((l) => l.id !== pid);
            return [
              ...filtered,
              { id: createLineId(), type: 'output', content: result.output },
            ];
          });

          handleSideEffect(result);
        }, processTime);
      } else {
        appendLine({ type: 'output', content: result.output });
        handleSideEffect(result);
      }

      setInput('');
      setHistoryIndex(null);
      setSavedInput('');
    },
    [appendLine, handleSideEffect, cancelProcessing]
  );

  const clearTerminal = useCallback(() => {
    cancelProcessing();
    setLines([
      {
        id: createLineId(),
        type: 'output',
        content: "Terminal cleared. Type 'help' to see available commands.",
      },
    ]);
    setInput('');
    setHistoryIndex(null);
  }, [cancelProcessing]);

  const navigateHistory = useCallback(
    (direction) => {
      if (commandHistory.length === 0) return;

      if (historyIndex === null && direction === 1) return;

      let nextIndex;
      if (historyIndex === null) {
        setSavedInput(input);
        nextIndex = commandHistory.length - 1;
      } else {
        nextIndex = historyIndex + direction;
      }

      if (nextIndex < 0) {
        nextIndex = 0;
      } else if (nextIndex >= commandHistory.length) {
        setHistoryIndex(null);
        setInput(savedInput);
        return;
      }

      setHistoryIndex(nextIndex);
      setInput(commandHistory[nextIndex]);
    },
    [commandHistory, historyIndex, input, savedInput]
  );

  const autocomplete = useCallback(() => {
    const trimmed = input.toLowerCase().trim();
    if (!trimmed) return;

    const available = parserRef.current.getCommandList();
    const matches = available.filter((cmd) => cmd.startsWith(trimmed));
    if (matches.length === 1) {
      setInput(matches[0]);
    } else if (matches.length > 1) {
      const currentIndex = matches.indexOf(input.toLowerCase().trim());
      const nextIndex = (currentIndex + 1) % matches.length;
      setInput(matches[nextIndex]);
    }
  }, [input]);

  return {
    lines,
    input,
    setInput,
    executeCommand,
    clearTerminal,
    navigateHistory,
    autocomplete,
    handleInterrupt,
    viewportRef,
    commandCount: commandHistory.length,
    promptPrefix: terminalConfig.promptPrefix || 'E C:\\esubalew\\portfolio>',
  };
}
