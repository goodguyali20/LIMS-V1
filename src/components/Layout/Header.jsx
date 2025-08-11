import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, Settings, Search, User, LogOut, Sun, Moon, Barcode, LayoutGrid, Plus } from 'lucide-react';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { logAuditEvent } from '../../utils/monitoring/auditLogger';

const HeaderContainer = styled.header`
  position: relative;
  background: transparent;
  padding: 0 5rem 0 4rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1.5rem;
  min-height: 80px;
  contain: layout style paint;
  
  @media (max-width: 768px) {
    gap: 1rem;
    min-height: 70px;
    padding: 0 2rem 0 2rem;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  min-width: 0;
  justify-self: start;
  margin-left: 0rem;
  position: relative;
  z-index: 10;
`;

const Logo = styled(motion.div)`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  .logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const SearchSection = styled.div`
  max-width: 500px;
  position: relative;
  justify-self: center;
  min-width: 0;
  
  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
`;

const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  justify-self: end;
  transform: translateX(-1rem);
  min-width: 0;
`;

const ActionButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateY(-1px);
  }

  svg {
    width: 20px;
    height: 20px;
    transition: all 0.3s ease;
  }
`;

const PrimaryButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
    transition: all 0.3s ease;
  }
`;

const Avatar = styled(Link)`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }
`;

const NotificationButton = styled(ActionButton)`
  ${({ $hasNotifications }) => $hasNotifications && `
    &::after {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 12px;
      height: 12px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
      animation: pulse 2s infinite;
    }
  `}

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

// Add prop types
const Header = ({ onSidebarToggle, onSidebarStyleToggle, sidebarType, isSidebarOpen }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef(null);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(searchValue.trim())}`);
      logAuditEvent('search_performed', { query: searchValue.trim() });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <HeaderContainer>
        <motion.div variants={itemVariants}>
          <LogoSection>
            <Logo
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="logo-icon">🧪</div>
              SmartLab
            </Logo>
          </LogoSection>
        </motion.div>

        <motion.div variants={itemVariants}>
          <SearchSection>
            <SearchInput
              ref={searchInputRef}
              type="text"
              placeholder="Search patient name"
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
            <SearchIcon>
              <Search size={20} />
            </SearchIcon>
          </SearchSection>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ActionsSection>
            <PrimaryButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/app/patient-registration')}
              title="Add new patient"
            >
              <Plus size={20} />
            </PrimaryButton>
            
            <LanguageSwitcher />

            <ActionButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/app/settings')}
              title="Settings"
            >
              <Settings size={20} />
            </ActionButton>

            <NotificationButton
              $hasNotifications={unreadCount > 0}
              onClick={() => navigate('/app/notifications')}
              title="Notifications"
            >
              <Bell size={20} />
            </NotificationButton>

            <Avatar to="/app/profile">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>
          </ActionsSection>
        </motion.div>
      </HeaderContainer>
    </motion.div>
  );
};

const MemoizedHeader = React.memo(Header);

export default MemoizedHeader;