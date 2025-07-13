import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaSearch, FaFilter, FaSort, FaClock, FaUser, FaExclamationTriangle,
  FaEye, FaDownload, FaCalendar, FaInfoCircle, FaSpinner, FaTimes,
  FaSortUp, FaSortDown, FaFileAlt, FaShieldAlt, FaHistory
} from 'react-icons/fa';
import GlowCard from '../../components/common/GlowCard';
import GlowButton from '../../components/common/GlowButton';

const PageContainer = styled(motion.div)`
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
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    border-radius: 1px;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SearchAndFilterContainer = styled(GlowCard)`
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
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

const LogTable = styled(GlowCard)`
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.colors.surfaceSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
`;

const LogRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const LogCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.8rem;
  }
`;

const EventBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'create': return `${theme.colors.success}20`;
      case 'update': return `${theme.colors.primary}20`;
      case 'delete': return `${theme.colors.error}20`;
      case 'login': return `${theme.colors.info}20`;
      default: return `${theme.colors.textSecondary}20`;
    }
  }};
  color: ${({ type, theme }) => {
    switch (type) {
      case 'create': return theme.colors.success;
      case 'update': return theme.colors.primary;
      case 'delete': return theme.colors.error;
      case 'login': return theme.colors.info;
      default: return theme.colors.textSecondary;
    }
  }};
`;

const SkeletonRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SkeletonCell = styled.div`
  height: 1rem;
  background: ${({ theme }) => theme.colors.surfaceSecondary};
  border-radius: 4px;
  animation: pulse 1.5s infinite alternate;
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    100% { opacity: 1; }
  }
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

const AuditLog = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const q = query(
      collection(db, "auditLogs"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logsData = [];
      querySnapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() });
      });
      setAuditLogs(logsData);
      setFilteredLogs(logsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = auditLogs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply event filter
    if (eventFilter !== 'all') {
      filtered = filtered.filter(log => log.event === eventFilter);
    }

    // Apply user filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.user === userFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'event':
          aValue = a.event || '';
          bValue = b.event || '';
          break;
        case 'user':
          aValue = a.user || '';
          bValue = b.user || '';
          break;
        case 'timestamp':
        default:
          aValue = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          bValue = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredLogs(filtered);
  }, [auditLogs, searchTerm, eventFilter, userFilter, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm('');
    setEventFilter('all');
    setUserFilter('all');
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

  const getEventType = (event) => {
    if (event?.includes('created') || event?.includes('added')) return 'create';
    if (event?.includes('updated') || event?.includes('modified')) return 'update';
    if (event?.includes('deleted') || event?.includes('removed')) return 'delete';
    if (event?.includes('login') || event?.includes('logout')) return 'login';
    return 'other';
  };

  if (loading) {
    return (
      <PageContainer>
        <Header>
          <PageTitle>
            <FaHistory /> {t('auditLogHeader')}
          </PageTitle>
        </Header>
        <LogTable>
          <TableHeader>
            <div>Event</div>
            <div>Details</div>
            <div>User</div>
            <div>Timestamp</div>
            <div>IP Address</div>
            <div>Actions</div>
          </TableHeader>
          {[...Array(5)].map((_, i) => (
            <SkeletonRow key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SkeletonCell />
              <SkeletonCell />
              <SkeletonCell />
              <SkeletonCell />
              <SkeletonCell />
              <SkeletonCell />
            </SkeletonRow>
          ))}
        </LogTable>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <PageTitle>
          <FaHistory /> {t('auditLogHeader')}
        </PageTitle>
        <HeaderActions>
          <GlowButton
            onClick={() => {/* Export functionality */}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaDownload /> Export
          </GlowButton>
        </HeaderActions>
      </Header>

      <SearchAndFilterContainer>
        <FilterGrid>
          <SearchInput>
            <FaSearch />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>

          <FilterSelect
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="User Login">Login</option>
            <option value="Order Created">Order Created</option>
            <option value="Results Entered">Results Entered</option>
            <option value="Test Updated">Test Updated</option>
          </FilterSelect>

          <FilterSelect
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            {Array.from(new Set(auditLogs.map(log => log.user))).map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </FilterSelect>
        </FilterGrid>

        <FilterActions>
          <SortContainer>
            <span>Sort by:</span>
            <SortButton
              $active={sortBy === 'timestamp'}
              onClick={() => handleSort('timestamp')}
            >
              Timestamp {getSortIcon('timestamp')}
            </SortButton>
            <SortButton
              $active={sortBy === 'event'}
              onClick={() => handleSort('event')}
            >
              Event {getSortIcon('event')}
            </SortButton>
            <SortButton
              $active={sortBy === 'user'}
              onClick={() => handleSort('user')}
            >
              User {getSortIcon('user')}
            </SortButton>
          </SortContainer>

          <ClearFiltersButton onClick={clearFilters}>
            <FaTimes /> Clear Filters
          </ClearFiltersButton>
        </FilterActions>
      </SearchAndFilterContainer>

      <AnimatePresence mode="wait">
        {filteredLogs.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <EmptyState>
              <FaHistory />
              <h3>No Audit Logs Found</h3>
              <p>
                {searchTerm || eventFilter !== 'all' || userFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No audit logs are available at the moment.'}
              </p>
            </EmptyState>
          </motion.div>
        ) : (
          <motion.div
            key="logs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LogTable>
              <TableHeader>
                <div>Event</div>
                <div>Details</div>
                <div>User</div>
                <div>Timestamp</div>
                <div>IP Address</div>
                <div>Actions</div>
              </TableHeader>
              <AnimatePresence>
                {filteredLogs.map((log, index) => (
                  <LogRow
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <LogCell>
                      <EventBadge type={getEventType(log.event)}>
                        {log.event}
                      </EventBadge>
                    </LogCell>
                    <LogCell>
                      <FaInfoCircle />
                      {log.details}
                    </LogCell>
                    <LogCell>
                      <FaUser />
                      {log.user}
                    </LogCell>
                    <LogCell>
                      <FaClock />
                      {log.timestamp?.toDate ? 
                        log.timestamp.toDate().toLocaleString() : 
                        new Date(log.timestamp).toLocaleString()
                      }
                    </LogCell>
                    <LogCell>
                      {log.ipAddress || 'N/A'}
                    </LogCell>
                    <LogCell>
                      <FaEye style={{ cursor: 'pointer' }} title="View Details" />
                    </LogCell>
                  </LogRow>
                ))}
              </AnimatePresence>
            </LogTable>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default AuditLog;