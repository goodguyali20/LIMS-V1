import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { X } from 'lucide-react';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.large};
  border: 1px solid ${({ theme }) => theme.colors.border};
  max-width: ${({ size }) => {
    switch (size) {
      case 'sm': return '400px';
      case 'md': return '600px';
      case 'lg': return '800px';
      case 'xl': return '1200px';
      case 'full': return '95vw';
      default: return '600px';
    }
  }};
  max-height: ${({ size }) => size === 'full' ? '95vh' : '90vh'};
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${({ theme }) => theme.colors.surfaceSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    transform: scale(1.1);
  }
`;

const AnimatedModal = ({ 
  isOpen, 
  onClose, 
  children, 
  size = 'md',
  title 
}) => {
  const { theme } = useTheme();

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <ModalContent
            size={size}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                  {title}
                </h2>
              </div>
            )}
            
            <CloseButton onClick={onClose}>
              <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </CloseButton>
            
            {children}
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default AnimatedModal; 