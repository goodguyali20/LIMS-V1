import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  Home, 
  FileText, 
  Users, 
  ClipboardList, 
  FlaskConical, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronRight,
  Bell,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Shield,
  Activity,
  TrendingUp,
  Zap,
  Target,
  Award,
  Star,
  Heart,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share,
  Lock,
  Unlock,
  Key,
  Mail,
  Phone,
  MapPin,
  Globe,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Gauge,
  Timer
} from 'lucide-react';

const SidebarContainer = styled(motion.create('aside'))`
  width: 280px;
  min-width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  overflow-y: auto;
  overflow-x: hidden;
  contain: layout style paint;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const SidebarHeader = styled(motion.create('div'))`
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Logo = styled(motion.create('div'))`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
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

const NavSection = styled(motion.create('nav'))`
  flex: 1;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const NavItem = styled(motion.create(Link))`
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

const LogoutButton = styled(motion.create('button'))`
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
const FloatingParticle = styled(motion.create('div'))`
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
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
`;

const JourneyContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const JourneyTitle = styled.span`
  font-weight: 600;
  color: white;
`;

const JourneyDescription = styled.span`
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
  font-weight: 400;
`;

const JourneyBadge = styled.span`
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'pending': return 'rgba(245, 158, 11, 0.2)';
      case 'completed': return 'rgba(16, 185, 129, 0.2)';
      case 'urgent': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(59, 130, 246, 0.2)';
    }
  }};
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'pending': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'urgent': return '#ef4444';
      default: return '#3b82f6';
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid ${({ $variant }) => {
    switch ($variant) {
      case 'pending': return 'rgba(245, 158, 11, 0.3)';
      case 'completed': return 'rgba(16, 185, 129, 0.3)';
      case 'urgent': return 'rgba(239, 68, 68, 0.3)';
      default: return 'rgba(59, 130, 246, 0.3)';
    }
  }};
`;

const AnimatedGradientText = styled.span`
  background: linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: gradientMove 3s linear infinite;
  @keyframes gradientMove {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
`;

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { settings } = useSettings();
  const [particles, setParticles] = useState([]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Create floating particles
  useEffect(() => {
    const createParticle = () => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
      const particle = {
        id: Math.random(),
        x: Math.random() * 280,
        y: Math.random() * window.innerHeight,
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

  const navItems = useMemo(() => [
    { path: '/app/dashboard', icon: Home, label: t('sidebar.dashboard'), badge: null },
    { path: '/app/orders', icon: FileText, label: t('sidebar.orders'), badge: null },
    { path: '/app/register', icon: Users, label: t('sidebar.patientRegistration'), badge: null },
    { path: '/app/phlebotomy', icon: FlaskConical, label: t('sidebar.phlebotomy'), badge: null },
    { path: '/app/work-queue', icon: ClipboardList, label: t('sidebar.workQueue'), badge: unreadCount > 0 ? unreadCount : null },
    { path: '/app/patient-history', icon: User, label: t('sidebar.patientHistory'), badge: null },
    { path: '/app/quality-control', icon: Shield, label: t('sidebar.qualityControl'), badge: null },
    { path: '/app/inventory', icon: Package, label: t('sidebar.inventory'), badge: null },
  ], [t, unreadCount]);

  const journeySteps = useMemo(() => [
    {
      icon: User,
      title: 'Patient Registration',
      description: 'Register new patients',
      status: 'completed',
      path: '/app/register'
    },
    {
      icon: FileText,
      title: 'Order Creation',
      description: 'Create test orders',
      status: 'completed',
      path: '/app/orders'
    },
    {
      icon: FlaskConical,
      title: 'Sample Collection',
      description: 'Collect samples',
      status: 'pending',
      path: '/app/phlebotomy'
    },
    {
      icon: Shield,
      title: 'Quality Control',
      description: 'Run QC tests',
      status: 'urgent',
      path: '/app/quality-control'
    },
    {
      icon: BarChart3,
      title: 'Result Entry',
      description: 'Enter test results',
      status: 'pending',
      path: '/app/work-queue'
    }
  ], []);

  const containerVariants = {
    hidden: { x: -280 },
    visible: {
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <SidebarContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Floating particles */}
      {particles.map(particle => (
        <FloatingParticle
          key={particle.id}
          color={particle.color}
          style={{
            left: particle.x,
            top: particle.y
          }}
          initial={{ 
            opacity: 0,
            scale: 0
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: -100
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeOut"
          }}
        />
      ))}

      <SidebarHeader variants={itemVariants}>
        <Logo
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="logo-icon">🧪</div>
          SmartLab
        </Logo>
      </SidebarHeader>

      <NavSection variants={itemVariants}>
        {navItems.map((item) => {
          const isGradient =
            item.path === '/app/register' ||
            item.path === '/app/phlebotomy' ||
            item.path === '/app/work-queue';
          return (
            <NavItem
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
              variants={itemVariants}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon size={20} />
              {isGradient ? (
                <AnimatedGradientText>{item.label}</AnimatedGradientText>
              ) : (
                <span>{item.label}</span>
              )}
              {item.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    marginLeft: 'auto'
                  }}
                >
                  {item.badge}
                </motion.span>
              )}
            </NavItem>
          );
        })}
      </NavSection>

      {settings.showWorkflowJourney && (
        <JourneyGroup>
          <motion.h3
            style={{
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              margin: '0 0 1rem 0',
              textAlign: 'center'
            }}
            variants={itemVariants}
          >
            Workflow Journey
          </motion.h3>
          
          {journeySteps.map((step) => (
            <JourneyStep
              key={step.path}
              to={step.path}
              className={location.pathname === step.path ? 'active' : ''}
              variants={itemVariants}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <JourneyIcon>
                <step.icon size={20} />
              </JourneyIcon>
              <JourneyContent>
                <JourneyTitle>{step.title}</JourneyTitle>
                <JourneyDescription>{step.description}</JourneyDescription>
              </JourneyContent>
              <JourneyBadge $variant={step.status}>
                {step.status === 'completed' ? '✓' : 
                 step.status === 'urgent' ? '!' : '⏳'}
              </JourneyBadge>
            </JourneyStep>
          ))}
        </JourneyGroup>
      )}

      <LogoutButton
        onClick={handleLogout}
        variants={itemVariants}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <LogOut size={20} />
        <span>{t('sidebar.logout')}</span>
      </LogoutButton>
    </SidebarContainer>
  );
};

const MemoizedSidebar = React.memo(Sidebar);

export default MemoizedSidebar;