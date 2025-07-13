import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  width: 100%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-align: center;
  border-top: 10px solid ${({ theme }) => theme.colors.error};
`;

const IconWrapper = styled.div`
    font-size: 5rem;
    color: ${({ theme }) => theme.colors.error};
`;

const Header = styled.h1`
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.error};
`;

const SubText = styled.p`
    font-size: 1.2rem;
    margin-bottom: 2rem;
`;

const AcknowledgeButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  color: white;
  background: ${({ theme }) => theme.colors.error};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const CriticalValueModal = ({ criticalInfo, onConfirm }) => {
  const [canAcknowledge, setCanAcknowledge] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Force the user to wait 2 seconds before they can acknowledge
    const timer = setTimeout(() => {
      setCanAcknowledge(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ModalBackdrop>
      <ModalContent>
        <IconWrapper>
          <FaExclamationTriangle />
        </IconWrapper>
        <Header>{t('criticalValueAlert')}</Header>
        <SubText>
          {t('criticalValueMessage', { test: criticalInfo.test, value: criticalInfo.value })}
        </SubText>
        <p>{t('criticalValueNotifyInstruction')}</p>
        <AcknowledgeButton onClick={onConfirm} disabled={!canAcknowledge}>
          {canAcknowledge ? t('acknowledgeAndNotify') : t('reading')}
        </AcknowledgeButton>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default CriticalValueModal;