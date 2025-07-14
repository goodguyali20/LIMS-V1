import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaUser, FaCalendar, FaClock, FaMapMarker, FaPhone, FaEnvelope,
  FaCheckCircle, FaTimes, FaSpinner, FaSearch, FaFilter, FaSort,
  FaSortUp, FaSortDown, FaEye, FaPrint, FaQrcode, FaBarcode,
  FaUserMd, FaVial, FaSyringe, FaThermometer, FaExclamationTriangle,
  FaInfoCircle, FaChartLine, FaCalendarAlt, FaMapMarkerAlt,
  FaUserCircle, FaFileAlt, FaDownload, FaUpload, FaCog, FaBell,
  FaIdCard
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import GlowCard from '../../components/common/GlowCard';
import GlowButton from '../../components/common/GlowButton';
import { FixedSizeList as List } from 'react-window';


// --- Enhanced Main Container ---
const PhlebotomistContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${({ theme }) => theme.isDarkMode 
    ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
    : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
  };
  background-attachment: fixed;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 16px 16px 0 0;
  }
  
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

// --- Enhanced Sample Collection Grid ---
const SamplesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SampleCard = styled(GlowCard)`
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
    background: ${({ $priority, theme }) => {
      switch ($priority) {
        case 'urgent': return theme.colors.error;
        case 'high': return theme.colors.warning;
        case 'normal': return theme.colors.primary;
        default: return theme.colors.info;
      }
    }};
  }
`;

const SampleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const SampleInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SampleId = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
`;

const PriorityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ $priority, theme }) => {
    switch ($priority) {
      case 'urgent': return `${theme.colors.error}20`;
      case 'high': return `${theme.colors.warning}20`;
      case 'normal': return `${theme.colors.primary}20`;
      default: return `${theme.colors.info}20`;
    }
  }};
  color: ${({ $priority, theme }) => {
    switch ($priority) {
      case 'urgent': return theme.colors.error;
      case 'high': return theme.colors.warning;
      case 'normal': return theme.colors.primary;
      default: return theme.colors.info;
    }
  }};
`;

const SampleDetails = styled.div`
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

const TestsList = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid ${({ theme }) => theme.colors.border};
`;

const TestsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const TestsTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  font-weight: 600;
`;

const TestsCount = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const TestTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TestTag = styled.span`
  padding: 0.25rem 0.75rem;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const SampleActions = styled.div`
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
  
  ${({ $variant, theme }) => $variant === 'success' && `
    background: ${theme.colors.success};
    color: white;
    
    &:hover {
      background: ${theme.colors.success}dd;
    }
  `}
  
  ${({ $variant, theme }) => $variant === 'warning' && `
    background: ${theme.colors.warning};
    color: white;
    
    &:hover {
      background: ${theme.colors.warning}dd;
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

const Phlebotomist = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [stats, setStats] = useState({
    totalSamples: 0,
    pendingSamples: 0,
    collectedSamples: 0,
    urgentSamples: 0,
    averageCollectionTime: 0
  });

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        setLoading(true);
        const ordersQuery = query(
          collection(db, 'testOrders'), 
          where('status', 'in', ['Pending Sample', 'Sample Collected']),
          orderBy('createdAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
          const samplesData = [];
          querySnapshot.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            // Add phlebotomy-specific data
            data.priority = data.priority || 'normal';
            data.collectionTime = data.collectionTime || null;
            data.phlebotomistNotes = data.phlebotomistNotes || '';
            data.sampleConditions = data.sampleConditions || [];
            data.collectionMethod = data.collectionMethod || 'standard';
            samplesData.push(data);
          });
          
          setSamples(samplesData);
          
          // Calculate stats
          const pending = samplesData.filter(s => s.status === 'Pending Sample');
          const collected = samplesData.filter(s => s.status === 'Sample Collected');
          const urgent = samplesData.filter(s => s.priority === 'urgent');
          
          const collectionTimes = collected
            .filter(s => s.collectionTime)
            .map(s => {
              const created = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
              const collected = s.collectionTime?.toDate ? s.collectionTime.toDate() : new Date(s.collectionTime);
              return (collected - created) / (1000 * 60); // minutes
            });
          
          const avgTime = collectionTimes.length > 0 
            ? collectionTimes.reduce((a, b) => a + b, 0) / collectionTimes.length 
            : 0;
          
          setStats({
            totalSamples: samplesData.length,
            pendingSamples: pending.length,
            collectedSamples: collected.length,
            urgentSamples: urgent.length,
            averageCollectionTime: Math.round(avgTime)
          });
          
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching samples:', error);
        toast.error('Failed to load sample data');
        setLoading(false);
      }
    };

    fetchSamples();
  }, []);

  useEffect(() => {
    let filtered = samples;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sample => 
        sample.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sample => sample.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(sample => sample.priority === priorityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'patientName':
          aValue = a.patientName || '';
          bValue = b.patientName || '';
          break;
        case 'priority': {
          const priorityOrder = { urgent: 3, high: 2, normal: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
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

    setFilteredSamples(filtered);
  }, [samples, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  const handleCollectSample = async (sample) => {
    try {
      const sampleRef = doc(db, 'testOrders', sample.id);
      await updateDoc(sampleRef, {
        status: 'Sample Collected',
        collectionTime: new Date(),
        collectedBy: 'Current Phlebotomist', // Replace with actual user
        phlebotomistNotes: sample.phlebotomistNotes || ''
      });
      
      toast.success(`Sample collected for ${sample.patientName}`);
    } catch (error) {
      console.error('Error collecting sample:', error);
      toast.error('Failed to collect sample');
    }
  };

  const handleViewDetails = (sample) => {
    navigate(`/app/order/${sample.id}`, { state: { sample } });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
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


  if (loading) {
    return (
      <PhlebotomistContainer>
        <LoadingContainer>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaSpinner size={48} />
          </motion.div>
          <p>Loading sample collection data...</p>
        </LoadingContainer>
      </PhlebotomistContainer>
    );
  }

  return (
    <PhlebotomistContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <HeaderTitle>
          <FaSyringe /> Sample Collection
        </HeaderTitle>
        <HeaderActions>
          <GlowButton onClick={() => navigate('/app/workqueue')}>
            <FaEye /> View Work Queue
          </GlowButton>
        </HeaderActions>
      </Header>

      {/* Enhanced Stats */}
      <StatsContainer>
        <StatCard>
          <StatIcon color="#3B82F6">
            <FaVial />
          </StatIcon>
          <StatValue>{stats.totalSamples}</StatValue>
          <StatLabel>Total Samples</StatLabel>
          <StatChange $positive={true}>
            {stats.pendingSamples} pending collection
          </StatChange>
        </StatCard>

        <StatCard>
          <StatIcon color="#10B981">
            <FaCheckCircle />
          </StatIcon>
          <StatValue>{stats.collectedSamples}</StatValue>
          <StatLabel>Collected Today</StatLabel>
          <StatChange $positive={true}>
            {stats.averageCollectionTime} min avg time
          </StatChange>
        </StatCard>

        <StatCard>
          <StatIcon color="#F59E0B">
            <FaClock />
          </StatIcon>
          <StatValue>{stats.pendingSamples}</StatValue>
          <StatLabel>Pending Collection</StatLabel>
          <StatChange $positive={false}>
            {stats.urgentSamples} urgent samples
          </StatChange>
        </StatCard>

        <StatCard>
          <StatIcon color="#EF4444">
            <FaExclamationTriangle />
          </StatIcon>
          <StatValue>{stats.urgentSamples}</StatValue>
          <StatLabel>Urgent Samples</StatLabel>
          <StatChange $positive={false}>
            Requires immediate attention
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
              placeholder="Search by patient name, order ID, or patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>

          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Pending Sample">Pending Collection</option>
            <option value="Sample Collected">Collected</option>
          </FilterSelect>

          <FilterSelect
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </FilterSelect>
        </FilterGrid>

        <FilterActions>
          <SortContainer>
            <span>Sort by:</span>
            <SortButton
              $active={sortBy === 'createdAt'}
              onClick={() => handleSort('createdAt')}
            >
              Created {getSortIcon('createdAt')}
            </SortButton>
            <SortButton
              $active={sortBy === 'patientName'}
              onClick={() => handleSort('patientName')}
            >
              Patient {getSortIcon('patientName')}
            </SortButton>
            <SortButton
              $active={sortBy === 'priority'}
              onClick={() => handleSort('priority')}
            >
              Priority {getSortIcon('priority')}
            </SortButton>
          </SortContainer>

          <ClearFiltersButton onClick={clearFilters}>
            <FaTimes /> Clear Filters
          </ClearFiltersButton>
        </FilterActions>
      </SearchAndFilterContainer>

      {/* Sample Collection List */}
      <GlowCard style={{ minHeight: 400 }}>
        <div style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: theme.colors.text }}>
            Sample Collection List
          </h3>
          {filteredSamples.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: theme.colors.textSecondary }}>
              <FaVial size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No samples found matching your criteria</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: Math.min(filteredSamples.length * 100, 600), maxWidth: '100%' }}>
              <List
                height={Math.min(filteredSamples.length * 100, 600)}
                itemCount={filteredSamples.length}
                itemSize={120} // Adjust based on sample item height
                width={'100%'}
                style={{ overflowX: 'hidden' }}
              >
                {({ index, style }) => {
                  const sample = filteredSamples[index];
                  return (
                    <div style={style} key={sample.id}>
                      <div
                        style={{
                          padding: '1rem',
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '12px',
                          background: theme.colors.surface,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          margin: '0.5rem 0'
                        }}
                      >
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: theme.colors.text }}>
                            {sample.patientName}
                          </h4>
                          <p style={{ margin: '0', color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                            Order ID: {sample.orderId} • Status: {sample.status}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <GlowButton
                            size="small"
                            onClick={() => handleViewDetails(sample)}
                          >
                            <FaEye /> View
                          </GlowButton>
                          {sample.status === 'Pending Sample' && (
                            <GlowButton
                              size="small"
                              $variant="success"
                              onClick={() => handleCollectSample(sample)}
                            >
                              <FaCheckCircle /> Collect
                            </GlowButton>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
              </List>
            </div>
          )}
        </div>
      </GlowCard>
      {/* 
      // Commented out old sample grid implementation
      // This section was causing JSX parsing issues due to nested comments
      */}
    </PhlebotomistContainer>
  );
};

export default Phlebotomist; 