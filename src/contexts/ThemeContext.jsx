import React, { createContext, useState, useMemo, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const lightTheme = {
  colors: {
    primary: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)',
    primaryPlain: '#2575fc',
    background: '#f4f7fa',
    surface: '#ffffff',
    text: '#1a202c',
    textSecondary: '#718096',
    border: '#e2e8f0',
    error: '#e53e3e',
    success: '#38a169',
    urgent: '#f56565',
  },
  shapes: {
    squircle: '24px',
  },
  shadows: {
    main: '0 4px 12px 0 rgba(0,0,0,0.07)',
    hover: '0 6px 20px 0 rgba(0,0,0,0.1)',
  },
};

const darkTheme = {
  colors: {
    primary: 'linear-gradient(45deg, #8e44ad 0%, #3498db 100%)',
    primaryPlain: '#3498db',
    background: '#1a202c',
    surface: '#2d3748',
    text: '#f7fafc',
    textSecondary: '#a0aec0',
    border: '#4a5568',
    error: '#fc8181',
    success: '#68d391',
    urgent: '#f56565',
  },
  shapes: {
    squircle: '24px',
  },
  shadows: {
    main: '0 4px 12px 0 rgba(0,0,0,0.15)',
    hover: '0 6px 20px 0 rgba(0,0,0,0.25)',
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('light');

  const toggleTheme = () => {
    setThemeName(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => (themeName === 'light' ? lightTheme : darkTheme), [themeName]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};