import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ButtonContainer = styled(motion.create('button'))`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${({ $size }) => {
    switch ($size) {
      case 'sm': return '0.5rem 1rem';
      case 'lg': return '1rem 2rem';
      default: return '0.75rem 1.5rem';
    }
  }};
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'sm': return '0.875rem';
      case 'lg': return '1.125rem';
      default: return '1rem';
    }
  }};
  font-weight: 600;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
      case 'success':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'danger':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'info':
        return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)';
      case 'ghost':
        return 'rgba(255, 255, 255, 0.1)';
      default:
        return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    }
  }};
  color: ${({ $variant }) => $variant === 'ghost' ? 'inherit' : 'white'};
  box-shadow: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return '0 4px 15px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)';
      case 'success':
        return '0 4px 15px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.1)';
      case 'danger':
        return '0 4px 15px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(239, 68, 68, 0.1)';
      case 'warning':
        return '0 4px 15px rgba(245, 158, 11, 0.3), 0 0 0 1px rgba(245, 158, 11, 0.1)';
      case 'info':
        return '0 4px 15px rgba(6, 182, 212, 0.3), 0 0 0 1px rgba(6, 182, 212, 0.1)';
      case 'ghost':
        return '0 2px 8px rgba(0, 0, 0, 0.1)';
      default:
        return '0 4px 15px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)';
    }
  }};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return 'rgba(59, 130, 246, 0.2)';
      case 'success':
        return 'rgba(16, 185, 129, 0.2)';
      case 'danger':
        return 'rgba(239, 68, 68, 0.2)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.2)';
      case 'info':
        return 'rgba(6, 182, 212, 0.2)';
      case 'ghost':
        return 'rgba(255, 255, 255, 0.2)';
      default:
        return 'rgba(59, 130, 246, 0.2)';
    }
  }};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Loading state */
  ${({ $loading }) => $loading && `
    cursor: wait;
    pointer-events: none;
  `}
`;

const RippleEffect = styled(motion.create('div'))`
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
`;

const Particle = styled(motion.create('div'))`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${({ color }) => color};
  border-radius: 50%;
  pointer-events: none;
`;

const LoadingSpinner = styled(motion.create('div'))`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const GlowButton = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className,
  style,
  icon,
  ...props
}) => {
  const [ripples, setRipples] = useState([]);
  const [particles, setParticles] = useState([]);

  const handleClick = (event) => {
    if (disabled || loading) return;

    // Create ripple effect
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const ripple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, ripple]);

    // Create particle effect
    const particleColors = {
      primary: '#3b82f6',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#06b6d4',
      ghost: '#6b7280'
    };

    for (let i = 0; i < 5; i++) {
      const particle = {
        id: Date.now() + i,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        color: particleColors[variant] || particleColors.primary
      };
      setParticles(prev => [...prev, particle]);
    }

    // Clean up effects
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 600);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== particle.id));
    }, 1000);

    if (onClick) onClick(event);
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  const glowVariants = {
    initial: { opacity: 0 },
    hover: { 
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <ButtonContainer
      $variant={variant}
      $size={size}
      $loading={loading}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      style={style}
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <RippleEffect
            key={ripple.id}
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </AnimatePresence>

      {/* Particle effects */}
      <AnimatePresence>
        {particles.map(particle => (
          <Particle
            key={particle.id}
            color={particle.color}
            style={{
              left: particle.x,
              top: particle.y
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 1,
              scale: 1 
            }}
            animate={{ 
              x: (Math.random() - 0.5) * 100,
              y: (Math.random() - 0.5) * 100,
              opacity: 0,
              scale: 0
            }}
            transition={{ 
              duration: 1,
              ease: "easeOut"
            }}
          />
        ))}
      </AnimatePresence>

      {/* Glow effect on hover */}
      <motion.div
        style={{
          position: 'absolute',
          inset: -2,
          borderRadius: 'inherit',
          background: `linear-gradient(135deg, ${variant === 'primary' ? '#3b82f6' : variant === 'success' ? '#10b981' : variant === 'danger' ? '#ef4444' : variant === 'warning' ? '#f59e0b' : variant === 'info' ? '#06b6d4' : '#6b7280'} 0%, transparent 100%)`,
          opacity: 0,
          zIndex: -1,
          filter: 'blur(8px)'
        }}
        variants={glowVariants}
      />

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </ButtonContainer>
  );
};

export default GlowButton; 