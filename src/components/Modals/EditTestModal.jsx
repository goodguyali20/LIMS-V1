import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

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
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  width: 100%;
  max-width: 600px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.h2`
  margin-top: 0;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
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
  grid-column: 1 / -1; /* Span full width */
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-weight: 600;
`;

const UpdateButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DEPARTMENTS = ["General", "Chemistry", "Hematology", "Serology", "Virology", "Microbiology"];

const EditTestModal = ({ test, onClose }) => {
  const [testName, setTestName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [unit, setUnit] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // When the modal opens, populate the form with the test's current data
    if (test) {
      setTestName(test.name);
      setDepartment(test.department);
      setUnit(test.unit || '');
      setNormalRange(test.normalRange || '');
    }
  }, [test]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testName || !department) return toast.error("Test Name and Department are required.");
    setIsSubmitting(true);
    
    const testData = { name: testName, department, unit, normalRange };
    const testRef = doc(db, "labTests", test.id);

    try {
      await updateDoc(testRef, testData);
      toast.success(`"${testName}" has been updated successfully.`);
      onClose(); // Close the modal on success
    } catch (error) {
      toast.error("Failed to update test.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>Editing: {test.name}</ModalHeader>
        <Form onSubmit={handleSubmit}>
            <InputGroup><label>Test Name</label><Input value={testName} onChange={e => setTestName(e.target.value)} required /></InputGroup>
            <InputGroup><label>Department</label><Select value={department} onChange={e => setDepartment(e.target.value)}>{DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}</Select></InputGroup>
            <InputGroup><label>Unit</label><Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g., mg/dL" /></InputGroup>
            <InputGroup><label>Normal Range</label><Input value={normalRange} onChange={e => setNormalRange(e.target.value)} placeholder="e.g., 70 - 110" /></InputGroup>
            <ButtonGroup>
                <CancelButton type="button" onClick={onClose}>Cancel</CancelButton>
                <UpdateButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update Test'}</UpdateButton>
            </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default EditTestModal;