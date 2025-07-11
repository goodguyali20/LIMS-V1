import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import styled from 'styled-components';
import { fadeIn } from '../../styles/animations';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { logAuditEvent } from '../../utils/auditLogger';
import CriticalValueModal from '../../components/Modals/CriticalValueModal';

const PageContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
  max-width: 700px;
  margin: auto;
`;

const FormCard = styled.form`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
`;

const CardHeader = styled.h1`
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 1rem;
`;

const ResultInputGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-top: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid ${({ theme, isCritical }) => isCritical ? theme.colors.error : theme.colors.border};
  background-color: ${({ theme, isCritical }) => isCritical ? '#fff0f0' : theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ isCritical }) => isCritical ? 'bold' : 'normal'};
`;

const SubmitButton = styled.button`
  margin-top: 2rem;
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  color: white;
  background: ${({ theme }) => theme.colors.primary};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;


const ResultEntry = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [results, setResults] = useState({});
  const [criticalRanges, setCriticalRanges] = useState({});
  const [criticalAlert, setCriticalAlert] = useState(null); // Holds info for the modal
  const [acknowledgedCriticals, setAcknowledgedCriticals] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) return;

      // Fetch Order
      const docRef = doc(db, 'testOrders', orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error("Order not found.");
        navigate('/work-queue');
        return;
      }

      // Fetch Critical Ranges
      const rangesSnapshot = await getDocs(collection(db, "criticalRanges"));
      const ranges = {};
      rangesSnapshot.forEach(doc => {
        ranges[doc.id] = doc.data();
      });
      setCriticalRanges(ranges);

      setLoading(false);
    };
    fetchData();
  }, [orderId, navigate]);

  const handleResultChange = (testName, value) => {
    setResults(prev => ({ ...prev, [testName]: value }));

    const range = criticalRanges[testName];
    const numericValue = parseFloat(value);
    if (range && !isNaN(numericValue)) {
        if (numericValue < range.low || numericValue > range.high) {
            setCriticalAlert({ test: testName, value });
        }
    }
  };
  
  const handleAcknowledgeCritical = () => {
    logAuditEvent('Critical Value Acknowledged', {
        orderId: order.id,
        user: currentUser.email,
        details: criticalAlert
    });
    setAcknowledgedCriticals(prev => ({ ...prev, [criticalAlert.test]: true }));
    setCriticalAlert(null); // Close the modal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Check if all entered critical values have been acknowledged
    for (const testName in results) {
        const range = criticalRanges[testName];
        const numericValue = parseFloat(results[testName]);
        if (range && !isNaN(numericValue) && (numericValue < range.low || numericValue > range.high)) {
            if (!acknowledgedCriticals[testName]) {
                toast.error(`Please acknowledge the critical value for ${testName} before submitting.`);
                setIsSubmitting(false);
                return;
            }
        }
    }

    try {
        const orderRef = doc(db, "testOrders", order.id);
        await updateDoc(orderRef, {
            results: results,
            status: "Completed", // Or "Pending Verification"
            completedAt: new Date(),
            completedBy: currentUser.email,
        });

        logAuditEvent('Results Entered', { orderId: order.id, user: currentUser.email });
        toast.success("Results saved successfully!");
        navigate(`/order/${order.id}`);

    } catch (error) {
        console.error("Error saving results: ", error);
        toast.error("Failed to save results.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) return <p>Loading order...</p>;

  return (
    <>
      {criticalAlert && <CriticalValueModal criticalInfo={criticalAlert} onConfirm={handleAcknowledgeCritical} />}
      <PageContainer>
        <FormCard onSubmit={handleSubmit}>
          <CardHeader>Result Entry for Order #{order.id.substring(0, 6)}</CardHeader>
          <p><strong>Patient Name:</strong> {order.patientName}</p>
          <ResultInputGrid>
              {order.tests.map(testName => (
                  <InputGroup key={testName}>
                      <label htmlFor={testName}>{testName}</label>
                      <Input 
                          id={testName}
                          type="text"
                          onChange={(e) => handleResultChange(testName, e.target.value)}
                          required
                          isCritical={acknowledgedCriticals[testName]}
                      />
                  </InputGroup>
              ))}
          </ResultInputGrid>
          <SubmitButton type="submit" disabled={isSubmitting}>Save Results</SubmitButton>
        </FormCard>
      </PageContainer>
    </>
  );
};

export default ResultEntry;