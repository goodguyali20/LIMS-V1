import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { advancedVariants } from '../../styles/animations';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${advancedVariants.fadeIn} 0.2s ease-in-out;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 2rem;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: ${advancedVariants.slideInLeft} 0.3s ease-out;
  box-shadow: ${({ theme }) => theme.shadows.main};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h2 {
    margin: 0;
    font-size: 1.8rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;


const Modal = React.memo(({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        {title && <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>{title}</h2>}
        {children}
      </ModalContent>
    </ModalOverlay>
  );
});

Modal.displayName = 'Modal';

export default Modal;