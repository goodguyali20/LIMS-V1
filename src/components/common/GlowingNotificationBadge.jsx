import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7), 0 0 8px 2px rgba(59, 130, 246, 0.3);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0), 0 0 16px 4px rgba(59, 130, 246, 0.4);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7), 0 0 8px 2px rgba(59, 130, 246, 0.3);
  }
`;

const Badge = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  min-height: 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 50%;
  background: ${({ color }) => color || '#2563eb'};
  color: #fff;
  box-shadow: 0 0 8px 2px rgba(59, 130, 246, 0.3);
  position: relative;
  z-index: 1;
  border: 2px solid #fff2;
  transition: box-shadow 0.3s;
  ${({ pulse }) =>
    pulse &&
    css`
      animation: ${pulseGlow} 1.5s infinite;
    `}
`;

const GlowingNotificationBadge = ({ count, color, pulse }) => {
  if (count === undefined || count === null) return null;
  return (
    <Badge
      color={color}
      pulse={pulse || count > 0}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {count}
    </Badge>
  );
};

export default GlowingNotificationBadge; 