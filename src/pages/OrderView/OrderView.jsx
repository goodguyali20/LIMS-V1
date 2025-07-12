import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import styled from 'styled-components';
import { fadeIn } from '../../styles/animations';
import { toast } from 'react-toastify';
import { FaUser, FaIdCard, FaBirthdayCake, FaVenusMars, FaCalendarAlt, FaStethoscope, FaFlask, FaCheckCircle, FaExclamationTriangle, FaPrint, FaTicketAlt } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import { useTestCatalog } from '../../contexts/TestContext';
import { useSettings } from '../../contexts/SettingsContext';

// Old and New Component Imports
import AmendmentModal from '../../components/Modals/AmendmentModal';
import PrintableReport from '../../components/Report/PrintableReport';
import RequisitionForm from '../../components/Report/RequisitionForm';
import StatusBadge from '../../components/Dashboard/StatusBadge';
import A4PrintGrid from '../../components/Print/A4PrintGrid'; // New
import MasterSlip from '../../components/Print/MasterSlip'; // New
import DepartmentSlip from '../../components/Print/DepartmentSlip'; // New
import TubeIdSlip from '../../components/Print/TubeIdSlip'; // New

// Styled components are unchanged...
const PageContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const DetailsCard = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  background: ${({ theme }) => theme.colors.surface};
  padding: 2.5rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
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
    background-color: #3498db; // A different color for the new button
`;


const OrderView = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [testToAmend, setTestToAmend] = useState(null);

  const { labTests } = useTestCatalog();
  const { settings } = useSettings();

  // --- Print Handlers ---
  const requisitionPrintRef = useRef();
  const handleRequisitionPrint = useReactToPrint({ content: () => requisitionPrintRef.current });
  
  const slipPrintRef = useRef(); // New ref for slip printing
  const handleSlipPrint = useReactToPrint({ content: () => slipPrintRef.current });

  // --- Data Grouping ---
  const testsByDept = React.useMemo(() => {
    if (!order || !labTests.length) return {};
    return order.tests.reduce((acc, testName) => {
      const test = labTests.find(t => t.name === testName);
      const dept = test?.department || 'General';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(testName);
      return acc;
    }, {});
  }, [order, labTests]);
  
  // --- Slip Generation (DEMO LOGIC) ---
  const generateSlipsForPrinting = () => {
      if (!order) return [];

      let allSlips = [];
      // 1. Add Master Slip
      allSlips.push(<MasterSlip order={order} />);

      // 2. Add Department Slips
      Object.entries(testsByDept).forEach(([dept, tests]) => {
          allSlips.push(<DepartmentSlip order={order} department={dept} tests={tests} />);
      });

      // 3. Add Tube ID Slips (Example: 3 tubes)
      for (let i = 0; i < 3; i++) {
        allSlips.push(<TubeIdSlip order={order} />);
      }
      
      return allSlips;
  };

  // --- Data Fetching and Handlers (Unchanged) ---
  const fetchOrder = async () => { /* ... unchanged ... */ };
  useEffect(() => { /* ... unchanged ... */ }, [orderId]);
  const handleAmendClick = () => { /* ... unchanged ... */ };
  const handleModalClose = () => { /* ... unchanged ... */ };
  
  // Re-pasting just in case
  useEffect(() => {
    const fetchOrder = async () => {
        if (!orderId) return;
        setLoading(true);
        try {
          const docRef = doc(db, 'testOrders', orderId);
          const docSnap = await getDoc(docRef);
    
          if (docSnap.exists()) {
            const orderData = { id: docSnap.id, ...docSnap.data() };
            setOrder(orderData);
            if (orderData.tests?.length > 0) {
              setTestToAmend(orderData.tests[0]);
            }
          } else {
            toast.error("Order not found.");
          }
        } catch (error) {
            toast.error("Failed to fetch order details.");
            console.error("Error fetching order:", error);
        }
        setLoading(false);
      };

    fetchOrder();
  }, [orderId]);

  if (loading) return <p>Loading order details...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <>
      <PageContainer>
        {/* The main DetailsCard is unchanged */}
        <DetailsCard>
          <CardHeader>
             <h2>Order #{order.id.substring(0, 6)}...</h2>
             {/* ... ButtonGroup unchanged ... */}
          </CardHeader>
          
          <Section>
            {/* ... Patient Info section unchanged ... */}
          </Section>

          <Section>
            {/* ... Requested Tests section unchanged ... */}
          </Section>
            
          <PrintSection>
              <SectionTitle><FaPrint /> Printing Options</SectionTitle>
              <p>Generate documents for this order. Requisition forms are full-page, while slips are small cut-outs.</p>
              <PrintButton onClick={handleRequisitionPrint}>
                <FaPrint /> Print Requisition Forms
              </PrintButton>
              <SlipPrintButton onClick={handleSlipPrint}>
                  <FaTicketAlt /> Print All Slips
              </SlipPrintButton>
          </PrintSection>
        </DetailsCard>
        
        {showReport && <PrintableReport order={order} />}
      </PageContainer>
      
      {/* --- Hidden Divs for Printing --- */}
      <div style={{ display: "none" }}>
          {/* For Old Requisition Forms */}
          <div ref={requisitionPrintRef}>
              {testsByDept && Object.entries(testsByDept).map(([dept, tests]) => (
                  <RequisitionForm key={dept} order={order} department={dept} tests={tests} settings={settings} />
              ))}
          </div>

          {/* For New Slips */}
          <A4PrintGrid ref={slipPrintRef} slips={generateSlipsForPrinting()} />
      </div>

      {isModalOpen && (
        <AmendmentModal 
          order={order}
          testToAmend={testToAmend}
          onClose={handleModalClose} 
        />
      )}
    </>
  );
};

export default OrderView;