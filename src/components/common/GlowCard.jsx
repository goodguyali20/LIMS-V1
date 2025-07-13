import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const CardContainer = styled(motion.div)`
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: ${({ padding }) => padding || '1.5rem'};
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: ${({ clickable }) => clickable ? 'pointer' : 'default'};
  
  /* Gradient background overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ variant }) => {
      switch (variant) {
        case 'primary':
          return 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)';
        case 'success':
          return 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)';
        case 'danger':
          return 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)';
        case 'warning':
          return 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)';
        case 'info':
          return 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)';
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

  /* Hover effects */
  &:hover {
    transform: ${({ clickable }) => clickable ? 'translateY(-8px) scale(1.02)' : 'none'};
    box-shadow: ${({ variant, clickable }) => {
      if (!clickable) return 'none';
      
      switch (variant) {
        case 'primary':
          return '0 20px 40px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.1)';
        case 'success':
          return '0 20px 40px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.1)';
        case 'danger':
          return '0 20px 40px rgba(239, 68, 68, 0.2), 0 0 0 1px rgba(239, 68, 68, 0.1)';
        case 'warning':
          return '0 20px 40px rgba(245, 158, 11, 0.2), 0 0 0 1px rgba(245, 158, 11, 0.1)';
        case 'info':
          return '0 20px 40px rgba(6, 182, 212, 0.2), 0 0 0 1px rgba(6, 182, 212, 0.1)';
        default:
          return '0 20px 40px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)';
      }
    }};
  }

  /* Active state */
  &:active {
    transform: ${({ clickable }) => clickable ? 'translateY(-4px) scale(1.01)' : 'none'};
  }

  /* Focus styles */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
`;

const CardHeader = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardTitle = styled(motion.h3)`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CardSubtitle = styled(motion.p)`
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.8;
`;

const CardContent = styled(motion.div)`
  position: relative;
  z-index: 1;
`;

const CardFooter = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const FloatingParticle = styled(motion.div)`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${({ color }) => color};
  border-radius: 50%;
  pointer-events: none;
  filter: blur(1px);
`;

const StatusIndicator = styled(motion.div)`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ status }) => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'danger':
        return '#ef4444';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  }};
  box-shadow: 0 0 10px ${({ status }) => {
    switch (status) {
      case 'success':
        return 'rgba(16, 185, 129, 0.5)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.5)';
      case 'danger':
        return 'rgba(239, 68, 68, 0.5)';
      case 'info':
        return 'rgba(59, 130, 246, 0.5)';
      default:
        return 'rgba(107, 114, 128, 0.5)';
    }
  }};
`;

const GlowCard = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding,
  clickable = false,
  onClick,
  className,
  style,
  status,
  icon,
  footer,
  animate = true,
  ...props
}) => {
  const [particles, setParticles] = useState([]);

  const handleClick = () => {
    if (!clickable || !onClick) return;

    // Create particle effect on click
    const particleColors = {
      primary: '#3b82f6',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#06b6d4',
      default: '#6b7280'
    };

    for (let i = 0; i < 3; i++) {
      const particle = {
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: particleColors[variant] || particleColors.default
      };
      setParticles(prev => [...prev, particle]);
    }

    // Clean up particles
    setTimeout(() => {
      setParticles(prev => prev.slice(3));
    }, 1000);

    onClick();
  };

  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: clickable ? {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    } : {},
    tap: clickable ? {
      y: -4,
      scale: 1.01,
      transition: {
        duration: 0.1
      }
    } : {}
  };

  const contentVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: 0.2
      }
    }
  };

  return (
    <CardContainer
      variant={variant}
      padding={padding}
      clickable={clickable}
      onClick={handleClick}
      className={className}
      style={style}
      variants={cardVariants}
      initial={animate ? "initial" : false}
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {/* Floating particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <FloatingParticle
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

      {/* Header */}
      {(title || icon || status) && (
        <CardHeader>
          <div>
            {title && (
              <CardTitle
                variants={contentVariants}
                initial="initial"
                animate="animate"
              >
                {icon && <span style={{ marginRight: '0.5rem' }}>{icon}</span>}
                {title}
              </CardTitle>
            )}
            {subtitle && (
              <CardSubtitle
                variants={contentVariants}
                initial="initial"
                animate="animate"
              >
                {subtitle}
              </CardSubtitle>
            )}
          </div>
          {status && (
            <StatusIndicator
              status={status}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </CardHeader>
      )}

      {/* Content */}
      <CardContent
        variants={contentVariants}
        initial="initial"
        animate="animate"
      >
        {children}
      </CardContent>

      {/* Footer */}
      {footer && (
        <CardFooter
          variants={contentVariants}
          initial="initial"
          animate="animate"
        >
          {footer}
        </CardFooter>
      )}
    </CardContainer>
  );
};

export default GlowCard; 