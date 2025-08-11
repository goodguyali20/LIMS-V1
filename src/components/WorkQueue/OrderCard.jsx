import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { doc, updateDoc, arrayUnion, serverTimestamp, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { logAuditEvent } from '../../utils/monitoring/auditLogger';
import { useNavigate } from 'react-router-dom';
import RejectionModal from '../Modals/RejectionModal';
import CancellationModal from '../Modals/CancellationModal';
import { FaUser, FaVial, FaClock, FaExclamationTriangle, FaPlay, FaBan, FaRedo, FaDownload, FaCalendar, FaThermometer, FaInfoCircle, FaPrint, FaFlask, FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useTestCatalog } from '../../contexts/TestContext';
import { useTheme } from '../../contexts/ThemeContext';
import { GlowButton } from '../common';
import { showFlashMessage } from '../../contexts/NotificationContext';
import AnimatedModal from '../common/AnimatedModal';
import { useAuth } from '../../contexts/AuthContext';

const Card = styled(motion.div)`
  background: ${({ status }) => {
    switch (status) {
      case 'Sample Collected': return '#1f2937';
      case 'In Progress': return '#1f2937';
      case 'Completed': return '#1f2937';
      case 'Cancelled': return '#1f2937';
      case 'Rejected': return '#1f2937';
      default: return '#1e293b';
    }
  }};
  border: 1px solid ${({ status }) => {
    switch (status) {
      case 'Sample Collected': return '#ef4444';
      case 'In Progress': return '#f59e0b';
      case 'Completed': return '#10b981';
      case 'Cancelled': return '#6b7280';
      case 'Rejected': return '#f59e0b';
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
        case 'Rejected': return '#f59e0b';
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

  ${({ $hasCancelledTests }) => $hasCancelledTests && `
    border-left: 4px solid #6b7280;
    background: linear-gradient(135deg, #1f2937 0%, #1e1b4b 100%);
    
    &::after {
      content: '';
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 8px;
      height: 8px;
      background: #6b7280;
      border-radius: 50%;
      opacity: 0.7;
    }
  `}

  ${({ status }) => status === 'Rejected' && `
    border-left: 4px solid #f59e0b;
    background: linear-gradient(135deg, #1f2937 0%, #451a03 100%);
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
    
    &::after {
      content: '⚠️';
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      font-size: 1.2rem;
      opacity: 0.8;
    }
    
    &::before {
      background: #f59e0b !important;
      height: 5px !important;
    }
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

const CompletionIndicator = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: #10b981;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
    70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  }
`;

const CompletionProgress = styled.div`
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  height: 4px;
  background: #334155;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 2px;
  transition: width 0.3s ease;
  width: ${({ progress }) => progress}%;
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
  z-index: 1000;
  margin-bottom: 0.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  word-wrap: break-word;
  white-space: normal;
  
  /* Ensure tooltip doesn't get clipped */
  min-width: 200px;
  
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

const PortalTooltip = styled.div`
  position: fixed;
  background: #1e293b;
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 0.7rem;
  color: #cbd5e1;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  word-wrap: break-word;
  white-space: normal;
  min-width: 200px;
  
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

const QuickResultModal = styled.div`
  background: #1e293b;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 500px;
  width: 100%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #334155;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #f8fafc;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #334155;
    color: #f8fafc;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #cbd5e1;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #475569;
  border-radius: 6px;
  background: #334155;
  color: #f8fafc;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  
  &::placeholder {
    color: #64748b;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #475569;
  border-radius: 6px;
  background: #334155;
  color: #f8fafc;
  font-size: 0.9rem;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  
  &::placeholder {
    color: #64748b;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
`;

const SaveButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #059669;
  }
  
  &:disabled {
    background: #6b7280;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4b5563;
  }
`;

// Add CSS for spinning icon
const SpinningIcon = styled.span`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const OrderCard = ({ order, onDownload, onViewDetails, onPrint, onViewTimeline, onReadyForCompletion, onStatusChange, isGlobalPrintModeActive = false }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { labTests, departmentColors } = useTestCatalog();
  const { user } = useAuth(); // Get the authenticated user
  

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showAllTests, setShowAllTests] = useState(false);
  const [isPrintModeActive, setIsPrintModeActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showQuickResultModal, setShowQuickResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [quickResult, setQuickResult] = useState({ value: '', comments: '' });
  const [savingQuickResult, setSavingQuickResult] = useState(false);
  const [localOrder, setLocalOrder] = useState(order); // Local copy of order for immediate updates
  
  // Sync localOrder with order prop when it changes
  useEffect(() => {
    setLocalOrder(order);
  }, [order]);
  
  // Cancellation state
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [cancellationType, setCancellationType] = useState('order'); // 'order' or 'test'
  const [cancellationTarget, setCancellationTarget] = useState(null); // order or test object
  const [showCancelButtons, setShowCancelButtons] = useState(false); // Control visibility of cancel buttons
  const orderDate = localOrder.createdAt?.toDate ? localOrder.createdAt.toDate().toLocaleDateString() : 'N/A';

  // Monitor when order becomes ready for completion
  useEffect(() => {
    if (onReadyForCompletion && isReadyForCompletion() && localOrder.status === 'In Progress') {
      onReadyForCompletion(localOrder.id);
    }
  }, [localOrder.results, localOrder.tests, localOrder.status, onReadyForCompletion]);

  // Reset cancel buttons when order changes
  useEffect(() => {
    resetCancelButtons();
  }, [order.id]);

  const getTestDepartment = (testName) => {
    const test = labTests.find(t => t.name === testName);
    return test ? test.department : 'Parasitology';
  };

  const calculateTimeInStage = () => {
    let startTime;
    
    // Try to find the most recent status change
    if (localOrder.history && localOrder.history.length > 0) {
      const statusChanges = localOrder.history.filter(h => 
        h.event && (h.event.includes('status') || h.event.includes('Status') || 
                   h.event.includes('Pending') || h.event.includes('In Progress') || 
                   h.event.includes('Completed') || h.event.includes('Cancelled') ||
                   h.event.includes('Rejected'))
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
      startTime = localOrder.createdAt?.toDate ? 
        localOrder.createdAt.toDate() : 
        new Date(localOrder.createdAt);
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
    navigate(`/app/order/${localOrder.id}/enter-results`);
  };

  const toggleShowAllTests = () => {
    setShowAllTests(!showAllTests);
  };

  const handleTestClick = (test) => {
    if (localOrder.status === 'In Progress') {
      setSelectedTest(test);
      setQuickResult({ value: '', comments: '' });
      setShowQuickResultModal(true);
    }
  };

  const handleQuickResultChange = (field, value) => {
    setQuickResult(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveQuickResult = async () => {
    if (!quickResult.value.trim()) {
      showFlashMessage({ type: 'error', title: 'Error', message: 'Result value is required' });
      return;
    }

    try {
      setSavingQuickResult(true);
      
      const testName = typeof selectedTest === 'string' ? selectedTest : selectedTest.name || selectedTest;
      
      // Update the order with the new result
      const orderRef = doc(db, 'testOrders', localOrder.id);
      const currentResults = localOrder.results || {};
      
      const newResult = {
        value: quickResult.value,
        comments: quickResult.comments,
        enteredAt: serverTimestamp(),
        enteredBy: user?.email || 'current-user',
        status: 'completed'
      };
      
      await updateDoc(orderRef, {
        results: {
          ...currentResults,
          [testName]: newResult
        }
      });

      // Log audit event
      await logAuditEvent('Quick Result Entered', {
        orderId: localOrder.id,
        testName,
        resultValue: quickResult.value
      });

      // Update local state immediately for UI responsiveness
      const updatedOrder = {
        ...localOrder,
        results: {
          ...currentResults,
          [testName]: {
            ...newResult,
            enteredAt: new Date() // Use local date for immediate display
          }
        }
      };
      setLocalOrder(updatedOrder);

      showFlashMessage({ type: 'success', title: 'Success', message: `Result saved for ${testName}` });
      
      // Close modal and reset
      setShowQuickResultModal(false);
      setSelectedTest(null);
      setQuickResult({ value: '', comments: '' });
      
      // Notify parent component of the change
      if (onStatusChange) {
        onStatusChange(localOrder.id, updatedOrder);
      }
      
    } catch (error) {
      console.error('Error saving quick result:', error);
      showFlashMessage({ type: 'error', title: 'Error', message: 'Failed to save result' });
    } finally {
      setSavingQuickResult(false);
    }
  };

  const handleCloseQuickResultModal = () => {
    setShowQuickResultModal(false);
    setSelectedTest(null);
    setQuickResult({ value: '', comments: '' });
  };

  // Check if all tests are completed
  const isReadyForCompletion = () => {
    return localOrder.tests && localOrder.results && 
           localOrder.tests.length > 0 && 
           Object.keys(localOrder.results).length === localOrder.tests.length;
  };

  // Handle test cancellation
  const handleTestCancellation = async (reason) => {
    try {
      setIsSubmitting(true);
      
      // Update the test status to cancelled in Firestore
      const orderRef = doc(db, 'testOrders', localOrder.id);
      const testName = typeof cancellationTarget === 'string' ? cancellationTarget : cancellationTarget?.name || cancellationTarget;
      
      // Get current cancelled tests or initialize empty object
      const currentCancelledTests = localOrder.cancelledTests || {};
      
      // Add the cancelled test to cancelledTests
      const updatedCancelledTests = {
        ...currentCancelledTests,
        [testName]: {
          cancelledAt: serverTimestamp(),
          cancelledBy: user?.email || 'unknown_user',
          reason: reason,
          status: 'Cancelled'
        }
      };

      // Remove the test from the main tests array and add to cancelledTests
      const updatedTests = localOrder.tests.filter(test => {
        const testNameToCheck = typeof test === 'string' ? test : test.name || test;
        return testNameToCheck !== testName;
      });

      // Update the document
      await updateDoc(orderRef, {
        tests: updatedTests,
        cancelledTests: updatedCancelledTests,
        updatedAt: serverTimestamp(),
        // Update status to reflect the change
        status: updatedTests.length === 0 ? 'Cancelled' : localOrder.status
      });
      
      // Update local state immediately
      setLocalOrder(prev => ({
        ...prev,
        tests: updatedTests,
        cancelledTests: updatedCancelledTests,
        status: updatedTests.length === 0 ? 'Cancelled' : prev.status
      }));

      // Log the audit event
      await logAuditEvent('Test Cancelled', {
        orderId: localOrder.orderId || localOrder.id,
        testName: testName,
        reason: reason,
        cancelledBy: user?.email || 'unknown_user'
      });

      showFlashMessage({ 
        type: 'success', 
        title: 'Test Cancelled', 
        message: `Test "${testName}" has been cancelled successfully` 
      });

      // Close the modal
      setShowCancellationModal(false);
      setCancellationTarget(null);
      setCancellationType('order');
      resetCancelButtons(); // Hide cancel buttons after cancellation
      
      // Trigger a refresh of the order data instead of page reload
      if (onStatusChange) {
        // This will trigger a refresh of the order data
        onStatusChange(localOrder.id, localOrder.status, { refresh: true });
      }
      
    } catch (error) {
      console.error('Error cancelling test:', error);
      showFlashMessage({ 
        type: 'error', 
        title: 'Error', 
        message: 'Failed to cancel test. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle order cancellation
  const handleOrderCancellation = async (reason) => {
    try {
      // This will be handled by the parent component
      if (onStatusChange) {
        await onStatusChange(localOrder.id, 'Cancelled', { 
          reason,
          cancelledBy: user?.email || 'unknown_user'
        });
      }
      
      // Close the modal after successful cancellation
      setShowCancellationModal(false);
      resetCancelButtons();
      
      // Show success message
      showFlashMessage({
        type: 'success',
        title: 'Order Cancelled',
        message: `Order #${localOrder.orderId} has been cancelled successfully.`
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      showFlashMessage({
        type: 'error',
        title: 'Cancellation Failed',
        message: 'Failed to cancel the order. Please try again.'
      });
    }
  };

  // Open cancellation modal for order
  const openOrderCancellationModal = () => {
    
    // Check if order is already completed
    if (localOrder.status === 'Completed') {
      showFlashMessage({ 
        type: 'warning', 
        title: 'Cannot Cancel Order', 
        message: 'This order is already completed and cannot be cancelled.' 
      });
      return;
    }
    
    // Check if order is already cancelled
    if (localOrder.status === 'Cancelled') {
      showFlashMessage({ 
        type: 'warning', 
        title: 'Order Already Cancelled', 
        message: 'This order has already been cancelled.' 
      });
      return;
    }
    
    setCancellationType('order');
    setCancellationTarget(order);
    setShowCancellationModal(true);
  };

  // Open cancellation modal for specific test
  const openTestCancellationModal = (test) => {
    const testName = typeof test === 'string' ? test : test.name || test;
    
    // Check if test is already completed
    if (order.results && order.results[testName]) {
      showFlashMessage({ 
        type: 'warning', 
        title: 'Cannot Cancel Test', 
        message: `Test "${testName}" is already completed and cannot be cancelled.` 
      });
      return;
    }
    
    // Check if test is already cancelled
    if (order.cancelledTests && order.cancelledTests[testName]) {
      showFlashMessage({ 
        type: 'warning', 
        title: 'Test Already Cancelled', 
        message: `Test "${testName}" has already been cancelled.` 
      });
      return;
    }
    
    setCancellationType('test');
    setCancellationTarget(test);
    setShowCancellationModal(true);
  };

  const toggleCancelButtons = () => {
    setShowCancelButtons(!showCancelButtons);
  };

  const resetCancelButtons = () => {
    setShowCancelButtons(false);
  };

  // Custom print function for order details
  const printOrderDetails = () => {
    // Create a new window with the printable content
    const printWindow = window.open('', '_blank');
    const orderData = localOrder;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Details - ${orderData.orderId || orderData.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .info-item { padding: 10px; background: #f5f5f5; border-radius: 5px; }
            .info-label { font-weight: bold; color: #666; }
            .info-value { color: #333; margin-top: 5px; }
            .tests-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .tests-table th, .tests-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .tests-table th { background: #f8f9fa; font-weight: bold; }
            .status-completed { color: #28a745; font-weight: bold; }
            .status-pending { color: #ffc107; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SmartLab LIMS - Order Details</h1>
            <h2>Order ID: ${orderData.orderId || orderData.id}</h2>
          </div>
          
          <div class="section">
            <div class="section-title">Patient Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Patient Name</div>
                <div class="info-value">${orderData.patientName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Patient ID</div>
                <div class="info-value">${orderData.patientId || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Age</div>
                <div class="info-value">${orderData.patientAge || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">${orderData.patientGender || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Referring Doctor</div>
                <div class="info-value">${orderData.referringDoctor || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Order Date</div>
                <div class="info-value">${orderData.orderDate ? new Date(orderData.orderDate).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Test Results</div>
            <table class="tests-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Status</th>
                  <th>Result</th>
                  <th>Unit</th>
                  <th>Reference Range</th>
                </tr>
              </thead>
              <tbody>
                ${(orderData.tests || []).map(test => `
                  <tr>
                    <td>${test.name || test.testName || 'N/A'}</td>
                    <td class="status-${test.status === 'Completed' ? 'completed' : 'pending'}">${test.status || 'Pending'}</td>
                    <td>${test.result || 'N/A'}</td>
                    <td>${test.unit || 'N/A'}</td>
                    <td>${test.referenceRange || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>SmartLab LIMS - Laboratory Information Management System</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print with a delay to ensure content is ready
    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
        // Keep the window open for a bit longer to ensure print dialog completes
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      } catch (error) {
        console.error('Print error:', error);
        // If print fails, keep window open for manual printing
        printWindow.focus();
      }
    }, 500);
  };

  // Custom print function for individual test
  const printTestResults = (testName) => {
    const printWindow = window.open('', '_blank');
    const orderData = localOrder;
    const test = (orderData.tests || []).find(t => (t.name || t.testName) === testName);
    
    if (!test) {
      printWindow.close();
      return;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Results - ${testName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .info-item { padding: 10px; background: #f5f5f5; border-radius: 5px; }
            .info-label { font-weight: bold; color: #666; }
            .info-value { color: #333; margin-top: 5px; }
            .test-result { background: #e8f5e8; padding: 20px; border-radius: 8px; border: 2px solid #28a745; }
            .test-name { font-size: 20px; font-weight: bold; color: #28a745; margin-bottom: 15px; }
            .result-item { margin-bottom: 10px; }
            .result-label { font-weight: bold; color: #333; }
            .result-value { color: #666; margin-left: 10px; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SmartLab LIMS - Test Results</h1>
            <h2>${testName}</h2>
          </div>
          
          <div class="section">
            <div class="section-title">Patient Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Patient Name</div>
                <div class="info-value">${orderData.patientName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Patient ID</div>
                <div class="info-value">${orderData.patientId || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Order ID</div>
                <div class="info-value">${orderData.orderId || orderData.id}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Test Date</div>
                <div class="info-value">${new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Test Results</div>
            <div class="test-result">
              <div class="test-name">${testName}</div>
              <div class="result-item">
                <span class="result-label">Status:</span>
                <span class="result-value">${test.status || 'Pending'}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Result:</span>
                <span class="result-value">${test.result || 'N/A'}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Unit:</span>
                <span class="result-value">${test.unit || 'N/A'}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Reference Range:</span>
                <span class="result-value">${test.referenceRange || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>SmartLab LIMS - Laboratory Information Management System</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print with a delay to ensure content is ready
    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
        // Keep the window open for a bit longer to ensure print dialog completes
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      } catch (error) {
        console.error('Print error:', error);
        // If print fails, keep window open for manual printing
        printWindow.focus();
      }
    }, 500);
  };

  return (
    <>
      <Card
        status={localOrder.status} 
        priority={order.priority}
        $isOptimistic={order._isOptimistic}
        $hasCancelledTests={order.cancelledTests && Object.keys(order.cancelledTests).length > 0}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        data-order-card
        tabIndex={0}
        role="article"
        aria-label={`Order ${localOrder.orderId} for ${localOrder.patientName}, status: ${localOrder.status}, priority: ${localOrder.priority}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewDetails(order);
          }
        }}
      >
        {order._isOptimistic && <OptimisticIndicator />}
        
        <TopRightInfo>
          <InfoNumber 
            title={`${localOrder.tests?.length || 0} total tests${localOrder.cancelledTests && Object.keys(localOrder.cancelledTests).length > 0 ? ` (${Object.keys(localOrder.cancelledTests).length} cancelled)` : ''}`}
          >
            {order.tests?.length || 0}
          </InfoNumber>
          <LiveTimer>{timeInStage}</LiveTimer>
        </TopRightInfo>
        
        {/* Show completion progress for In Progress orders */}
        {localOrder.status === 'In Progress' && localOrder.tests && localOrder.results && localOrder.tests.length > 0 && (
          <CompletionProgress>
            <ProgressBar 
              progress={Math.round((Object.keys(order.results).length / order.tests.length) * 100)} 
            />
          </CompletionProgress>
        )}
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
          
          {localOrder.tests && localOrder.tests.length > 0 && (
            <TestNames>
              {(showAllTests ? localOrder.tests : localOrder.tests.slice(0, 3)).map((test, index) => {
                const testName = typeof test === 'string' ? test : test.name || test;
                const department = getTestDepartment(testName);
                const departmentColor = departmentColors[department];
                const hasResult = localOrder.results && localOrder.results[testName];
                                  const isCancelled = localOrder.cancelledTests && localOrder.cancelledTests[testName];
                
                // Don't show cancelled tests in the main tests list
                if (isCancelled) return null;
                
                return (
                  <TestName 
                    key={index} 
                    departmentColor={departmentColor}
                    onClick={() => handleTestClick(test)}
                    style={{ 
                      cursor: localOrder.status === 'In Progress' ? 'pointer' : 'default',
                      transition: localOrder.status === 'In Progress' ? 'all 0.2s ease' : 'none',
                      opacity: hasResult ? 0.7 : 1,
                      position: 'relative'
                    }}
                    title={localOrder.status === 'In Progress' ? 
                      (hasResult ? `Result already entered for ${testName}. Click to modify.` : `Click to enter result for ${testName}`) : 
                      ''
                    }
                  >
                    {testName}
                    {hasResult && (
                      <>
                        <span style={{
                          position: 'absolute',
                          top: -5,
                          right: -5,
                          background: '#10b981',
                          color: 'white',
                          borderRadius: '50%',
                          width: '16px',
                          height: '16px',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #1e293b'
                        }}>
                          ✓
                        </span>
                        
                                                 {/* Print button for completed test - only show when print mode is active */}
                         {(isPrintModeActive || isGlobalPrintModeActive) && (
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               // Print individual test results
                               printTestResults(testName);
                             }}
                             style={{
                               position: 'absolute',
                               top: -5,
                               right: 25,
                               background: '#10b981',
                               color: 'white',
                               border: 'none',
                               borderRadius: '50%',
                               width: '16px',
                               height: '16px',
                               fontSize: '8px',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               cursor: 'pointer',
                               transition: 'all 0.2s ease',
                               boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                             }}
                             title={`Print results for ${testName}`}
                             aria-label={`Print results for ${testName}`}
                           >
                             <FaPrint />
                           </button>
                         )}
                      </>
                    )}
                    
                    {/* Cancel Test button - only show when showCancelButtons is true */}
                    {showCancelButtons && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openTestCancellationModal(test);
                        }}
                        disabled={isSubmitting}
                        style={{
                          position: 'absolute',
                          top: -5,
                          left: -5,
                          background: isSubmitting ? '#6b7280' : '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '16px',
                          height: '16px',
                          fontSize: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: isSubmitting ? 0.6 : 1
                        }}
                        title={isSubmitting ? 'Cancelling...' : `Cancel test: ${testName}`}
                        aria-label={`Cancel test ${testName}`}
                      >
                        {isSubmitting ? '⋯' : '×'}
                      </button>
                    )}
                  </TestName>
                );
              })}
              
              {/* Show cancelled tests count if any */}
              {order.cancelledTests && Object.keys(order.cancelledTests).length > 0 && (
                <TestName 
                  style={{ 
                    background: '#6b7280', 
                    color: '#f8fafc', 
                    border: '1px solid #9ca3af',
                    cursor: 'default',
                    opacity: 0.7
                  }}
                  title={`${Object.keys(order.cancelledTests).length} cancelled test(s)`}
                >
                  {Object.keys(order.cancelledTests).length} cancelled
                </TestName>
              )}
              
              {!showAllTests && localOrder.tests.length > 3 && (
                <TestName 
                  as="button"
                  onClick={toggleShowAllTests}
                  style={{ cursor: 'pointer', background: '#475569', color: '#f8fafc', border: '1px solid #64748b' }}
                >
                  +{localOrder.tests.length - 3} more
                </TestName>
              )}
              {showAllTests && localOrder.tests.length > 3 && (
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
          {/* Enhanced Info Button - shows comprehensive order details */}
          <IconButton 
            onClick={() => setShowInfoModal(true)}
            onMouseEnter={(e) => {
              const button = e.currentTarget;
              const rect = button.getBoundingClientRect();
              setShowInfoTooltip(true);
              // Store position for portal tooltip
              setTooltipPosition({
                top: rect.top - 10,
                left: rect.left + rect.width / 2
              });
            }}
            onMouseLeave={() => setShowInfoTooltip(false)}
            aria-label={`View detailed information for order ${localOrder.orderId || localOrder.id}`}
            title="View detailed order information"
          >
            <FaInfoCircle aria-hidden="true" />
          </IconButton>
          
          {/* Enhanced Print Button - opens print options modal */}
          <IconButton 
            onClick={() => setShowPrintModal(true)}
            aria-label={`Print order ${localOrder.orderId || localOrder.id}`}
            title="Print order documents and slips"
          >
            <FaPrint aria-hidden="true" />
          </IconButton>
          
          {/* Enhanced Timeline Button - shows comprehensive order history */}
          <IconButton 
            onClick={() => setShowTimeline(true)}
            aria-label={`View timeline for order ${localOrder.orderId || localOrder.id}`}
            title="View complete order timeline and history"
          >
            <FaClock aria-hidden="true" />
          </IconButton>
          
                       {/* Print Results Button - only show for completed orders */}
             {localOrder.status === 'Completed' && (
               <IconButton 
                 onClick={() => {
                   // Print detailed order results
                   printOrderDetails();
                 }}
                 aria-label={`Print detailed results for order ${localOrder.orderId || localOrder.id}`}
                 title="Print detailed test results report"
                 style={{ 
                   background: isGlobalPrintModeActive ? '#059669' : '#10b981',
                   color: '#ffffff',
                   borderColor: '#059669'
                 }}
               >
                 <FaPrint aria-hidden="true" />
               </IconButton>
             )}
          {/* Process button - only show for orders currently in progress */}
          {localOrder.status === 'In Progress' && (
            <IconButton 
              onClick={handleProcessClick}
              aria-label={`Process order ${localOrder.orderId}`}
              title={t('orderCard_process_button')}
              style={{ 
                background: '#f59e0b',
                color: '#ffffff',
                borderColor: '#d97706'
              }}
            >
              <FaPlay aria-hidden="true" />
            </IconButton>
          )}
          
          {/* Cancel Order button - show for all non-completed orders */}
          {localOrder.status !== 'Completed' && localOrder.status !== 'Cancelled' && localOrder.status !== 'Rejected' && (
            <>
              <IconButton 
                onClick={toggleCancelButtons}
                disabled={isSubmitting}
                aria-label={showCancelButtons ? 'Hide test cancel buttons' : 'Show test cancel buttons'}
                title={showCancelButtons ? 'Hide test cancel buttons' : 'Show test cancel buttons'}
                style={{ 
                  background: isSubmitting ? '#6b7280' : (showCancelButtons ? '#dc2626' : '#ef4444'),
                  color: '#ffffff',
                  borderColor: isSubmitting ? '#4b5563' : (showCancelButtons ? '#b91c1c' : '#dc2626'),
                  opacity: isSubmitting ? 0.6 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {showCancelButtons ? <FaTimes aria-hidden="true" /> : <FaBan aria-hidden="true" />}
              </IconButton>
              
              {/* Cancel entire order button - only show when test cancel buttons are visible */}
              {showCancelButtons && (
                <IconButton 
                  onClick={() => {
                    openOrderCancellationModal();
                  }}
                  disabled={isSubmitting}
                  aria-label={`Cancel entire order ${order.orderId}`}
                  title="Cancel entire order"
                  style={{ 
                    background: isSubmitting ? '#6b7280' : '#dc2626',
                    color: '#ffffff',
                    borderColor: isSubmitting ? '#4b5563' : '#b91c1c',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FaTrash aria-hidden="true" />
                </IconButton>
              )}
            </>
          )}
          
          {/* Sample Rejection button - show for all non-completed, non-cancelled, non-rejected orders */}
          {(() => {
            // Ensure we have a valid order status
            const orderStatus = order?.status || 'Unknown';
            const shouldShowRejection = orderStatus !== 'Completed' && orderStatus !== 'Cancelled' && orderStatus !== 'Rejected';
            

            
            // Always show the button if it should be visible, regardless of other conditions
            if (shouldShowRejection) {
              return (
                <IconButton 
                  onClick={() => setIsModalOpen(true)}
                  disabled={isSubmitting}
                  aria-label={`Reject sample for order ${order?.orderId || order?.id || 'Unknown'}`}
                  title="Reject sample - return to phlebotomy for recollection"
                  style={{ 
                    background: isSubmitting ? '#6b7280' : '#f59e0b',
                    color: '#ffffff',
                    borderColor: isSubmitting ? '#4b5563' : '#d97706',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FaExclamationTriangle aria-hidden="true" />
                </IconButton>
              );
            }
            
            return null;
          })()}
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

      {/* Enhanced Info Modal - shows comprehensive order details */}
      <AnimatedModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title="Order Information">
        <div style={{ padding: '1rem 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Order Details</h4>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                <div><strong>Order ID:</strong> {localOrder.id}</div>
                <div><strong>Status:</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>{localOrder.status}</span></div>
                <div><strong>Priority:</strong> {localOrder.priority || 'Normal'}</div>
                <div><strong>Created:</strong> {orderDate}</div>
                <div><strong>Time in Stage:</strong> {calculateTimeInStage()}</div>
              </div>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Patient Information</h4>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                <div><strong>Name:</strong> {localOrder.patientName}</div>
                <div><strong>Patient ID:</strong> {localOrder.patientId || 'N/A'}</div>
                <div><strong>Age/Gender:</strong> {localOrder.age || 'N/A'} / {localOrder.gender || 'N/A'}</div>
                <div><strong>Phone:</strong> {localOrder.phone || 'N/A'}</div>
                <div><strong>Doctor:</strong> {localOrder.referringDoctor || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Tests ({localOrder.tests?.length || 0})</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {localOrder.tests?.map((test, idx) => (
                <span key={idx} style={{
                  background: '#475569',
                  color: '#f8fafc',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  border: `1px solid ${departmentColors[getTestDepartment(test)] || '#64748b'}`
                }}>
                  {typeof test === 'string' ? test : test.name || test.id}
                </span>
              ))}
            </div>
          </div>
          
          {order.notes && (
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Notes</h4>
              <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                {order.notes}
              </div>
            </div>
          )}
        </div>
      </AnimatedModal>

      {/* Enhanced Print Modal - shows print options */}
      <AnimatedModal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} title="Print Options">
        <div style={{ padding: '1rem 0' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 1rem 0', color: '#cbd5e1' }}>
              Select what you'd like to print for this order:
            </p>
          </div>
          
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <button
              onClick={() => {
                // Navigate to print order page
                navigate(`/app/print-order/${localOrder.id}`);
                setShowPrintModal(false);
              }}
              style={{
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              <FaPrint /> Print All Documents
            </button>
            
            <button
              onClick={() => {
                // Navigate to order view page for detailed printing
                navigate(`/app/order/${localOrder.id}`);
                setShowPrintModal(false);
              }}
              style={{
                background: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              <FaInfoCircle /> View Order Details & Print
            </button>
            
            <div style={{ 
              background: '#1e293b', 
              padding: '0.75rem', 
              borderRadius: '6px', 
              fontSize: '0.8rem',
              color: '#94a3b8'
            }}>
              <strong>Available Documents:</strong>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
                <li>Requisition Form</li>
                <li>Master Slip</li>
                <li>Department Slips</li>
                <li>Tube ID Slips</li>
                <li>A4 Report</li>
              </ul>
            </div>
          </div>
        </div>
      </AnimatedModal>

      {/* Quick Result Input Modal */}
      <AnimatedModal isOpen={showQuickResultModal} onClose={handleCloseQuickResultModal}>
        <QuickResultModal>
          <ModalHeader>
            <ModalTitle>
              <FaFlask />
              Enter Result for {typeof selectedTest === 'string' ? selectedTest : selectedTest?.name || selectedTest}
            </ModalTitle>
            <CloseButton onClick={handleCloseQuickResultModal}>
              <FaTimes />
            </CloseButton>
          </ModalHeader>
          
          <FormGroup>
            <Label>Result Value *</Label>
            <Input
              type="text"
              value={quickResult.value}
              onChange={(e) => handleQuickResultChange('value', e.target.value)}
              placeholder="Enter the test result..."
              autoFocus
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Comments (Optional)</Label>
            <TextArea
              value={quickResult.comments}
              onChange={(e) => handleQuickResultChange('comments', e.target.value)}
              placeholder="Add any additional notes or observations..."
            />
          </FormGroup>
          
          <ButtonGroup>
            <CancelButton onClick={handleCloseQuickResultModal}>
              <FaTimes /> Cancel
            </CancelButton>
            <SaveButton 
              onClick={handleSaveQuickResult}
              disabled={savingQuickResult || !quickResult.value.trim()}
            >
              {savingQuickResult ? (
                <>
                  <SpinningIcon><FaClock /></SpinningIcon> Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Result
                </>
              )}
            </SaveButton>
          </ButtonGroup>
        </QuickResultModal>
      </AnimatedModal>

      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={showCancellationModal}
        onClose={() => {
          setShowCancellationModal(false);
          resetCancelButtons(); // Hide cancel buttons when modal is closed
        }}
        onConfirm={cancellationType === 'order' ? handleOrderCancellation : handleTestCancellation}
        type={cancellationType}
        orderId={order.orderId}
        testName={cancellationType === 'test' ? (typeof cancellationTarget === 'string' ? cancellationTarget : cancellationTarget?.name || cancellationTarget) : null}
        patientName={order.patientName}
        isSubmitting={isSubmitting}
      />
      
      {/* Portal Tooltip - renders outside card container to prevent clipping */}
      {showInfoTooltip && createPortal(
        <PortalTooltip
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div style={{ lineHeight: '1.4', marginBottom: '0.25rem' }}>
            <strong>Order ID:</strong> {localOrder.id?.substring(0, 8) || 'N/A'}
          </div>
          <div style={{ lineHeight: '1.4', marginBottom: '0.25rem' }}>
            <strong>Date:</strong> {orderDate}
          </div>
          <div style={{ lineHeight: '1.4', marginBottom: '0.25rem' }}>
            <strong>Tests:</strong> {localOrder.tests?.length || 0}
          </div>
          <div style={{ lineHeight: '1.4', marginBottom: '0.25rem' }}>
            <strong>Status:</strong> {localOrder.status}
          </div>
          <div style={{ lineHeight: '1.4' }}>
            <strong>Priority:</strong> {localOrder.priority || 'Normal'}
          </div>
        </PortalTooltip>,
        document.body
      )}
    </>
  );
};

export default OrderCard;