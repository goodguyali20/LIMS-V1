import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { FaTrash, FaClipboardList } from 'react-icons/fa';
import { toast } from 'react-toastify';

//--- STYLED COMPONENTS ---//
const ManagementContainer = styled.div`
  background: ${({ theme }) => theme.cardBg};
  ${({ theme }) => theme.squircle(24)};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const Title = styled.h2` font-size: 1.5rem; margin-bottom: 24px; `;
const InputGroup = styled.div` display: flex; flex-direction: column; gap: 8px; `;
const Label = styled.label` font-weight: 600; font-size: 0.9rem; `;
const Input = styled.input` padding: 10px; border: 1px solid ${({ theme }) => theme.borderColor}; ${({ theme }) => theme.squircle(12)}; background-color: ${({ theme }) => theme.body}; color: ${({ theme }) => theme.text}; `;
const AddButton = styled.button` grid-column: 1 / -1; padding: 12px; background: ${({ theme }) => theme.primaryGradient}; color: white; border: none; ${({ theme }) => theme.squircle(12)}; cursor: pointer; font-weight: 600; `;
const ActionButton = styled.button` background: none; border: none; cursor: pointer; font-size: 1rem; color: ${({ theme }) => theme.danger}; `;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  margin-bottom: 24px;
`;

const TabButton = styled.button`
  padding: 12px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  color: ${({ theme, active }) => active ? theme.primary : `${theme.text}99`};
  border-bottom: 2px solid ${({ theme, active }) => active ? theme.primary : 'transparent'};
  margin-bottom: -1px;
`;

const AddForm = styled.form` display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 32px; `;
const TestCard = styled.div` background: ${({ theme }) => theme.body}; ${({ theme }) => theme.squircle(16)}; padding: 16px; margin-bottom: 16px; border: 1px solid ${({ theme }) => theme.borderColor}; `;
const TestHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; h4 { font-size: 1.2rem; direction: ltr; } `;
const TestDetails = styled.div` display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 16px; font-size: 0.9rem; `;

const PanelForm = styled.form` margin-bottom: 32px; `;
const PanelInputGroup = styled(InputGroup)` margin-bottom: 16px; `;
const TestCheckboxGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 8px; `;
const TestCheckboxLabel = styled.label` display: flex; align-items: center; gap: 10px; direction: ltr; `;

const TestManagement = () => {
  const [activeTab, setActiveTab] = useState('tests');
  const [tests, setTests] = useState([]);
  const [panels, setPanels] = useState([]);
  const [newTest, setNewTest] = useState({ name: '', unit: '', refRangeLow: '', refRangeHigh: '', criticalLow: '', criticalHigh: '' });
  const [newPanelName, setNewPanelName] = useState('');
  const [selectedTestsForPanel, setSelectedTestsForPanel] = useState([]);

  const testsCollectionRef = collection(db, 'labTests');
  const panelsCollectionRef = collection(db, 'labPanels');

  const fetchTestsAndPanels = async () => {
    const [testsData, panelsData] = await Promise.all([
        getDocs(testsCollectionRef),
        getDocs(panelsCollectionRef)
    ]);
    const testList = testsData.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    testList.sort((a, b) => a.name.localeCompare(b.name));
    setTests(testList);

    const panelList = panelsData.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setPanels(panelList);
  };

  useEffect(() => { fetchTestsAndPanels(); }, []);

  const handleAddTest = async (e) => {
    e.preventDefault();
    if (!newTest.name || !newTest.unit) return toast.warn("Test Name and Unit are required.");
    await addDoc(testsCollectionRef, { ...newTest, refRangeLow: Number(newTest.refRangeLow) || null, refRangeHigh: Number(newTest.refRangeHigh) || null, criticalLow: Number(newTest.criticalLow) || null, criticalHigh: Number(newTest.criticalHigh) || null });
    setNewTest({ name: '', unit: '', refRangeLow: '', refRangeHigh: '', criticalLow: '', criticalHigh: '' });
    fetchTestsAndPanels();
    toast.success("New test added!");
  };

  const handleDeleteTest = async (id) => {
    if (window.confirm("Are you sure?")) {
        await deleteDoc(doc(db, 'labTests', id));
        fetchTestsAndPanels();
        toast.info("Test deleted.");
    }
  };

  const handlePanelTestSelection = (testName) => {
    setSelectedTestsForPanel(prev => prev.includes(testName) ? prev.filter(t => t !== testName) : [...prev, testName]);
  };

  const handleAddPanel = async (e) => {
    e.preventDefault();
    if (!newPanelName || selectedTestsForPanel.length === 0) return toast.warn("Panel Name and at least one test are required.");
    await addDoc(panelsCollectionRef, { name: newPanelName, tests: selectedTestsForPanel });
    setNewPanelName('');
    setSelectedTestsForPanel([]);
    fetchTestsAndPanels();
    toast.success("New panel created!");
  };

  const handleDeletePanel = async (id) => {
    if (window.confirm("Are you sure?")) {
        await deleteDoc(doc(db, 'labPanels', id));
        fetchTestsAndPanels();
        toast.info("Panel deleted.");
    }
  };

  return (
    <ManagementContainer>
      <Title>Manage Lab Tests & Panels</Title>
      <TabContainer>
        <TabButton active={activeTab === 'tests'} onClick={() => setActiveTab('tests')}>Individual Tests</TabButton>
        <TabButton active={activeTab === 'panels'} onClick={() => setActiveTab('panels')}>Test Panels</TabButton>
      </TabContainer>

      {activeTab === 'tests' && (
        <div>
          <AddForm onSubmit={handleAddTest}>
            <InputGroup style={{gridColumn: '1 / -1'}}><Label>Test Name</Label><Input type="text" value={newTest.name} onChange={e => setNewTest({...newTest, name: e.target.value})} required /></InputGroup>
            <InputGroup><Label>Unit</Label><Input type="text" value={newTest.unit} onChange={e => setNewTest({...newTest, unit: e.target.value})} required /></InputGroup>
            <InputGroup><Label>Ref. Low</Label><Input type="number" value={newTest.refRangeLow} onChange={e => setNewTest({...newTest, refRangeLow: e.target.value})} /></InputGroup>
            <InputGroup><Label>Ref. High</Label><Input type="number" value={newTest.refRangeHigh} onChange={e => setNewTest({...newTest, refRangeHigh: e.target.value})} /></InputGroup>
            <InputGroup><Label>Crit. Low</Label><Input type="number" value={newTest.criticalLow} onChange={e => setNewTest({...newTest, criticalLow: e.target.value})} /></InputGroup>
            <InputGroup><Label>Crit. High</Label><Input type="number" value={newTest.criticalHigh} onChange={e => setNewTest({...newTest, criticalHigh: e.target.value})} /></InputGroup>
            <AddButton type="submit">Add New Test</AddButton>
          </AddForm>
          {tests.map(test => (
            <TestCard key={test.id}>
              <TestHeader>
                <h4>{test.name}</h4>
                <ActionButton onClick={() => handleDeleteTest(test.id)}><FaTrash /></ActionButton>
              </TestHeader>
              <TestDetails>
                  <p><strong>Unit:</strong> {test.unit}</p><p><strong>Ref. Range:</strong> {test.refRangeLow || 'N/A'} - {test.refRangeHigh || 'N/A'}</p>
                  <p><strong>Crit. Low:</strong> {test.criticalLow || 'N/A'}</p><p><strong>Crit. High:</strong> {test.criticalHigh || 'N/A'}</p>
              </TestDetails>
            </TestCard>
          ))}
        </div>
      )}

      {activeTab === 'panels' && (
        <div>
          <PanelForm onSubmit={handleAddPanel}>
            <PanelInputGroup><Label>New Panel Name</Label><Input type="text" value={newPanelName} onChange={e => setNewPanelName(e.target.value)} placeholder="e.g., Kidney Function Panel" required /></PanelInputGroup>
            <PanelInputGroup><Label>Select Tests for Panel</Label>
              <TestCheckboxGrid>
                {tests.map(test => (
                  <TestCheckboxLabel key={test.id}>
                    <input type="checkbox" checked={selectedTestsForPanel.includes(test.name)} onChange={() => handlePanelTestSelection(test.name)} />
                    {test.name}
                  </TestCheckboxLabel>
                ))}
              </TestCheckboxGrid>
            </PanelInputGroup>
            <AddButton type="submit">Create New Panel</AddButton>
          </PanelForm>
          {panels.map(panel => (
            <TestCard key={panel.id}>
              <TestHeader><h4>{panel.name}</h4><ActionButton onClick={() => handleDeletePanel(panel.id)}><FaTrash /></ActionButton></TestHeader>
              <TestDetails style={{gridTemplateColumns: '1fr'}}>
                <p><strong>Includes:</strong> {panel.tests.join(', ')}</p>
              </TestDetails>
            </TestCard>
          ))}
        </div>
      )}
    </ManagementContainer>
  );
};

export default TestManagement;