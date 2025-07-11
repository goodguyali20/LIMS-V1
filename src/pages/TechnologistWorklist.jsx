import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { collection, query, where, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { FaUserMd, FaListAlt, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import ResultEntry from './ResultEntry.jsx';
import RejectSampleModal from '../components/RejectSampleModal.jsx'; // Import the new modal

//--- STYLED COMPONENTS ---//
const WorklistGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; `;
const OrderCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  ${({ theme }) => theme.squircle(24)};
  box-shadow: ${({ theme }) => theme.shadow};
  border: 2px solid ${({ theme, priority }) => priority === 'urgent' ? theme.warning : 'transparent'};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover { transform: translateY(-8px); box-shadow: 0 12px 28px rgba(0,0,0,0.1); }
`;
const CardHeader = styled.div` display: flex; justify-content: space-between; align-items: flex-start; `;
const PatientInfo = styled.div` h2 { font-size: 1.25rem; font-weight: 700; margin: 0; } p { margin: 4px 0 0; font-size: 0.9rem; color: ${({ theme }) => theme.text}99; }`;
const TestList = styled.div` border-top: 1px solid ${({ theme }) => theme.borderColor}; padding-top: 16px; h3 { font-size: 1rem; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; color: ${({ theme }) => theme.text}BF; } ul { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 8px; } `;
const TestTag = styled.li` background-color: ${({ theme }) => theme.primary}2A; color: ${({ theme }) => theme.primary}; padding: 6px 12px; ${({ theme }) => theme.squircle(20)}; font-size: 0.85rem; font-weight: 600; direction: ltr; `;
const ActionButton = styled.button` width: 100%; padding: 12px; background: ${({ theme, color }) => color || theme.primaryGradient}; color: white; border: none; ${({ theme }) => theme.squircle(12)}; font-size: 1rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px; transition: transform 0.2s ease, box-shadow 0.2s ease; &:hover { transform: scale(1.02); box-shadow: 0 4px 12px ${({ theme }) => theme.primary}4D; } `;
const EmptyState = styled.div` text-align: center; padding: 40px; color: ${({ theme }) => theme.text}99; `;
const PriorityTag = styled.div` display: flex; align-items: center; gap: 6px; color: ${({ theme }) => theme.warning}; font-weight: 700; font-size: 0.9rem; `;
const ButtonContainer = styled.div` margin-top: auto; `;

const TechnologistWorklist = () => {
  const { t } = useTranslation();
  const [worklist, setWorklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'testOrders'), where('status', 'in', ['sample_collected', 'processing']));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => {
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        return 0;
      });
      setWorklist(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching worklist:", error);
      toast.error("Could not load worklist.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenResultModal = async (order) => {
    try {
      await updateDoc(doc(db, 'testOrders', order.id), { status: 'processing' });
      setSelectedOrder(order);
      setIsResultModalOpen(true);
    } catch(error) {
      console.error("Error starting result entry:", error);
      toast.error("Could not open result entry form.");
    }
  };

  const handleOpenRejectModal = (order) => {
    setSelectedOrder(order);
    setIsRejectModalOpen(true);
  };

  if (loading) return <div>Loading Worklist...</div>;

  return (
    <div className="fade-in">
      {worklist.length > 0 ? (
        <WorklistGrid>
          {worklist.map(order => (
            <OrderCard key={order.id} priority={order.priority}>
              <CardHeader>
                <PatientInfo>
                  <h2>{order.patientName}</h2>
                  <p>Order Status: {t(order.status.replace('_', ''))}</p>
                </PatientInfo>
                {order.priority === 'urgent' && <PriorityTag><FaExclamationTriangle /> URGENT</PriorityTag>}
              </CardHeader>
              <TestList>
                <h3><FaListAlt /> Requested Tests</h3>
                <ul>{order.tests.map(test => <TestTag key={test}>{test}</TestTag>)}</ul>
              </TestList>
              <ButtonContainer>
                <ActionButton onClick={() => handleOpenResultModal(order)}><FaUserMd /> {t('enterResults')}</ActionButton>
                <ActionButton color={({ theme }) => theme.danger} onClick={() => handleOpenRejectModal(order)}><FaTimesCircle /> Reject Sample</ActionButton>
              </ButtonContainer>
            </OrderCard>
          ))}
        </WorklistGrid>
      ) : (
        <EmptyState>The worklist is empty. All samples are processed!</EmptyState>
      )}
      {isResultModalOpen && selectedOrder && <ResultEntry order={selectedOrder} onClose={() => setIsResultModalOpen(false)} onResultsSubmitted={() => {}} />}
      {isRejectModalOpen && selectedOrder && <RejectSampleModal order={selectedOrder} onClose={() => setIsRejectModalOpen(false)} />}
    </div>
  );
};

export default TechnologistWorklist;