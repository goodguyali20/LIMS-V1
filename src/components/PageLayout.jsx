import React from 'react';
import styled from 'styled-components';
import Header from './Header';

const MainContent = styled.main`
  padding: ${({ theme }) => theme.spacing.large};
`;

const PageLayout = ({ children }) => {
  return (
    <div>
      <Header />
      <MainContent>{children}</MainContent>
    </div>
  );
};

export default PageLayout;