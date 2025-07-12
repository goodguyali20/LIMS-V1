import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { 
    transform: rotate(0deg); 
  }
  100% { 
    transform: rotate(360deg); 
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh; /* Full viewport height */
  width: 100%;
  flex-direction: column;
  gap: 1.5rem;
`;

const Spinner = styled.div`
  border: 6px solid ${({ theme }) => theme.colors.border};
  border-top: 6px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1.2s linear infinite;
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: 1px;
`;

const PageLoader = () => {
  return (
    <LoaderContainer>
      <Spinner />
      <LoadingText>Loading...</LoadingText>
    </LoaderContainer>
  );
};

export default PageLoader;