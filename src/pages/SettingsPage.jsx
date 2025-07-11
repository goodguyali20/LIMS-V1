import React from 'react';
import UserManagement from '../components/UserManagement.jsx';
import TestManagement from '../components/TestManagement.jsx';
import LabSettings from '../components/LabSettings.jsx'; // Import the new component
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
  ${({ theme }) => theme.squircle(24)};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

// A new full-width box for the new component
const FullWidthContentBox = styled(ContentBox)`
    grid-column: 1 / -1;
`;

const SettingsPage = () => {
  return (
    <div className="fade-in">
      <PageHeader>
        <PageTitle>System Settings</PageTitle>
      </PageHeader>
      <SettingsLayout>
        <FullWidthContentBox>
            <LabSettings />
        </FullWidthContentBox>
        <ContentBox>
          <TestManagement />
        </ContentBox>
        <ContentBox>
          <UserManagement />
        </ContentBox>
      </SettingsLayout>
    </div>
  );
};

export default SettingsPage;