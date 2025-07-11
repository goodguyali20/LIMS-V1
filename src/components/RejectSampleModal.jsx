import React, { useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { logAction } from '../utils/logAction.js';

//--- STYLED COMPONENTS ---//
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
  z-index: 1050; // Higher than result entry modal
  backdrop-filter: blur(5px);
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.cardBg};
  ${({ theme }) => theme.squircle(24)};
  box-shadow: ${({ theme }) => theme.shadow};
  padding: 32px;
  width: 100%;
  max-width: 500px;
  animation: fadeIn 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.text}99;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.9rem;
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  ${({ theme }) => theme.squircle(12)};
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  ${({ theme }) => theme.squircle(12)};
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  min-height: 100px;
  resize: vertical;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  margin-top: 16px;
  background: ${({ theme }) => theme.danger};
  color: white;
  border: none;
  ${({ theme }) => theme.squircle(12)};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
`;

const REJECTION_REASONS = [
    "Sample Hemolyzed",
    "Sample Clotted",
    "Insufficient Quantity (QNS)",
    "Incorrect Tube Type",
    "Improperly Labeled",
    "Contaminated Sample",
    "Other (See Notes)",
];

const RejectSampleModal = ({ order, onClose }) => {
    const [reason, setReason] = useState(REJECTION_REASONS[0]);
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) {
            toast.warn("Please select a reason for rejection.");
            return;
        }

        try {
            const orderRef = doc(db, 'testOrders', order.id);
            await updateDoc(orderRef, {
                status: 'rejected',
                rejectionDetails: {
                    reason,
                    notes,
                    rejectedBy: auth.currentUser.email,
                    rejectedAt: new Date(),
                }
            });

            await logAction('Sample Rejected', { orderId: order.id, patientName: order.patientName, reason, notes });
            toast.error(`Sample for ${order.patientName} has been rejected.`);
            onClose();
        } catch (error) {
            console.error("Error rejecting sample:", error);
            toast.error("Failed to reject sample.");
        }
    };

    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Reject Sample</ModalTitle>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>
                <Form onSubmit={handleSubmit}>
                    <p>You are rejecting the sample for <strong>{order.patientName}</strong>.</p>
                    <div>
                        <Label htmlFor="rejection-reason">Reason for Rejection</Label>
                        <Select id="rejection-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
                            {REJECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="rejection-notes">Additional Notes (Optional)</Label>
                        <TextArea id="rejection-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    <SubmitButton type="submit">Confirm Rejection</SubmitButton>
                </Form>
            </ModalContainer>
        </ModalBackdrop>
    );
};

export default RejectSampleModal;