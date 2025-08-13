import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationContainer = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 320px;
`;

const NotificationCard = styled(motion.div)`
  background: ${({ theme, type }) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const IconContainer = styled.div`
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${({ theme, type }) => {
    switch (type) {
      case 'success': return `${theme.colors.success}20`;
      case 'error': return `${theme.colors.error}20`;
      case 'warning': return `${theme.colors.warning}20`;
      case 'info': return `${theme.colors.info}20`;
      default: return `${theme.colors.primary}20`;
    }
  }};
  color: ${({ theme, type }) => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.info;
      default: return theme.colors.primary;
    }
  }};
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Message = styled('p')`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.8rem;
  line-height: 1.3;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const getIcon = (type, customIcon) => {
  if (customIcon) return customIcon;
  
  switch (type) {
    case 'success': return CheckCircle;
    case 'error': return AlertCircle;
    case 'warning': return AlertTriangle;
    case 'info': return Info;
    default: return Info;
  }
};

const AnimatedNotification = ({
  type = 'info',
  message,
  icon: customIcon,
  onClose,
  duration = 5000
}) => {
  const { theme } = useTheme();
  const Icon = getIcon(type, customIcon);

  React.useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const notificationVariants = {
    hidden: { 
      opacity: 0, 
      x: 300, 
      scale: 0.8 
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      x: 300, 
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      <NotificationContainer
        variants={notificationVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <NotificationCard type={type}>
          <IconContainer type={type}>
            <Icon className="w-3 h-3" />
          </IconContainer>
          
          <Content>
            <Message>{message}</Message>
          </Content>
          
          {onClose && (
            <CloseButton onClick={onClose}>
              <X className="w-3 h-3" />
            </CloseButton>
          )}
        </NotificationCard>
      </NotificationContainer>
    </AnimatePresence>
  );
};

export default AnimatedNotification; 