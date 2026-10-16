import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useContentStore } from '../store/contentStore';
import { TerminalModal } from '../components/Terminal';

const TerminalContext = createContext(null);

export function TerminalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const content = useContentStore((s) => s.content) || {};
  const terminalConfig = content.terminal || {};

  const isEnabled = terminalConfig.enabled !== false;
  const shortcutKey = terminalConfig.shortcut || 'Ctrl+`';

  const openTerminal = useCallback(() => {
    if (!isEnabled) return;
    setIsOpen(true);
  }, [isEnabled]);

  const closeTerminal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleTerminal = useCallback(() => {
    if (!isEnabled) return;
    setIsOpen((prev) => !prev);
  }, [isEnabled]);

  // Global Keyboard Shortcut Listener
  useEffect(() => {
    if (!isEnabled) {
      setIsOpen(false);
      return;
    }

    const handleKeyDown = (e) => {
      // Do not trigger if user is typing in an input, textarea, or contentEditable element
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
        // If user is currently typing in another input, do not hijack unless it's already inside terminal
        if (isInput && !activeEl.closest('.contact-input') && !activeEl.closest('[aria-label="Terminal command input"]')) {
          // Unrelated form input - do not hijack
          return;
        }

        e.preventDefault();
        toggleTerminal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, shortcutKey, toggleTerminal]);

  return (
    <TerminalContext.Provider
      value={{
        isOpen,
        openTerminal,
        closeTerminal,
        toggleTerminal,
        isEnabled,
        showEntryPoint: isEnabled && terminalConfig.showEntryPoint !== false,
        shortcut: shortcutKey,
      }}
    >
      {children}
      {isEnabled && <TerminalModal isOpen={isOpen} onClose={closeTerminal} />}
    </TerminalContext.Provider>
  );
}

export function useTerminalModal() {
  const ctx = useContext(TerminalContext);
  if (!ctx) {
    return {
      isOpen: false,
      openTerminal: () => {},
      closeTerminal: () => {},
      toggleTerminal: () => {},
      isEnabled: false,
      showEntryPoint: false,
      shortcut: 'Ctrl+`',
    };
  }
  return ctx;
}

export default TerminalContext;
