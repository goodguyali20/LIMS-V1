import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const PageWrapper = styled(motion.div)`
  width: 100%;
  min-height: 100vh;
`;

const PageTransition = ({ children }) => {
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
        duration: 0.3
      }
    }
  };

  return (
    <PageWrapper
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      {children}
    </PageWrapper>
  );
};

export default PageTransition; 