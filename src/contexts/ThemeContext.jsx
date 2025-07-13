import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    // Apply theme to document body for global styles
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.style.backgroundColor = theme.colors.dark.background;
      document.body.style.color = theme.colors.dark.text;
    } else {
      document.body.classList.remove('dark-mode');
      document.body.style.backgroundColor = theme.colors.background;
      document.body.style.color = theme.colors.text;
    }
  }, [isDarkMode]);

  const currentTheme = {
    ...theme,
    isDarkMode,
    colors: isDarkMode ? {
      ...theme.colors,
      background: theme.colors.dark.background,
      surface: theme.colors.dark.surface,
      surfaceSecondary: theme.colors.dark.surfaceSecondary,
      text: theme.colors.dark.text,
      textSecondary: theme.colors.dark.textSecondary,
      border: theme.colors.dark.border,
      input: theme.colors.dark.input,
      hover: theme.colors.dark.hover,
    } : theme.colors,
    shadows: isDarkMode ? {
      ...theme.shadows,
      main: theme.shadows.dark.main,
      hover: theme.shadows.dark.hover,
      large: theme.shadows.dark.large,
    } : theme.shadows,
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDarkMode, toggleTheme }}>
      <StyledThemeProvider theme={currentTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};