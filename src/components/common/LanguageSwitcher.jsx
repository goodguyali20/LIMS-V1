import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiGlobe, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const SwitcherContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const LanguageToggle = styled(motion.button)`
  width: 48px;
  height: 48px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  font-size: 0.875rem;
  font-weight: 600;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
    transition: all 0.3s ease;
  }
`;

const ThemeButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
    transition: all 0.3s ease;
  }
`;

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLanguageToggle = () => {
    const newLanguage = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLanguage);
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
      <LanguageToggle
        onClick={handleLanguageToggle}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        title={`Switch to ${i18n.language === 'en' ? 'Arabic' : 'English'}`}
      >
        <FiGlobe size={20} />
      </LanguageToggle>

      <ThemeButton
        onClick={toggleTheme}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <motion.div
          animate={{ rotate: isDarkMode ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </motion.div>
      </ThemeButton>
    </SwitcherContainer>
  );
};

export default LanguageSwitcher;