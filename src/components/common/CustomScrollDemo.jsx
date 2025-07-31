import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import CustomScroll from './CustomScrollbar';

const DemoContainer = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: 100vh;
`;

const DemoSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const DemoTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1rem;
`;

const ScrollArea = styled.div`
  height: 300px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
`;

const ContentItem = styled(motion.div)`
  padding: 1rem;
  margin: 0.5rem 0;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  &:nth-child(odd) {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const CustomScrollDemo = () => {
  const generateContent = (count = 20) => {
    return Array.from({ length: count }, (_, i) => (
      <ContentItem
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
      >
        <h3>Item {i + 1}</h3>
        <p>This is content item number {i + 1}. It demonstrates the custom scrolling functionality with smooth animations and modern styling.</p>
        <small>Scroll to see more items...</small>
      </ContentItem>
    ));
  };

  const longContent = generateContent(50);

  return (
    <DemoContainer>
      <DemoTitle>Custom Scroll Component Demo</DemoTitle>
      
      <DemoSection>
        <DemoTitle>Basic Custom Scroll</DemoTitle>
        <ScrollArea>
          <CustomScroll>
            {generateContent(15)}
          </CustomScroll>
        </ScrollArea>
      </DemoSection>

      <DemoSection>
        <DemoTitle>Custom Scroll with Progress Bar</DemoTitle>
        <ScrollArea>
          <CustomScroll showProgressBar={true}>
            {generateContent(20)}
          </CustomScroll>
        </ScrollArea>
      </DemoSection>

      <DemoSection>
        <DemoTitle>Custom Scroll with Scroll Indicators</DemoTitle>
        <ScrollArea>
          <CustomScroll showScrollIndicator={true}>
            {generateContent(25)}
          </CustomScroll>
        </ScrollArea>
      </DemoSection>

      <DemoSection>
        <DemoTitle>Full Featured Custom Scroll</DemoTitle>
        <ScrollArea>
          <CustomScroll 
            showProgressBar={true}
            showScrollIndicator={true}
            scrollSnap={false}
          >
            {longContent}
          </CustomScroll>
        </ScrollArea>
      </DemoSection>

      <DemoSection>
        <DemoTitle>Scroll with Snap Points</DemoTitle>
        <ScrollArea>
          <CustomScroll 
            showProgressBar={true}
            scrollSnap={true}
          >
            {generateContent(10).map((item, index) => (
              <div key={index} style={{ scrollSnapAlign: 'start', minHeight: '200px' }}>
                {item}
              </div>
            ))}
          </CustomScroll>
        </ScrollArea>
      </DemoSection>
    </DemoContainer>
  );
};

export default CustomScrollDemo; 