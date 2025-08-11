import React from 'react';
import styled from 'styled-components';
// import QRCode from 'qrcode.react'; // Uncomment if using QR/barcode
// import logo from '../../assets/logo.png'; // Placeholder for logo

const Wrapper = styled.div`
  width: 210mm;
  min-height: 297mm;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  color: #1e293b;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
  margin: 0 auto;
  padding: 2.5rem 2rem 2rem 2rem;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  position: relative;
  overflow: hidden;
  border: 1px solid #dcfce7;
  
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
  color: #dcfce7;
  opacity: 0.1;
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
  border-bottom: 3px solid #16a34a;
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.05) 0%, rgba(22, 163, 74, 0.02) 100%);
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
  color: #16a34a;
  text-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #16a34a, #15803d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(22, 163, 74, 0.1);
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

const BarcodeBox = styled.div`
  margin-top: 1.2rem;
  margin-bottom: 3rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const DepartmentSlip = ({ order, department, tests, user, settings }) => {
  const now = new Date();
  

  
  return (
    <Wrapper className="print-only-premium">
      <Watermark>DEPARTMENT SLIP</Watermark>
      <Header>
        <Title>Department Slip: {department}</Title>
        <Meta>
          <div>Order ID: {order?.id?.substring(0, 8) || 'N/A'}</div>
          <div>Date: {now.toLocaleDateString()} {now.toLocaleTimeString()}</div>
          <div>User: {user?.displayName || user?.email || 'N/A'}</div>
        </Meta>
      </Header>
      <Section>
        <SectionTitle>Patient Information</SectionTitle>
        <InfoGrid>
          <InfoItem><strong>Name:</strong> {order?.firstName ? `${order.firstName} ${order.fathersName || ''} ${order.grandFathersName || ''} ${order.lastName || ''}`.trim() : (order?.patientName || 'N/A')}</InfoItem>
          <InfoItem><strong>Patient ID:</strong> {order?.patientId || 'N/A'}</InfoItem>
          <InfoItem><strong>Age/Gender:</strong> {typeof order?.age === 'object' ? `${order?.age?.value || ''} ${order?.age?.unit || ''}` : order?.age || 'N/A'} / {order?.gender || 'N/A'}</InfoItem>
          <InfoItem><strong>Phone:</strong> {order?.phone || 'N/A'}</InfoItem>
          <InfoItem><strong>Referring Doctor:</strong> {order?.referringDoctor || 'N/A'}</InfoItem>
          <InfoItem><strong>Department:</strong> {department}</InfoItem>
        </InfoGrid>
      </Section>
      <Section>
        <SectionTitle>Tests for {department}</SectionTitle>
        <Table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {tests?.map((test, idx) => {
              // Additional safety check for undefined/null tests
              if (!test) {
                console.warn('Found undefined/null test at index:', idx);
                return (
                  <tr key={idx}>
                    <td>Invalid Test</td>
                    <td style={{color: '#ef4444', fontWeight: 700}}>ERROR</td>
                    <td>—</td>
                  </tr>
                );
              }
              
              // Safely extract test name, handling nested objects
              let testName = 'Unknown Test';
              try {
                if (typeof test === 'string') {
                  testName = test;
                } else if (test && typeof test === 'object') {
                  // Check for circular references
                  if (test === test.name || test === test.id) {
                    console.warn('Circular reference detected in test:', test);
                    testName = 'Circular Reference';
                  } else if (typeof test.name === 'string') {
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
                  <td style={{color: '#10b981', fontWeight: 700}}>PENDING</td>
                  <td>—</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Section>
      <Section>
        <SectionTitle>Notes</SectionTitle>
        <div style={{minHeight: '2rem'}}>{order?.notes || '—'}</div>
      </Section>
      <BarcodeBox>
        {/* <QRCode value={order?.id || ''} size={40} /> */}
      </BarcodeBox>
      <Footer>
        <div>Printed by SmartLab Premium LIMS</div>
        <div>Order QR/Barcode (Coming Soon)</div>
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

export default DepartmentSlip;