import React, { useState, useEffect } from 'react';
import styled, { DefaultTheme } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes, FaBell } from 'react-icons/fa';

interface NotificationContainerProps {
  $type: 'success' | 'error' | 'warning' | 'info';
}

const StyledNotificationContainer = styled(motion.div)<NotificationContainerProps>`
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 320px;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1rem;
  z-index: 9999;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  
  /* Gradient background overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ $type }: { $type: 'success' | 'error' | 'warning' | 'info' }) => {
      switch ($type) {
        case 'success':
          return 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)';
        case 'error':
          return 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)';
        case 'warning':
          return 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)';
        case 'info':
          return 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)';
        default:
          return 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)';
      }
    }};
    opacity: 0.5;
    z-index: -1;
  }

  /* Shimmer effect */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover::after {
    left: 100%;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

interface IconContainerProps {
  $type: 'success' | 'error' | 'warning' | 'info';
}

const IconContainer = styled(motion.div)<IconContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $type }: { $type: 'success' | 'error' | 'warning' | 'info' }) => {
    switch ($type) {
      case 'success':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'error':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'info':
        return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
      default:
        return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    }
  }};
  color: white;
  font-size: 1.2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: spin 3s linear infinite;
  }
  
  svg {
    position: relative;
    z-index: 1;
  }
`;

const Title = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  flex: 1;
  margin-left: 0.75rem;
`;

const CloseButton = styled(motion.button)`
  background: none;
  border: none;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textSecondary};
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
    transform: scale(1.1);
  }
`;

const Message = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

interface ProgressBarProps {
  $type: 'success' | 'error' | 'warning' | 'info';
}

const ProgressBar = styled(motion.div)<ProgressBarProps>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${({ $type }: { $type: 'success' | 'error' | 'warning' | 'info' }) => {
    switch ($type) {
      case 'success':
        return 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
      case 'error':
        return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
      case 'warning':
        return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
      case 'info':
        return 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)';
      default:
        return 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)';
    }
  }};
  border-radius: 0 0 16px 16px;
`;

const Particle = styled(motion.div)<{ color: string }>`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${({ color }: { color: string }) => color};
  border-radius: 50%;
  pointer-events: none;
  filter: blur(1px);
`;

interface AnimatedNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  autoClose?: boolean;
}

const AnimatedNotification: React.FC<AnimatedNotificationProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  autoClose = true
}) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
  }>>([]);
  const [progress, setProgress] = useState(100);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheck />;
      case 'error':
        return <FaExclamationTriangle />;
      case 'warning':
        return <FaExclamationTriangle />;
      case 'info':
        return <FaInfoCircle />;
      default:
        return <FaBell />;
    }
  };

  const getParticleColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#3b82f6';
    }
  };

  // Create particle effect on mount
  useEffect(() => {
    const particleColor = getParticleColor();
    for (let i = 0; i < 5; i++) {
      const particle = {
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: particleColor
      };
      setParticles(prev => [...prev, particle]);
    }

    // Clean up particles
    setTimeout(() => {
      setParticles([]);
    }, 1000);
  }, []);

  // Auto close functionality
  useEffect(() => {
    if (!autoClose) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        onClose?.();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, autoClose, onClose]);

  const notificationVariants = {
    initial: { 
      opacity: 0, 
      x: 300, 
      scale: 0.8,
      rotateY: 90
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      x: 300, 
      scale: 0.8,
      rotateY: -90,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }
    }
  };

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        delay: 0.3
      }
    }
  };

  return (
    <StyledNotificationContainer
      $type={type}
      variants={notificationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Floating particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <Particle
            key={particle.id}
            color={particle.color}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`
            }}
            initial={{ 
              opacity: 0,
              scale: 0 
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: -20
            }}
            transition={{ 
              duration: 1,
              ease: "easeOut"
            }}
            exit={{ opacity: 0, scale: 0 }}
          />
        ))}
      </AnimatePresence>

      <NotificationHeader>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <IconContainer
            $type={type}
            variants={iconVariants}
            initial="initial"
            animate="animate"
          >
            {getIcon()}
          </IconContainer>
          <Title>{title}</Title>
        </div>
        <CloseButton
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaTimes />
        </CloseButton>
      </NotificationHeader>

      <motion.div
        variants={contentVariants}
        initial="initial"
        animate="animate"
      >
        <Message>{message}</Message>
      </motion.div>

      {/* Progress bar */}
      {autoClose && (
        <ProgressBar
          $type={type}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      )}
    </StyledNotificationContainer>
  );
};

export default AnimatedNotification; 