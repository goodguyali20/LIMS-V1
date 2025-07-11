import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { fadeIn } from '../../styles/animations';
import { useAuth } from '../../contexts/AuthContext';
import { logAuditEvent } from '../../utils/auditLogger';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// This list should ideally come from your settings, but we'll define it here for now.
const ALL_AVAILABLE_TESTS = ["Glucose", "Potassium", "Hemoglobin", "WBC", "Platelet", "Creatinine", "ALT", "AST"];

const PageContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
  max-width: 900px;
  margin: auto;
`;

const FormCard = styled.form`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
`;

const CardHeader = styled.h1`
  margin-top: 0;
  margin-bottom: 1.5rem;
`;

const Section = styled.div`
    margin-bottom: 2rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding-bottom: 2rem;
`;

const SectionHeader = styled.h3`
    margin-bottom: 1rem;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

const TestSelectionContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.2rem;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  label { cursor: pointer; }
  input { cursor: pointer; }
`;

const UrgentCheckbox = styled(CheckboxGroup)`
    margin-top: 1rem;
    padding: 1rem;
    background-color: #fff0f0;
    border: 1px solid ${({ theme }) => theme.colors.error};
    border-radius: 12px;
    color: ${({ theme }) => theme.colors.error};
    font-weight: bold;
`;

const SubmitButton = styled.button`
  margin-top: 2rem;
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  color: white;
  background: ${({ theme }) => theme.colors.primary};
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;


const PatientRegistration = () => {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    // Form State
    const [patientName, setPatientName] = useState('');
    const [age, setAge] = useState(''); // <-- New Age field
    const [patientId, setPatientId] = useState('');
    const [referringDoctor, setReferringDoctor] = useState('');
    const [selectedTests, setSelectedTests] = useState(new Set());
    const [isUrgent, setIsUrgent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Data from DB
    const [testPanels, setTestPanels] = useState([]);

    useEffect(() => {
        const unsubPanels = onSnapshot(collection(db, "testPanels"), (snapshot) => {
            setTestPanels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubPanels();
    }, []);

    const handleTestSelection = (testName) => {
        setSelectedTests(prev => {
            const newSet = new Set(prev);
            if (newSet.has(testName)) {
                newSet.delete(testName);
            } else {
                newSet.add(testName);
            }
            return newSet;
        });
    };
    
    const handlePanelSelection = (panel) => {
        const allTestsSelected = panel.tests.every(test => selectedTests.has(test));
        let newSet = new Set(selectedTests);
        if (allTestsSelected) {
            panel.tests.forEach(test => newSet.delete(test));
        } else {
            panel.tests.forEach(test => newSet.add(test));
        }
        setSelectedTests(newSet);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Updated validation
        if (!patientName || !age || selectedTests.size === 0) {
            toast.error("Patient Name, Age, and at least one test are required.");
            return;
        }
        setIsSubmitting(true);
        try {
            const orderData = {
                patientName,
                age, // <-- Add age to data
                patientId: patientId || "N/A",
                referringDoctor: referringDoctor || "N/A",
                tests: Array.from(selectedTests),
                priority: isUrgent ? "Urgent" : "Normal",
                status: "Pending Sample",
                createdAt: new Date(),
                createdBy: currentUser.email,
            };
            const newOrderRef = await addDoc(collection(db, "testOrders"), orderData);
            await logAuditEvent("Patient Registered", { orderId: newOrderRef.id, patientName });
            toast.success(`Order for ${patientName} created successfully!`);
            navigate(`/order/${newOrderRef.id}`);
        } catch (error) {
            toast.error("Failed to create order.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageContainer>
            <FormCard onSubmit={handleSubmit}>
                <CardHeader>{t('registration_header')}</CardHeader>

                <Section>
                    <SectionHeader>{t('registration_patientInfo')}</SectionHeader>
                    <Grid>
                        <InputGroup>
                            <label>{t('registration_patientName')}*</label>
                            <Input value={patientName} onChange={e => setPatientName(e.target.value)} required />
                        </InputGroup>
                        <InputGroup>
                            <label>{t('registration_age')}*</label>
                            <Input type="number" value={age} onChange={e => setAge(e.target.value)} required />
                        </InputGroup>
                        <InputGroup>
                            <label>{t('registration_patientId')}</label>
                            <Input value={patientId} onChange={e => setPatientId(e.target.value)} />
                        </InputGroup>
                        <InputGroup>
                            <label>{t('registration_referringDoctor')}</label>
                            <Input value={referringDoctor} onChange={e => setReferringDoctor(e.target.value)} />
                        </InputGroup>
                    </Grid>
                </Section>

                <Section>
                    <SectionHeader>{t('registration_testSelection')}*</SectionHeader>
                    <h4>Panels</h4>
                    <TestSelectionContainer>
                    {testPanels.map(panel => (
                        <CheckboxGroup key={panel.id}>
                            <input 
                                type="checkbox" 
                                id={panel.id}
                                checked={panel.tests.every(test => selectedTests.has(test))}
                                onChange={() => handlePanelSelection(panel)}
                            />
                            <label htmlFor={panel.id}><strong>{panel.name}</strong> ({panel.tests.join(', ')})</label>
                        </CheckboxGroup>
                    ))}
                    </TestSelectionContainer>
                    <h4 style={{marginTop: '1.5rem'}}>Individual Tests</h4>
                    <TestSelectionContainer>
                        {ALL_AVAILABLE_TESTS.map(testName => (
                             <CheckboxGroup key={testName}>
                                <input 
                                    type="checkbox" 
                                    id={testName}
                                    checked={selectedTests.has(testName)}
                                    onChange={() => handleTestSelection(testName)}
                                />
                                <label htmlFor={testName}>{testName}</label>
                            </CheckboxGroup>
                        ))}
                    </TestSelectionContainer>
                </Section>
                
                <UrgentCheckbox>
                    <input type="checkbox" id="urgent" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} />
                    <label htmlFor="urgent">{t('registration_urgent')}</label>
                </UrgentCheckbox>
                
                <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t('registration_submitting') : t('registration_submit_button')}
                </SubmitButton>
            </FormCard>
        </PageContainer>
    );
};

export default PatientRegistration;