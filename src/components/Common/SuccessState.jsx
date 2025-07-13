import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: ${({ theme }) => theme.isDarkMode 
    ? 'rgba(0, 255, 136, 0.05)' 
    : 'rgba(16, 185, 129, 0.05)'};
  border: 1px solid ${({ theme }) => theme.isDarkMode 
    ? 'rgba(0, 255, 136, 0.2)' 
    : 'rgba(16, 185, 129, 0.2)'};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.isDarkMode 
      ? 'radial-gradient(circle at center, rgba(0, 255, 136, 0.1) 0%, transparent 70%)' 
      : 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'};
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
`;

const IconContainer = styled(motion.div)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ theme }) => theme.isDarkMode 
    ? 'linear-gradient(135deg, #00ff88, #00d4aa)' 
    : 'linear-gradient(135deg, #10b981, #059669)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    background: ${({ theme }) => theme.isDarkMode 
      ? 'linear-gradient(45deg, #00ff88, #00d4aa, #00ff88)' 
      : 'linear-gradient(45deg, #10b981, #059669, #10b981)'};
    opacity: 0.3;
    animation: rotate 3s linear infinite;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  svg {
    color: white;
    position: relative;
    z-index: 1;
  }
`;

const Title = styled(motion.h3)`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.isDarkMode ? '#00ff88' : '#10b981'};
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const Description = styled(motion.p)`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
`;

const ActionButton = styled(motion.button)`
  background: ${({ theme }) => theme.isDarkMode 
    ? 'linear-gradient(135deg, #00ff88, #00d4aa)' 
    : 'linear-gradient(135deg, #10b981, #059669)'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ theme }) => theme.isDarkMode 
    ? theme.shadows.glow.success 
    : '0 4px 12px rgba(16, 185, 129, 0.3)'};
  position: relative;
  z-index: 1;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.isDarkMode 
      ? `${theme.shadows.hover}, ${theme.shadows.glow.success}` 
      : '0 8px 25px rgba(16, 185, 129, 0.4)'};
  }
`;

const SuccessState = ({
  title,
  description,
  actionText,
  onAction,
  show = true,
  className
}) => {
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        type: "spring",
        stiffness: 200
      }
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <Container
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={className}
        >
          <IconContainer variants={iconVariants}>
            <FiCheckCircle size={28} />
          </IconContainer>
          
          <Title variants={itemVariants}>
            {title}
          </Title>
          
          <Description variants={itemVariants}>
            {description}
          </Description>
          
          {actionText && onAction && (
            <ActionButton
              onClick={onAction}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {actionText}
            </ActionButton>
          )}
        </Container>
      )}
    </AnimatePresence>
  );
};

export default SuccessState; 