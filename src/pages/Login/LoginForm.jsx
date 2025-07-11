import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { toast } from 'react-toastify';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  text-align: left;
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.9);
  }
  input {
    width: 100%;
    padding: 0.8rem 1rem;
    border-radius: 12px; /* Slightly different for inputs */
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.15);
    color: white;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: rgba(255, 255, 255, 0.7);
    }
  }
`;

const LoginButton = styled.button`
  padding: 1rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: linear-gradient(45deg, #f857a6, #ff5858);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(255, 88, 88, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: translateY(0);
    box-shadow: none;
  }
`;

const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    sessionStorage.setItem('loginEventLogged', 'false'); // Reset login event flag

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful! Welcome back.');
      navigate('/dashboard');
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.message.includes('auth/invalid-credential') 
        ? 'Invalid email or password.' 
        : 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleLogin}>
      <InputGroup>
        <label htmlFor="email">{t('emailLabel')}</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </InputGroup>
      <InputGroup>
        <label htmlFor="password">{t('passwordLabel')}</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </InputGroup>
      <LoginButton type="submit" disabled={loading}>
        {loading ? 'Logging in...' : t('loginButton')}
      </LoginButton>
    </Form>
  );
};

export default LoginForm;