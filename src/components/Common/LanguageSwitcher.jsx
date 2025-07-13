import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiSun, FiMoon, FiGlobe } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const SwitcherContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const SwitcherButton = styled(motion.button)`
  background: ${({ theme }) => theme.isDarkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${({ theme }) => theme.isDarkMode 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: ${({ theme }) => theme.isDarkMode 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.1)'};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.isDarkMode 
      ? theme.shadows.glow.primary 
      : '0 4px 12px rgba(0, 0, 0, 0.15)'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  return (
    <SwitcherContainer>
      <SwitcherButton
        onClick={() => handleLanguageChange('en')}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        style={{
          backgroundColor: i18n.language === 'en' 
            ? (isDarkMode ? 'rgba(0, 170, 255, 0.2)' : 'rgba(37, 99, 235, 0.1)')
            : undefined
        }}
      >
        <FiGlobe size={16} />
        <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }}>EN</span>
      </SwitcherButton>
      
      <SwitcherButton
        onClick={() => handleLanguageChange('ar')}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        style={{
          backgroundColor: i18n.language === 'ar' 
            ? (isDarkMode ? 'rgba(0, 170, 255, 0.2)' : 'rgba(37, 99, 235, 0.1)')
            : undefined
        }}
      >
        <FiGlobe size={16} />
        <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }}>AR</span>
      </SwitcherButton>
      
      <SwitcherButton
        onClick={toggleTheme}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <AnimatePresence mode="wait">
          {isDarkMode ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FiSun size={16} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FiMoon size={16} />
            </motion.div>
          )}
        </AnimatePresence>
      </SwitcherButton>
    </SwitcherContainer>
  );
};

export default LanguageSwitcher;