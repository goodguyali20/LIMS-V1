import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { showFlashMessage } from '../contexts/NotificationContext';
import { 
  FaSearch, FaFilter, FaPrint, FaEye, FaSpinner, FaPlus, FaSort, FaUser, FaIdCard, 
  FaCalendar, FaUserCircle, FaVenusMars, FaBirthdayCake, FaEdit, FaTrash, FaExpandAlt,
  FaCompressAlt, FaCheckCircle, FaClock, FaExclamationTriangle, FaTimes, FaPlay, FaPause,
  FaVial, FaFlask, FaThermometer, FaIdCard as FaIdCardIcon, FaBug, FaBacteria
} from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import GlowCard from '../components/common/GlowCard';
import GlowButton from '../components/common/GlowButton';
import EmptyState from '../components/common/EmptyState';
import AnimatedModal from '../components/common/AnimatedModal';
import { advancedVariants, pageTransitions } from '../styles/animations';

// Department Theme System - Borrowed from WorkQueue
const departmentThemes = {
  Hematology: {
    primary: '#dc3545',
    accent: '#f87171',
    name: 'Hematology Lab',
    icon: FaVial
  },
  Chemistry: {
    primary: '#ffc107',
    accent: '#fde68a',
    name: 'Chemistry Lab',
    icon: FaFlask
  },
  Serology: {
    primary: '#28a745',
    accent: '#4ade80',
    name: 'Serology Lab',
    icon: FaThermometer
  },
  Virology: {
    primary: '#007bff',
    accent: '#60a5fa',
    name: 'Virology Lab',
    icon: FaIdCardIcon
  },
  Microbiology: {
    primary: '#6f42c1',
    accent: '#e879f9',
    name: 'Microbiology Lab',
    icon: FaBacteria
  },
  Parasitology: {
    primary: '#6f42c1',
    accent: '#fdba74',
    name: 'Parasitology Lab',
    icon: FaBug
  }
};

// Test Status Types
const testStatuses = {
  'Not Started': { color: '#6c757d', icon: FaClock, label: 'Not Started' },
  'In Progress': { color: '#ffc107', icon: FaPlay, label: 'In Progress' },
  'Completed': { color: '#28a745', icon: FaCheckCircle, label: 'Completed' },
  'Failed': { color: '#dc3545', icon: FaTimes, label: 'Failed' },
  'Cancelled': { color: '#6c757d', icon: FaTimes, label: 'Cancelled' }
};

// Priority Levels
const priorityLevels = {
  'High': { color: '#dc3545', label: 'High Priority' },
  'Medium': { color: '#ffc107', label: 'Medium Priority' },
  'Low': { color: '#28a745', label: 'Low Priority' },
  'Normal': { color: '#6c757d', label: 'Normal Priority' }
};

// Styled Components
const OrdersContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s ease;
`;

const Header = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const StatsContainer = styled(motion.div)`
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
    background: linear-gradient(90deg, 
      #667eea 0%, 
      #764ba2 25%, 
      #f093fb 50%, 
      #f5576c 75%, 
      #4facfe 100%);
    border-radius: 20px 20px 0 0;
  }
  
  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 700;
    color: #667eea;
    position: relative;
    z-index: 1;
  }
  
  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    z-index: 1;
  }
`;

const SearchAndFilterContainer = styled(motion.div)`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled(motion.div)`
  position: relative;
  flex: 1;
  min-width: 300px;
  
  input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(20px);
    
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
      transform: scale(1.02);
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
    transition: color 0.3s ease;
  }
  
  &:focus-within svg {
    color: #667eea;
  }
`;

const FilterSelect = styled(motion.select)`
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 1rem;
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
`;

const BulkActionsContainer = styled(motion.div)`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
`;

const OrdersGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const OrderCard = styled(motion.div)`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
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
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 30px 60px rgba(0, 0, 0, 0.15),
      0 12px 24px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
`;

const OrderNumbers = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
`;

const QueueNumber = styled.span`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
`;

const DepartmentNumber = styled.span`
  background: ${({ departmentColor }) => departmentColor};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
`;

const OrderId = styled.h3`
  margin: 0;
  color: #667eea;
  font-size: 1.2rem;
  font-weight: 600;
`;

const StatusBadge = styled(motion.span)`
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'Completed': return `linear-gradient(135deg, ${theme.colors.success}20, ${theme.colors.success}10)`;
      case 'In Progress': return `linear-gradient(135deg, ${theme.colors.warning}20, ${theme.colors.warning}10)`;
      case 'Pending': return `linear-gradient(135deg, ${theme.colors.info}20, ${theme.colors.info}10)`;
      case 'Rejected': return `linear-gradient(135deg, ${theme.colors.error}20, ${theme.colors.error}10)`;
      default: return `linear-gradient(135deg, ${theme.colors.textSecondary}20, ${theme.colors.textSecondary}10)`;
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'Completed': return theme.colors.success;
      case 'In Progress': return theme.colors.warning;
      case 'Pending': return theme.colors.info;
      case 'Rejected': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  }};
  border: 1px solid ${({ status, theme }) => {
    switch (status) {
      case 'Completed': return theme.colors.success;
      case 'In Progress': return theme.colors.warning;
      case 'Pending': return theme.colors.info;
      case 'Rejected': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  }};
  backdrop-filter: blur(10px);
`;

const PatientInfo = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  
  p {
    margin: 0.5rem 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.95rem;
  }
`;

const PatientAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  margin-right: 1.2rem;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
  flex-shrink: 0;
`;

const TestList = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  
  h4 {
    margin: 0 0 0.8rem 0;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 600;
  }
`;

const TestItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid ${({ departmentColor }) => departmentColor};
  
  .test-info {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    
    .department-icon {
      color: ${({ departmentColor }) => departmentColor};
      font-size: 1.2rem;
    }
    
    .test-name {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
    }
    
    .department-name {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }
  
  .test-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .status-badge {
      padding: 0.3rem 0.8rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      background: ${({ statusColor }) => statusColor}20;
      color: ${({ statusColor }) => statusColor};
      border: 1px solid ${({ statusColor }) => statusColor};
    }
  }
`;

const OrderActions = styled.div`
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  position: relative;
  z-index: 1;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 12px;
  background: ${({ $variant, theme }) => 
    $variant === 'secondary' ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)' : `linear-gradient(135deg, #667eea, #764ba2)`};
  color: ${({ $variant, theme }) => 
    $variant === 'secondary' ? theme.colors.textSecondary : 'white'};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid ${({ $variant, theme }) => 
    $variant === 'secondary' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
`;

// Helper functions
const getDepartmentTheme = (department) => {
  return departmentThemes[department] || departmentThemes['Hematology'];
};

const getTestStatus = (status) => {
  return testStatuses[status] || testStatuses['Not Started'];
};

const getPriorityColor = (priority) => {
  return priorityLevels[priority]?.color || priorityLevels['Normal'].color;
};

// Main component
const Orders = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // Fetch orders from Firebase
  useEffect(() => {
    const q = query(
      collection(db, "testOrders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = [];
      querySnapshot.forEach((doc) => {
        const orderData = { id: doc.id, ...doc.data() };
        
        // Add numbering system
        orderData.queueNumber = generateQueueNumber(orderData.createdAt);
        orderData.departmentNumbers = generateDepartmentNumbers(orderData.tests);
        
        ordersData.push(orderData);
      });
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      showFlashMessage({ type: 'error', title: 'Error', message: 'Failed to load orders' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Generate queue number based on creation date
  const generateQueueNumber = (createdAt) => {
    if (!createdAt) return 1;
    const today = new Date();
    const orderDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    
    if (orderDate.toDateString() === today.toDateString()) {
      // Count orders created today
      const todayOrders = orders.filter(order => {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });
      return todayOrders.length + 1;
    }
    return 1;
  };

  // Generate department-specific numbers
  const generateDepartmentNumbers = (tests) => {
    if (!tests || !Array.isArray(tests)) return {};
    
    const departmentNumbers = {};
    const today = new Date();
    
    tests.forEach(test => {
      const department = test.department || 'Unknown';
      if (!departmentNumbers[department]) {
        // Count tests in this department today
        const todayTestsInDept = orders.filter(order => {
          const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
          return orderDate.toDateString() === today.toDateString() && 
                 order.tests?.some(t => t.department === department);
        });
        departmentNumbers[department] = todayTestsInDept.length + 1;
      }
    });
    
    return departmentNumbers;
  };

  // Filter and sort orders
  useEffect(() => {
    let filtered = orders;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.tests?.some(test => test.department === departmentFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          bValue = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          break;
        case 'patient':
          aValue = a.patientName || '';
          bValue = b.patientName || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'priority':
          aValue = a.priority || 'Normal';
          bValue = b.priority || 'Normal';
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, departmentFilter, sortBy, sortOrder]);

  // Handle order selection
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(filteredOrders.map(order => order.id));
  };

  const clearSelection = () => {
    setSelectedOrders([]);
  };

  // Handle bulk operations
  const handleBulkStatusChange = async (newStatus) => {
    try {
      const updatePromises = selectedOrders.map(orderId => 
        updateDoc(doc(db, "testOrders", orderId), { status: newStatus })
      );
      
      await Promise.all(updatePromises);
      showFlashMessage({ 
        type: 'success', 
        title: 'Success', 
        message: `Updated ${selectedOrders.length} orders to ${newStatus}` 
      });
      setSelectedOrders([]);
    } catch (error) {
      console.error('Error updating orders:', error);
      showFlashMessage({ 
        type: 'error', 
        title: 'Error', 
        message: 'Failed to update orders' 
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) {
      return;
    }

    try {
      const deletePromises = selectedOrders.map(orderId => 
        deleteDoc(doc(db, "testOrders", orderId))
      );
      
      await Promise.all(deletePromises);
      showFlashMessage({ 
        type: 'success', 
        title: 'Success', 
        message: `Deleted ${selectedOrders.length} orders` 
      });
      setSelectedOrders([]);
    } catch (error) {
      console.error('Error deleting orders:', error);
      showFlashMessage({ 
        type: 'error', 
        title: 'Error', 
        message: 'Failed to delete orders' 
      });
    }
  };

  // Handle individual order actions
  const handleViewOrder = (orderId) => {
    navigate(`/app/print-order/${orderId}`);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setEditModalOpen(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, "testOrders", orderId));
      showFlashMessage({ 
        type: 'success', 
        title: 'Success', 
        message: 'Order deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      showFlashMessage({ 
        type: 'error', 
        title: 'Error', 
        message: 'Failed to delete order' 
      });
    }
  };

  const handlePrintOrder = (orderId) => {
    navigate(`/app/print-order/${orderId}`);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Get statistics
  const getStats = () => {
    const total = orders.length;
    const completed = orders.filter(o => o.status === 'Completed').length;
    const pending = orders.filter(o => o.status === 'Pending').length;
    const inProgress = orders.filter(o => o.status === 'In Progress').length;
    const rejected = orders.filter(o => o.status === 'Rejected').length;
    
    return { total, completed, pending, inProgress, rejected };
  };

  const stats = getStats();

  if (loading) {
    return (
      <OrdersContainer
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
            <FaSpinner size={32} />
          </motion.div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading orders...
          </motion.span>
        </LoadingContainer>
      </OrdersContainer>
    );
  }

  return (
    <OrdersContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <PageTitle>Orders</PageTitle>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: theme.colors.textSecondary, margin: '0.5rem 0 0 0' }}
          >
            Manage and view all laboratory orders with advanced tracking
          </motion.p>
        </div>
        <HeaderActions>
          <GlowButton
            onClick={() => navigate('/app/patient-registration')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus /> New Order
          </GlowButton>
        </HeaderActions>
      </Header>

      <StatsContainer
        variants={advancedVariants.container}
        initial="hidden"
        animate="visible"
        transition={{ delayChildren: 0.3 }}
      >
        <StatCard variants={advancedVariants.item}>
          <h3>{stats.total}</h3>
          <p>Total Orders</p>
        </StatCard>
        <StatCard variants={advancedVariants.item}>
          <h3>{stats.completed}</h3>
          <p>Completed</p>
        </StatCard>
        <StatCard variants={advancedVariants.item}>
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </StatCard>
        <StatCard variants={advancedVariants.item}>
          <h3>{stats.inProgress}</h3>
          <p>In Progress</p>
        </StatCard>
      </StatsContainer>

      <SearchAndFilterContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <SearchInput
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FaSearch />
          <input
            type="text"
            placeholder="Search by patient name, ID, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>
        
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </FilterSelect>

        <FilterSelect
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <option value="all">All Departments</option>
          {Object.keys(departmentThemes).map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </FilterSelect>

        <motion.button
          onClick={() => handleSort(sortBy)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 1.5rem',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            color: theme.colors.text,
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(20px)'
          }}
        >
          <FaSort />
          Sort by {sortBy === 'date' ? 'Date' : sortBy === 'patient' ? 'Patient' : sortBy === 'status' ? 'Status' : 'Priority'}
          {sortOrder === 'asc' ? ' ↑' : ' ↓'}
        </motion.button>
      </SearchAndFilterContainer>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <BulkActionsContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span style={{ color: theme.colors.text }}>
            {selectedOrders.length} order(s) selected
          </span>
          <GlowButton
            onClick={() => handleBulkStatusChange('Completed')}
            size="small"
          >
            Mark Complete
          </GlowButton>
          <GlowButton
            onClick={() => handleBulkStatusChange('In Progress')}
            size="small"
          >
            Mark In Progress
          </GlowButton>
          <GlowButton
            onClick={handleBulkDelete}
            size="small"
            variant="danger"
          >
            Delete Selected
          </GlowButton>
          <motion.button
            onClick={clearSelection}
            whileHover={{ scale: 1.05 }}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: theme.colors.text,
              cursor: 'pointer'
            }}
          >
            Clear Selection
          </motion.button>
        </BulkActionsContainer>
      )}

      <AnimatePresence mode="wait">
        {filteredOrders.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <EmptyState
              title="No Orders Found"
              description={
                searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No orders have been created yet.'
              }
              icon="📋"
            />
          </motion.div>
        ) : (
          <OrdersGrid
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                status={order.status}
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                {/* Order Header with Numbers */}
                <OrderHeader>
                  <div>
                    <OrderNumbers>
                      <QueueNumber>#{order.queueNumber}</QueueNumber>
                      {Object.entries(order.departmentNumbers || {}).map(([dept, num]) => (
                        <DepartmentNumber
                          key={dept}
                          departmentColor={getDepartmentTheme(dept).primary}
                        >
                          {dept} #{num}
                        </DepartmentNumber>
                      ))}
                    </OrderNumbers>
                    <OrderId>{order.id}</OrderId>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleOrderSelection(order.id);
                      }}
                    />
                    <StatusBadge status={order.status}>
                      {order.status}
                    </StatusBadge>
                  </div>
                </OrderHeader>

                {/* Patient Information */}
                <PatientInfo style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <PatientAvatar>
                    {order.patientName ? order.patientName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : <FaUserCircle />}
                  </PatientAvatar>
                  <div>
                    <h3 style={{ margin: 0 }}>{order.patientName}</h3>
                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 4, color: '#888' }}>
                        <FaUser /> {order.patientId}
                      </p>
                      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 4, color: '#888' }}>
                        <FaIdCard /> {order.id}
                      </p>
                      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 4, color: '#888' }}>
                        <FaCalendar /> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </p>
                      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 4, color: '#888' }}>
                        <FaBirthdayCake /> {order.age?.value ? `${order.age.value} ${order.age.unit || ''}` : '—'}
                      </p>
                      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 4, color: '#888' }}>
                        <FaVenusMars /> {order.gender ? order.gender : '—'}
                      </p>
                    </div>
                  </div>
                </PatientInfo>

                {/* Tests List with Department Color Coding */}
                <TestList>
                  <h4>Tests:</h4>
                  {order.tests?.map((test, idx) => {
                    const department = test.department || 'Unknown';
                    const departmentTheme = getDepartmentTheme(department);
                    const testStatus = getTestStatus(test.status || 'Not Started');
                    
                    return (
                      <TestItem
                        key={idx}
                        departmentColor={departmentTheme.primary}
                        statusColor={testStatus.color}
                      >
                        <div className="test-info">
                          <span className="department-icon">
                            {React.createElement(departmentTheme.icon)}
                          </span>
                          <div>
                            <div className="test-name">
                              {typeof test === 'string' ? test : (test?.name || test?.id || 'Unknown Test')}
                            </div>
                            <div className="department-name">{department}</div>
                          </div>
                        </div>
                        <div className="test-status">
                          <span className="status-badge">
                            {React.createElement(testStatus.icon, { size: 12 })}
                            {testStatus.label}
                          </span>
                        </div>
                      </TestItem>
                    );
                  })}
                </TestList>

                {/* Order Actions */}
                <OrderActions>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewOrder(order.id);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaEye /> View
                  </ActionButton>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditOrder(order);
                    }}
                    $variant="secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaEdit /> Edit
                  </ActionButton>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintOrder(order.id);
                    }}
                    $variant="secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPrint /> Print
                  </ActionButton>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOrder(order.id);
                    }}
                    $variant="secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ color: '#dc3545' }}
                  >
                    <FaTrash /> Delete
                  </ActionButton>
                </OrderActions>
              </OrderCard>
            ))}
          </OrdersGrid>
        )}
      </AnimatePresence>

      {/* Edit Modal Placeholder */}
      <AnimatedModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Order"
      >
        <div style={{ padding: '2rem' }}>
          <p>Edit functionality will be implemented here...</p>
          <p>Order ID: {editingOrder?.id}</p>
          <p>Patient: {editingOrder?.patientName}</p>
        </div>
      </AnimatedModal>
    </OrdersContainer>
  );
};

export default Orders;
