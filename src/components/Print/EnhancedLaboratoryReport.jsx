import React, { useMemo } from 'react';
import styled from 'styled-components';
import { FaUser, FaIdCard, FaBirthdayCake, FaVenusMars, FaPhone, FaStethoscope, FaFlask, FaExclamationTriangle, FaCheckCircle, FaArrowUp, FaArrowDown, FaHospital, FaTint, FaHeart, FaBrain, FaShieldAlt, FaDna, FaBacteria, FaQrcode } from 'react-icons/fa';

const ReportContainer = styled.div`
  width: 210mm;
  min-height: 297mm;
  background: white;
  color: #1a1a1a;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', 'Segoe UI', 'Roboto', Arial, sans-serif;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  @media print {
    box-shadow: none;
    margin: 0;
    width: 100%;
    min-height: 100vh;
  }
`;

const Watermark = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  font-size: 5rem;
  color: #f0f4f8;
  opacity: 0.08;
  pointer-events: none;
  user-select: none;
  z-index: 0;
  font-weight: 900;
  letter-spacing: 0.3em;
  font-family: 'Georgia', serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3px solid #2563eb;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
`;

const HospitalInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HospitalLogo = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 900;
`;

const HospitalDetails = styled.div`
  h1 {
    font-size: 1.8rem;
    font-weight: 900;
    margin: 0;
    color: #1e40af;
    font-family: 'Georgia', serif;
  }
  p {
    margin: 0.2rem 0;
    color: #64748b;
    font-size: 0.9rem;
  }
`;

const ReportMeta = styled.div`
  text-align: right;
  font-size: 0.85rem;
  color: #64748b;
  
  .report-id {
    font-size: 1rem;
    font-weight: 700;
    color: #1e40af;
    margin-bottom: 0.5rem;
  }
  
  .date-time {
    font-weight: 600;
    color: #475569;
  }
`;

const PatientCard = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #2563eb, #7c3aed);
    border-radius: 12px 12px 0 0;
  }
`;

const PatientHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  
  .patient-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #10b981, #059669);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
  }
  
  .patient-main {
    flex: 1;
    
    .patient-name {
      font-size: 1.4rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0;
    }
    
    .patient-id {
      font-size: 1rem;
      color: #64748b;
      font-weight: 600;
    }
  }
`;

const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const PatientInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  
  .icon {
    width: 32px;
    height: 32px;
    background: #e2e8f0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #475569;
    font-size: 0.9rem;
  }
  
  .content {
    .label {
      font-weight: 600;
      color: #64748b;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .value {
      color: #1e293b;
      font-weight: 600;
    }
  }
`;

const DepartmentSection = styled.div`
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
`;

const DepartmentHeader = styled.div`
  background: linear-gradient(135deg, ${props => props.color}15, ${props => props.color}25);
  border-left: 4px solid ${props => props.color};
  padding: 1rem 1.2rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .department-icon {
    width: 40px;
    height: 40px;
    background: ${props => props.color};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.1rem;
  }
  
  .department-info {
    flex: 1;
    
    .department-name {
      font-size: 1.2rem;
      font-weight: 800;
      color: ${props => props.color};
      margin: 0;
    }
    
    .test-count {
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
    }
  }
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  th, td {
    padding: 0.8rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  th {
    background: #f8fafc;
    color: #374151;
    font-weight: 700;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  td {
    font-size: 0.95rem;
    color: #1f2937;
  }
  
  tr:hover {
    background: #f9fafb;
  }
`;

const ResultValue = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  
  .value {
    color: ${props => {
      if (props.status === 'high') return '#dc2626';
      if (props.status === 'low') return '#2563eb';
      if (props.status === 'critical') return '#991b1b';
      return '#059669';
    }};
  }
  
  .flag {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-weight: 700;
    text-transform: uppercase;
    
    &.high {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
    
    &.low {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
    }
    
    &.critical {
      background: #7f1d1d;
      color: white;
      border: 1px solid #dc2626;
    }
    
    &.normal {
      background: #f0fdf4;
      color: #059669;
      border: 1px solid #bbf7d0;
    }
  }
`;

const ReferenceRange = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  
  .range {
    font-weight: 600;
    color: #374151;
  }
  
  .unit {
    color: #9ca3af;
    font-size: 0.8rem;
  }
`;

const CriticalAlert = styled.div`
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 2px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .alert-icon {
    width: 40px;
    height: 40px;
    background: #dc2626;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
  }
  
  .alert-content {
    flex: 1;
    
    .alert-title {
      font-weight: 800;
      color: #991b1b;
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
    }
    
    .alert-message {
      color: #7f1d1d;
      font-weight: 500;
    }
  }
`;

const InterpretationSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.2rem;
  margin: 1.5rem 0;
  position: relative;
  z-index: 2;
  
  .section-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e40af;
    margin: 0 0 0.8rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .interpretation-content {
    color: #374151;
    line-height: 1.6;
    min-height: 2rem;
  }
`;

const SignatureSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
  position: relative;
  z-index: 2;
`;

const SignatureBox = styled.div`
  text-align: center;
  
  .signature-line {
    width: 100%;
    height: 2px;
    background: #cbd5e1;
    margin: 1rem 0 0.5rem 0;
  }
  
  .signature-label {
    font-size: 0.9rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .signature-info {
    font-size: 0.8rem;
    color: #94a3b8;
    margin-top: 0.25rem;
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
  font-size: 0.8rem;
  color: #94a3b8;
  z-index: 2;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  
  @media print {
    position: fixed;
    left: 1.5rem;
    right: 1.5rem;
    bottom: 1rem;
  }
`;

const QRCodeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  position: relative;
  z-index: 2;
  
  .qr-info {
    flex: 1;
    
    .qr-title {
      font-weight: 700;
      color: #374151;
      margin: 0 0 0.5rem 0;
    }
    
    .qr-description {
      color: #6b7280;
      font-size: 0.9rem;
    }
  }
  
  .qr-placeholder {
    width: 80px;
    height: 80px;
    background: #e2e8f0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 2rem;
  }
`;

// Department color mapping
const departmentColors = {
  'Hematology': '#dc2626',
  'Biochemistry': '#2563eb',
  'Microbiology': '#7c3aed',
  'Immunology': '#059669',
  'Molecular': '#ea580c',
  'Cytology': '#db2777',
  'Histopathology': '#0891b2',
  'Parasitology': '#65a30d',
  'Virology': '#be185d',
  'Toxicology': '#dc2626',
  'Endocrinology': '#7c2d12',
  'Cardiology': '#be123c',
  'Neurology': '#1e40af',
  'Oncology': '#7c2d12',
  'Genetics': '#059669'
};

// Department icon mapping
const departmentIcons = {
  'Hematology': FaTint,
  'Biochemistry': FaFlask,
  'Microbiology': FaBacteria,
  'Immunology': FaShieldAlt,
  'Molecular': FaDna,
  'Cytology': FaFlask,
  'Histopathology': FaFlask,
  'Parasitology': FaBacteria,
  'Virology': FaBacteria,
  'Toxicology': FaExclamationTriangle,
  'Endocrinology': FaBrain,
  'Cardiology': FaHeart,
  'Neurology': FaBrain,
  'Oncology': FaExclamationTriangle,
  'Genetics': FaDna
};

const EnhancedLaboratoryReport = ({ order, user, settings }) => {
  const now = new Date();
  
  // Group tests by department
  const testsByDepartment = useMemo(() => {
    if (!order?.results) return {};
    
    return order.results.reduce((acc, result) => {
      const test = order.tests?.find(t => t.name === result.testName || t.id === result.testName);
      const department = test?.department || 'General Laboratory';
      
      if (!acc[department]) {
        acc[department] = [];
      }
      
      acc[department].push({
        ...result,
        department,
        testInfo: test
      });
      
      return acc;
    }, {});
  }, [order]);
  
  // Determine result status and flags
  const getResultStatus = (result) => {
    if (!result.value || result.value === 'N/A') return { status: 'pending', flag: null };
    
    // Check if result is numeric for comparison
    const numValue = parseFloat(result.value);
    if (isNaN(numValue)) return { status: 'normal', flag: null };
    
    // Parse reference range
    const refRange = result.referenceRange || result.testInfo?.referenceRange;
    if (!refRange) return { status: 'normal', flag: null };
    
    const [min, max] = refRange.split('-').map(v => parseFloat(v.trim()));
    if (isNaN(min) || isNaN(max)) return { status: 'normal', flag: null };
    
    if (numValue < min) return { status: 'low', flag: 'low' };
    if (numValue > max) return { status: 'high', flag: 'high' };
    if (numValue === min || numValue === max) return { status: 'borderline', flag: 'normal' };
    
    return { status: 'normal', flag: 'normal' };
  };
  
  // Check for critical values
  const hasCriticalValues = useMemo(() => {
    return order?.results?.some(result => {
      const { status } = getResultStatus(result);
      return status === 'high' || status === 'low';
    });
  }, [order?.results]);
  
  // Get department color
  const getDepartmentColor = (department) => {
    return departmentColors[department] || '#64748b';
  };
  
  // Get department icon
  const getDepartmentIcon = (department) => {
    const IconComponent = departmentIcons[department] || FaFlask;
    return <IconComponent />;
  };

  return (
    <ReportContainer>
      <Watermark>LABORATORY REPORT</Watermark>
      
      {/* Header */}
      <Header>
        <HospitalInfo>
          <HospitalLogo>
            <FaHospital />
          </HospitalLogo>
          <HospitalDetails>
            <h1>SmartLab Medical Center</h1>
            <p>Advanced Laboratory Information Management System</p>
            <p>Accredited by International Laboratory Standards</p>
          </HospitalDetails>
        </HospitalInfo>
        <ReportMeta>
          <div className="report-id">Report ID: {order?.id?.substring(0, 12) || 'N/A'}</div>
          <div className="date-time">Generated: {now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
          <div className="date-time">Time: {now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</div>
          <div>Technologist: {user?.displayName || user?.email || 'N/A'}</div>
        </ReportMeta>
      </Header>
      
      {/* Patient Information Card */}
      <PatientCard>
        <PatientHeader>
          <div className="patient-icon">
            <FaUser />
          </div>
          <div className="patient-main">
            <h2 className="patient-name">
              {order?.firstName ? 
                `${order.firstName} ${order.fathersName || ''} ${order.grandFathersName || ''} ${order.lastName || ''}`.trim() : 
                (order?.patientName || 'N/A')
              }
            </h2>
            <div className="patient-id">Patient ID: {order?.patientId || 'N/A'}</div>
          </div>
        </PatientHeader>
        
        <PatientGrid>
          <PatientInfoItem>
            <div className="icon">
              <FaBirthdayCake />
            </div>
            <div className="content">
              <div className="label">Age</div>
              <div className="value">{order?.age || 'N/A'}</div>
            </div>
          </PatientInfoItem>
          
          <PatientInfoItem>
            <div className="icon">
              <FaVenusMars />
            </div>
            <div className="content">
              <div className="label">Gender</div>
              <div className="value">{order?.gender || 'N/A'}</div>
            </div>
          </PatientInfoItem>
          
          <PatientInfoItem>
            <div className="icon">
              <FaPhone />
            </div>
            <div className="content">
              <div className="label">Phone</div>
              <div className="value">{order?.phone || 'N/A'}</div>
            </div>
          </PatientInfoItem>
          
          <PatientInfoItem>
            <div className="icon">
              <FaStethoscope />
            </div>
            <div className="content">
              <div className="label">Referring Doctor</div>
              <div className="value">{order?.referringDoctor || 'N/A'}</div>
            </div>
          </PatientInfoItem>
          
          <PatientInfoItem>
            <div className="icon">
              <FaIdCard />
            </div>
            <div className="content">
              <div className="label">Priority</div>
              <div className="value">{order?.priority || 'NORMAL'}</div>
            </div>
          </PatientInfoItem>
          
          <PatientInfoItem>
            <div className="icon">
              <FaFlask />
            </div>
            <div className="content">
              <div className="label">Total Tests</div>
              <div className="value">{order?.results?.length || 0}</div>
            </div>
          </PatientInfoItem>
        </PatientGrid>
      </PatientCard>
      
      {/* Critical Values Alert */}
      {hasCriticalValues && (
        <CriticalAlert>
          <div className="alert-icon">
            <FaExclamationTriangle />
          </div>
          <div className="alert-content">
            <h3 className="alert-title">⚠️ Critical Values Detected</h3>
            <p className="alert-message">
              Some test results are outside normal reference ranges. Please review immediately and consult with the laboratory director if necessary.
            </p>
          </div>
        </CriticalAlert>
      )}
      
      {/* Test Results by Department */}
      {Object.entries(testsByDepartment).map(([department, tests]) => (
        <DepartmentSection key={department}>
          <DepartmentHeader color={getDepartmentColor(department)}>
            <div className="department-icon">
              {getDepartmentIcon(department)}
            </div>
            <div className="department-info">
              <h3 className="department-name">{department}</h3>
              <div className="test-count">{tests.length} test{tests.length !== 1 ? 's' : ''}</div>
            </div>
          </DepartmentHeader>
          
          <ResultsTable>
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Result</th>
                <th>Reference Range</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((result, idx) => {
                const { status, flag } = getResultStatus(result);
                const testInfo = result.testInfo;
                
                return (
                  <tr key={idx}>
                    <td>
                      <strong>{result.testName}</strong>
                      {testInfo?.subsection && (
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          {testInfo.subsection}
                        </div>
                      )}
                    </td>
                    <td>
                      <ResultValue status={status}>
                        <span className="value">{result.value || 'Pending'}</span>
                        {flag && (
                          <span className={`flag ${flag}`}>
                            {flag === 'high' && <FaArrowUp />}
                            {flag === 'low' && <FaArrowDown />}
                            {flag === 'normal' && <FaCheckCircle />}
                            {flag.toUpperCase()}
                          </span>
                        )}
                      </ResultValue>
                    </td>
                    <td>
                      <ReferenceRange>
                        <span className="range">
                          {result.referenceRange || testInfo?.referenceRange || 'N/A'}
                        </span>
                        {result.unit && (
                          <span className="unit"> {result.unit}</span>
                        )}
                      </ReferenceRange>
                    </td>
                    <td>{result.unit || testInfo?.unit || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </ResultsTable>
        </DepartmentSection>
      ))}
      
      {/* Interpretation Section */}
      {order?.notes && (
        <InterpretationSection>
          <h3 className="section-title">
            <FaBrain /> Clinical Interpretation
          </h3>
          <div className="interpretation-content">
            {order.notes}
          </div>
        </InterpretationSection>
      )}
      
      {/* Signatures */}
      <SignatureSection>
        <SignatureBox>
          <div className="signature-line"></div>
          <div className="signature-label">Laboratory Technologist</div>
          <div className="signature-info">Name & License Number</div>
        </SignatureBox>
        
        <SignatureBox>
          <div className="signature-line"></div>
          <div className="signature-label">Laboratory Director</div>
          <div className="signature-info">Name & Credentials</div>
        </SignatureBox>
        
        <SignatureBox>
          <div className="signature-line"></div>
          <div className="signature-label">Reporting Date</div>
          <div className="signature-info">{now.toLocaleDateString()}</div>
        </SignatureBox>
      </SignatureSection>
      
      {/* QR Code Section */}
      <QRCodeSection>
        <div className="qr-info">
          <h4 className="qr-title">Digital Report Verification</h4>
          <p className="qr-description">
            Scan this QR code to verify the authenticity of this report or access digital copy
          </p>
        </div>
        <div className="qr-placeholder">
          <FaQrcode />
        </div>
      </QRCodeSection>
      
      {/* Footer */}
      <Footer>
        <div>SmartLab Premium LIMS v2.0 | ISO 15189 Accredited</div>
        <div>Page 1 of 1 | Report Generated Electronically</div>
        <div>Validated by: {user?.displayName || 'System'}</div>
      </Footer>
    </ReportContainer>
  );
};

export default EnhancedLaboratoryReport;
