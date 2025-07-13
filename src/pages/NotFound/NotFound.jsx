import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
    background: ${({ theme }) => theme.isDarkMode 
      ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
      : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
    };
    background-attachment: fixed;
`;

const Title = styled.h1`
    font-size: 6rem;
    color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.p`
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.textSecondary};
`;

const StyledLink = styled(Link)`
    margin-top: 2rem;
    padding: 0.8rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    text-decoration: none;
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
`;

const NotFound = () => {
  return (
    <Container>
        <Title>404</Title>
        <Subtitle>Page Not Found</Subtitle>
        <StyledLink to="/dashboard">Go to Dashboard</StyledLink>
    </Container>
  );
};

export default NotFound;