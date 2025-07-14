import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FaPrint, FaTimes, FaEye, FaDownload, FaCopy, FaShare,
  FaFileAlt, FaBuilding, FaUser, FaCalendar, FaPhone
} from 'react-icons/fa';
import { useTestCatalog } from '../../contexts/TestContext';
import GlowButton from '../common/GlowButton.jsx';
import MasterSlip from '../Print/MasterSlip.jsx';
import DepartmentSlip from '../Print/DepartmentSlip.jsx';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
`;

const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  width: 95%;
  max-width: 1200px;
  height: 90vh;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
`;

const HeaderTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

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
  const [activeTab, setActiveTab] = useState('master');

  // Group tests by department
  const testsByDepartment = useMemo(() => {
    const selectedTestObjects = labTests.filter(test => selectedTests.includes(test.name));
    return selectedTestObjects.reduce((acc, test) => {
      const dept = test.department || 'General';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(test);
      return acc;
    }, {});
  }, [selectedTests, labTests]);

  // Calculate order summary
  const orderSummary = useMemo(() => {
    const selectedTestObjects = labTests.filter(test => selectedTests.includes(test.name));
    return {
      totalTests: selectedTests.length,
      totalPrice: selectedTestObjects.reduce((sum, test) => sum + (test.price || 0), 0),
      departments: Object.keys(testsByDepartment),
      orderId: orderData?.id || `ORD-${Date.now()}`,
      orderDate: new Date().toLocaleDateString(),
      patientName: patientData ? `${patientData.firstName} ${patientData.lastName}` : 'N/A',
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
    tests: selectedTests.map(testName => {
      const test = labTests.find(t => t.name === testName);
      return {
        name: testName,
        department: test?.department || 'General',
        price: test?.price || 0,
        status: 'Pending'
      };
    })
  }), [orderSummary, patientData, orderData, selectedTests, labTests]);

  const handlePrint = (type) => {
    const printWindow = window.open('', '_blank');
    const content = document.getElementById(`print-${type}`);
    
    if (printWindow && content) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print ${type === 'master' ? 'Master Slip' : 'Department Slip'}</title>
            <style>
              body { margin: 0; padding: 0; }
              @media print {
                body { margin: 0; }
                .print-only-premium { display: block !important; }
              }
            </style>
          </head>
          <body>
            ${content.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handlePrintAll = () => {
    // Print master slip first
    handlePrint('master');
    
    // Print department slips
    setTimeout(() => {
      Object.keys(testsByDepartment).forEach((dept, index) => {
        setTimeout(() => {
          handlePrint(`dept-${dept}`);
        }, index * 1000);
      });
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <ModalHeader>
          <HeaderTitle>
            <FaFileAlt /> Print Preview
          </HeaderTitle>
          <HeaderActions>
            <GlowButton
              onClick={handlePrintAll}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaPrint /> Print All
            </GlowButton>
            <GlowButton
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaTimes /> Close
            </GlowButton>
          </HeaderActions>
        </ModalHeader>

        <OrderSummary>
          <SummaryGrid>
            <SummaryItem>
              <SummaryLabel>Patient Name</SummaryLabel>
              <SummaryValue>{orderSummary.patientName}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Order ID</SummaryLabel>
              <SummaryValue>{orderSummary.orderId}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Total Tests</SummaryLabel>
              <SummaryValue>{orderSummary.totalTests}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Total Price</SummaryLabel>
              <SummaryValue>${orderSummary.totalPrice.toFixed(2)}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Departments</SummaryLabel>
              <SummaryValue>{orderSummary.departments.length}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Order Date</SummaryLabel>
              <SummaryValue>{orderSummary.orderDate}</SummaryValue>
            </SummaryItem>
          </SummaryGrid>
          
          <ActionButtons>
            <GlowButton
              onClick={() => handlePrint('master')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaPrint /> Print Master Slip
            </GlowButton>
            {Object.keys(testsByDepartment).map(dept => (
              <GlowButton
                key={dept}
                onClick={() => handlePrint(`dept-${dept}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FaBuilding /> Print {dept} Slip
              </GlowButton>
            ))}
          </ActionButtons>
        </OrderSummary>

        <TabContainer>
          <Tab
            $isActive={activeTab === 'master'}
            onClick={() => setActiveTab('master')}
          >
            <FaFileAlt /> Master Slip
          </Tab>
          {Object.keys(testsByDepartment).map(dept => (
            <Tab
              key={dept}
              $isActive={activeTab === `dept-${dept}`}
              onClick={() => setActiveTab(`dept-${dept}`)}
            >
              <FaBuilding /> {dept}
              <TabBadge color={departmentColors[dept]}>
                {testsByDepartment[dept].length}
              </TabBadge>
            </Tab>
          ))}
        </TabContainer>

        <ContentArea>
          <PreviewContainer>
            <AnimatePresence mode="wait">
              {activeTab === 'master' && (
                <motion.div
                  key="master"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PrintPreview id="print-master">
                    <MasterSlip
                      order={mockOrder}
                      user={user}
                      settings={settings}
                    />
                  </PrintPreview>
                </motion.div>
              )}
              
              {Object.keys(testsByDepartment).map(dept => (
                activeTab === `dept-${dept}` && (
                  <motion.div
                    key={`dept-${dept}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PrintPreview id={`print-dept-${dept}`}>
                      <DepartmentSlip
                        order={mockOrder}
                        department={dept}
                        tests={testsByDepartment[dept]}
                        user={user}
                        settings={settings}
                      />
                    </PrintPreview>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </PreviewContainer>
        </ContentArea>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default PrintPreviewModal; 