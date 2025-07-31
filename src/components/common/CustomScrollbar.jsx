import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollContainer = styled.div`
  position: relative;
  overflow: hidden;
  height: 100%;
  width: 100%;
`;

const ScrollContent = styled.div`
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  
  /* Hide default scrollbar for webkit browsers */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Smooth scrolling */
  scroll-behavior: smooth;
  
  /* Custom scroll snap if needed */
  scroll-snap-type: y proximity;
`;

const CustomScrollbar = styled(motion.div)`
  position: absolute;
  top: 0;
  right: 4px;
  width: 6px;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  z-index: 10;
`;

const ScrollThumb = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scaleX(1.3);
  }
`;

const ScrollIndicator = styled(motion.div)`
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  z-index: 20;
  
  &:hover {
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }
`;

const ScrollProgress = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform-origin: left;
  z-index: 30;
`;

const CustomScroll = ({ 
  children, 
  height = '100%', 
  showScrollIndicator = true,
  showProgressBar = true,
  scrollSnap = false,
  className = '',
  ...props 
}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showScrollbar, setShowScrollbar] = useState(false);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const updateScrollInfo = () => {
      setScrollTop(content.scrollTop);
      setScrollHeight(content.scrollHeight);
      setClientHeight(content.clientHeight);
    };

    const handleScroll = () => {
      updateScrollInfo();
      setIsScrolling(true);
      
      // Hide scrollbar after scrolling stops
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1500);
    };

    const scrollTimeout = { current: null };
    
    content.addEventListener('scroll', handleScroll);
    updateScrollInfo();

    // Resize observer for dynamic content
    const resizeObserver = new ResizeObserver(() => {
      updateScrollInfo();
    });
    resizeObserver.observe(content);

    return () => {
      content.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // Show scrollbar on hover
    const handleMouseEnter = () => {
      if (scrollHeight > clientHeight) {
        setShowScrollbar(true);
      }
    };

    const handleMouseLeave = () => {
      if (!isScrolling) {
        setShowScrollbar(false);
      }
    };

    content.addEventListener('mouseenter', handleMouseEnter);
    content.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      content.removeEventListener('mouseenter', handleMouseEnter);
      content.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [scrollHeight, clientHeight, isScrolling]);

  const handleScrollToTop = () => {
    contentRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleScrollToBottom = () => {
    contentRef.current?.scrollTo({
      top: scrollHeight - clientHeight,
      behavior: 'smooth'
    });
  };

  const handleThumbClick = (e) => {
    const scrollbar = e.currentTarget;
    const rect = scrollbar.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const scrollbarHeight = rect.height;
    const scrollRatio = clickY / scrollbarHeight;
    const newScrollTop = scrollRatio * (scrollHeight - clientHeight);
    
    contentRef.current?.scrollTo({
      top: newScrollTop,
      behavior: 'smooth'
    });
  };

  const scrollProgress = scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0;
  const thumbHeight = Math.max((clientHeight / scrollHeight) * 100, 10);
  const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (100 - thumbHeight);

  return (
    <ScrollContainer 
      ref={containerRef}
      style={{ height }}
      className={className}
      {...props}
    >
      <ScrollContent 
        ref={contentRef}
        style={{ 
          scrollSnapType: scrollSnap ? 'y proximity' : 'none'
        }}
      >
        {children}
      </ScrollContent>

      {/* Custom Scrollbar */}
      <AnimatePresence>
        {showScrollbar && scrollHeight > clientHeight && (
          <CustomScrollbar
            initial={{ opacity: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <ScrollThumb
              style={{
                height: `${thumbHeight}%`,
                top: `${thumbTop}%`
              }}
              onClick={handleThumbClick}
              whileHover={{ scaleX: 1.3 }}
              whileTap={{ scale: 0.95 }}
            />
          </CustomScrollbar>
        )}
      </AnimatePresence>

      {/* Scroll Progress Bar */}
      {showProgressBar && scrollHeight > clientHeight && (
        <ScrollProgress
          style={{
            transform: `scaleX(${scrollProgress / 100})`
          }}
        />
      )}

      {/* Scroll Indicators */}
      {showScrollIndicator && scrollHeight > clientHeight && (
        <>
          <AnimatePresence>
            {scrollTop > 100 && (
              <ScrollIndicator
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleScrollToTop}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Scroll to top"
              >
                ↑
              </ScrollIndicator>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {scrollTop < scrollHeight - clientHeight - 100 && (
              <ScrollIndicator
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleScrollToBottom}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Scroll to bottom"
                style={{
                  top: 'auto',
                  bottom: '20px'
                }}
              >
                ↓
              </ScrollIndicator>
            )}
          </AnimatePresence>
        </>
      )}
    </ScrollContainer>
  );
};

export default CustomScroll; 