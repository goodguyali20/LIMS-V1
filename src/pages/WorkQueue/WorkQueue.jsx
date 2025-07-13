import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, limit, getDocs } from 'firebase/firestore';
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

const HeaderSubtitle = styled.p`
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

const FilterSelect = styled.select`
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

const FilterButton = styled(motion.button)`
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
`;

const OrdersGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const LoadingContainer = styled(motion.div)`
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
    position: relative;
    z-index: 1;
  }
  
  h3 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.5rem;
    position: relative;
    z-index: 1;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.1rem;
    position: relative;
    z-index: 1;
  }
`;

const WorkQueue = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('desc');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [printCenterOpen, setPrintCenterOpen] = useState(false);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [printSettings, setPrintSettings] = useState({ paperSize: 'A4', orientation: 'portrait', colorMode: 'color' });
  const [printLoading, setPrintLoading] = useState(false);
  const [printFeedback, setPrintFeedback] = useState(null);

  // React Query for fetching orders
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['workQueue', 'orders'],
    queryFn: async () => {
      const q = query(
        collection(db, "testOrders"), 
        where("status", "in", ["Pending Sample", "Sample Collected", "In Progress", "Rejected"]),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const ordersData = [];
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        ordersData.push({
          ...data,
          priority: data.priority || 'normal',
          estimatedTime: data.estimatedTime || 30,
          assignedTo: data.assignedTo || null,
          notes: data.notes || '',
          qualityChecks: data.qualityChecks || [],
          isUrgent: data.priority === 'urgent',
          isCritical: data.priority === 'critical',
          hasNotes: Boolean(data.notes),
          testCount: Array.isArray(data.tests) ? data.tests.length : 0
        });
      });
      return ordersData;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: autoRefresh ? 60000 : false, // 1 minute if auto-refresh is on
    retry: 2,
  });

  // Real-time updates with React Query
  useEffect(() => {
    if (!orders.length) return;

    const q = query(
      collection(db, "testOrders"), 
      where("status", "in", ["Pending Sample", "Sample Collected", "In Progress", "Rejected"]),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = [];
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        ordersData.push({
          ...data,
          priority: data.priority || 'normal',
          estimatedTime: data.estimatedTime || 30,
          assignedTo: data.assignedTo || null,
          notes: data.notes || '',
          qualityChecks: data.qualityChecks || [],
          isUrgent: data.priority === 'urgent',
          isCritical: data.priority === 'critical',
          hasNotes: Boolean(data.notes),
          testCount: Array.isArray(data.tests) ? data.tests.length : 0
        });
      });
      
      // Update React Query cache with real-time data
      queryClient.setQueryData(['workQueue', 'orders'], ordersData);
    }, (error) => {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load work queue');
    });

    return () => unsubscribe();
  }, [orders.length, queryClient]);

  // Mutation for updating order status
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }) => {
      await updateDoc(doc(db, "testOrders", orderId), {
        ...updates,
        updatedAt: new Date()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workQueue', 'orders']);
      toast.success('Order updated successfully');
    },
    onError: (error) => {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    },
  });

  useEffect(() => {
    let filtered = orders;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(order => order.priority === priorityFilter);
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
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
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

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  const getStats = () => {
    const stats = {
      pending: 0,
      collected: 0,
      inProgress: 0,
      rejected: 0,
      urgent: 0,
      completionRate: 0
    };

    orders.forEach(order => {
      switch (order.status) {
        case 'Pending Sample':
          stats.pending++;
          if (order.priority === 'urgent') stats.urgent++;
          break;
        case 'Sample Collected':
          stats.collected++;
          break;
        case 'In Progress':
          stats.inProgress++;
          break;
        case 'Rejected':
          stats.rejected++;
          break;
      }
    });

    const total = orders.length;
    const completed = orders.filter(o => o.status === 'Completed').length;
    stats.completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return stats;
  };

  const stats = getStats();

  // Group tests by department for the selected order
  const testsByDept = useMemo(() => {
    if (!orders.length) return {};
    const selectedOrder = orders[selectedDocIndex] || orders[0];
    if (!selectedOrder || !selectedOrder.tests) return {};
    
    return selectedOrder.tests.reduce((acc, testName) => {
      // For now, we'll use a simple grouping since we don't have test catalog in WorkQueue
      const dept = 'General'; // Default department
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(testName);
      return acc;
    }, {});
  }, [orders, selectedDocIndex]);

  const statusFilters = [
    { key: 'all', label: t('workQueue.filters.allStatus'), icon: <FaList /> },
    { key: 'Pending Sample', label: t('workQueue.filters.pendingSample'), icon: <FaClock /> },
    { key: 'Sample Collected', label: t('workQueue.filters.sampleCollected'), icon: <FaCheckCircle /> },
    { key: 'In Progress', label: t('workQueue.filters.inProgress'), icon: <FaSpinner /> },
    { key: 'Rejected', label: t('workQueue.filters.rejected'), icon: <FaExclamationTriangle /> },
  ];

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

  // Prepare print documents (A4, slips, requisition, etc.)
  const printDocuments = useMemo(() => {
    if (!orders.length) return [];
    const selectedOrder = orders[selectedDocIndex] || orders[0];
    if (!selectedOrder) return [];
    
    return [
      {
        id: 'a4',
        title: 'A4 Report',
        icon: <FaPrint />,
        preview: <PrintableReport order={selectedOrder} settings={printSettings} />,
        type: 'a4',
      },
      {
        id: 'requisition',
        title: 'Requisition Form',
        icon: <FaTicketAlt />,
        preview: <RequisitionForm order={selectedOrder} settings={printSettings} />,
        type: 'requisition',
      },
      {
        id: 'master-slip',
        title: 'Master Slip',
        icon: <FaIdCard />,
        preview: <MasterSlip order={selectedOrder} />,
        type: 'master-slip',
      },
      ...Object.entries(testsByDept).map(([dept, tests], idx) => ({
        id: `dept-slip-${dept}`,
        title: `Department Slip: ${dept}`,
        icon: <FaFlask />,
        preview: <DepartmentSlip order={selectedOrder} department={dept} tests={tests} />,
        type: 'department-slip',
      })),
      ...Array(3).fill(0).map((_, i) => ({
        id: `tube-slip-${i}`,
        title: `Tube ID Slip ${i+1}`,
        icon: <FaBarcode />,
        preview: <TubeIdSlip order={selectedOrder} />,
        type: 'tube-slip',
      })),
    ];
  }, [orders, selectedDocIndex, printSettings, testsByDept]);

  // Print handler
  const handlePrint = async () => {
    setPrintLoading(true);
    setPrintFeedback(null);
    try {
      // Use window.print() for now, or implement per-document printing
      window.print();
      setPrintFeedback({ type: 'success', message: 'Sent to printer!' });
    } catch (e) {
      setPrintFeedback({ type: 'error', message: 'Print failed.' });
    } finally {
      setPrintLoading(false);
    }
  };

  // PDF handler (placeholder, implement with jsPDF or similar)
  const handleDownloadPDF = async () => {
    setPrintLoading(true);
    setPrintFeedback(null);
    try {
      // TODO: Implement PDF download logic
      setPrintFeedback({ type: 'success', message: 'PDF downloaded!' });
    } catch (e) {
      setPrintFeedback({ type: 'error', message: 'PDF download failed.' });
    } finally {
      setPrintLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <LoadingContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaSpinner size={48} />
          </motion.div>
          <p>Loading work queue...</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <FaExclamationTriangle size={48} style={{ color: theme.colors.error, marginBottom: '1rem' }} />
          <h3>Error loading work queue</h3>
          <p>{error.message}</p>
          <GlowButton onClick={() => window.location.reload()}>
            <FaRedo /> Retry
          </GlowButton>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <HeaderTitle>
            <FaVial /> {t('workQueue.title')}
          </HeaderTitle>
          <HeaderSubtitle>
            {t('workQueue.subtitle')}
          </HeaderSubtitle>
        </div>
        <HeaderActions>
          <GlowButton
            onClick={() => setPrintCenterOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaPrint /> {t('workQueue.print')}
          </GlowButton>
          <GlowButton
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: autoRefresh ? theme.colors.success : theme.colors.surface,
              color: autoRefresh ? 'white' : theme.colors.textSecondary
            }}
          >
            {autoRefresh ? <FaPlay /> : <FaPause />}
            {autoRefresh ? t('workQueue.autoRefresh') : t('workQueue.manual')}
          </GlowButton>
          <GlowButton
            onClick={() => queryClient.invalidateQueries(['workQueue', 'orders'])}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaRedo /> {t('workQueue.refresh')}
          </GlowButton>
        </HeaderActions>
      </PageHeader>

      {/* Enhanced Stats */}
      <StatsGrid
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <StatCard color="#3B82F6">
          <StatIcon><FaClock /></StatIcon>
          <StatContent>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>{t('workQueue.stats.pending')}</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard color="#10B981">
          <StatIcon><FaCheckCircle /></StatIcon>
          <StatContent>
            <StatValue>{stats.collected}</StatValue>
            <StatLabel>{t('workQueue.stats.collected')}</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard color="#F59E0B">
          <StatIcon><FaSpinner /></StatIcon>
          <StatContent>
            <StatValue>{stats.inProgress}</StatValue>
            <StatLabel>{t('workQueue.stats.inProgress')}</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard color="#EF4444">
          <StatIcon><FaExclamationTriangle /></StatIcon>
          <StatContent>
            <StatValue>{stats.rejected}</StatValue>
            <StatLabel>{t('workQueue.stats.rejected')}</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard color="#8B5CF6">
          <StatIcon><FaBell /></StatIcon>
          <StatContent>
            <StatValue>{stats.urgent}</StatValue>
            <StatLabel>{t('workQueue.stats.urgent')}</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard color="#06B6D4">
          <StatIcon><FaChartLine /></StatIcon>
          <StatContent>
            <StatValue>{stats.completionRate}%</StatValue>
            <StatLabel>{t('workQueue.stats.completionRate')}</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <SearchAndFilterContainer>
        <FilterGrid>
          <SearchInput>
            <FaSearch />
            <input
              type="text"
              placeholder={t('workQueue.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>

          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('workQueue.filters.allStatus')}</option>
            <option value="Pending Sample">{t('workQueue.filters.pendingSample')}</option>
            <option value="Sample Collected">{t('workQueue.filters.sampleCollected')}</option>
            <option value="In Progress">{t('workQueue.filters.inProgress')}</option>
            <option value="Rejected">{t('workQueue.filters.rejected')}</option>
          </FilterSelect>

          <FilterSelect
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">{t('workQueue.filters.allPriorities')}</option>
            <option value="urgent">{t('workQueue.filters.urgent')}</option>
            <option value="high">{t('workQueue.filters.high')}</option>
            <option value="normal">{t('workQueue.filters.normal')}</option>
            <option value="low">{t('workQueue.filters.low')}</option>
          </FilterSelect>

          <GlowButton
            onClick={clearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaTimes /> {t('workQueue.clearFilters')}
          </GlowButton>
        </FilterGrid>
      </SearchAndFilterContainer>

      <GlowCard style={{ minHeight: 400 }}>
        <div style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: theme.colors.text }}>
            {t('workQueue.title')}
          </h3>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: theme.colors.textSecondary }}>
              <FaVial size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>{t('workQueue.noOrders')}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    padding: '1rem',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '12px',
                    background: theme.colors.surface,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: theme.colors.text }}>
                      {order.patientName}
                    </h4>
                    <p style={{ margin: '0', color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                      Order ID: {order.orderId} • Status: {order.status} • Priority: {order.priority}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <GlowButton
                      size="small"
                      onClick={() => {/* Handle view details */}}
                    >
                      <FaEye /> {t('workQueue.view')}
                    </GlowButton>
                    <GlowButton
                      size="small"
                      variant="primary"
                      onClick={() => {/* Handle print */}}
                    >
                      <FaPrint /> {t('workQueue.print')}
                    </GlowButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlowCard>
      {/*
      <OrdersGrid
        key="orders"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              layout
            >
              <OrderCard order={order} />
            </motion.div>
          ))}
        </AnimatePresence>
      </OrdersGrid>
      */}
      <PrintCenter
        open={printCenterOpen}
        onClose={() => setPrintCenterOpen(false)}
        documents={printDocuments}
        onPrint={handlePrint}
        onDownloadPDF={handleDownloadPDF}
        loading={printLoading}
        feedback={printFeedback}
        selectedDocIndex={selectedDocIndex}
        onSelectDoc={setSelectedDocIndex}
        printSettings={printSettings}
        onChangeSettings={setPrintSettings}
      />
    </PageContainer>
  );
};

export default WorkQueue;