import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db, auth } from '../firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
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
  z-index: 1050;
  backdrop-filter: blur(5px);
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.cardBg};
  ${({ theme }) => theme.squircle(24)};
  box-shadow: ${({ theme }) => theme.shadow};
  padding: 32px;
  width: 100%;
  max-width: 600px;
  animation: fadeIn 0.3s ease-out;
`;

const ModalHeader = styled.div`
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
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

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  ${({ theme }) => theme.squircle(12)};
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  margin-top: 16px;
  background: ${({ theme }) => theme.warning};
  color: ${({ theme }) => theme.text === '#1C1C1E' ? '#FFFFFF' : '#1C1C1E'};
  border: none;
  ${({ theme }) => theme.squircle(12)};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
`;

const AmendReportModal = ({ order, previousResults, onClose, onAmendmentSuccess }) => {
    const [reason, setReason] = useState('');
    const [newResults, setNewResults] = useState(previousResults);
    const [testDefinitions, setTestDefinitions] = useState({});

    // Fetch test definitions to re-calculate flags
    useEffect(() => {
        const fetchTestDefinitions = async () => {
            const snapshot = await getDocs(collection(db, 'labTests'));
            const defs = {};
            snapshot.forEach(doc => { defs[doc.data().name] = doc.data(); });
            setTestDefinitions(defs);
        };
        fetchTestDefinitions();
    }, []);

    const getResultFlag = (testName, value) => {
        const def = testDefinitions[testName];
        if (!def || value === '' || def.unit === 'Qualitative') return 'Normal';
        const numValue = Number(value);
        if (isNaN(numValue)) return 'Invalid';
        if (def.criticalLow && numValue <= def.criticalLow) return 'Critical Low';
        if (def.criticalHigh && numValue >= def.criticalHigh) return 'Critical High';
        if (def.refRangeLow && numValue < def.refRangeLow) return 'Low';
        if (def.refRangeHigh && numValue > def.refRangeHigh) return 'High';
        return 'Normal';
    };

    const handleResultChange = (testName, value) => {
        const flag = getResultFlag(testName, value);
        const unit = testDefinitions[testName]?.unit || '';
        setNewResults(prev => ({
            ...prev,
            [testName]: { ...prev[testName], value, flag, unit }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.warn("A reason for the amendment is required.");
            return;
        }

        try {
            // 1. Find the old result document to archive its ID
            const oldResultQuery = query(collection(db, 'testResults'), where('orderId', '==', order.id));
            const oldResultSnap = await getDocs(oldResultQuery);
            if (oldResultSnap.empty) throw new Error("Original result document not found.");
            const oldResultDocRef = oldResultSnap.docs[0].ref;

            // 2. Create a new testResults document with the amended results
            const newResultRef = await addDoc(collection(db, 'testResults'), {
                orderId: order.id,
                patientId: order.patientId,
                results: newResults,
                enteredAt: serverTimestamp(),
                enteredBy: auth.currentUser.uid,
                status: 'verified', // Amended reports are instantly verified
                amendedFrom: oldResultDocRef.id,
            });

            // 3. Update the main testOrder document
            const orderRef = doc(db, 'testOrders', order.id);
            await updateDoc(orderRef, {
                status: 'amended',
                // Add to the history
                amendmentHistory: [
                    ...(order.amendmentHistory || []),
                    {
                        reason: reason,
                        amendedBy: auth.currentUser.email,
                        amendedAt: serverTimestamp(),
                        previousResultId: oldResultDocRef.id,
                        newResultId: newResultRef.id,
                    }
                ]
            });

            // 4. Log the action
            await logAction('Report Amended', { orderId: order.id, patientName: order.patientName, reason });

            toast.success("Report amended successfully!");
            onAmendmentSuccess(); // Callback to trigger refresh
            onClose();

        } catch (error) {
            console.error("Error amending report:", error);
            toast.error("Failed to amend report.");
        }
    };

    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Amend Report for {order.patientName}</ModalTitle>
                </ModalHeader>
                <Form onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="amend-reason">Reason for Amendment</Label>
                        <TextArea id="amend-reason" value={reason} onChange={e => setReason(e.target.value)} required />
                    </div>
                    {/* Here you would list the inputs to change results, similar to ResultEntry.jsx */}
                    {/* For simplicity, we are just adding the reason for now, but a full implementation would have inputs here. */}
                    <SubmitButton type="submit">Submit Amendment</SubmitButton>
                </Form>
            </ModalContainer>
        </ModalBackdrop>
    );
};

export default AmendReportModal;