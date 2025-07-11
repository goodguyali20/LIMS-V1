import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { collection, doc, addDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { fadeIn } from '../../styles/animations';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useTestCatalog } from '../../contexts/TestContext';

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

const ActionIcons = styled.div`
    display: flex;
    gap: 1rem;
    svg {
        cursor: pointer;
        &:hover {
            color: ${({ theme }) => theme.colors.primaryPlain};
        }
    }
`;

const DEPARTMENTS = ["General", "Chemistry", "Hematology", "Serology", "Virology", "Microbiology"];

const Settings = () => {
  const { t } = useTranslation();
  const { labTests, loadingTests } = useTestCatalog();
  
  const [testName, setTestName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [unit, setUnit] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  const sortedTests = [...labTests].sort((a, b) => {
    if (a.department < b.department) return -1;
    if (a.department > b.department) return 1;
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    if (!testName || !department) {
      toast.error("Test Name and Department are required.");
      return;
    }
    setIsSubmittingTest(true);
    try {
      const newTest = { name: testName, department, unit, normalRange };
      await addDoc(collection(db, "labTests"), newTest);
      toast.success(`${testName} added to test catalog.`);
      setTestName('');
      setDepartment(DEPARTMENTS[0]);
      setUnit('');
      setNormalRange('');
    } catch (error) {
      toast.error("Failed to add test.");
    } finally {
      setIsSubmittingTest(false);
    }
  };
  
  const handleTestDelete = async (testId, testName) => {
      if(window.confirm(`Are you sure you want to delete the test "${testName}"? This cannot be undone.`)){
          try {
              await deleteDoc(doc(db, "labTests", testId));
              toast.success(`"${testName}" has been deleted.`);
          } catch (error) {
              toast.error("Failed to delete test.");
          }
      }
  }

  return (
    <PageContainer>
      <SettingsCard>
        <CardHeader>Lab Test Management</CardHeader>
        <Form onSubmit={handleTestSubmit}>
          <InputGroup>
            <label>Test Name</label>
            <Input value={testName} onChange={e => setTestName(e.target.value)} required />
          </InputGroup>
          <InputGroup>
            <label>Department</label>
            <Select value={department} onChange={e => setDepartment(e.target.value)}>
                {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </Select>
          </InputGroup>
          <InputGroup>
            <label>Unit</label>
            <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g., mg/dL, 10^3/uL" />
          </InputGroup>
           <InputGroup>
            <label>Normal Range</label>
            <Input value={normalRange} onChange={e => setNormalRange(e.target.value)} placeholder="e.g., 70 - 110" />
          </InputGroup>
          <SubmitButton type="submit" disabled={isSubmittingTest}>Add Test</SubmitButton>
        </Form>
        <ItemTable>
          <thead>
            <tr><th>Name</th><th>Department</th><th>Unit</th><th>Normal Range</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loadingTests ? <tr><td colSpan="5">Loading...</td></tr> :
             sortedTests.map(test => (
               <tr key={test.id}>
                 <td>{test.name}</td>
                 <td>{test.department}</td>
                 <td>{test.unit}</td>
                 <td>{test.normalRange}</td>
                 <td>
                    <ActionIcons>
                        <FaEdit />
                        <FaTrash onClick={() => handleTestDelete(test.id, test.name)} />
                    </ActionIcons>
                 </td>
               </tr>
             ))
            }
          </tbody>
        </ItemTable>
      </SettingsCard>
    </PageContainer>
  );
};

export default Settings;