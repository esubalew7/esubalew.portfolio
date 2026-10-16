import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useContentStore } from '../store/contentStore';
import { useProjects } from './ProjectContext';
import { useTerminal } from '../components/Terminal/useTerminal';
import TerminalModal from '../components/Terminal/TerminalModal';

const TerminalContext = createContext(null);

export function TerminalProvider({ children }) {
  // Window states: 'normal' | 'maximized' | 'minimized' | 'closed'
  const [windowState, setWindowState] = useState('normal');
  const [preMinimizedState, setPreMinimizedState] = useState('normal'); // 'normal' | 'maximized'

  const content = useContentStore((s) => s.content) || {};
  const { projects } = useProjects();
  const terminalConfig = content.terminal || {};

  const isEnabled = terminalConfig.enabled !== false;
  const shortcutKey = terminalConfig.shortcut || 'Ctrl+`';
  const terminalTitle = terminalConfig.title || 'Command Prompt';

  // Shared single terminal session
  const terminalSession = useTerminal({ content, projects });
  const inputRef = useRef(null);

  const focusTerminalInput = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, []);

  const scrollToTerminal = useCallback(() => {
    setTimeout(() => {
      const el = document.getElementById('terminal');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  }, []);

  // Action: Open terminal in original embedded section below About
  const openTerminal = useCallback(() => {
    if (!isEnabled) return;
    setWindowState('normal');
    scrollToTerminal();
    focusTerminalInput();
  }, [isEnabled, scrollToTerminal, focusTerminalInput]);

  // Action: Close terminal (shows invitation card in section below About)
  const closeTerminal = useCallback(() => {
    setWindowState('closed');
  }, []);

  // Action: Minimize terminal (hides active window, shows floating card at bottom-right)
  const minimizeTerminal = useCallback(() => {
    setPreMinimizedState(windowState === 'maximized' ? 'maximized' : 'normal');
    setWindowState('minimized');
  }, [windowState]);

  // Action: Restore terminal from minimized or maximized
  const restoreTerminal = useCallback(() => {
    setWindowState((current) => {
      if (current === 'maximized') {
        // From maximized, restore returns to normal embedded section
        scrollToTerminal();
        focusTerminalInput();
        return 'normal';
      }
      if (current === 'minimized') {
        // From minimized, restore returns to preMinimizedState
        const target = preMinimizedState || 'normal';
        if (target === 'normal') {
          scrollToTerminal();
        }
        focusTerminalInput();
        return target;
      }
      return 'normal';
    });
  }, [preMinimizedState, scrollToTerminal, focusTerminalInput]);

  // Action: Maximize terminal to full screen overlay
  const maximizeTerminal = useCallback(() => {
    setWindowState('maximized');
    focusTerminalInput();
  }, [focusTerminalInput]);

  // Action: Navbar button & keyboard shortcut interaction
  const toggleTerminal = useCallback(() => {
    if (!isEnabled) return;
    if (windowState === 'closed') {
      openTerminal();
      return;
    }
    if (windowState === 'minimized') {
      restoreTerminal();
      return;
    }
    if (windowState === 'normal') {
      scrollToTerminal();
      focusTerminalInput();
      return;
    }
    if (windowState === 'maximized') {
      focusTerminalInput();
      return;
    }
  }, [isEnabled, windowState, openTerminal, restoreTerminal, scrollToTerminal, focusTerminalInput]);

  // Body scroll lock effect: ONLY lock background scroll when full-screen overlay is active
  useEffect(() => {
    if (windowState === 'maximized') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [windowState]);

  // Global Keyboard Shortcut Listener
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const handleKeyDown = (e) => {
      // Escape key handler: if maximized, restore to embedded; if not, do nothing or close
      if (e.key === 'Escape') {
        if (windowState === 'maximized') {
          e.preventDefault();
          restoreTerminal();
          return;
        }
      }

      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);

      // Support 'Ctrl+`' or 'Ctrl+K' or custom configured shortcut
      const keyLower = e.key.toLowerCase();
      const isBacktick = e.key === '`' || e.code === 'Backquote';
      const isK = keyLower === 'k';

      const wantsCtrlBacktick =
        (shortcutKey.includes('`') || shortcutKey.toLowerCase().includes('backquote')) &&
        (e.ctrlKey || e.metaKey) &&
        isBacktick;

      const wantsCtrlK =
        shortcutKey.toLowerCase().includes('k') &&
        (e.ctrlKey || e.metaKey) &&
        isK;

      if (wantsCtrlBacktick || wantsCtrlK) {
        // Do not intercept if user is typing in unrelated form input
        if (
          isInput &&
          !activeEl.closest('.contact-input') &&
          !activeEl.closest('[aria-label="Terminal command input"]')
        ) {
          return;
        }

        e.preventDefault();
        toggleTerminal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, shortcutKey, toggleTerminal, windowState, restoreTerminal]);

  return (
    <TerminalContext.Provider
      value={{
        windowState,
        preMinimizedState,
        openTerminal,
        closeTerminal,
        minimizeTerminal,
        restoreTerminal,
        maximizeTerminal,
        toggleTerminal,
        focusTerminalInput,
        scrollToTerminal,
        inputRef,
        terminalTitle,
        isEnabled,
        showEntryPoint: isEnabled && terminalConfig.showEntryPoint !== false,
        shortcut: shortcutKey,
        ...terminalSession,
      }}
    >
      {children}
      {isEnabled && <TerminalModal />}
    </TerminalContext.Provider>
  );
}

export function useTerminalModal() {
  const ctx = useContext(TerminalContext);
  if (!ctx) {
    return {
      windowState: 'normal',
      preMinimizedState: 'normal',
      openTerminal: () => {},
      closeTerminal: () => {},
      minimizeTerminal: () => {},
      restoreTerminal: () => {},
      maximizeTerminal: () => {},
      toggleTerminal: () => {},
      focusTerminalInput: () => {},
      scrollToTerminal: () => {},
      isEnabled: false,
      showEntryPoint: false,
      shortcut: 'Ctrl+`',
      lines: [],
      input: '',
      setInput: () => {},
      executeCommand: () => {},
      clearTerminal: () => {},
      navigateHistory: () => {},
      autocomplete: () => {},
      handleInterrupt: () => {},
      viewportRef: { current: null },
      inputRef: { current: null },
      commandCount: 0,
      promptPrefix: 'E C:\\esubalew\\portfolio>',
      terminalTitle: 'Command Prompt',
    };
  }
  return ctx;
}

export default TerminalContext;
