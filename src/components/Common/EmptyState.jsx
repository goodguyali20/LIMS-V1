import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  min-height: 300px;
`;

const IconContainer = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.isDarkMode 
    ? 'linear-gradient(135deg, rgba(0, 170, 255, 0.1), rgba(0, 255, 136, 0.1))' 
    : 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(59, 130, 246, 0.1))'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    background: ${({ theme }) => theme.isDarkMode 
      ? 'linear-gradient(45deg, #00aaff, #00ff88, #00aaff)' 
      : 'linear-gradient(45deg, #2563eb, #3b82f6, #2563eb)'};
    opacity: 0.3;
    animation: rotate 3s linear infinite;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  svg {
    position: relative;
    z-index: 1;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Title = styled(motion.h3)`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Description = styled(motion.p)`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  max-width: 400px;
  line-height: 1.6;
`;

const ActionButton = styled(motion.button)`
  background: ${({ theme }) => theme.isDarkMode 
    ? 'linear-gradient(135deg, #00aaff, #00ccff)' 
    : 'linear-gradient(135deg, #2563eb, #3b82f6)'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ theme }) => theme.isDarkMode 
    ? theme.shadows.glow.primary 
    : '0 4px 12px rgba(37, 99, 235, 0.3)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.isDarkMode 
      ? `${theme.shadows.hover}, ${theme.shadows.glow.primary}` 
      : '0 8px 25px rgba(37, 99, 235, 0.4)'};
  }
`;

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className
}) => {
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <Container
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <IconContainer variants={iconVariants}>
        <Icon size={32} />
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
  );
};

export default EmptyState; 