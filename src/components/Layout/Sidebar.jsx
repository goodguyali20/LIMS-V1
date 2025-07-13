import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  FaTachometerAlt, FaUserPlus, FaTasks, FaHistory,
  FaCog, FaUserCircle, FaSignOutAlt, FaFlask, FaChartBar, FaBoxes, FaThermometerHalf,
  FaUserMd, FaRocket, FaStar, FaVial, FaCheckCircle
} from 'react-icons/fa';
import GlowingNotificationBadge from '../common/GlowingNotificationBadge';

const SidebarContainer = styled(motion.aside)`
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #2563eb 0%, #1e293b 100%);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
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
    pointer-events: none;
  }
`;

const LogoContainer = styled(motion.div)`
  padding: 2rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Logo = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  
  svg {
    font-size: 2rem;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
  }
`;

const HospitalName = styled(motion.div)`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

const Nav = styled.nav`
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 1;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const NavItem = styled(motion(Link))`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  border-radius: 12px;
  margin: 0 0.75rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  ${({ $indent }) => $indent && `
    margin-left: 2.5rem;
    font-size: 0.9rem;
    padding: 0.75rem 1.25rem;
    
    &::before {
      content: '';
      position: absolute;
      left: -0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 0.5rem;
      height: 0.5rem;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
    }
  `}
  
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
    color: white;
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(4px);
    
    &::before {
      opacity: 1;
    }
    
    svg {
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
    }
  }
  
  &.active {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
    color: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 60%;
      background: white;
      border-radius: 2px 0 0 2px;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
    
    svg {
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
    }
  }
  
  svg {
    font-size: 1.25rem;
    transition: all 0.3s ease;
  }
  
  span {
    position: relative;
    z-index: 1;
  }
`;

const LogoutButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  background: none;
  border: none;
  font-weight: 500;
  border-radius: 12px;
  margin: 0 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-size: 1rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    color: white;
    background: rgba(239, 68, 68, 0.2);
    transform: translateX(4px);
    
    &::before {
      opacity: 1;
    }
    
    svg {
      filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.5));
    }
  }
  
  svg {
    font-size: 1.25rem;
    transition: all 0.3s ease;
  }
  
  span {
    position: relative;
    z-index: 1;
  }
`;

// Floating particles component
const FloatingParticle = styled(motion.div)`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${({ color }) => color};
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  box-shadow: 0 0 8px ${({ color }) => color};
`;

const JourneyGroup = styled.div`
  margin: 2rem 0 1.5rem 0;
  padding: 1.5rem 1rem 1.5rem 1rem;
  background: linear-gradient(120deg, #1e293b 60%, #2563eb 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 #2563eb22;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: stretch;
  position: relative;
`;

const JourneyStep = styled(NavItem)`
  margin: 0;
  padding: 1rem 1.2rem;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.08rem;
  font-weight: 600;
  position: relative;
  box-shadow: 0 2px 8px 0 #2563eb11;
  transition: background 0.2s, box-shadow 0.2s;
  &:hover, &.active {
    background: linear-gradient(90deg, #3b82f6 0%, #1e293b 100%);
    color: #fff;
    box-shadow: 0 4px 16px 0 #3b82f644;
  }
`;

const JourneyIcon = styled.span`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Sidebar = () => {
  const { t } = useTranslation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [particles, setParticles] = useState([]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out.');
    }
  };

  // Create floating particles
  useEffect(() => {
    const createParticle = () => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
      const particle = {
        id: Math.random(),
        x: Math.random() * 280,
        y: 600,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
      };
      setParticles(prev => [...prev, particle]);
      
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== particle.id));
      }, particle.duration * 1000);
    };

    const interval = setInterval(createParticle, 3000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: "/app/dashboard", icon: <FaTachometerAlt />, label: t('dashboard.title') },
    { to: "/app/register", icon: <FaUserPlus />, label: t('patientRegistration') },
    { to: "/app/phlebotomist", icon: <FaUserMd />, label: t('phlebotomist') },
    { to: "/app/patient-history", icon: <FaHistory />, label: t('patientHistory') },
    { to: "/app/work-queue", icon: <FaTasks />, label: t('workQueue.title') },
    { to: "/app/quality-control", icon: <FaThermometerHalf />, label: t('qualityControl.title') },
    { to: "/app/inventory", icon: <FaBoxes />, label: t('inventory.title') },
    { to: "/app/workload", icon: <FaChartBar />, label: t('workload'), roles: ['Manager'] },
    { to: "/app/audit-log", icon: <FaHistory />, label: t('auditLog'), roles: ['Manager'] },
    { to: "/app/settings", icon: <FaCog />, label: t('settings'), roles: ['Manager'] },
  ];

  const bottomNavItems = [
    { to: "/app/profile", icon: <FaUserCircle />, label: t('profile.title') },
  ];

  // Simulated live counts (replace with real data later)
  const journeyCounts = {
    registration: 7,
    phlebotomy: 12,
    labwork: 5,
    results: 3
  };

  const sidebarVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const logoVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.2,
        ease: "easeOut"
      }
    }
  };

  const navItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: (i) => ({ 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        delay: 0.3 + i * 0.1,
        ease: "easeOut"
      }
    })
  };

  return (
    <SidebarContainer
      variants={sidebarVariants}
      initial="initial"
      animate="animate"
    >
      {/* Floating particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <FloatingParticle
            key={particle.id}
            color={particle.color}
            initial={{ 
              x: particle.x, 
              y: particle.y, 
              opacity: 0,
              scale: 0 
            }}
            animate={{ 
              y: particle.y - 200,
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              transition: {
                duration: particle.duration,
                delay: particle.delay,
                ease: "easeOut"
              }
            }}
            exit={{ opacity: 0, scale: 0 }}
          />
        ))}
      </AnimatePresence>

      <LogoContainer variants={logoVariants}>
        <Logo
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaFlask />
          <h1>Central Lab</h1>
        </Logo>
        <HospitalName
          animate={{ 
            background: [
              "rgba(255, 255, 255, 0.1)",
              "rgba(59, 130, 246, 0.1)",
              "rgba(255, 255, 255, 0.1)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {t('hospital_name')}
        </HospitalName>
      </LogoContainer>
      
      <Nav>
        <JourneyGroup>
          <JourneyStep to="/app/register">
            <JourneyIcon><FaUserPlus /></JourneyIcon>
            <span>{t('patientRegistration')}</span>
            <GlowingNotificationBadge count={journeyCounts.registration} color="#3b82f6" />
          </JourneyStep>
          <JourneyStep to="/app/phlebotomist">
            <JourneyIcon><FaUserMd /></JourneyIcon>
            <span>{t('phlebotomist')}</span>
            <GlowingNotificationBadge count={journeyCounts.phlebotomy} color="#10b981" />
          </JourneyStep>
          <JourneyStep to="/app/labwork">
            <JourneyIcon><FaVial /></JourneyIcon>
            <span>{t('labwork') || 'Lab Work'}</span>
            <GlowingNotificationBadge count={journeyCounts.labwork} color="#f59e0b" />
          </JourneyStep>
          <JourneyStep to="/app/results">
            <JourneyIcon><FaCheckCircle /></JourneyIcon>
            <span>{t('results') || 'Results'}</span>
            <GlowingNotificationBadge count={journeyCounts.results} color="#ef4444" />
          </JourneyStep>
        </JourneyGroup>
        <NavList>
          {navItems.map((item, index) =>
            (!item.roles || (user && item.roles.includes(user.role))) && (
              <motion.li key={item.to}>
                <NavItem 
                  to={item.to}
                  variants={navItemVariants}
                  initial="initial"
                  animate="animate"
                  custom={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  $indent={item.indent}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavItem>
              </motion.li>
            )
          )}
        </NavList>
        <div>
          <NavList>
            {bottomNavItems.map((item, index) => (
              <motion.li key={item.to}>
                <NavItem 
                  to={item.to}
                  variants={navItemVariants}
                  initial="initial"
                  animate="animate"
                  custom={navItems.length + index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavItem>
              </motion.li>
            ))}
            <motion.li>
              <LogoutButton 
                onClick={handleLogout}
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                custom={navItems.length + bottomNavItems.length}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaSignOutAlt />
                <span>{t('logout')}</span>
              </LogoutButton>
            </motion.li>
          </NavList>
        </div>
      </Nav>
    </SidebarContainer>
  );
};

export default Sidebar;