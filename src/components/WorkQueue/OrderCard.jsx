import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { logAuditEvent } from '../../utils/auditLogger';

import RejectionModal from '../Modals/RejectionModal';
import { FaUser, FaVial, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 5px solid ${({ theme, status, priority }) => {
    if (status === 'Rejected') return theme.colors.error;
    if (priority === 'Urgent') return theme.colors.error;
    return theme.colors.primaryPlain;
  }};
  opacity: ${({ status }) => (status === 'Rejected' ? 0.8 : 1)};
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h3 {
    margin: 0;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const RejectionInfo = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-weight: 500;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-weight: 600;
  color: white;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RejectButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.colors.error};
`;

const ProcessButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.primary};
`;

const RecollectButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.colors.success};
`;


const OrderCard = ({ order }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const orderDate = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A';

  const handleRecollection = async () => {
    if (!window.confirm("Are you sure you want to log the recollection for this sample?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const orderRef = doc(db, "testOrders", order.id);
      await updateDoc(orderRef, {
        status: 'Sample Collected', // Puts it back into the active queue
        history: arrayUnion({ // Adds a history record
          event: 'Sample Recollected',
          timestamp: new Date(),
          reason: `Original sample rejected for: ${order.rejectionDetails.reason}`
        })
      });

      await logAuditEvent('Sample Recollected', { orderId: order.id, patientId: order.patientId });
      toast.success(`Recollection logged for order ${order.id}.`);

    } catch (error) {
      console.error("Error logging recollection:", error);
      toast.error("Failed to log recollection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card status={order.status} priority={order.priority}>
        <OrderInfo>
          <h3>Order #{order.id.substring(0, 6)}...</h3>
          <p><FaUser /> Patient: {order.patientName}</p>
          <p><FaVial /> Tests: {order.tests.join(', ')}</p>
          <p><FaClock /> Created: {orderDate}</p>
          {order.status === 'Rejected' && (
            <RejectionInfo>
              <FaExclamationTriangle />
              Rejected: {order.rejectionDetails?.reason}
            </RejectionInfo>
          )}
        </OrderInfo>
        <Actions>
          {order.status === 'Rejected' ? (
            <RecollectButton onClick={handleRecollection} disabled={isSubmitting}>
              {isSubmitting ? 'Logging...' : 'Log Recollection'}
            </RecollectButton>
          ) : (
            <>
              <RejectButton onClick={() => setIsModalOpen(true)}>
                Reject Sample
              </RejectButton>
              <ProcessButton>
                Process
              </ProcessButton>
            </>
          )}
        </Actions>
      </Card>

      {isModalOpen && (
        <RejectionModal order={order} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default OrderCard;