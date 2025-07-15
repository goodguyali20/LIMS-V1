import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { 
  FaClipboardList, FaUser, FaPhone, FaEnvelope, FaCalendar, 
  FaVenusMars, FaFlask, FaCheckCircle, FaTimes, FaPrint,
  FaEye, FaEdit, FaArrowRight, FaSmileBeam
} from 'react-icons/fa';
import GlowButton from '../common/GlowButton.jsx';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 0;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.25),
    0 12px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  position: relative;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.1) 0%, 
    rgba(118, 75, 162, 0.1) 100%);
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      transparent 30%, 
      rgba(255, 255, 255, 0.05) 50%, 
      transparent 70%);
    animation: shimmer 3s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.isDarkMode ? '#ffffff' : '#1f2937'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
`;

const ModalSubtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(107, 114, 128, 0.8)'};
  margin: 0.5rem 0 0;
  position: relative;
  z-index: 1;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.isDarkMode ? '#ffffff' : '#374151'};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 2;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ModalContent = styled.div`
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SummaryCard = styled(motion.div)`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.08) 0%, 
    rgba(255, 255, 255, 0.03) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SummaryIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.2) 0%, 
    rgba(118, 75, 162, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.isDarkMode ? '#667eea' : '#4f46e5'};
  font-size: 1.1rem;
`;

const SummaryContent = styled.div`
  flex: 1;
`;

const SummaryLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(107, 114, 128, 0.8)'};
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SummaryValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.isDarkMode ? '#ffffff' : '#1f2937'};
  word-break: break-word;
`;

const TestsSection = styled.div`
  background: linear-gradient(145deg, 
    rgba(16, 185, 129, 0.1) 0%, 
    rgba(5, 150, 105, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const TestsTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.isDarkMode ? '#10b981' : '#059669'};
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TestsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TestTag = styled.span`
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.2) 0%, 
    rgba(5, 150, 105, 0.1) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.isDarkMode ? '#10b981' : '#059669'};
`;

const ModalFooter = styled.div`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.02) 100%);
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  align-items: center;
`;

const SuccessAnimation = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
`;

const RegistrationSummaryModal = ({ 
  isOpen, 
  onClose, 
  patientData, 
  selectedTests, 
  onConfirm, 
  onEdit,
  onPrint 
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <ModalContainer
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <ModalTitle>
              <FaClipboardList />
              {t('patientRegistration.registrationSummary') || 'Registration Summary'}
            </ModalTitle>
            <ModalSubtitle>
              {t('patientRegistration.summarySubtitle') || 'Review patient information before confirming'}
            </ModalSubtitle>
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>
          </ModalHeader>

          <ModalContent>
            <SummaryGrid>
              <SummaryCard
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
              >
                <SummaryItem>
                  <SummaryIcon>
                    <FaUser />
                  </SummaryIcon>
                  <SummaryContent>
                    <SummaryLabel>{t('patientRegistration.patientName') || 'Patient Name'}</SummaryLabel>
                    <SummaryValue>
                      {patientData.firstName} {patientData.lastName}
                    </SummaryValue>
                  </SummaryContent>
                </SummaryItem>
              </SummaryCard>

              <SummaryCard
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                <SummaryItem>
                  <SummaryIcon>
                    <FaPhone />
                  </SummaryIcon>
                  <SummaryContent>
                    <SummaryLabel>{t('patientRegistration.phoneNumber') || 'Phone Number'}</SummaryLabel>
                    <SummaryValue>{patientData.phoneNumber}</SummaryValue>
                  </SummaryContent>
                </SummaryItem>
              </SummaryCard>

              <SummaryCard
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
              >
                <SummaryItem>
                  <SummaryIcon>
                    <FaEnvelope />
                  </SummaryIcon>
                  <SummaryContent>
                    <SummaryLabel>{t('patientRegistration.email') || 'Email'}</SummaryLabel>
                    <SummaryValue>{patientData.email || 'N/A'}</SummaryValue>
                  </SummaryContent>
                </SummaryItem>
              </SummaryCard>

              <SummaryCard
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
              >
                <SummaryItem>
                  <SummaryIcon>
                    <FaCalendar />
                  </SummaryIcon>
                  <SummaryContent>
                    <SummaryLabel>{t('patientRegistration.age') || 'Age'}</SummaryLabel>
                    <SummaryValue>{patientData.age} {t('patientRegistration.years') || 'years'}</SummaryValue>
                  </SummaryContent>
                </SummaryItem>
              </SummaryCard>

              <SummaryCard
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.5 }}
              >
                <SummaryItem>
                  <SummaryIcon>
                    <FaVenusMars />
                  </SummaryIcon>
                  <SummaryContent>
                    <SummaryLabel>{t('patientRegistration.gender') || 'Gender'}</SummaryLabel>
                    <SummaryValue>{patientData.gender}</SummaryValue>
                  </SummaryContent>
                </SummaryItem>
              </SummaryCard>

              <SummaryCard
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.6 }}
              >
                <SummaryItem>
                  <SummaryIcon>
                    <FaFlask />
                  </SummaryIcon>
                  <SummaryContent>
                    <SummaryLabel>{t('patientRegistration.selectedTests') || 'Selected Tests'}</SummaryLabel>
                    <SummaryValue>{selectedTests.length} {t('patientRegistration.tests') || 'tests'}</SummaryValue>
                  </SummaryContent>
                </SummaryItem>
              </SummaryCard>
            </SummaryGrid>

            {selectedTests.length > 0 && (
              <TestsSection
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.7 }}
              >
                <TestsTitle>
                  <FaFlask />
                  {t('patientRegistration.testDetails') || 'Test Details'}
                </TestsTitle>
                <TestsList>
                  {selectedTests.map((test, index) => (
                    <TestTag key={index}>
                      {test.name}
                    </TestTag>
                  ))}
                </TestsList>
              </TestsSection>
            )}
          </ModalContent>

          <ModalFooter>
            <GlowButton
              onClick={onEdit}
              variant="secondary"
              size="medium"
            >
              <FaEdit />
              {t('patientRegistration.edit') || 'Edit'}
            </GlowButton>
            
            <GlowButton
              onClick={onPrint}
              variant="secondary"
              size="medium"
            >
              <FaPrint />
              {t('patientRegistration.print') || 'Print'}
            </GlowButton>
            
            <GlowButton
              onClick={onConfirm}
              variant="primary"
              size="medium"
            >
              <FaCheckCircle />
              {t('patientRegistration.confirmRegistration') || 'Confirm Registration'}
            </GlowButton>
          </ModalFooter>
        </ModalContainer>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default RegistrationSummaryModal; 