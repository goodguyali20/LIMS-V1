import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { collection, doc, setDoc, onSnapshot, addDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { fadeIn } from '../../styles/animations';
import { useTranslation } from 'react-i18next'; // Import useTranslation

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
  margin-top: 2rem;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const LAB_TESTS = ["Glucose", "Potassium", "Hemoglobin", "WBC", "Platelet", "Creatinine", "ALT", "AST"];

const Settings = () => {
  const { t } = useTranslation(); // <-- Add this
  // ... all the existing state variables
  const [criticalRanges, setCriticalRanges] = useState({});
  const [loadingRanges, setLoadingRanges] = useState(true);
  const [selectedTest, setSelectedTest] = useState(LAB_TESTS[0]);
  const [lowValue, setLowValue] = useState('');
  const [highValue, setHighValue] = useState('');
  const [isSubmittingRange, setIsSubmittingRange] = useState(false);

  const [testPanels, setTestPanels] = useState([]);
  const [loadingPanels, setLoadingPanels] = useState(true);
  const [panelName, setPanelName] = useState('');
  const [panelTests, setPanelTests] = useState('');
  const [isSubmittingPanel, setIsSubmittingPanel] = useState(false);

  useEffect(() => {
    // ... useEffect content is the same
    const unsubRanges = onSnapshot(collection(db, "criticalRanges"), (snapshot) => {
      const ranges = {};
      snapshot.forEach(doc => { ranges[doc.id] = doc.data(); });
      setCriticalRanges(ranges);
      setLoadingRanges(false);
    });

    const unsubPanels = onSnapshot(collection(db, "testPanels"), (snapshot) => {
        const panels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTestPanels(panels);
        setLoadingPanels(false);
    });

    return () => {
        unsubRanges();
        unsubPanels();
    };
  }, []);

  const handleRangeSubmit = async (e) => {
    e.preventDefault();
    // ... unchanged
  };

  const handlePanelSubmit = async (e) => {
    e.preventDefault();
    if (!panelName || !panelTests) {
        toast.error("Panel name and tests are required.");
        return;
    }
    setIsSubmittingPanel(true);
    try {
        const testsArray = panelTests.split(',').map(t => t.trim());
        await addDoc(collection(db, "testPanels"), {
            name: panelName,
            tests: testsArray
        });
        toast.success(`Panel "${panelName}" created successfully.`);
        setPanelName('');
        setPanelTests('');
    } catch (error) {
        toast.error("Failed to create panel.");
        console.error(error);
    } finally {
        setIsSubmittingPanel(false);
    }
  };

  return (
    <PageContainer>
      <SettingsCard>
        <CardHeader>{t('settings_panels_header')}</CardHeader>
        <Form onSubmit={handlePanelSubmit}>
            <InputGroup>
                <label>{t('settings_panelName')}</label>
                <Input value={panelName} onChange={e => setPanelName(e.target.value)} required/>
            </InputGroup>
            <InputGroup>
                <label>{t('settings_panelTests')}</label>
                <Input value={panelTests} onChange={e => setPanelTests(e.target.value)} placeholder="e.g., Glucose, Potassium, Creatinine" required/>
            </InputGroup>
            <SubmitButton type="submit" disabled={isSubmittingPanel}>{t('settings_panelCreate_button')}</SubmitButton>
        </Form>
        <ItemTable>
            <thead><tr><th>{t('settings_panelName_th')}</th><th>{t('settings_panelTests_th')}</th></tr></thead>
            <tbody>
                {loadingPanels ? <tr><td colSpan="2">Loading...</td></tr> : 
                testPanels.map(panel => (
                    <tr key={panel.id}><td>{panel.name}</td><td>{panel.tests.join(', ')}</td></tr>
                ))}
            </tbody>
        </ItemTable>
      </SettingsCard>

      <SettingsCard>
        <CardHeader>{t('settings_critical_header')}</CardHeader>
        <Form onSubmit={handleRangeSubmit}>
          <InputGroup>
            <label>{t('settings_testName')}</label>
            <Select value={selectedTest} onChange={e => setSelectedTest(e.target.value)}>
              {LAB_TESTS.map(test => <option key={test} value={test}>{test}</option>)}
            </Select>
          </InputGroup>
          <InputGroup>
            <label>{t('settings_criticalLow')}</label>
            <Input type="number" value={lowValue} onChange={e => setLowValue(e.target.value)} />
          </InputGroup>
          <InputGroup>
            <label>{t('settings_criticalHigh')}</label>
            <Input type="number" value={highValue} onChange={e => setHighValue(e.target.value)} />
          </InputGroup>
          <SubmitButton type="submit" disabled={isSubmittingRange}>
            {t('settings_saveRange_button')}
          </SubmitButton>
        </Form>
        <ItemTable>
            <thead>
                <tr>
                    <th>{t('settings_testName')}</th>
                    <th>{t('settings_criticalLow')}</th>
                    <th>{t('settings_criticalHigh')}</th>
                </tr>
            </thead>
            <tbody>
                {loadingRanges ? (
                    <tr><td colSpan="3">Loading...</td></tr>
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
        </ItemTable>
      </SettingsCard>
    </PageContainer>
  );
};

export default Settings;