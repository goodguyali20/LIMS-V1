import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFlask, FaAtom, FaRocket } from 'react-icons/fa';

const LoaderContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const LogoContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
`;

const LogoIcon = styled(motion.div)`
  font-size: 3rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5));
`;

const LogoText = styled(motion.h1)`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3));
`;

const LoadingText = styled(motion.p)`
  font-size: 1.125rem;
  color: #cbd5e1;
  margin: 0 0 2rem 0;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const ProgressContainer = styled(motion.div)`
  width: 300px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #10b981 100%);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmer 1.5s infinite;
  }
`;

const SpinnerContainer = styled(motion.div)`
  position: relative;
  width: 80px;
  height: 80px;
  margin: 2rem 0;
`;

const SpinnerRing = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  
  &:nth-child(2) {
    border-top-color: #10b981;
    animation-delay: -0.3s;
  }
  
  &:nth-child(3) {
    border-top-color: #f59e0b;
    animation-delay: -0.6s;
  }
`;

const Particle = styled(motion.div)`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${({ color }) => color};
  border-radius: 50%;
  pointer-events: none;
  filter: blur(1px);
`;

const FloatingIcon = styled(motion.div)`
  position: absolute;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.3);
  pointer-events: none;
`;

const StatusMessage = styled(motion.div)`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
  z-index: 2;
`;

const PageLoader = ({ 
  message = "Loading Central Lab System...", 
  status = "Initializing components...",
  progress = 0 
}) => {
  const [particles, setParticles] = useState([]);
  const [floatingIcons, setFloatingIcons] = useState([]);

  // Create floating particles
  useEffect(() => {
    const createParticle = () => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
      const particle = {
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
      };
      setParticles(prev => [...prev, particle]);
      
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== particle.id));
      }, particle.duration * 1000);
    };

    const interval = setInterval(createParticle, 1000);
    return () => clearInterval(interval);
  }, []);

  // Create floating icons
  useEffect(() => {
    const icons = [FaFlask, FaAtom, FaRocket];
    const createIcon = () => {
      const icon = {
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        Icon: icons[Math.floor(Math.random() * icons.length)],
        delay: Math.random() * 2,
        duration: 4 + Math.random() * 3,
      };
      setFloatingIcons(prev => [...prev, icon]);
      
      setTimeout(() => {
        setFloatingIcons(prev => prev.filter(i => i.id !== icon.id));
      }, icon.duration * 1000);
    };

    const interval = setInterval(createIcon, 2000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const logoVariants = {
    initial: { opacity: 0, scale: 0.5, y: 50 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.3
      }
    }
  };

  const progressVariants = {
    initial: { scaleX: 0 },
    animate: { 
      scaleX: progress / 100,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <LoaderContainer
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Floating particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <Particle
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

      {/* Floating icons */}
      <AnimatePresence>
        {floatingIcons.map(icon => (
          <FloatingIcon
            key={icon.id}
            style={{
              left: icon.x,
              top: icon.y
            }}
            initial={{ 
              opacity: 0,
              scale: 0,
              rotate: 0
            }}
            animate={{ 
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
              rotate: 360,
              y: -50,
              transition: {
                duration: icon.duration,
                delay: icon.delay,
                ease: "easeOut"
              }
            }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <icon.Icon />
          </FloatingIcon>
        ))}
      </AnimatePresence>

      {/* Logo */}
      <LogoContainer variants={logoVariants}>
        <LogoIcon
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <FaFlask />
        </LogoIcon>
        <LogoText>{message}</LogoText>
      </LogoContainer>

      {/* Loading text */}
      <LoadingText variants={textVariants}>
        {status}
      </LoadingText>

      {/* Progress bar */}
      <ProgressContainer variants={textVariants}>
        <ProgressBar
          variants={progressVariants}
          initial="initial"
          animate="animate"
        />
      </ProgressContainer>

      {/* Spinner */}
      <SpinnerContainer variants={textVariants}>
        <SpinnerRing
          variants={spinnerVariants}
          animate="animate"
        />
        <SpinnerRing
          variants={spinnerVariants}
          animate="animate"
          style={{ width: '60px', height: '60px', top: '10px', left: '10px' }}
        />
        <SpinnerRing
          variants={spinnerVariants}
          animate="animate"
          style={{ width: '40px', height: '40px', top: '20px', left: '20px' }}
        />
      </SpinnerContainer>

      {/* Status message */}
      <StatusMessage variants={textVariants}>
        {progress}% Complete
      </StatusMessage>
    </LoaderContainer>
  );
};

export default PageLoader;