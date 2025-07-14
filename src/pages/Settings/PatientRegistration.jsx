import React, { useState, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Edit,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  Search as SearchIcon,
  Plus,
  Save,
  RefreshCw,
  User,
  MapPin,
  Phone,
  FileText,
  CreditCard,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  X,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { GlowCard, GlowButton, AnimatedModal } from '../../components/common';
import { useSettings } from '../../contexts/SettingsContext';
import { toast } from 'react-toastify';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2.5rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const StatCard = styled(GlowCard)`
  padding: 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SearchAndActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  position: relative;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const StyledSearchIcon = styled(SearchIcon)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 1.25rem;
  height: 1.25rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  @media (min-width: 768px) {
    justify-content: flex-end;
  }
`;

const SectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SectionCard = styled(GlowCard)`
  padding: 0;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary}40;
  }
  
  ${({ $disabled }) => $disabled && `
    opacity: 0.6;
    filter: grayscale(0.5);
  `}
`;

const SectionHeader = styled.div`
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
`;

const SectionHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 0.5rem;
    margin: -0.5rem;
  }
`;

const SectionHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SectionIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
`;

const SectionStats = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SectionToggle = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SectionDisableToggle = styled.button`
  background: ${({ $disabled, theme }) =>
    $disabled ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${({ $disabled, theme }) =>
    $disabled ? '#ef4444' : 'rgba(255, 255, 255, 0.2)'};
  color: ${({ $disabled, theme }) =>
    $disabled ? 'white' : theme.colors.textSecondary};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${({ $disabled, theme }) =>
      $disabled ? '#dc2626' : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-1px);
  }
`;

const SectionContent = styled.div`
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FieldCard = styled(GlowCard)`
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.primary}40;
  }
  
  ${({ $disabled }) => $disabled && `
    opacity: 0.6;
    filter: grayscale(0.5);
  `}
`;

const FieldHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  justify-content: space-between;
`;

const FieldInfo = styled.div`
  flex: 1;
`;

const FieldName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FieldKey = styled.code`
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: 'Monaco', 'Menlo', monospace;
`;

const FieldControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ToggleButton = styled.button`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.2)'};
  color: ${({ $active, theme }) =>
    $active ? 'white' : theme.colors.textSecondary};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RequiredToggle = styled(ToggleButton)`
  background: ${({ $active, theme }) =>
    $active ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'};
  border-color: ${({ $active, theme }) =>
    $active ? '#ef4444' : 'rgba(255, 255, 255, 0.2)'};
  &:hover {
    background: ${({ $active, theme }) =>
      $active ? '#dc2626' : 'rgba(255, 255, 255, 0.15)'};
  }
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const FieldDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
`;

const FieldStatus = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ $type, theme }) => {
    switch ($type) {
      case 'required': return '#ef4444';
      case 'optional': return '#10b981';
      case 'disabled': return '#6b7280';
      default: return theme.colors.primary;
    }
  }};
  color: white;
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primary}20;
  }
`;

const Select = styled.select`
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primary}20;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const PatientRegistrationSettings = () => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [localSettings, setLocalSettings] = useState(settings.patientRegistrationFields);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});
  
  const [fieldFormState, setFieldFormState] = useState({
    section: 'personal',
    key: '',
    label: '',
    required: false,
    enabled: true,
    description: ''
  });

  // Update localSettings when settings change
  useEffect(() => {
    setLocalSettings(settings.patientRegistrationFields);
  }, [settings.patientRegistrationFields]);

  // Section configuration
  const sections = {
    personal: { 
      icon: <User size={20} />, 
      label: 'Personal Information', 
      color: '#667eea',
      description: 'Basic personal details like name, contact info, and demographics'
    },
    address: { 
      icon: <MapPin size={20} />, 
      label: 'Address Information', 
      color: '#10b981',
      description: 'Patient address and location details'
    },
    emergencyContact: { 
      icon: <Phone size={20} />, 
      label: 'Emergency Contact', 
      color: '#f59e0b',
      description: 'Emergency contact person and their details'
    },
    medicalHistory: { 
      icon: <FileText size={20} />, 
      label: 'Medical History', 
      color: '#ef4444',
      description: 'Medical conditions, allergies, and health history'
    },
    insurance: { 
      icon: <CreditCard size={20} />, 
      label: 'Insurance Information', 
      color: '#8b5cf6',
      description: 'Insurance provider and policy details'
    }
  };

  // Get fields grouped by section
  const groupedFields = useMemo(() => {
    console.log('Building grouped fields from:', localSettings);
    const result = {};
    
    // Personal fields (direct properties)
    const personalFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'phoneNumber', 'email'];
    result.personal = personalFields
      .filter(key => localSettings[key])
      .map(key => ({
        ...localSettings[key],
        key,
        section: 'personal',
        sectionLabel: sections.personal.label
      }));
    
    console.log('Personal fields:', result.personal);
    
    // Nested sections
    ['address', 'emergencyContact', 'medicalHistory', 'insurance'].forEach(section => {
      if (localSettings[section] && typeof localSettings[section] === 'object') {
        result[section] = Object.keys(localSettings[section])
          .filter(key => localSettings[section][key])
          .map(key => ({
            ...localSettings[section][key],
            key,
            section,
            sectionLabel: sections[section].label
          }));
      } else {
        result[section] = [];
      }
      console.log(`${section} fields:`, result[section]);
    });
    
    console.log('Final grouped fields:', result);
    return result;
  }, [localSettings, sections]);

  // Filter fields based on search
  const filteredGroupedFields = useMemo(() => {
    if (!searchTerm) return groupedFields;
    
    const filtered = {};
    Object.keys(groupedFields).forEach(section => {
      filtered[section] = groupedFields[section].filter(field =>
        field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.sectionLabel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
    return filtered;
  }, [groupedFields, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const allFields = Object.values(groupedFields).flat();
    return {
      total: allFields.length,
      required: allFields.filter(f => f.required).length,
      optional: allFields.filter(f => !f.required).length,
      enabled: allFields.filter(f => f.enabled).length,
      disabled: allFields.filter(f => !f.enabled).length
    };
  }, [groupedFields]);

  // Check if a section is fully disabled
  const isSectionDisabled = useCallback((section, fields) => {
    if (fields.length === 0) return false;
    return fields.every(field => !field.enabled);
  }, []);

  const handleFieldToggle = useCallback((section, key, property) => {
    console.log('Toggling field:', { section, key, property });
    
    setLocalSettings(prev => {
      // Create a deep copy to avoid mutation issues
      const newSettings = JSON.parse(JSON.stringify(prev));
      
      try {
        if (section === 'personal') {
          // Handle personal fields (direct properties)
          if (newSettings[key]) {
            const currentValue = newSettings[key][property];
            console.log(`Personal field ${key}.${property}: ${currentValue} -> ${!currentValue}`);
            newSettings[key][property] = !currentValue;
            toast.success(`${key} ${property} toggled to ${!currentValue}`);
          } else {
            console.error(`Personal field ${key} not found in settings`);
            toast.error(`Field ${key} not found`);
          }
        } else {
          // Handle nested sections
          if (!newSettings[section]) {
            console.error(`Section ${section} not found in settings`);
            toast.error(`Section ${section} not found`);
            return prev;
          }
          
          if (!newSettings[section][key]) {
            console.error(`Field ${key} not found in section ${section}`);
            toast.error(`Field ${key} not found in ${section}`);
            return prev;
          }
          
          const currentValue = newSettings[section][key][property];
          console.log(`Nested field ${section}.${key}.${property}: ${currentValue} -> ${!currentValue}`);
          newSettings[section][key][property] = !currentValue;
          toast.success(`${key} ${property} toggled to ${!currentValue}`);
        }
        
        console.log('Settings updated successfully');
        return newSettings;
      } catch (error) {
        console.error('Error updating field:', error);
        toast.error('Error updating field');
        return prev;
      }
    });
  }, []);

  const handleOpenModal = useCallback((field = null) => {
    if (field) {
      setEditingField(field);
      setFieldFormState({
        section: field.section,
        key: field.key,
        label: field.label,
        required: field.required,
        enabled: field.enabled,
        description: field.description || ''
      });
    } else {
      setEditingField(null);
      setFieldFormState({
        section: 'personal',
        key: '',
        label: '',
        required: false,
        enabled: true,
        description: ''
      });
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditingField(null);
    setIsModalOpen(false);
    setFieldFormState({
      section: 'personal',
      key: '',
      label: '',
      required: false,
      enabled: true,
      description: ''
    });
  }, []);

  const handleFieldFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFieldFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleSaveField = useCallback((e) => {
    e.preventDefault();
    
    if (!fieldFormState.label.trim()) {
      toast.error('Field label is required');
      return;
    }
    
    if (!fieldFormState.key.trim()) {
      toast.error('Field key is required');
      return;
    }
    
    // Check for duplicate keys
    const allFields = Object.values(groupedFields).flat();
    const existingField = allFields.find(f => 
      f.key === fieldFormState.key && 
      f.section === fieldFormState.section &&
      (!editingField || (f.key !== editingField.key || f.section !== editingField.section))
    );
    
    if (existingField) {
      toast.error('A field with this key already exists in this section');
      return;
    }
    
    setLocalSettings(prev => {
      const newSettings = { ...prev };
      
      if (fieldFormState.section === 'personal') {
        newSettings[fieldFormState.key] = {
          label: fieldFormState.label,
          required: fieldFormState.required,
          enabled: fieldFormState.enabled,
          description: fieldFormState.description
        };
      } else {
        if (!newSettings[fieldFormState.section]) {
          newSettings[fieldFormState.section] = {};
        }
        newSettings[fieldFormState.section][fieldFormState.key] = {
          label: fieldFormState.label,
          required: fieldFormState.required,
          enabled: fieldFormState.enabled,
          description: fieldFormState.description
        };
      }
      
      return newSettings;
    });
    
    setIsModalOpen(false);
    toast.success(editingField ? 'Field updated successfully!' : 'Field added successfully!');
  }, [fieldFormState, editingField, groupedFields]);

  const handleDeleteField = useCallback((field) => {
    if (window.confirm(`Are you sure you want to delete the field "${field.label}"?`)) {
      setLocalSettings(prev => {
        const newSettings = { ...prev };
        
        if (field.section === 'personal') {
          delete newSettings[field.key];
        } else {
          delete newSettings[field.section][field.key];
        }
        
        return newSettings;
      });
      
      toast.success('Field deleted successfully!');
    }
  }, []);

  const handleDuplicateField = useCallback((field) => {
    const newKey = `${field.key}_copy`;
    const newLabel = `${field.label} (Copy)`;
    
    setLocalSettings(prev => {
      const newSettings = { ...prev };
      
      if (field.section === 'personal') {
        newSettings[newKey] = {
          ...field,
          label: newLabel
        };
      } else {
        if (!newSettings[field.section]) {
          newSettings[field.section] = {};
        }
        newSettings[field.section][newKey] = {
          ...field,
          label: newLabel
        };
      }
      
      return newSettings;
    });
    
    toast.success('Field duplicated successfully!');
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const success = await updateSettings({ patientRegistrationFields: localSettings });
      if (success) {
        toast.success('Patient registration settings saved successfully!');
        // Show success message and suggest checking the patient registration page
        toast.success('Settings saved! Check the Patient Registration page to see changes.');
      } else {
        toast.error('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [localSettings, updateSettings]);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all changes? This cannot be undone.')) {
      setLocalSettings(settings.patientRegistrationFields);
      toast.info('Settings reset to current values');
    }
  }, [settings.patientRegistrationFields]);

  const toggleSection = useCallback((section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const toggleSectionEnabled = useCallback((section) => {
    setLocalSettings(prev => {
      const newSettings = { ...prev };
      
      if (section === 'personal') {
        // Toggle all personal fields
        const personalFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'phoneNumber', 'email'];
        const allEnabled = personalFields.every(key => newSettings[key]?.enabled);
        
        personalFields.forEach(key => {
          if (newSettings[key]) {
            newSettings[key] = {
              ...newSettings[key],
              enabled: !allEnabled
            };
          }
        });
      } else {
        // Toggle all fields in nested section
        if (newSettings[section] && typeof newSettings[section] === 'object') {
          const allEnabled = Object.values(newSettings[section]).every(field => field.enabled);
          
          Object.keys(newSettings[section]).forEach(key => {
            newSettings[section][key] = {
              ...newSettings[section][key],
              enabled: !allEnabled
            };
          });
        }
      }
      
      return newSettings;
    });
  }, []);

  return (
    <Container>
      <Header>
        <Title>
          <Settings size={32} />
          Patient Registration Settings
        </Title>
        <Description>
          Configure and customize the patient registration form fields. 
          Group related fields together and manage their requirements.
        </Description>
      </Header>

      <StatsContainer>
        <StatCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>Total Fields</StatLabel>
        </StatCard>
        <StatCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatNumber>{stats.required}</StatNumber>
          <StatLabel>Required Fields</StatLabel>
        </StatCard>
        <StatCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatNumber>{stats.enabled}</StatNumber>
          <StatLabel>Enabled Fields</StatLabel>
        </StatCard>
        <StatCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <StatNumber>{stats.disabled}</StatNumber>
          <StatLabel>Disabled Fields</StatLabel>
        </StatCard>
      </StatsContainer>

      <SearchAndActions>
        <SearchContainer>
          <StyledSearchIcon />
          <SearchInput
            type="text"
            placeholder="Search fields by name, key, or section..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <ActionButtons>
          <GlowButton onClick={() => handleOpenModal()}>
            <Plus size={16} /> Add New Field
          </GlowButton>
          <GlowButton 
            onClick={() => {
              if (window.confirm('Are you sure you want to disable all fields? This will hide all fields from the registration form.')) {
                setLocalSettings(prev => {
                  const newSettings = { ...prev };
                  
                  // Disable all personal fields
                  const personalFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'phoneNumber', 'email'];
                  personalFields.forEach(key => {
                    if (newSettings[key]) {
                      newSettings[key] = { ...newSettings[key], enabled: false };
                    }
                  });
                  
                  // Disable all nested section fields
                  ['address', 'emergencyContact', 'medicalHistory', 'insurance'].forEach(section => {
                    if (newSettings[section] && typeof newSettings[section] === 'object') {
                      Object.keys(newSettings[section]).forEach(key => {
                        newSettings[section][key] = { ...newSettings[section][key], enabled: false };
                      });
                    }
                  });
                  
                  return newSettings;
                });
                toast.success('All fields have been disabled');
              }
            }}
            variant="secondary"
            style={{ background: '#ef4444', color: 'white' }}
          >
            <EyeOff size={16} /> Disable All
          </GlowButton>
          <GlowButton 
            onClick={() => {
              if (window.confirm('Are you sure you want to enable all fields? This will show all fields in the registration form.')) {
                setLocalSettings(prev => {
                  const newSettings = { ...prev };
                  
                  // Enable all personal fields
                  const personalFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'phoneNumber', 'email'];
                  personalFields.forEach(key => {
                    if (newSettings[key]) {
                      newSettings[key] = { ...newSettings[key], enabled: true };
                    }
                  });
                  
                  // Enable all nested section fields
                  ['address', 'emergencyContact', 'medicalHistory', 'insurance'].forEach(section => {
                    if (newSettings[section] && typeof newSettings[section] === 'object') {
                      Object.keys(newSettings[section]).forEach(key => {
                        newSettings[section][key] = { ...newSettings[section][key], enabled: true };
                      });
                    }
                  });
                  
                  return newSettings;
                });
                toast.success('All fields have been enabled');
              }
            }}
            variant="secondary"
            style={{ background: '#10b981', color: 'white' }}
          >
            <Eye size={16} /> Enable All
          </GlowButton>
          <GlowButton onClick={handleReset} variant="secondary">
            <RefreshCw size={16} /> Reset
          </GlowButton>
          <GlowButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </GlowButton>
        </ActionButtons>
      </SearchAndActions>

      <SectionsContainer>
        <AnimatePresence>
          {Object.entries(filteredGroupedFields).map(([sectionKey, fields]) => {
            if (fields.length === 0) return null;
            
            const section = sections[sectionKey];
            const isCollapsed = collapsedSections[sectionKey];
            const sectionStats = {
              total: fields.length,
              required: fields.filter(f => f.required).length,
              enabled: fields.filter(f => f.enabled).length
            };
            
                         const sectionDisabled = isSectionDisabled(sectionKey, fields);
             
             return (
               <SectionCard 
                 key={sectionKey} 
                 as={motion.div} 
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }}
                 $disabled={sectionDisabled}
               >
                 <SectionHeader>
                   <SectionHeaderLeft onClick={() => toggleSection(sectionKey)}>
                     <SectionTitle>
                       <SectionIcon color={section.color}>
                         {section.icon}
                       </SectionIcon>
                       {section.label}
                     </SectionTitle>
                   </SectionHeaderLeft>
                   <SectionHeaderRight>
                     <SectionStats>
                       <span>{sectionStats.total} fields</span>
                       <span>•</span>
                       <span>{sectionStats.required} required</span>
                       <span>•</span>
                       <span>{sectionStats.enabled} enabled</span>
                     </SectionStats>
                     <SectionDisableToggle
                       type="button"
                       $disabled={sectionDisabled}
                       onClick={(e) => {
                         e.stopPropagation();
                         toggleSectionEnabled(sectionKey);
                       }}
                       title={sectionDisabled ? 'Enable All Fields' : 'Disable All Fields'}
                     >
                       {sectionDisabled ? <Eye size={16} /> : <EyeOff size={16} />}
                       {sectionDisabled ? 'Enable' : 'Disable'}
                     </SectionDisableToggle>
                     <SectionToggle onClick={() => toggleSection(sectionKey)}>
                       {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                     </SectionToggle>
                   </SectionHeaderRight>
                 </SectionHeader>
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SectionContent>
                        {fields.map((field, idx) => (
                          <FieldCard
                            key={field.section + '-' + field.key}
                            as={motion.div}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            $disabled={!field.enabled}
                          >
                            <FieldHeader>
                              <FieldInfo>
                                <FieldName>
                                  {field.label}
                                  {!field.enabled && <EyeOff size={16} color="#6b7280" />}
                                </FieldName>
                                <FieldKey>{field.key}</FieldKey>
                              </FieldInfo>
                              <FieldControls>
                                <ActionButton
                                  onClick={() => handleOpenModal(field)}
                                  title="Edit Field"
                                >
                                  <Edit size={16} />
                                </ActionButton>
                                <ActionButton
                                  onClick={() => handleDuplicateField(field)}
                                  title="Duplicate Field"
                                >
                                  <Copy size={16} />
                                </ActionButton>
                                <ActionButton
                                  onClick={() => handleDeleteField(field)}
                                  title="Delete Field"
                                  style={{ color: '#ef4444' }}
                                >
                                  <Trash2 size={16} />
                                </ActionButton>
                                <ToggleButton
                                  type="button"
                                  $active={field.enabled}
                                  onClick={() => {
                                    console.log('Field toggle clicked:', field);
                                    handleFieldToggle(field.section, field.key, 'enabled');
                                  }}
                                  title={field.enabled ? 'Disable Field' : 'Enable Field'}
                                >
                                  {field.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                                  <span style={{ fontSize: '0.75rem' }}>
                                    {field.enabled ? 'ON' : 'OFF'}
                                  </span>
                                </ToggleButton>
                                <RequiredToggle
                                  type="button"
                                  $active={field.required}
                                  onClick={() => handleFieldToggle(field.section, field.key, 'required')}
                                  title={field.required ? 'Make Optional' : 'Make Required'}
                                >
                                  {field.required ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                                </RequiredToggle>
                              </FieldControls>
                            </FieldHeader>
                            
                            {field.description && (
                              <FieldDescription>{field.description}</FieldDescription>
                            )}
                            
                            <FieldStatus>
                              <StatusBadge $type={field.required ? 'required' : 'optional'}>
                                {field.required ? 'Required' : 'Optional'}
                              </StatusBadge>
                              <StatusBadge $type={field.enabled ? 'enabled' : 'disabled'}>
                                {field.enabled ? 'Enabled' : 'Disabled'}
                              </StatusBadge>
                              <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                                Debug: {field.section}.{field.key} = {field.enabled ? 'true' : 'false'}
                              </small>
                            </FieldStatus>
                          </FieldCard>
                        ))}
                      </SectionContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SectionCard>
            );
          })}
        </AnimatePresence>
      </SectionsContainer>

      {Object.values(filteredGroupedFields).every(fields => fields.length === 0) && (
        <EmptyState>
          <EmptyStateIcon>🔍</EmptyStateIcon>
          <h3>No fields found</h3>
          <p>
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'No fields are configured yet. Add your first field to get started!'
            }
          </p>
        </EmptyState>
      )}

      <AnimatedModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingField ? `Edit Field: ${editingField.label}` : 'Add New Field'}
      >
        <ModalForm onSubmit={handleSaveField}>
          <InputGroup>
            <Label>Section</Label>
            <Select 
              name="section" 
              value={fieldFormState.section} 
              onChange={handleFieldFormChange}
              required
            >
              {Object.entries(sections).map(([key, section]) => (
                <option key={key} value={key}>
                  {section.label}
                </option>
              ))}
            </Select>
          </InputGroup>

          <InputGroup>
            <Label>Field Label *</Label>
            <Input 
              name="label" 
              value={fieldFormState.label} 
              onChange={handleFieldFormChange}
              placeholder="Enter field label (e.g., First Name)"
              required 
            />
          </InputGroup>

          <InputGroup>
            <Label>Field Key *</Label>
            <Input 
              name="key" 
              value={fieldFormState.key} 
              onChange={handleFieldFormChange}
              placeholder="Enter field key (e.g., first_name)"
              required 
            />
            <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              This will be used as the field identifier in the database
            </small>
          </InputGroup>

          <InputGroup>
            <Label>Description</Label>
            <Input 
              name="description" 
              value={fieldFormState.description} 
              onChange={handleFieldFormChange}
              placeholder="Optional description for this field"
            />
          </InputGroup>

          <CheckboxGroup>
            <CheckboxItem>
              <input 
                type="checkbox" 
                name="required" 
                checked={fieldFormState.required} 
                onChange={handleFieldFormChange} 
              />
              <span>This field is required</span>
            </CheckboxItem>
            <CheckboxItem>
              <input 
                type="checkbox" 
                name="enabled" 
                checked={fieldFormState.enabled} 
                onChange={handleFieldFormChange} 
              />
              <span>This field is enabled</span>
            </CheckboxItem>
          </CheckboxGroup>

          <ModalActions>
            <GlowButton 
              type="button" 
              onClick={handleCloseModal}
              variant="secondary"
            >
              <X size={16} /> Cancel
            </GlowButton>
            <GlowButton type="submit">
              <Check size={16} /> {editingField ? 'Update Field' : 'Add Field'}
            </GlowButton>
          </ModalActions>
        </ModalForm>
      </AnimatedModal>
    </Container>
  );
};

export default PatientRegistrationSettings; 