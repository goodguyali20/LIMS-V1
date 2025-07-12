import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { fadeIn } from '../../styles/animations';
import { useAuth } from '../../contexts/AuthContext';
import { logAuditEvent } from '../../utils/auditLogger';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTestCatalog, departmentColors } from '../../contexts/TestContext';
import { FaUser, FaVial, FaCheckCircle, FaChevronRight, FaChevronLeft } from 'react-icons/fa';

// --- Main Container ---
const WizardContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
  max-width: 1000px;
  margin: auto;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
  overflow: hidden;
`;

// --- Progress Bar ---
const ProgressBar = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Step = styled.div`
  flex: 1;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  border-bottom: 3px solid transparent;
  color: ${({ theme, active }) => active ? theme.colors.primaryPlain : theme.colors.textSecondary};
  border-color: ${({ theme, active }) => active ? theme.colors.primaryPlain : 'transparent'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  opacity: ${({ active, completed }) => (active || completed ? 1 : 0.5)};
`;

// --- Step Content ---
const StepContent = styled.div`
  padding: 2.5rem;
`;

const StepHeader = styled.h3`
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 2rem;
`;

// --- Step 1: Patient Info ---
const PatientInfoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem 2rem;
`;

// --- Step 2: Test Selection ---
const TestSelectionLayout = styled.div`
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 2rem;
    height: 50vh;
    min-height: 400px;
`;

const DeptList = styled.div`
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    overflow-y: auto;
    padding-right: 1rem;
`;

const DeptItem = styled.div`
    padding: 0.75rem 1rem;
    cursor: pointer;
    font-weight: 600;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    background-color: ${({ active, color }) => active ? color : 'transparent'};
    color: ${({ active, theme }) => active ? 'white' : theme.colors.text};
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: ${({ active, color, theme }) => active ? color : theme.colors.background};
        transform: translateX(3px);
    }
`;

const TestsGrid = styled.div`
    overflow-y: auto;
    padding-right: 1rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
`;

// --- Step 3: Review ---
const ReviewGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    h4 {
        border-bottom: 2px solid ${({ theme }) => theme.colors.border};
        padding-bottom: 0.5rem;
    }
    ul {
        list-style: none;
        padding-left: 0;
    }
    li {
        margin-bottom: 0.5rem;
        background-color: ${({ theme }) => theme.colors.background};
        padding: 0.5rem;
        border-radius: 8px;
    }
`;

// --- Common Components ---
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
const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  label { cursor: pointer; }
  input { cursor: pointer; }
`;
const UrgentCheckbox = styled(CheckboxGroup)`
    margin-top: 2rem;
    padding: 1rem;
    background-color: #fff0f0;
    border: 1px solid ${({ theme }) => theme.colors.error};
    border-radius: 12px;
    color: ${({ theme }) => theme.colors.error};
    font-weight: bold;
`;
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 1.5rem;
`;
const WizardButton = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-weight: 600;
  color: white;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:disabled { 
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textSecondary};
    cursor: not-allowed;
  }
`;

const PatientRegistration = () => {
    const [step, setStep] = useState(1);
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { labTests } = useTestCatalog();

    const [patientName, setPatientName] = useState('');
    const [age, setAge] = useState('');
    const [patientId, setPatientId] = useState('');
    const [referringDoctor, setReferringDoctor] = useState('');
    const [selectedTests, setSelectedTests] = useState(new Set());
    const [isUrgent, setIsUrgent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [activeDept, setActiveDept] = useState('Chemistry');

    const handleTestSelection = (testName) => {
        setSelectedTests(prev => {
            const newSet = new Set(prev);
            if (newSet.has(testName)) newSet.delete(testName);
            else newSet.add(testName);
            return newSet;
        });
    };

    const grouped_tests = useMemo(() => labTests.reduce((acc, test) => {
        const dept = test.department || 'General';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(test);
        return acc;
    }, {}), [labTests]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!patientName || !age || selectedTests.size === 0) {
            toast.error("Patient Name, Age, and at least one test are required.");
            return;
        }
        setIsSubmitting(true);
        try {
            const orderData = {
                patientName, age,
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
        } catch (error) { toast.error("Failed to create order."); } 
        finally { setIsSubmitting(false); }
    };
    
    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <>
                        <StepHeader>{t('registration_patientInfo')}</StepHeader>
                        <PatientInfoGrid>
                           <InputGroup><label>{t('registration_patientName')}*</label><Input value={patientName} onChange={e => setPatientName(e.target.value)} required /></InputGroup>
                           <InputGroup><label>{t('registration_age')}*</label><Input type="number" value={age} onChange={e => setAge(e.target.value)} required /></InputGroup>
                           <InputGroup><label>{t('registration_patientId')}</label><Input value={patientId} onChange={e => setPatientId(e.target.value)} /></InputGroup>
                           <InputGroup><label>{t('registration_referringDoctor')}</label><Input value={referringDoctor} onChange={e => setReferringDoctor(e.target.value)} /></InputGroup>
                        </PatientInfoGrid>
                    </>
                );
            case 2:
                return (
                    <>
                        <StepHeader>{t('registration_testSelection')}</StepHeader>
                        <TestSelectionLayout>
                            <DeptList>
                                {Object.keys(grouped_tests).sort().map(dept => (
                                    <DeptItem key={dept} active={activeDept === dept} color={departmentColors[dept]} onClick={() => setActiveDept(dept)}>
                                        {dept}
                                    </DeptItem>
                                ))}
                            </DeptList>
                            <TestsGrid>
                                {grouped_tests[activeDept]?.map(test => (
                                    <CheckboxGroup key={test.id}>
                                        <input type="checkbox" id={test.id} checked={selectedTests.has(test.name)} onChange={() => handleTestSelection(test.name)} />
                                        <label htmlFor={test.id}>{test.name}</label>
                                    </CheckboxGroup>
                                ))}
                            </TestsGrid>
                        </TestSelectionLayout>
                    </>
                );
            case 3:
                return (
                    <>
                        <StepHeader>Review Order</StepHeader>
                        <ReviewGrid>
                            <div>
                                <h4>{t('registration_patientInfo')}</h4>
                                <ul>
                                    <li><strong>{t('registration_patientName')}:</strong> {patientName}</li>
                                    <li><strong>{t('registration_age')}:</strong> {age}</li>
                                    {patientId && <li><strong>{t('registration_patientId')}:</strong> {patientId}</li>}
                                    {referringDoctor && <li><strong>{t('registration_referringDoctor')}:</strong> {referringDoctor}</li>}
                                </ul>
                            </div>
                            <div>
                                <h4>{t('registration_testSelection')} ({selectedTests.size})</h4>
                                <ul>{Array.from(selectedTests).map(test => <li key={test}>{test}</li>)}</ul>
                            </div>
                        </ReviewGrid>
                        <UrgentCheckbox>
                            <input type="checkbox" id="urgent" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} />
                            <label htmlFor="urgent">{t('registration_urgent')}</label>
                        </UrgentCheckbox>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <WizardContainer>
            <ProgressBar>
                <Step active={step === 1} completed={step > 1}><FaUser /> {t('registration_patientInfo')}</Step>
                <Step active={step === 2} completed={step > 2}><FaVial /> {t('registration_testSelection')}</Step>
                <Step active={step === 3}><FaCheckCircle /> Review & Submit</Step>
            </ProgressBar>
            <StepContent>
                {renderStepContent()}
                <ButtonContainer>
                    {step > 1 && <WizardButton type="button" onClick={handleBack}><FaChevronLeft /> Back</WizardButton>}
                    <div style={{flex: 1}} /> {/* Spacer */}
                    {step < 3 ? 
                        <WizardButton type="button" onClick={handleNext} disabled={ (step === 1 && (!patientName || !age)) || (step === 2 && selectedTests.size === 0) }><FaChevronRight /> Next</WizardButton>
                        :
                        <WizardButton type="button" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? t('registration_submitting') : t('registration_submit_button')}</WizardButton>
                    }
                </ButtonContainer>
            </StepContent>
        </WizardContainer>
    );
};

export default PatientRegistration;