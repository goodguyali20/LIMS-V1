import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { db, auth } from '../firebase';
import { doc, collection, addDoc, serverTimestamp, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { logAction } from '../utils/logAction.js'; // Import the logger

//--- STYLED COMPONENTS (Vivid Design) ---//

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
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

const TestRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 80px;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
`;

const TestName = styled.span`
  font-weight: 600;
  direction: ltr;
`;

const ResultInput = styled.input`
  padding: 10px;
  border: 2px solid ${({ theme, flag }) => {
    if (flag?.includes('Critical')) return theme.danger;
    if (flag === 'Low' || flag === 'High') return theme.warning;
    return theme.borderColor;
  }};
  ${({ theme }) => theme.squircle(12)};
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme, flag }) => {
        if (flag?.includes('Critical')) return theme.danger + '4D';
        if (flag === 'Low' || flag === 'High') return theme.warning + '4D';
        return theme.primary + '4D';
    }};
  }
`;

const UnitLabel = styled.span`
    color: ${({ theme }) => theme.text}99;
    font-size: 0.9rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  margin-top: 24px;
  background: ${({ theme }) => theme.primaryGradient};
  color: white;
  border: none;
  ${({ theme }) => theme.squircle(12)};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px ${({ theme }) => theme.primary}4D;
  }
`;

const ResultEntry = ({ order, onClose, onResultsSubmitted }) => {
  const { t } = useTranslation();
  const [results, setResults] = useState({});
  const [testDefinitions, setTestDefinitions] = useState({});

  useEffect(() => {
    const fetchTestDefinitions = async () => {
        const testsRef = collection(db, 'labTests');
        const snapshot = await getDocs(testsRef);
        const defs = {};
        snapshot.forEach(doc => {
            defs[doc.data().name] = doc.data();
        });
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
    setResults(prev => ({ 
        ...prev, 
        [testName]: { value, flag, unit } 
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(results).length !== order.tests.length) {
      toast.warn("Please enter a result for all tests.");
      return;
    }
    try {
      const resultsQuery = query(collection(db, 'testResults'), where('orderId', '==', order.id));
      const resultsSnap = await getDocs(resultsQuery);
      const resultsPayload = {
        orderId: order.id, patientId: order.patientId, results: results,
        enteredAt: serverTimestamp(), enteredBy: auth.currentUser.uid, status: 'pending_verification',
      };
      if (!resultsSnap.empty) {
        await updateDoc(resultsSnap.docs[0].ref, resultsPayload);
      } else {
        await addDoc(collection(db, 'testResults'), resultsPayload);
      }
      await updateDoc(doc(db, 'testOrders', order.id), { status: 'pending_verification' });
      
      // Log the action
      await logAction('Results Entered', { orderId: order.id, patientName: order.patientName });

      toast.success('Results submitted for verification!');
      onResultsSubmitted();
      onClose();
    } catch (error) {
      console.error("Error submitting results: ", error);
      toast.error('Failed to submit results.');
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{t('enterResults')} for {order.patientName}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <div>
          {order.tests.map(test => (
            <TestRow key={test}>
              <TestName>{test}</TestName>
              <ResultInput
                type="text"
                flag={results[test]?.flag}
                onChange={(e) => handleResultChange(test, e.target.value)}
                autoFocus={order.tests.indexOf(test) === 0}
              />
              <UnitLabel>{testDefinitions[test]?.unit || ''}</UnitLabel>
            </TestRow>
          ))}
        </div>
        <SubmitButton onClick={handleSubmit}>Submit for Verification</SubmitButton>
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default ResultEntry;