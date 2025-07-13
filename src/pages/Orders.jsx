import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter, FaPrint, FaEye, FaSpinner, FaPlus, FaSort } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import GlowCard from '../components/common/GlowCard';
import GlowButton from '../components/common/GlowButton';
import EmptyState from '../components/common/EmptyState';
import SuccessState from '../components/common/SuccessState';
import { advancedVariants, pageTransitions } from '../styles/animations';

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

const SortButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 1rem;
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
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
    font-size: 0.9rem;
    
    li {
      margin-bottom: 0.3rem;
      color: ${({ theme }) => theme.colors.textSecondary};
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

const Orders = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const q = query(
      collection(db, "testOrders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = [];
      querySnapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() });
      });
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleViewOrder = (orderId) => {
    navigate(`/app/print-order/${orderId}`);
  };

  const handlePrintOrder = (orderId) => {
    navigate(`/app/print-order/${orderId}`);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

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
            Manage and view all laboratory orders
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

        <SortButton
          onClick={() => handleSort(sortBy)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaSort />
          Sort by {sortBy === 'date' ? 'Date' : sortBy === 'patient' ? 'Patient' : 'Status'}
          {sortOrder === 'asc' ? ' ↑' : ' ↓'}
        </SortButton>
      </SearchAndFilterContainer>

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
                searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No orders have been created yet.'
              }
              icon="📋"
            />
          </motion.div>
        ) : (
          <OrdersGrid
            key="orders"
            variants={advancedVariants.container}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.1 }}
          >
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                variants={advancedVariants.item}
                whileHover={{ 
                  y: -8,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                <OrderHeader>
                  <OrderId>Order #{order.id.slice(-8)}</OrderId>
                  <StatusBadge 
                    status={order.status}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {order.status || 'Pending'}
                  </StatusBadge>
                </OrderHeader>
                
                <PatientInfo>
                  <p><strong>Patient:</strong> {order.patientName}</p>
                  <p><strong>ID:</strong> {order.patientId}</p>
                  <p><strong>Date:</strong> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}</p>
                </PatientInfo>
                
                {order.tests && order.tests.length > 0 && (
                  <TestList>
                    <h4>Tests ({order.tests.length})</h4>
                    <ul>
                      {order.tests.slice(0, 3).map((test, index) => (
                        <li key={index}>{test.name}</li>
                      ))}
                      {order.tests.length > 3 && (
                        <li>+{order.tests.length - 3} more</li>
                      )}
                    </ul>
                  </TestList>
                )}
                
                <OrderActions>
                  <ActionButton
                    $variant="secondary"
                    onClick={() => handleViewOrder(order.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaEye /> View
                  </ActionButton>
                  <ActionButton
                    onClick={() => handlePrintOrder(order.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPrint /> Print
                  </ActionButton>
                </OrderActions>
              </OrderCard>
            ))}
          </OrdersGrid>
        )}
      </AnimatePresence>
    </OrdersContainer>
  );
};

export default Orders; 