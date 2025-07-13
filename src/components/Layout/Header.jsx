import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Bell, Settings, Search, User, LogOut, Sun, Moon } from 'lucide-react';
import LanguageSwitcher from '../common/LanguageSwitcher';
import PremiumBarcodeScanner from '../common/PremiumBarcodeScanner';
import { trackEvent } from '../../utils/errorMonitoring';

const HeaderContainer = styled(motion.create('header'))`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`;

const LogoSection = styled(motion.create('div'))`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
`;

const Logo = styled(motion.create('div'))`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .logo-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
  }
`;

const SearchSection = styled(motion.create('div'))`
  flex: 1;
  max-width: 500px;
  position: relative;
  
  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchInput = styled(motion.create('input'))`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SearchIcon = styled(motion.create('div'))`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
`;

const ActionsSection = styled(motion.create('div'))`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const Avatar = styled(motion.create(Link))`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    animation: spin 10s linear infinite;
  }

  &:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  }
`;

const NotificationButton = styled(motion.create('button'))`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
    
    &::before {
      opacity: 1;
    }
    
    svg {
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
    }
  }

  svg {
    font-size: 1.25rem;
    transition: all 0.3s ease;
  }

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
      border: 2px solid rgba(255, 255, 255, 0.9);
      animation: pulse 2s infinite;
    }
  `}
`;

const SettingsButton = styled(motion.create('button'))`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
    
    &::before {
      opacity: 1;
    }
    
    svg {
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
    }
  }

  svg {
    font-size: 1.25rem;
    transition: all 0.3s ease;
  }
`;

// Simple wrapper to style the button for the dashboard
const HeaderSwitcher = styled(motion.create('div'))`
  button {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: ${({ theme }) => theme.colors.text};
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      transform: translateY(-2px);
    }
  }
`;

// Particle component for background effects
const Particle = styled(motion.create('div'))`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  pointer-events: none;
`;

const WelcomeCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  margin-bottom: 0.5rem;
`;

const Header = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [particles, setParticles] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef(null);

  const handleBarcodeScan = (scannedCode) => {
    navigate(`/app/order/${scannedCode}`);
    trackEvent('barcode_scanned', { code: scannedCode });
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(searchValue.trim())}`);
      trackEvent('search_performed', { query: searchValue.trim() });
    }
  };

  // Particle effect
  useEffect(() => {
    const createParticle = () => {
      const particle = {
        id: Date.now() + Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        life: 1
      };
      setParticles(prev => [...prev, particle]);

      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== particle.id));
      }, 3000);
    };

    const interval = setInterval(createParticle, 2000);
    return () => clearInterval(interval);
  }, []);

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <HeaderContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Particles */}
      {particles.map(particle => (
        <Particle
          key={particle.id}
          style={{
            left: particle.x,
            top: particle.y
          }}
          animate={{
            x: particle.vx * 100,
            y: particle.vy * 100,
            opacity: [1, 0],
            scale: [1, 0]
          }}
          transition={{
            duration: 3,
            ease: "easeOut"
          }}
        />
      ))}

      <LogoSection variants={itemVariants}>
        <Logo
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="logo-icon">🧪</div>
          SmartLab
        </Logo>
      </LogoSection>

      <SearchSection variants={itemVariants}>
        <SearchInput
          ref={searchInputRef}
          type="text"
          placeholder={t('header.searchPlaceholder')}
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          whileFocus={{ scale: 1.02 }}
        />
        <SearchIcon>
          <Search size={20} />
        </SearchIcon>
      </SearchSection>

      <ActionsSection variants={itemVariants}>
        <PremiumBarcodeScanner onScan={handleBarcodeScan} />
        
        <LanguageSwitcher />
        
        <HeaderSwitcher>
          <motion.button
            onClick={() => navigate('/app/settings')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '0.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--text-color)'
            }}
          >
            <Settings size={20} />
          </motion.button>
        </HeaderSwitcher>

        <NotificationButton
          $hasNotifications={unreadCount > 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/app/notifications')}
        >
          <Bell size={20} />
        </NotificationButton>

        <Avatar
          to="/app/profile"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </Avatar>
      </ActionsSection>
    </HeaderContainer>
  );
};

export default Header;