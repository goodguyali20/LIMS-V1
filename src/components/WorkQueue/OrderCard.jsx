import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { logAuditEvent } from '../../utils/auditLogger';
import { useNavigate } from 'react-router-dom';
import RejectionModal from '../Modals/RejectionModal';
import { FaUser, FaVial, FaClock, FaExclamationTriangle, FaPlay, FaBan, FaRedo, FaDownload, FaCalendar, FaThermometer, FaInfoCircle, FaPrint } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useTestCatalog } from '../../contexts/TestContext';
import { useTheme } from '../../contexts/ThemeContext';
import { GlowButton } from '../common';
import { showFlashMessage } from '../../contexts/NotificationContext';
import AnimatedModal from '../common/AnimatedModal';

const Card = styled(motion.div)`
  background: ${({ status }) => {
    switch (status) {
      case 'Sample Collected': return '#1f2937';
      case 'In Progress': return '#1f2937';
      case 'Completed': return '#1f2937';
      case 'Cancelled': return '#1f2937';
      default: return '#1e293b';
    }
  }};
  border: 1px solid ${({ status }) => {
    switch (status) {
      case 'Sample Collected': return '#ef4444';
      case 'In Progress': return '#f59e0b';
      case 'Completed': return '#10b981';
      case 'Cancelled': return '#6b7280';
      default: return '#334155';
    }
  }};
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.15s ease;
  margin-bottom: 0.5rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${({ status }) => {
      switch (status) {
        case 'Sample Collected': return '#ef4444';
        case 'In Progress': return '#f59e0b';
        case 'Completed': return '#10b981';
        case 'Cancelled': return '#6b7280';
        default: return '#3b82f6';
      }
    }};
  }

  ${({ $isOptimistic }) => $isOptimistic && `
    border: 2px solid #3b82f6;
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
      70% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0); }
      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    }
  `}

  ${({ priority }) => priority === 'urgent' && `
    background: linear-gradient(135deg, #1e293b 0%, #2d1b69 100%);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
    border-color: #ef4444;
  `}

  ${({ priority }) => priority === 'high' && `
    background: linear-gradient(135deg, #1e293b 0%, #451a03 100%);
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
    border-color: #f59e0b;
  `}
`;

const TopRightInfo = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  z-index: 1;
`;

const InfoNumber = styled.div`
  font-size: 0.7rem;
  font-weight: 500;
  color: #64748b;
  background: #1e293b;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  min-width: 1.5rem;
  text-align: center;
  border: 1px solid #334155;
`;

const LiveTimer = styled.div`
  font-size: 0.7rem;
  font-weight: 500;
  color: #64748b;
  background: #1e293b;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  min-width: 2rem;
  text-align: center;
  border: 1px solid #334155;
`;

const OptimisticIndicator = styled.div`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 4px;
  height: 4px;
  background: #3b82f6;
  border-radius: 50%;
  animation: blink 1s infinite;
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  }
`;

const OrderId = styled.h5`
  font-size: 0.8rem;
  font-weight: 600;
  color: #3b82f6;
  margin: 0 0 0.25rem 0;
  cursor: pointer;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #60a5fa;
  }
`;

const PatientName = styled.span`
  font-size: 0.8rem;
  font-weight: 500;
  color: #f8fafc;
`;

const PatientId = styled.p`
  font-size: 0.75rem;
  margin: 0;
  color: #cbd5e1;
`;

const OrderDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0.5rem 0;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
  
  svg {
    width: 10px;
    height: 10px;
    color: #64748b;
  }
`;

const TestNames = styled.div`
  margin: 0.5rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
`;

const TestName = styled.span`
  display: inline-block;
  background: ${({ departmentColor }) => departmentColor ? `${departmentColor}20` : '#334155'};
  color: ${({ departmentColor }) => departmentColor ? departmentColor : '#f8fafc'};
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  border: 1px solid ${({ departmentColor }) => departmentColor ? `${departmentColor}40` : '#475569'};
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid #475569;
  border-radius: 4px;
  background: #334155;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.7rem;
  position: relative;
  
  &:hover {
    background: #475569;
    color: #f8fafc;
    border-color: #64748b;
  }
  
  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 0.7rem;
  color: #cbd5e1;
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: 0.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: #1e293b;
  }
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderCard = ({ order, onDownload, onViewDetails, onPrint, onViewTimeline }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { labTests, departmentColors } = useTestCatalog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [showAllTests, setShowAllTests] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const orderDate = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A';

  const getTestDepartment = (testName) => {
    const test = labTests.find(t => t.name === testName);
    return test ? test.department : 'General';
  };

  const calculateTimeInStage = () => {
    let startTime;
    
    // Try to find the most recent status change
    if (order.history && order.history.length > 0) {
      const statusChanges = order.history.filter(h => 
        h.event && (h.event.includes('status') || h.event.includes('Status') || 
                   h.event.includes('Pending') || h.event.includes('In Progress') || 
                   h.event.includes('Completed') || h.event.includes('Cancelled'))
      );
      
      if (statusChanges.length > 0) {
        const lastStatusChange = statusChanges[statusChanges.length - 1];
        startTime = lastStatusChange.timestamp?.toDate ? 
          lastStatusChange.timestamp.toDate() : 
          new Date(lastStatusChange.timestamp);
      }
    }
    
    // Fallback to order creation time if no status history
    if (!startTime) {
      startTime = order.createdAt?.toDate ? 
        order.createdAt.toDate() : 
        new Date(order.createdAt);
    }
    
    const diffMs = currentTime - startTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    // Format as HH:MM:SS
    const hours = diffHours.toString().padStart(2, '0');
    const minutes = diffMinutes.toString().padStart(2, '0');
    const seconds = diffSeconds.toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  };

  // Update timer every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  const timeInStage = calculateTimeInStage();

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
      showFlashMessage({ type: 'success', title: 'Recollection Logged', message: `Recollection logged for order ${order.id}.` });

    } catch (error) {
      console.error("Error logging recollection:", error);
      showFlashMessage({ type: 'error', title: 'Failed', message: 'Failed to log recollection.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessClick = () => {
    navigate(`/app/order/${order.id}/enter-results`);
  };

  const toggleShowAllTests = () => {
    setShowAllTests(!showAllTests);
  };

  return (
    <>
      <Card 
        status={order.status} 
        priority={order.priority}
        $isOptimistic={order._isOptimistic}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        data-order-card
        tabIndex={0}
        role="article"
        aria-label={`Order ${order.orderId} for ${order.patientName}, status: ${order.status}, priority: ${order.priority}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewDetails(order);
          }
        }}
      >
        {order._isOptimistic && <OptimisticIndicator />}
        <TopRightInfo>
          <InfoNumber>{order.tests?.length || 0}</InfoNumber>
          <LiveTimer>{timeInStage}</LiveTimer>
        </TopRightInfo>
        <OrderInfo>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
            <div>
              <OrderId 
                onClick={() => onViewDetails(order)}
                role="button"
                tabIndex={0}
                aria-label={`View details for order ${order.orderId}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onViewDetails(order);
                  }
                }}
              >
                #{order.orderId}
                <PatientName>{order.patientName}</PatientName>
              </OrderId>
              <PatientId>ID: {order.patientId}</PatientId>
            </div>
          </div>
          
          {order.tests && order.tests.length > 0 && (
            <TestNames>
              {(showAllTests ? order.tests : order.tests.slice(0, 3)).map((test, index) => {
                const testName = typeof test === 'string' ? test : test.name || test;
                const department = getTestDepartment(testName);
                const departmentColor = departmentColors[department];
                return (
                  <TestName key={index} departmentColor={departmentColor}>
                    {testName}
                  </TestName>
                );
              })}
              {!showAllTests && order.tests.length > 3 && (
                <TestName 
                  as="button"
                  onClick={toggleShowAllTests}
                  style={{ cursor: 'pointer', background: '#475569', color: '#f8fafc', border: '1px solid #64748b' }}
                >
                  +{order.tests.length - 3} more
                </TestName>
              )}
              {showAllTests && order.tests.length > 3 && (
                <TestName 
                  as="button"
                  onClick={toggleShowAllTests}
                  style={{ cursor: 'pointer', background: '#475569', color: '#f8fafc', border: '1px solid #64748b' }}
                >
                  Show less
                </TestName>
              )}
            </TestNames>
          )}
        </OrderInfo>
        
        <ActionButtons>
          <IconButton 
            onClick={() => onViewDetails(order)}
            onMouseEnter={() => setShowInfoTooltip(true)}
            onMouseLeave={() => setShowInfoTooltip(false)}
            aria-label={`View details for order ${order.orderId}`}
            title={t('orderCard.viewDetails')}
          >
            <FaInfoCircle aria-hidden="true" />
            {showInfoTooltip && (
              <Tooltip>
                <div>Date: {orderDate}</div>
                <div>Tests: {order.tests?.length || 0}</div>
              </Tooltip>
            )}
          </IconButton>
          <IconButton 
            onClick={() => onPrint(order)}
            aria-label={`Print order ${order.orderId}`}
            title={t('orderCard.print')}
          >
            <FaPrint aria-hidden="true" />
          </IconButton>
          <IconButton 
            onClick={() => onViewTimeline(order)}
            aria-label={`View timeline for order ${order.orderId}`}
            title={t('orderCard.viewTimeline')}
          >
            <FaClock aria-hidden="true" />
          </IconButton>
        </ActionButtons>
      </Card>

      {isModalOpen && (
        <RejectionModal order={order} onClose={() => setIsModalOpen(false)} />
      )}
      <AnimatedModal isOpen={showTimeline} onClose={() => setShowTimeline(false)} title="Order Timeline">
        {order.history && order.history.length > 0 ? (
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {order.history.map((h, idx) => (
              <li key={idx} style={{ marginBottom: 12 }}>
                <strong>{h.event}</strong> <br />
                <span>{h.timestamp?.toDate ? h.timestamp.toDate().toLocaleString() : String(h.timestamp)}</span>
                {h.reason && <div style={{ color: '#f5576c', fontSize: 13 }}>{h.reason}</div>}
              </li>
            ))}
          </ul>
        ) : (
          <div>No timeline data available for this order.</div>
        )}
      </AnimatedModal>
    </>
  );
};

export default OrderCard;