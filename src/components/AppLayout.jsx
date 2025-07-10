import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar.jsx';
import AppHeader from './AppHeader.jsx';

const LayoutContainer = styled.div`
  display: flex;
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  margin-left: ${({ theme }) => (theme.isRTL ? '0' : '280px')};
  margin-right: ${({ theme }) => (theme.isRTL ? '280px' : '0')};
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  padding: 32px;
  height: 100vh;
  overflow-y: auto;
`;

const AppLayout = ({ children }) => {
  return (
    <LayoutContainer>
      <Sidebar />
      <ContentWrapper>
        <MainContent>
            <AppHeader />
            {children}
        </MainContent>
      </ContentWrapper>
    </LayoutContainer>
  );
};

export default AppLayout;