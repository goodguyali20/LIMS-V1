import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FlaskConical,
  Edit,
  Trash2,
  Search as SearchIcon,
  Plus,
  Save,
  RefreshCw,
  AlertCircle,
  Building2,
  FileText,
  Ruler,
  Target
} from 'lucide-react';
import { GlowCard, GlowButton, AnimatedModal } from '../../components/common';
import { useTestCatalog } from '../../contexts/TestContext';
import { showFlashMessage } from '../../contexts/NotificationContext';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
  margin: 0;
`;

const SearchAndActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all 0.3s ease;
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const StyledSearchIcon = styled(SearchIcon)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 1.25rem;
  height: 1.25rem;
`;

const TestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const TestCard = styled(GlowCard)`
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const TestHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  justify-content: space-between;
`;

const TestInfo = styled.div`
  flex: 1;
`;

const TestName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
`;

const TestDepartment = styled.div`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const TestDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TestActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const SpecialBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.5rem;
`;

const ModalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  flex: 1;
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 50px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.2);
    transition: 0.3s;
    border-radius: 24px;
  }
  
  span:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
  
  input:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  
  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LoadingSkeleton = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  animation: pulse 1.5s infinite alternate;
  
  @keyframes pulse {
    from { opacity: 0.6; }
    to { opacity: 1; }
  }
`;

const TestCatalog = () => {
  const { t } = useTranslation();
  const { labTests, addTest, updateTest, deleteTest, loading: testsLoading } = useTestCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [testFormState, setTestFormState] = useState({
    name: '',
    department: '',
    unit: '',
    referenceRange: '',
    requiresSpecialSlip: false
  });

  const filteredTests = useMemo(() => {
    if (!searchTerm) return labTests;
    return labTests.filter(test =>
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.unit.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [labTests, searchTerm]);

  const handleOpenModal = (test = null) => {
    setEditingTest(test);
    if (test) {
      setTestFormState({
        name: test.name || '',
        department: test.department || '',
        unit: test.unit || '',
        referenceRange: test.referenceRange || '',
        requiresSpecialSlip: test.requiresSpecialSlip || false
      });
    } else {
      setTestFormState({
        name: '',
        department: '',
        unit: '',
        referenceRange: '',
        requiresSpecialSlip: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTest(null);
    setIsModalOpen(false);
  };

  const handleTestFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTestFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    try {
      if (!testFormState.name || !testFormState.department) {
        showFlashMessage({ type: 'warn', title: 'Warning', message: 'Test Name and Department are required.' });
        return;
      }

      if (editingTest) {
        await updateTest(editingTest.id, testFormState);
        showFlashMessage({ type: 'success', title: 'Success', message: `Test "${testFormState.name}" updated successfully!` });
      } else {
        await addTest(testFormState);
        showFlashMessage({ type: 'success', title: 'Success', message: `Test "${testFormState.name}" added successfully!` });
      }
      handleCloseModal();
    } catch (error) {
      showFlashMessage({ type: 'error', title: 'Error', message: "Failed to save test." });
    }
  };

  const handleDeleteTest = async (testId, testName) => {
    if (window.confirm(`Are you sure you want to delete the test "${testName}"? This cannot be undone.`)) {
      try {
        await deleteTest(testId);
        showFlashMessage({ type: 'success', title: 'Success', message: `Test "${testName}" deleted successfully!` });
      } catch (error) {
        showFlashMessage({ type: 'error', title: 'Error', message: "Failed to delete test." });
      }
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <FlaskConical size={24} /> Test Catalog
        </Title>
        <Description>
          Manage laboratory tests, panels, and test configurations
        </Description>
      </Header>

      <SearchAndActions>
        <SearchContainer>
          <StyledSearchIcon />
          <SearchInput
            type="text"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <GlowButton onClick={() => handleOpenModal()}>
          <Plus size={16} /> Add Test
        </GlowButton>
      </SearchAndActions>

      <TestsGrid>
        {testsLoading ? (
          [...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))
        ) : filteredTests.length === 0 ? (
          <EmptyState style={{ gridColumn: '1 / -1' }}>
            <FlaskConical size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No tests found. Add your first test to get started.</p>
          </EmptyState>
        ) : (
          filteredTests.map((test, index) => (
            <TestCard
              key={test.id}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TestHeader>
                <TestInfo>
                  <TestName>{test.name}</TestName>
                  <TestDepartment>
                    <Building2 size={16} />
                    {test.department}
                  </TestDepartment>
                  {test.requiresSpecialSlip && (
                    <SpecialBadge>
                      <AlertCircle size={12} />
                      Special Slip
                    </SpecialBadge>
                  )}
                </TestInfo>
                <TestActions>
                  <Edit size={18} style={{ cursor: 'pointer' }} onClick={() => handleOpenModal(test)} title="Edit Test" />
                  <Trash2 size={18} style={{ cursor: 'pointer' }} onClick={() => handleDeleteTest(test.id, test.name)} title="Delete Test" />
                </TestActions>
              </TestHeader>
              
              <TestDetails>
                {test.unit && (
                  <DetailItem>
                    <Ruler size={14} />
                    Unit: {test.unit}
                  </DetailItem>
                )}
                {test.referenceRange && (
                  <DetailItem>
                    <Target size={14} />
                    Reference: {test.referenceRange}
                  </DetailItem>
                )}
              </TestDetails>
            </TestCard>
          ))
        )}
      </TestsGrid>

      <AnimatedModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTest ? `Edit Test: ${editingTest.name}` : 'Add New Test'}
      >
        <ModalForm>
          <InputGroup>
            <Label>Test Name *</Label>
            <Input
              name="name"
              value={testFormState.name}
              onChange={handleTestFormChange}
              placeholder="Test Name (e.g., Glucose)"
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label>Department *</Label>
            <Input
              name="department"
              value={testFormState.department}
              onChange={handleTestFormChange}
              placeholder="Department (e.g., Chemistry)"
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label>Unit</Label>
            <Input
              name="unit"
              value={testFormState.unit}
              onChange={handleTestFormChange}
              placeholder="Unit (e.g., mg/dL)"
            />
          </InputGroup>
          
          <InputGroup>
            <Label>Reference Range</Label>
            <Input
              name="referenceRange"
              value={testFormState.referenceRange}
              onChange={handleTestFormChange}
              placeholder="Reference Range (e.g., 70-100)"
            />
          </InputGroup>
          
          <ToggleContainer>
            <ToggleLabel>
              <FileText size={16} />
              <div>
                <strong>Special Slip</strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                  Generate a special, individual slip for this test
                </p>
              </div>
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                name="requiresSpecialSlip"
                checked={testFormState.requiresSpecialSlip}
                onChange={handleTestFormChange}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleContainer>

          <Actions>
            <GlowButton type="button" onClick={handleCloseModal} style={{ background: '#eee', color: '#333' }}>
              Cancel
            </GlowButton>
            <GlowButton type="button" onClick={handleSaveTest}>
              <Save size={16} /> Save Test
            </GlowButton>
          </Actions>
        </ModalForm>
      </AnimatedModal>
    </Container>
  );
};

export default TestCatalog; 