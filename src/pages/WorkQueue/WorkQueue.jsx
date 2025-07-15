import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  FaSpinner, FaFilter, FaSort, FaClock, FaCheckCircle, FaExclamationTriangle,
  FaSearch, FaTimes, FaEye, FaPrint, FaDownload, FaUpload, FaCog, FaBell,
  FaChartLine, FaCalendar, FaUser, FaVial, FaThermometer, FaInfoCircle,
  FaSortUp, FaSortDown, FaFilter as FaFilterIcon, FaRedo, FaPlay, FaPause,
  FaTicketAlt, FaIdCard, FaFlask, FaBarcode, FaList, FaSync, FaClipboardList
} from 'react-icons/fa';
import OrderCard from '../../components/WorkQueue/OrderCard';
import GlowCard from '../../components/common/GlowCard';
import GlowButton from '../../components/common/GlowButton';
import PrintCenter from '../../components/common/PrintCenter';
import PrintableReport from '../../components/Print/PrintableReport';
import RequisitionForm from '../../components/Print/RequisitionForm';
import MasterSlip from '../../components/Print/MasterSlip';
import DepartmentSlip from '../../components/Print/DepartmentSlip';
import TubeIdSlip from '../../components/Print/TubeIdSlip';
import { usePerformanceMonitor, useMemoWithPerformance, useCallbackWithPerformance } from '../../utils/performanceOptimizer';
import { FixedSizeList as List } from 'react-window';

const PageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`;

const PageHeader = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe);
    border-radius: 1px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeaderSubtitle = styled('p')`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const SearchAndFilterContainer = styled(GlowCard)`
  padding: 1.5rem;
  margin-bottom: 2rem;
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
  display: flex;
  align-items: center;
  
  svg {
    position: absolute;
    left: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1rem;
    z-index: 2;
  }
  
  input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(20px);
    
    &::placeholder {
      color: ${({ theme }) => theme.colors.textSecondary};
    }
    
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
      transform: scale(1.02);
    }
    
    &:hover {
      border-color: #667eea;
    }
  }
`;

const FilterSelect = styled('select')`
  padding: 0.8rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    transform: scale(1.02);
  }
  
  &:hover {
    border-color: #667eea;
  }
  
  option {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
    color: ${({ theme }) => theme.colors.text};
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
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

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
`;

const StatChange = styled.div`
  font-size: 0.8rem;
  color: ${({ $positive, theme }) => $positive ? theme.colors.success : theme.colors.error};
  font-weight: 600;
  margin-top: 0.5rem;
  position: relative;
  z-index: 1;
`;

const FilterContainer = styled(motion.div)`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

// Memoized filter button component
const FilterButton = memo(styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  border: 2px solid ${({ theme, $active }) => 
    $active ? '#667eea' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  background: ${({ theme, $active }) => 
    $active ? 'rgba(102, 126, 234, 0.2)' : 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'};
  color: ${({ theme, $active }) => 
    $active ? '#667eea' : theme.colors.text};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`);

FilterButton.displayName = 'FilterButton';

// Memoized orders grid component
const OrdersGrid = memo(styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`);

OrdersGrid.displayName = 'OrdersGrid';

// Memoized loading container component
const LoadingContainer = memo(styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-direction: column;
  gap: 1rem;
`);

LoadingContainer.displayName = 'LoadingContainer';

// Memoized empty state component
const EmptyState = memo(styled(GlowCard)`
  text-align: center;
  padding: 4rem 2rem;
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
  
  svg {
    font-size: 4rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text};
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 1.5rem;
  }
`);

EmptyState.displayName = 'EmptyState';

// Memoized order card wrapper
const MemoizedOrderCard = memo(({ order, onStatusChange, onViewDetails, onPrint, onDownload }) => (
  <OrderCard
    key={order.id}
    order={order}
    onStatusChange={onStatusChange}
    onViewDetails={onViewDetails}
    onPrint={onPrint}
    onDownload={onDownload}
  />
));

MemoizedOrderCard.displayName = 'MemoizedOrderCard';

const WorkQueue = memo(() => {
  usePerformanceMonitor('WorkQueue');
  
  const { t } = useTranslation();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  
  // State management with performance optimization
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printType, setPrintType] = useState('report');

  // Memoized query for orders
  const ordersQuery = useMemoWithPerformance(() => {
    const baseQuery = query(
      collection(db, 'testOrders'),
      orderBy('createdAt', 'desc'),
      limit(100) // Limit to prevent performance issues
    );
    
    if (statusFilter !== 'all') {
      return query(baseQuery, where('status', '==', statusFilter));
    }
    
    return baseQuery;
  }, [statusFilter], 'orders_query');

  // Optimized data fetching
  useEffect(() => {
    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ordersQuery]);

  // Memoized filtered and sorted orders
  const processedOrders = useMemoWithPerformance(() => {
    let result = [...orders];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(order =>
        order.patientName?.toLowerCase().includes(searchLower) ||
        order.patientId?.toLowerCase().includes(searchLower) ||
        order.orderId?.toLowerCase().includes(searchLower)
      );
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(order => order.priority === priorityFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      result = result.filter(order => order.department === departmentFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt') {
        aValue = aValue?.toDate ? aValue.toDate() : new Date(aValue);
        bValue = bValue?.toDate ? bValue.toDate() : new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [orders, searchTerm, priorityFilter, departmentFilter, sortBy, sortOrder], 'orders_processing');

  // Memoized stats calculation
  const stats = useMemoWithPerformance(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'Pending').length;
    const inProgress = orders.filter(o => o.status === 'In Progress').length;
    const completed = orders.filter(o => o.status === 'Completed').length;
    const urgent = orders.filter(o => o.priority === 'urgent').length;

    return { total, pending, inProgress, completed, urgent };
  }, [orders], 'stats_calculation');

  // Optimized event handlers
  const handleSearchChange = useCallbackWithPerformance((e) => {
    setSearchTerm(e.target.value);
  }, [], 'search_change');

  const handleStatusFilterChange = useCallbackWithPerformance((status) => {
    setStatusFilter(status);
  }, [], 'status_filter_change');

  const handlePriorityFilterChange = useCallbackWithPerformance((priority) => {
    setPriorityFilter(priority);
  }, [], 'priority_filter_change');

  const handleDepartmentFilterChange = useCallbackWithPerformance((department) => {
    setDepartmentFilter(department);
  }, [], 'department_filter_change');

  const handleSort = useCallbackWithPerformance((field) => {
    setSortBy(prev => {
      if (prev === field) {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortOrder('desc');
      }
      return field;
    });
  }, [], 'sort_change');

  const clearFilters = useCallbackWithPerformance(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDepartmentFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
  }, [], 'clear_filters');

  const handleStatusChange = useCallbackWithPerformance(async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'testOrders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  }, [], 'status_change');

  const handleViewDetails = useCallbackWithPerformance((order) => {
    setSelectedOrder(order);
    // Navigate to order details
  }, [], 'view_details');

  const handlePrint = useCallbackWithPerformance((order, type = 'report') => {
    setSelectedOrder(order);
    setPrintType(type);
    setShowPrintModal(true);
  }, [], 'print_order');

  const handleDownloadPDF = useCallbackWithPerformance(async (order) => {
    try {
      // PDF download logic
      toast.success('PDF download started');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  }, [], 'download_pdf');

  // Memoized sort icon component
  const getSortIcon = useCallbackWithPerformance((field) => {
    if (sortBy !== field) return <FaSort />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  }, [sortBy, sortOrder], 'sort_icon');

  // Memoized filter options
  const filterOptions = useMemo(() => ({
    status: [
      { value: 'all', label: t('workQueue.allStatuses') },
      { value: 'Pending', label: t('workQueue.pending') },
      { value: 'In Progress', label: t('workQueue.inProgress') },
      { value: 'Completed', label: t('workQueue.completed') },
      { value: 'Cancelled', label: t('workQueue.cancelled') }
    ],
    priority: [
      { value: 'all', label: t('workQueue.allPriorities') },
      { value: 'normal', label: t('workQueue.normal') },
      { value: 'urgent', label: t('workQueue.urgent') },
      { value: 'critical', label: t('workQueue.critical') }
    ],
    department: [
      { value: 'all', label: t('workQueue.allDepartments') },
      { value: 'Hematology', label: t('workQueue.hematology') },
      { value: 'Biochemistry', label: t('workQueue.biochemistry') },
      { value: 'Microbiology', label: t('workQueue.microbiology') },
      { value: 'Immunology', label: t('workQueue.immunology') }
    ]
  }), [t]);

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <FaSpinner size={40} />
          <p>{t('workQueue.loading')}</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader>
        <div>
          <HeaderTitle>
            <FaClipboardList />
            {t('workQueue.title')}
          </HeaderTitle>
          <HeaderSubtitle>
            {t('workQueue.subtitle', { count: stats.total })}
          </HeaderSubtitle>
        </div>
        <HeaderActions>
          <GlowButton onClick={() => setShowPrintModal(true)}>
            <FaPrint />
            {t('workQueue.printAll')}
          </GlowButton>
                          <GlowButton $variant="secondary" onClick={clearFilters}>
            <FaRedo />
            {t('workQueue.clearFilters')}
          </GlowButton>
        </HeaderActions>
      </PageHeader>

      <SearchAndFilterContainer>
        <SearchInput>
          <FaSearch />
          <input
            type="text"
            placeholder={t('workQueue.searchPlaceholder')}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </SearchInput>

        <FilterGrid>
          {filterOptions.status.map(option => (
            <FilterButton
              key={option.value}
              $active={statusFilter === option.value}
              onClick={() => handleStatusFilterChange(option.value)}
            >
              <FaFilter />
              {option.label}
            </FilterButton>
          ))}
        </FilterGrid>

        <FilterGrid>
          {filterOptions.priority.map(option => (
            <FilterButton
              key={option.value}
              $active={priorityFilter === option.value}
              onClick={() => handlePriorityFilterChange(option.value)}
            >
              <FaExclamationTriangle />
              {option.label}
            </FilterButton>
          ))}
        </FilterGrid>

        <FilterGrid>
          {filterOptions.department.map(option => (
            <FilterButton
              key={option.value}
              $active={departmentFilter === option.value}
              onClick={() => handleDepartmentFilterChange(option.value)}
            >
              <FaFlask />
              {option.label}
            </FilterButton>
          ))}
        </FilterGrid>
      </SearchAndFilterContainer>

      {processedOrders.length === 0 ? (
        <EmptyState>
          <FaList />
          <h3>{t('workQueue.noOrders')}</h3>
          <p>{t('workQueue.noOrdersDescription')}</p>
        </EmptyState>
      ) : (
        <div style={{ width: '100%', height: Math.min(processedOrders.length * 180, 800), maxWidth: '100%' }}>
          <List
            height={Math.min(processedOrders.length * 180, 800)}
            itemCount={processedOrders.length}
            itemSize={190} // Adjust based on card height
            width={'100%'}
            style={{ overflowX: 'hidden' }}
          >
            {({ index, style }) => {
              const order = processedOrders[index];
              return (
                <div style={style} key={order.id}>
                  <MemoizedOrderCard
                    order={order}
                    onStatusChange={handleStatusChange}
                    onViewDetails={handleViewDetails}
                    onPrint={handlePrint}
                    onDownload={handleDownloadPDF}
                  />
                </div>
              );
            }}
          </List>
        </div>
      )}

      {showPrintModal && selectedOrder && (
        <PrintCenter
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title={t('workQueue.printOrder')}
        >
          {printType === 'report' && <PrintableReport order={selectedOrder} />}
          {printType === 'requisition' && <RequisitionForm order={selectedOrder} />}
          {printType === 'masterSlip' && <MasterSlip order={selectedOrder} />}
          {printType === 'departmentSlip' && <DepartmentSlip order={selectedOrder} />}
          {printType === 'tubeIdSlip' && <TubeIdSlip order={selectedOrder} />}
        </PrintCenter>
      )}
    </PageContainer>
  );
});

WorkQueue.displayName = 'WorkQueue';

export default WorkQueue;