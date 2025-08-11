import React from 'react';
import styled from 'styled-components';
import { FaPrint, FaUser, FaIdCard, FaCalendar, FaStethoscope, FaFlask, FaThermometer, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const ReportContainer = styled.div`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  color: #1f2937;
  line-height: 1.6;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  border-radius: 12px 12px 0 0;
  margin-bottom: 2rem;
`;

const LabName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ReportTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  opacity: 0.95;
`;

const ReportDate = styled.div`
  font-size: 1rem;
  opacity: 0.9;
  margin-top: 1rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #10b981;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  
  strong {
    color: #374151;
    min-width: 80px;
  }
  
  span {
    color: #6b7280;
  }
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
`;

const TableHeader = styled.thead`
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  color: white;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f3f4f6;
  
  &:nth-child(even) {
    background: #f9fafb;
  }
  
  &:hover {
    background: #f3f4f6;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.9rem;
`;

const TestName = styled.td`
  padding: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
`;

const ResultValue = styled.td`
  padding: 1rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #059669;
`;

const StatusCell = styled.td`
  padding: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ status }) => {
    switch (status) {
      case 'normal':
        return 'background: #d1fae5; color: #065f46;';
      case 'high':
        return 'background: #fef3c7; color: #92400e;';
      case 'low':
        return 'background: #dbeafe; color: #1e40af;';
      case 'critical':
        return 'background: #fee2e2; color: #991b1b;';
      default:
        return 'background: #f3f4f6; color: #374151;';
    }
  }}
`;

const ReferenceRange = styled.td`
  padding: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
  font-style: italic;
`;

const Notes = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  
  strong {
    color: #92400e;
  }
`;

const Footer = styled.div`
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 0 0 12px 12px;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.9rem;
`;

const SignatureSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
`;

const SignatureBox = styled.div`
  text-align: center;
  padding: 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  
  strong {
    display: block;
    margin-bottom: 0.5rem;
    color: #374151;
  }
  
  span {
    color: #6b7280;
    font-size: 0.9rem;
  }
`;

const QRCode = styled.div`
  text-align: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  margin: 1rem 0;
  
  div {
    color: #6b7280;
    font-size: 0.9rem;
  }
`;

const DetailedResultsReport = ({ order, onPrint }) => {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTestStatus = (testName) => {
    if (!order.results) return 'pending';
    const result = order.results[testName];
    if (!result) return 'pending';
    return result.status || 'normal';
  };

  const getTestResult = (testName) => {
    if (!order.results) return 'Pending';
    const result = order.results[testName];
    if (!result) return 'Pending';
    return result.value || 'No result';
  };

  const getTestUnit = (testName) => {
    if (!order.results) return '';
    const result = order.results[testName];
    if (!result) return '';
    return result.unit || '';
  };

  const getTestReferenceRange = (testName) => {
    if (!order.results) return 'N/A';
    const result = order.results[testName];
    if (!result) return 'N/A';
    return result.referenceRange || 'N/A';
  };

  const hasResults = order.results && Object.keys(order.results).length > 0;
  const completedTests = order.tests?.filter(test => {
    const testName = typeof test === 'string' ? test : test.name || test;
    return order.results && order.results[testName];
  }) || [];

  return (
    <ReportContainer>
      <Header>
        <LabName>SmartLab Premium LIMS</LabName>
        <ReportTitle>Laboratory Test Results Report</ReportTitle>
        <ReportDate>Generated on {new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</ReportDate>
      </Header>

      <Section>
        <SectionTitle>
          <FaUser /> Patient Information
        </SectionTitle>
        <InfoGrid>
          <InfoItem>
            <strong>Name:</strong>
            <span>{order.patientName || 'N/A'}</span>
          </InfoItem>
          <InfoItem>
            <strong>Patient ID:</strong>
            <span>{order.patientId || 'N/A'}</span>
          </InfoItem>
          <InfoItem>
            <strong>Age:</strong>
            <span>{order.age || 'N/A'}</span>
          </InfoItem>
          <InfoItem>
            <strong>Gender:</strong>
            <span>{order.gender || 'N/A'}</span>
          </InfoItem>
          <InfoItem>
            <strong>Order Date:</strong>
            <span>{formatDate(order.createdAt)}</span>
          </InfoItem>
          <InfoItem>
            <strong>Referring Doctor:</strong>
            <span>{order.referringDoctor || 'N/A'}</span>
          </InfoItem>
        </InfoGrid>
      </Section>

      <Section>
        <SectionTitle>
          <FaFlask /> Test Results Summary
        </SectionTitle>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Total Tests:</strong> {order.tests?.length || 0} | 
          <strong>Completed:</strong> {completedTests.length} | 
          <strong>Pending:</strong> {(order.tests?.length || 0) - completedTests.length}
        </div>
        
        {hasResults && (
          <ResultsTable>
            <TableHeader>
              <tr>
                <TableHeaderCell>Test Name</TableHeaderCell>
                <TableHeaderCell>Result</TableHeaderCell>
                <TableHeaderCell>Unit</TableHeaderCell>
                <TableHeaderCell>Reference Range</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </tr>
            </TableHeader>
            <tbody>
              {order.tests?.map((test, index) => {
                const testName = typeof test === 'string' ? test : test.name || test;
                const status = getTestStatus(testName);
                const result = getTestResult(testName);
                const unit = getTestUnit(testName);
                const referenceRange = getTestReferenceRange(testName);
                
                return (
                  <TableRow key={index}>
                    <TestName>{testName}</TestName>
                    <ResultValue>{result}</ResultValue>
                    <TableCell>{unit}</TableCell>
                    <ReferenceRange>{referenceRange}</ReferenceRange>
                    <StatusCell>
                      <StatusBadge status={status}>
                        {status === 'pending' ? 'Pending' : status.toUpperCase()}
                      </StatusBadge>
                    </StatusCell>
                  </TableRow>
                );
              })}
            </tbody>
          </ResultsTable>
        )}
        
        {!hasResults && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            No test results available yet. Results will appear here once they are entered.
          </div>
        )}
      </Section>

      {order.notes && (
        <Section>
          <SectionTitle>
            <FaInfoCircle /> Clinical Notes
          </SectionTitle>
          <Notes>
            <strong>Notes:</strong> {order.notes}
          </Notes>
        </Section>
      )}

      <SignatureSection>
        <SignatureBox>
          <strong>Laboratory Technician</strong>
          <span>Signature & Date</span>
        </SignatureBox>
        <SignatureBox>
          <strong>Verified By</strong>
          <span>Signature & Date</span>
        </SignatureBox>
      </SignatureSection>

      <QRCode>
        <div>Order ID: {order.id}</div>
        <div>Scan for digital copy</div>
      </QRCode>

      <Footer>
        <div>This report was generated by SmartLab Premium LIMS</div>
        <div>For questions, please contact the laboratory</div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
          Report generated on {new Date().toLocaleString()}
        </div>
      </Footer>
    </ReportContainer>
  );
};

export default DetailedResultsReport;
