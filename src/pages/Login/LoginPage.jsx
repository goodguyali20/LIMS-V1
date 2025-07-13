import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LoginForm from './LoginForm';
import { useTheme } from '../../contexts/ThemeContext';
import { setupDemoUsers, testAllDemoUsers, DEMO_USERS } from '../../utils/authHelper';

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

const SetupButton = styled(motion.create('button'))`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TestButton = styled(motion.create('button'))`
  position: absolute;
  top: 1rem;
  left: 12rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DemoCredentials = styled(motion.create('div'))`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 400px;
  margin: 0 auto;
  
  h4 {
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }
  
  .credential {
    margin: 0.25rem 0;
    font-family: monospace;
  }
`;

const LoginPage = () => {
  const { toggleTheme, theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

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

  const handleSetupDemoUsers = async () => {
    setIsSettingUp(true);
    try {
      await setupDemoUsers();
      setShowCredentials(true);
      console.log('✅ Demo users setup completed successfully!');
    } catch (error) {
      console.error('❌ Setup failed:', error);
      alert('Setup failed. Check console for details.');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleTestDemoUsers = async () => {
    setIsTesting(true);
    try {
      await testAllDemoUsers();
      console.log('✅ All demo user tests completed!');
    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <LoginContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <SetupButton
        onClick={handleSetupDemoUsers}
        disabled={isSettingUp}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isSettingUp ? 'Setting up...' : 'Setup Demo Users'}
      </SetupButton>

      <TestButton
        onClick={handleTestDemoUsers}
        disabled={isTesting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isTesting ? 'Testing...' : 'Test Logins'}
      </TestButton>

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

      {showCredentials && (
        <DemoCredentials
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h4>🎯 Demo Login Credentials</h4>
          <div className="credential">Manager: manager@smartlab.com / manager123</div>
          <div className="credential">Technician: tech@smartlab.com / tech123</div>
          <div className="credential">Phlebotomist: phleb@smartlab.com / phleb123</div>
        </DemoCredentials>
      )}
    </LoginContainer>
  );
};

export default LoginPage;