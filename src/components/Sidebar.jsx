import React from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { FaFlask, FaUserEdit, FaUserMd, FaVial, FaChartBar, FaSignOutAlt, FaCog, FaMoon, FaSun } from 'react-icons/fa';

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  height: 100vh;
  background: ${({ theme }) => theme.sidebarBg};
  border-right: 1px solid ${({ theme }) => theme.borderColor};
  padding: 24px;
  position: fixed;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 40px;
  padding: 0 12px;
`;

const LogoIcon = styled.div`
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    background: ${({ theme }) => theme.primaryGradient};
    ${({ theme }) => theme.squircle(12)};
`;

const Nav = styled.nav`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  text-decoration: none;
  color: ${({ theme }) => theme.text}BF; /* Text with alpha */
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
  ${({ theme }) => theme.squircle(12)};

  &:hover {
    color: ${({ theme }) => theme.text};
    background-color: ${({ theme }) => theme.primary}1A;
  }

  &.active {
    color: white;
    background: ${({ theme }) => theme.primaryGradient};
    box-shadow: 0 4px 12px ${({ theme }) => theme.primary}4D;
  }
`;

const Footer = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text}BF;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  text-align: left;
  ${({ theme }) => theme.squircle(12)};

  &:hover {
    color: ${({ theme }) => theme.text};
    background-color: ${({ theme }) => theme.primary}1A;
  }
`;

const Sidebar = () => {
    const { t } = useTranslation();
    const { userRole, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = {
        receptionist: [ { path: "/reception", icon: <FaUserEdit />, label: t('receptionistDashboard') } ],
        phlebotomist: [ { path: "/phlebotomy", icon: <FaVial />, label: t('phlebotomyQueue') } ],
        technologist: [ { path: "/technologist", icon: <FaUserMd />, label: t('technologistWorklist') } ],
        manager: [
            { path: "/manager", icon: <FaChartBar />, label: t('managerDashboard') },
            { path: "/reception", icon: <FaUserEdit />, label: t('receptionistDashboard') },
            { path: "/settings", icon: <FaCog />, label: 'Settings' },
        ]
    };

    return (
        <SidebarContainer>
            <Logo>
                <LogoIcon><FaFlask /></LogoIcon>
                <span>مستشفى العزيزية العام</span>
            </Logo>
            <Nav>
                {userRole && navItems[userRole]?.map(item => (
                    <StyledNavLink to={item.path} key={item.path}>
                        {item.icon}
                        <span>{item.label}</span>
                    </StyledNavLink>
                ))}
            </Nav>
            <Footer>
                <ActionButton onClick={toggleTheme}>
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </ActionButton>
                <ActionButton onClick={handleLogout}>
                    <FaSignOutAlt />
                    <span>{t('logout')}</span>
                </ActionButton>
            </Footer>
        </SidebarContainer>
    );
};

export default Sidebar;