import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTestCatalog } from '../../contexts/TestContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaSearch, FaTimes, FaCheck, FaPlus, FaMinus, FaFlask, 
  FaThermometerHalf, FaVial, FaMicroscope, FaDollarSign, 
  FaClock, FaInfoCircle, FaEye, FaStar, FaBookmark, 
  FaSortAmountUp, FaSortAmountDown, FaTh, FaList, 
  FaLayerGroup, FaCheckSquare, FaRegSquare, FaShoppingCart,
  FaFilter, FaChevronDown, FaChevronUp, FaHeart, FaBrain,
  FaLungs, FaBone, FaTooth, FaBaby, FaUserMd, FaSyringe,
  FaDna, FaVirus, FaBacteria, FaAllergies, FaPills,
  FaShieldAlt, FaTint, FaStethoscope, FaHospital, FaNotesMedical
} from 'react-icons/fa';
import { create } from 'zustand';
import GlowCard from '../common/GlowCard';
import GlowButton from '../common/GlowButton';

// Zustand store for test selection
export const useTestSelectionStore = create((set) => ({
  selectedTestIds: [],
  toggleTestSelection: (testId) => set((state) => {
    const exists = state.selectedTestIds.includes(testId);
    return {
      selectedTestIds: exists
        ? state.selectedTestIds.filter((id) => id !== testId)
        : [...state.selectedTestIds, testId],
    };
  }),
  clearSelection: () => set({ selectedTestIds: [] }),
}));

// Department icon mapping
const getDepartmentIcon = (department) => {
  const iconMap = {
    'Hematology': FaTint,
    'Chemistry': FaFlask,
    'Immunology': FaShieldAlt,
    'Microbiology': FaBacteria,
    'Molecular': FaDna,
    'Endocrinology': FaBrain,
    'Cardiology': FaHeart,
    'Pulmonology': FaLungs,
    'Rheumatology': FaBone,
    'Dental': FaTooth,
    'Pediatrics': FaBaby,
    'Oncology': FaUserMd,
    'Infectious Disease': FaVirus,
    'Allergy': FaAllergies,
    'Toxicology': FaPills,
    'General': FaStethoscope
  };
  return iconMap[department] || FaNotesMedical;
};

// Department color mapping
const getDepartmentColor = (department) => {
  const colorMap = {
    'Hematology': '#dc3545',
    'Chemistry': '#ffc107',
    'Immunology': '#007bff',
    'Microbiology': '#6f42c1',
    'Molecular': '#20c997',
    'Endocrinology': '#fd7e14',
    'Cardiology': '#e83e8c',
    'Pulmonology': '#17a2b8',
    'Rheumatology': '#6c757d',
    'Dental': '#28a745',
    'Pediatrics': '#ff69b4',
    'Oncology': '#8b4513',
    'Infectious Disease': '#dc143c',
    'Allergy': '#ff8c00',
    'Toxicology': '#9932cc',
    'General': '#3b82f6'
  };
  return colorMap[department] || '#3b82f6';
};

// Test type indicators
const getTestTypeIcon = (testName) => {
  const name = testName.toLowerCase();
  if (name.includes('panel') || name.includes('profile')) return FaLayerGroup;
  if (name.includes('culture') || name.includes('sensitivity')) return FaBacteria;
  if (name.includes('antibody') || name.includes('antigen')) return FaShieldAlt;
  if (name.includes('hormone') || name.includes('thyroid')) return FaBrain;
  if (name.includes('cardiac') || name.includes('troponin')) return FaHeart;
  if (name.includes('glucose') || name.includes('sugar')) return FaThermometerHalf;
  if (name.includes('urine') || name.includes('urinalysis')) return FaTint;
  if (name.includes('blood') || name.includes('cbc')) return FaTint;
  if (name.includes('pcr') || name.includes('molecular')) return FaDna;
  return FaVial;
};

// New Modern Container
const ModernContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
  padding: 1rem;
`;

// Search Section
const SearchSection = styled.div`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.12) 0%, 
    rgba(255, 255, 255, 0.08) 25%, 
    rgba(255, 255, 255, 0.06) 50%, 
    rgba(255, 255, 255, 0.04) 75%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: ${({ theme }) => theme?.colors?.text || '#ffffff'};
  font-size: 1.1rem;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    background: rgba(255, 255, 255, 0.15);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2rem;
`;

// Category Tabs
const CategoryTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const CategoryTab = styled.button.attrs({ type: 'button' })`
  padding: 0.5rem 1rem;
  background: ${({ $isActive }) => $isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${({ $isActive }) => $isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  color: ${({ $isActive }) => $isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.8)'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover {
    background: rgba(59, 130, 246, 0.15);
    border-color: #3b82f6;
  }
`;

// Main Content Area
const ContentArea = styled.div`
  display: flex;
  gap: 1rem;
  flex: 1;
  min-height: 0;
`;

// Tests List
const TestsList = styled.div`
  flex: 1;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.12) 0%, 
    rgba(255, 255, 255, 0.08) 25%, 
    rgba(255, 255, 255, 0.06) 50%, 
    rgba(255, 255, 255, 0.04) 75%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem;
  overflow-y: auto;
  backdrop-filter: blur(20px);
`;

const DepartmentSection = styled.div`
  margin-bottom: 2rem;
`;

const DepartmentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.12) 0%, 
    rgba(255, 255, 255, 0.08) 25%, 
    rgba(255, 255, 255, 0.06) 50%, 
    rgba(255, 255, 255, 0.04) 75%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.18) 0%, 
      rgba(255, 255, 255, 0.12) 25%, 
      rgba(255, 255, 255, 0.08) 50%, 
      rgba(255, 255, 255, 0.06) 75%, 
      rgba(255, 255, 255, 0.08) 100%);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const DepartmentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const DepartmentIcon = styled.div.withConfig({ shouldForwardProp: (prop) => prop !== '$color' })`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => `linear-gradient(135deg, ${$color}20, ${$color}10)`};
  border: 2px solid ${({ $color }) => `${$color}40`};
  color: ${({ $color }) => $color};
  font-size: 1.1rem;
`;

const DepartmentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DepartmentName = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.text || '#ffffff'};
`;

const DepartmentStats = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  gap: 1rem;
`;

const DepartmentToggle = styled.div`
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.3s ease;
  transform: ${({ $isExpanded }) => $isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const SubsectionGroup = styled.div`
  margin-bottom: 1.5rem;
  padding-left: 1rem;
`;

const SubsectionHeader = styled.div.withConfig({ shouldForwardProp: (prop) => prop !== '$color' })`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 0.75rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${({ $color }) => `linear-gradient(180deg, ${$color}, ${$color}80)`};
    border-radius: 0 2px 2px 0;
  }
`;

const SubsectionIcon = styled.div.withConfig({ shouldForwardProp: (prop) => prop !== '$color' })`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
  font-size: 0.9rem;
`;

const SubsectionInfo = styled.div`
  flex: 1;
`;

const SubsectionName = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text || '#ffffff'};
`;

const SubsectionCount = styled.span`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
`;

const TestsGrid = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const TestItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $deptColor }) => `linear-gradient(90deg, ${$deptColor}, ${$deptColor}80)`};
    opacity: ${({ $isSelected }) => $isSelected ? 1 : 0.3};
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  ${({ $isSelected }) => $isSelected && `
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
    border-color: #3b82f6;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
  `}
`;

const TestCheckbox = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid ${({ $isSelected }) => $isSelected ? '#3b82f6' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $isSelected }) => $isSelected ? '#3b82f6' : 'transparent'};
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
  }
`;

const TestIcon = styled.div.withConfig({ shouldForwardProp: (prop) => prop !== '$deptColor' })`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $deptColor }) => `linear-gradient(135deg, ${$deptColor}20, ${$deptColor}10)`};
  border: 2px solid ${({ $deptColor }) => `${$deptColor}40`};
  color: ${({ $deptColor }) => $deptColor};
  font-size: 1.2rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 15px ${({ $deptColor }) => `${$deptColor}30`};
  }
`;

const TestInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TestName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text || '#ffffff'};
  margin-bottom: 0.5rem;
  font-size: 1rem;
  line-height: 1.3;
`;

const TestDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
`;

const TestBadge = styled.span.withConfig({ shouldForwardProp: (prop) => prop !== '$color' })`
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid ${({ $color }) => `${$color}40`};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const TestDescription = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
  font-style: italic;
`;

const TestPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-weight: 700;
  font-size: 1.1rem;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  flex-shrink: 0;
`;



// Selection Cart
const SelectionCart = styled.div`
  width: 320px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.12) 0%, 
    rgba(255, 255, 255, 0.08) 25%, 
    rgba(255, 255, 255, 0.06) 50%, 
    rgba(255, 255, 255, 0.04) 75%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem;
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
`;

const CartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const CartTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme?.colors?.text || '#ffffff'};
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CartItems = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const CartItemName = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme?.colors?.text || '#ffffff'};
  font-weight: 500;
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

const CartFooter = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
`;

const CartSummary = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text || '#ffffff'};
`;

const ConfirmationModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(20, 20, 30, 0.65);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ConfirmationModalContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface || '#222'};
  color: ${({ theme }) => theme.colors.text || '#fff'};
  border-radius: 18px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.25);
  min-width: 350px;
  max-width: 95vw;
  max-height: 90vh;
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const ModalTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const ModalList = styled.div`
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
`;

const ModalListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  font-size: 1rem;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ModalButton = styled(GlowButton)`
  min-width: 120px;
  font-weight: 600;
`;

const TestSelectionPanel = ({ selectedTests, onTestSelection, onTestRemoval, children }) => {
  const { labTests, departmentColors } = useTestCatalog();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedDepartments, setExpandedDepartments] = useState(new Set());
  const { theme } = useTheme();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Zustand selection state
  const selectedTestIds = useTestSelectionStore((s) => s.selectedTestIds);
  const toggleTestSelection = useTestSelectionStore((s) => s.toggleTestSelection);
  const clearSelection = useTestSelectionStore((s) => s.clearSelection);

  // Get unique departments for tabs
  const departments = useMemo(() => {
    const deptSet = new Set(labTests.map(test => test.department));
    return Array.from(deptSet).sort();
  }, [labTests]);

  // Filter tests based on search and category
  const filteredTests = useMemo(() => {
    return labTests.filter(test => {
      const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (test.subsection && test.subsection.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || test.department === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [labTests, searchTerm, selectedCategory]);

  // Group tests by department and subsection
  const groupedTests = useMemo(() => {
    return filteredTests.reduce((acc, test) => {
      const dept = test.department || 'General';
      if (!acc[dept]) acc[dept] = {};
      
      const subsection = test.subsection || 'General Tests';
      if (!acc[dept][subsection]) acc[dept][subsection] = [];
      
      acc[dept][subsection].push(test);
      return acc;
    }, {});
  }, [filteredTests]);

  // Calculate cart summary
  const cartSummary = useMemo(() => {
    const selectedTests = labTests.filter(test => selectedTestIds.includes(test.name));
    return {
      count: selectedTests.length,
      totalPrice: selectedTests.reduce((sum, test) => sum + (test.price || 0), 0),
      departments: [...new Set(selectedTests.map(test => test.department))]
    };
  }, [selectedTestIds, labTests]);

  const toggleDepartment = (department) => {
    setExpandedDepartments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(department)) {
        newSet.delete(department);
      } else {
        newSet.add(department);
      }
      return newSet;
    });
  };

  const getSubsectionIcon = (subsection) => {
    const name = subsection.toLowerCase();
    if (name.includes('blood') || name.includes('cbc')) return FaTint;
    if (name.includes('sugar') || name.includes('glucose')) return FaThermometerHalf;
    if (name.includes('hormone') || name.includes('thyroid')) return FaBrain;
    if (name.includes('cardiac') || name.includes('heart')) return FaHeart;
    if (name.includes('urine') || name.includes('urinalysis')) return FaTint;
    if (name.includes('culture') || name.includes('sensitivity')) return FaBacteria;
    if (name.includes('antibody') || name.includes('antigen')) return FaShieldAlt;
    if (name.includes('panel') || name.includes('profile')) return FaLayerGroup;
    if (name.includes('molecular') || name.includes('pcr')) return FaDna;
    if (name.includes('allergy') || name.includes('sensitivity')) return FaAllergies;
    return FaVial;
  };

  return (
    <ModernContainer>
      <SearchSection>
        <SearchBar>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search tests by name, department, or subsection..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
        
        <CategoryTabs>
          <CategoryTab
            $isActive={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          >
            All Tests ({labTests.length})
          </CategoryTab>
          {departments.map(dept => (
            <CategoryTab
              key={dept}
              $isActive={selectedCategory === dept}
              onClick={() => setSelectedCategory(dept)}
            >
              {dept} ({labTests.filter(t => t.department === dept).length})
            </CategoryTab>
          ))}
        </CategoryTabs>
      </SearchSection>

      <ContentArea>
        <TestsList>
          {Object.entries(groupedTests).map(([department, subsections]) => {
            const DeptIcon = getDepartmentIcon(department);
            const deptColor = getDepartmentColor(department);
            const isExpanded = expandedDepartments.has(department);
            const totalTests = Object.values(subsections).flat().length;
            const totalSubsections = Object.keys(subsections).length;
            
            return (
              <DepartmentSection key={department}>
                <DepartmentHeader onClick={() => toggleDepartment(department)}>
                  <DepartmentInfo>
                    <DepartmentIcon $color={deptColor}>
                      {(() => { const { $color, ...iconProps } = { color: deptColor }; return <DeptIcon {...iconProps} />; })()}
                    </DepartmentIcon>
                    <DepartmentDetails>
                      <DepartmentName>{department}</DepartmentName>
                      <DepartmentStats>
                        <span>{totalTests} tests</span>
                        <span>•</span>
                        <span>{totalSubsections} subsections</span>
                      </DepartmentStats>
                    </DepartmentDetails>
                  </DepartmentInfo>
                  <DepartmentToggle $isExpanded={isExpanded}>
                    <FaChevronDown />
                  </DepartmentToggle>
                </DepartmentHeader>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      {Object.entries(subsections).map(([subsection, tests]) => {
                        const SubsectionIcon = getSubsectionIcon(subsection);
                        const subsectionColor = subsection === 'General Tests' ? deptColor : '#8b5cf6';
                        
                        return (
                          <SubsectionGroup key={subsection}>
                            <SubsectionHeader $color={subsectionColor}>
                              <SubsectionIcon $color={subsectionColor}>
                                {(() => { const { $color, ...iconProps } = { color: subsectionColor }; return <SubsectionIcon {...iconProps} />; })()}
                              </SubsectionIcon>
                              <SubsectionInfo>
                                <SubsectionName>
                                  {subsection}
                                  <SubsectionCount>{tests.length} tests</SubsectionCount>
                                </SubsectionName>
                              </SubsectionInfo>
                            </SubsectionHeader>
                            
                            <TestsGrid>
                              {tests.map(test => {
                                const TestTypeIcon = getTestTypeIcon(test.name);
                                const isSelected = selectedTestIds.includes(test.name);
                                
                                return (
                                  <TestItem
                                    key={test.name}
                                    $isSelected={isSelected}
                                    $deptColor={deptColor}
                                    onClick={() => toggleTestSelection(test.name)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                  >
                                    <TestCheckbox $isSelected={isSelected}>
                                      {isSelected && <FaCheck size={14} color="white" />}
                                    </TestCheckbox>
                                    
                                    <TestIcon $deptColor={deptColor}>
                                      {(() => { const { $deptColor, ...iconProps } = { color: deptColor }; return <DeptIcon {...iconProps} />; })()}
                                    </TestIcon>
                                    
                                    <TestInfo>
                                      <TestName>{test.name}</TestName>
                                      <TestDetails>
                                        <TestBadge $color={deptColor}>
                                          {(() => { const { $color, ...iconProps } = { size: 10, color: deptColor }; return <DeptIcon {...iconProps} />; })()}
                                          {test.department}
                                        </TestBadge>
                                        {test.unit && (
                                          <TestBadge $color="#06b6d4">
                                            {test.unit}
                                          </TestBadge>
                                        )}
                                      </TestDetails>
                                      {test.description && (
                                        <TestDescription>{test.description}</TestDescription>
                                      )}
                                    </TestInfo>
                                    
                                    <TestPrice>
                                      <FaDollarSign />
                                      {test.price || 0}
                                    </TestPrice>
                                  </TestItem>
                                );
                              })}
                            </TestsGrid>
                          </SubsectionGroup>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </DepartmentSection>
            );
          })}
        </TestsList>

        <SelectionCart>
          <CartHeader>
            <CartTitle>
              <FaShoppingCart />
              Selected Tests
            </CartTitle>
            {selectedTestIds.length > 0 && (
              <button
                onClick={clearSelection}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Clear All
              </button>
            )}
          </CartHeader>

          <CartItems>
            {selectedTestIds.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: 'rgba(255, 255, 255, 0.6)', 
                padding: '2rem 0' 
              }}>
                <FaShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <div>No tests selected</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Search and select tests to get started
                </div>
              </div>
            ) : (
              selectedTestIds.map(testName => {
                const test = labTests.find(t => t.name === testName);
                const deptColor = test ? getDepartmentColor(test.department) : '#3b82f6';
                return (
                  <CartItem key={testName}>
                    <CartItemName>{testName}</CartItemName>
                    <RemoveButton onClick={() => toggleTestSelection(testName)}>
                      <FaTimes size={12} />
                    </RemoveButton>
                  </CartItem>
                );
              })
            )}
          </CartItems>

          <CartFooter>
            <CartSummary>
              <span>{cartSummary.count} tests</span>
              <span>${cartSummary.totalPrice.toFixed(2)}</span>
            </CartSummary>
            {/* Removed Proceed to Confirmation button */}
          </CartFooter>
          {/* Render custom action button below the cart summary */}
          {children && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
              {children}
            </div>
          )}
        </SelectionCart>
      </ContentArea>
      <AnimatePresence>
        {showConfirmation && (
          <ConfirmationModalBackdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmation(false)}
          >
            <ConfirmationModalContainer
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <ModalTitle>Confirm Test Selection</ModalTitle>
              <ModalList>
                {selectedTestIds.map(testName => {
                  const test = labTests.find(t => t.name === testName);
                  return (
                    <ModalListItem key={testName}>
                      <span>{testName}</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>${test?.price || 0}</span>
                    </ModalListItem>
                  );
                })}
              </ModalList>
              <ModalActions>
                <ModalButton onClick={() => {
                  setShowConfirmation(false);
                  setConfirmed(true);
                  setTimeout(() => setConfirmed(false), 2000);
                }}>
                  Confirm
                </ModalButton>
                <ModalButton onClick={() => setShowConfirmation(false)} $variant="secondary">
                  Cancel
                </ModalButton>
              </ModalActions>
            </ConfirmationModalContainer>
          </ConfirmationModalBackdrop>
        )}
      </AnimatePresence>
      {confirmed && (
        <div style={{ position: 'fixed', top: 30, left: 0, right: 0, zIndex: 2000, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ background: '#10b981', color: 'white', padding: '1rem 2rem', borderRadius: 12, fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 4px 24px #10b98155' }}
          >
            Selection Confirmed!
          </motion.div>
        </div>
      )}
    </ModernContainer>
  );
};

export default TestSelectionPanel; 