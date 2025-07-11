import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { logAuditEvent } from '../../utils/auditLogger';

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
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  width: 100%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.h2`
  margin-top: 0;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Select = styled.select`
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Textarea = styled.textarea`
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100px;
  font-family: inherit;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-weight: 600;
`;

const RejectButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
`;

const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const REJECTION_REASONS = [
  "Sample Hemolyzed",
  "Insufficient Quantity",
  "Improperly Labeled",
  "Clotted Sample",
  "Contaminated Sample",
  "Other",
];

const RejectionModal = ({ order, onClose }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [reason, setReason] = useState(REJECTION_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderRef = doc(db, "testOrders", order.id);

      await updateDoc(orderRef, {
        status: 'Rejected',
        rejectionDetails: {
          reason: reason,
          notes: notes,
          rejectedBy: currentUser.email,
          rejectedAt: new Date()
        }
      });

      await logAuditEvent('Sample Rejected', { 
          orderId: order.id, 
          patientId: order.patientId,
          reason: reason 
      });

      toast.success(`Order ${order.id} has been rejected.`);
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error rejecting sample:", error);
      toast.error("Failed to reject sample.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>Reject Sample for Order #{order.id}</ModalHeader>
        <Form onSubmit={handleSubmit}>
          <label htmlFor="rejectionReason">Rejection Reason</label>
          <Select
            id="rejectionReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REJECTION_REASONS.map(reason => (
              <option key={reason} value={reason}>{reason}</option>
            ))}
          </Select>

          <label htmlFor="rejectionNotes">Additional Notes (Optional)</label>
          <Textarea
            id="rejectionNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>Cancel</CancelButton>
            <RejectButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Reject Sample"}
            </RejectButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default RejectionModal;