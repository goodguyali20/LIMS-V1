import React from 'react';
import styled, { css } from 'styled-components';
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const typeStyles = {
  success: {
    bg: '#22c55e',
    icon: <FaCheckCircle size={20} />,
    blob: '#16a34a',
  },
  error: {
    bg: '#ef4444',
    icon: <FaTimesCircle size={20} />,
    blob: '#b91c1c',
  },
  warning: {
    bg: '#f59e42',
    icon: <FaExclamationCircle size={20} />,
    blob: '#b45309',
  },
  info: {
    bg: '#3b82f6',
    icon: <FaInfoCircle size={20} />,
    blob: '#1d4ed8',
  },
};

const FlashContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  min-width: 280px;
  max-width: 350px;
  padding: 1rem 1.5rem 1rem 1rem;
  border-radius: 1.5rem;
  box-shadow: 0 4px 16px #0002, 0 2px 4px #0001;
  position: relative;
  background: ${({ $type }) => typeStyles[$type]?.bg || '#3b82f6'};
  color: white;
  overflow: hidden;
  margin: 0.25rem 0;
`;

const Blob = styled.div`
  position: absolute;
  left: -30px;
  top: -20px;
  width: 80px;
  height: 80px;
  background: ${({ $type }) => typeStyles[$type]?.blob || '#1d4ed8'};
  border-radius: 50% 40% 60% 50% / 60% 50% 40% 50%;
  opacity: 0.18;
  filter: blur(2px);
  z-index: 0;
`;

const IconCircle = styled.div`
  min-width: 32px;
  min-height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.13);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  z-index: 1;
  box-shadow: 0 2px 8px #0002;
`;

const Content = styled.div`
  flex: 1;
  z-index: 1;
`;

const Title = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
`;

const Message = styled.div`
  font-size: 0.875rem;
  opacity: 0.92;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.7;
  z-index: 2;
  transition: opacity 0.2s;
  &:hover {
    opacity: 1;
  }
`;

const FlashMessage = ({ type = 'info', title, message, onClose }) => (
  <FlashContainer $type={type}>
    <Blob $type={type} />
    <IconCircle>{typeStyles[type]?.icon}</IconCircle>
    <Content>
      <Title>{title}</Title>
      <Message>{message}</Message>
    </Content>
    <CloseBtn onClick={onClose} aria-label="Close notification">
      <FaTimes />
    </CloseBtn>
  </FlashContainer>
);

// Add a wrapper for stacking notifications in the top right
export const FlashMessageWrapper = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
  width: auto;
  max-width: 100vw;
`;

export default FlashMessage; 