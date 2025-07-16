import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTestCatalog } from '../../contexts/TestContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FaSearch, FaFilter, FaTimes, FaCheck, FaPlus, FaMinus, FaFlask, FaThermometerHalf, FaVial, FaMicroscope, FaDollarSign, FaClock, FaInfoCircle, FaEye, FaStar, FaBookmark, FaSortAmountUp, FaSortAmountDown, FaTh, FaList, FaLayerGroup } from 'react-icons/fa';
import GlowCard from '../common/GlowCard';
import GlowButton from '../common/GlowButton';

const PanelContainer = styled(GlowCard)`
  min-height: 500px;
  contain: layout;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
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
  font-weight: 600;
  color: inherit;
`;

const FilterInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme?.colors?.text || '#333333'};
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
  color: ${({ theme }) => theme?.colors?.text || '#333333'};
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
  width: 100%;
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
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
  color: ${({ theme }) => theme?.colors?.text || '#333333'};
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
    color: ${({ theme }) => theme?.colors?.textSecondary || 'rgba(255, 255, 255, 0.6)'};
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme?.colors?.textSecondary || 'rgba(255, 255, 255, 0.6)'};
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

const DepartmentQuickActionButton = styled(GlowButton)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
  background: ${({ color, $isActive }) =>
    $isActive
      ? `linear-gradient(135deg, ${color}, ${color}cc)`
      : color};
  color: #fff;
  border: ${({ $isActive }) => ($isActive ? '2px solid #fff' : 'none')};
  box-shadow: ${({ $isActive }) =>
    $isActive ? '0 0 0 2px rgba(0,0,0,0.08)' : 'none'};
  transition: all 0.2s;
  &:hover {
    filter: brightness(1.08);
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  }
`;

const TestPanels = styled.div`
  min-height: 300px;
  contain: layout;
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
  min-height: 300px;
  contain: layout;
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
  const { labTests, departmentColors } = useTestCatalog();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [showFavorites, setShowFavorites] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [favorites, setFavorites] = useState([]);
  const { theme } = useTheme();

  // Add fallback for departmentColors
  const safeDepartmentColors = typeof departmentColors !== 'undefined' ? departmentColors : { General: '#667eea' };

  // Get unique departments
  const departments = useMemo(() => {
    const deptSet = new Set(labTests.map(test => test.department));
    return Array.from(deptSet).sort();
  }, [labTests]);

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

  // Filter and sort tests
  const filteredTests = useMemo(() => {
    let filtered = labTests.filter(test => {
      const name = test.name || '';
      const department = test.department || 'General';
      const price = typeof test.price === 'number' ? test.price : 0;
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || department === selectedDepartment;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      return matchesSearch && matchesDepartment && matchesPrice;
    });

    // Sort tests
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'price':
          aValue = typeof a.price === 'number' ? a.price : 0;
          bValue = typeof b.price === 'number' ? b.price : 0;
          break;
        case 'department':
          aValue = a.department || 'General';
          bValue = b.department || 'General';
          break;
        case 'name':
        default:
          aValue = a.name;
          bValue = b.name;
          break;
      }
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    return filtered;
  }, [labTests, searchTerm, selectedDepartment, sortBy, sortOrder, priceRange]);

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
      // setRecentTests(prev => { // This line was removed from the new_code, so it's removed here.
      //   const newRecent = [testName, ...prev.filter(t => t !== testName)].slice(0, 10);
      //   return newRecent;
      // });
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
    setPriceRange([0, 1000]);
    setSortBy('name');
    setSortOrder('asc');
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>
          <FaFlask /> Test Selection
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
            onClick={() => setShowFavorites(!showFavorites)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FaFilter /> {showFavorites ? 'Hide' : 'Show'} Filters
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
          <FaLayerGroup /> <span>All Tests</span>
        </QuickActionButton>
        <DepartmentQuickActionButton
          onClick={() => setSelectedDepartment('Hematology')}
          color={safeDepartmentColors['Hematology'] || '#dc3545'}
          $isActive={selectedDepartment === 'Hematology'}
        >
          <FaFlask /> <span>Hematology</span>
        </DepartmentQuickActionButton>
        <DepartmentQuickActionButton
          onClick={() => setSelectedDepartment('Chemistry')}
          color={safeDepartmentColors['Chemistry'] || '#ffc107'}
          $isActive={selectedDepartment === 'Chemistry'}
        >
          <FaFlask /> <span>Chemistry</span>
        </DepartmentQuickActionButton>
        <DepartmentQuickActionButton
          onClick={() => setSelectedDepartment('Immunology')}
          color={safeDepartmentColors['Immunology'] || '#007bff'}
          $isActive={selectedDepartment === 'Immunology'}
        >
          <FaFlask /> <span>Immunology</span>
        </DepartmentQuickActionButton>
        <QuickActionButton
          onClick={clearFilters}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FaTimes /> <span>Clear Filters</span>
        </QuickActionButton>
      </QuickActions>

      <AnimatePresence>
        {showFavorites && (
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
                    value={selectedDepartment ?? ''}
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
                    value={priceRange[0] ?? 0}
                    onChange={(e) => setPriceRange(prev => [parseFloat(e.target.value) || 0, prev[1]])}
                  />
                </FilterGroup>
                <FilterGroup>
                  <FilterLabel>Max Price</FilterLabel>
                  <FilterInput
                    type="number"
                    placeholder="Max price"
                    value={priceRange[1] ?? 0}
                    onChange={(e) => setPriceRange(prev => [prev[0], parseFloat(e.target.value) || 1000])}
                  />
                </FilterGroup>
                <FilterGroup>
                  <FilterLabel>Sort By</FilterLabel>
                  <FilterSelect
                    value={sortBy ?? ''}
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
                    value={sortOrder ?? ''}
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

      {/* Unified Test & Panel List */}
      <div>
        <h4 style={{ margin: '0 0 1rem 0', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaLayerGroup /> Available Tests & Panels
        </h4>
        {/* Debug: Show number of labTests loaded */}
        <div style={{ color: '#10b981', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
          {`Loaded tests: ${labTests.length}`}
        </div>
        <TestPanels>
          {/* Show panels first */}
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
          {/* Show all individual tests */}
          {filteredTests.length === 0 ? (
            <div style={{ gridColumn: '1/-1', color: '#ef4444', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center', padding: '2rem 0' }}>
              No individual tests found. Please check your test catalog or filters.
            </div>
          ) : (
            filteredTests.map((test) => (
              <TestPanel
                key={test.name}
                onClick={() => handleTestToggle(test.name)}
                $isSelected={selectedTests.includes(test.name)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PanelCardHeader>
                  <PanelName>{test.name}</PanelName>
                  <PanelPrice>
                    <FaDollarSign />
                    {test.price}
                  </PanelPrice>
                </PanelCardHeader>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: theme.colors.textSecondary }}>
                  {test.description}
                </p>
                <PanelTests>
                  <TestTag>{test.department}</TestTag>
                </PanelTests>
              </TestPanel>
            ))
          )}
        </TestPanels>
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
                    <DepartmentBadge color={safeDepartmentColors[test?.department]}>
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