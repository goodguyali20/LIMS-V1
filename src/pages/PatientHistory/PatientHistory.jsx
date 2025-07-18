import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Search, 
  Filter, 
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlowCard, GlowButton, AnimatedModal, AnimatedNotification } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications, showFlashMessage } from '../../contexts/NotificationContext';

// Styled Components
const HistoryContainer = styled(motion.div)`
  min-height: 100vh;
  background: ${({ theme }) => theme.isDarkMode 
    ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
    : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
  };
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HistoryHeader = styled(motion.div)`
  margin-bottom: 2rem;
`;

const HistoryTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HistoryDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ color }) => color};
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  color: ${({ color }) => color};
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 1.25rem;
  height: 1.25rem;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const SortSelect = styled.select`
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const PatientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const PatientCard = styled(motion.div)`
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const CardContent = styled(GlowCard)`
  padding: 1.5rem;
  height: 100%;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PatientAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  font-weight: 600;
  font-size: 1.2rem;
`;

const PatientDetails = styled.div``;

const PatientName = styled.h3`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.25rem 0;
`;

const PatientId = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'active': return theme.colors.success + '20';
      case 'inactive': return theme.colors.textSecondary + '20';
      default: return theme.colors.textSecondary + '20';
    }
  }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'active': return theme.colors.success;
      case 'inactive': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  }};
`;

const PatientStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const PatientStatIcon = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 1rem;
`;

const StatText = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

const TestSection = styled.div`
  margin-bottom: 1rem;
`;

const TestSectionTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TestItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 0.8rem;
`;

const TestName = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const TestDate = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.75rem;
`;

const TestStatus = styled.span`
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'completed': return theme.colors.success + '20';
      case 'scheduled': return theme.colors.warning + '20';
      case 'pending': return theme.colors.textSecondary + '20';
      default: return theme.colors.textSecondary + '20';
    }
  }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'completed': return theme.colors.success;
      case 'scheduled': return theme.colors.warning;
      case 'pending': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  }};
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled(GlowButton)`
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
`;

const EmptyIcon = styled.div`
  width: 96px;
  height: 96px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
`;

const EmptyDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const PatientHistory = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const { showNotification } = useNotifications();
  const [sortBy, setSortBy] = useState('recent');
  const [sortOrder, setSortOrder] = useState('desc');

  // Mock data
  useEffect(() => {
    const mockPatients = [
      {
        id: 1,
        patientId: 'P-2024-001',
        name: 'Ahmed Hassan',
        age: 35,
        gender: 'male',
        phone: '+966501234567',
        email: 'ahmed.hassan@email.com',
        lastVisit: '2024-01-15',
        totalVisits: 8,
        status: 'active',
        primaryDiagnosis: 'Hypertension, Type 2 Diabetes',
        recentTests: [
          { name: 'Complete Blood Count', date: '2024-01-15', status: 'completed', result: 'Normal' },
          { name: 'HbA1c', date: '2024-01-15', status: 'completed', result: '7.2%' },
          { name: 'Lipid Profile', date: '2024-01-10', status: 'completed', result: 'Elevated' }
        ],
        upcomingTests: [
          { name: 'Kidney Function Test', date: '2024-02-15', status: 'scheduled' }
        ],
        criticalValues: 1,
        notes: 'Patient shows good compliance with medication. Monitor blood pressure regularly.'
      },
      {
        id: 2,
        patientId: 'P-2024-002',
        name: 'Fatima Al-Zahra',
        age: 28,
        gender: 'female',
        phone: '+966507654321',
        email: 'fatima.alzahra@email.com',
        lastVisit: '2024-01-10',
        totalVisits: 5,
        status: 'active',
        primaryDiagnosis: 'Iron Deficiency Anemia',
        recentTests: [
          { name: 'Iron Studies', date: '2024-01-10', status: 'completed', result: 'Low' },
          { name: 'Complete Blood Count', date: '2024-01-10', status: 'completed', result: 'Anemic' },
          { name: 'Vitamin B12', date: '2024-01-05', status: 'completed', result: 'Normal' }
        ],
        upcomingTests: [
          { name: 'Follow-up Iron Studies', date: '2024-02-10', status: 'scheduled' }
        ],
        criticalValues: 0,
        notes: 'Responding well to iron supplementation. Continue current treatment plan.'
      },
      {
        id: 3,
        patientId: 'P-2024-003',
        name: 'Omar Khalil',
        age: 45,
        gender: 'male',
        phone: '+966505556667',
        email: 'omar.khalil@email.com',
        lastVisit: '2024-01-08',
        totalVisits: 12,
        status: 'inactive',
        primaryDiagnosis: 'Asthma, Allergic Rhinitis',
        recentTests: [
          { name: 'Allergy Panel', date: '2024-01-08', status: 'completed', result: 'Multiple Allergies' },
          { name: 'Lung Function Test', date: '2024-01-08', status: 'completed', result: 'Mild Obstruction' },
          { name: 'CBC', date: '2024-01-03', status: 'completed', result: 'Normal' }
        ],
        upcomingTests: [],
        criticalValues: 0,
        notes: 'Patient has been stable. No recent exacerbations. Continue maintenance therapy.'
      },
      {
        id: 4,
        patientId: 'P-2024-004',
        name: 'Layla Mohammed',
        age: 52,
        gender: 'female',
        phone: '+966508889990',
        email: 'layla.mohammed@email.com',
        lastVisit: '2024-01-12',
        totalVisits: 15,
        status: 'active',
        primaryDiagnosis: 'Thyroid Disorder, Osteoporosis',
        recentTests: [
          { name: 'Thyroid Function Tests', date: '2024-01-12', status: 'completed', result: 'Hypothyroid' },
          { name: 'Bone Density Scan', date: '2024-01-12', status: 'completed', result: 'Osteopenia' },
          { name: 'Vitamin D', date: '2024-01-07', status: 'completed', result: 'Deficient' }
        ],
        upcomingTests: [
          { name: 'Follow-up Thyroid Tests', date: '2024-02-12', status: 'scheduled' },
          { name: 'Calcium Studies', date: '2024-02-20', status: 'scheduled' }
        ],
        criticalValues: 2,
        notes: 'Requires close monitoring of thyroid levels. Consider calcium and vitamin D supplementation.'
      },
      {
        id: 5,
        patientId: 'P-2024-005',
        name: 'Youssef Ali',
        age: 38,
        gender: 'male',
        phone: '+966501112223',
        email: 'youssef.ali@email.com',
        lastVisit: '2024-01-18',
        totalVisits: 3,
        status: 'active',
        primaryDiagnosis: 'Pre-diabetes, Obesity',
        recentTests: [
          { name: 'Glucose Tolerance Test', date: '2024-01-18', status: 'completed', result: 'Impaired' },
          { name: 'HbA1c', date: '2024-01-18', status: 'completed', result: '6.1%' },
          { name: 'Lipid Profile', date: '2024-01-18', status: 'completed', result: 'Elevated' }
        ],
        upcomingTests: [
          { name: 'Follow-up HbA1c', date: '2024-03-18', status: 'scheduled' }
        ],
        criticalValues: 0,
        notes: 'New patient with metabolic syndrome. Lifestyle modification recommended.'
      }
    ];
    
    setTimeout(() => {
      setPatients(mockPatients);
      setLoading(false);
    }, 1000);
  }, []);

  const handleViewHistory = (patient) => {
    setSelectedPatient(patient);
    setShowHistoryModal(true);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    
    let matchesDateRange = true;
    if (filterDateRange !== 'all') {
      const lastVisit = new Date(patient.lastVisit);
      const now = new Date();
      const daysDiff = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
      
      switch (filterDateRange) {
        case 'last7days':
          matchesDateRange = daysDiff <= 7;
          break;
        case 'last30days':
          matchesDateRange = daysDiff <= 30;
          break;
        case 'last90days':
          matchesDateRange = daysDiff <= 90;
          break;
        default:
          matchesDateRange = true;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'recent':
        comparison = new Date(b.lastVisit) - new Date(a.lastVisit);
        break;
      case 'visits':
        comparison = b.totalVisits - a.totalVisits;
        break;
      case 'critical':
        comparison = b.criticalValues - a.criticalValues;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'desc' ? comparison : -comparison;
  });

  const stats = {
    totalPatients: patients.length,
    activePatients: patients.filter(p => p.status === 'active').length,
    totalVisits: patients.reduce((sum, p) => sum + p.totalVisits, 0),
    criticalValues: patients.reduce((sum, p) => sum + p.criticalValues, 0)
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    }
  };

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    }
  };

  if (loading) {
    return (
      <HistoryContainer>
        <HistoryHeader
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <HistoryTitle>{t('patient.history')}</HistoryTitle>
          <HistoryDescription>{t('patient.historyDescription')}</HistoryDescription>
        </HistoryHeader>
        
        <StatsGrid>
          {[1, 2, 3, 4].map(i => (
            <StatCard key={i} color="#3B82F6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ height: '1rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', marginBottom: '0.5rem', width: '60%' }}></div>
                  <div style={{ height: '2rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', width: '40%' }}></div>
                </div>
                <div style={{ width: '48px', height: '48px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}></div>
              </div>
            </StatCard>
          ))}
        </StatsGrid>
        
        <PatientsGrid>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <StatCard key={i} color="#3B82F6">
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Loading...
              </div>
            </StatCard>
          ))}
        </PatientsGrid>
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <HistoryHeader>
        <HistoryTitle>{t('patient.history')}</HistoryTitle>
        <HistoryDescription>{t('patient.historyDescription')}</HistoryDescription>
      </HistoryHeader>

      <StatsGrid>
        <StatCard
          variants={statCardVariants}
          color="#3B82F6"
          whileHover="hover"
        >
          <StatIcon color="#3B82F6">
            <User />
          </StatIcon>
          <StatValue>{stats.totalPatients}</StatValue>
          <StatLabel>{t('patient.stats.totalPatients')}</StatLabel>
        </StatCard>

        <StatCard
          variants={statCardVariants}
          color="#10B981"
          whileHover="hover"
        >
          <StatIcon color="#10B981">
            <CheckCircle />
          </StatIcon>
          <StatValue>{stats.activePatients}</StatValue>
          <StatLabel>{t('patient.stats.activePatients')}</StatLabel>
        </StatCard>

        <StatCard
          variants={statCardVariants}
          color="#F59E0B"
          whileHover="hover"
        >
          <StatIcon color="#F59E0B">
            <Calendar />
          </StatIcon>
          <StatValue>{stats.totalVisits}</StatValue>
          <StatLabel>{t('patient.stats.totalVisits')}</StatLabel>
        </StatCard>

        <StatCard
          variants={statCardVariants}
          color="#EF4444"
          whileHover="hover"
        >
          <StatIcon color="#EF4444">
            <AlertCircle />
          </StatIcon>
          <StatValue>{stats.criticalValues}</StatValue>
          <StatLabel>{t('patient.stats.criticalValues')}</StatLabel>
        </StatCard>
      </StatsGrid>

      <ControlsContainer>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder={t('patient.search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <FilterSelect
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">{t('patient.filters.allStatus')}</option>
          <option value="active">{t('patient.filters.active')}</option>
          <option value="inactive">{t('patient.filters.inactive')}</option>
        </FilterSelect>

        <FilterSelect
          value={filterDateRange}
          onChange={(e) => setFilterDateRange(e.target.value)}
        >
          <option value="all">{t('patient.filters.allDates')}</option>
          <option value="last7days">{t('patient.filters.last7Days')}</option>
          <option value="last30days">{t('patient.filters.last30Days')}</option>
          <option value="last90days">{t('patient.filters.last90Days')}</option>
        </FilterSelect>

        <SortSelect
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="recent">{t('patient.sort.recent')}</option>
          <option value="name">{t('patient.sort.name')}</option>
          <option value="visits">{t('patient.sort.visits')}</option>
          <option value="critical">{t('patient.sort.critical')}</option>
        </SortSelect>
      </ControlsContainer>

      <PatientsGrid>
        {sortedPatients.map((patient) => (
          <PatientCard
            key={patient.id}
            variants={cardVariants}
            whileHover="hover"
          >
            <CardContent>
              <CardHeader>
                <PatientInfo>
                  <PatientAvatar color="#3B82F6">
                    {patient.name.charAt(0)}
                  </PatientAvatar>
                  <PatientDetails>
                    <PatientName>{patient.name}</PatientName>
                    <PatientId>{patient.patientId}</PatientId>
                  </PatientDetails>
                </PatientInfo>
                <StatusBadge $status={patient.status}>
                  {t(`patient.status.${patient.status}`)}
                </StatusBadge>
              </CardHeader>

                             <PatientStats>
                 <StatRow>
                   <PatientStatIcon>
                     <Calendar size={16} />
                   </PatientStatIcon>
                   <StatText>Last Visit: {patient.lastVisit}</StatText>
                 </StatRow>

                 <StatRow>
                   <PatientStatIcon>
                     <User size={16} />
                   </PatientStatIcon>
                   <StatText>Total Visits: {patient.totalVisits}</StatText>
                 </StatRow>

                 <StatRow>
                   <PatientStatIcon>
                     <AlertCircle size={16} />
                   </PatientStatIcon>
                   <StatText>Critical Values: {patient.criticalValues}</StatText>
                 </StatRow>

                 <StatRow>
                   <PatientStatIcon>
                     <Shield size={16} />
                   </PatientStatIcon>
                   <StatText>{patient.primaryDiagnosis}</StatText>
                 </StatRow>
               </PatientStats>

              <TestSection>
                <TestSectionTitle>
                  <CheckCircle size={16} />
                  {t('patient.recentTests')} ({patient.recentTests.length})
                </TestSectionTitle>
                <TestList>
                  {patient.recentTests.slice(0, 3).map((test, index) => (
                    <TestItem key={index}>
                      <TestName>{test.name}</TestName>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TestDate>{test.date}</TestDate>
                        <TestStatus $status={test.status}>
                          {t(`patient.testStatus.${test.status}`)}
                        </TestStatus>
                      </div>
                    </TestItem>
                  ))}
                </TestList>
              </TestSection>

              {patient.upcomingTests.length > 0 && (
                <TestSection>
                  <TestSectionTitle>
                    <Clock size={16} />
                    {t('patient.upcomingTests')} ({patient.upcomingTests.length})
                  </TestSectionTitle>
                  <TestList>
                    {patient.upcomingTests.map((test, index) => (
                      <TestItem key={index}>
                        <TestName>{test.name}</TestName>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <TestDate>{test.date}</TestDate>
                          <TestStatus $status={test.status}>
                            {t(`patient.testStatus.${test.status}`)}
                          </TestStatus>
                        </div>
                      </TestItem>
                    ))}
                  </TestList>
                </TestSection>
              )}

              <CardActions>
                <ActionButton
                  size="small"
                  $variant="primary"
                  onClick={() => handleViewHistory(patient)}
                >
                  <Eye size={16} />
                  {t('patient.viewHistory')}
                </ActionButton>
              </CardActions>
            </CardContent>
          </PatientCard>
        ))}
      </PatientsGrid>

      {sortedPatients.length === 0 && (
        <EmptyState>
          <EmptyIcon>
            <User size={48} />
          </EmptyIcon>
          <EmptyTitle>{t('patient.noPatients')}</EmptyTitle>
          <EmptyDescription>{t('patient.noPatientsDescription')}</EmptyDescription>
        </EmptyState>
      )}

      <AnimatePresence>
        {showHistoryModal && selectedPatient && (
          <AnimatedModal
            isOpen={showHistoryModal}
            onClose={() => {
              setShowHistoryModal(false);
              setSelectedPatient(null);
            }}
            title={`${t('patient.history')} - ${selectedPatient.name}`}
          >
            <PatientHistoryDetail
              patient={selectedPatient}
              onClose={() => {
                setShowHistoryModal(false);
                setSelectedPatient(null);
              }}
            />
          </AnimatedModal>
        )}
      </AnimatePresence>
    </HistoryContainer>
  );
};

// Patient History Detail Component
const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DetailSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
`;

const DetailTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const TestHistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TestHistoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid ${({ $status, theme }) => {
    switch ($status) {
      case 'completed': return theme.colors.success;
      case 'scheduled': return theme.colors.warning;
      case 'pending': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  }};
`;

const TestHistoryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const TestHistoryName = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const TestHistoryDate = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TestHistoryResult = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
`;

const PatientHistoryDetail = ({ patient, onClose }) => {
  const { t } = useTranslation();

  return (
    <DetailContainer>
      <DetailSection>
        <DetailTitle>
          <User size={20} />
          {t('patient.personalInfo')}
        </DetailTitle>
        <DetailGrid>
          <DetailItem>
            <DetailLabel>{t('patient.name')}</DetailLabel>
            <DetailValue>{patient.name}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>{t('patient.patientId')}</DetailLabel>
            <DetailValue>{patient.patientId}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>{t('patient.age')}</DetailLabel>
            <DetailValue>{patient.age} {t('patient.years')}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>{t('patient.gender')}</DetailLabel>
            <DetailValue>{t(`patient.gender.${patient.gender}`)}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>{t('patient.phone')}</DetailLabel>
            <DetailValue>{patient.phone}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>{t('patient.email')}</DetailLabel>
            <DetailValue>{patient.email}</DetailValue>
          </DetailItem>
        </DetailGrid>
      </DetailSection>

      <DetailSection>
        <DetailTitle>
          <Shield size={20} />
          {t('patient.medicalInfo')}
        </DetailTitle>
        <DetailGrid>
          <DetailItem>
            <DetailLabel>{t('patient.primaryDiagnosis')}</DetailLabel>
            <DetailValue>{patient.primaryDiagnosis}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>{t('patient.totalVisits')}</DetailLabel>
            <DetailValue>{patient.totalVisits}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>{t('patient.lastVisit')}</DetailLabel>
            <DetailValue>{patient.lastVisit}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>{t('patient.criticalValues')}</DetailLabel>
            <DetailValue>{patient.criticalValues}</DetailValue>
          </DetailItem>
        </DetailGrid>
      </DetailSection>

      <DetailSection>
        <DetailTitle>
          <CheckCircle size={20} />
          {t('patient.testHistory')}
        </DetailTitle>
        <TestHistoryList>
          {[...patient.recentTests, ...patient.upcomingTests].map((test, index) => (
            <TestHistoryItem key={index} $status={test.status}>
              <TestHistoryInfo>
                <TestHistoryName>{test.name}</TestHistoryName>
                <TestHistoryDate>{test.date}</TestHistoryDate>
                {test.result && (
                  <TestHistoryResult>Result: {test.result}</TestHistoryResult>
                )}
              </TestHistoryInfo>
              <TestStatus $status={test.status}>
                {t(`patient.testStatus.${test.status}`)}
              </TestStatus>
            </TestHistoryItem>
          ))}
        </TestHistoryList>
      </DetailSection>

      {patient.notes && (
        <DetailSection>
          <DetailTitle>
            <AlertCircle size={20} />
            {t('patient.notes')}
          </DetailTitle>
          <p style={{ color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>
            {patient.notes}
          </p>
        </DetailSection>
      )}
    </DetailContainer>
  );
};

export default PatientHistory;