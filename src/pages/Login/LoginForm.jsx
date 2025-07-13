import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const Form = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
`;

const InputGroup = styled(motion.div)`
  text-align: left;
  position: relative;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    transition: color 0.3s ease;
  }
  
  input {
    width: 100%;
    padding: 1rem 1.2rem;
    border-radius: 12px;
    border: 2px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.input};
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
    outline: none;
    transition: all 0.3s ease;
    position: relative;
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: ${({ theme }) => theme.isDarkMode ? theme.shadows.glow.primary : '0 0 0 3px rgba(37, 99, 235, 0.1)'};
      transform: translateY(-1px);
    }
    
    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const LoginButton = styled(motion.button)`
  padding: 1rem 2rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.info});
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  margin: 0 auto;
`;

const ErrorMessage = styled(motion.div)`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.875rem;
  text-align: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: ${({ theme }) => theme.isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'};
`;

const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    sessionStorage.setItem('loginEventLogged', 'false');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful! Welcome back.');
      navigate('/app/dashboard');
    } catch (error) {
      console.error("Login Error:", error);
      const errorMessage = error.message.includes('auth/invalid-credential') 
        ? 'Invalid email or password.' 
        : 'An error occurred during login.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      boxShadow: theme.isDarkMode ? theme.shadows.glow.primary : "0 8px 25px rgba(37, 99, 235, 0.3)",
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  return (
    <Form
      onSubmit={handleLogin}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <InputGroup variants={itemVariants}>
        <label htmlFor="email">{t('emailLabel')}</label>
        <motion.input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        />
      </InputGroup>
      
      <InputGroup variants={itemVariants}>
        <label htmlFor="password">{t('passwordLabel')}</label>
        <motion.input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        />
      </InputGroup>
      
      <LoginButton
        type="submit"
        disabled={loading}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        {loading ? (
          <LoadingSpinner
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          t('loginButton')
        )}
      </LoginButton>
      
      <AnimatePresence>
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
    </Form>
  );
};

export default LoginForm;