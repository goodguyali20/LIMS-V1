import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationContainer = styled(motion.div)`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  max-width: 400px;
  width: 100%;
`;

const NotificationCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme, type }) => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.info;
      default: return theme.colors.border;
    }
  }};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.large};
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme, type }) => {
      switch (type) {
        case 'success': return theme.colors.success;
        case 'error': return theme.colors.error;
        case 'warning': return theme.colors.warning;
        case 'info': return theme.colors.info;
        default: return theme.colors.primary;
      }
    }};
  }
`;

const IconContainer = styled.div`
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
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

const Message = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.875rem;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
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
            <Icon className="w-4 h-4" />
          </IconContainer>
          
          <Content>
            <Message>{message}</Message>
          </Content>
          
          {onClose && (
            <CloseButton onClick={onClose}>
              <X className="w-4 h-4" />
            </CloseButton>
          )}
        </NotificationCard>
      </NotificationContainer>
    </AnimatePresence>
  );
};

export default AnimatedNotification; 