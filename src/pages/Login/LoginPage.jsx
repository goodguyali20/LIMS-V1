import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LoginForm from './LoginForm';
import { useTheme } from '../../contexts/ThemeContext';

const LoginContainer = styled(motion.create('div'))`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  padding: 1rem;
`;

const LoginCard = styled(motion.create('div'))`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(10px);
`;

const Title = styled(motion.create('h1'))`
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled(motion.create('p'))`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 2rem;
  font-size: 1rem;
`;

const ThemeToggle = styled(motion.create('button'))`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const LoginPage = () => {
  const { toggleTheme, theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <LoginContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <ThemeToggle
        onClick={toggleTheme}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {theme.mode === 'dark' ? '☀️' : '🌙'}
      </ThemeToggle>
      
      <LoginCard
        variants={cardVariants}
        whileHover={{ 
          y: -5,
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)"
        }}
      >
        <Title variants={itemVariants}>
          SmartLab LIMS
        </Title>
        <Subtitle variants={itemVariants}>
          Laboratory Information Management System
        </Subtitle>
        <LoginForm setIsLoading={setIsLoading} />
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;