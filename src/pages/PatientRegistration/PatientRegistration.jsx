import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { 
  FaUser, FaIdCard, FaPhone, FaEnvelope, FaCalendar, FaVenusMars,
  FaMapMarkerAlt, FaNotesMedical, FaSave, FaTimes, FaSearch,
  FaFilter, FaSort, FaEye, FaEdit, FaTrash, FaPlus, FaCheck,
  FaExclamationTriangle, FaInfoCircle, FaSpinner, FaRedo,
  FaFlask, FaPrint, FaUsers, FaClipboardList, FaUserPlus, FaSmileBeam
} from 'react-icons/fa';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDate, getAge } from '../../utils/core/dateUtils.js';
import GlowCard from '../../components/common/GlowCard.jsx';
import GlowButton from '../../components/common/GlowButton.jsx';
import AnimatedDataTable from '../../components/common/AnimatedDataTable.jsx';
import { useSettings } from '../../contexts/SettingsContext';
import EnhancedPatientForm from '../../components/PatientRegistration/EnhancedPatientForm.jsx';

const PageContainer = styled(motion.div)`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const GlassContainer = styled(motion.div)`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1.5rem 1rem 1rem 1rem;
  background: ${({ theme }) =>
    theme.isDarkMode
      ? `linear-gradient(135deg, 
          ${theme.colors.dark.background} 0%, 
          rgba(26, 26, 46, 0.8) 25%, 
          rgba(22, 33, 62, 0.9) 50%, 
          rgba(16, 25, 48, 0.95) 75%, 
          #16213e 100%)`
      : `linear-gradient(120deg, 
          ${theme.colors.background} 0%, 
          rgba(224, 231, 255, 0.8) 50%, 
          #e0e7ff 100%)`};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem 2rem;
  width: 100%;
  max-width: 100%;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.15) 0%, 
    rgba(255, 255, 255, 0.08) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      #667eea 0%, 
      #764ba2 25%, 
      #f093fb 50%, 
      #f5576c 75%, 
      #4facfe 100%);
    border-radius: 20px 20px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  position: relative;
  z-index: 1;
`;

const TabContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.25rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${({ $isActive }) => $isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${({ theme, $isActive }) => $isActive ? theme.colors.text : theme.colors.textSecondary};
  font-weight: ${({ $isActive }) => $isActive ? '600' : '500'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.text};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $isActive }) => $isActive ? 'linear-gradient(90deg, #667eea, #764ba2)' : 'transparent'};
    border-radius: 2px 2px 0 0;
  }
`;

const TabBadge = styled.span`
  background: ${({ color }) => color || '#667eea'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  
  &:hover {
    border-color: rgba(102, 126, 234, 0.5);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
    box-shadow: 
      0 8px 32px rgba(102, 126, 234, 0.3),
      0 4px 16px rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.95);
    color: #333;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;



const AnimatedHeader = styled(motion.header)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2.5rem;
`;

const PageTitle = styled(motion.h1)`
  font-size: 2.2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.isDarkMode ? theme.colors.dark.text : '#667eea'};
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.25rem;
`;

const Subtitle = styled(motion.p)`
  font-size: 1rem;
  color: ${({ theme }) => theme.isDarkMode ? theme.colors.dark.textSecondary : '#6b7280'};
  margin-bottom: 0.25rem;
  text-align: center;
`;

const JoyfulBar = styled(motion.div)`
  width: 100px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) =>
    theme.isDarkMode
      ? 'linear-gradient(90deg, #4f8cff, #a084e8, #10b981, #f5576c)'
      : 'linear-gradient(90deg, #667eea, #f093fb, #10b981, #f5576c)'};
  margin-bottom: 0.5rem;
`;

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const PatientRegistration = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // React Query for fetching patients
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const q = query(collection(db, "patients"), orderBy("createdAt", "desc"), limit(50));
      const querySnapshot = await getDocs(q);
      const patientsData = [];
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        patientsData.push({
          ...data,
          age: data.age || getAge(data.dateOfBirth),
          fullName: `${data.firstName} ${data.lastName}`,
          formattedDate: formatDate(data.dateOfBirth),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
        });
      });
      return patientsData;
    },
    staleTime: 30000,
    retry: 2,
  });

  // Remove tab logic and always show registration form
  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <GlassContainer>
        <Header>
          <PageTitle
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <FaUserPlus /> {t('patientRegistration.title') || 'Register a New Patient'}
          </PageTitle>
          <Subtitle
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            {t('patientRegistration.subtitle') || 'A seamless, joyful experience for every patient.'}
          </Subtitle>
          <JoyfulBar
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          />
        </Header>
        <EnhancedPatientForm patients={patients} />
      </GlassContainer>
    </PageContainer>
  );
};

export default PatientRegistration;

