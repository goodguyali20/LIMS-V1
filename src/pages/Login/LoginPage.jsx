import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import LoginForm from './LoginForm';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { fadeIn } from '../../styles/animations';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, #6a11cb, #2575fc, #ec008c, #fc6767);
    background-size: 400% 400%;
    animation: gradientAnimation 15s ease infinite;
    z-index: 1;
  }

  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const LoginCard = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 450px;
  padding: 3rem 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.shapes.squircle};
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  animation: ${fadeIn} 0.5s ease-in-out;
  color: #fff;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #fff;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const SwitcherContainer = styled.div`
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 3;
`;

const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <LoginContainer>
        <SwitcherContainer>
            <LanguageSwitcher />
        </SwitcherContainer>
      <LoginCard>
        <Title>{t('welcomeMessage')}</Title>
        <Subtitle>{t('hospitalName')}</Subtitle>
        <LoginForm />
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;