import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import styled from 'styled-components';
import { fadeIn } from '../../styles/animations';
import { toast } from 'react-toastify';
import { FaUser, FaIdCard, FaBirthdayCake, FaVenusMars, FaCalendarAlt, FaStethoscope, FaFlask, FaExclamationTriangle, FaPrint, FaTicketAlt } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import { useTestCatalog } from '../../contexts/TestContext';
import { useSettings } from '../../contexts/SettingsContext';

// Component Imports
import AmendmentModal from '../../components/Modals/AmendmentModal';
import PrintableReport from '../../components/Report/PrintableReport';
import RequisitionForm from '../../components/Report/RequisitionForm';
import StatusBadge from '../../components/Common/StatusBadge'; // <<< THIS PATH IS NOW CORRECT
import A4PrintGrid from '../../components/Print/A4PrintGrid';
import MasterSlip from '../../components/Print/MasterSlip';
import DepartmentSlip from '../../components/Print/DepartmentSlip';
import TubeIdSlip from '../../components/Print/TubeIdSlip';
import PageLoader from '../../components/Loaders/PageLoader';

// Styled Components
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
    background-color: #3498db;
`;

const OrderView = () => {
  const { orderId } = useParams();
  const { labTests, loading: testsLoading } = useTestCatalog();
  const { settings } = useSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [testToAmend, setTestToAmend] = useState(null); 

  const requisitionPrintRef = useRef();
  const handleRequisitionPrint = useReactToPrint({ content: () => requisitionPrintRef.current });
  
  const slipPrintRef = useRef();
  const handleSlipPrint = useReactToPrint({ content: () => slipPrintRef.current });

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

  // This is the placeholder function from our first implementation
  const generateSlipsForPrinting = () => {
      if (!order) return [];
      let allSlips = [];
      allSlips.push(<MasterSlip order={order} />);
      Object.entries(testsByDept).forEach(([dept, tests]) => {
          allSlips.push(<DepartmentSlip order={order} department={dept} tests={tests} />);
      });
      for (let i = 0; i < 3; i++) {
        allSlips.push(<TubeIdSlip order={order} />);
      }
      return allSlips;
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

  if (loading || testsLoading) return <PageLoader />;
  if (!order) return <p>Order not found.</p>;

  return (
    <>
      <PageContainer>
        <DetailsCard>
          <CardHeader>
            <h2>Order #{order.id.substring(0, 6)}...</h2>
            <ButtonGroup>
              <ReportButton onClick={() => setShowReport(prev => !prev)}>
                {showReport ? 'Hide Report' : 'View Report'}
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
                <InfoItem><FaCalendarAlt /><strong>Order Date:</strong> {order.createdAt.toDate().toLocaleDateString()}</InfoItem>
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
        
        {showReport && <PrintableReport order={order} settings={settings} />}
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
    </>
  );
};

export default OrderView;