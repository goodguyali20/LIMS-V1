import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { logAuditEvent } from '../../utils/auditLogger';
import { useNavigate } from 'react-router-dom';
import RejectionModal from '../Modals/RejectionModal';
import { FaUser, FaVial, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useTestCatalog } from '../../contexts/TestContext';

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

const TestTagContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
`;

const TestTag = styled.span`
    background-color: ${props => props.color || '#ccc'};
    color: white;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { labTests, departmentColors } = useTestCatalog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const orderDate = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A';

  const getTestDepartment = (testName) => {
      const test = labTests.find(t => t.name === testName);
      return test ? test.department : 'General';
  };

  const handleRecollection = async () => {
    if (!window.confirm("Are you sure you want to log the recollection for this sample?")) {
      return;
    }
    setIsSubmitting(true);
    try {
      const orderRef = doc(db, "testOrders", order.id);
      await updateDoc(orderRef, {
        status: 'Sample Collected',
        history: arrayUnion({
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

  const handleProcessClick = () => {
    navigate(`/order/${order.id}/enter-results`);
  };

  return (
    <>
      <Card status={order.status} priority={order.priority}>
        <OrderInfo>
          <h3>Order #{order.id.substring(0, 6)}...</h3>
          <p><FaUser /> {t('orderCard_patient')} {order.patientName}</p>
          <div style={{marginTop: '0.5rem'}}>
            <p style={{marginBottom: '0.5rem'}}><FaVial /> {t('orderCard_tests')}</p>
            <TestTagContainer>
              {order.tests.map(testName => {
                const department = getTestDepartment(testName);
                const color = departmentColors[department];
                return <TestTag key={testName} color={color}>{testName}</TestTag>
              })}
            </TestTagContainer>
          </div>
          <p style={{marginTop: '0.5rem'}}><FaClock /> {t('orderCard_created')} {orderDate}</p>
          {order.status === 'Rejected' && (
            <RejectionInfo>
              <FaExclamationTriangle />
              {t('orderCard_rejected')} {order.rejectionDetails?.reason}
            </RejectionInfo>
          )}
        </OrderInfo>
        <Actions>
          {order.status === 'Rejected' ? (
            <RecollectButton onClick={handleRecollection} disabled={isSubmitting}>
              {isSubmitting ? t('login_loggingIn') : t('orderCard_recollect_button')}
            </RecollectButton>
          ) : (
            <>
              <RejectButton onClick={() => setIsModalOpen(true)}>
                {t('orderCard_reject_button')}
              </RejectButton>
              <ProcessButton onClick={handleProcessClick}>
                {t('orderCard_process_button')}
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