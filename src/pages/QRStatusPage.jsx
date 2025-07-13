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
import { toast } from 'react-toastify';

const StatusContainer = styled(motion.div)`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StatusCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 3rem;
  box-shadow: ${({ theme }) => theme.shadows.main};
  border: 1px solid ${({ theme }) => theme.colors.border};
  max-width: 600px;
  width: 100%;
  text-align: center;
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
  background: ${({ theme }) => theme.colors.surfaceSecondary};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
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
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.surfaceSecondary;
      default: return theme.colors.surface;
    }
  }};
  color: ${({ theme, $variant }) => 
    $variant === 'primary' ? 'white' : theme.colors.text};
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
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
          title: 'Test Results Ready',
          message: 'Your test results are ready and have been reviewed by our laboratory team.',
          color: 'success'
        };
      case 'In Progress':
        return {
          icon: <Clock />,
          title: 'Tests in Progress',
          message: 'Your samples are being processed in our laboratory. Results will be available soon.',
          color: 'warning'
        };
      case 'Pending Sample':
        return {
          icon: <Clock />,
          title: 'Sample Collection Pending',
          message: 'Your sample collection is scheduled. Please visit our collection center.',
          color: 'info'
        };
      default:
        return {
          icon: <AlertTriangle />,
          title: 'Status Unknown',
          message: 'We are unable to determine the current status of your order.',
          color: 'error'
        };
    }
  };

  const handleDownloadReport = () => {
    // TODO: Implement PDF download
    toast.info('Download feature coming soon');
  };

  const handleShareResults = () => {
    // TODO: Implement sharing functionality
    toast.info('Share feature coming soon');
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
          <StatusTitle>Loading...</StatusTitle>
          <StatusMessage>Please wait while we fetch your order details.</StatusMessage>
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
          <StatusTitle>Order Not Found</StatusTitle>
          <StatusMessage>
            {error || 'The requested order could not be found. Please check the QR code or contact our support team.'}
          </StatusMessage>
          <ActionButtons>
            <ActionButton
              onClick={() => navigate('/')}
              $variant="primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go Home
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
            Patient Information
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
              Requested Tests
            </h3>
            {order.tests.map((test, index) => (
              <TestItem key={index}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Flask size={16} />
                  <span>{test}</span>
                </div>
                <TestStatus status={order.status === 'Completed' ? 'completed' : 'pending'}>
                  {order.status === 'Completed' ? 'Completed' : 'Pending'}
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
                Download Report
              </ActionButton>
              <ActionButton
                onClick={handleShareResults}
                $variant="secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 />
                Share Results
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
            Contact Support
          </ActionButton>
        </ActionButtons>
      </StatusCard>
    </StatusContainer>
  );
};

export default QRStatusPage; 