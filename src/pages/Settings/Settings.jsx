import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { fadeIn } from '../../styles/animations';

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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  align-items: flex-end;
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
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Select = styled.select`
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RangesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

// A static list of tests available in the lab. This could also come from Firestore.
const LAB_TESTS = ["Glucose", "Potassium", "Hemoglobin", "WBC", "Platelet"];

const Settings = () => {
  const [criticalRanges, setCriticalRanges] = useState({});
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedTest, setSelectedTest] = useState(LAB_TESTS[0]);
  const [lowValue, setLowValue] = useState('');
  const [highValue, setHighValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Listen for real-time updates to the critical ranges
    const unsubscribe = onSnapshot(collection(db, "criticalRanges"), (snapshot) => {
      const ranges = {};
      snapshot.forEach(doc => {
        ranges[doc.id] = doc.data();
      });
      setCriticalRanges(ranges);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedTest || lowValue === '' || highValue === '') {
        toast.error("All fields are required.");
        setIsSubmitting(false);
        return;
    }

    try {
      const docRef = doc(db, "criticalRanges", selectedTest);
      await setDoc(docRef, {
        low: Number(lowValue),
        high: Number(highValue)
      });
      toast.success(`Critical range for ${selectedTest} has been saved.`);
      // Clear form
      setLowValue('');
      setHighValue('');
    } catch (error) {
      toast.error("Failed to save settings.");
      console.error("Error saving critical range:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <SettingsCard>
        <CardHeader>Critical Value Ranges</CardHeader>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <label htmlFor="test-select">Test Name</label>
            <Select id="test-select" value={selectedTest} onChange={e => setSelectedTest(e.target.value)}>
              {LAB_TESTS.map(test => <option key={test} value={test}>{test}</option>)}
            </Select>
          </InputGroup>

          <InputGroup>
            <label htmlFor="low-value">Critical Low (&lt;)</label>
            <Input id="low-value" type="number" value={lowValue} onChange={e => setLowValue(e.target.value)} />
          </InputGroup>

          <InputGroup>
            <label htmlFor="high-value">Critical High (&gt;)</label>
            <Input id="high-value" type="number" value={highValue} onChange={e => setHighValue(e.target.value)} />
          </InputGroup>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Range'}
          </SubmitButton>
        </Form>

        <RangesTable>
            <thead>
                <tr>
                    <th>Test Name</th>
                    <th>Critical Low</th>
                    <th>Critical High</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan="3">Loading ranges...</td></tr>
                ) : (
                    Object.entries(criticalRanges).map(([test, range]) => (
                        <tr key={test}>
                            <td>{test}</td>
                            <td>&lt; {range.low}</td>
                            <td>&gt; {range.high}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </RangesTable>

      </SettingsCard>
      
      {/* Other settings cards like Test Panels can go here */}
    </PageContainer>
  );
};

export default Settings;