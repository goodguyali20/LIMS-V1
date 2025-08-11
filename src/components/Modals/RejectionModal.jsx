import React, { useState } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { logAuditEvent } from '../../utils/monitoring/auditLogger';
import { useTranslation } from 'react-i18next';
import { showFlashMessage } from '../../contexts/NotificationContext';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1e293b;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  border: 2px solid #f59e0b;
`;

const ModalHeader = styled.h2`
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const WarningSection = styled.div`
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const WarningText = styled.p`
  margin: 0;
  color: #fbbf24;
  font-size: 0.9rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #e5e7eb;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Required = styled.span`
  color: #f59e0b;
  margin-left: 0.25rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #374151;
  background: #0f172a;
  color: #e5e7eb;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #374151;
  background: #0f172a;
  color: #e5e7eb;
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
  }
  
  &::placeholder {
    color: #6b7280;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
`;

const RejectButton = styled(Button)`
  background-color: #f59e0b;
  color: white;
  border: 1px solid #d97706;
  
  &:hover:not(:disabled) {
    background-color: #d97706;
    border-color: #b45309;
  }
  
  &:disabled {
    background-color: #6b7280;
    border-color: #4b5563;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: #6b7280;
  color: white;
  border: 1px solid #4b5563;
  
  &:hover:not(:disabled) {
    background-color: #4b5563;
    border-color: #374151;
  }
`;

const RejectionModal = ({ order, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const REJECTION_REASONS = [
    'Sample Hemolyzed',
    'Insufficient Quantity',
    'Improperly Labeled',
    'Clotted Sample',
    'Contaminated Sample',
    'Wrong Tube Type',
    'Expired Collection Time',
    'Temperature Issues',
    'Other'
  ];
  
  const [reason, setReason] = useState(REJECTION_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    
    setIsSubmitting(true);

    try {
      const orderRef = doc(db, "testOrders", order.id);

      // Update the order with rejection details and mark for recollection
      await updateDoc(orderRef, {
        status: 'Rejected',
        rejectionDetails: {
          reason: reason,
          notes: notes,
          rejectedBy: user.email,
          rejectedAt: new Date()
        },
        // Mark for recollection - this will move it back to phlebotomy
        needsRecollection: true,
        recollectionRequestedAt: new Date(),
        // Add to history
        history: arrayUnion({
          event: 'Sample Rejected - Recollection Required',
          timestamp: new Date(),
          reason: reason,
          notes: notes,
          rejectedBy: user.email
        }),
        // Update timestamps
        updatedAt: new Date()
      });

      // Log audit event
      await logAuditEvent('Sample Rejected - Recollection Required', { 
        orderId: order.orderId || order.id, 
        patientId: order.patientId,
        patientName: order.patientName,
        reason: reason,
        notes: notes,
        rejectedBy: user.email
      });

      showFlashMessage({ 
        type: 'success', 
        title: 'Sample Rejected', 
        message: `Sample for order #${order.orderId || order.id} has been rejected and marked for recollection. Patient will be returned to phlebotomy.` 
      });
      
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error rejecting sample:", error);
      showFlashMessage({ 
        type: 'error', 
        title: 'Failed', 
        message: 'Failed to reject sample. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          ⚠️ Reject Sample - Order #{order.orderId || order.id}
        </ModalHeader>
        
        <WarningSection>
          ⚠️
          <WarningText>
            This will reject the current sample and return the patient to phlebotomy for recollection. 
            The order will be marked as rejected and moved to the rejected column.
          </WarningText>
        </WarningSection>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              Rejection Reason <Required>*</Required>
            </Label>
            <Select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              {REJECTION_REASONS.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide additional details about the rejection..."
            />
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </CancelButton>
            <RejectButton type="submit" disabled={isSubmitting || !reason.trim()}>
              {isSubmitting ? 'Rejecting...' : 'Reject Sample'}
            </RejectButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default RejectionModal;