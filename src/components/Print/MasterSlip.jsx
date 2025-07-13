import React from 'react';
import styled from 'styled-components';
// import QRCode from 'qrcode.react'; // Uncomment if using QR/barcode
// import logo from '../../assets/logo.png'; // Placeholder for logo
import { useTranslation } from 'react-i18next';

const Wrapper = styled.div`
  width: 210mm;
  min-height: 297mm;
  background: white;
  color: #222;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  margin: 0 auto;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  position: relative;
  overflow: hidden;
  @media print {
    box-shadow: none;
    margin: 0;
    border-radius: 0;
    width: 100vw;
    min-height: 100vh;
    padding: 1rem 0.8rem 0.8rem 0.8rem;
  }
`;

const Watermark = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-20deg);
  font-size: 4rem;
  color: #e0e7ef;
  opacity: 0.15;
  pointer-events: none;
  user-select: none;
  z-index: 0;
  font-weight: 900;
  letter-spacing: 0.2em;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.8rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.95rem;
  color: #666;
`;

const Section = styled.section`
  margin-bottom: 1.2rem;
  z-index: 2;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem 1.2rem;
  font-size: 1rem;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
  font-size: 1rem;
  th, td {
    border: 1px solid #e5e7eb;
    padding: 0.5rem 0.7rem;
    text-align: left;
  }
  th {
    background: ${({ theme }) => theme.colors.primary + '10'};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 700;
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
  color: #888;
  z-index: 2;
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
  border-top: 2px solid #e5e7eb;
  padding-top: 0.6rem;
  text-align: center;
  font-size: 0.95rem;
  color: #666;
`;

const BarcodeBox = styled.div`
  margin-top: 1.2rem;
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
        <Logo>
          {/* <img src={logo} alt="Logo" style={{height:32}} /> */}
          SmartLab
        </Logo>
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
          <InfoItem><strong>{t('nameLabel')}</strong> {order?.patientName || 'N/A'}</InfoItem>
          <InfoItem><strong>{t('patientIdLabel')}</strong> {order?.patientId || 'N/A'}</InfoItem>
          <InfoItem><strong>{t('ageGenderLabel')}</strong> {order?.age || 'N/A'} / {order?.gender || 'N/A'}</InfoItem>
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
            {order?.tests?.map((test, idx) => (
              <tr key={idx}>
                <td>{test}</td>
                <td>General</td>
                <td style={{color: '#10b981', fontWeight: 700}}>{t('pendingStatus')}</td>
                <td>{t('emptyDash')}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>
      <Section>
        <SectionTitle>{t('notes')}</SectionTitle>
        <div style={{minHeight: '2rem'}}>{order?.notes || '—'}</div>
      </Section>
      <SignatureRow>
        <SignatureBox>{t('doctorSignature')}</SignatureBox>
        <SignatureBox>{t('patientSignature')}</SignatureBox>
      </SignatureRow>
      <BarcodeBox>
        {/* <QRCode value={order?.id || ''} size={40} /> */}
        <div style={{fontSize:'0.9rem',color:'#888'}}>{t('orderQrBarcodeComingSoon')}</div>
      </BarcodeBox>
      <Footer>
        <div>{t('printedBySmartLabPremiumLims')}</div>
        <div>{t('page1Of1')}</div>
      </Footer>
    </Wrapper>
  );
};

export default MasterSlip;