import React from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  FaTachometerAlt, FaUserPlus, FaTasks, FaHistory,
  FaCog, FaUserCircle, FaSignOutAlt, FaFlask, FaChartBar, FaBoxes
} from 'react-icons/fa';

const SidebarContainer = styled.aside`
  width: 260px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  flex-shrink: 0;
  direction: ltr;
`;

const LogoContainer = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.primaryPlain};
  }
  
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }
`;

const HospitalName = styled.p`
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 0.25rem 0 0 0;
    text-align: center;
`;

const Nav = styled.nav`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 1rem;
`;

// ...The rest of the styled-components (NavList, NavItem, LogoutButton) are unchanged...
const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1.5rem;
  margin: 0.25rem 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  font-weight: 500;
  transition: all 0.2s ease-in-out;

  svg {
    font-size: 1.2rem;
  }

  &.active, &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1.5rem;
  margin: 0.25rem 1rem;
  color: ${({ theme }) => theme.colors.error};
  background: transparent;
  border: none;
  width: calc(100% - 2rem);
  text-align: left;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  font-size: 1rem;
  font-weight: 500;
  font-family: inherit;

  svg {
    font-size: 1.2rem;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.error}15;
  }
`;


const Sidebar = () => {
  const { t } = useTranslation();
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out.');
    }
  };

  const navItems = [
    { to: "/dashboard", icon: <FaTachometerAlt />, label: t('dashboard') },
    { to: "/register", icon: <FaUserPlus />, label: t('patientRegistration') },
    { to: "/work-queue", icon: <FaTasks />, label: t('workQueue') },
    { to: "/inventory", icon: <FaBoxes />, label: t('inventory') },
    { to: "/workload", icon: <FaChartBar />, label: t('workload'), roles: ['Manager'] },
    { to: "/audit-log", icon: <FaHistory />, label: t('auditLog'), roles: ['Manager'] },
    { to: "/settings", icon: <FaCog />, label: t('settings'), roles: ['Manager'] },
  ];

  const bottomNavItems = [
    { to: "/profile", icon: <FaUserCircle />, label: t('profile') },
  ];

  return (
    <SidebarContainer>
      <LogoContainer>
        <Logo>
          <FaFlask />
          <h1>SmartLab</h1>
        </Logo>
        <HospitalName>{t('hospital_name')}</HospitalName>
      </LogoContainer>
      <Nav>
        <NavList>
          {navItems.map(item =>
            (!item.roles || (currentUser && item.roles.includes(currentUser.role))) && (
              <li key={item.to}>
                <NavItem to={item.to}>
                  {item.icon}
                  <span>{item.label}</span>
                </NavItem>
              </li>
            )
          )}
        </NavList>
        <div>
          <NavList>
            {bottomNavItems.map(item => (
              <li key={item.to}>
                <NavItem to={item.to}>
                  {item.icon}
                  <span>{item.label}</span>
                </NavItem>
              </li>
            ))}
            <li>
              <LogoutButton onClick={handleLogout}>
                <FaSignOutAlt />
                <span>{t('logout')}</span>
              </LogoutButton>
            </li>
          </NavList>
        </div>
      </Nav>
    </SidebarContainer>
  );
};

export default Sidebar;