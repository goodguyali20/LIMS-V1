import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiSun, FiMoon } from 'react-icons/fi';
import LoginForm from './LoginForm';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const LoginContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: ${({ theme }) => theme.isDarkMode 
    ? 'linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e, #0f3460)' 
    : 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c)'};
  background-size: 400% 400%;
  animation: gradientAnimation 15s ease infinite;
  
  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.isDarkMode 
      ? 'radial-gradient(circle at 20% 80%, rgba(0, 170, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 255, 136, 0.1) 0%, transparent 50%)'
      : 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'};
    z-index: 1;
  }
`;

const LoginCard = styled(motion.div)`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 450px;
  padding: 3rem 2.5rem;
  background: ${({ theme }) => theme.isDarkMode 
    ? 'rgba(30, 30, 30, 0.8)' 
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.isDarkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.2)'};
  box-shadow: ${({ theme }) => theme.isDarkMode 
    ? '0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
    : '0 8px 32px 0 rgba(31, 38, 135, 0.37)'};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const Title = styled(motion.h1)`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.isDarkMode 
    ? 'linear-gradient(135deg, #00aaff, #00ff88)' 
    : 'linear-gradient(135deg, #667eea, #764ba2)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 400;
`;

const SwitcherContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 3;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ThemeToggle = styled(motion.button)`
  background: ${({ theme }) => theme.isDarkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.2)'};
  border: 1px solid ${({ theme }) => theme.isDarkMode 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.isDarkMode 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(255, 255, 255, 0.3)'};
    transform: scale(1.1);
    box-shadow: ${({ theme }) => theme.isDarkMode 
      ? theme.shadows.glow.primary 
      : '0 4px 15px rgba(0, 0, 0, 0.2)'};
  }
`;

const FloatingParticles = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    background: ${({ theme }) => theme.isDarkMode 
      ? 'rgba(0, 170, 255, 0.6)' 
      : 'rgba(255, 255, 255, 0.6)'};
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
  }
  
  &::before {
    top: 20%;
    left: 10%;
    animation-delay: 0s;
  }
  
  &::after {
    top: 60%;
    right: 10%;
    animation-delay: 3s;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.6;
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
      opacity: 1;
    }
  }
`;

const LoginPage = () => {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.4
      }
    }
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.6
      }
    }
  };

  return (
    <LoginContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <FloatingParticles />
      
      <SwitcherContainer>
        <LanguageSwitcher />
        <ThemeToggle
          onClick={toggleTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
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
                <FiSun size={20} />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiMoon size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </ThemeToggle>
      </SwitcherContainer>
      
      <LoginCard
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Title variants={titleVariants}>
          {t('welcomeMessage')}
        </Title>
        <Subtitle variants={subtitleVariants}>
          {t('hospitalName')}
        </Subtitle>
        <LoginForm />
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;