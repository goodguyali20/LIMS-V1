import React, { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FaPrint, FaTimes, FaEye, FaDownload, FaCopy, FaShare,
  FaFileAlt, FaBuilding, FaUser, FaCalendar, FaPhone, FaClipboard
} from 'react-icons/fa';
import { useTestCatalog } from '../../contexts/TestContext';
import GlowButton from '../common/GlowButton.jsx';
import MasterSlip from '../Print/MasterSlip.jsx';
import DepartmentSlip from '../Print/DepartmentSlip.jsx';
import usePdfDownload from '../Print/usePdfDownload';
// Temporarily comment out StyledMotionDiv to test if it's the source of the error
// import { StyledMotionDiv } from '../../utils/styledMotion.jsx';

// ===== STYLED COMPONENTS - MOVED OUTSIDE FUNCTIONAL COMPONENT =====
// Temporarily replace styled components with regular HTML to test $$typeof issue
const ModalBackdrop = ({ children, ...props }) => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}
    {...props}
  >
    {children}
  </div>
);

// Temporarily use motion.div directly instead of StyledMotionDiv
const ModalContent = ({ children, ...props }) => (
  <motion.div
    style={{
      background: 'var(--theme-colors-surface, #1a1a1a)',
      borderRadius: '20px',
      width: '95%',
      maxWidth: '1200px',
      height: '90vh',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Simplified components for testing
const ModalHeader = ({ children, ...props }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem 2rem',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
    }}
    {...props}
  >
    {children}
  </div>
);

const HeaderTitle = ({ children, ...props }) => (
  <h2
    style={{
      fontSize: '1.5rem',
      fontWeight: 600,
      color: 'var(--theme-colors-text, #ffffff)',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    }}
    {...props}
  >
    {children}
  </h2>
);

const HeaderActions = ({ children, ...props }) => (
  <div
    style={{
      display: 'flex',
      gap: '0.75rem'
    }}
    {...props}
  >
    {children}
  </div>
);

// ===== STYLED COMPONENTS - RESTORED =====
const TabContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`;
const Tab = styled.button`
  padding: 1rem 1.5rem;
  background: ${({ $isActive }) => $isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: none;
  color: ${({ theme, $isActive }) => $isActive ? theme.colors.text : theme.colors.textSecondary};
  font-weight: ${({ $isActive }) => $isActive ? '600' : '500'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.text};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $isActive }) => $isActive ? 'linear-gradient(90deg, #667eea, #764ba2)' : 'transparent'};
    border-radius: 3px 3px 0 0;
  }
`;
const TabBadge = styled.span`
  background: ${({ color }) => color || '#667eea'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
`;
const ContentArea = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;
const PreviewContainer = styled.div`
  height: 100%;
  max-height: 70vh;
  overflow-y: auto;
  padding: 2rem;
  background: #f8fafc;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.5);
    border-radius: 4px;
    
    &:hover {
      background: rgba(102, 126, 234, 0.7);
    }
  }
`;
const PrintPreview = styled.div`
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin: 0 auto;
  max-width: 800px;
  transform: scale(0.8);
  transform-origin: top center;
  
  @media print {
    transform: none;
    box-shadow: none;
    border-radius: 0;
  }
`;
const OrderSummary = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1rem 2rem;
`;
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;
const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;
const SummaryLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;
const SummaryValue = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;
const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;
const DownloadButton = styled(GlowButton)`
  background: transparent;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: none;
  min-width: 0;
  transition: background 0.2s, color 0.2s, border 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
const DownloadButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

// ===== FUNCTIONAL COMPONENT =====
const PrintPreviewModal = ({ 
  isOpen, 
  onClose, 
  patientData, 
  selectedTests, 
  orderData,
  user,
  settings 
}) => {


  const { t } = useTranslation();
  const { labTests, departmentColors } = useTestCatalog();
  const [activeTab, setActiveTab] = useState('preview');
  const downloadPdf = usePdfDownload();
  const previewRef = useRef(null);
  const modalContentRef = useRef(null);

  // Create proper test data structure from selectedTests and labTests
  const processedOrderData = useMemo(() => {
    if (!Array.isArray(selectedTests) || !Array.isArray(labTests)) {
      return orderData;
    }

    // Map selectedTests to full test objects with department info
    const tests = selectedTests.map(testName => {
      const fullTest = labTests.find(test => {
        // Handle case where test.name might be an object
        let testNameValue = test.name;
        if (testNameValue && typeof testNameValue === 'object') {
          testNameValue = testNameValue.value || testNameValue.unit || testNameValue.id || 'unknown';
        }
        return testNameValue === testName;
      });

      if (fullTest) {
        return {
          ...fullTest,
          name: testName,
          department: fullTest.department || 'General',
          id: fullTest.id || testName
        };
      }

      // Fallback if test not found in labTests
      return {
        name: testName,
        department: 'General',
        id: testName,
        price: 0,
        description: 'Test details not available'
      };
    });

    // Debug: Log what we're creating
    console.log('Selected Tests:', selectedTests);
    console.log('Lab Tests:', labTests);
    console.log('Processed Tests:', tests);
    console.log('Final processedOrderData:', { ...orderData, tests: tests });

    return {
      ...orderData,
      tests: tests
    };
  }, [orderData, selectedTests, labTests]);

  // Generate tabs dynamically based on available slips
  const availableTabs = useMemo(() => {
    const tabs = [];
    
    // Always add Preview tab
    tabs.push({
      id: 'preview',
      label: 'Preview',
      icon: <FaEye />,
      badge: selectedTests?.length || 0,
      color: '#667eea'
    });
    
    // Always add Master Slip tab - it shows ALL tests together
    tabs.push({
      id: 'master',
      label: 'Master Slip',
      icon: <FaFileAlt />,
      badge: processedOrderData?.tests?.length || 0,
      color: '#007bff'
    });
    
    // Debug: Log what departments we actually have
    console.log('Available departments:', processedOrderData?.tests?.map(test => test.department));
    
    // Add Department Slip tabs for each unique department
    const departments = [...new Set(processedOrderData?.tests?.map(test => test.department).filter(dept => dept !== 'Master'))];
    departments.forEach(dept => {
      tabs.push({
        id: `dept-${dept}`,
        label: dept,
        icon: <FaBuilding />,
        badge: processedOrderData.tests.filter(test => test.department === dept).length,
        color: '#28a745'
      });
    });
    
    // Add Summary tab
    tabs.push({
      id: 'summary',
      label: 'Summary',
      icon: <FaClipboard />,
      badge: processedOrderData?.tests?.length || 0,
      color: '#6c757d'
    });
    
    return tabs;
  }, [processedOrderData, selectedTests]);
  


  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (previewRef.current) previewRef.current.scrollTop = 0;
        if (modalContentRef.current) modalContentRef.current.scrollTop = 0;
      }, 50);
    }
  }, [isOpen]);

  // Group tests by department
  const testsByDepartment = useMemo(() => {
    if (!Array.isArray(selectedTests) || selectedTests.length === 0) {
      return {};
    }
    
    if (!Array.isArray(labTests)) {
      return {};
    }
    
          const selectedTestObjects = labTests.filter(test => {
        // Handle case where test.name might be an object
        let testName = test.name;
        if (testName && typeof testName === 'object') {
          testName = testName.value || testName.unit || testName.id || 'unknown';
        }
        const isIncluded = selectedTests.includes(testName);
        return isIncluded;
      });
    
    return selectedTestObjects.reduce((acc, test) => {
      const dept = test.department || 'Parasitology';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(test);
      return acc;
    }, {});
  }, [selectedTests, labTests]);

  // Calculate order summary
  const orderSummary = useMemo(() => {
    const selectedTestObjects = labTests.filter(test => {
      // Handle case where test.name might be an object
      let testName = test.name;
      if (testName && typeof testName === 'object') {
        testName = testName.value || testName.unit || testName.id || 'unknown';
      }
      return selectedTests.includes(testName);
    });
    const totalPrice = selectedTestObjects.reduce((sum, test) => {
      const price = parseFloat(test.price) || 0;
      return sum + price;
    }, 0);
    
    return {
      totalTests: selectedTestObjects.length,
      totalPrice: totalPrice,
      departments: Object.keys(testsByDepartment),
      orderId: orderData?.id || `ORD-${Date.now()}`,
      orderDate: new Date().toLocaleDateString(),
      patientName: patientData ? `${patientData.firstName} ${patientData.fathersName} ${patientData.grandFathersName} ${patientData.lastName}` : 'N/A',
      patientId: patientData?.id || 'N/A',
      phone: patientData?.phoneNumber || 'N/A'
    };
  }, [selectedTests, labTests, testsByDepartment, orderData, patientData]);

  // Mock order object for printing
  const mockOrder = useMemo(() => ({
    id: orderSummary.orderId,
    patientName: orderSummary.patientName,
    patientId: orderSummary.patientId,
    age: patientData?.age || 'N/A',
    gender: patientData?.gender || 'N/A',
    phone: orderSummary.phone,
    referringDoctor: orderData?.referringDoctor || 'N/A',
    priority: orderData?.priority || 'Normal',
    tests: Array.isArray(labTests) ? labTests.filter(test => {
      // Handle case where test.name might be an object
      let testName = test.name;
      if (testName && typeof testName === 'object') {
        testName = testName.value || testName.unit || testName.id || 'unknown';
      }
      return selectedTests.includes(testName);
    }) : [],
    notes: orderData?.notes || '',
  }), [orderSummary, patientData, orderData, selectedTests, labTests]);

  // Add a print handler
  const handlePrintMasterSlip = () => {
    const printContents = document.getElementById('print-master');
    if (!printContents) return;
    const printWindow = window.open('', '', 'width=900,height=1200');
    printWindow.document.write('<html><head><title>Print</title>');
    Array.from(document.head.children).forEach(node => {
      printWindow.document.write(node.outerHTML);
    });
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContents.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  // Add a print all handler
  const handlePrintAllSlips = () => {
    const master = document.getElementById('print-master');
    const deptIds = Object.keys(testsByDepartment).map(dept => `print-dept-${dept}`);
    const depts = deptIds.map(id => document.getElementById(id));
    const printWindow = window.open('', '', 'width=900,height=1200');
    printWindow.document.write('<html><head><title>Print</title>');
    Array.from(document.head.children).forEach(node => {
      printWindow.document.write(node.outerHTML);
    });
    printWindow.document.write('</head><body>');
    if (master) printWindow.document.write(master.innerHTML);
    depts.forEach(el => { if (el) printWindow.document.write(el.innerHTML); });
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  // Add download PDF handler
  const handleDownloadPdf = async () => {
    try {
      if (downloadPdf) {
        await downloadPdf(orderData, patientData, selectedTests);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={onClose}>

      <ModalContent
        ref={modalContentRef}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <ModalHeader>
          <HeaderTitle>
            <FaFileAlt /> Print Preview
          </HeaderTitle>
          <HeaderActions>
            <GlowButton
              onClick={handlePrintMasterSlip}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaPrint /> Print Master Slip
            </GlowButton>
            <GlowButton
              onClick={handlePrintAllSlips}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaPrint /> Print All Slips
            </GlowButton>
            <GlowButton
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaTimes /> Close
            </GlowButton>
          </HeaderActions>
        </ModalHeader>

        {/* Dynamic tab system */}
        <TabContainer>
          {availableTabs.map(tab => (
            <Tab 
              key={tab.id}
              $isActive={activeTab === tab.id} 
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
              <TabBadge color={tab.color}>{tab.badge}</TabBadge>
            </Tab>
          ))}
        </TabContainer>

        <ContentArea>
          {activeTab === 'preview' && (
            <PreviewContainer>
              <PrintPreview>


                {/* Show all slips in preview */}
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ color: '#007bff', marginBottom: '15px' }}>Master Slip (All Tests)</h4>
                  <MasterSlip 
                    order={processedOrderData} 
                    user={user}
                    settings={settings}
                  />
                </div>
                
                {processedOrderData?.tests?.filter(test => test.department !== 'Master').map(test => test.department).filter((dept, index, arr) => arr.indexOf(dept) === index).map(dept => (
                  <div key={dept} style={{ marginBottom: '30px' }}>
                    <h4 style={{ color: '#28a745', marginBottom: '15px' }}>{dept} Slip</h4>
                    <DepartmentSlip 
                      order={processedOrderData} 
                      department={dept}
                      tests={processedOrderData.tests.filter(test => test.department === dept)}
                      user={user}
                      settings={settings}
                    />
                  </div>
                ))}
              </PrintPreview>
            </PreviewContainer>
          )}

          {activeTab === 'master' && (
            <PreviewContainer>
              <PrintPreview>
                <MasterSlip 
                  order={processedOrderData} 
                  user={user}
                  settings={settings}
                />
              </PrintPreview>
            </PreviewContainer>
          )}

          {activeTab.startsWith('dept-') && (
            <PreviewContainer>
              <PrintPreview>
                {(() => {
                  const dept = activeTab.replace('dept-', '');
                  return (
                    <DepartmentSlip 
                      order={processedOrderData} 
                      department={dept}
                      tests={processedOrderData.tests.filter(test => test.department === dept)}
                      user={user}
                      settings={settings}
                    />
                  );
                })()}
              </PrintPreview>
            </PreviewContainer>
          )}

          {activeTab === 'summary' && (
            <OrderSummary>
              <SummaryGrid>
                <SummaryItem>
                  <SummaryLabel>Patient</SummaryLabel>
                  <SummaryValue>{patientData?.fullName || patientData?.firstName || 'N/A'}</SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>Tests</SummaryLabel>
                  <SummaryValue>{selectedTests?.length || 0}</SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>Order Date</SummaryLabel>
                  <SummaryValue>{new Date().toLocaleDateString()}</SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>Status</SummaryLabel>
                  <SummaryValue>Ready for Print</SummaryValue>
                </SummaryItem>
              </SummaryGrid>
              
              <DownloadButtonRow>
                <DownloadButton onClick={handleDownloadPdf}>
                  <FaDownload /> Download PDF
                </DownloadButton>
              </DownloadButtonRow>
            </OrderSummary>
          )}
        </ContentArea>

        <ActionButtons>
          <DownloadButton onClick={handleDownloadPdf}>
            <FaDownload /> Download PDF
          </DownloadButton>
        </ActionButtons>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default PrintPreviewModal; 