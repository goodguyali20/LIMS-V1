import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { patientSchema } from '../../utils/validation';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaIdCard, FaFlask, FaPrint, FaEye, FaEdit, FaNotesMedical, FaArrowRight, FaSave, FaArrowLeft, FaClipboardList, FaSpinner, FaBarcode } from 'react-icons/fa';
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

const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.85rem;
  margin-top: 0.25rem;
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

const EnhancedPatientForm = ({ onPatientRegistered, patients = [] }) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTests, setSelectedTests] = useState([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  console.log('i18n.languages:', i18n.languages);
  console.log('i18n.language:', i18n.language);
  console.log('resources:', i18n.options.resources);
  console.log('en resources:', i18n.options.resources.en);
  console.log('t(patientRegistration.title):', t('patientRegistration.title'));
  console.log('en.patientRegistration:', i18n.options.resources.en.translation.patientRegistration);

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
    resolver: yupResolver(patientSchema),
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

  const steps = [
    { id: 1, label: 'Patient Info', icon: <FaUser /> },
    { id: 2, label: 'Test Selection', icon: <FaFlask /> },
    { id: 3, label: 'Review & Print', icon: <FaPrint /> }
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTestSelection = (testName) => {
    if (!selectedTests.includes(testName)) {
      setSelectedTests([...selectedTests, testName]);
    }
  };

  const handleTestRemoval = (testName) => {
    setSelectedTests(selectedTests.filter(test => test !== testName));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await addPatientMutation.mutateAsync(data);
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

  const renderField = (fieldName, fieldConfig, section = null) => {
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
          <Label htmlFor={fieldName}>
            {fieldLabel} {isRequired && '*'}
          </Label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Controller
              name={fieldPath}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id={fieldName}
                  type="text"
                  placeholder={`Scan or enter ${fieldLabel.toLowerCase()}`}
                  $hasError={!!errorPath}
                  autoComplete="off"
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
        </InputGroup>
      );
    }

    // Show duplicate warning below firstName, lastName, phoneNumber, or email fields
    const showDup =
      duplicateWarning &&
      (['firstName', 'lastName', 'phoneNumber', 'email'].includes(fieldName));
    return (
      <InputGroup key={fieldPath}>
        <Label htmlFor={fieldName}>
          {fieldLabel} {isRequired && '*'}
        </Label>
        <Controller
          name={fieldPath}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id={fieldName}
              type={fieldName === 'age' ? 'number' : fieldName === 'email' ? 'email' : 'text'}
              placeholder={`Enter ${fieldLabel.toLowerCase()}`}
              min={fieldName === 'age' ? '0' : undefined}
              max={fieldName === 'age' ? '120' : undefined}
              step={fieldName === 'age' ? '1' : undefined}
              $hasError={!!errorPath}
            />
          )}
        />
        {errorPath && (
          <ErrorMessage>{errorPath.message}</ErrorMessage>
        )}
        {showDup && <ErrorMessage>{duplicateWarning}</ErrorMessage>}
      </InputGroup>
    );
  };

  const renderSelectField = (fieldName, fieldConfig, options, section = null) => {
    if (!shouldRenderField(settings.patientRegistrationFields, section, fieldName)) {
      return null;
    }

    const isRequired = isFieldRequired(settings.patientRegistrationFields, section, fieldName);
    const fieldPath = section ? `${section}.${fieldName}` : fieldName;
    const errorPath = section ? errors[section]?.[fieldName] : errors[fieldName];
    const fieldLabel = fieldConfig.label || fieldName;

    return (
      <InputGroup key={fieldPath}>
        <Label htmlFor={fieldName}>
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
                value={options.find(option => option.value === field.value) || null}
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
    if (!shouldRenderField(settings.patientRegistrationFields, section, fieldName)) {
      return null;
    }

    const isRequired = isFieldRequired(settings.patientRegistrationFields, section, fieldName);
    const fieldPath = section ? `${section}.${fieldName}` : fieldName;
    const errorPath = section ? errors[section]?.[fieldName] : errors[fieldName];
    const fieldLabel = fieldConfig.label || fieldName;

    return (
      <InputGroup key={fieldPath}>
        <Label htmlFor={fieldName}>
          {fieldLabel} {isRequired && '*'}
        </Label>
        <Controller
          name={fieldPath}
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              id={fieldName}
              placeholder={`Enter ${fieldLabel.toLowerCase()}`}
              $hasError={!!errorPath}
            />
          )}
        />
        {errorPath && (
          <ErrorMessage>{errorPath.message}</ErrorMessage>
        )}
      </InputGroup>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FormSection>
              <SectionTitle>
                <FaUser /> {t('patientRegistration.personalInfo')}
              </SectionTitle>
              <FormGrid>
                {renderField('patientId', { enabled: true, required: false, label: t('patientRegistration.patientId') })}
                {renderField('firstName', settings.patientRegistrationFields.firstName)}
                {renderField('lastName', settings.patientRegistrationFields.lastName)}
                {renderField('age', { ...(settings.patientRegistrationFields.age || { enabled: true, required: true }), label: 'Age' })}
                {renderSelectField('gender', settings.patientRegistrationFields.gender || { enabled: true, required: true, label: 'Gender' }, genderOptions)}
                {renderField('phoneNumber', settings.patientRegistrationFields.phoneNumber)}
                {renderField('email', settings.patientRegistrationFields.email)}
              </FormGrid>
            </FormSection>

            {shouldRenderField(settings.patientRegistrationFields, 'address') && (
              <FormSection>
                <SectionTitle>
                  <FaMapMarkerAlt /> {t('patientRegistration.addressInfo')}
                </SectionTitle>
                <FormGrid>
                  {renderField('street', settings.patientRegistrationFields.address.street, 'address')}
                  {renderField('city', settings.patientRegistrationFields.address.city, 'address')}
                  {renderSelectField('state', settings.patientRegistrationFields.address.state, stateOptions, 'address')}
                  {renderField('zipCode', settings.patientRegistrationFields.address.zipCode, 'address')}
                  {renderField('country', settings.patientRegistrationFields.address.country, 'address')}
                </FormGrid>
              </FormSection>
            )}

            {shouldRenderField(settings.patientRegistrationFields, 'emergencyContact') && (
              <FormSection>
                <SectionTitle>
                  <FaPhone /> {t('patientRegistration.emergencyContact')}
                </SectionTitle>
                <FormGrid>
                  {renderField('name', settings.patientRegistrationFields.emergencyContact.name, 'emergencyContact')}
                  {renderField('relationship', settings.patientRegistrationFields.emergencyContact.relationship, 'emergencyContact')}
                  {renderField('phoneNumber', settings.patientRegistrationFields.emergencyContact.phoneNumber, 'emergencyContact')}
                </FormGrid>
              </FormSection>
            )}

            {shouldRenderField(settings.patientRegistrationFields, 'medicalHistory') && (
              <FormSection>
                <SectionTitle>
                  <FaNotesMedical /> {t('patientRegistration.medicalHistory')}
                </SectionTitle>
                <FormGrid>
                  {renderTextAreaField('allergies', settings.patientRegistrationFields.medicalHistory.allergies, 'medicalHistory')}
                  {renderTextAreaField('medications', settings.patientRegistrationFields.medicalHistory.medications, 'medicalHistory')}
                  {renderTextAreaField('conditions', settings.patientRegistrationFields.medicalHistory.conditions, 'medicalHistory')}
                  {renderTextAreaField('notes', settings.patientRegistrationFields.medicalHistory.notes, 'medicalHistory')}
                </FormGrid>
              </FormSection>
            )}

            {shouldRenderField(settings.patientRegistrationFields, 'insurance') && (
              <FormSection>
                <SectionTitle>
                  <FaIdCard /> {t('patientRegistration.insuranceInfo')}
                </SectionTitle>
                <FormGrid>
                  {renderField('provider', settings.patientRegistrationFields.insurance.provider, 'insurance')}
                  {renderField('policyNumber', settings.patientRegistrationFields.insurance.policyNumber, 'insurance')}
                  {renderField('groupNumber', settings.patientRegistrationFields.insurance.groupNumber, 'insurance')}
                </FormGrid>
              </FormSection>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TestSelectionPanel
              selectedTests={selectedTests}
              onTestSelection={handleTestSelection}
              onTestRemoval={handleTestRemoval}
            />
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SummarySection>
              <SummaryTitle>
                <FaClipboardList /> {t('patientRegistration.registrationSummary')}
              </SummaryTitle>
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
            </SummarySection>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <FormContainer>
        <h2 style={{ marginBottom: '1.5rem', color: '#667eea', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaUser /> {t('patientRegistration.title')}
        </h2>
        <StepIndicator>
          {steps.map((step, index) => (
            <StepItem key={step.id}>
              {index < steps.length - 1 && (
                <StepConnector $isCompleted={currentStep > step.id} />
              )}
              <StepCircle
                $isActive={currentStep === step.id}
                $isCompleted={currentStep > step.id}
              >
                {currentStep > step.id ? <FaCheck /> : step.icon}
              </StepCircle>
              <StepLabel
                $isActive={currentStep === step.id}
                $isCompleted={currentStep > step.id}
              >
                {step.label}
              </StepLabel>
            </StepItem>
          ))}
        </StepIndicator>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          <FormActions>
            <NavigationButtons>
              {currentStep > 1 && (
                <GlowButton
                  type="button"
                  onClick={handlePrevStep}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FaArrowLeft /> {t('common.previous')}
                </GlowButton>
              )}
              
              {currentStep < steps.length && (
                <GlowButton
                  type="button"
                  onClick={handleNextStep}
                  disabled={currentStep === 1 && !isValid}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {t('common.next')} <FaArrowRight />
                </GlowButton>
              )}
            </NavigationButtons>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {currentStep === steps.length && (
                <GlowButton
                  type="button"
                  onClick={() => setShowPrintPreview(true)}
                  disabled={selectedTests.length === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FaPrint /> {t('patientRegistration.previewPrint')}
                </GlowButton>
              )}
              
              <GlowButton
                type="submit"
                disabled={!isValid || isSubmitting || currentStep !== steps.length}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isSubmitting ? (
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <FaSave />
                )}
                {isSubmitting ? t('patientRegistration.saving') : t('patientRegistration.register')}
              </GlowButton>
            </div>
          </FormActions>
        </form>
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
        user={user}
        settings={settings}
      />
    </>
  );
};

export default EnhancedPatientForm; 