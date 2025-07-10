import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaFlask, FaSignOutAlt } from 'react-icons/fa';

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.medium};
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const LanguageSwitcher = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: none;
  background-color: #fff;
  color: ${({ theme }) => theme.colors.text};
`;

const LogoutButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
`;

const Header = () => {
  const { t, i18n } = useTranslation();
  const { logout, currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <HeaderContainer>
      <Logo><FaFlask /> {t('smartLab')}</Logo>
      <Controls>
        {currentUser && <span>{currentUser.email} ({userRole})</span>}
        <LanguageSwitcher onChange={handleLanguageChange} value={i18n.language}>
          <option value="ar">العربية</option>
          <option value="en">English</option>
        </LanguageSwitcher>
        <LogoutButton onClick={handleLogout} title={t('logout')}>
          <FaSignOutAlt />
        </LogoutButton>
      </Controls>
    </HeaderContainer>
  );
};

export default Header;