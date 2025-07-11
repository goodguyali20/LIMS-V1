import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { FaExclamationTriangle } from 'react-icons/fa';
import { logAction } from '../utils/logAction.js'; // Import the logger

//--- STYLED COMPONENTS ---//
const FormContainer = styled.div` background: ${({ theme }) => theme.cardBg}; ${({ theme }) => theme.squircle(24)}; padding: 32px; box-shadow: ${({ theme }) => theme.shadow}; `;
const FormTitle = styled.h2` font-size: 1.75rem; margin-bottom: 24px; `;
const Form = styled.form` display: grid; grid-template-columns: 1fr 1fr; gap: 20px; @media (max-width: 768px) { grid-template-columns: 1fr; } `;
const InputGroup = styled.div` display: flex; flex-direction: column; gap: 8px; `;
const Label = styled.label` font-weight: 600; font-size: 0.9rem; `;
const Input = styled.input` padding: 12px; border: 1px solid ${({ theme }) => theme.borderColor}; ${({ theme }) => theme.squircle(12)}; background-color: ${({ theme }) => theme.body}; color: ${({ theme }) => theme.text}; transition: border-color 0.2s ease, box-shadow 0.2s ease; &:focus { outline: none; border-color: ${({ theme }) => theme.primary}; box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}4D; } `;
const Select = styled.select` padding: 12px; border: 1px solid ${({ theme }) => theme.borderColor}; ${({ theme }) => theme.squircle(12)}; background-color: ${({ theme }) => theme.body}; color: ${({ theme }) => theme.text}; &:focus { outline: none; border-color: ${({ theme }) => theme.primary}; } `;
const TestSelection = styled.div` grid-column: 1 / -1; `;
const SectionLabel = styled(Label)` font-size: 1.1rem; margin-top: 16px; border-top: 1px solid ${({ theme }) => theme.borderColor}; padding-top: 16px; `;
const TestGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 8px; `;
const TestCheckboxLabel = styled.label` display: flex; align-items: center; gap: 12px; padding: 12px; ${({ theme }) => theme.squircle(12)}; border: 1px solid ${({ theme }) => theme.borderColor}; cursor: pointer; transition: all 0.2s ease; &:hover { transform: translateY(-2px); border-color: ${({ theme }) => theme.primary}; } input[type="checkbox"] { width: 18px; height: 18px; accent-color: ${({ theme }) => theme.primary}; } span { direction: ltr; font-weight: 600; } `;
const SubmitButton = styled.button` grid-column: 1 / -1; padding: 14px; background: ${({ theme }) => theme.primaryGradient}; color: white; border: none; ${({ theme }) => theme.squircle(12)}; font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 16px; transition: transform 0.2s ease, box-shadow 0.2s ease; &:hover { transform: scale(1.02); box-shadow: 0 4px 12px ${({ theme }) => theme.primary}4D; } `;
const UrgentToggle = styled.label` display: flex; align-items: center; gap: 10px; padding: 12px; ${({ theme }) => theme.squircle(12)}; background-color: ${({ theme, checked }) => checked ? `${theme.warning}2A` : theme.body}; border: 1px solid ${({ theme, checked }) => checked ? theme.warning : theme.borderColor}; color: ${({ theme, checked }) => checked ? theme.warning : theme.text}; cursor: pointer; font-weight: 600; transition: all 0.2s ease; `;

const RegistrationForm = ({ onPatientRegistered }) => {
  const { t } = useTranslation();
  const [patientName, setPatientName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [referringDoctor, setReferringDoctor] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [availablePanels, setAvailablePanels] = useState([]);

  useEffect(() => {
    const fetchTestsAndPanels = async () => {
        const [testsSnapshot, panelsSnapshot] = await Promise.all([
            getDocs(collection(db, 'labTests')),
            getDocs(collection(db, 'labPanels'))
        ]);
        setAvailableTests(testsSnapshot.docs.map(doc => doc.data().name).sort());
        setAvailablePanels(panelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchTestsAndPanels();
  }, []);

  const handlePanelChange = (panel) => {
    const allTestsInPanel = panel.tests;
    const isPanelSelected = allTestsInPanel.every(test => selectedTests.includes(test));
    setSelectedTests(prev => isPanelSelected ? prev.filter(test => !allTestsInPanel.includes(test)) : [...new Set([...prev, ...allTestsInPanel])]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName || !dob || selectedTests.length === 0) return toast.warn("Please fill all fields and select at least one test.");
    try {
      const patientRef = await addDoc(collection(db, 'patients'), { name: patientName, dob, gender, registeredAt: serverTimestamp(), registeredBy: auth.currentUser.uid });
      const orderRef = await addDoc(collection(db, 'testOrders'), {
        patientId: patientRef.id,
        patientName,
        tests: selectedTests,
        referringDoctor,
        status: 'registered',
        priority: isUrgent ? 'urgent' : 'routine',
        createdAt: serverTimestamp()
      });
      
      // Log the action
      await logAction('Patient Registered', { patientId: patientRef.id, patientName, orderId: orderRef.id, tests: selectedTests.join(', ') });

      toast.success(`${patientName} has been registered successfully!`);
      setPatientName(''); setDob(''); setReferringDoctor(''); setSelectedTests([]); setIsUrgent(false);
      if (onPatientRegistered) onPatientRegistered();
    } catch (error) {
      console.error("Error creating patient and order: ", error);
      toast.error("Failed to register patient.");
    }
  };

  return (
    <FormContainer>
      <FormTitle>{t('registerPatient')}</FormTitle>
      <Form onSubmit={handleSubmit}>
        <InputGroup><Label>{t('patientName')}</Label><Input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} required /></InputGroup>
        <InputGroup><Label>{t('dateOfBirth')}</Label><Input type="date" value={dob} onChange={e => setDob(e.target.value)} required /></InputGroup>
        <InputGroup><Label>{t('gender')}</Label><Select value={gender} onChange={e => setGender(e.target.value)}><option value="Male">{t('male')}</option><option value="Female">{t('female')}</option></Select></InputGroup>
        <InputGroup><Label>Referring Doctor</Label><Input type="text" value={referringDoctor} onChange={e => setReferringDoctor(e.target.value)} placeholder="e.g., Dr. Ahmed Ali" /></InputGroup>
        <InputGroup><Label>Priority</Label><UrgentToggle checked={isUrgent}><input type="checkbox" checked={isUrgent} onChange={() => setIsUrgent(!isUrgent)} /><FaExclamationTriangle />Mark as Urgent</UrgentToggle></InputGroup>
        
        <TestSelection>
          <SectionLabel>Test Panels</SectionLabel>
          <TestGrid>{availablePanels.map(panel => (<TestCheckboxLabel key={panel.id}><input type="checkbox" checked={panel.tests.every(test => selectedTests.includes(test))} onChange={() => handlePanelChange(panel)} /><span>{panel.name}</span></TestCheckboxLabel>))}</TestGrid>
          <SectionLabel>Individual Tests</SectionLabel>
          <TestGrid>{availableTests.map(test => (<TestCheckboxLabel key={test}><input type="checkbox" id={test} checked={selectedTests.includes(test)} onChange={() => setSelectedTests(prev => prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test])} /><span>{test}</span></TestCheckboxLabel>))}</TestGrid>
        </TestSelection>

        <SubmitButton type="submit">{t('registerPatient')}</SubmitButton>
      </Form>
    </FormContainer>
  );
};

export default RegistrationForm;