import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const LoaderContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  gap: 2rem;
`;

const LogoContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const LogoIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
`;

const LogoText = styled(motion.h1)`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const LoadingText = styled(motion.p)`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const ProgressContainer = styled(motion.div)`
  width: 200px;
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
  position: relative;
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 2px;
  position: absolute;
  top: 0;
  left: 0;
`;

const SpinnerContainer = styled(motion.div)`
  position: relative;
  width: 40px;
  height: 40px;
`;

const SpinnerRing = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
`;

const Particle = styled(motion.div)`
  position: absolute;
  width: 4px;
  height: 4px;
  background: #3b82f6;
  border-radius: 50%;
  pointer-events: none;
`;

const FloatingIcon = styled(motion.div)`
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.6;
  pointer-events: none;
`;

const StatusMessage = styled(motion.div)`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  max-width: 300px;
`;

const PageLoader = ({ 
  message = "Loading SmartLab LIMS...", 
  status = "Initializing application",
  progress = 0 
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, rotate: -10 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const progressVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: progress / 100,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <LoaderContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <LogoContainer variants={itemVariants}>
        <LogoIcon
          variants={logoVariants}
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          🧪
        </LogoIcon>
        <LogoText variants={itemVariants}>
          SmartLab LIMS
        </LogoText>
      </LogoContainer>

      <LoadingText variants={itemVariants}>
        {message}
      </LoadingText>

      <ProgressContainer variants={itemVariants}>
        <ProgressBar
          variants={progressVariants}
          initial="hidden"
          animate="visible"
        />
      </ProgressContainer>

      <StatusMessage variants={itemVariants}>
        {status}
      </StatusMessage>

      <SpinnerContainer variants={itemVariants}>
        <SpinnerRing
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </SpinnerContainer>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <Particle
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
            scale: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Floating icons */}
      {['🧪', '🔬', '📊', '📋'].map((icon, i) => (
        <FloatingIcon
          key={icon}
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
            scale: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeInOut"
          }}
        >
          {icon}
        </FloatingIcon>
      ))}
    </LoaderContainer>
  );
};

export default PageLoader;