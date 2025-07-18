import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTestCatalog } from '../../contexts/TestContext';
import { showFlashMessage } from '../../contexts/NotificationContext';
import { FaPlus, FaEdit, FaTrash, FaExclamationCircle, FaSearch, FaSpinner } from 'react-icons/fa';
import Modal from '../../components/Common/Modal';

const TestsContainer = styled.div`
  padding: 2rem;
  animation: fadeIn 0.3s ease-in-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  
  input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    border-radius: ${({ theme }) => theme.shapes.squircle};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.input};
    color: ${({ theme }) => theme.colors.text};
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
  
  svg {
    position: absolute;
    left: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const TestList = styled.div`
  display: grid;
  gap: 1rem;
`;

const TestCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.main};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
`;

const TestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const TestInfo = styled.div`
  flex: 1;
`;

const TestName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;
`;

const TestDepartment = styled.span`
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
`;

const TestActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ $variant, theme }) => 
    $variant === 'danger' ? theme.colors.error : 
    $variant === 'secondary' ? theme.colors.surface : 
    theme.colors.primary};
  color: ${({ $variant, theme }) => 
    $variant === 'danger' ? 'white' : 
    $variant === 'secondary' ? theme.colors.textSecondary : 
    'white'};
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const TestDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const DetailItem = styled.div`
  p {
    margin: 0.2rem 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const SpecialBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.warning}20;
  color: ${({ theme }) => theme.colors.warning};
  border: 1px solid ${({ theme }) => theme.colors.warning}80;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: 0.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
  
  h3 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ModalForm = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.8rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  transition: background-color 0.2s ease;
  user-select: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const SaveButton = styled(ActionButton)``;
const CancelButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Tests = () => {
  const { labTests, addTest, updateTest, deleteTest, loading } = useTestCatalog();
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

  useEffect(() => {
    if (editingTest) {
      setTestFormState({
        name: editingTest.name || '',
        department: editingTest.department || '',
        unit: editingTest.unit || '',
        referenceRange: editingTest.referenceRange || '',
        requiresSpecialSlip: editingTest.requiresSpecialSlip || false,
      });
    } else {
      setTestFormState({ name: '', department: '', unit: '', referenceRange: '', requiresSpecialSlip: false });
    }
  }, [editingTest, isModalOpen]);

  const handleOpenModal = (test = null) => {
    setEditingTest(test);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTest(null);
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
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
        showFlashMessage({ type: 'warning', title: 'Warning', message: 'Test Name and Department are required.' });
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

  const filteredTests = labTests.filter(test =>
    test.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <TestsContainer>
        <LoadingContainer>
          <FaSpinner className="fa-spin" size={24} />
          <span>Loading tests...</span>
        </LoadingContainer>
      </TestsContainer>
    );
  }

  return (
    <TestsContainer>
      <Header>
        <div>
          <h1>Test Catalog</h1>
          <p>Manage laboratory tests and their configurations</p>
        </div>
        <AddButton onClick={() => handleOpenModal()}>
          <FaPlus /> Add New Test
        </AddButton>
      </Header>

      <SearchContainer>
        <FaSearch />
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      {filteredTests.length === 0 ? (
        <EmptyState>
          <h3>No Tests Found</h3>
          <p>
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'No tests have been added yet. Click "Add New Test" to get started.'
            }
          </p>
        </EmptyState>
      ) : (
        <TestList>
          {filteredTests.map((test) => (
            <TestCard key={test.id}>
              <TestHeader>
                <TestInfo>
                  <TestName>
                    {test.name}
                    {test.requiresSpecialSlip && (
                      <SpecialBadge>
                        <FaExclamationCircle size={12} />
                        Special Slip
                      </SpecialBadge>
                    )}
                  </TestName>
                  <TestDepartment>{test.department}</TestDepartment>
                </TestInfo>
                <TestActions>
                  <ActionButton
                    $variant="secondary"
                    onClick={() => handleOpenModal(test)}
                  >
                    <FaEdit /> Edit
                  </ActionButton>
                  <ActionButton
                    $variant="danger"
                    onClick={() => handleDeleteTest(test.id, test.name)}
                  >
                    <FaTrash /> Delete
                  </ActionButton>
                </TestActions>
              </TestHeader>
              
              <TestDetails>
                {test.unit && (
                  <DetailItem>
                    <p><strong>Unit:</strong> {test.unit}</p>
                  </DetailItem>
                )}
                {test.referenceRange && (
                  <DetailItem>
                    <p><strong>Reference Range:</strong> {test.referenceRange}</p>
                  </DetailItem>
                )}
              </TestDetails>
            </TestCard>
          ))}
        </TestList>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTest ? 'Edit Test' : 'Add New Test'}>
        <ModalForm onSubmit={handleSaveTest}>
          <FormGroup>
            <Label>Test Name *</Label>
            <Input
              name="name"
              value={testFormState.name}
              onChange={handleFormChange}
              placeholder="e.g., Glucose"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Department *</Label>
            <Input
              name="department"
              value={testFormState.department}
              onChange={handleFormChange}
              placeholder="e.g., Chemistry"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Unit</Label>
            <Input
              name="unit"
              value={testFormState.unit}
              onChange={handleFormChange}
              placeholder="e.g., mg/dL"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Reference Range</Label>
            <Input
              name="referenceRange"
              value={testFormState.referenceRange}
              onChange={handleFormChange}
              placeholder="e.g., 70-100"
            />
          </FormGroup>
          
          <CheckboxContainer>
            <input
              type="checkbox"
              name="requiresSpecialSlip"
              checked={testFormState.requiresSpecialSlip}
              onChange={handleFormChange}
            />
            <span>Generate a special, individual slip for this test</span>
          </CheckboxContainer>

          <ButtonContainer>
            <CancelButton type="button" onClick={handleCloseModal}>
              Cancel
            </CancelButton>
            <SaveButton type="submit">
              {editingTest ? 'Update Test' : 'Add Test'}
            </SaveButton>
          </ButtonContainer>
        </ModalForm>
      </Modal>
    </TestsContainer>
  );
};

export default Tests; 