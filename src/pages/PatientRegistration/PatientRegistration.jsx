import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { 
  FaUser, FaIdCard, FaPhone, FaEnvelope, FaCalendar, FaVenusMars,
  FaMapMarkerAlt, FaNotesMedical, FaSave, FaTimes, FaSearch,
  FaFilter, FaSort, FaEye, FaEdit, FaTrash, FaPlus, FaCheck,
  FaExclamationTriangle, FaInfoCircle, FaSpinner, FaRedo,
  FaFlask, FaPrint, FaUsers, FaClipboardList
} from 'react-icons/fa';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { formatDate, getAge } from '../../utils/dateUtils.js';
import GlowCard from '../../components/common/GlowCard.jsx';
import GlowButton from '../../components/common/GlowButton.jsx';
import AnimatedDataTable from '../../components/common/AnimatedDataTable.jsx';
import { useSettings } from '../../contexts/SettingsContext';
import EnhancedPatientForm from '../../components/PatientRegistration/EnhancedPatientForm.jsx';

const PageContainer = styled(motion.div)`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
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

const PatientRegistration = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('register');
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
          age: data.age || getAge(data.dateOfBirth), // Support both age and dateOfBirth for backward compatibility
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

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    
    return patients.filter(patient => 
      patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNumber?.includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const handlePatientRegistered = (patientId) => {
    // Refresh the patient list
    queryClient.invalidateQueries(['patients']);
    // Switch to the patients list tab
    setActiveTab('patients');
  };

  const tabs = [
    { 
      id: 'register', 
      label: 'Register Patient', 
      icon: <FaUser />,
      badge: null
    },
    { 
      id: 'patients', 
      label: 'Patient List', 
      icon: <FaUsers />,
      badge: patients.length
    }
  ];

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <FaUser /> {t('patientRegistration.title')}
        </Title>
        <HeaderActions>
          <GlowButton
            onClick={() => queryClient.invalidateQueries(['patients'])}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FaRedo /> Refresh
          </GlowButton>
        </HeaderActions>
      </Header>

      <TabContainer>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            $isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
            {tab.badge && (
              <TabBadge>{tab.badge}</TabBadge>
            )}
          </Tab>
        ))}
      </TabContainer>

      <AnimatePresence mode="wait">
        {activeTab === 'register' && (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedPatientForm onPatientRegistered={handlePatientRegistered} />
          </motion.div>
        )}

        {activeTab === 'patients' && (
          <motion.div
            key="patients"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GlowCard>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ margin: 0, color: theme.colors.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaClipboardList /> Registered Patients
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Input
                      type="text"
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ margin: 0, minWidth: '250px' }}
                    />
                    <GlowButton
                      onClick={() => setSearchTerm('')}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <FaTimes /> Clear
                    </GlowButton>
                  </div>
                </div>

                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <FaSpinner size={48} style={{ animation: 'spin 1s linear infinite' }} />
                    <p>Loading patients...</p>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: theme.colors.textSecondary }}>
                    <FaUser size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No patients found</p>
                    {searchTerm && (
                      <p>Try adjusting your search terms</p>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredPatients.map((patient) => (
                      <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          padding: '1rem',
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '12px',
                          background: theme.colors.surface,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.3s ease'
                        }}
                        whileHover={{
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: theme.colors.text }}>
                            {patient.fullName}
                          </h4>
                          <p style={{ margin: '0', color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                            Age: {patient.age} • Phone: {patient.phoneNumber} • Registered: {patient.formattedDate}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <GlowButton
                            size="small"
                            onClick={() => {/* Handle view details */}}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <FaEye /> View
                          </GlowButton>
                          <GlowButton
                            size="small"
                            $variant="primary"
                            onClick={() => {/* Handle edit */}}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <FaEdit /> Edit
                          </GlowButton>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default PatientRegistration;

