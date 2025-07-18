import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon,
  Building2,
  FlaskConical,
  Users,
  User,
  Monitor,
  Printer,
  Shield,
  Database,
  Palette,
  Bell,
  Globe,
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Lock,
  Unlock,
  Palette as PaletteIcon,
  Languages,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Globe as GlobeIcon,
  Shield as ShieldIcon,
  Database as DatabaseIcon,

  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Trash2 as TrashIcon,
  Save as SaveIcon,
  RefreshCw as RefreshIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  CheckCircle as CheckIcon,
  AlertCircle as AlertIcon,
  Info as InfoIcon,
  Zap as ZapIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Languages as LanguagesIcon,
  Volume2 as VolumeIcon,
  VolumeX as VolumeXIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Smartphone as SmartphoneIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlowCard, GlowButton, AnimatedModal, AnimatedNotification } from '../../components/common';
import { useSettings } from '../../contexts/SettingsContext';

import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import UsersManagement from './Users';
import Print from './Print';
import PatientRegistrationSettings from './PatientRegistration';
import TestCatalog from './TestCatalog';
import AddressManagement from './AddressManagement';

// Styled Components
const SettingsContainer = styled(motion.div)`
  min-height: 100vh;
  background: ${({ theme }) => theme.isDarkMode 
    ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
    : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
  };
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SettingsHeader = styled(motion.div)`
  margin-bottom: 2rem;
`;

const SettingsTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SettingsDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  margin: 0;
`;

const SearchAndFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const StyledSearchIcon = styled(SearchIcon)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 1.25rem;
  height: 1.25rem;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SettingCard = styled(GlowCard)`
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ color }) => color};
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const SettingCardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SettingIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
`;

const SettingDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
`;

const SettingBadge = styled.span`
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 2rem;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 2px;
  }
`;

const TabButton = styled(motion.button)`
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textSecondary};
  border-bottom: 3px solid ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TabContent = styled(motion.div)`
  animation: fadeIn 0.5s;
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ theme }) => theme.colors.surfaceSecondary};
  margin-bottom: 1rem;
`;

const ToggleLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.colors.border};
    transition: 0.3s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  
  input:checked + span:before {
    transform: translateX(26px);
  }
`;





const Settings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { user } = useAuth();
  
  const [generalFormState, setGeneralFormState] = useState(settings);

  // Settings categories with icons and colors
  const settingsCategories = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Hospital information, contact details, and basic configuration',
      icon: Building2,
      color: '#3b82f6',
      badge: 'Core'
    },
    {
      id: 'tests',
      title: 'Test Catalog',
      description: 'Manage laboratory tests, panels, and test configurations',
      icon: FlaskConical,
      color: '#10b981',
      badge: 'Essential'
    },
    {
      id: 'patientRegistration',
      title: 'Patient Registration',
      description: 'Configure required and optional fields for patient registration',
      icon: User,
      color: '#06b6d4',
      badge: 'Forms'
    },
    {
      id: 'addressManagement',
      title: 'Address Management',
      description: 'Manage governorates, districts, and areas with default settings',
      icon: MapPin,
      color: '#f59e0b',
      badge: 'Location'
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'User roles, permissions, and access control settings',
      icon: Users,
      color: '#8b5cf6',
      badge: 'Admin'
    },
    {
      id: 'system',
      title: 'System Configuration',
      description: 'Theme, language, notifications, and system preferences',
      icon: Monitor,
      color: '#f59e0b',
      badge: 'Advanced'
    },
    {
      id: 'print',
      title: 'Print Settings',
      description: 'Report templates, slip configurations, and print options',
      icon: Printer,
      color: '#ef4444',
      badge: 'Reports'
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Security settings, data protection, and audit logs',
      icon: Shield,
      color: '#dc2626',
      badge: 'Critical'
    },
    {
      id: 'backup',
              title: t('settings.backupExport'),
        description: t('settings.backupExportDescription'),
      icon: Database,
      color: '#6366f1',
      badge: 'Data'
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      description: 'API keys, integrations, and advanced configurations',
      icon: Zap,
      color: '#ec4899',
      badge: 'Expert'
    }
  ];

  useEffect(() => {
    setGeneralFormState(settings);
  }, [settings]);
  


  const handleGeneralInputChange = (e) => {
    const { name, value } = e.target;
    setGeneralFormState(prev => ({ ...prev, [name]: value }));
  };
  
    const handleGeneralSubmit = async () => {
    try {
      await updateSettings(generalFormState);
      toast.success('General settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings.');
    }
  };



  const filteredCategories = settingsCategories.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || category.badge.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const renderGeneralSettings = () => (
    <Section as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SectionHeader>
        <h2>General Settings</h2>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <GlowButton 
            onClick={handleGeneralSubmit}
            disabled={settingsLoading}
          >
            <SaveIcon size={16} />
            {settingsLoading ? 'Saving...' : 'Save Changes'}
          </GlowButton>
        </motion.div>
      </SectionHeader>
      
      <Form>
        <InputGroup>
          <Label>
            <Building2 size={16} />
            Hospital Name
          </Label>
          <Input 
            name="hospitalName" 
            value={generalFormState.hospitalName || ''} 
            onChange={handleGeneralInputChange} 
            placeholder="Enter hospital name" 
          />
        </InputGroup>
        
        <InputGroup>
          <Label>
            <MapPinIcon size={16} />
            Hospital Address
          </Label>
          <Input 
            name="hospitalAddress" 
            value={generalFormState.hospitalAddress || ''} 
            onChange={handleGeneralInputChange} 
            placeholder="Enter hospital address" 
          />
        </InputGroup>
        
        <InputGroup>
          <Label>
            <PhoneIcon size={16} />
            Hospital Phone
          </Label>
          <Input 
            name="hospitalPhone" 
            value={generalFormState.hospitalPhone || ''} 
            onChange={handleGeneralInputChange} 
            placeholder="Enter hospital phone" 
          />
        </InputGroup>
        
        <InputGroup>
          <Label>
            <MailIcon size={16} />
            Hospital Email
          </Label>
          <Input 
            name="hospitalEmail" 
            value={generalFormState.hospitalEmail || ''} 
            onChange={handleGeneralInputChange} 
            placeholder="Enter hospital email" 
          />
        </InputGroup>
        
        <InputGroup>
          <Label>
            <GlobeIcon size={16} />
            Hospital Website
          </Label>
          <Input 
            name="hospitalWebsite" 
            value={generalFormState.hospitalWebsite || ''} 
            onChange={handleGeneralInputChange} 
            placeholder="Enter hospital website" 
          />
        </InputGroup>
        
        <InputGroup>
          <Label>
            <Users size={16} />
            Lab Director
          </Label>
          <Input 
            name="labDirector" 
            value={generalFormState.labDirector || ''} 
            onChange={handleGeneralInputChange} 
            placeholder="Enter lab director name" 
          />
        </InputGroup>
      </Form>
    </Section>
  );



  const renderSystemSettings = () => (
    <Section as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SectionHeader>
        <h2>System Configuration</h2>
      </SectionHeader>
      
      <ToggleContainer>
        <ToggleLabel>
          <SunIcon size={16} />
          <div>
            <strong>Dark Mode</strong>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              Switch between light and dark themes
            </p>
          </div>
        </ToggleLabel>
        <ToggleSwitch>
          <input type="checkbox" defaultChecked={false} />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
      
      <ToggleContainer>
        <ToggleLabel>
          <Bell size={16} />
          <div>
            <strong>Notifications</strong>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              Enable system notifications and alerts
            </p>
          </div>
        </ToggleLabel>
        <ToggleSwitch>
          <input type="checkbox" defaultChecked={true} />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
      
      <ToggleContainer>
        <ToggleLabel>
          <LanguagesIcon size={16} />
          <div>
            <strong>Multi-language Support</strong>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              Enable Arabic and English language switching
            </p>
          </div>
        </ToggleLabel>
        <ToggleSwitch>
          <input type="checkbox" defaultChecked={true} />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
      
      <ToggleContainer>
        <ToggleLabel>
          <VolumeIcon size={16} />
          <div>
            <strong>Sound Effects</strong>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              Play sound effects for user interactions
            </p>
          </div>
        </ToggleLabel>
        <ToggleSwitch>
          <input type="checkbox" defaultChecked={false} />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
    </Section>
  );

  const renderSecuritySettings = () => (
    <Section as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SectionHeader>
        <h2>Security & Privacy</h2>
      </SectionHeader>
      
      <ToggleContainer>
        <ToggleLabel>
          <LockIcon size={16} />
          <div>
            <strong>Two-Factor Authentication</strong>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              Require 2FA for all user accounts
            </p>
          </div>
        </ToggleLabel>
        <ToggleSwitch>
          <input type="checkbox" defaultChecked={false} />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
      
      <ToggleContainer>
        <ToggleLabel>
          <ShieldIcon size={16} />
          <div>
            <strong>Session Timeout</strong>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              Automatically log out inactive users
            </p>
          </div>
        </ToggleLabel>
        <ToggleSwitch>
          <input type="checkbox" defaultChecked={true} />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
      
      <ToggleContainer>
        <ToggleLabel>
          <FileTextIcon size={16} />
          <div>
            <strong>Audit Logging</strong>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              Log all system activities and changes
            </p>
          </div>
        </ToggleLabel>
        <ToggleSwitch>
          <input type="checkbox" defaultChecked={true} />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
    </Section>
  );

  const renderBackupSettings = () => (
    <Section as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SectionHeader>
        <h2>{t('settings.backupExport')}</h2>
      </SectionHeader>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <GlowButton>
          <DownloadIcon size={16} />
                      {t('settings.exportAllData')}
        </GlowButton>
        <GlowButton>
          <UploadIcon size={16} />
          Import Data
        </GlowButton>
      </div>
      
      <ToggleContainer>
        <ToggleLabel>
          <DatabaseIcon size={16} />
          <div>
            <strong>Auto Backup</strong>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              Automatically backup data daily
            </p>
          </div>
        </ToggleLabel>
        <ToggleSwitch>
          <input type="checkbox" defaultChecked={true} />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
    </Section>
  );

  return (
    <SettingsContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <SettingsHeader>
        <SettingsTitle>
          <SettingsIcon size={32} />
          Settings
        </SettingsTitle>
        <SettingsDescription>
          Configure your laboratory information system and customize your experience
        </SettingsDescription>
      </SettingsHeader>

      <SearchAndFilterContainer>
        <SearchContainer>
          <StyledSearchIcon />
          <SearchInput
            type="text"
            placeholder="Search settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <FilterSelect
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="core">Core</option>
          <option value="essential">Essential</option>
          <option value="forms">Forms</option>
          <option value="admin">Admin</option>
          <option value="advanced">Advanced</option>
          <option value="reports">Reports</option>
          <option value="critical">Critical</option>
          <option value="data">Data</option>
          <option value="expert">Expert</option>
        </FilterSelect>
      </SearchAndFilterContainer>

      <SettingsGrid>
        {filteredCategories.map(category => (
          <SettingCard key={category.id} color={category.color} onClick={() => setActiveTab(category.id)}>
            <SettingCardContent>
              <SettingIcon color={category.color}><category.icon size={32} /></SettingIcon>
              <SettingInfo>
                <SettingTitle>{category.title}</SettingTitle>
                <SettingDescription>{category.description}</SettingDescription>
                <SettingBadge color={category.color}>{category.badge}</SettingBadge>
              </SettingInfo>
            </SettingCardContent>
          </SettingCard>
        ))}
        {/* Custom cards for Workload, Audit Log, and Library Showcase */}
        <SettingCard color="#6366f1" onClick={() => window.location.href='/app/workload'}>
          <SettingCardContent>
            <SettingIcon color="#6366f1"><Monitor size={32} /></SettingIcon>
            <SettingInfo>
              <SettingTitle>Workload</SettingTitle>
              <SettingDescription>View and analyze laboratory workload statistics</SettingDescription>
              <SettingBadge color="#6366f1">Analytics</SettingBadge>
            </SettingInfo>
          </SettingCardContent>
        </SettingCard>
        <SettingCard color="#dc2626" onClick={() => window.location.href='/app/audit-log'}>
          <SettingCardContent>
            <SettingIcon color="#dc2626"><Shield size={32} /></SettingIcon>
            <SettingInfo>
              <SettingTitle>Audit Log</SettingTitle>
              <SettingDescription>Review system audit logs and activity history</SettingDescription>
              <SettingBadge color="#dc2626">Logs</SettingBadge>
            </SettingInfo>
          </SettingCardContent>
        </SettingCard>
        <SettingCard color="#ec4899" onClick={() => window.location.href='/app/showcase'}>
          <SettingCardContent>
            <SettingIcon color="#ec4899"><Zap size={32} /></SettingIcon>
            <SettingInfo>
              <SettingTitle>Library Showcase</SettingTitle>
              <SettingDescription>Explore advanced UI libraries and components</SettingDescription>
              <SettingBadge color="#ec4899">Demo</SettingBadge>
            </SettingInfo>
          </SettingCardContent>
        </SettingCard>
      </SettingsGrid>

      <TabsContainer>
        {settingsCategories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TabButton 
              $active={activeTab === category.id} 
              onClick={() => setActiveTab(category.id)}
            >
              {category.title}
            </TabButton>
          </motion.div>
        ))}
      </TabsContainer>

      <AnimatePresence mode="wait">
        <TabContent
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'tests' && <TestCatalog />}
          {activeTab === 'patientRegistration' && <PatientRegistrationSettings />}
          {activeTab === 'addressManagement' && <AddressManagement />}
          {activeTab === 'system' && renderSystemSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'backup' && renderBackupSettings()}
          {activeTab === 'users' && <UsersManagement />}
          {activeTab === 'print' && <Print />}
          {activeTab === 'advanced' && (
            <Section>
              <SectionHeader>
                <h2>Advanced Features</h2>
              </SectionHeader>
              <p>Advanced features coming soon...</p>
            </Section>
          )}
        </TabContent>
      </AnimatePresence>


    </SettingsContainer>
  );
};

export default Settings;