import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaPlus, FaEdit, FaTrash, FaChartLine, FaThermometerHalf,
  FaSpinner, FaSearch, FaFilter, FaTimes, FaEye, FaPrint,
  FaExclamationTriangle, FaCheckCircle, FaCalendar, FaFlask,
  FaShieldAlt, FaClipboardCheck, FaExclamationCircle, FaInfoCircle,
  FaDownload, FaUpload, FaCog, FaBell, FaChartBar, FaChartArea,
  FaSort, FaSortUp, FaSortDown, FaFilter as FaFilterIcon, FaRedo
} from 'react-icons/fa';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, ReferenceArea, BarChart, Bar,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import Modal from '../../components/common/Modal';
import GlowCard from '../../components/common/GlowCard';
import GlowButton from '../../components/common/GlowButton';

const QCContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

// --- Enhanced Stats Section ---
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled(GlowCard)`
  padding: 1.5rem;
  text-align: center;
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

const StatChange = styled.div`
  font-size: 0.8rem;
  color: ${({ $positive, theme }) => $positive ? theme.colors.success : theme.colors.error};
  font-weight: 600;
  margin-top: 0.5rem;
`;

// --- Enhanced Search & Filters ---
const SearchAndFilterContainer = styled(GlowCard)`
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchInput = styled.div`
  position: relative;
  
  input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border-radius: 12px;
    border: 2px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.input};
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
  }
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.2rem;
  }
`;

const FilterSelect = styled.select`
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.input};
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

const FilterActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ClearFiltersButton = styled(GlowButton)`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
  
  ${({ $active, theme }) => $active && `
    background: ${theme.colors.primary};
    color: white;
    border-color: ${theme.colors.primary};
  `}
`;

// --- Enhanced Tabs ---
const QCTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
  
  @media (max-width: 768px) {
    gap: 0.25rem;
  }
`;

const TabButton = styled.button`
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textSecondary};
  cursor: pointer;
  font-weight: 600;
  border-bottom: 3px solid ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.background};
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
`;

// --- Enhanced QC Grid ---
const QCGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const QCCard = styled(GlowCard)`
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ status, theme }) => {
      switch (status) {
        case 'in_control': return theme.colors.success;
        case 'out_of_control': return theme.colors.error;
        case 'warning': return theme.colors.warning;
        default: return theme.colors.info;
      }
    }};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const QCInfo = styled.div`
  flex: 1;
`;

const QCTestName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.3rem;
  font-weight: 700;
`;

const QCLevel = styled.span`
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const StatusBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'in_control': return `${theme.colors.success}20`;
      case 'out_of_control': return `${theme.colors.error}20`;
      case 'warning': return `${theme.colors.warning}20`;
      default: return `${theme.colors.textSecondary}20`;
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'in_control': return theme.colors.success;
      case 'out_of_control': return theme.colors.error;
      case 'warning': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  }};
`;

const ChartContainer = styled.div`
  height: 200px;
  margin: 1.5rem 0;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 1rem;
`;

const QCDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  padding: 0.5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.8rem;
  }
  
  span:first-child {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 500;
  }
  
  span:last-child {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const QCActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(GlowButton)`
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  
  ${({ $variant, theme }) => $variant === 'secondary' && `
    background: ${theme.colors.surface};
    color: ${theme.colors.textSecondary};
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      background: ${theme.colors.hover};
    }
  `}
  
  ${({ $variant, theme }) => $variant === 'danger' && `
    background: ${theme.colors.error};
    color: white;
    
    &:hover {
      background: ${theme.colors.error}dd;
    }
  `}
`;

// --- Enhanced Loading & Empty States ---
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-direction: column;
  gap: 1rem;
`;

const EmptyState = styled(GlowCard)`
  text-align: center;
  padding: 4rem 2rem;
  
  svg {
    font-size: 4rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 1rem;
  }
  
  h3 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.5rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.1rem;
  }
`;

// --- Enhanced Modal Form ---
const ModalForm = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.input};
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ModalButton = styled(GlowButton)`
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  
  ${({ $variant, theme }) => $variant === 'danger' && `
    background: ${theme.colors.error};
    color: white;
    
    &:hover {
      background: ${theme.colors.error}dd;
    }
  `}
  
  ${({ $variant, theme }) => $variant === 'secondary' && `
    background: ${theme.colors.surface};
    color: ${theme.colors.textSecondary};
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      background: ${theme.colors.hover};
    }
  `}
`;

const SkeletonCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 1.5rem;
  min-height: 200px;
  margin-bottom: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.main};
  opacity: 0.7;
  animation: pulse 1.5s infinite alternate;
  @keyframes pulse {
    0% { background: ${({ theme }) => theme.colors.surface}; }
    100% { background: ${({ theme }) => theme.colors.surfaceSecondary}; }
  }
`;

const QualityControl = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('qc_charts');
  const [qcData, setQcData] = useState([]);
  const [filteredQCData, setFilteredQCData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [testFilter, setTestFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingQC, setEditingQC] = useState(null);
  const [formData, setFormData] = useState({
    testName: '',
    qcLevel: '',
    targetValue: '',
    upperLimit: '',
    lowerLimit: '',
    status: 'in_control',
    notes: ''
  });

  useEffect(() => {
    const qcQuery = query(collection(db, 'qualityControl'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(qcQuery, (querySnapshot) => {
      const qcItems = [];
      querySnapshot.forEach((doc) => {
        qcItems.push({ id: doc.id, ...doc.data() });
      });
      setQcData(qcItems);
      setFilteredQCData(qcItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = qcData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(qc => 
        qc.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qc.qcLevel?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply test filter
    if (testFilter !== 'all') {
      filtered = filtered.filter(qc => qc.testName === testFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(qc => qc.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'testName':
          aValue = a.testName || '';
          bValue = b.testName || '';
          break;
        case 'status': {
          const statusOrder = { out_of_control: 3, warning: 2, in_control: 1 };
          aValue = statusOrder[a.status] || 0;
          bValue = statusOrder[b.status] || 0;
          break;
        }
        case 'createdAt':
        default:
          aValue = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          bValue = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredQCData(filtered);
  }, [qcData, searchTerm, testFilter, statusFilter, sortBy, sortOrder]);

  const getStats = () => {
    const totalQC = qcData.length;
    const inControl = qcData.filter(qc => qc.status === 'in_control').length;
    const outOfControl = qcData.filter(qc => qc.status === 'out_of_control').length;
    const warning = qcData.filter(qc => qc.status === 'warning').length;
    
    const passRate = totalQC > 0 ? ((inControl + warning) / totalQC * 100).toFixed(1) : 0;
    
    return {
      totalQC,
      inControl,
      outOfControl,
      warning,
      passRate
    };
  };

  const stats = getStats();

  const generateQCChartData = (qcItem) => {
    // Generate mock data for QC charts
    const data = [];
    const baseValue = parseFloat(qcItem.targetValue) || 100;
    const upperLimit = parseFloat(qcItem.upperLimit) || baseValue * 1.1;
    const lowerLimit = parseFloat(qcItem.lowerLimit) || baseValue * 0.9;
    
    for (let i = 0; i < 20; i++) {
      const randomValue = baseValue + (Math.random() - 0.5) * (upperLimit - lowerLimit) * 0.2;
      data.push({
        day: i + 1,
        value: parseFloat(randomValue.toFixed(2)),
        upperLimit,
        lowerLimit,
        target: baseValue
      });
    }
    
    return data;
  };

  const handleOpenModal = (qcItem = null) => {
    if (qcItem) {
      setEditingQC(qcItem);
      setFormData({
        testName: qcItem.testName || '',
        qcLevel: qcItem.qcLevel || '',
        targetValue: qcItem.targetValue || '',
        upperLimit: qcItem.upperLimit || '',
        lowerLimit: qcItem.lowerLimit || '',
        status: qcItem.status || 'in_control',
        notes: qcItem.notes || ''
      });
    } else {
      setEditingQC(null);
      setFormData({
        testName: '',
        qcLevel: '',
        targetValue: '',
        upperLimit: '',
        lowerLimit: '',
        status: 'in_control',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQC(null);
    setFormData({
      testName: '',
      qcLevel: '',
      targetValue: '',
      upperLimit: '',
      lowerLimit: '',
      status: 'in_control',
      notes: ''
    });
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveQC = async (e) => {
    e.preventDefault();
    
    try {
      const qcData = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingQC) {
        await updateDoc(doc(db, 'qualityControl', editingQC.id), qcData);
        toast.success(t('qcDataUpdated'));
      } else {
        await addDoc(collection(db, 'qualityControl'), qcData);
        toast.success(t('qcDataSaved'));
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving QC data:', error);
      toast.error(t('failedToSaveQC'));
    }
  };

  const handleDeleteQC = async (qcId, qcName) => {
    if (window.confirm(`Are you sure you want to delete ${qcName}?`)) {
      try {
        await deleteDoc(doc(db, 'qualityControl', qcId));
        toast.success(t('qcDataDeleted'));
      } catch (error) {
        console.error('Error deleting QC data:', error);
        toast.error(t('failedToDeleteQC'));
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTestFilter('all');
    setStatusFilter('all');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in_control': return <FaCheckCircle />;
      case 'out_of_control': return <FaExclamationTriangle />;
      case 'warning': return <FaExclamationCircle />;
      default: return <FaInfoCircle />;
    }
  };

  if (loading) {
    return (
      <QCContainer>
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        ))}
      </QCContainer>
    );
  }

  return (
    <QCContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <HeaderTitle>
          <FaShieldAlt /> {t('qualityControl.title')}
        </HeaderTitle>
        <HeaderActions>
          <GlowButton onClick={() => handleOpenModal()}>
            <FaPlus /> {t('addQCData')}
          </GlowButton>
        </HeaderActions>
      </Header>

      {/* Enhanced Stats */}
      <StatsContainer>
        <StatCard>
          <StatIcon color="#3B82F6">
            <FaClipboardCheck />
          </StatIcon>
          <StatValue>{stats.totalQC}</StatValue>
          <StatLabel>{t('totalQCTests')}</StatLabel>
          <StatChange $positive={true}>
            {stats.passRate}% {t('passRate')}
          </StatChange>
        </StatCard>

        <StatCard>
          <StatIcon color="#10B981">
            <FaCheckCircle />
          </StatIcon>
          <StatValue>{stats.inControl}</StatValue>
          <StatLabel>{t('inControl')}</StatLabel>
          <StatChange $positive={true}>
            {stats.totalQC > 0 ? ((stats.inControl / stats.totalQC) * 100).toFixed(1) : 0}% {t('ofTotal')}
          </StatChange>
        </StatCard>

        <StatCard>
          <StatIcon color="#F59E0B">
            <FaExclamationCircle />
          </StatIcon>
          <StatValue>{stats.warning}</StatValue>
          <StatLabel>{t('warning')}</StatLabel>
          <StatChange $positive={false}>
            {t('requiresAttention')}
          </StatChange>
        </StatCard>

        <StatCard>
          <StatIcon color="#EF4444">
            <FaExclamationTriangle />
          </StatIcon>
          <StatValue>{stats.outOfControl}</StatValue>
          <StatLabel>{t('outOfControl')}</StatLabel>
          <StatChange $positive={false}>
            {t('immediateActionRequired')}
          </StatChange>
        </StatCard>
      </StatsContainer>

      {/* Enhanced Search & Filters */}
      <SearchAndFilterContainer>
        <FilterGrid>
          <SearchInput>
            <FaSearch />
            <input
              type="text"
              placeholder={t('searchByTestNameOrQCLevel')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>

          <FilterSelect
            value={testFilter}
            onChange={(e) => setTestFilter(e.target.value)}
          >
            <option value="all">{t('allTests')}</option>
            {Array.from(new Set(qcData.map(qc => qc.testName))).map((test, idx) => (
              <option key={test === 'N/A' ? `na-${idx}` : `${test}-${idx}` } value={test}>{test}</option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('allStatus')}</option>
            <option value="in_control">{t('inControl')}</option>
            <option value="warning">{t('warning')}</option>
            <option value="out_of_control">{t('outOfControl')}</option>
          </FilterSelect>
        </FilterGrid>

        <FilterActions>
          <SortContainer>
            <span>{t('sortBy')}:</span>
            <SortButton
              $active={sortBy === 'createdAt'}
              onClick={() => handleSort('createdAt')}
            >
              {t('createdAt')} {getSortIcon('createdAt')}
            </SortButton>
            <SortButton
              $active={sortBy === 'testName'}
              onClick={() => handleSort('testName')}
            >
              {t('testName')} {getSortIcon('testName')}
            </SortButton>
            <SortButton
              $active={sortBy === 'status'}
              onClick={() => handleSort('status')}
            >
              {t('status')} {getSortIcon('status')}
            </SortButton>
          </SortContainer>

          <ClearFiltersButton onClick={clearFilters}>
            <FaTimes /> {t('clearFilters')}
          </ClearFiltersButton>
        </FilterActions>
      </SearchAndFilterContainer>

      {/* Enhanced Tabs */}
      <QCTabs>
        <TabButton
          $active={activeTab === 'qc_charts'}
          onClick={() => setActiveTab('qc_charts')}
        >
          <FaChartLine /> {t('qcCharts')}
        </TabButton>
        <TabButton
          $active={activeTab === 'qc_reports'}
          onClick={() => setActiveTab('qc_reports')}
        >
          <FaChartBar /> {t('qcReports')}
        </TabButton>
        <TabButton
          $active={activeTab === 'qc_alerts'}
          onClick={() => setActiveTab('qc_alerts')}
        >
          <FaBell /> {t('qcAlerts')}
        </TabButton>
        <TabButton
          $active={activeTab === 'qc_settings'}
          onClick={() => setActiveTab('qc_settings')}
        >
          <FaCog /> {t('qcSettings')}
        </TabButton>
      </QCTabs>

      {/* Enhanced QC Grid */}
      <AnimatePresence mode="wait">
        {filteredQCData.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <EmptyState>
              <FaShieldAlt />
              <h3>{t('noQCDataFound')}</h3>
              <p>
                {searchTerm || testFilter !== 'all' || statusFilter !== 'all'
                  ? t('tryAdjustingSearchCriteriaOrFilters')
                  : t('noQualityControlDataAvailableAddYourFirstQC')}
              </p>
            </EmptyState>
          </motion.div>
        ) : (
          <motion.div
            key="qc-data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QCGrid>
              {filteredQCData.map((qcItem, index) => (
                <motion.div
                  key={qcItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <QCCard 
                    status={qcItem.status}
                    as={motion.div}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    style={qcItem.status === 'out_of_control' ? { boxShadow: '0 0 0 4px #ef4444aa' } : {}}
                  >
                    <CardHeader>
                      <QCInfo>
                        <QCTestName>
                          <FaFlask />
                          {qcItem.testName}
                        </QCTestName>
                        <QCLevel>Level: {qcItem.qcLevel}</QCLevel>
                      </QCInfo>
                      <StatusBadge 
                        status={qcItem.status} 
                        as={motion.span} 
                        animate={qcItem.status === 'out_of_control' ? { scale: [1, 1.15, 1] } : {}} 
                        transition={qcItem.status === 'out_of_control' ? { repeat: Infinity, duration: 1 } : {}}
                      >
                        {getStatusIcon(qcItem.status)}
                        {qcItem.status.replace('_', ' ')}
                      </StatusBadge>
                    </CardHeader>

                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={generateQCChartData(qcItem)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                          <ReferenceLine y={qcItem.targetValue} stroke="#10B981" strokeDasharray="3 3" />
                          <ReferenceLine y={qcItem.upperLimit} stroke="#F59E0B" strokeDasharray="3 3" />
                          <ReferenceLine y={qcItem.lowerLimit} stroke="#F59E0B" strokeDasharray="3 3" />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>

                    <QCDetails>
                      <DetailItem>
                        <FaThermometerHalf />
                        <span>Target:</span>
                        <span>{qcItem.targetValue}</span>
                      </DetailItem>
                      <DetailItem>
                        <FaChartLine />
                        <span>Upper Limit:</span>
                        <span>{qcItem.upperLimit}</span>
                      </DetailItem>
                      <DetailItem>
                        <FaChartLine />
                        <span>Lower Limit:</span>
                        <span>{qcItem.lowerLimit}</span>
                      </DetailItem>
                      <DetailItem>
                        <FaCalendar />
                        <span>Created:</span>
                        <span>
                          {qcItem.createdAt?.toDate ? 
                            qcItem.createdAt.toDate().toLocaleDateString() : 
                            new Date(qcItem.createdAt).toLocaleDateString()
                          }
                        </span>
                      </DetailItem>
                    </QCDetails>

                    <QCActions>
                      <ActionButton
                        onClick={() => handleOpenModal(qcItem)}
                        $variant="primary"
                        as={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaEdit /> Edit
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDeleteQC(qcItem.id, qcItem.testName)}
                        $variant="danger"
                        as={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaTrash /> Delete
                      </ActionButton>
                    </QCActions>
                  </QCCard>
                </motion.div>
              ))}
            </QCGrid>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingQC ? t('editQCData') : t('addQCData')}
      >
        <ModalForm onSubmit={handleSaveQC}>
          <FormGroup>
            <Label>{t('testName')}</Label>
            <Input
              type="text"
              name="testName"
              value={formData.testName}
              onChange={handleFormChange}
              required
              placeholder={t('enterTestName')}
            />
          </FormGroup>

          <FormGroup>
            <Label>{t('qcLevel')}</Label>
            <Select
              name="qcLevel"
              value={formData.qcLevel}
              onChange={handleFormChange}
              required
            >
              <option value="">{t('selectQCLevel')}</option>
              <option value="Level 1">{t('level1')}</option>
              <option value="Level 2">{t('level2')}</option>
              <option value="Level 3">{t('level3')}</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>{t('targetValue')}</Label>
            <Input
              type="number"
              name="targetValue"
              value={formData.targetValue}
              onChange={handleFormChange}
              required
              placeholder={t('enterTargetValue')}
              step="0.01"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t('upperLimit')}</Label>
            <Input
              type="number"
              name="upperLimit"
              value={formData.upperLimit}
              onChange={handleFormChange}
              required
              placeholder={t('enterUpperLimit')}
              step="0.01"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t('lowerLimit')}</Label>
            <Input
              type="number"
              name="lowerLimit"
              value={formData.lowerLimit}
              onChange={handleFormChange}
              required
              placeholder={t('enterLowerLimit')}
              step="0.01"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t('status')}</Label>
            <Select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              required
            >
              <option value="in_control">{t('inControl')}</option>
              <option value="warning">{t('warning')}</option>
              <option value="out_of_control">{t('outOfControl')}</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>{t('notes')}</Label>
            <Input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              placeholder={t('enterNotes')}
            />
          </FormGroup>

          <ButtonContainer>
            <ModalButton
              type="button"
              onClick={handleCloseModal}
              $variant="secondary"
            >
              {t('cancel')}
            </ModalButton>
            <ModalButton type="submit">
              {editingQC ? t('update') : t('save')}
            </ModalButton>
          </ButtonContainer>
        </ModalForm>
      </Modal>
    </QCContainer>
  );
};

export default QualityControl; 