import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Flask,
  FileText,
  Download,
  Share2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { showFlashMessage } from '../../contexts/NotificationContext';

const StatusContainer = styled(motion.div)`
  min-height: 100vh;
  background: ${({ theme }) => theme.isDarkMode 
    ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
    : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
  };
  color: ${({ theme }) => theme.colors.text};
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-attachment: fixed;
`;

const StatusCard = styled(motion.div)`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  max-width: 600px;
  width: 100%;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      #667eea 0%, 
      #764ba2 25%, 
      #f093fb 50%, 
      #f5576c 75%, 
      #4facfe 100%);
    border-radius: 20px 20px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const StatusIcon = styled(motion.div)`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: ${({ status, theme }) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'in_progress': return theme.colors.warning;
      case 'pending': return theme.colors.info;
      case 'error': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  }};
`;

const StatusTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const StatusMessage = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const PatientInfo = styled.div`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 16px 16px 0 0;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  
  svg {
    color: ${({ theme }) => theme.colors.textSecondary};
    width: 1rem;
  }
`;

const TestList = styled.div`
  margin-top: 1.5rem;
`;

const TestItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TestStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'completed': return `${theme.colors.success}20`;
      case 'in_progress': return `${theme.colors.warning}20`;
      case 'pending': return `${theme.colors.info}20`;
      default: return `${theme.colors.textSecondary}20`;
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'in_progress': return theme.colors.warning;
      case 'pending': return theme.colors.info;
      default: return theme.colors.textSecondary;
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'primary': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'secondary': return 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)';
      default: return 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)';
    }
  }};
  color: ${({ theme, $variant }) => 
    $variant === 'primary' ? 'white' : theme.colors.text};
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
`;

const QRStatusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        const orderDoc = await getDoc(doc(db, 'testOrders', orderId));
        
        if (!orderDoc.exists()) {
          setError('Order not found');
          setLoading(false);
          return;
        }

        const orderData = { id: orderDoc.id, ...orderDoc.data() };
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Completed':
        return {
          icon: <CheckCircle />,
          title: t('qrStatus.testResultsReady'),
          message: t('qrStatus.testResultsReadyMessage'),
          color: 'success'
        };
      case 'In Progress':
        return {
          icon: <Clock />,
          title: t('qrStatus.testsInProgress'),
          message: t('qrStatus.testsInProgressMessage'),
          color: 'warning'
        };
      case 'Pending Sample':
        return {
          icon: <Clock />,
          title: t('qrStatus.sampleCollectionPending'),
          message: t('qrStatus.sampleCollectionPendingMessage'),
          color: 'info'
        };
      default:
        return {
          icon: <AlertTriangle />,
          title: t('qrStatus.statusUnknown'),
          message: t('qrStatus.statusUnknownMessage'),
          color: 'error'
        };
    }
  };

  const handleDownloadReport = () => {
    // TODO: Implement PDF download
    showFlashMessage({ type: 'info', title: 'Coming Soon', message: 'Download feature coming soon' });
  };

  const handleShareResults = () => {
    // TODO: Implement sharing functionality
    showFlashMessage({ type: 'info', title: 'Coming Soon', message: 'Share feature coming soon' });
  };

  if (loading) {
    return (
      <StatusContainer>
        <StatusCard>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Clock size={48} />
          </motion.div>
          <StatusTitle>{t('qrStatus.loading')}</StatusTitle>
          <StatusMessage>{t('qrStatus.loadingMessage')}</StatusMessage>
        </StatusCard>
      </StatusContainer>
    );
  }

  if (error || !order) {
    return (
      <StatusContainer>
        <StatusCard>
          <StatusIcon status="error">
            <AlertTriangle />
          </StatusIcon>
          <StatusTitle>{t('qrStatus.orderNotFound')}</StatusTitle>
          <StatusMessage>
            {error || t('qrStatus.orderNotFoundMessage')}
          </StatusMessage>
          <ActionButtons>
            <ActionButton
              onClick={() => navigate('/')}
              $variant="primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('qrStatus.goHome')}
            </ActionButton>
          </ActionButtons>
        </StatusCard>
      </StatusContainer>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <StatusContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <StatusCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <StatusIcon status={statusInfo.color}>
          {statusInfo.icon}
        </StatusIcon>
        
        <StatusTitle>{statusInfo.title}</StatusTitle>
        <StatusMessage>{statusInfo.message}</StatusMessage>

        <PatientInfo>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
            {t('qrStatus.patientInformation')}
          </h3>
          <InfoGrid>
            <InfoItem>
              <User />
              <span>{order.patientName}</span>
            </InfoItem>
            <InfoItem>
              <Calendar />
              <span>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}</span>
            </InfoItem>
            <InfoItem>
              <Phone />
              <span>{order.phone || 'N/A'}</span>
            </InfoItem>
            <InfoItem>
              <Mail />
              <span>{order.email || 'N/A'}</span>
            </InfoItem>
          </InfoGrid>
        </PatientInfo>

        {order.tests && order.tests.length > 0 && (
          <TestList>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
              {t('qrStatus.requestedTests')}
            </h3>
            {order.tests.map((test, index) => (
              <TestItem key={index}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Flask size={16} />
                  <span>{test}</span>
                </div>
                <TestStatus status={order.status === 'Completed' ? 'completed' : 'pending'}>
                  {order.status === 'Completed' ? t('qrStatus.completed') : t('qrStatus.pending')}
                </TestStatus>
              </TestItem>
            ))}
          </TestList>
        )}

        <ActionButtons>
          {order.status === 'Completed' && (
            <>
              <ActionButton
                onClick={handleDownloadReport}
                $variant="primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download />
                {t('qrStatus.downloadReport')}
              </ActionButton>
              <ActionButton
                onClick={handleShareResults}
                $variant="secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 />
                {t('qrStatus.shareResults')}
              </ActionButton>
            </>
          )}
          <ActionButton
            onClick={() => navigate('/')}
            $variant="secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileText />
            {t('qrStatus.contactSupport')}
          </ActionButton>
        </ActionButtons>
      </StatusCard>
    </StatusContainer>
  );
};

export default QRStatusPage; 