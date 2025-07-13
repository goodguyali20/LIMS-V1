import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBarcode, FaBell, FaCog, FaUser } from 'react-icons/fa';
import { formatInTimeZone } from 'date-fns-tz';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import LanguageSwitcher from '../Common/LanguageSwitcher';

const HeaderContainer = styled(motion.header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 2rem;
  background: linear-gradient(135deg, #2563eb 0%, #1e293b 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  height: 64px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(30, 41, 59, 0.08) 100%);
    opacity: 0.5;
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
    animation: shimmer 3s infinite;
  }
`;

const Greeting = styled(motion.div)`
  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  p {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    min-height: 1.2em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const TimeDisplay = styled(motion.span)`
  font-weight: 500;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
`;

const SearchContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchBar = styled(motion.div)`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 0.75rem 1rem;
  border-radius: 16px;
  width: 220px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  font-size: 0.95rem;

  &:hover, &:focus-within {
    border-color: #60a5fa;
    box-shadow: 0 0 0 2px #2563eb33;
    background: rgba(37, 99, 235, 0.08);
  }

  svg {
    color: rgba(255, 255, 255, 0.7);
    transition: color 0.3s ease;
  }

  &:focus-within svg {
    color: white;
  }

  input {
    border: none;
    background: transparent;
    outline: none;
    margin: 0 0.75rem;
    width: 100%;
    color: white;
    font-size: 0.92rem;
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }
`;

const BarcodeStatus = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
  padding: 0.5rem;
  height: 36px;
  font-size: 0.95rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.isDarkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${({ theme }) => theme.isDarkMode 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(0, 0, 0, 0.1)'};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  margin-left: 1.5rem;
  outline: none;

  &:hover, &:focus {
    background: ${({ theme }) => theme.isDarkMode 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.1)'};
    transform: translateY(-1px) scale(1.04);
    box-shadow: ${({ theme }) => theme.isDarkMode 
      ? theme.shadows.glow.primary 
      : '0 4px 12px rgba(0, 0, 0, 0.15)'};
    border-color: #60a5fa;
  }

  &:active {
    transform: scale(0.97);
    background: ${({ theme }) => theme.isDarkMode 
      ? 'rgba(255,255,255,0.25)' 
      : 'rgba(37,99,235,0.12)'};
  }

  svg {
    font-size: 1.25rem;
    animation: pulse 2s infinite;
  }
`;

const UserProfile = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const Avatar = styled(motion(Link))`
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

const NotificationButton = styled(motion.button)`
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

const SettingsButton = styled(motion.button)`
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
const HeaderSwitcher = styled(motion.div)`
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
const Particle = styled(motion.div)`
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
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      // Example: navigate to a search results page or trigger a search function
      navigate(`/app/search?query=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  useBarcodeScanner(handleBarcodeScan);

  const userInitials = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    const timerId = setInterval(() => {
      const baghdadTime = formatInTimeZone(new Date(), 'Asia/Baghdad', 'hh:mm:ss a');
      setCurrentTime(baghdadTime);
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  // Create floating particles
  useEffect(() => {
    const createParticle = () => {
      const particle = {
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 10,
        delay: Math.random() * 2,
      };
      setParticles(prev => [...prev, particle]);
      
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== particle.id));
      }, 3000);
    };

    const interval = setInterval(createParticle, 2000);
    return () => clearInterval(interval);
  }, []);

  const headerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const greetingVariants = {
    initial: { opacity: 0, x: -30 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5,
        delay: 0.2,
        ease: "easeOut"
      }
    }
  };

  const searchVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.4,
        ease: "easeOut"
      }
    }
  };

  const profileVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5,
        delay: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <HeaderContainer
      variants={headerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Background particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <Particle
            key={particle.id}
            initial={{ 
              x: particle.x, 
              y: particle.y, 
              opacity: 0,
              scale: 0 
            }}
            animate={{ 
              y: particle.y - 100,
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              transition: {
                duration: 3,
                delay: particle.delay,
                ease: "easeOut"
              }
            }}
            exit={{ opacity: 0, scale: 0 }}
          />
        ))}
      </AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '1.1rem', fontWeight: 500, color: '#fff' }}>
          <span>{`${t('greeting')}, ${user?.displayName || 'User'}!`}</span>
          <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>·</span>
          <TimeDisplay
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '1.05rem', fontWeight: 500, background: 'none', padding: 0, border: 'none' }}
          >
            {currentTime || 'Loading time...'}
          </TimeDisplay>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SearchContainer variants={searchVariants}>
            <SearchBar
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSearch />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                maxLength={32}
              />
            </SearchBar>
            <BarcodeStatus
              as={motion.button}
              type="button"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(16, 185, 129, 0.4)",
                  "0 0 0 10px rgba(16, 185, 129, 0)",
                  "0 0 0 0 rgba(16, 185, 129, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              tabIndex={0}
              onClick={() => {
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                  console.log('BarcodeStatus clicked, focusing search input');
                }
              }}
              title="Click to focus search bar"
            >
              <FaBarcode />
              <span>Ready to Scan</span>
            </BarcodeStatus>
          </SearchContainer>
        </div>
        <div style={{ height: 36, width: 1, background: 'rgba(255,255,255,0.10)', margin: '0 1.5rem' }} />
      </div>
      <UserProfile variants={profileVariants}>
        <HeaderSwitcher
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LanguageSwitcher />
        </HeaderSwitcher>
        <NotificationButton
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaBell />
        </NotificationButton>
        <SettingsButton
          onClick={() => navigate('/app/settings')}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaCog />
        </SettingsButton>
        <Avatar 
          to="/profile"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span>{userInitials}</span>
        </Avatar>
      </UserProfile>
    </HeaderContainer>
  );
};

export default Header;