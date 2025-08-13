import React from 'react';
import styled from 'styled-components';
// import QRCode from 'qrcode.react'; // Uncomment if using QR/barcode
// import logo from '../../assets/logo.png'; // Placeholder for logo

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
    background: white !important;
    color: black !important;
    
    /* Ensure all text is visible and styled properly */
    * {
      color: black !important;
      background: transparent !important;
    }
    
    /* Keep the gradient title visible */
    .title {
      background: #3b82f6 !important;
      -webkit-background-clip: unset !important;
      -webkit-text-fill-color: unset !important;
      background-clip: unset !important;
      color: #3b82f6 !important;
    }
    
    /* Keep the department queue number styling */
    .dept-queue-number {
      background: #3b82f6 !important;
      color: white !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    /* Ensure table borders are visible */
    table {
      border-collapse: collapse !important;
      width: 100% !important;
    }
    
    th, td {
      border: 1px solid #ddd !important;
      padding: 8px !important;
      text-align: left !important;
    }
    
    th {
      background: #f8f9fa !important;
      font-weight: bold !important;
    }
    
    /* Keep section titles visible */
    .section-title {
      color: #1e40af !important;
      font-weight: bold !important;
      border-bottom: 2px solid #3b82f6 !important;
      padding-bottom: 0.5rem !important;
      margin-bottom: 1rem !important;
    }
    
    /* Ensure proper spacing */
    .section {
      margin-bottom: 1.5rem !important;
      page-break-inside: avoid !important;
    }
    
    /* Keep the header styling */
    .header {
      border-bottom: 3px solid #3b82f6 !important;
      background: #f8f9fa !important;
    }
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
  color: #16a34a;
  text-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);
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
  
  /* Ensure content uses full width */
  > div {
    min-width: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
`;

const InfoItem = styled.div`
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  
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
    <Wrapper className="print-only-premium" id={`dept-slip-${department}`}>
      <Watermark>DEPARTMENT SLIP</Watermark>
      <Header className="header">
        <Title className="title">{department}</Title>
        <Meta>
          <div>Order ID: {order?.id || order?.orderId || 'Preview Mode'}</div>
          <div>Date: {now.toLocaleDateString()} {now.toLocaleTimeString()}</div>
          <div>User: {user?.displayName || user?.email || 'N/A'}</div>
        </Meta>
      </Header>
      
      {/* Department Queue Number Display */}
      {order?.departmentNumbers?.[department] && (
        <div 
          className="dept-queue-number"
          style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            borderRadius: '12px',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          {department} Queue Number: #{order.departmentNumbers[department]}
        </div>
      )}
      <Section className="section">
        <SectionTitle className="section-title">Patient Information</SectionTitle>
        <InfoGrid>
          {/* Name - always show */}
          <InfoItem><strong>Name:</strong> {order?.firstName ? `${order.firstName} ${order.fathersName || ''} ${order.grandFathersName || ''} ${order.lastName || ''}`.trim() : (order?.patientName || 'N/A')}</InfoItem>
          
          {/* Patient ID - only show if provided */}
          {order?.patientId && order.patientId !== 'N/A' && (
            <InfoItem><strong>Patient ID:</strong> {order.patientId}</InfoItem>
          )}
          
          {/* Age/Gender - only show if either is provided */}
          {(order?.age || order?.gender) && (
            <InfoItem>
              <strong>Age/Gender:</strong> 
              {typeof order?.age === 'object' ? `${order?.age?.value || ''} ${order?.age?.unit || ''}` : order?.age || ''} 
              {order?.age && order?.gender ? ' / ' : ''}
              {order?.gender || ''}
            </InfoItem>
          )}
          
          {/* Phone - only show if provided and department is Virology */}
          {department === 'Virology' && order?.phone && order.phone !== 'N/A' && (
            <InfoItem><strong>Phone:</strong> {order.phone}</InfoItem>
          )}
          
          {/* Referring Doctor - only show if provided */}
          {order?.referringDoctor && order.referringDoctor !== 'N/A' && (
            <InfoItem><strong>Referring Doctor:</strong> {order.referringDoctor}</InfoItem>
          )}
          
          {/* Address - Only for Virology, only show if provided */}
          {department === 'Virology' && order?.address && Object.keys(order.address).length > 0 && (
            <InfoItem>
              <strong>Address:</strong> {
                [
                  order.address.landmark ? (typeof order.address.landmark === 'object' ? order.address.landmark.label || order.address.landmark.value : order.address.landmark) : null,
                  order.address.area ? (typeof order.address.area === 'object' ? order.address.area.label || order.address.area.value : order.address.area) : null,
                  order.address.district ? (typeof order.address.district === 'object' ? order.address.district.label || order.address.district.value : order.address.district) : null,
                  order.address.governorate ? (typeof order.address.governorate === 'object' ? order.address.governorate.label || order.address.governorate.value : order.address.governorate) : null
                ].filter(Boolean).join(' - ')
              }
            </InfoItem>
          )}
        </InfoGrid>
      </Section>
      <Section className="section">
        <SectionTitle className="section-title">Tests for {department}</SectionTitle>
        <Table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Queue #</th>
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
                    <td style={{color: '#ef4444', fontWeight: 700, textAlign: 'center'}}>ERROR</td>
                  </tr>
                );
              }
              
              // Safely extract test name, handling nested objects
              let testName = 'Unknown Test';
              try {
                if (typeof test === 'string') {
                  testName = test;
                } else if (test && typeof test === 'object') {
                  // First try to get the test name from the name property
                  if (test.name) {
                    if (typeof test.name === 'string') {
                      testName = test.name;
                    } else if (typeof test.name === 'object') {
                      // Handle case where test.name is an object like {value, unit}
                      if (test.name.value && test.name.unit) {
                        testName = `${test.name.value} ${test.name.unit}`;
                      } else {
                        testName = test.name.value || test.name.unit || test.name.label || test.name.name || 'Unknown Test';
                      }
                    }
                  }
                  // If no name, try id
                  else if (test.id && typeof test.id === 'string') {
                    testName = test.id;
                  }
                  // If still no name, try other possible properties
                  else if (test.testName && typeof test.testName === 'string') {
                    testName = test.testName;
                  }
                  else if (test.label && typeof test.label === 'string') {
                    testName = test.label;
                  }
                }
                
                // Ensure testName is always a string and not empty
                testName = String(testName || 'Unknown Test').trim();
                if (!testName || testName === 'Unknown Test') {
                  // Fallback: try to extract any meaningful string from the test object
                  if (test && typeof test === 'object') {
                    const allValues = Object.values(test).filter(val => 
                      typeof val === 'string' && val.trim().length > 0 && val !== 'Unknown Test'
                    );
                    if (allValues.length > 0) {
                      testName = allValues[0];
                    }
                  }
                }
              } catch (error) {
                console.warn('Error processing test name:', error, test);
                testName = 'Unknown Test';
              }
              
              // Get department queue number
              const queueNumber = order?.departmentNumbers?.[department] || order?.queueNumber || 'N/A';
              
              return (
                <tr key={idx}>
                  <td>{testName}</td>
                  <td style={{color: '#3b82f6', fontWeight: 700, textAlign: 'center'}}>#{queueNumber}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Section>
      {/* Notes - only show if provided */}
      {order?.notes && order.notes.trim() !== '' && (
        <Section>
          <SectionTitle>Notes</SectionTitle>
          <div style={{minHeight: '2rem'}}>{order.notes}</div>
        </Section>
      )}
      <BarcodeBox>
        {/* <QRCode value={order?.id || ''} size={40} /> */}
      </BarcodeBox>
      <Footer>
        <div>Printed by SmartLab LIMS</div>
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