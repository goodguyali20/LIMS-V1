import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaExclamationTriangle, FaBan } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { GlowButton } from '../common';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: #1e293b;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 2px solid #ef4444;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #374151;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #ef4444;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ef4444;
    background: #374151;
  }
`;

const WarningSection = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const WarningText = styled.p`
  margin: 0;
  color: #fca5a5;
  font-size: 0.9rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #e5e7eb;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Required = styled.span`
  color: #ef4444;
  margin-left: 0.25rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #374151;
  border-radius: 6px;
  background: #0f172a;
  color: #e5e7eb;
  font-size: 0.9rem;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #ef4444;
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
  }
  
  &::placeholder {
    color: #6b7280;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const CancelButton = styled(GlowButton)`
  background: #6b7280;
  border-color: #4b5563;
  
  &:hover {
    background: #4b5563;
    border-color: #374151;
  }
`;

const ConfirmButton = styled(GlowButton)`
  background: #ef4444;
  border-color: #dc2626;
  
  &:hover {
    background: #dc2626;
    border-color: #b91c1c;
  }
  
  &:disabled {
    background: #6b7280;
    border-color: #4b5563;
    cursor: not-allowed;
  }
`;

const CancellationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type = 'order', // 'order' or 'test'
  orderId, 
  testName = null,
  patientName = null 
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      handleClose();
    } catch (error) {
      console.error('Error during cancellation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const isOrderCancellation = type === 'order';
  const title = isOrderCancellation 
    ? `Cancel Order #${orderId}` 
    : `Cancel Test: ${testName}`;
  
  const warningText = isOrderCancellation
    ? `This will cancel the entire order for patient ${patientName}. This action cannot be undone.`
    : `This will cancel the test "${testName}" for order #${orderId}. This action cannot be undone.`;

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaBan />
            {title}
          </ModalTitle>
          <CloseButton onClick={handleClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <WarningSection>
          <FaExclamationTriangle style={{ color: '#ef4444', fontSize: '1.2rem' }} />
          <WarningText>{warningText}</WarningText>
        </WarningSection>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              Cancellation Reason <Required>*</Required>
            </Label>
            <TextArea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for cancellation..."
              required
              autoFocus
            />
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={handleClose}>
              {t('cancel')}
            </CancelButton>
            <ConfirmButton 
              type="submit" 
              disabled={!reason.trim() || isSubmitting}
            >
              {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </ConfirmButton>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CancellationModal;
