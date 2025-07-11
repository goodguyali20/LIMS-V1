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
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    text-decoration: none;
    border-radius: ${({ theme }) => theme.shapes.squircle};
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