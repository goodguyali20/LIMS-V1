import React, { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
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
  const [viewMode, setViewMode] = useState('beautiful'); // 'beautiful' or 'simple'
  const downloadPdf = usePdfDownload();
  const previewRef = useRef(null);
  const modalContentRef = useRef(null);
  
  // State for real orders data
  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch real orders from Firebase (same as Orders page)
  useEffect(() => {
    if (!isOpen) return;
    
    setOrdersLoading(true);
    const q = query(
      collection(db, "testOrders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = [];
      querySnapshot.forEach((doc) => {
        const orderData = { id: doc.id, ...doc.data() };
        ordersData.push(orderData);
      });
      setAllOrders(ordersData);
      setOrdersLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setOrdersLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  // REAL queue number generation (same algorithm as Orders page)
  const generateQueueNumber = (createdAt) => {
    if (!createdAt) return 1;
    const today = new Date();
    const orderDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    
    if (orderDate.toDateString() === today.toDateString()) {
      // Count REAL orders created today
      const todayOrders = allOrders.filter(order => {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });
      return todayOrders.length + 1;
    }
    return 1;
  };

  // REAL department-specific numbers with Virology monthly reset
  const generateDepartmentNumbers = (tests) => {
    if (!tests || !Array.isArray(tests)) return {};
    
    const departmentNumbers = {};
    const today = new Date();
    
    tests.forEach(test => {
      const department = test.department || 'Unknown';
      if (!departmentNumbers[department]) {
        if (department === 'Virology') {
          // Virology: Monthly reset (1st of each month)
          const monthlyTestsInDept = allOrders.filter(order => {
            const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
            const orderMonth = orderDate.getMonth();
            const orderYear = orderDate.getFullYear();
            const todayMonth = today.getMonth();
            const todayYear = today.getFullYear();
            
            return orderMonth === todayMonth && 
                   orderYear === todayYear && 
                   order.tests?.some(t => t.department === 'Virology');
          });
          departmentNumbers[department] = monthlyTestsInDept.length + 1;
        } else {
          // All other departments: Daily reset
          const todayTestsInDept = allOrders.filter(order => {
            const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
            return orderDate.toDateString() === today.toDateString() && 
                   order.tests?.some(t => t.department === department);
          });
          departmentNumbers[department] = todayTestsInDept.length + 1;
        }
      }
    });
    
    return departmentNumbers;
  };

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

    // Generate REAL queue numbers based on actual orders data
    const queueNumber = generateQueueNumber(new Date());
    const departmentNumbers = generateDepartmentNumbers(tests);
    
    return {
      ...orderData,
      tests: tests,
      // Include patient information
      firstName: patientData?.firstName,
      fathersName: patientData?.fathersName,
      grandFathersName: patientData?.grandFathersName,
      lastName: patientData?.lastName,
      patientName: patientData ? `${patientData.firstName} ${patientData.fathersName || ''} ${patientData.grandFathersName || ''} ${patientData.lastName || ''}`.trim() : 'N/A',
      patientId: patientData?.id || patientData?.patientId || 'N/A',
      age: patientData?.age || 'N/A',
      gender: patientData?.gender || 'N/A',
      phone: patientData?.phoneNumber || patientData?.phone || 'N/A',
      referringDoctor: orderData?.referringDoctor || 'N/A',
      priority: orderData?.priority || 'Normal',
      notes: orderData?.notes || '',
      // Include address information
      address: patientData?.address || {},
      // Include queue numbers
      queueNumber: queueNumber,
      departmentNumbers: departmentNumbers
    };
  }, [orderData, selectedTests, labTests, patientData]);

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

  // Add a print handler for 70mm x 99mm paper with exact design
  const handlePrintMasterSlip = () => {
    const printWindow = window.open('', '', 'width=900,height=1200');
    printWindow.document.write('<html><head><title>Print Master Slip</title>');
    
    // Add comprehensive print styles that force the exact appearance on 70mm x 99mm
    printWindow.document.write(`
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          background: white;
          color: #1e293b;
          padding: 20px;
          line-height: 1.6;
        }
        
        .master-slip-wrapper {
          width: 210mm;
          min-height: 297mm;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          color: #1e293b;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
          margin: 0 auto;
          padding: 2.5rem 2rem 2rem 2rem;
          position: relative;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        
        .watermark {
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
        }
        
        .header {
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
        }
        
        .title {
          font-size: 2.2rem;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
        }
        
        .meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
        }
        
        .meta > div {
          padding: 0.25rem 0;
          border-bottom: 1px solid rgba(100, 116, 139, 0.1);
        }
        
        .meta > div:last-child {
          border-bottom: none;
        }
        
        .patient-queue-number {
          text-align: center;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border-radius: 12px;
          font-size: 1.5rem;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .section {
          margin-bottom: 2rem;
          z-index: 2;
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .section-title {
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          color: #3b82f6;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .section-title::before {
          content: '';
          width: 4px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 2px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem 1.5rem;
          font-size: 1rem;
        }
        
        .info-item {
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        
        .info-item strong {
          color: #1e293b;
          font-weight: 700;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          font-size: 1rem;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
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
        
        .footer {
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
        }
        
        @media print {
          body { margin: 0; padding: 0; }
          .master-slip-wrapper { 
            margin: 0; 
            padding: 1rem; 
            width: 210mm; 
            min-height: 297mm;
            page-break-inside: avoid;
          }
          .watermark { display: none; }
        }
      </style>
    `);
    
    printWindow.document.write('</head><body>');
    
    // Render the Master Slip with the exact structure and styling
    printWindow.document.write(`
      <div class="master-slip-wrapper">
        <div class="watermark">MASTER SLIP</div>
        <div class="header">
          <h1 class="title">Master Slip</h1>
          <div class="meta">
            <div>Order ID: ${processedOrderData?.id || processedOrderData?.orderId || 'Preview Mode'}</div>
            <div>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            <div>User: ${user?.displayName || user?.email || 'N/A'}</div>
          </div>
        </div>
        
        ${processedOrderData?.queueNumber ? `
          <div class="patient-queue-number">
            Patient Queue Number: #${processedOrderData.queueNumber}
          </div>
        ` : ''}
        
        <div class="section">
          <h2 class="section-title">Patient Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <strong>Name:</strong> ${processedOrderData?.firstName ? 
                `${processedOrderData.firstName} ${processedOrderData.fathersName || ''} ${processedOrderData.grandFathersName || ''} ${processedOrderData.lastName || ''}`.trim() : 
                (processedOrderData?.patientName || 'N/A')}
            </div>
            ${processedOrderData?.patientId && processedOrderData.patientId !== 'N/A' ? `
              <div class="info-item">
                <strong>Patient ID:</strong> ${processedOrderData.patientId}
              </div>
            ` : ''}
            ${(processedOrderData?.age || processedOrderData?.gender) ? `
              <div class="info-item">
                <strong>Age/Gender:</strong> ${processedOrderData.age || ''} ${processedOrderData.age && processedOrderData.gender ? ' / ' : ''} ${processedOrderData.gender || ''}
              </div>
            ` : ''}
            ${processedOrderData?.phone && processedOrderData.phone !== 'N/A' ? `
              <div class="info-item">
                <strong>Phone:</strong> ${processedOrderData.phone}
              </div>
            ` : ''}
            ${processedOrderData?.referringDoctor && processedOrderData.referringDoctor !== 'N/A' ? `
              <div class="info-item">
                <strong>Referring Doctor:</strong> ${processedOrderData.referringDoctor}
              </div>
            ` : ''}
            ${processedOrderData?.priority && processedOrderData.priority !== 'Normal' && processedOrderData.priority !== 'NORMAL' ? `
              <div class="info-item">
                <strong>Priority:</strong> ${processedOrderData.priority}
              </div>
            ` : ''}
            ${processedOrderData?.address && Object.keys(processedOrderData.address).length > 0 ? `
              <div class="info-item">
                <strong>Address:</strong> ${
                  [
                    processedOrderData.address.landmark ? (typeof processedOrderData.address.landmark === 'object' ? processedOrderData.address.landmark.label || processedOrderData.address.landmark.value : processedOrderData.address.landmark) : null,
                    processedOrderData.address.area ? (typeof processedOrderData.address.area === 'object' ? processedOrderData.address.area.label || processedOrderData.address.area.value : processedOrderData.address.area) : null,
                    processedOrderData.address.district ? (typeof processedOrderData.address.district === 'object' ? processedOrderData.address.district.label || processedOrderData.address.district.value : processedOrderData.address.district) : null,
                    processedOrderData.address.governorate ? (typeof processedOrderData.address.governorate === 'object' ? processedOrderData.address.governorate.label || processedOrderData.address.governorate.value : processedOrderData.address.governorate) : null
                  ].filter(Boolean).join(' - ')
                }
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">All Tests</h2>
          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Dept</th>
                <th>Q#</th>
              </tr>
            </thead>
            <tbody>
              ${processedOrderData?.tests?.map(test => {
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
                      if (test.name.value && test.name.unit) {
                        testName = `${test.name.value} ${test.name.unit}`;
                      } else {
                        testName = test.name.value || test.name.unit || 'Unknown Test';
                      }
                    }
                  }
                  testName = String(testName || 'Unknown Test');
                } catch (error) {
                  testName = 'Unknown Test';
                }
                
                const department = typeof test === 'object' ? test.department || 'General' : 'General';
                const queueNumber = processedOrderData?.departmentNumbers?.[department] || processedOrderData?.queueNumber || 'N/A';
                
                return `
                  <tr>
                    <td>${testName.length > 15 ? testName.substring(0, 15) + '...' : testName}</td>
                    <td>${department.substring(0, 3)}</td>
                    <td>#${queueNumber}</td>
                  </tr>
                `;
              }).join('') || ''}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <div>Printed by SmartLab LIMS</div>
        </div>
      </div>
    `);
    
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

  // Add a print all handler for 70mm x 99mm paper with exact design
  const handlePrintAllSlips = () => {
    const departments = [...new Set(processedOrderData?.tests?.map(test => 
      typeof test === 'object' ? test.department || 'General' : 'General'
    ) || [])];
    
    if (departments.length === 0) {
      alert('No departments found to print.');
      return;
    }
    
    const printWindow = window.open('', '', 'width=900,height=1200');
    printWindow.document.write('<html><head><title>Print All Slips</title>');
    
    // Add comprehensive print styles that force the exact appearance on 70mm x 99mm
    printWindow.document.write(`
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          background: white;
          color: #1e293b;
          padding: 20px;
          line-height: 1.6;
        }
        
        .dept-slip-wrapper {
          width: 210mm;
          min-height: 297mm;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          color: #1e293b;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
          margin: 0 auto 2rem auto;
          padding: 2.5rem 2rem 2rem 2rem;
          position: relative;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        
        .watermark {
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
        }
        
        .header {
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
        }
        
        .title {
          font-size: 2.2rem;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
        }
        
        .meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
        }
        
        .meta > div {
          padding: 0.25rem 0;
          border-bottom: 1px solid rgba(100, 116, 139, 0.1);
        }
        
        .meta > div:last-child {
          border-bottom: none;
        }
        
        .dept-queue-number {
          text-align: center;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border-radius: 12px;
          font-size: 1.5rem;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .section {
          margin-bottom: 2rem;
          z-index: 2;
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .section-title {
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          color: #3b82f6;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .section-title::before {
          content: '';
          width: 4px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 2px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem 1.5rem;
          font-size: 1rem;
        }
        
        .info-item {
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        
        .info-item strong {
          color: #1e293b;
          font-weight: 700;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          font-size: 1rem;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
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
        
        .footer {
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
        }
        
        @media print {
          body { margin: 0; padding: 0; }
          .dept-slip-wrapper { 
            margin: 0 0 1rem 0; 
            padding: 1rem; 
            width: 210mm; 
            min-height: 297mm;
            page-break-inside: avoid;
          }
          .watermark { display: none; }
        }
      </style>
    `);
    
    printWindow.document.write('</head><body>');
    
    // Generate each department slip with the exact structure
    departments.forEach((dept, index) => {
      if (index > 0) {
        printWindow.document.write('<div style="page-break-before: always;"></div>');
      }
      
      const deptTests = processedOrderData?.tests?.filter(test => 
        typeof test === 'object' ? test.department === dept : false
      ) || [];
      
      printWindow.document.write(`
        <div class="dept-slip-wrapper">
          <div class="watermark">DEPARTMENT SLIP</div>
          <div class="header">
            <h1 class="title">${dept}</h1>
            <div class="meta">
              <div>Order ID: ${processedOrderData?.id || processedOrderData?.orderId || 'Preview Mode'}</div>
              <div>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
              <div>User: ${user?.displayName || user?.email || 'N/A'}</div>
            </div>
          </div>
          
          ${processedOrderData?.departmentNumbers?.[dept] ? `
            <div class="dept-queue-number">
              ${dept} Queue Number: #${processedOrderData.departmentNumbers[dept]}
            </div>
          ` : ''}
          
          <div class="section">
            <h2 class="section-title">Patient Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <strong>Name:</strong> ${processedOrderData?.firstName ? 
                  `${processedOrderData.firstName} ${processedOrderData.fathersName || ''} ${processedOrderData.grandFathersName || ''} ${processedOrderData.lastName || ''}`.trim() : 
                  (processedOrderData?.patientName || 'N/A')}
              </div>
              ${processedOrderData?.patientId && processedOrderData.patientId !== 'N/A' ? `
                <div class="info-item">
                  <strong>Patient ID:</strong> ${processedOrderData.patientId}
                </div>
              ` : ''}
              ${(processedOrderData?.age || processedOrderData?.gender) ? `
                <div class="info-item">
                  <strong>Age/Gender:</strong> ${processedOrderData.age || ''} ${processedOrderData.age && processedOrderData.gender ? ' / ' : ''} ${processedOrderData.gender || ''}
                </div>
              ` : ''}
              ${dept === 'Virology' && processedOrderData?.phone && processedOrderData.phone !== 'N/A' ? `
                <div class="info-item">
                  <strong>Phone:</strong> ${processedOrderData.phone}
                </div>
              ` : ''}
              ${processedOrderData?.referringDoctor && processedOrderData.referringDoctor !== 'N/A' ? `
                <div class="info-item">
                  <strong>Referring Doctor:</strong> ${processedOrderData.referringDoctor}
                </div>
              ` : ''}
              ${dept === 'Virology' && processedOrderData?.address && Object.keys(processedOrderData.address).length > 0 ? `
                <div class="info-item">
                  <strong>Address:</strong> ${
                    [
                      processedOrderData.address.landmark ? (typeof processedOrderData.address.landmark === 'object' ? processedOrderData.address.landmark.label || processedOrderData.address.landmark.value : processedOrderData.address.landmark) : null,
                      processedOrderData.address.area ? (typeof processedOrderData.address.area === 'object' ? processedOrderData.address.area.label || processedOrderData.address.area.value : processedOrderData.address.area) : null,
                      processedOrderData.address.district ? (typeof processedOrderData.address.district === 'object' ? processedOrderData.address.district.label || processedOrderData.address.district.value : processedOrderData.address.district) : null,
                      processedOrderData.address.governorate ? (typeof processedOrderData.address.governorate === 'object' ? processedOrderData.address.governorate.label || processedOrderData.address.governorate.value : processedOrderData.address.governorate) : null
                    ].filter(Boolean).join(' - ')
                  }
                </div>
              ` : ''}
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Tests for ${dept}</h2>
            <table>
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Queue #</th>
                </tr>
              </thead>
              <tbody>
                ${deptTests.map(test => {
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
                        if (test.name.value && test.name.unit) {
                          testName = `${test.name.value} ${test.name.unit}`;
                        } else {
                          testName = test.name.value || test.name.unit || 'Unknown Test';
                        }
                      }
                    }
                    testName = String(testName || 'Unknown Test');
                  } catch (error) {
                    testName = 'Unknown Test';
                  }
                  
                  const queueNumber = processedOrderData?.departmentNumbers?.[dept] || processedOrderData?.queueNumber || 'N/A';
                  
                  return `
                    <tr>
                      <td>${testName}</td>
                      <td>#${queueNumber}</td>
                    </tr>
                  `;
                }).join('') || ''}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <div>Printed by SmartLab LIMS</div>
          </div>
        </div>
      `);
    });
    
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  // Simple print-optimized Master Slip component
  const SimpleMasterSlip = ({ order, user, settings }) => (
    <>
      <style>
        {`
          @media print {
            .simple-master-slip {
              width: 70mm !important;
              height: 99mm !important;
              padding: 10px !important;
              margin: 0 !important;
              page-break-after: always !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
            }
          }
        `}
      </style>
      <div 
        className="simple-master-slip"
        style={{
          width: '70mm',
          height: '99mm',
          background: 'white',
          color: 'black',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          lineHeight: '1.4',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '15px', position: 'relative' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>MASTER SLIP</h1>
        {/* Meta info stacked at top left */}
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          fontSize: '14px', 
          fontWeight: '600',
          textAlign: 'left',
          lineHeight: '1.3'
        }}>
          <div>Order ID: {order?.id || order?.orderId || 'N/A'}</div>
          <div>Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          <div>User: {user?.displayName || user?.email || 'N/A'}</div>
        </div>
        {/* Queue Number in top right */}
        {order?.queueNumber && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#333',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '8px 12px',
            borderRadius: '6px',
            minWidth: '60px',
            textAlign: 'center'
          }}>
            #{order.queueNumber}
          </div>
        )}
      </div>

      {/* Patient Information */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
          <div style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}><strong>Name:</strong> {order?.firstName ? 
            `${order.firstName} ${order.fathersName || ''} ${order.grandFathersName || ''} ${order.lastName || ''}`.trim() : 
            (order?.patientName || 'N/A')}</div>
          {order?.address && Object.keys(order.address).length > 0 && (
            <div style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}><strong>Address:</strong> {
              [
                order.address.landmark ? (typeof order.address.landmark === 'object' ? order.address.landmark.label || order.address.landmark.value : order.address.landmark) : null,
                order.address.area ? (typeof order.address.area === 'object' ? order.address.area.label || order.address.area.value : order.address.area) : null,
                order.address.district ? (typeof order.address.district === 'object' ? order.address.district.label || order.address.district.value : order.address.district) : null,
                order.address.governorate ? (typeof order.address.governorate === 'object' ? order.address.governorate.label || order.address.governorate.value : order.address.governorate) : null
              ].filter(Boolean).join(' - ')
            }</div>
          )}
          {(order?.age || order?.gender) && (
            <div style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}><strong>Age/Gender:</strong> {typeof order?.age === 'object' ? `${order?.age?.value || ''} ${order?.age?.unit || ''}` : order?.age || ''} {order?.age && order?.gender ? ' / ' : ''} {order.gender || ''}</div>
          )}
          {order?.phone && order.phone !== 'N/A' && (
            <div style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}><strong>Phone:</strong> {order.phone}</div>
          )}
          {order?.patientId && order.patientId !== 'N/A' && (
            <div style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}><strong>Patient ID:</strong> {order.patientId}</div>
          )}
          {order?.referringDoctor && order.referringDoctor !== 'N/A' && (
            <div style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}><strong>Referring Doctor:</strong> {order.referringDoctor}</div>
          )}
          {order?.priority && order.priority !== 'Normal' && order.priority !== 'NORMAL' && (
            <div style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}><strong>Priority:</strong> {order.priority}</div>
          )}
        </div>
      </div>

      {/* Tests */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '8px', borderBottom: '2px solid #333', paddingBottom: '3px', fontWeight: 'bold' }}>All Tests</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', fontSize: '16px', fontWeight: 'bold' }}>Test</th>
              <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', fontSize: '16px', fontWeight: 'bold' }}>Dept</th>
              <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', fontSize: '16px', fontWeight: 'bold' }}>Q</th>
            </tr>
          </thead>
          <tbody>
            {order?.tests?.map((test, index) => {
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
                    if (test.name.value && test.name.unit) {
                      testName = `${test.name.value} ${test.name.unit}`;
                    } else {
                      testName = test.name.value || test.name.unit || 'Unknown Test';
                    }
                  }
                }
                testName = String(testName || 'Unknown Test');
              } catch (error) {
                testName = 'Unknown Test';
              }
              
              const department = typeof test === 'object' ? test.department || 'General' : 'General';
              const queueNumber = order?.departmentNumbers?.[department] || order?.queueNumber || 'N/A';
              
              return (
                <tr key={index} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                  <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '14px' }}>{testName}</td>
                  <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '14px' }}>{department}</td>
                  <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '14px' }}>#{queueNumber}</td>
                </tr>
              );
            }) || []}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center', 
        fontSize: '10px', 
        color: '#666',
        borderTop: '1px solid #ddd',
        paddingTop: '10px'
      }}>
        Printed by SmartLab LIMS
      </div>
    </div>
    </>
  );

  // Simple print-optimized Department Slip component
  const SimpleDepartmentSlip = ({ order, department, tests, user, settings }) => (
    <div className="simple-dept-slip" style={{ width: '70mm', height: '99mm', background: 'white', color: 'black', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'Arial, sans-serif', fontSize: '16px', lineHeight: '1.4', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{department}</h1>
        <div style={{ fontSize: '14px', textAlign: 'left' }}>
          <div>Order ID: {order?.id || order?.orderId || 'N/A'}</div>
          <div>Date: {new Date().toLocaleDateString()}</div>
          <div>User: {user?.displayName || user?.email || 'N/A'}</div>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px' }}>
          <div><strong>Name:</strong> {order?.firstName ? `${order.firstName} ${order.fathersName || ''} ${order.grandFathersName || ''} ${order.lastName || ''}`.trim() : (order?.patientName || 'N/A')}</div>
          {(order?.age || order?.gender) && (
            <div><strong>Age/Gender:</strong> {typeof order?.age === 'object' ? `${order?.age?.value || ''} ${order?.age?.unit || ''}` : order?.age || ''} {order?.age && order?.gender ? ' / ' : ''} {order.gender || ''}</div>
          )}
          {order?.patientId && order.patientId !== 'N/A' && (
            <div><strong>Patient ID:</strong> {order.patientId}</div>
          )}
        </div>
      </div>
      
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '8px', borderBottom: '2px solid #333', paddingBottom: '3px', fontWeight: 'bold' }}>Tests for {department}</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', fontSize: '16px', fontWeight: 'bold' }}>Test</th>
              <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', fontSize: '16px', fontWeight: 'bold' }}>Queue</th>
            </tr>
          </thead>
          <tbody>
            {tests?.map((test, index) => {
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
                    if (test.name.value && test.name.unit) {
                      testName = `${test.name.value} ${test.name.unit}`;
                    } else {
                      testName = test.name.value || test.name.unit || 'Unknown Test';
                    }
                  }
                }
                testName = String(testName || 'Unknown Test');
              } catch (error) {
                testName = 'Unknown Test';
              }
              
              const queueNumber = order?.departmentNumbers?.[department] || order?.queueNumber || 'N/A';
              
              return (
                <tr key={index} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                  <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '14px' }}>{testName}</td>
                  <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '14px' }}>#{queueNumber}</td>
                </tr>
              );
            }) || []}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '10px', color: '#666', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
        Printed by SmartLab LIMS
      </div>
    </div>
  );

  if (!isOpen) return null;

  console.log('PrintPreviewModal: Starting JSX render');
  console.log('PrintPreviewModal: activeTab =', activeTab);
  console.log('PrintPreviewModal: viewMode =', viewMode);
  console.log('PrintPreviewModal: processedOrderData =', processedOrderData);

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
              onClick={() => setViewMode(viewMode === 'beautiful' ? 'simple' : 'beautiful')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: viewMode === 'beautiful' 
                  ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                  : 'linear-gradient(135deg, #10b981, #059669)'
              }}
            >
              {viewMode === 'beautiful' ? <FaEye /> : <FaPrint />}
              {viewMode === 'beautiful' ? 'Switch to Simple' : 'Switch to Beautiful'}
            </GlowButton>
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
                {viewMode === 'beautiful' ? (
                  <>
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
                        <h4 style={{ color: '#007bff', marginBottom: '15px' }}>{dept} Slip</h4>
                        <DepartmentSlip 
                          order={processedOrderData} 
                          department={dept}
                          tests={processedOrderData.tests.filter(test => test.department === dept)}
                          user={user}
                          settings={settings}
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {/* Simple print-optimized view */}
                    <div style={{ marginBottom: '30px' }}>
                      <h4 style={{ color: '#10b981', marginBottom: '15px' }}>Master Slip (All Tests) - Simple View</h4>
                      <SimpleMasterSlip 
                        order={processedOrderData} 
                        user={user}
                        settings={settings}
                      />
                    </div>
                    
                    {processedOrderData?.tests?.filter(test => test.department !== 'Master').map(test => test.department).filter((dept, index, arr) => arr.indexOf(dept) === index).map(dept => (
                      <div key={dept} style={{ marginBottom: '30px' }}>
                        <h4 style={{ color: '#10b981', marginBottom: '15px' }}>{dept} Slip - Simple View</h4>
                        <SimpleDepartmentSlip 
                          order={processedOrderData} 
                          department={dept}
                          tests={processedOrderData.tests.filter(test => test.department === dept)}
                          user={user}
                          settings={settings}
                        />
                      </div>
                    ))}
                  </>
                )}
              </PrintPreview>
            </PreviewContainer>
          )}

          {activeTab === 'master' && (
            <PreviewContainer>
              <PrintPreview>
                {viewMode === 'beautiful' ? (
                  <MasterSlip 
                    order={processedOrderData} 
                    user={user}
                    settings={settings}
                  />
                ) : (
                  <SimpleMasterSlip 
                    order={processedOrderData} 
                    user={user}
                    settings={settings}
                  />
                )}
              </PrintPreview>
            </PreviewContainer>
          )}

          {activeTab.startsWith('dept-') && (
            <PreviewContainer>
              <PrintPreview>
                {(() => {
                  const dept = activeTab.replace('dept-', '');
                  return viewMode === 'beautiful' ? (
                    <DepartmentSlip 
                      order={processedOrderData} 
                      department={dept}
                      tests={processedOrderData.tests.filter(test => test.department === dept)}
                      user={user}
                      settings={settings}
                    />
                  ) : (
                    <SimpleDepartmentSlip 
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