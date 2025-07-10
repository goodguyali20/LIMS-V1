import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { collection, query, where, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { FaSyringe, FaListAlt, FaExclamationTriangle } from 'react-icons/fa';

//--- STYLED COMPONENTS ---//
const QueueGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; `;
const PatientCard = styled.div`
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
const ActionButton = styled.button` width: 100%; padding: 12px; background: ${({ theme }) => theme.success}; color: white; border: none; ${({ theme }) => theme.squircle(12)}; font-size: 1rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: auto; transition: transform 0.2s ease, box-shadow 0.2s ease; &:hover { transform: scale(1.02); box-shadow: 0 4px 12px ${({ theme }) => theme.success}4D; } `;
const EmptyState = styled.div` text-align: center; padding: 40px; color: ${({ theme }) => theme.text}99; `;
const PriorityTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.warning};
  font-weight: 700;
  font-size: 0.9rem;
`;

const PhlebotomyQueue = () => {
  const { t } = useTranslation();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'testOrders'), where('status', '==', 'registered'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const waitingList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort to show urgent orders first
      waitingList.sort((a, b) => {
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        return 0;
      });
      setQueue(waitingList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching phlebotomy queue:", error);
      toast.error("Could not load phlebotomy queue.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCollectSample = async (orderId, patientName) => {
    try {
      await updateDoc(doc(db, 'testOrders', orderId), { status: 'sample_collected', collectedAt: serverTimestamp() });
      toast.success(`Sample collected for ${patientName}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  if (loading) return <div>Loading Queue...</div>;

  return (
    <div className="fade-in">
      {queue.length > 0 ? (
        <QueueGrid>
          {queue.map(order => (
            <PatientCard key={order.id} priority={order.priority}>
              <CardHeader>
                <PatientInfo>
                  <h2>{order.patientName}</h2>
                  <p>Patient ID: {order.patientId.substring(0, 8)}</p>
                </PatientInfo>
                {order.priority === 'urgent' && <PriorityTag><FaExclamationTriangle /> URGENT</PriorityTag>}
              </CardHeader>
              <TestList>
                <h3><FaListAlt /> Requested Tests</h3>
                <ul>{order.tests.map(test => <TestTag key={test}>{test}</TestTag>)}</ul>
              </TestList>
              <ActionButton onClick={() => handleCollectSample(order.id, order.patientName)}><FaSyringe /> {t('collectSample')}</ActionButton>
            </PatientCard>
          ))}
        </QueueGrid>
      ) : (
        <EmptyState>The sample collection queue is empty. Great job!</EmptyState>
      )}
    </div>
  );
};

export default PhlebotomyQueue;