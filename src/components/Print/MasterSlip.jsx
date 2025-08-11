import React from 'react';
import styled from 'styled-components';
// import QRCode from 'qrcode.react'; // Uncomment if using QR/barcode
// import logo from '../../assets/logo.png'; // Placeholder for logo
import { useTranslation } from 'react-i18next';

const Wrapper = styled.div`
  width: 210mm;
  min-height: 297mm;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #1e293b;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
  margin: 0 auto;
  padding: 2.5rem 2rem 2rem 2rem;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  
  @media print {
    box-shadow: none;
    margin: 0;
    border-radius: 0;
    width: 100vw;
    min-height: 100vh;
    padding: 1rem 0.8rem 0.8rem 0.8rem;
    background: white;
  }
`;

const Watermark = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-20deg);
  font-size: 5rem;
  color: #e2e8f0;
  opacity: 0.08;
  pointer-events: none;
  user-select: none;
  z-index: 0;
  font-weight: 900;
  letter-spacing: 0.3em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3px solid #3b82f6;
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
  margin: -2.5rem -2rem 2rem -2rem;
  padding: 2rem 2rem 1.5rem 2rem;
  border-radius: 16px 16px 0 0;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2rem;
  font-weight: 900;
  color: #3b82f6;
  text-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
  
  > div {
    padding: 0.25rem 0;
    border-bottom: 1px solid rgba(100, 116, 139, 0.1);
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const Section = styled.section`
  margin-bottom: 2rem;
  z-index: 2;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #3b82f6;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 2px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.5rem;
  font-size: 1rem;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }
  
  strong {
    color: #1e293b;
    font-weight: 700;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 1rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  
  th, td {
    border: 1px solid #e2e8f0;
    padding: 0.75rem 1rem;
    text-align: left;
  }
  
  th {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  tr:nth-child(even) {
    background: #f8fafc;
  }
  
  tr:hover {
    background: #f1f5f9;
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #64748b;
  z-index: 2;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  
  @media print {
    position: fixed;
    left: 0.8rem;
    right: 0.8rem;
    bottom: 0.5rem;
  }
`;

const SignatureRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  gap: 1.5rem;
`;

const SignatureBox = styled.div`
  flex: 1;
  border-top: 3px solid #3b82f6;
  padding-top: 1rem;
  text-align: center;
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 500;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const BarcodeBox = styled.div`
  margin-top: 1.2rem;
  margin-bottom: 3rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const MasterSlip = ({ order, user, settings }) => {
  const now = new Date();
  const { t } = useTranslation();
  return (
    <Wrapper className="print-only-premium">
      <Watermark>{t('masterSlip').toUpperCase()}</Watermark>
      <Header>
        <Title>{t('masterSlip')}</Title>
        <Meta>
          <div>{t('orderIdLabel')} {order?.id?.substring(0, 8) || 'N/A'}</div>
          <div>{t('dateLabel')} {now.toLocaleDateString()} {now.toLocaleTimeString()}</div>
          <div>{t('userLabel')} {user?.displayName || user?.email || 'N/A'}</div>
        </Meta>
      </Header>
      <Section>
        <SectionTitle>{t('patientInformation')}</SectionTitle>
        <InfoGrid>
          <InfoItem><strong>{t('nameLabel')}</strong> {order?.firstName ? `${order.firstName} ${order.fathersName || ''} ${order.grandFathersName || ''} ${order.lastName || ''}`.trim() : (order?.patientName || 'N/A')}</InfoItem>
          <InfoItem><strong>{t('patientIdLabel')}</strong> {order?.patientId || 'N/A'}</InfoItem>
          <InfoItem><strong>{t('ageGenderLabel')}</strong> {typeof order?.age === 'object' ? `${order?.age?.value || ''} ${order?.age?.unit || ''}` : order?.age || 'N/A'} / {order?.gender || 'N/A'}</InfoItem>
          <InfoItem><strong>{t('phoneLabel')}</strong> {order?.phone || 'N/A'}</InfoItem>
          <InfoItem><strong>{t('referringDoctorLabel')}</strong> {order?.referringDoctor || 'N/A'}</InfoItem>
          <InfoItem><strong>{t('priorityLabel')}</strong> {order?.priority || 'NORMAL'}</InfoItem>
        </InfoGrid>
      </Section>
      <Section>
        <SectionTitle>{t('allTests')}</SectionTitle>
        <Table>
          <thead>
            <tr>
              <th>{t('testLabel')}</th>
              <th>{t('departmentLabel')}</th>
              <th>{t('statusLabel')}</th>
              <th>{t('notesLabel')}</th>
            </tr>
          </thead>
          <tbody>
            {order?.tests?.map((test, idx) => {
              // Safely extract test name, handling nested objects
              let testName = 'Unknown Test';
              try {
                if (typeof test === 'string') {
                  testName = test;
                } else if (test && typeof test === 'object') {
                  if (typeof test.name === 'string') {
                    testName = test.name;
                  } else if (typeof test.id === 'string') {
                    testName = test.id;
                  } else if (test.name && typeof test.name === 'object') {
                    // Handle case where test.name is an object like {value, unit}
                    if (test.name.value && test.name.unit) {
                      testName = `${test.name.value} ${test.name.unit}`;
                    } else {
                      testName = test.name.value || test.name.unit || 'Unknown Test';
                    }
                  }
                }
                
                // Ensure testName is always a string
                testName = String(testName || 'Unknown Test');
              } catch (error) {
                console.warn('Error processing test name:', error, test);
                testName = 'Unknown Test';
              }
              
              return (
                <tr key={idx}>
                  <td>{testName}</td>
                  <td>{typeof test === 'object' ? test.department || 'Parasitology' : 'Parasitology'}</td>
                  <td style={{color: '#10b981', fontWeight: 700}}>{t('pendingStatus')}</td>
                  <td>{t('emptyDash')}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Section>
      <Section>
        <SectionTitle>{t('notes')}</SectionTitle>
        <div style={{minHeight: '2rem'}}>{order?.notes || '—'}</div>
      </Section>
      {/* Remove SignatureRow */}
      {/* <SignatureRow>
        <SignatureBox>{t('doctorSignature')}</SignatureBox>
        <SignatureBox>{t('patientSignature')}</SignatureBox>
      </SignatureRow> */}
      <BarcodeBox>
        {/* Uncomment and use QRCode for barcode if available */}
        {/* {order?.id && <QRCode value={order.id} size={40} />} */}
      </BarcodeBox>
      <Footer>
        <div>{t('printedBySmartLabPremiumLims')}</div>
        <div>{t('orderQrBarcodeComingSoon')}</div>
      </Footer>
      
      {/* Subtle SmartLab logo at bottom */}
      <div style={{
        position: 'absolute',
        bottom: '0.2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.6rem',
        color: '#cbd5e1',
        opacity: 0.25,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 300,
        letterSpacing: '0.1em'
      }}>
        SmartLab
      </div>
    </Wrapper>
  );
};

export default MasterSlip;