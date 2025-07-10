import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { FaFlask } from 'react-icons/fa';
import { toast } from 'react-toastify';

//--- STYLED COMPONENTS (Vivid Design) ---//

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
`;

const LoginForm = styled.form`
  background: ${({ theme }) => theme.glassBg};
  border: 1px solid ${({ theme }) => theme.glassBorder};
  backdrop-filter: ${({ theme }) => theme.backdropFilter};
  -webkit-backdrop-filter: ${({ theme }) => theme.backdropFilter};
  padding: 40px;
  ${({ theme }) => theme.squircle(24)};
  box-shadow: ${({ theme }) => theme.shadow};
  width: 100%;
  max-width: 420px;
  text-align: center;
  z-index: 1;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.text};
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 2.5rem;
  font-weight: 700;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  margin-bottom: 16px;
  border: 1px solid transparent;
  background-color: ${({ theme }) => theme.text}1A; /* Text with low alpha */
  color: ${({ theme }) => theme.text};
  ${({ theme }) => theme.squircle(12)};
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.text}99;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}4D;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: ${({ theme }) => theme.primaryGradient};
  color: white;
  border: none;
  ${({ theme }) => theme.squircle(12)};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 20px ${({ theme }) => theme.primary}5A;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoginPage = () => {
  const { t } = useTranslation();
  const { login, currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && userRole) {
        setLoading(false);
        const roleToPath = {
            manager: '/manager',
            receptionist: '/reception',
            phlebotomist: '/phlebotomy',
            technologist: '/technologist'
        };
        const path = roleToPath[userRole] || '/login';
        navigate(path);
    }
  }, [currentUser, userRole, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      console.error("Firebase login failed:", err);
      if (err.code === 'auth/invalid-credential') {
          toast.error("Invalid email or password.");
      } else {
          toast.error("An unexpected error occurred.");
      }
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <Title><FaFlask /> مستشفى العزيزية العام</Title>
        <Input
          type="email"
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : t('login')}
        </Button>
      </LoginForm>
    </LoginContainer>
  );
};

export default LoginPage;