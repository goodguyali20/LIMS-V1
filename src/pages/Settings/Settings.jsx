import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { collection, doc, onSnapshot, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { fadeIn } from '../../styles/animations';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useTestCatalog, departmentColors } from '../../contexts/TestContext';
import EditTestModal from '../../components/Modals/EditTestModal';
import SelectTestsModal from '../../components/Modals/SelectTestsModal';

const PageContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SettingsCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
`;

const CardHeader = styled.h2`
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 1rem;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  align-items: flex-end;
  margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Select = styled.select`
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
`;

const SubmitButton = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-weight: 600;
  color: white;
  background: ${({ theme }) => theme.colors.primary};
  height: fit-content;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const CancelButton = styled(SubmitButton)`
    background: ${({ theme }) => theme.colors.textSecondary};
`;

const DepartmentsContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
`;

const DepartmentCard = styled.div`
    border: 1px solid ${({ theme, color }) => color || theme.colors.border};
    border-radius: ${({ theme }) => theme.shapes.squircle};
    overflow: hidden;
`;

const DepartmentHeader = styled.h3`
    margin: 0;
    padding: 1rem 1.5rem;
    color: white;
    background-color: ${({ color }) => color || '#ccc'};
`;

const TestsContainer = styled.div`
    padding: 1.5rem;
`;

const TestItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    &:last-child { border-bottom: none; }
`;

const TestInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const TestName = styled.span`
    font-weight: 600;
`;

const TestDetails = styled.span`
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-top: 0.25rem;
`;

const ActionIcons = styled.div`
    display: flex;
    gap: 1.5rem;
    font-size: 1.1rem;
    svg {
        cursor: pointer;
        transition: color 0.2s ease-in-out;
        &:hover { color: ${({ theme }) => theme.colors.primaryPlain}; }
    }
`;

const ItemTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const PanelTestsSelector = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px;
    padding: 1rem;
    min-height: 80px;
    background-color: ${({ theme }) => theme.colors.background};
`;

const TestTag = styled.span`
    display: inline-block;
    background-color: ${({ theme }) => theme.colors.primaryPlain};
    color: white;
    padding: 0.3rem 0.7rem;
    border-radius: 12px;
    font-size: 0.9rem;
    margin: 0.25rem;
`;

const DEPARTMENTS = ["General", "Chemistry", "Hematology", "Serology", "Virology", "Microbiology"];

const Settings = () => {
  const { t } = useTranslation();
  const { labTests, loadingTests } = useTestCatalog();
  
  const [editingTest, setEditingTest] = useState(null);
  const [isSelectTestsModalOpen, setIsSelectTestsModalOpen] = useState(false);

  // Form state for ADDING new tests
  const [testName, setTestName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [unit, setUnit] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  
  // State for Test Panels
  const [testPanels, setTestPanels] = useState([]);
  const [loadingPanels, setLoadingPanels] = useState(true);
  const [panelName, setPanelName] = useState('');
  const [panelTests, setPanelTests] = useState([]);
  const [isSubmittingPanel, setIsSubmittingPanel] = useState(false);

  useEffect(() => {
    const unsubPanels = onSnapshot(collection(db, "testPanels"), (snapshot) => {
        setTestPanels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoadingPanels(false);
    });
    return () => unsubPanels();
  }, []);
  
  const handleAddNewTest = async (e) => {
    e.preventDefault();
    if (!testName || !department) return toast.error("Test Name and Department are required.");
    setIsSubmittingTest(true);
    try {
      await addDoc(collection(db, "labTests"), { name: testName, department, unit, normalRange });
      toast.success(`"${testName}" added to catalog.`);
      setTestName(''); setDepartment(DEPARTMENTS[0]); setUnit(''); setNormalRange('');
    } catch (error) { toast.error("Failed to add test."); }
    finally { setIsSubmittingTest(false); }
  };
  
  const handleTestDelete = async (testId, testName) => {
    if (window.confirm(`Are you sure you want to delete "${testName}"?`)) {
      await deleteDoc(doc(db, "labTests", testId));
      toast.success(`"${testName}" deleted.`);
    }
  };

  const handlePanelSubmit = async (e) => {
    e.preventDefault();
    if (!panelName || panelTests.length === 0) return toast.error("Panel name and at least one test are required.");
    setIsSubmittingPanel(true);
    try {
      await addDoc(collection(db, "testPanels"), { name: panelName, tests: panelTests });
      toast.success(`Panel "${panelName}" created successfully.`);
      setPanelName(''); setPanelTests([]);
    } catch (error) { toast.error("Failed to create panel."); }
    finally { setIsSubmittingPanel(false); }
  };

  const grouped_tests = labTests.reduce((acc, test) => {
    const dept = test.department || 'General';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(test);
    return acc;
  }, {});

  return (
    <>
      <PageContainer>
        <SettingsCard>
          <CardHeader>Add New Lab Test</CardHeader>
          <Form onSubmit={handleAddNewTest}>
              <InputGroup><label>Test Name</label><Input value={testName} onChange={e => setTestName(e.target.value)} required /></InputGroup>
              <InputGroup><label>Department</label><Select value={department} onChange={e => setDepartment(e.target.value)}>{DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}</Select></InputGroup>
              <InputGroup><label>Unit</label><Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g., mg/dL" /></InputGroup>
              <InputGroup><label>Normal Range</label><Input value={normalRange} onChange={e => setNormalRange(e.target.value)} placeholder="e.g., 70 - 110" /></InputGroup>
              <SubmitButton type="submit" disabled={isSubmittingTest}>Add Test</SubmitButton>
          </Form>
        </SettingsCard>
        
        <SettingsCard>
            <CardHeader>{t('settings_panels_header')}</CardHeader>
            <Form onSubmit={handlePanelSubmit}>
                <InputGroup>
                    <label>{t('settings_panelName')}</label>
                    <Input value={panelName} onChange={e => setPanelName(e.target.value)} required/>
                </InputGroup>
                <InputGroup style={{gridColumn: '1 / -1'}}>
                    <label>Tests in Panel</label>
                    <PanelTestsSelector>
                        {panelTests.length > 0 ? 
                            panelTests.map(test => <TestTag key={test}>{test}</TestTag>) :
                            <p style={{color: '#999'}}>Click the button to select tests...</p>
                        }
                    </PanelTestsSelector>
                    <SubmitButton type="button" style={{alignSelf: 'flex-start', marginTop: '1rem'}} onClick={() => setIsSelectTestsModalOpen(true)}>
                        Select Tests
                    </SubmitButton>
                </InputGroup>
                <SubmitButton type="submit" disabled={isSubmittingPanel} style={{gridColumn: '1 / -1'}}>
                    {t('settings_panelCreate_button')}
                </SubmitButton>
            </Form>
            <ItemTable>
                <thead><tr><th>{t('settings_panelName_th')}</th><th>{t('settings_panelTests_th')}</th><th>Actions</th></tr></thead>
                <tbody>
                    {loadingPanels ? <tr><td colSpan="3">Loading...</td></tr> : 
                    testPanels.map(panel => (
                        <tr key={panel.id}>
                            <td>{panel.name}</td>
                            <td>{panel.tests.join(', ')}</td>
                            <td><ActionIcons><FaTrash onClick={() => handleTestDelete(panel.id, panel.name)} /></ActionIcons></td>
                        </tr>
                    ))}
                </tbody>
            </ItemTable>
        </SettingsCard>

        <DepartmentsContainer>
          {loadingTests ? <p>Loading tests...</p> :
           Object.entries(grouped_tests).map(([deptName, testsInDept]) => (
            <DepartmentCard key={deptName} color={departmentColors[deptName]}>
                <DepartmentHeader color={departmentColors[deptName]}>{deptName}</DepartmentHeader>
                <TestsContainer>
                    {testsInDept.map(test => (
                        <TestItem key={test.id}>
                            <TestInfo>
                                <TestName>{test.name}</TestName>
                                <TestDetails>
                                    {test.unit && `Unit: ${test.unit}`}
                                    {test.unit && test.normalRange && ' | '}
                                    {test.normalRange && `Range: ${test.normalRange}`}
                                </TestDetails>
                            </TestInfo>
                            <ActionIcons>
                                <FaEdit onClick={() => setEditingTest(test)} />
                                <FaTrash onClick={() => handleTestDelete(test.id, test.name)} />
                            </ActionIcons>
                        </TestItem>
                    ))}
                </TestsContainer>
            </DepartmentCard>
           ))
          }
        </DepartmentsContainer>
      </PageContainer>
      
      {editingTest && <EditTestModal test={editingTest} onClose={() => setEditingTest(null)} />}
      
      {isSelectTestsModalOpen && (
        <SelectTestsModal
          initialSelectedTests={panelTests}
          onClose={() => setIsSelectTestsModalOpen(false)}
          onSave={(selected) => setPanelTests(selected)}
        />
      )}
    </>
  );
};

export default Settings;