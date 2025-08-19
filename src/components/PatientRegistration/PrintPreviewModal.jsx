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
  padding: ${({ $viewMode }) => $viewMode === 'simple' ? '1rem' : '2rem'};
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  
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
  max-width: ${({ $viewMode }) => $viewMode === 'simple' ? '100%' : '800px'};
  transform: ${({ $viewMode }) => $viewMode === 'simple' ? 'scale(1.5)' : 'scale(0.8)'};
  transform-origin: top center;
  transition: all 0.3s ease;
  
  @media print {
    transform: none;
    box-shadow: none;
    border-radius: 0;
    max-width: none;
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
  const [viewMode, setViewMode] = useState('simple'); // 'simple' or 'beautiful'
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
          @page {
            size: A4;
            margin: 0;
          }
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
          @page {
            size: A4;
            margin: 0;
          }
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
                  <th style={{ 
                    border: '1px solid #ddd', 
                    padding: '12px 8px', 
                    textAlign: 'left', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    background: '#e9ecef',
                    width: '75%'
                  }}>Test</th>
                  <th style={{ 
                    border: '1px solid #ddd', 
                    padding: '12px 8px', 
                    textAlign: 'center', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    background: '#e9ecef',
                    width: '25%'
                  }}>Queue #</th>
                </tr>
              </thead>
              <tbody>
                ${deptTests.map((test, index) => {
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
                      <td style={{ 
                        border: '1px solid #ddd', 
                        padding: '12px 8px', 
                        fontSize: '14px',
                        wordWrap: 'break-word',
                        maxWidth: 'none'
                      }}>${testName}</td>
                      <td style={{ 
                        border: '1px solid #ddd', 
                        padding: '12px 8px', 
                        fontSize: '14px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#007bff'
                      }}>#{queueNumber}</td>
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
            @page {
              size: 70mm 99mm;
              margin: 0;
            }
            .simple-master-slip {
              width: 70mm !important;
              height: 99mm !important;
              padding: 8mm !important;
              margin: 0 !important;
              page-break-after: always !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              font-size: 14px !important;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}
      </style>
      <div 
        className="simple-master-slip simple-print-view"
        style={{
          width: '280px', // 4x larger for better preview visibility
          height: '396px', // 4x larger for better preview visibility
          background: 'white',
          color: 'black',
          padding: '20px', // 4x larger padding
          fontFamily: 'Arial, sans-serif',
          fontSize: '40px', // 4x larger font
          lineHeight: '1.2',
          boxSizing: 'border-box',
          border: '2px solid #000',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <div style={{ 
          marginBottom: '15px',
          marginTop: '20px'
        }}>
          {/* Three-column layout: User info | Title | Queue number */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px'
          }}>
            {/* Left column - User info */}
            <div style={{ textAlign: 'left', fontSize: '10px' }}>
              <div>User: {user?.displayName || user?.email || 'N/A'}</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
            </div>
            
            {/* Center column - Title */}
            <div style={{
              textAlign: 'center',
              borderBottom: '1px solid #000',
              paddingBottom: '8px'
            }}>
              <h1 style={{ 
                margin: '0',
                fontSize: '14px', 
                fontWeight: 'bold'
              }}>MASTER SLIP</h1>
            </div>
            
            {/* Right column - Queue number */}
            <div style={{ textAlign: 'right' }}>
              {order?.queueNumber && (
                <div style={{
                  background: '#000',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '3px 6px',
                  borderRadius: '3px',
                  display: 'inline-block'
                }}>
                  #{order.queueNumber}
                </div>
              )}
            </div>
          </div>
          
          {/* Additional line under header */}
          <div style={{
            borderBottom: '1px solid #000',
            marginBottom: '10px'
          }}></div>
        </div>

        {/* Patient Information */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr', 
            gap: '4px', 
            fontSize: '10px' 
          }}>
            <div><strong>Name:</strong> {order?.firstName ? 
              `${order.firstName} ${order.fathersName || ''} ${order.grandFathersName || ''} ${order.lastName || ''}`.trim() : 
              (order?.patientName || 'N/A')}</div>
            {order?.address && Object.keys(order.address).length > 0 && (
              <div><strong>Address:</strong> {
                [
                  order.address.landmark ? (typeof order.address.landmark === 'object' ? order.address.landmark.label || order.address.landmark.value : order.address.landmark) : null,
                  order.address.area ? (typeof order.address.area === 'object' ? order.address.area.label || order.address.area.value : order.address.area) : null,
              order.address.district ? (typeof order.address.district === 'object' ? order.address.district.label || order.address.district.value : order.address.district) : null,
              order.address.governorate ? (typeof order.address.governorate === 'object' ? order.address.governorate.label || order.address.governorate.value : order.address.governorate) : null
                ].filter(Boolean).join(' - ')
              }</div>
            )}
            {(order?.age || order?.gender) && (
              <div><strong>Age/Gender:</strong> {typeof order?.age === 'object' ? `${order?.age?.value || ''} ${order?.age?.unit || ''}` : order?.age || ''} {order?.age && order?.gender ? ' / ' : ''} {order.gender || ''}</div>
            )}
            {order?.phone && order.phone !== 'N/A' && (
              <div><strong>Phone:</strong> {order.phone}</div>
            )}
            {order?.patientId && order.patientId !== 'N/A' && (
              <div><strong>Patient ID:</strong> {order.patientId}</div>
            )}
            {order?.referringDoctor && order.referringDoctor !== 'N/A' && (
              <div><strong>Referring Doctor:</strong> {order.referringDoctor}</div>
            )}
            {order?.priority && order.priority !== 'Normal' && order.priority !== 'NORMAL' && (
              <div><strong>Priority:</strong> {order.priority}</div>
            )}
          </div>
        </div>

        {/* Tests */}
        <div>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            fontSize: '10px'
          }}>
            <thead>
              <tr>
                <th style={{ 
                  border: '1px solid #000', 
                  padding: '2px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  background: '#f0f0f0'
                }}>Test</th>
                <th style={{ 
                  border: '1px solid #000', 
                  padding: '2px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  background: '#f0f0f0'
                }}>Dept</th>
                <th style={{ 
                  border: '1px solid #000', 
                  padding: '2px', 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  background: '#f0f0f0'
                }}>Q</th>
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
                  <tr key={index}>
                    <td style={{ 
                      border: '1px solid #000', 
                      padding: '2px'
                    }}>{testName}</td>
                    <td style={{ 
                      border: '1px solid #000', 
                      padding: '2px'
                    }}>{department}</td>
                    <td style={{ 
                      border: '1px solid #000', 
                      padding: '2px',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>#{queueNumber}</td>
                  </tr>
                );
              }) || []}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ 
          position: 'absolute',
          bottom: '10px',
          right: '20px',
          textAlign: 'right', 
          fontSize: '8px', 
          color: '#666',
          fontStyle: 'italic'
        }}>
          Printed by SmartLab app
        </div>
      </div>
    </>
  );

  // Simple print-optimized Department Slip component
  const SimpleDepartmentSlip = ({ order, department, tests, user, settings }) => (
    <>
      <style>
        {`
          @media print {
            @page {
              size: 70mm 99mm;
              margin: 0;
            }
            .simple-dept-slip {
              width: 70mm !important;
              height: 70mm !important;
              padding: 8mm !important;
              margin: 0 !important;
              page-break-after: always !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              font-size: 14px !important;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}
      </style>
      <div 
        className="simple-dept-slip simple-print-view" 
        style={{ 
          width: '280px', // 4x larger for better preview visibility
          height: '396px', // 4x larger for better preview visibility
          background: 'white', 
          color: 'black', 
          padding: '20px', // 4x larger padding
          fontFamily: 'Arial, sans-serif', 
          fontSize: '40px', // 4x larger font
          lineHeight: '1.2', 
          boxSizing: 'border-box',
          border: '2px solid #000',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <div style={{ 
          marginBottom: '20px',
          marginTop: '20px'
        }}>
          {/* Three-column layout: User info | Title | Queue number */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px'
          }}>
            {/* Left column - User info */}
            <div style={{ textAlign: 'left', fontSize: '10px' }}>
              <div>User: {user?.displayName || user?.email || 'N/A'}</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
            </div>
            
            {/* Center column - Title */}
            <div style={{
              textAlign: 'center',
              borderBottom: '1px solid #000',
              paddingBottom: '10px'
            }}>
              <h1 style={{ 
                margin: '0',
                fontSize: '18px', 
                fontWeight: 'bold'
              }}>{department}</h1>
            </div>
            
            {/* Right column - Queue number */}
            <div style={{ textAlign: 'right' }}>
              {order?.departmentNumbers?.[department] && (
                <div style={{
                  background: '#000',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  padding: '5px 10px',
                  borderRadius: '3px',
                  display: 'inline-block'
                }}>
                  #{order.departmentNumbers[department]}
                </div>
              )}
            </div>
          </div>
          
          {/* Additional line under header */}
          <div style={{
            borderBottom: '1px solid #000',
            marginBottom: '10px'
          }}></div>
        </div>
        
                {/* Patient Information */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr', 
            gap: '4px', 
            fontSize: '10px' 
          }}>
            <div><strong>Name:</strong> {order?.firstName ? `${order.firstName} ${order.fathersName || ''} ${order.grandFathersName || ''} ${order.lastName || ''}`.trim() : (order?.patientName || 'N/A')}</div>
            {(order?.age || order?.gender) && (
              <div><strong>Age/Gender:</strong> {typeof order?.age === 'object' ? `${order?.age?.value || ''} ${order?.age?.unit || ''}` : order?.age || ''} {order?.age && order?.gender ? ' / ' : ''} {order.gender || ''}</div>
            )}
            {order?.patientId && order.patientId !== 'N/A' && (
              <div><strong>Patient ID:</strong> {order.patientId}</div>
            )}
            {order?.phone && order.phone !== 'N/A' && (
              <div><strong>Phone:</strong> {order.phone}</div>
            )}
            {order?.address && Object.keys(order.address).length > 0 && (
              <div><strong>Address:</strong> {
                [
                  order.address.landmark ? (typeof order.address.landmark === 'object' ? order.address.landmark.label || order.address.landmark.value : order.address.landmark) : null,
                  order.address.area ? (typeof order.address.area === 'object' ? order.address.area.label || order.address.area.value : order.address.area) : null,
                  order.address.district ? (typeof order.address.district === 'object' ? order.address.district.label || order.address.district.value : order.address.district) : null,
                  order.address.governorate ? (typeof order.address.governorate === 'object' ? order.address.governorate.label || order.address.governorate.value : order.address.governorate) : null
                ].filter(Boolean).join(' - ')
              }</div>
            )}
          </div>
        </div>
        
        {/* Tests */}
        <div>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            fontSize: '10px'
          }}>
            <thead>
              <tr>
                <th style={{ 
                  border: '1px solid #000', 
                  padding: '2px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  background: '#f0f0f0'
                }}>Test</th>
                <th style={{ 
                  border: '1px solid #000', 
                  padding: '2px', 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  background: '#f0f0f0'
                }}>Q</th>
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
                  <tr key={index}>
                    <td style={{ 
                      border: '1px solid #000', 
                      padding: '2px'
                    }}>{testName}</td>
                    <td style={{ 
                      border: '1px solid #000', 
                      padding: '2px',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>#{queueNumber}</td>
                  </tr>
                );
              }) || []}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div style={{ 
          position: 'absolute',
          bottom: '10px',
          right: '20px',
          textAlign: 'right', 
          fontSize: '8px', 
          color: '#666',
          fontStyle: 'italic'
        }}>
          Printed by SmartLab app
        </div>
      </div>
    </>
  );

  if (!isOpen) return null;

  console.log('PrintPreviewModal: Starting JSX render');
  console.log('PrintPreviewModal: activeTab =', activeTab);
  console.log('PrintPreviewModal: viewMode =', viewMode);
  console.log('PrintPreviewModal: processedOrderData =', processedOrderData);

  return (
    <>
      {/* Global print styles for simple view */}
      <style>
        {`
          @media print {
            @page {
              size: 70mm 99mm;
              margin: 0;
            }
            .simple-print-view {
              width: 70mm !important;
              height: 99mm !important;
              padding: 8mm !important;
              margin: 0 !important;
              page-break-after: always !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              font-size: 14px !important;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}
      </style>
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
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <GlowButton
                $size="sm"
                onClick={() => setViewMode(viewMode === 'simple' ? 'beautiful' : 'simple')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  fontSize: '0.875rem',
                  padding: '0.5rem 1rem'
                }}
              >
                {viewMode === 'simple' ? <FaEye /> : <FaPrint />}
                {viewMode === 'simple' ? 'Beautiful View' : 'Simple View'}
              </GlowButton>
              {viewMode === 'simple' && (
                <GlowButton
                  $size="sm"
                  $variant="success"
                  onClick={() => {
                    const printWindow = window.open('', '', 'width=900,height=1200');
                    printWindow.document.write('<html><head><title>Print Simple View</title>');
                    printWindow.document.write(`
                      <style>
                        @page {
                          size: 70mm 99mm;
                          margin: 0;
                        }
                        body {
                          margin: 0;
                          padding: 0;
                          font-family: Arial, sans-serif;
                          background: white;
                        }
                        .simple-print-view, .simple-master-slip, .simple-dept-slip {
                          width: 70mm !important;
                          height: 99mm !important;
                          padding: 8mm !important;
                          margin: 0 !important;
                          page-break-after: always !important;
                          box-sizing: border-box !important;
                          overflow: hidden !important;
                          page-break-inside: avoid !important;
                          font-size: 14px !important;
                          background: white !important;
                          color: black !important;
                          border: none !important;
                        }
                        .simple-dept-slip {
                          height: 70mm !important;
                        }
                        table {
                          width: 100% !important;
                          border-collapse: collapse !important;
                          font-size: 12px !important;
                          margin-top: 3mm !important;
                        }
                        th, td {
                          border: 1px solid black !important;
                          padding: 1mm !important;
                          text-align: left !important;
                          font-size: 11px !important;
                        }
                        th {
                          background: #f0f0f0 !important;
                          font-weight: bold !important;
                          font-size: 12px !important;
                        }
                        h1, h2 {
                          margin: 3mm 0 !important;
                          font-size: 16px !important;
                          font-weight: bold !important;
                        }
                        .header, .footer {
                          font-size: 10px !important;
                        }
                      </style>
                    `);
                    printWindow.document.write('</head><body>');
                    
                    // Get the current active tab content
                    let content = '';
                    if (activeTab === 'preview') {
                      content = document.querySelector('.simple-print-view')?.outerHTML || '';
                    } else if (activeTab === 'master') {
                      content = document.querySelector('.simple-master-slip')?.outerHTML || '';
                    } else if (activeTab.startsWith('dept-')) {
                      content = document.querySelector('.simple-dept-slip')?.outerHTML || '';
                    }
                    
                    // Clean up the content for printing (remove preview-specific styles)
                    content = content.replace(/width:\s*400px/g, 'width: 70mm');
                    content = content.replace(/height:\s*566px/g, 'height: 99mm');
                  content = content.replace(/height:\s*400px/g, 'height: 70mm');
                  content = content.replace(/padding:\s*30px/g, 'padding: 8mm');
                  content = content.replace(/font-size:\s*60px/g, 'font-size: 14px');
                  
                  printWindow.document.write(content);
                  printWindow.document.write('</body></html>');
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                  }, 300);
                }}
              >
                <FaPrint /> Print Simple View
              </GlowButton>
            )}
            <GlowButton
              $size="sm"
              onClick={handlePrintMasterSlip}
            >
              <FaPrint /> Master Slip
            </GlowButton>
            <GlowButton
              $size="sm"
              onClick={handlePrintAllSlips}
            >
              <FaPrint /> All Slips
            </GlowButton>
            <GlowButton
              $size="sm"
              $variant="ghost"
              onClick={onClose}
            >
              <FaTimes /> Close
            </GlowButton>
            <GlowButton
              $size="sm"
              $variant="info"
              onClick={handleDownloadPdf}
            >
              <FaDownload /> Download PDF
            </GlowButton>
            </div>
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
            <PreviewContainer $viewMode={viewMode}>
              <PrintPreview $viewMode={viewMode}>
                {viewMode === 'beautiful' ? (
                  <>
                    {/* Show all slips in preview */}
                    <div style={{ marginBottom: '30px' }}>
                      <MasterSlip 
                        order={processedOrderData} 
                        user={user}
                        settings={settings}
                      />
                    </div>
                    
                    {processedOrderData?.tests?.filter(test => test.department !== 'Master').map(test => test.department).filter((dept, index, arr) => arr.indexOf(dept) === index).map(dept => (
                      <div key={dept} style={{ marginBottom: '30px' }}>
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
                      <SimpleMasterSlip 
                        order={processedOrderData} 
                        user={user}
                        settings={settings}
                      />
                    </div>
                    
                    {processedOrderData?.tests?.filter(test => test.department !== 'Master').map(test => test.department).filter((dept, index, arr) => arr.indexOf(dept) === index).map(dept => (
                      <div key={dept} style={{ marginBottom: '30px' }}>
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
            <PreviewContainer $viewMode={viewMode}>
              <PrintPreview $viewMode={viewMode}>
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
            <PreviewContainer $viewMode={viewMode}>
              <PrintPreview $viewMode={viewMode}>
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
      </ModalContent>
    </ModalBackdrop>
    </>
  );
};

export default PrintPreviewModal; 