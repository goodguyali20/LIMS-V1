import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { logAuditEvent } from '../../utils/auditLogger';
import { useNavigate } from 'react-router-dom';
import RejectionModal from '../Modals/RejectionModal';
import { FaUser, FaVial, FaClock, FaExclamationTriangle, FaPlay, FaBan, FaRedo, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useTestCatalog } from '../../contexts/TestContext';
import { useTheme } from '../../contexts/ThemeContext';
import { GlowButton } from '../common';

const Card = styled(motion.div)`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: ${({ theme, status, priority }) => {
      if (status === 'Rejected') return theme.colors.error;
      if (priority === 'Urgent') return theme.colors.error;
      return '#667eea';
    }};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: ${({ theme, status }) => {
      if (status === 'Rejected') return `${theme.colors.error}10`;
      return `rgba(102, 126, 234, 0.1)`;
    }};
    border-radius: 50%;
    transform: translate(50%, -50%);
    opacity: 0.3;
  }
  
  opacity: ${({ status }) => (status === 'Rejected' ? 0.9 : 1)};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 30px 60px rgba(0, 0, 0, 0.15),
      0 12px 24px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  flex: 1;
  position: relative;
  z-index: 1;

  h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: #667eea;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
  }
`;

const RejectionInfo = styled(motion.div)`
  color: ${({ theme }) => theme.colors.error};
  font-weight: 600;
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem;
  background: ${({ theme }) => `${theme.colors.error}10`};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.error};
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
`;

const TestTagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  position: relative;
  z-index: 1;
`;

const TestTag = styled(motion.span)`
  background: ${props => props.color || '#ccc'};
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: flex-end;
  position: relative;
  z-index: 1;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 120px;
  justify-content: center;
  backdrop-filter: blur(10px);
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const RejectButton = styled(ActionButton)`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.error}, ${({ theme }) => theme.colors.error}dd);
  
  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.error}dd, ${({ theme }) => theme.colors.error});
  }
`;

const ProcessButton = styled(ActionButton)`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  
  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.secondary}, ${({ theme }) => theme.colors.primary});
  }
`;

const RecollectButton = styled(ActionButton)`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.success}, ${({ theme }) => theme.colors.success}dd);
  
  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.success}dd, ${({ theme }) => theme.colors.success});
  }
`;

const DownloadButton = styled(ActionButton)`
  background: linear-gradient(135deg, #3498db, #2980b9);
  
  &:hover {
    background: linear-gradient(135deg, #2980b9, #3498db);
  }
`;

const StatusBadge = styled(motion.span)`
  padding: 0.4rem 1rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'Pending Sample': return `linear-gradient(135deg, ${theme.colors.warning}20, ${theme.colors.warning}10)`;
      case 'Sample Collected': return `linear-gradient(135deg, ${theme.colors.info}20, ${theme.colors.info}10)`;
      case 'In Progress': return `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.primary}10)`;
      case 'Rejected': return `linear-gradient(135deg, ${theme.colors.error}20, ${theme.colors.error}10)`;
      default: return `linear-gradient(135deg, ${theme.colors.textSecondary}20, ${theme.colors.textSecondary}10)`;
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'Pending Sample': return theme.colors.warning;
      case 'Sample Collected': return theme.colors.info;
      case 'In Progress': return theme.colors.primary;
      case 'Rejected': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  }};
  border: 1px solid ${({ status, theme }) => {
    switch (status) {
      case 'Pending Sample': return theme.colors.warning;
      case 'Sample Collected': return theme.colors.info;
      case 'In Progress': return theme.colors.primary;
      case 'Rejected': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  }};
`;

const OrderCard = ({ order, onDownload }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
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
    navigate(`/app/order/${order.id}/enter-results`);
  };

  return (
    <>
      <Card 
        status={order.status} 
        priority={order.priority}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          y: -8,
          transition: { type: "spring", stiffness: 300 }
        }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <OrderInfo>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <h3>Order #{order.id.substring(0, 8)}</h3>
            <StatusBadge 
              status={order.status}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {order.status}
            </StatusBadge>
          </div>
          
          <p><FaUser /> {t('orderCard_patient')} {order.patientName}</p>
          
          <div style={{ marginTop: '0.8rem' }}>
            <p style={{ marginBottom: '0.8rem', fontWeight: 600 }}>
              <FaVial /> {t('orderCard_tests')} ({order.tests.length})
            </p>
            <TestTagContainer>
              {order.tests.map((testName, index) => {
                const department = getTestDepartment(testName);
                const color = departmentColors[department];
                return (
                  <TestTag 
                    key={testName} 
                    color={color}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {testName}
                  </TestTag>
                );
              })}
            </TestTagContainer>
          </div>
          
          <p style={{ marginTop: '0.8rem' }}>
            <FaClock /> {t('orderCard_created')} {orderDate}
          </p>
          
          {order.status === 'Rejected' && (
            <RejectionInfo
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <FaExclamationTriangle />
              {t('orderCard_rejected')} {order.rejectionDetails?.reason}
            </RejectionInfo>
          )}
        </OrderInfo>
        
        <Actions>
          {order.status === 'Rejected' ? (
            <RecollectButton 
              onClick={handleRecollection} 
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaRedo />
              {isSubmitting ? t('login_loggingIn') : t('orderCard_recollect_button')}
            </RecollectButton>
          ) : (
            <>
              <RejectButton 
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaBan />
                {t('orderCard_reject_button')}
              </RejectButton>
              <ProcessButton 
                onClick={handleProcessClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlay />
                {t('orderCard_process_button')}
              </ProcessButton>
              {onDownload && (
                <DownloadButton 
                  onClick={() => onDownload(order)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaDownload />
                  {t('orderCard_download_slip')}
                </DownloadButton>
              )}
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