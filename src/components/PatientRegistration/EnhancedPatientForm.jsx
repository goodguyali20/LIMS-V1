import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generatePatientSchema } from '../../utils/patientRegistrationUtils';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaIdCard, FaFlask, FaPrint, FaEye, FaEdit, FaNotesMedical, FaArrowRight, FaSave, FaArrowLeft, FaClipboardList, FaSpinner, FaBarcode, FaSmileBeam, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Select from 'react-select';
import GlowCard from '../common/GlowCard';
import GlowButton from '../common/GlowButton';
import TestSelectionPanel from './TestSelectionPanel';
import PrintPreviewModal from './PrintPreviewModal';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';
import { useRef } from 'react';
import Confetti from 'react-confetti';

// Utility functions for field rendering
const shouldRenderField = (fields, section, fieldName) => {
  if (section) {
    return fields[section]?.[fieldName]?.enabled !== false;
  }
  return fields[fieldName]?.enabled !== false;
};

const isFieldRequired = (fields, section, fieldName) => {
  if (section) {
    return fields[section]?.[fieldName]?.required === true;
  }
  return fields[fieldName]?.required === true;
};

const FormContainer = styled(GlowCard)`
  padding: 2rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  position: relative;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
`;

const StepCircle = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ $isActive, $isCompleted, theme }) => 
    $isCompleted ? 'linear-gradient(135deg, #10b981, #059669)' :
    $isActive ? 'linear-gradient(135deg, #667eea, #764ba2)' :
    'rgba(255, 255, 255, 0.1)'};
  border: 3px solid ${({ $isActive, $isCompleted, theme }) => 
    $isCompleted ? '#10b981' :
    $isActive ? '#667eea' :
    'rgba(255, 255, 255, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const StepLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ $isActive, $isCompleted, theme }) => 
    $isCompleted ? '#10b981' :
    $isActive ? theme.colors.text :
    theme.colors.textSecondary};
  text-align: center;
  transition: all 0.3s ease;
`;

const StepConnector = styled.div`
  position: absolute;
  top: 25px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: ${({ $isCompleted, theme }) => 
    $isCompleted ? '#10b981' : 'rgba(255, 255, 255, 0.1)'};
  z-index: 1;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid ${({ theme, $hasError }) => 
    $hasError ? theme.colors.error : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  
  &:hover {
    border-color: rgba(102, 126, 234, 0.5);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
    box-shadow: 
      0 8px 32px rgba(102, 126, 234, 0.3),
      0 4px 16px rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
  
  &:focus {
    border-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.error : '#667eea'};
    box-shadow: ${({ theme, $hasError }) => 
      $hasError ? theme.shadows.glow.error : '0 0 0 3px rgba(102, 126, 234, 0.2)'};
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.95);
    color: #333;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 2px solid ${({ theme, $hasError }) => 
    $hasError ? theme.colors.error : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;
  backdrop-filter: blur(20px);
  
  &:hover {
    border-color: rgba(102, 126, 234, 0.5);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
    box-shadow: 
      0 8px 32px rgba(102, 126, 234, 0.3),
      0 4px 16px rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
  
  &:focus {
    border-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.error : '#667eea'};
    box-shadow: ${({ theme, $hasError }) => 
      $hasError ? theme.shadows.glow.error : '0 0 0 3px rgba(102, 126, 234, 0.2)'};
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.95);
    color: #333;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SelectContainer = styled.div`
  .react-select__control {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    border: 2px solid ${({ $hasError, theme }) => 
      $hasError ? theme.colors.error : 'rgba(255, 255, 255, 0.1)'};
    border-radius: 12px;
    box-shadow: none;
    backdrop-filter: blur(20px);
    
    &:hover {
      border-color: rgba(102, 126, 234, 0.5);
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
      box-shadow: 
        0 8px 32px rgba(102, 126, 234, 0.3),
        0 4px 16px rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
    
    &.react-select__control--is-focused {
      border-color: ${({ $hasError, theme }) => 
        $hasError ? theme.colors.error : '#667eea'};
      box-shadow: ${({ $hasError, theme }) => 
        $hasError ? theme.shadows.glow.error : '0 0 0 3px rgba(102, 126, 234, 0.2)'};
      transform: scale(1.02);
      background: rgba(255, 255, 255, 0.95);
    }
  }
  
  .react-select__menu {
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
  }
  
  .react-select__option {
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    
    &:hover {
      background: rgba(102, 126, 234, 0.1);
    }
    
    &.react-select__option--is-selected {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
  }
  
  .react-select__single-value {
    color: ${({ theme }) => theme.colors.text};
  }
  
  .react-select__input-container {
    color: ${({ theme }) => theme.colors.text};
  }
  
  .react-select__placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

// Add styled components for tips and warnings
const FieldTip = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`;
const DuplicateWarning = styled.div`
  font-size: 0.95rem;
  color: #eab308;
  background: rgba(234, 179, 8, 0.08);
  border-left: 4px solid #eab308;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  margin-top: 4px;
`;
const ErrorMessage = styled.div`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.error || '#ef4444'};
  margin-top: 2px;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding-top: 1.5rem;
  border-top: 2px solid rgba(255, 255, 255, 0.1);
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const SummarySection = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SummaryTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SummaryLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const SummaryValue = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

// Add new styled components for layout
const RegistrationLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 3rem;
  }
`;

const MainFormColumn = styled.div`
  flex: 2;
  min-width: 0;
`;

const StickySidebar = styled.div`
  flex: 1;
  min-width: 320px;
  max-width: 400px;
  margin-top: 2rem;
  @media (min-width: 1024px) {
    position: sticky;
    top: 2rem;
    align-self: flex-start;
    margin-top: 0;
    z-index: 10;
  }
`;

const AUTOSAVE_KEY = 'patientRegistrationDraft';

const EnhancedPatientForm = ({ onPatientRegistered, patients = [] }) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTests, setSelectedTests] = useState([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { t } = useTranslation();
  const justSubmitted = useRef(false);
  const skipNextAutosave = useRef(false);
  const autosaveSubscription = useRef(null);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    getValues,
    setValue
  } = useForm({
    resolver: zodResolver(generatePatientSchema(settings.patientRegistrationFields)),
    mode: 'onChange',
  });

  // Gender options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  // State options
  const stateOptions = [
    { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
  ];

  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const { scan, isScanning, lastScanned } = useBarcodeScanner({
    enabled: scanning,
    onScan: (data) => {
      setValue('patientId', data);
      setScanning(false);
      setScanError('');
    },
    onError: (err) => {
      setScanError(err.message);
      setScanning(false);
    },
    debounceMs: 200,
    minLength: 4,
    maxLength: 32,
  });

  // Mutation for adding new patient
  const addPatientMutation = useMutation({
    mutationFn: async (patientData) => {
      const docRef = await addDoc(collection(db, "patients"), {
        ...patientData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef;
    },
    onSuccess: (docRef) => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient registered successfully!');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
      
      // Create order data for printing
      const orderData = {
        id: docRef.id,
        referringDoctor: getValues('referringDoctor') || 'N/A',
        priority: getValues('priority') || 'Normal',
        notes: getValues('notes') || ''
      };
      
      // Show print preview
      setShowPrintPreview(true);
      
      if (onPatientRegistered) {
        onPatientRegistered(docRef.id);
      }
    },
    onError: (error) => {
      console.error('Error adding patient:', error);
      toast.error('Failed to register patient');
    },
  });

  // Restore autosaved data on mount
  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) {
          reset(parsed.formData);
        }
        if (parsed.selectedTests) {
          setSelectedTests(parsed.selectedTests);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [reset]);

  // Autosave on form or test change
  useEffect(() => {
    autosaveSubscription.current = watch((formData) => {
      if (justSubmitted.current) {
        justSubmitted.current = false;
        return;
      }
      if (skipNextAutosave.current) {
        skipNextAutosave.current = false;
        return;
      }
      localStorage.setItem(
        AUTOSAVE_KEY,
        JSON.stringify({ formData, selectedTests })
      );
    });
    return () => {
      if (autosaveSubscription.current) {
        autosaveSubscription.current.unsubscribe();
      }
    };
  }, [watch, selectedTests]);

  useEffect(() => {
    localStorage.setItem(
      AUTOSAVE_KEY,
      JSON.stringify({ formData: getValues(), selectedTests })
    );
  }, [selectedTests]);

  // Clear autosave on successful submit
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await addPatientMutation.mutateAsync(data);
      localStorage.removeItem(AUTOSAVE_KEY);
      justSubmitted.current = true;
      skipNextAutosave.current = true;
      if (autosaveSubscription.current) {
        autosaveSubscription.current.unsubscribe();
      }
      // After reset, re-subscribe
      autosaveSubscription.current = watch((formData) => {
        if (justSubmitted.current) {
          justSubmitted.current = false;
          return;
        }
        if (skipNextAutosave.current) {
          skipNextAutosave.current = false;
          return;
        }
        localStorage.setItem(
          AUTOSAVE_KEY,
          JSON.stringify({ formData, selectedTests })
        );
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [duplicateWarning, setDuplicateWarning] = useState('');
  const watchedFirstName = watch('firstName');
  const watchedLastName = watch('lastName');
  const watchedPhone = watch('phoneNumber');
  const watchedEmail = watch('email');

  useEffect(() => {
    if (!watchedFirstName && !watchedLastName && !watchedPhone && !watchedEmail) {
      setDuplicateWarning('');
      return;
    }
    const match = patients.find(
      p =>
        (watchedFirstName && watchedLastName &&
          p.firstName?.toLowerCase() === watchedFirstName.toLowerCase() &&
          p.lastName?.toLowerCase() === watchedLastName.toLowerCase()) ||
        (watchedPhone && p.phoneNumber === watchedPhone) ||
        (watchedEmail && p.email?.toLowerCase() === watchedEmail.toLowerCase())
    );
    if (match) {
      setDuplicateWarning('A patient with similar details already exists. Please review before submitting.');
    } else {
      setDuplicateWarning('');
    }
  }, [watchedFirstName, watchedLastName, watchedPhone, watchedEmail, patients]);

  const handleTestSelection = (testName) => {
    if (!selectedTests.includes(testName)) {
      setSelectedTests([...selectedTests, testName]);
    }
  };

  const handleTestRemoval = (testName) => {
    setSelectedTests(selectedTests.filter(test => test !== testName));
  };

  const renderField = (fieldName, fieldConfig, section = null) => {
    if (!fieldConfig) return null;
    if (!shouldRenderField(settings.patientRegistrationFields, section, fieldName)) {
      return null;
    }

    const isRequired = isFieldRequired(settings.patientRegistrationFields, section, fieldName);
    const fieldPath = section ? `${section}.${fieldName}` : fieldName;
    const errorPath = section ? errors[section]?.[fieldName] : errors[fieldName];
    const fieldLabel = fieldConfig.label || fieldName;

    // Add barcode scan button for patientId field
    if (fieldName === 'patientId') {
      return (
        <InputGroup key={fieldPath}>
          <Label htmlFor={fieldPath}>
            {fieldLabel} {isRequired && '*'}
          </Label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Controller
              name={fieldPath}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id={fieldPath}
                  name={fieldPath}
                  type="text"
                  placeholder={`Scan or enter ${fieldLabel.toLowerCase()}`}
                  $hasError={!!errorPath}
                  autoComplete="off"
                  value={field.value ?? ''}
                />
              )}
            />
            <GlowButton
              type="button"
              onClick={() => setScanning((s) => !s)}
              style={{ minWidth: 40, padding: '0.5rem' }}
              title={scanning ? 'Stop scanning' : 'Scan barcode/QR'}
            >
              {scanning ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaBarcode />}
            </GlowButton>
          </div>
          {scanError && <ErrorMessage>{scanError}</ErrorMessage>}
          {errorPath && <ErrorMessage>{errorPath.message}</ErrorMessage>}
          {fieldName === 'patientId' && (
            <FieldTip>Scan the patient ID barcode or enter it manually.</FieldTip>
          )}
        </InputGroup>
      );
    }

    // Show duplicate warning below firstName, lastName, phoneNumber, or email fields
    const showDup =
      duplicateWarning &&
      (['firstName', 'lastName', 'phoneNumber', 'email'].includes(fieldName));
    // Add helpful tips for certain fields
    let tip = '';
    if (fieldName === 'email') tip = 'Enter a valid email address (e.g., user@example.com).';
    if (fieldName === 'phoneNumber') tip = 'Enter a valid phone number including area code.';
    if (fieldName === 'age') tip = 'Enter the patient’s age in years.';
    return (
      <InputGroup key={fieldPath}>
        <Label htmlFor={fieldPath}>
          {fieldLabel} {isRequired && '*'}
        </Label>
        <Controller
          name={fieldPath}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id={fieldPath}
              name={fieldPath}
              type={fieldName === 'age' ? 'number' : fieldName === 'email' ? 'email' : 'text'}
              placeholder={`Enter ${fieldLabel.toLowerCase()}`}
              min={fieldName === 'age' ? '0' : undefined}
              $hasError={!!errorPath}
              autoComplete="off"
              value={field.value ?? ''}
            />
          )}
        />
        {errorPath && (
          <ErrorMessage>{errorPath.message}</ErrorMessage>
        )}
        {showDup && <DuplicateWarning>{duplicateWarning}</DuplicateWarning>}
        {tip && <FieldTip>{tip}</FieldTip>}
      </InputGroup>
    );
  };

  const renderSelectField = (fieldName, fieldConfig, options, section = null) => {
    if (!fieldConfig) return null;
    if (!shouldRenderField(settings.patientRegistrationFields, section, fieldName)) {
      return null;
    }

    const isRequired = isFieldRequired(settings.patientRegistrationFields, section, fieldName);
    const fieldPath = section ? `${section}.${fieldName}` : fieldName;
    const errorPath = section ? errors[section]?.[fieldName] : errors[fieldName];
    const fieldLabel = fieldConfig.label || fieldName;

    return (
      <InputGroup key={fieldPath}>
        <Label htmlFor={fieldPath}>
          {fieldLabel} {isRequired && '*'}
        </Label>
        <Controller
          name={fieldPath}
          control={control}
          render={({ field }) => (
            <SelectContainer $hasError={!!errorPath}>
              <Select
                {...field}
                options={options}
                placeholder={`Select ${fieldLabel.toLowerCase()}`}
                classNamePrefix="react-select"
                isClearable
                onChange={(option) => field.onChange(option?.value || '')}
                value={options.find(option => option.value === (field.value ?? '')) || null}
              />
            </SelectContainer>
          )}
        />
        {errorPath && (
          <ErrorMessage>{errorPath.message}</ErrorMessage>
        )}
      </InputGroup>
    );
  };

  const renderTextAreaField = (fieldName, fieldConfig, section = null) => {
    if (!fieldConfig) return null;
    if (!shouldRenderField(settings.patientRegistrationFields, section, fieldName)) {
      return null;
    }

    const isRequired = isFieldRequired(settings.patientRegistrationFields, section, fieldName);
    const fieldPath = section ? `${section}.${fieldName}` : fieldName;
    const errorPath = section ? errors[section]?.[fieldName] : errors[fieldName];
    const fieldLabel = fieldConfig.label || fieldName;

    return (
      <InputGroup key={fieldPath}>
        <Label htmlFor={fieldPath}>
          {fieldLabel} {isRequired && '*'}
        </Label>
        <Controller
          name={fieldPath}
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              id={fieldPath}
              name={fieldPath}
              placeholder={`Enter ${fieldLabel.toLowerCase()}`}
              $hasError={!!errorPath}
              value={field.value ?? ''}
            />
          )}
        />
        {errorPath && (
          <ErrorMessage>{errorPath.message}</ErrorMessage>
        )}
      </InputGroup>
    );
  };

  return (
    <>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={250} recycle={false} />} 
      <FormContainer>
        <h2 style={{ marginBottom: '1.5rem', color: '#667eea', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaSmileBeam style={{ color: '#f093fb' }} /> {t('patientRegistration.title')}
        </h2>
        <RegistrationLayout>
          <MainFormColumn>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Personal Info Section */}
              <FormSection>
                <SectionTitle>
                  <FaUser /> {t('patientRegistration.personalInfo')}
                </SectionTitle>
                <FormGrid>
                  {renderField('patientId', settings.patientRegistrationFields.patientId)}
                  {renderField('firstName', settings.patientRegistrationFields.firstName)}
                  {renderField('lastName', settings.patientRegistrationFields.lastName)}
                  {renderField('age', settings.patientRegistrationFields.age)}
                  {renderSelectField('gender', settings.patientRegistrationFields.gender, genderOptions)}
                  {renderField('phoneNumber', settings.patientRegistrationFields.phoneNumber)}
                  {renderField('email', settings.patientRegistrationFields.email)}
                </FormGrid>
              </FormSection>

              {/* Address Section */}
              {shouldRenderField(settings.patientRegistrationFields, 'address') && (
                <FormSection>
                  <SectionTitle>
                    <FaMapMarkerAlt /> {t('patientRegistration.addressInfo')}
                  </SectionTitle>
                  <FormGrid>
                    {renderField('street', settings.patientRegistrationFields.address?.street, 'address')}
                    {renderField('city', settings.patientRegistrationFields.address?.city, 'address')}
                    {renderSelectField('state', settings.patientRegistrationFields.address?.state, stateOptions, 'address')}
                    {renderField('zipCode', settings.patientRegistrationFields.address?.zipCode, 'address')}
                    {renderField('country', settings.patientRegistrationFields.address?.country, 'address')}
                  </FormGrid>
                </FormSection>
              )}

              {/* Emergency Contact Section */}
              {shouldRenderField(settings.patientRegistrationFields, 'emergencyContact') && (
                <FormSection>
                  <SectionTitle>
                    <FaPhone /> {t('patientRegistration.emergencyContact')}
                  </SectionTitle>
                  <FormGrid>
                    {renderField('name', settings.patientRegistrationFields.emergencyContact?.name, 'emergencyContact')}
                    {renderField('relationship', settings.patientRegistrationFields.emergencyContact?.relationship, 'emergencyContact')}
                    {renderField('phoneNumber', settings.patientRegistrationFields.emergencyContact?.phoneNumber, 'emergencyContact')}
                  </FormGrid>
                </FormSection>
              )}

              {/* Medical History Section */}
              {shouldRenderField(settings.patientRegistrationFields, 'medicalHistory') && (
                <FormSection>
                  <SectionTitle>
                    <FaNotesMedical /> {t('patientRegistration.medicalHistory')}
                  </SectionTitle>
                  <FormGrid>
                    {renderTextAreaField('allergies', settings.patientRegistrationFields.medicalHistory?.allergies, 'medicalHistory')}
                    {renderTextAreaField('medications', settings.patientRegistrationFields.medicalHistory?.medications, 'medicalHistory')}
                    {renderTextAreaField('conditions', settings.patientRegistrationFields.medicalHistory?.conditions, 'medicalHistory')}
                    {renderTextAreaField('notes', settings.patientRegistrationFields.medicalHistory?.notes, 'medicalHistory')}
                  </FormGrid>
                </FormSection>
              )}

              {/* Insurance Section */}
              {shouldRenderField(settings.patientRegistrationFields, 'insurance') && (
                <FormSection>
                  <SectionTitle>
                    <FaIdCard /> {t('patientRegistration.insuranceInfo')}
                  </SectionTitle>
                  <FormGrid>
                    {renderField('provider', settings.patientRegistrationFields.insurance?.provider, 'insurance')}
                    {renderField('policyNumber', settings.patientRegistrationFields.insurance?.policyNumber, 'insurance')}
                    {renderField('groupNumber', settings.patientRegistrationFields.insurance?.groupNumber, 'insurance')}
                  </FormGrid>
                </FormSection>
              )}

              {/* Test Selection Section */}
              <FormSection>
                <SectionTitle>
                  <FaFlask /> {t('patientRegistration.testSelection')}
                </SectionTitle>
                <TestSelectionPanel
                  selectedTests={selectedTests}
                  onTestSelection={handleTestSelection}
                  onTestRemoval={handleTestRemoval}
                />
              </FormSection>

              {/* Form Actions */}
              <FormActions>
                <GlowButton
                  type="button"
                  onClick={() => setShowPrintPreview(true)}
                  disabled={selectedTests.length === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FaPrint /> {t('patientRegistration.previewPrint')}
                </GlowButton>
                <GlowButton
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {isSubmitting ? (
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <FaSave />
                  )}
                  {isSubmitting ? t('patientRegistration.saving') : t('patientRegistration.register')}
                </GlowButton>
              </FormActions>
            </form>
          </MainFormColumn>
          <StickySidebar>
            {/* Summary/Review Section (now sticky on desktop) */}
            <FormSection>
              <SectionTitle>
                <FaClipboardList /> {t('patientRegistration.registrationSummary')}
              </SectionTitle>
              <SummaryGrid>
                <SummaryItem>
                  <SummaryLabel>{t('patientRegistration.patientName')}</SummaryLabel>
                  <SummaryValue>
                    {getValues('firstName')} {getValues('lastName')}
                  </SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>{t('patientRegistration.phoneNumber')}</SummaryLabel>
                  <SummaryValue>{getValues('phoneNumber')}</SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>{t('patientRegistration.email')}</SummaryLabel>
                  <SummaryValue>{getValues('email')}</SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>{t('patientRegistration.age')}</SummaryLabel>
                  <SummaryValue>{getValues('age')} {t('patientRegistration.years')}</SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>{t('patientRegistration.gender')}</SummaryLabel>
                  <SummaryValue>{getValues('gender')}</SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>{t('patientRegistration.selectedTests')}</SummaryLabel>
                  <SummaryValue>{selectedTests.length} {t('patientRegistration.tests')}</SummaryValue>
                </SummaryItem>
              </SummaryGrid>
            </FormSection>
          </StickySidebar>
        </RegistrationLayout>
      </FormContainer>
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        patientData={getValues()}
        selectedTests={selectedTests}
        orderData={{
          referringDoctor: getValues('referringDoctor') || 'N/A',
          priority: getValues('priority') || 'Normal',
          notes: getValues('notes') || ''
        }}
      />
    </>
  );
};

export default EnhancedPatientForm; 