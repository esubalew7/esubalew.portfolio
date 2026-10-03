import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_theme');
      if (saved) return saved === 'dark';
    } catch {
      // fallback
    }
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDarkMode);
    try {
      localStorage.setItem('portfolio_theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  const value = {
    isDarkMode,
    toggleTheme: () => setIsDarkMode(current => !current),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
