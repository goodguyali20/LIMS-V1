import React, { useState } from 'react';
import styled from 'styled-components';
import { useTestCatalog, departmentColors } from '../../contexts/TestContext';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001; /* Higher than other modals if needed */
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  width: 100%;
  max-width: 800px;
  height: 80vh;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.h2`
  margin-top: 0;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
`;

const TestListContainer = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 1rem;
`;

const DepartmentHeader = styled.h4`
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid ${props => props.color || '#ccc'};
    color: ${props => props.color || '#333'};
`;

const TestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem 1rem;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  label { cursor: pointer; }
  input { cursor: pointer; }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-shrink: 0;
`;

const Button = styled.button`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-weight: 600;
`;

const SaveButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
`;

const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SelectTestsModal = ({ initialSelectedTests, onClose, onSave }) => {
  const { labTests } = useTestCatalog();
  const [selectedTests, setSelectedTests] = useState(new Set(initialSelectedTests));

  const grouped_tests = labTests.reduce((acc, test) => {
    const dept = test.department || 'Parasitology';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(test);
    return acc;
  }, {});

  const handleTestSelection = (testName) => {
    setSelectedTests(prev => {
        const newSet = new Set(prev);
        if (newSet.has(testName)) newSet.delete(testName);
        else newSet.add(testName);
        return newSet;
    });
  };

  const handleSave = () => {
    onSave(Array.from(selectedTests));
    onClose();
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>Select Tests for Panel</ModalHeader>
        <TestListContainer>
          {Object.entries(grouped_tests).map(([deptName, testsInDept]) => (
            <div key={deptName}>
              <DepartmentHeader color={departmentColors[deptName]}>{deptName}</DepartmentHeader>
              <TestGrid>
                {testsInDept.map(test => (
                  <CheckboxGroup key={test.id}>
                    <input
                      type="checkbox"
                      id={`modal-${test.id}`}
                      checked={selectedTests.has(test.name)}
                      onChange={() => handleTestSelection(test.name)}
                    />
                    <label htmlFor={`modal-${test.id}`}>{test.name}</label>
                  </CheckboxGroup>
                ))}
              </TestGrid>
            </div>
          ))}
        </TestListContainer>
        <ButtonGroup>
          <CancelButton type="button" onClick={onClose}>Cancel</CancelButton>
          <SaveButton type="button" onClick={handleSave}>Save Selection</SaveButton>
        </ButtonGroup>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default SelectTestsModal;