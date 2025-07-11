import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
`;

const ContentArea = styled.div`
    padding: 2rem;
    flex-grow: 1;
`;

const DashboardLayout = () => {
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>
        <Header />
        <ContentArea>
          <Outlet /> {/* Child routes like Dashboard, Register, etc., will render here */}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default DashboardLayout;