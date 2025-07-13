import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlowCard, GlowButton, AnimatedModal, AnimatedNotification } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';

// Styled Components
const RegistrationContainer = styled(motion.div)`
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

const RegistrationHeader = styled(motion.div)`
  margin-bottom: 2rem;
`;

const RegistrationTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const RegistrationDescription = styled.p`
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

const SearchAndFilterContainer = styled.div`
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
  padding-inline-end: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23999" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M7.293 7.293a1 1 0 011.414 0L10 8.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 1.2rem center;
  background-size: 1.2rem 1.2rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  &::-ms-expand {
    display: none;
  }
`;

const AddButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PatientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled(GlowButton)`
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
`;

const DeleteButton = styled(GlowButton)`
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
  background: ${({ theme }) => theme.colors.error}20;
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid ${({ theme }) => theme.colors.error}30;
  
  &:hover {
    background: ${({ theme }) => theme.colors.error}30;
  }
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

const PatientRegistration = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState(null);

  // Mock data
  useEffect(() => {
    const mockPatients = [
      {
        id: 1,
        name: 'Ahmed Hassan',
        age: 35,
        gender: 'male',
        phone: '+966501234567',
        email: 'ahmed.hassan@email.com',
        address: 'Riyadh, Saudi Arabia',
        registrationDate: '2024-01-15',
        status: 'active',
        medicalHistory: 'Hypertension, Diabetes',
        emergencyContact: '+966509876543'
      },
      {
        id: 2,
        name: 'Fatima Al-Zahra',
        age: 28,
        gender: 'female',
        phone: '+966507654321',
        email: 'fatima.alzahra@email.com',
        address: 'Jeddah, Saudi Arabia',
        registrationDate: '2024-01-10',
        status: 'active',
        medicalHistory: 'None',
        emergencyContact: '+966501112223'
      },
      {
        id: 3,
        name: 'Omar Khalil',
        age: 45,
        gender: 'male',
        phone: '+966505556667',
        email: 'omar.khalil@email.com',
        address: 'Dammam, Saudi Arabia',
        registrationDate: '2024-01-08',
        status: 'inactive',
        medicalHistory: 'Asthma',
        emergencyContact: '+966508889990'
      }
    ];
    
    setTimeout(() => {
      setPatients(mockPatients);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = (formData) => {
    if (editingPatient) {
      setPatients(prev => prev.map(p => p.id === editingPatient.id ? { ...p, ...formData } : p));
      setNotification({
        type: 'success',
        message: t('patient.updatedSuccessfully'),
        icon: CheckCircle
      });
    } else {
      const newPatient = {
        id: Date.now(),
        ...formData,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      setPatients(prev => [newPatient, ...prev]);
      setNotification({
        type: 'success',
        message: t('patient.registeredSuccessfully'),
        icon: CheckCircle
      });
    }
    setShowModal(false);
    setEditingPatient(null);
  };

  const handleDelete = (patientId) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setNotification({
      type: 'success',
      message: t('patient.deletedSuccessfully'),
      icon: CheckCircle
    });
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalPatients: patients.length,
    activePatients: patients.filter(p => p.status === 'active').length,
    newThisMonth: patients.filter(p => {
      const regDate = new Date(p.registrationDate);
      const now = new Date();
      return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
    }).length
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
      <RegistrationContainer>
        <RegistrationHeader
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <RegistrationTitle>{t('patient.registration')}</RegistrationTitle>
          <RegistrationDescription>{t('patient.registrationDescription')}</RegistrationDescription>
        </RegistrationHeader>
        
        <StatsGrid>
          {[1, 2, 3].map(i => (
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
      </RegistrationContainer>
    );
  }

  return (
    <RegistrationContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <RegistrationHeader>
        <RegistrationTitle>{t('patient.registration')}</RegistrationTitle>
        <RegistrationDescription>{t('patient.registrationDescription')}</RegistrationDescription>
      </RegistrationHeader>

      <StatsGrid>
        <StatCard
          variants={statCardVariants}
          color="#3B82F6"
          whileHover="hover"
        >
          <StatIcon color="#3B82F6">
            <Users />
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
            <UserPlus />
          </StatIcon>
          <StatValue>{stats.newThisMonth}</StatValue>
          <StatLabel>{t('patient.stats.newThisMonth')}</StatLabel>
        </StatCard>
      </StatsGrid>

      <SearchAndFilterContainer>
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

        <AddButtonContainer>
          <GlowButton
            onClick={() => {
              setEditingPatient(null);
              setShowModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={20} />
            {t('patient.addPatient')}
          </GlowButton>
        </AddButtonContainer>
      </SearchAndFilterContainer>

      <PatientsGrid>
        {filteredPatients.map((patient) => (
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
                    <PatientId>ID: {patient.id}</PatientId>
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
                   <StatText>{patient.age} years old</StatText>
                 </StatRow>

                 <StatRow>
                   <PatientStatIcon>
                     <Phone size={16} />
                   </PatientStatIcon>
                   <StatText>{patient.phone}</StatText>
                 </StatRow>

                 <StatRow>
                   <PatientStatIcon>
                     <Mail size={16} />
                   </PatientStatIcon>
                   <StatText>{patient.email}</StatText>
                 </StatRow>

                 <StatRow>
                   <PatientStatIcon>
                     <MapPin size={16} />
                   </PatientStatIcon>
                   <StatText>{patient.address}</StatText>
                 </StatRow>
               </PatientStats>

              <CardActions>
                <ActionButton
                  size="small"
                  variant="primary"
                  onClick={() => {
                    setEditingPatient(patient);
                    setShowModal(true);
                  }}
                >
                  <Edit size={16} />
                  {t('patient.edit')}
                </ActionButton>
                <DeleteButton
                  size="small"
                  onClick={() => handleDelete(patient.id)}
                >
                  <Trash2 size={16} />
                  {t('patient.delete')}
                </DeleteButton>
              </CardActions>
            </CardContent>
          </PatientCard>
        ))}
      </PatientsGrid>

      {filteredPatients.length === 0 && (
        <EmptyState>
          <EmptyIcon>
            <Users size={48} />
          </EmptyIcon>
          <EmptyTitle>{t('patient.noPatients')}</EmptyTitle>
          <EmptyDescription>{t('patient.noPatientsDescription')}</EmptyDescription>
        </EmptyState>
      )}

      <AnimatePresence>
        {showModal && (
          <AnimatedModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingPatient(null);
            }}
            title={editingPatient ? t('patient.editPatient') : t('patient.addPatient')}
          >
            <PatientForm
              patient={editingPatient}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowModal(false);
                setEditingPatient(null);
              }}
            />
          </AnimatedModal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <AnimatedNotification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>
    </RegistrationContainer>
  );
};

// Patient Form Component
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const FormInput = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const FormSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const FormTextarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const PatientForm = ({ patient, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    age: patient?.age || '',
    gender: patient?.gender || 'male',
    phone: patient?.phone || '',
    email: patient?.email || '',
    address: patient?.address || '',
    medicalHistory: patient?.medicalHistory || '',
    emergencyContact: patient?.emergencyContact || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer>
        <FormGroup>
          <FormLabel>{t('patient.form.name')}</FormLabel>
          <FormInput
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('patient.form.age')}</FormLabel>
          <FormInput
            type="number"
            value={formData.age}
            onChange={(e) => handleChange('age', parseInt(e.target.value) || '')}
            min="0"
            max="150"
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('patient.form.gender')}</FormLabel>
          <FormSelect
            value={formData.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
          >
            <option value="male">{t('patient.form.male')}</option>
            <option value="female">{t('patient.form.female')}</option>
            <option value="other">{t('patient.form.other')}</option>
          </FormSelect>
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('patient.form.phone')}</FormLabel>
          <FormInput
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('patient.form.email')}</FormLabel>
          <FormInput
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('patient.form.address')}</FormLabel>
          <FormInput
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('patient.form.emergencyContact')}</FormLabel>
          <FormInput
            type="tel"
            value={formData.emergencyContact}
            onChange={(e) => handleChange('emergencyContact', e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('patient.form.medicalHistory')}</FormLabel>
          <FormTextarea
            value={formData.medicalHistory}
            onChange={(e) => handleChange('medicalHistory', e.target.value)}
            placeholder={t('patient.form.medicalHistoryPlaceholder')}
          />
        </FormGroup>

        <FormActions>
          <GlowButton type="submit" variant="primary">
            {patient ? t('patient.update') : t('patient.add')}
          </GlowButton>
          <GlowButton type="button" onClick={onCancel}>
            {t('patient.cancel')}
          </GlowButton>
        </FormActions>
      </FormContainer>
    </form>
  );
};

export default PatientRegistration;