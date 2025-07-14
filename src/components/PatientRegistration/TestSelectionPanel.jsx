import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FaSearch, FaFilter, FaTimes, FaCheck, FaPlus,
  FaFlask, FaDollarSign, FaClock, FaInfoCircle, FaEye,
  FaStar, FaLayerGroup, FaSortAmountDown,
  FaSortAmountUp, FaBookmark,
  FaTh, FaList
} from 'react-icons/fa';
import { useTestCatalog } from '../../contexts/TestContext';
import GlowButton from '../common/GlowButton.jsx';
import GlowCard from '../common/GlowCard.jsx';

const PanelContainer = styled(GlowCard)`
  padding: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`;

const PanelTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const ViewToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.25rem;
`;

const ViewButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: ${({ $isActive }) => $isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: ${({ theme, $isActive }) => $isActive ? theme.colors.text : theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: ${({ theme }) => theme.colors.text};
  }
`;

const AdvancedFilters = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const FilterInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const FilterSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
  
  option {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    background: rgba(255, 255, 255, 0.95);
    color: #333;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 1rem;
  height: 1rem;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const QuickActionButton = styled(GlowButton)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
`;

const TestPanels = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const TestPanel = styled(GlowCard)`
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${({ $isSelected }) => $isSelected ? '#667eea' : 'rgba(255, 255, 255, 0.1)'};
  
  &:hover {
    transform: translateY(-2px);
    border-color: #667eea;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
`;



const PanelCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const PanelName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const PanelPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  color: #10b981;
  font-size: 0.9rem;
`;

const PanelTests = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
`;

const TestTag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
`;

const TestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const TestCard = styled(motion.div)`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 2px solid ${({ $isSelected, theme }) => 
    $isSelected ? '#667eea' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 16px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    border-color: #667eea;
    box-shadow: 
      0 12px 32px rgba(102, 126, 234, 0.3),
      0 8px 16px rgba(255, 255, 255, 0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ $isSelected }) => 
      $isSelected ? 'linear-gradient(90deg, #667eea, #764ba2)' : 'transparent'};
    border-radius: 16px 16px 0 0;
  }
`;

const TestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const TestName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  flex: 1;
`;

const TestPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  color: #10b981;
  font-size: 0.9rem;
`;

const TestDepartment = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.75rem;
`;

const DepartmentBadge = styled.span`
  background: ${({ color }) => color || '#667eea'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const TestDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TestActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.text};
  }
`;

const SelectionIndicator = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $isSelected }) => $isSelected ? '#667eea' : 'rgba(255, 255, 255, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  transition: all 0.3s ease;
`;

const SummarySection = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1.5rem;
`;

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`;

const SummaryTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SummaryStats = styled.div`
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SelectedTestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
`;

const SelectedTestItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 0.9rem;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

const TestSelectionPanel = ({ selectedTests, onTestSelection, onTestRemoval }) => {
  const { t } = useTranslation();
  const { labTests, departmentColors } = useTestCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [recentTests, setRecentTests] = useState([]);

  // Predefined test panels
  const testPanels = useMemo(() => [
    {
      id: 'basic-panel',
      name: 'Basic Health Panel',
      tests: ['Complete Blood Count', 'Comprehensive Metabolic Panel', 'Lipid Panel'],
      price: 150,
      description: 'Essential health screening tests'
    },
    {
      id: 'diabetes-panel',
      name: 'Diabetes Management Panel',
      tests: ['HbA1c', 'Glucose', 'Insulin', 'C-Peptide'],
      price: 120,
      description: 'Comprehensive diabetes monitoring'
    },
    {
      id: 'cardiac-panel',
      name: 'Cardiac Risk Panel',
      tests: ['Troponin', 'BNP', 'CRP', 'Homocysteine'],
      price: 180,
      description: 'Cardiovascular risk assessment'
    },
    {
      id: 'thyroid-panel',
      name: 'Thyroid Function Panel',
      tests: ['TSH', 'T3', 'T4', 'Thyroid Antibodies'],
      price: 140,
      description: 'Complete thyroid evaluation'
    }
  ], []);

  // Filter tests based on search and filters
  const filteredTests = useMemo(() => {
    let filtered = labTests.filter(test => {
      const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || test.department === selectedDepartment;
      const matchesPrice = (!priceRange.min || test.price >= parseFloat(priceRange.min)) &&
                          (!priceRange.max || test.price <= parseFloat(priceRange.max));
      return matchesSearch && matchesDepartment && matchesPrice;
    });

    // Sort tests
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'department':
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [labTests, searchTerm, selectedDepartment, priceRange, sortBy, sortOrder]);

  // Group tests by department
  const groupedTests = useMemo(() => {
    return filteredTests.reduce((acc, test) => {
      const dept = test.department || 'General';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(test);
      return acc;
    }, {});
  }, [filteredTests]);

  // Calculate summary
  const summary = useMemo(() => {
    const selectedTestObjects = labTests.filter(test => selectedTests.includes(test.name));
    return {
      count: selectedTests.length,
      totalPrice: selectedTestObjects.reduce((sum, test) => sum + (test.price || 0), 0),
      departments: [...new Set(selectedTestObjects.map(test => test.department))]
    };
  }, [selectedTests, labTests]);

  const handleTestToggle = (testName) => {
    if (selectedTests.includes(testName)) {
      onTestRemoval(testName);
    } else {
      onTestSelection(testName);
      // Add to recent tests
      setRecentTests(prev => {
        const newRecent = [testName, ...prev.filter(t => t !== testName)].slice(0, 10);
        return newRecent;
      });
    }
  };

  const handlePanelSelection = (panel) => {
    panel.tests.forEach(testName => {
      if (!selectedTests.includes(testName)) {
        onTestSelection(testName);
      }
    });
  };

  const handleFavoriteToggle = (testName) => {
    setFavorites(prev => {
      if (prev.includes(testName)) {
        return prev.filter(t => t !== testName);
      } else {
        return [...prev, testName];
      }
    });
  };

  const departments = useMemo(() => {
    const depts = [...new Set(labTests.map(test => test.department))];
    return depts.sort();
  }, [labTests]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
    setSortOrder('asc');
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>
          <FaFlask /> Advanced Test Selection
        </PanelTitle>
        <HeaderActions>
          <ViewToggle>
            <ViewButton
              $isActive={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <FaTh />
            </ViewButton>
            <ViewButton
              $isActive={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <FaList />
            </ViewButton>
          </ViewToggle>
          <GlowButton
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FaFilter /> {showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </GlowButton>
        </HeaderActions>
      </PanelHeader>

      <SearchContainer>
        <SearchIcon />
        <SearchInput
          type="text"
          placeholder="Search tests by name, department, or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      <QuickActions>
        <QuickActionButton
          onClick={() => setSelectedDepartment('all')}
          $variant={selectedDepartment === 'all' ? 'primary' : 'secondary'}
        >
          <FaLayerGroup /> All Tests
        </QuickActionButton>
        <QuickActionButton
          onClick={() => setSelectedDepartment('Hematology')}
          $variant={selectedDepartment === 'Hematology' ? 'primary' : 'secondary'}
        >
          <FaFlask /> Hematology
        </QuickActionButton>
        <QuickActionButton
          onClick={() => setSelectedDepartment('Chemistry')}
          $variant={selectedDepartment === 'Chemistry' ? 'primary' : 'secondary'}
        >
          <FaFlask /> Chemistry
        </QuickActionButton>
        <QuickActionButton
          onClick={() => setSelectedDepartment('Immunology')}
          $variant={selectedDepartment === 'Immunology' ? 'primary' : 'secondary'}
        >
          <FaFlask /> Immunology
        </QuickActionButton>
        <QuickActionButton
          onClick={clearFilters}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FaTimes /> Clear Filters
        </QuickActionButton>
      </QuickActions>

      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <AdvancedFilters>
              <FilterGrid>
                <FilterGroup>
                  <FilterLabel>Department</FilterLabel>
                  <FilterSelect
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </FilterSelect>
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>Min Price</FilterLabel>
                  <FilterInput
                    type="number"
                    placeholder="Min price"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  />
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>Max Price</FilterLabel>
                  <FilterInput
                    type="number"
                    placeholder="Max price"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  />
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>Sort By</FilterLabel>
                  <FilterSelect
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="department">Department</option>
                  </FilterSelect>
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>Sort Order</FilterLabel>
                  <FilterSelect
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </FilterSelect>
                </FilterGroup>
              </FilterGrid>
            </AdvancedFilters>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Panels Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaLayerGroup /> Popular Test Panels
        </h4>
        <TestPanels>
          {testPanels.map((panel) => (
            <TestPanel
              key={panel.id}
              onClick={() => handlePanelSelection(panel)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PanelCardHeader>
                <PanelName>{panel.name}</PanelName>
                <PanelPrice>
                  <FaDollarSign />
                  {panel.price}
                </PanelPrice>
              </PanelCardHeader>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: theme.colors.textSecondary }}>
                {panel.description}
              </p>
              <PanelTests>
                {panel.tests.slice(0, 3).map(test => (
                  <TestTag key={test}>{test}</TestTag>
                ))}
                {panel.tests.length > 3 && (
                  <TestTag>+{panel.tests.length - 3} more</TestTag>
                )}
              </PanelTests>
            </TestPanel>
          ))}
        </TestPanels>
      </div>

      {/* Individual Tests Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaFlask /> Individual Tests ({filteredTests.length})
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: theme.colors.textSecondary }}>
              {sortBy} ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
            </span>
            <ActionButton onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
              {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </ActionButton>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <TestsGrid>
            {Object.entries(groupedTests).map(([deptName, testsInDept]) => (
              <div key={deptName}>
                <motion.h5
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    margin: '1rem 0 0.75rem 0',
                    paddingBottom: '0.5rem',
                    borderBottom: `2px solid ${departmentColors[deptName] || '#667eea'}`,
                    color: departmentColors[deptName] || '#667eea',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  {deptName} ({testsInDept.length})
                </motion.h5>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {testsInDept.map((test, index) => (
                    <TestCard
                      key={test.id}
                      $isSelected={selectedTests.includes(test.name)}
                      onClick={() => handleTestToggle(test.name)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <SelectionIndicator $isSelected={selectedTests.includes(test.name)}>
                        {selectedTests.includes(test.name) ? <FaCheck /> : <FaPlus />}
                      </SelectionIndicator>
                      
                      <TestHeader>
                        <TestName>{test.name}</TestName>
                        <TestPrice>
                          <FaDollarSign />
                          {test.price || 0}
                        </TestPrice>
                      </TestHeader>
                      
                      <TestDepartment>
                        <DepartmentBadge color={departmentColors[test.department]}>
                          {test.department}
                        </DepartmentBadge>
                        <span>•</span>
                        <span>{test.code || 'N/A'}</span>
                      </TestDepartment>
                      
                      <TestDetails>
                        {test.description && (
                          <DetailItem>
                            <FaInfoCircle />
                            {test.description}
                          </DetailItem>
                        )}
                        {test.turnaroundTime && (
                          <DetailItem>
                            <FaClock />
                            Turnaround: {test.turnaroundTime}
                          </DetailItem>
                        )}
                      </TestDetails>
                      
                      <TestActions>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <ActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteToggle(test.name);
                            }}
                            style={{ color: favorites.includes(test.name) ? '#fbbf24' : undefined }}
                          >
                            <FaStar />
                          </ActionButton>
                          <ActionButton onClick={(e) => e.stopPropagation()}>
                            <FaEye />
                          </ActionButton>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <ActionButton onClick={(e) => e.stopPropagation()}>
                            <FaBookmark />
                          </ActionButton>
                        </div>
                      </TestActions>
                    </TestCard>
                  ))}
                </div>
              </div>
            ))}
          </TestsGrid>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(groupedTests).map(([deptName, testsInDept]) => (
              <div key={deptName}>
                <motion.h5
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    margin: '1rem 0 0.75rem 0',
                    paddingBottom: '0.5rem',
                    borderBottom: `2px solid ${departmentColors[deptName] || '#667eea'}`,
                    color: departmentColors[deptName] || '#667eea',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  {deptName} ({testsInDept.length})
                </motion.h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {testsInDept.map((test, index) => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `2px solid ${selectedTests.includes(test.name) ? '#667eea' : 'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleTestToggle(test.name)}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%',
                          border: `2px solid ${selectedTests.includes(test.name) ? '#667eea' : 'rgba(255, 255, 255, 0.3)'}`,
                          background: selectedTests.includes(test.name) ? '#667eea' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.75rem'
                        }}>
                          {selectedTests.includes(test.name) && <FaCheck />}
                        </div>
                        <div>
                                                     <div style={{ fontWeight: '600', color: 'inherit' }}>
                             {test.name}
                           </div>
                           <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                             {test.department} • {test.code || 'N/A'}
                           </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#10b981' }}>
                          ${test.price || 0}
                        </div>
                        <ActionButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteToggle(test.name);
                          }}
                          style={{ color: favorites.includes(test.name) ? '#fbbf24' : undefined }}
                        >
                          <FaStar />
                        </ActionButton>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTests.length > 0 && (
        <SummarySection>
          <SummaryHeader>
            <SummaryTitle>
              <FaEye /> Selected Tests Summary
            </SummaryTitle>
            <SummaryStats>
              <span>{summary.count} tests selected</span>
              <span>${summary.totalPrice.toFixed(2)} total</span>
              <span>{summary.departments.length} departments</span>
            </SummaryStats>
          </SummaryHeader>
          
          <SelectedTestsList>
            {selectedTests.map(testName => {
              const test = labTests.find(t => t.name === testName);
              return (
                <SelectedTestItem key={testName}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DepartmentBadge color={departmentColors[test?.department]}>
                      {test?.department}
                    </DepartmentBadge>
                    <span>{testName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: '600' }}>
                      ${test?.price || 0}
                    </span>
                    <RemoveButton onClick={() => onTestRemoval(testName)}>
                      <FaTimes />
                    </RemoveButton>
                  </div>
                </SelectedTestItem>
              );
            })}
          </SelectedTestsList>
        </SummarySection>
      )}
    </PanelContainer>
  );
};

export default TestSelectionPanel; 