import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiChevronUp, FiChevronDown, FiMoreVertical } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { advancedVariants, microInteractions } from '../../styles/animations.js';

const TableContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.main};
`;

const TableHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.isDarkMode 
    ? 'rgba(255, 255, 255, 0.02)' 
    : 'rgba(0, 0, 0, 0.02)'};
`;

const TableTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const TableControls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.875rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.isDarkMode 
      ? theme.shadows.glow.primary 
      : '0 0 0 3px rgba(37, 99, 235, 0.1)'};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
`;

const FilterButton = styled(motion.button)`
  padding: 0.75rem 1rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme, $active }) => $active 
    ? theme.colors.primary 
    : theme.colors.input};
  color: ${({ theme, $active }) => $active 
    ? 'white' 
    : theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.textSecondary};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.text};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: ${({ theme }) => theme.isDarkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.05)'};
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: ${({ sortable }) => sortable ? 'pointer' : 'default'};
  user-select: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme, sortable }) => sortable 
      ? (theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)') 
      : 'transparent'};
  }
`;

const SortIcon = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
`;

const TableBody = styled.tbody``;

const TableRow = styled(motion.tr)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.isDarkMode 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.02)'};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${({ theme }) => theme.colors.text};
  vertical-align: middle;
`;

const StatusBadge = styled(motion.span)`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ theme, status }) => {
    switch (status) {
      case 'completed':
        return theme.isDarkMode ? 'rgba(0, 255, 136, 0.2)' : 'rgba(16, 185, 129, 0.2)';
      case 'pending':
        return theme.isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.2)';
      case 'cancelled':
        return theme.isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      default:
        return theme.isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)';
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'completed':
        return theme.isDarkMode ? '#00ff88' : '#10b981';
      case 'pending':
        return theme.isDarkMode ? '#ffaa00' : '#f59e0b';
      case 'cancelled':
        return theme.isDarkMode ? '#ff0055' : '#ef4444';
      default:
        return theme.isDarkMode ? '#00aaff' : '#3b82f6';
    }
  }};
`;

const ActionButton = styled(motion.button)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.isDarkMode 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.05)'};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const EmptyState = styled(motion.div)`
  padding: 3rem 1.5rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const AnimatedDataTable = ({
  data = [],
  columns = [],
  title = "Data Table",
  searchable = true,
  sortable = true,
  onRowClick,
  className
}) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filteredData, setFilteredData] = useState(data);

  // Filter and sort data
  useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(result);
  }, [data, searchTerm, sortConfig]);

  const handleSort = (key) => {
    if (!sortable) return;
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />;
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.05
      }
    }
  };

  return (
    <TableContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      theme={theme}
    >
      <TableHeader theme={theme}>
        <TableTitle theme={theme}>{title}</TableTitle>
        <TableControls>
          {searchable && (
            <SearchContainer>
              <SearchIcon theme={theme}>
                <FiSearch size={16} />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                theme={theme}
              />
            </SearchContainer>
          )}
          
          <FilterButton
            $active={searchTerm.length > 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            theme={theme}
          >
            <FiFilter size={16} />
            Filter
          </FilterButton>
        </TableControls>
      </TableHeader>

      <TableWrapper>
        <Table>
          <TableHead theme={theme}>
            <tr>
              {columns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  sortable={sortable && column.sortable !== false}
                  onClick={() => handleSort(column.key)}
                  theme={theme}
                >
                  {column.label}
                  {sortable && column.sortable !== false && (
                    <SortIcon>
                      {getSortIcon(column.key)}
                    </SortIcon>
                  )}
                </TableHeaderCell>
              ))}
              <TableHeaderCell theme={theme}>Actions</TableHeaderCell>
            </tr>
          </TableHead>
          
          <TableBody>
            <AnimatePresence mode="wait">
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} theme={theme}>
                    <EmptyState theme={theme}>
                      No data found
                    </EmptyState>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row, index) => (
                  <TableRow
                    key={row.id || index}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    onClick={() => onRowClick?.(row)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                    whileHover={{ scale: 1.01 }}
                    theme={theme}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key} theme={theme}>
                        {column.render ? (
                          column.render(row[column.key], row)
                        ) : column.key === 'status' ? (
                          <StatusBadge
                            status={row[column.key]}
                            theme={theme}
                            whileHover={{ scale: 1.05 }}
                          >
                            {row[column.key]}
                          </StatusBadge>
                        ) : (
                          row[column.key]
                        )}
                      </TableCell>
                    ))}
                    <TableCell theme={theme}>
                      <ActionButton
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        theme={theme}
                      >
                        <FiMoreVertical size={16} />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableWrapper>
    </TableContainer>
  );
};

export default AnimatedDataTable; 