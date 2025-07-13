import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';

const LayoutContainer = styled(motion.div)`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.isDarkMode 
    ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
    : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
  };
  background-attachment: fixed;
  position: relative;
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
    z-index: 0;
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 1;
  margin-left: 280px;
`;

const ContentArea = styled(motion.div)`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  padding-top: 80px; /* Account for fixed header height */
  position: relative;
  
  /* Custom scrollbar for content area */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  }
  
  @media (max-width: 768px) {
    padding-top: 70px; /* Account for mobile header height */
  }
`;

// Floating background elements
const FloatingElement = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: ${({ color }) => color};
  opacity: 0.1;
  filter: blur(2px);
  pointer-events: none;
  z-index: 0;
`;

const Layout = () => {
  const location = useLocation();

  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const layoutVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  // Create floating background elements
  const floatingElements = [
    { id: 1, size: 100, x: '10%', y: '20%', color: 'rgba(59, 130, 246, 0.3)' },
    { id: 2, size: 150, x: '85%', y: '15%', color: 'rgba(16, 185, 129, 0.3)' },
    { id: 3, size: 80, x: '20%', y: '80%', color: 'rgba(245, 158, 11, 0.3)' },
    { id: 4, size: 120, x: '75%', y: '70%', color: 'rgba(239, 68, 68, 0.3)' },
  ];

  return (
    <LayoutContainer
      variants={layoutVariants}
      initial="initial"
      animate="animate"
    >
      {/* Floating background elements */}
      {floatingElements.map(element => (
        <FloatingElement
          key={element.id}
          color={element.color}
          style={{
            width: element.size,
            height: element.size,
            left: element.x,
            top: element.y,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8 + element.id * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      <Sidebar />
      <MainContent>
        <Header />
        <ContentArea>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout; 