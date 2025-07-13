import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTestCatalog } from '../../contexts/TestContext';
import { useSettings } from '../../contexts/SettingsContext';
import { FaSave, FaPlus, FaEdit, FaTrash, FaExclamationCircle, FaFlask } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Modal from '../../components/Common/Modal';
// import TestPanelManager from '../../components/Settings/TestPanelManager'; // Temporarily disabled

const SettingsContainer = styled.div`
  padding: 2rem;
  animation: fadeIn 0.3s ease-in-out;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 2rem;
`;

const TabButton = styled(motion.button)`
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textSecondary};
  border-bottom: 3px solid ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  transition: all 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TabContent = styled(motion.div)`
  animation: fadeIn 0.5s;
`;

const SkeletonCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 1.5rem;
  min-height: 100px;
  margin-bottom: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.main};
  opacity: 0.7;
  animation: pulse 1.5s infinite alternate;
  @keyframes pulse {
    0% { background: ${({ theme }) => theme.colors.surface}; }
    100% { background: ${({ theme }) => theme.colors.surfaceSecondary}; }
  }
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s ease;
  &:hover { opacity: 0.9; }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
`;

const TestList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TestListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

const TestInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TestActions = styled.div`
  display: flex;
  gap: 1.5rem;
  & > svg {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.1rem;
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
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
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  grid-column: 1 / -1;

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

const ModalForm = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
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


const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { labTests, addTest, updateTest, deleteTest, loading: testsLoading } = useTestCatalog();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [testFormState, setTestFormState] = useState({
    name: '',
    department: '',
    unit: '',
    referenceRange: '',
    requiresSpecialSlip: false
  });

  const [generalFormState, setGeneralFormState] = useState(settings);

  useEffect(() => {
    setGeneralFormState(settings);
  }, [settings]);
  
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

  const handleGeneralInputChange = (e) => {
    const { name, value } = e.target;
    setGeneralFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTestFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTestFormState(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    await updateSettings(generalFormState);
    toast.success('General settings updated!');
  };

  const handleOpenModal = (test = null) => {
    setEditingTest(test);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTest(null);
    setIsModalOpen(false);
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    try {
      if (!testFormState.name || !testFormState.department) {
        toast.warn('Test Name and Department are required.');
        return;
      }

      if (editingTest) {
        await updateTest(editingTest.id, testFormState);
        toast.success(`Test "${testFormState.name}" updated successfully!`);
      } else {
        await addTest(testFormState);
        toast.success(`Test "${testFormState.name}" added successfully!`);
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to save test.");
    }
  };

  const handleDeleteTest = async (testId, testName) => {
    if (window.confirm(`Are you sure you want to delete the test "${testName}"? This cannot be undone.`)) {
      await deleteTest(testId);
    }
  };

  return (
    <SettingsContainer>
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        Settings
      </motion.h1>
      <TabsContainer>
        <TabButton 
          $active={activeTab === 'general'} 
          onClick={() => setActiveTab('general')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          General
        </TabButton>
        <TabButton 
          $active={activeTab === 'catalog'} 
          onClick={() => setActiveTab('catalog')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Test Catalog
        </TabButton>
        {/* <TabButton active={activeTab === 'panels'} onClick={() => setActiveTab('panels')}>Test Panels</TabButton> */}
      </TabsContainer>

      <AnimatePresence mode="wait">
        <TabContent
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'general' && (
            <Section as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <form onSubmit={handleGeneralSubmit}>
                <SectionHeader>
                  <h2>General Settings</h2>
                  <ActionButton 
                    type="submit" 
                    disabled={settingsLoading}
                    as={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaSave /> {settingsLoading ? 'Saving...' : 'Save Changes'}
                  </ActionButton>
                </SectionHeader>
                <Form>
                  <Input name="hospitalName" value={generalFormState.hospitalName || ''} onChange={handleGeneralInputChange} placeholder="Hospital Name" />
                  <Input name="hospitalAddress" value={generalFormState.hospitalAddress || ''} onChange={handleGeneralInputChange} placeholder="Hospital Address" />
                  <Input name="hospitalPhone" value={generalFormState.hospitalPhone || ''} onChange={handleGeneralInputChange} placeholder="Hospital Phone" />
                </Form>
              </form>
            </Section>
          )}

          {activeTab === 'catalog' && (
            <Section as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionHeader>
                <h2>Test Catalog</h2>
                <ActionButton 
                  onClick={() => handleOpenModal()}
                  as={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPlus /> Add New Test
                </ActionButton>
              </SectionHeader>
              <TestList>
                {testsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <SkeletonCard key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                  ))
                ) : labTests.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}
                  >
                    <FaFlask size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                    <p>No tests found. Add your first test to get started.</p>
                  </motion.div>
                ) : (
                  labTests.map((test, index) => (
                    <TestListItem 
                      key={test.id}
                      as={motion.li}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <TestInfo>
                        <strong>{test.name}</strong>
                        <span>({test.department})</span>
                        {test.requiresSpecialSlip && (
                          <SpecialBadge>
                            <FaExclamationCircle size={12} />
                            Special Slip
                          </SpecialBadge>
                        )}
                      </TestInfo>
                      <TestActions>
                        <FaEdit onClick={() => handleOpenModal(test)} title="Edit Test"/>
                        <FaTrash onClick={() => handleDeleteTest(test.id, test.name)} title="Delete Test"/>
                      </TestActions>
                    </TestListItem>
                  ))
                )}
              </TestList>
            </Section>
          )}

          {/* {activeTab === 'panels' && (
            <Section>
              <SectionHeader>
                <h2>Test Panels</h2>
              </SectionHeader>
            </Section>
          )} */}
        </TabContent>
      </AnimatePresence>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTest ? 'Edit Test' : 'Add New Test'}>
        <ModalForm onSubmit={handleSaveTest}>
            <Input name="name" value={testFormState.name} onChange={handleTestFormChange} placeholder="Test Name (e.g., Glucose)" required />
            <Input name="department" value={testFormState.department} onChange={handleTestFormChange} placeholder="Department (e.g., Chemistry)" required />
            <Input name="unit" value={testFormState.unit} onChange={handleTestFormChange} placeholder="Unit (e.g., mg/dL)" />
            <Input name="referenceRange" value={testFormState.referenceRange} onChange={handleTestFormChange} placeholder="Reference Range (e.g., 70-100)" />
            
            <CheckboxContainer>
                <input
                    type="checkbox"
                    name="requiresSpecialSlip"
                    checked={testFormState.requiresSpecialSlip}
                    onChange={handleTestFormChange}
                />
                <span>Generate a special, individual slip for this test</span>
            </CheckboxContainer>

            <ButtonContainer>
                <CancelButton type="button" onClick={handleCloseModal}>Cancel</CancelButton>
                <SaveButton type="submit">Save Test</SaveButton>
            </ButtonContainer>
        </ModalForm>
      </Modal>
    </SettingsContainer>
  );
};

export default Settings;