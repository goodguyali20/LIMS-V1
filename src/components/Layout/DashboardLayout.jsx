import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NewSidebar from '../NewSidebar/NewSidebar';
import Header from './Header';
import styles from '../NewSidebar/NewSidebar.module.css';

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
  transition: margin-left 0.3s ease-in-out;
  margin-left: ${({ $sidebarType, $isSidebarOpen }) => {
    if (!$isSidebarOpen) return '0';
    if ($sidebarType === 'new') return '120px';
    if ($sidebarType === 'default') return '280px';
    return '0';
  }};
  width: ${({ $sidebarType, $isSidebarOpen }) => {
    if (!$isSidebarOpen) return '100%';
    if ($sidebarType === 'new') return 'calc(100% - 120px)';
    if ($sidebarType === 'default') return 'calc(100% - 280px)';
    return '100%';
  }};
  
  /* Hide default scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  
  /* Hide default scrollbar for webkit browsers */
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ContentArea = styled.div`
    padding: 2rem;
    padding-top: 1rem;
    flex-grow: 1;
    overflow-x: hidden;
    word-wrap: break-word;
    overflow-wrap: break-word;
`;

const DashboardLayout = () => {
  const [sidebarType, setSidebarType] = useState('new');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleSidebarStyleToggle = () => {
    setSidebarType((prev) => (prev === 'default' ? 'new' : 'default'));
  };

  return (
    <LayoutContainer>
      {sidebarType === 'default' && <Sidebar isSidebarOpen={isSidebarOpen} />}
      {sidebarType === 'new' && <NewSidebar isOpen={isSidebarOpen} />}
      <MainContent $sidebarType={sidebarType} $isSidebarOpen={isSidebarOpen}>
        <Header
          onSidebarToggle={handleSidebarToggle}
          onSidebarStyleToggle={handleSidebarStyleToggle}
          sidebarType={sidebarType}
          isSidebarOpen={isSidebarOpen}
        />
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default DashboardLayout;