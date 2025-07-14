import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import { 
  FaUser, FaIdCard, FaPhone, FaEnvelope, FaCalendar, FaVenusMars,
  FaMapMarkerAlt, FaNotesMedical, FaSave, FaTimes, FaSearch,
  FaFilter, FaSort, FaEye, FaEdit, FaTrash, FaPlus, FaCheck,
  FaExclamationTriangle, FaInfoCircle, FaSpinner, FaRedo
} from 'react-icons/fa';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { formatDate, getAge } from '../../utils/dateUtils.js';
import { 
  generatePatientSchema, 
  generateDefaultValues, 
  shouldRenderField, 
  isFieldRequired 
} from '../../utils/patientRegistrationUtils.js';
import GlowCard from '../../components/common/GlowCard.jsx';
import GlowButton from '../../components/common/GlowButton.jsx';
import AnimatedDataTable from '../../components/common/AnimatedDataTable.jsx';
import { useSettings } from '../../contexts/SettingsContext';

// Dynamic schema will be generated based on settings

const PageContainer = styled(motion.div)`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      #667eea 0%, 
      #764ba2 25%, 
      #f093fb 50%, 
      #f5576c 75%, 
      #4facfe 100%);
    border-radius: 20px 20px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
`;

const FormContainer = styled(GlowCard)`
  padding: 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      #667eea 0%, 
      #764ba2 25%, 
      #f093fb 50%, 
      #f5576c 75%, 
      #4facfe 100%);
    border-radius: 20px 20px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
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
  position: relative;
  z-index: 1;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;
  
  &:hover {
    border-color: rgba(102, 126, 234, 0.5) !important;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
    backdrop-filter: blur(25px) !important;
    box-shadow: 
      0 8px 32px rgba(102, 126, 234, 0.3),
      0 4px 16px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
    transform: translateY(-2px) !important;
  }
  
  &:focus {
    border-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.error : '#667eea'};
    box-shadow: ${({ theme, $hasError }) => 
      $hasError ? theme.shadows.glow.error : '0 0 0 3px rgba(102, 126, 234, 0.2)'};
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: none;
    color: #333;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    backdrop-filter: blur(20px);
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
  position: relative;
  z-index: 1;
  
  &:hover {
    border-color: rgba(102, 126, 234, 0.5) !important;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
    backdrop-filter: blur(25px) !important;
    box-shadow: 
      0 8px 32px rgba(102, 126, 234, 0.3),
      0 4px 16px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
    transform: translateY(-2px) !important;
  }
  
  &:focus {
    border-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.error : '#667eea'};
    box-shadow: ${({ theme, $hasError }) => 
      $hasError ? theme.shadows.glow.error : '0 0 0 3px rgba(102, 126, 234, 0.2)'};
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: none;
    color: #333;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const SelectContainer = styled.div`
  .react-select__control {
    border: 2px solid ${({ theme, $hasError }) => 
      $hasError ? theme.colors.error : 'rgba(255, 255, 255, 0.1)'};
    border-radius: 12px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    min-height: 48px;
    box-shadow: none;
    backdrop-filter: blur(20px);
    transition: all 0.3s ease;
    
    &:hover {
      border-color: ${({ theme, $hasError }) => 
        $hasError ? theme.colors.error : 'rgba(102, 126, 234, 0.5)'} !important;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
      backdrop-filter: blur(25px) !important;
      box-shadow: 
        0 8px 32px rgba(102, 126, 234, 0.3),
        0 4px 16px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
      transform: translateY(-2px) !important;
    }
    
    &.react-select__control--is-focused {
      border-color: ${({ theme, $hasError }) => 
        $hasError ? theme.colors.error : '#667eea'};
      box-shadow: ${({ theme, $hasError }) => 
        $hasError ? theme.shadows.glow.error : '0 0 0 3px rgba(102, 126, 234, 0.2)'};
      transform: scale(1.02);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: none;
    }
  }
  
  .react-select__menu {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(20px);
  }
  
  .react-select__option {
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    
    &:hover {
      background: rgba(102, 126, 234, 0.1);
    }
    
    &.react-select__option--is-focused {
      background: rgba(102, 126, 234, 0.2);
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

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
`;

const PatientRegistration = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Debug: Log settings changes
  useEffect(() => {
    console.log('Patient Registration - Settings updated:', settings.patientRegistrationFields);
  }, [settings.patientRegistrationFields]);

  // Generate dynamic schema and default values based on settings
  const patientSchema = useMemo(() => 
    generatePatientSchema(settings.patientRegistrationFields), 
    [settings.patientRegistrationFields]
  );
  
  const defaultValues = useMemo(() => 
    generateDefaultValues(settings.patientRegistrationFields), 
    [settings.patientRegistrationFields]
  );

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(patientSchema),
    mode: 'onChange',
    defaultValues
  });

  // Gender options for React Select
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  // State options for React Select
  const stateOptions = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];

  // React Query for fetching patients
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const q = query(collection(db, "patients"), orderBy("createdAt", "desc"), limit(50));
      const querySnapshot = await getDocs(q);
      const patientsData = [];
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        patientsData.push({
          ...data,
          age: getAge(data.dateOfBirth),
          fullName: `${data.firstName} ${data.lastName}`,
          formattedDate: formatDate(data.dateOfBirth),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
        });
      });
      return patientsData;
    },
    staleTime: 30000,
    retry: 2,
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
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient registered successfully!');
      reset();
    },
    onError: (error) => {
      console.error('Error adding patient:', error);
      toast.error('Failed to register patient');
    },
  });

  // Form submission handler
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

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    
    return patients.filter(patient => 
      patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNumber?.includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  // Watch form values for conditional rendering
  const watchedValues = watch();

  // Helper function to render a field conditionally
  const renderField = (fieldName, fieldConfig, section = null) => {
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
            <Input
              {...field}
              id={fieldName}
              type={fieldName === 'dateOfBirth' ? 'date' : fieldName === 'email' ? 'email' : 'text'}
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

  // Helper function to render select fields
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

  // Helper function to render textarea fields
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

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <FaUser /> {t('patientRegistration.title')}
        </Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <GlowButton
            onClick={() => {
              console.log('Refreshing settings...');
              window.location.reload();
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FaRedo /> Refresh Settings
          </GlowButton>
          <GlowButton
            onClick={() => reset()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FaRedo /> {t('patientRegistration.reset')}
          </GlowButton>
        </div>
      </Header>

      <FormContainer>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information */}
          <FormSection>
            <SectionTitle>
              <FaUser /> Personal Information
            </SectionTitle>
            <FormGrid>
              {renderField('firstName', settings.patientRegistrationFields.firstName)}
              {renderField('lastName', settings.patientRegistrationFields.lastName)}
              {renderField('dateOfBirth', settings.patientRegistrationFields.dateOfBirth)}
              {renderSelectField('gender', settings.patientRegistrationFields.gender, genderOptions)}
              {renderField('phoneNumber', settings.patientRegistrationFields.phoneNumber)}
              {renderField('email', settings.patientRegistrationFields.email)}
            </FormGrid>
          </FormSection>

          {/* Address Information */}
          {shouldRenderField(settings.patientRegistrationFields, 'address') && (
            <FormSection>
              <SectionTitle>
                <FaMapMarkerAlt /> Address Information
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

          {/* Emergency Contact */}
          {shouldRenderField(settings.patientRegistrationFields, 'emergencyContact') && (
            <FormSection>
              <SectionTitle>
                <FaPhone /> Emergency Contact
              </SectionTitle>
              <FormGrid>
                {renderField('name', settings.patientRegistrationFields.emergencyContact.name, 'emergencyContact')}
                {renderField('relationship', settings.patientRegistrationFields.emergencyContact.relationship, 'emergencyContact')}
                {renderField('phoneNumber', settings.patientRegistrationFields.emergencyContact.phoneNumber, 'emergencyContact')}
              </FormGrid>
            </FormSection>
          )}

          {/* Medical History */}
          {shouldRenderField(settings.patientRegistrationFields, 'medicalHistory') && (
            <FormSection>
              <SectionTitle>
                <FaNotesMedical /> Medical History
              </SectionTitle>
              <FormGrid>
                {renderTextAreaField('allergies', settings.patientRegistrationFields.medicalHistory.allergies, 'medicalHistory')}
                {renderTextAreaField('medications', settings.patientRegistrationFields.medicalHistory.medications, 'medicalHistory')}
                {renderTextAreaField('conditions', settings.patientRegistrationFields.medicalHistory.conditions, 'medicalHistory')}
                {renderTextAreaField('notes', settings.patientRegistrationFields.medicalHistory.notes, 'medicalHistory')}
              </FormGrid>
            </FormSection>
          )}

          {/* Insurance Information */}
          {shouldRenderField(settings.patientRegistrationFields, 'insurance') && (
            <FormSection>
              <SectionTitle>
                <FaIdCard /> Insurance Information
              </SectionTitle>
              <FormGrid>
                {renderField('provider', settings.patientRegistrationFields.insurance.provider, 'insurance')}
                {renderField('policyNumber', settings.patientRegistrationFields.insurance.policyNumber, 'insurance')}
                {renderField('groupNumber', settings.patientRegistrationFields.insurance.groupNumber, 'insurance')}
              </FormGrid>
            </FormSection>
          )}

          <FormActions>
            <GlowButton
              type="button"
              onClick={() => reset()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaTimes /> {t('patientRegistration.cancel')}
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
              {isSubmitting ? t('patientRegistration.saving') : t('patientRegistration.save')}
            </GlowButton>
          </FormActions>
        </form>
      </FormContainer>

      {/* Patients List */}
      <GlowCard>
        <div style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: theme.colors.text }}>
            Registered Patients
          </h3>
          
          {/* Search and Filters */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr auto auto', 
            gap: '1rem', 
            marginBottom: '1rem',
            alignItems: 'center'
          }}>
            <Input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ margin: 0 }}
            />
            <GlowButton
              onClick={() => setSearchTerm('')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaTimes /> Clear
            </GlowButton>
            <GlowButton
              onClick={() => queryClient.invalidateQueries(['patients'])}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaRedo /> Refresh
            </GlowButton>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <FaSpinner size={48} style={{ animation: 'spin 1s linear infinite' }} />
              <p>Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: theme.colors.textSecondary }}>
              <FaUser size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No patients found</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  style={{
                    padding: '1rem',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '12px',
                    background: theme.colors.surface,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: theme.colors.text }}>
                      {patient.fullName}
                    </h4>
                    <p style={{ margin: '0', color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                      Age: {patient.age} • Phone: {patient.phoneNumber} • Registered: {patient.formattedDate}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <GlowButton
                      size="small"
                      onClick={() => {/* Handle view details */}}
                    >
                      <FaEye /> View
                    </GlowButton>
                    <GlowButton
                      size="small"
                      $variant="primary"
                      onClick={() => {/* Handle edit */}}
                    >
                      <FaEdit /> Edit
                    </GlowButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlowCard>
    </PageContainer>
  );
};

export default PatientRegistration;

