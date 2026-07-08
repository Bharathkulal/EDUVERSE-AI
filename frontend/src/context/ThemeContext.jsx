import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
      return nextTheme;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      root.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
