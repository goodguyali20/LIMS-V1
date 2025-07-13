import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const Container = styled(motion.create('div'))`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const IconContainer = styled(motion.create('div'))`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 2rem;
`;

const Title = styled(motion.create('h3'))`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const EmptyState = ({ 
  icon = '📋', 
  title = 'No Data Available', 
  description = 'There are no items to display at the moment.',
  action = null 
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <Container
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <IconContainer
        variants={itemVariants}
        whileHover={{ 
          scale: 1.1,
          rotate: 5
        }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </IconContainer>
      
      <Title variants={itemVariants}>
        {title}
      </Title>
      
      <motion.p
        variants={itemVariants}
        style={{
          fontSize: '1rem',
          lineHeight: '1.5',
          maxWidth: '400px',
          marginBottom: action ? '1.5rem' : '0'
        }}
      >
        {description}
      </motion.p>
      
      {action && (
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action}
        </motion.div>
      )}
    </Container>
  );
};

export default EmptyState; 