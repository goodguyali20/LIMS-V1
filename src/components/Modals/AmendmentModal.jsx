import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
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
  color: ${({ theme }) => theme.colors.error};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
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

const AmendButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
`;

const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
`;


const AmendmentModal = ({ order, testToAmend, onClose }) => {
  const { currentUser } = useAuth();
  const [newResult, setNewResult] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This is a placeholder for the original result. In a real scenario, you'd pass this in.
  const originalResult = order.results ? order.results[testToAmend] : 'N/A';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error("A reason for the amendment is required.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const orderRef = doc(db, "testOrders", order.id);
      
      const amendmentData = {
        test: testToAmend,
        originalResult: originalResult,
        amendedResult: newResult,
        reason: reason,
        amendedBy: currentUser.email,
        amendedAt: new Date()
      };

      // Update the main result and add a record to the amendments history
      await updateDoc(orderRef, {
        [`results.${testToAmend}`]: newResult, // Update the specific test result
        status: 'Amended',
        amendments: arrayUnion(amendmentData)
      });

      await logAuditEvent('Report Amended', { orderId: order.id, ...amendmentData });
      toast.success(`Report for order ${order.id} has been amended.`);
      onClose(); // Close the modal

    } catch (error) {
      console.error("Error amending report:", error);
      toast.error("Failed to amend report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>Amend Result for {testToAmend}</ModalHeader>
        <p><strong>Original Result:</strong> {originalResult}</p>
        <Form onSubmit={handleSubmit}>
          <label htmlFor="newResult">New / Corrected Result</label>
          <Input
            id="newResult"
            value={newResult}
            onChange={(e) => setNewResult(e.target.value)}
            required
          />

          <label htmlFor="amendmentReason">Reason for Amendment</label>
          <Textarea
            id="amendmentReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Clerical error, sample mix-up, etc."
            required
          />

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>Cancel</CancelButton>
            <AmendButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Amendment"}
            </AmendButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default AmendmentModal;