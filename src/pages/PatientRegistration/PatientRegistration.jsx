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
import { collection, addDoc, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { formatDate, getAge } from '../../utils/dateUtils.js';
import GlowCard from '../../components/common/GlowCard.jsx';
import GlowButton from '../../components/common/GlowButton.jsx';
import AnimatedDataTable from '../../components/common/AnimatedDataTable.jsx';

// Zod schema for patient registration
const patientSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const age = getAge(date);
      return age >= 0 && age <= 120;
    }, 'Invalid date of birth'),
  
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Gender is required'
  }),
  
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses'),
  
  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  
  address: z.object({
    street: z.string()
      .min(5, 'Street address must be at least 5 characters')
      .max(100, 'Street address must be less than 100 characters'),
    
    city: z.string()
      .min(2, 'City must be at least 2 characters')
      .max(50, 'City must be less than 50 characters'),
    
    state: z.string()
      .min(2, 'State must be at least 2 characters')
      .max(50, 'State must be less than 50 characters'),
    
    zipCode: z.string()
      .min(5, 'ZIP code must be at least 5 characters')
      .max(10, 'ZIP code must be less than 10 characters')
      .regex(/^[\d\-]+$/, 'ZIP code can only contain digits and hyphens'),
    
    country: z.string()
      .min(2, 'Country must be at least 2 characters')
      .max(50, 'Country must be less than 50 characters')
      .default('United States')
  }),
  
  emergencyContact: z.object({
    name: z.string()
      .min(2, 'Emergency contact name must be at least 2 characters')
      .max(100, 'Emergency contact name must be less than 100 characters'),
    
    relationship: z.string()
      .min(2, 'Relationship must be at least 2 characters')
      .max(50, 'Relationship must be less than 50 characters'),
    
    phoneNumber: z.string()
      .min(10, 'Emergency contact phone must be at least 10 digits')
      .max(15, 'Emergency contact phone must be less than 15 digits')
      .regex(/^[\d\s\-\+\(\)]+$/, 'Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses')
  }),
  
  medicalHistory: z.object({
    allergies: z.string()
      .max(500, 'Allergies description must be less than 500 characters')
      .optional()
      .or(z.literal('')),
    
    medications: z.string()
      .max(500, 'Medications description must be less than 500 characters')
      .optional()
      .or(z.literal('')),
    
    conditions: z.string()
      .max(500, 'Medical conditions description must be less than 500 characters')
      .optional()
      .or(z.literal('')),
    
    notes: z.string()
      .max(1000, 'Notes must be less than 1000 characters')
      .optional()
      .or(z.literal(''))
  }),
  
  insurance: z.object({
    provider: z.string()
      .max(100, 'Insurance provider must be less than 100 characters')
      .optional()
      .or(z.literal('')),
    
    policyNumber: z.string()
      .max(50, 'Policy number must be less than 50 characters')
      .optional()
      .or(z.literal('')),
    
    groupNumber: z.string()
      .max(50, 'Group number must be less than 50 characters')
      .optional()
      .or(z.literal(''))
  })
});

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
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FormContainer = styled(GlowCard)`
  padding: 2rem;
  margin-bottom: 2rem;
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
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
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
    $hasError ? theme.colors.error : theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: ${({ theme, $hasError }) => 
      $hasError ? theme.shadows.glow.error : theme.shadows.glow.primary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 2px solid ${({ theme, $hasError }) => 
    $hasError ? theme.colors.error : theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    border-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: ${({ theme, $hasError }) => 
      $hasError ? theme.shadows.glow.error : theme.shadows.glow.primary};
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
      $hasError ? theme.colors.error : theme.colors.border};
    border-radius: 12px;
    background: ${({ theme }) => theme.colors.input};
    min-height: 48px;
    box-shadow: none;
    
    &:hover {
      border-color: ${({ theme, $hasError }) => 
        $hasError ? theme.colors.error : theme.colors.primary};
    }
    
    &.react-select__control--is-focused {
      border-color: ${({ theme, $hasError }) => 
        $hasError ? theme.colors.error : theme.colors.primary};
      box-shadow: ${({ theme, $hasError }) => 
        $hasError ? theme.shadows.glow.error : theme.shadows.glow.primary};
    }
  }
  
  .react-select__menu {
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px;
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
  
  .react-select__option {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    
    &:hover {
      background: ${({ theme }) => theme.colors.hover};
    }
    
    &.react-select__option--is-focused {
      background: ${({ theme }) => theme.colors.primary}20;
    }
    
    &.react-select__option--is-selected {
      background: ${({ theme }) => theme.colors.primary};
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
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const PatientRegistration = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(patientSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      phoneNumber: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phoneNumber: ''
      },
      medicalHistory: {
        allergies: '',
        medications: '',
        conditions: '',
        notes: ''
      },
      insurance: {
        provider: '',
        policyNumber: '',
        groupNumber: ''
      }
    }
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
              <InputGroup>
                <Label htmlFor="firstName">First Name *</Label>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="firstName"
                      placeholder="Enter first name"
                      $hasError={!!errors.firstName}
                    />
                  )}
                />
                {errors.firstName && (
                  <ErrorMessage>{errors.firstName.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="lastName">Last Name *</Label>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="lastName"
                      placeholder="Enter last name"
                      $hasError={!!errors.lastName}
                    />
                  )}
                />
                {errors.lastName && (
                  <ErrorMessage>{errors.lastName.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="dateOfBirth"
                      type="date"
                      $hasError={!!errors.dateOfBirth}
                    />
                  )}
                />
                {errors.dateOfBirth && (
                  <ErrorMessage>{errors.dateOfBirth.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="gender">Gender *</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <SelectContainer $hasError={!!errors.gender}>
                      <Select
                        {...field}
                        options={genderOptions}
                        placeholder="Select gender"
                        classNamePrefix="react-select"
                        isClearable
                        onChange={(option) => field.onChange(option?.value || '')}
                        value={genderOptions.find(option => option.value === field.value) || null}
                      />
                    </SelectContainer>
                  )}
                />
                {errors.gender && (
                  <ErrorMessage>{errors.gender.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="phoneNumber"
                      placeholder="Enter phone number"
                      $hasError={!!errors.phoneNumber}
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <ErrorMessage>{errors.phoneNumber.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="email">Email</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      $hasError={!!errors.email}
                    />
                  )}
                />
                {errors.email && (
                  <ErrorMessage>{errors.email.message}</ErrorMessage>
                )}
              </InputGroup>
            </FormGrid>
          </FormSection>

          {/* Address Information */}
          <FormSection>
            <SectionTitle>
              <FaMapMarkerAlt /> Address Information
            </SectionTitle>
            <FormGrid>
              <InputGroup>
                <Label htmlFor="street">Street Address *</Label>
                <Controller
                  name="address.street"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="street"
                      placeholder="Enter street address"
                      $hasError={!!errors.address?.street}
                    />
                  )}
                />
                {errors.address?.street && (
                  <ErrorMessage>{errors.address.street.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="city">City *</Label>
                <Controller
                  name="address.city"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="city"
                      placeholder="Enter city"
                      $hasError={!!errors.address?.city}
                    />
                  )}
                />
                {errors.address?.city && (
                  <ErrorMessage>{errors.address.city.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="state">State *</Label>
                <Controller
                  name="address.state"
                  control={control}
                  render={({ field }) => (
                    <SelectContainer $hasError={!!errors.address?.state}>
                      <Select
                        {...field}
                        options={stateOptions}
                        placeholder="Select state"
                        classNamePrefix="react-select"
                        isClearable
                        onChange={(option) => field.onChange(option?.value || '')}
                        value={stateOptions.find(option => option.value === field.value) || null}
                      />
                    </SelectContainer>
                  )}
                />
                {errors.address?.state && (
                  <ErrorMessage>{errors.address.state.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Controller
                  name="address.zipCode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="zipCode"
                      placeholder="Enter ZIP code"
                      $hasError={!!errors.address?.zipCode}
                    />
                  )}
                />
                {errors.address?.zipCode && (
                  <ErrorMessage>{errors.address.zipCode.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="country">Country</Label>
                <Controller
                  name="address.country"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="country"
                      placeholder="Enter country"
                      $hasError={!!errors.address?.country}
                    />
                  )}
                />
                {errors.address?.country && (
                  <ErrorMessage>{errors.address.country.message}</ErrorMessage>
                )}
              </InputGroup>
            </FormGrid>
          </FormSection>

          {/* Emergency Contact */}
          <FormSection>
            <SectionTitle>
              <FaPhone /> Emergency Contact
            </SectionTitle>
            <FormGrid>
              <InputGroup>
                <Label htmlFor="emergencyName">Emergency Contact Name *</Label>
                <Controller
                  name="emergencyContact.name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="emergencyName"
                      placeholder="Enter emergency contact name"
                      $hasError={!!errors.emergencyContact?.name}
                    />
                  )}
                />
                {errors.emergencyContact?.name && (
                  <ErrorMessage>{errors.emergencyContact.name.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="relationship">Relationship *</Label>
                <Controller
                  name="emergencyContact.relationship"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="relationship"
                      placeholder="Enter relationship"
                      $hasError={!!errors.emergencyContact?.relationship}
                    />
                  )}
                />
                {errors.emergencyContact?.relationship && (
                  <ErrorMessage>{errors.emergencyContact.relationship.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                <Controller
                  name="emergencyContact.phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="emergencyPhone"
                      placeholder="Enter emergency contact phone"
                      $hasError={!!errors.emergencyContact?.phoneNumber}
                    />
                  )}
                />
                {errors.emergencyContact?.phoneNumber && (
                  <ErrorMessage>{errors.emergencyContact.phoneNumber.message}</ErrorMessage>
                )}
              </InputGroup>
            </FormGrid>
          </FormSection>

          {/* Medical History */}
          <FormSection>
            <SectionTitle>
              <FaNotesMedical /> Medical History
            </SectionTitle>
            <FormGrid>
              <InputGroup>
                <Label htmlFor="allergies">Allergies</Label>
                <Controller
                  name="medicalHistory.allergies"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      id="allergies"
                      placeholder="List any known allergies"
                      $hasError={!!errors.medicalHistory?.allergies}
                    />
                  )}
                />
                {errors.medicalHistory?.allergies && (
                  <ErrorMessage>{errors.medicalHistory.allergies.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="medications">Current Medications</Label>
                <Controller
                  name="medicalHistory.medications"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      id="medications"
                      placeholder="List current medications"
                      $hasError={!!errors.medicalHistory?.medications}
                    />
                  )}
                />
                {errors.medicalHistory?.medications && (
                  <ErrorMessage>{errors.medicalHistory.medications.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="conditions">Medical Conditions</Label>
                <Controller
                  name="medicalHistory.conditions"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      id="conditions"
                      placeholder="List any medical conditions"
                      $hasError={!!errors.medicalHistory?.conditions}
                    />
                  )}
                />
                {errors.medicalHistory?.conditions && (
                  <ErrorMessage>{errors.medicalHistory.conditions.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="notes">Additional Notes</Label>
                <Controller
                  name="medicalHistory.notes"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      id="notes"
                      placeholder="Any additional medical notes"
                      $hasError={!!errors.medicalHistory?.notes}
                    />
                  )}
                />
                {errors.medicalHistory?.notes && (
                  <ErrorMessage>{errors.medicalHistory.notes.message}</ErrorMessage>
                )}
              </InputGroup>
            </FormGrid>
          </FormSection>

          {/* Insurance Information */}
          <FormSection>
            <SectionTitle>
              <FaIdCard /> Insurance Information
            </SectionTitle>
            <FormGrid>
              <InputGroup>
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Controller
                  name="insurance.provider"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="insuranceProvider"
                      placeholder="Enter insurance provider"
                      $hasError={!!errors.insurance?.provider}
                    />
                  )}
                />
                {errors.insurance?.provider && (
                  <ErrorMessage>{errors.insurance.provider.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Controller
                  name="insurance.policyNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="policyNumber"
                      placeholder="Enter policy number"
                      $hasError={!!errors.insurance?.policyNumber}
                    />
                  )}
                />
                {errors.insurance?.policyNumber && (
                  <ErrorMessage>{errors.insurance.policyNumber.message}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="groupNumber">Group Number</Label>
                <Controller
                  name="insurance.groupNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="groupNumber"
                      placeholder="Enter group number"
                      $hasError={!!errors.insurance?.groupNumber}
                    />
                  )}
                />
                {errors.insurance?.groupNumber && (
                  <ErrorMessage>{errors.insurance.groupNumber.message}</ErrorMessage>
                )}
              </InputGroup>
            </FormGrid>
          </FormSection>

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
                      variant="primary"
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

