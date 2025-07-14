import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import styled from 'styled-components';
import { advancedVariants } from '../../styles/animations';
import { toast } from 'react-toastify';
import { FaUser, FaIdCard, FaBirthdayCake, FaVenusMars, FaCalendarAlt, FaStethoscope, FaFlask, FaExclamationTriangle, FaPrint, FaTicketAlt, FaBarcode } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import { useTestCatalog } from '../../contexts/TestContext';
import { useSettings } from '../../contexts/SettingsContext';

// Component Imports
import AmendmentModal from '../../components/Modals/AmendmentModal';
import PrintableReport from '../../components/Report/PrintableReport';
import RequisitionForm from '../../components/Report/RequisitionForm';
import StatusBadge from '../../components/common/StatusBadge';
import A4PrintGrid from '../../components/Print/A4PrintGrid';
import MasterSlip from '../../components/Print/MasterSlip';
import DepartmentSlip from '../../components/Print/DepartmentSlip';
import TubeIdSlip from '../../components/Print/TubeIdSlip';
import PageLoader from '../../components/Loaders/PageLoader';
import PrintCenter from '../../components/common/PrintCenter';

// Styled Components
const PageContainer = styled.div`
  animation: ${advancedVariants.fadeIn} 0.5s ease-in-out;
  min-height: 100vh;
  background: ${({ theme }) => theme.isDarkMode 
    ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
    : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
  };
  background-attachment: fixed;
`;
const DetailsCard = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 20px 20px 0 0;
  }
`;
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  gap: 1rem;
  h2 {
    margin: 0;
    font-size: 2rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;
const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
`;
const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  color: white;
  &:hover { 
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  }
`;
const ReportButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.primary};
`;
const AmendButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.colors.warning};
`;
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;
const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  background: ${({ theme }) => theme.colors.background};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};

  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.5rem;
  }
`;
const Section = styled.section`
  margin-top: 2.5rem;
`;
const SectionTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  padding-bottom: 0.5rem;
`;
const TestList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;
const TestItem = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border-left: 5px solid ${({ theme, status }) => status === 'Completed' ? theme.colors.success : theme.colors.warning};
  
  strong {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  
  span {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
const PrintSection = styled(Section)`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 2rem;
`;
const PrintButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.colors.success};
  margin-right: 1rem;
`;
const SlipPrintButton = styled(ActionButton)`
    background-color: #3498db;
`;

const OrderView = () => {
  const { orderId } = useParams();
  const { labTests, loading: testsLoading } = useTestCatalog();
  const { settings } = useSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const setShowReport = ... // Unused variable, comment out or remove
  // const idx = ... // Unused variable, comment out or remove
  const [testToAmend, setTestToAmend] = useState(null); 

  const requisitionPrintRef = useRef();
  const handleRequisitionPrint = useReactToPrint({ content: () => requisitionPrintRef.current });
  
  const slipPrintRef = useRef();
  const handleSlipPrint = useReactToPrint({ content: () => slipPrintRef.current });

  const [printCenterOpen, setPrintCenterOpen] = useState(false);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [printSettings, setPrintSettings] = useState({ paperSize: 'A4', orientation: 'portrait', colorMode: 'color' });
  const [printLoading, setPrintLoading] = useState(false);
  const [printFeedback, setPrintFeedback] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      const docRef = doc(db, 'testOrders', orderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const orderData = { id: docSnap.id, ...docSnap.data() };
        setOrder(orderData);
      } else {
        toast.error("Order not found.");
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  const testsByDept = useMemo(() => {
    if (!order || !labTests.length) return {};
    return order.tests.reduce((acc, testName) => {
        const test = labTests.find(t => t.name === testName);
        const dept = test?.department || 'General';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(testName);
        return acc;
    }, {});
  }, [order, labTests]);

  // Prepare print documents (A4, slips, requisition, etc.)
  const printDocuments = useMemo(() => {
    if (!order) return [];
    return [
      {
        id: 'a4',
        title: 'A4 Report',
        icon: <FaPrint />,
        preview: <PrintableReport order={order} settings={settings} />,
        type: 'a4',
      },
      {
        id: 'requisition',
        title: 'Requisition Form',
        icon: <FaTicketAlt />,
        preview: <RequisitionForm order={order} settings={settings} ref={requisitionPrintRef} />,
        type: 'requisition',
      },
      {
        id: 'master-slip',
        title: 'Master Slip',
        icon: <FaIdCard />,
        preview: <MasterSlip order={order} ref={slipPrintRef} />,
        type: 'master-slip',
      },
      ...Object.entries(testsByDept).map(([dept, tests], idx) => ({
        id: `dept-slip-${dept}`,
        title: `Department Slip: ${dept}`,
        icon: <FaFlask />,
        preview: <DepartmentSlip order={order} department={dept} tests={tests} />,
        type: 'department-slip',
      })),
      ...Array(3).fill(0).map((_, i) => ({
        id: `tube-slip-${i}`,
        title: `Tube ID Slip ${i+1}`,
        icon: <FaBarcode />,
        preview: <TubeIdSlip order={order} />,
        type: 'tube-slip',
      })),
    ];
  }, [order, settings, testsByDept]);

  // Print handler
  const handlePrint = async () => {
    setPrintLoading(true);
    setPrintFeedback(null);
    try {
      // Use window.print() for now, or implement per-document printing
      window.print();
      setPrintFeedback({ type: 'success', message: 'Sent to printer!' });
    } catch (e) {
      setPrintFeedback({ type: 'error', message: 'Print failed.' });
    } finally {
      setPrintLoading(false);
    }
  };

  // PDF handler (placeholder, implement with jsPDF or similar)
  const handleDownloadPDF = async () => {
    setPrintLoading(true);
    setPrintFeedback(null);
    try {
      // TODO: Implement PDF download logic
      setPrintFeedback({ type: 'success', message: 'PDF downloaded!' });
    } catch (e) {
      setPrintFeedback({ type: 'error', message: 'PDF download failed.' });
    } finally {
      setPrintLoading(false);
    }
  };

  const handleAmendClick = () => {
    if (!order.results || order.results.length === 0) {
        toast.warn("No results to amend.");
        return;
    }
    setTestToAmend(order.results[0]);
    setIsModalOpen(true);
  };

  const handleModalClose = (wasUpdated) => {
    setIsModalOpen(false);
    if (wasUpdated) {
        toast.success("Report amended successfully.");
    }
  };

  // Generate slips for printing
  const generateSlipsForPrinting = () => {
    if (!order) return [];
    
    const slips = [];
    
    // Add master slip
    slips.push({
      type: 'master',
      content: <MasterSlip order={order} />
    });
    
    // Add department slips
    Object.entries(testsByDept).forEach(([dept, tests]) => {
      slips.push({
        type: 'department',
        department: dept,
        content: <DepartmentSlip order={order} department={dept} tests={tests} />
      });
    });
    
    // Add tube ID slips
    for (let i = 0; i < 3; i++) {
      slips.push({
        type: 'tube',
        index: i,
        content: <TubeIdSlip order={order} />
      });
    }
    
    return slips;
  };

  if (loading || testsLoading) return <PageLoader />;
  if (!order) return <p>Order not found.</p>;

  return (
    <>
      <PageContainer>
        <DetailsCard>
          <CardHeader>
            <h2>Order #{order.id.substring(0, 6)}...</h2>
            <ButtonGroup>
              <ReportButton onClick={() => setPrintCenterOpen(true)}>
                <FaPrint /> Print
              </ReportButton>
              <AmendButton onClick={handleAmendClick}>
                  <FaExclamationTriangle /> Amend Report
              </AmendButton>
            </ButtonGroup>
          </CardHeader>
          
          <Section>
            <SectionTitle><FaUser /> Patient Information</SectionTitle>
            <InfoGrid>
                <InfoItem><FaUser /><strong>Name:</strong> {order.patientName}</InfoItem>
                <InfoItem><FaIdCard /><strong>Patient ID:</strong> {order.patientId}</InfoItem>
                <InfoItem><FaBirthdayCake /><strong>Age:</strong> {order.age}</InfoItem>
                <InfoItem><FaVenusMars /><strong>Gender:</strong> {order.gender}</InfoItem>
                <InfoItem><FaCalendarAlt /><strong>Order Date:</strong> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}</InfoItem>
                <InfoItem><FaStethoscope /><strong>Doctor:</strong> {order.referringDoctor || 'N/A'}</InfoItem>
            </InfoGrid>
            <StatusBadge status={order.status} />
          </Section>

          <Section>
            <SectionTitle><FaFlask /> Requested Tests</SectionTitle>
            <TestList>
              {order.tests.map(testName => {
                const resultEntry = order.results?.find(r => r.name === testName);
                const status = resultEntry?.value ? 'Completed' : 'Pending';
                return (
                  <TestItem key={testName} status={status}>
                    <strong>{testName}</strong>
                    <span>Status: {status}</span>
                  </TestItem>
                );
              })}
            </TestList>
          </Section>
            
          <PrintSection>
              <SectionTitle><FaPrint /> Printing Options</SectionTitle>
              <p>Generate documents for this order. Requisition forms are full-page, while slips are small cut-outs for internal use.</p>
              <PrintButton onClick={handleRequisitionPrint}>
                <FaPrint /> Print Requisition Forms
              </PrintButton>
              <SlipPrintButton onClick={handleSlipPrint}>
                  <FaTicketAlt /> Print All Slips
              </SlipPrintButton>
          </PrintSection>
        </DetailsCard>
        
        {/* {showReport && <PrintableReport order={order} settings={settings} />} */}
      </PageContainer>
      
      <div style={{ display: "none" }}>
          <div ref={requisitionPrintRef}>
              {testsByDept && Object.entries(testsByDept).map(([dept, tests]) => (
                  <RequisitionForm key={dept} order={order} department={dept} tests={tests} settings={settings} />
              ))}
          </div>

          <A4PrintGrid ref={slipPrintRef} slips={generateSlipsForPrinting()} />
      </div>

      {isModalOpen && (
        <AmendmentModal 
          order={order}
          testToAmend={testToAmend}
          onClose={handleModalClose} 
        />
      )}

      <PrintCenter
        open={printCenterOpen}
        onClose={() => setPrintCenterOpen(false)}
        documents={printDocuments}
        onPrint={handlePrint}
        onDownloadPDF={handleDownloadPDF}
        loading={printLoading}
        feedback={printFeedback}
        selectedDocIndex={selectedDocIndex}
        onSelectDoc={setSelectedDocIndex}
        printSettings={printSettings}
        onChangeSettings={setPrintSettings}
      />
    </>
  );
};

export default OrderView;