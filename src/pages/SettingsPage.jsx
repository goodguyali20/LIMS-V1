import React from 'react';
import UserManagement from '../components/UserManagement.jsx';
import TestManagement from '../components/TestManagement.jsx';
import styled from 'styled-components';

//--- STYLED COMPONENTS ---//
const PageHeader = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
`;

const SettingsLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ContentBox = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const SettingsPage = () => {
  return (
    <>
      <PageHeader>
        <PageTitle>System Settings</PageTitle>
      </PageHeader>
      <SettingsLayout>
        <ContentBox>
          <TestManagement />
        </ContentBox>
        <ContentBox>
          <UserManagement />
        </ContentBox>
      </SettingsLayout>
    </>
  );
};

export default SettingsPage;