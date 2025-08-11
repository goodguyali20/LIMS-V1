import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FlaskConical,
  Edit,
  Trash2,
  Search as SearchIcon,
  Plus,
  Save,
  RefreshCw,
  AlertCircle,
  Building2,
  FileText,
  Ruler,
  Target,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  Star,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Archive,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  FileSpreadsheet,
  PieChart,
  Activity,
  Calendar,
  Package,
  Layers,
  FolderOpen,
  Share2,
  Star as StarIcon,
  TrendingDown,
  AlertTriangle,
  Info,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Link,
  Unlink,
  Database,
  Cpu,
  HardDrive,
  Network,
  Shield,
  Lock,
  Unlock,
  Key,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  Power,
  PowerOff,
  SortAsc,
  Droplets
} from 'lucide-react';
import { GlowCard, GlowButton, AnimatedModal } from '../../components/common';
import { useTestCatalog } from '../../contexts/TestContext';
import { showFlashMessage } from '../../contexts/NotificationContext';

// Predefined constants for dropdowns
const DEPARTMENTS = [
  "Chemistry",
  "Hematology", 
  "Microbiology",
  "Parasitology",
  "Serology",
  "Virology",
  "Immunology",
  "Molecular Biology",
  "Histopathology",
  "Cytology"
];

const UNITS = [
  "mg/dL",
  "g/dL", 
  "mmol/L",
  "μmol/L",
  "ng/mL",
  "pg/mL",
  "U/L",
  "IU/L",
  "%",
  "cells/μL",
  "g/L",
  "mEq/L",
  "pg",
  "fL",
  "ratio",
  "index",
  "titer",
  "CFU/mL",
  "copies/mL"
];

const SAMPLE_TYPES = [
  "Blood",
  "Serum", 
  "Plasma",
  "Urine",
  "Cerebrospinal Fluid",
  "Stool",
  "Sputum",
  "Swab",
  "Tissue",
  "Bone Marrow",
  "Amniotic Fluid",
  "Synovial Fluid",
  "Pleural Fluid",
  "Peritoneal Fluid"
];

const TURNAROUND_TIMES = [
  "Same day",
  "2-4 hours",
  "4-6 hours", 
  "6-8 hours",
  "8-12 hours",
  "12-24 hours",
  "1-2 days",
  "2-3 days",
  "3-5 days",
  "1 week",
  "2 weeks"
];

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



const DepartmentFilterSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  backdrop-filter: blur(10px);
  min-height: 72px;
`;

const StatusFilterSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  backdrop-filter: blur(10px);
  min-height: 72px;
`;



const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  
  @media (min-width: 768px) {
    min-width: 0;
  }
`;

const FilterLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  flex-shrink: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  min-height: 40px;
`;

const SearchContainer = styled.div`
  flex: 1;
  position: relative;
  max-width: 400px;
  width: 100%;
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

const FilterButton = styled.button`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.2)'};
  color: ${({ $active, theme }) =>
    $active ? 'white' : theme.colors.textSecondary};
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  min-height: 40px;
  
  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-1px);
  }
  
  @media (max-width: 640px) {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ViewButton = styled.button`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.2)'};
  color: ${({ $active, theme }) =>
    $active ? 'white' : theme.colors.textSecondary};
  padding: 0.75rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  min-width: 40px;
  
  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-1px);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  
  @media (max-width: 640px) {
    gap: 0.75rem;
  }
`;

const TestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const TestsGrid3 = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const TestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TestCard = styled(GlowCard)`
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.primary}40;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  ${({ $disabled }) => $disabled && `
    opacity: 0.6;
    filter: grayscale(0.5);
  `}
`;

const TestHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  justify-content: space-between;
`;

const TestInfo = styled.div`
  flex: 1;
`;

const TestName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TestDepartment = styled.div`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const TestStatus = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
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
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'popular': return '#f59e0b';
      case 'new': return '#3b82f6';
      case 'special': return '#ef4444';
      default: return theme.colors.primary;
    }
  }};
  color: white;
`;

const TestDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const GlowingPriceItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  animation: glow 2s ease-in-out infinite alternate;
  
  @keyframes glow {
    from {
      text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    }
    to {
      text-shadow: 0 0 20px rgba(16, 185, 129, 0.8), 0 0 30px rgba(16, 185, 129, 0.6);
    }
  }
`;

const TestActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
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

const SpecialBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.5rem;
`;

const DepartmentColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ color }) => color};
  flex-shrink: 0;
`;

const ModalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidthField = styled.div`
  grid-column: 1 / -1;
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
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.7;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
    transform: translateY(-1px);
  }
  
  option {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ReferenceRangeContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: end;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.7;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  flex: 1;
`;

const ToggleSwitch = styled.div`
  position: relative;
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
    background-color: rgba(255, 255, 255, 0.2);
    transition: 0.3s;
    border-radius: 24px;
  }
  
  span:before {
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
  
  input:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  
  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
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

const LoadingSkeleton = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 20px;
  animation: pulse 1.5s infinite alternate;
  
  @keyframes pulse {
    from { opacity: 0.6; }
    to { opacity: 1; }
  }
`;

// Analytics Components
const AnalyticsSection = styled.div`
  margin-bottom: 2.5rem;
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const AnalyticsCard = styled(GlowCard)`
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.primary}40;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
`;

const ChartContainer = styled.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// Panel Components
const PanelSection = styled.div`
  margin-bottom: 2.5rem;
`;

const PanelCard = styled(GlowCard)`
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  margin-bottom: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.primary}40;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const PanelTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PanelTests = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const PanelTestTag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.colors.text};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// Import/Export Components
const ImportExportSection = styled.div`
  margin-bottom: 2.5rem;
`;

const ImportExportCard = styled(GlowCard)`
  padding: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
`;

const FileUploadArea = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: rgba(255, 255, 255, 0.05);
  }
`;

const TabContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  justify-content: space-between;
`;

const TabButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TopSearchContainer = styled.div`
  position: relative;
  min-width: 300px;
  max-width: 400px;
`;

const TopSearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
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

const TopSearchIcon = styled(SearchIcon)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 1rem;
  height: 1rem;
`;

const TabButton = styled.button`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.2)'};
  color: ${({ $active, theme }) =>
    $active ? 'white' : theme.colors.textSecondary};
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
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
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const QuickActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }
`;

// Department Grouping Components
const DepartmentSection = styled.div`
  margin-bottom: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
`;

const DepartmentHeader = styled.div`
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const DepartmentTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DepartmentStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const GroupingToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  flex-wrap: wrap;
  min-height: 72px;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const ToggleButton = styled.button`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.2)'};
  color: ${({ $active, theme }) =>
    $active ? 'white' : theme.colors.textSecondary};
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  min-height: 40px;
  
  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const CollapsibleSection = styled.div`
  overflow: hidden;
  transition: all 0.3s ease;
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ViewModeAndActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const ViewModeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ViewModeLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const ActionsLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TestCatalog = () => {
  const { t } = useTranslation();
  const { labTests, addTest, updateTest, deleteTest, loading: testsLoading, departmentColors } = useTestCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [viewMode, setViewMode] = useState('grid3');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTests, setSelectedTests] = useState([]);
  const [activeTab, setActiveTab] = useState('tests'); // 'tests', 'panels', 'analytics', 'import'
  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [groupByDepartment, setGroupByDepartment] = useState(true);
  const [collapsedDepartments, setCollapsedDepartments] = useState(() => {
    // Initialize all departments as collapsed by default
    const initial = {};
    if (labTests.length > 0) {
      const departments = [...new Set(labTests.map(test => test.department))];
      departments.forEach(dept => {
        initial[dept] = true; // true means collapsed
      });
    }
    return initial;
  });
  const [testFormState, setTestFormState] = useState({
    name: '',
    department: '',
    unit: '',
    referenceRangeMin: '',
    referenceRangeMax: '',
    requiresSpecialSlip: false,
    price: '',
    turnaroundTime: '',
    sampleType: '',
    sampleVolume: '',
    instructions: '',
    isActive: true
  });
  const [panelFormState, setPanelFormState] = useState({
    name: '',
    description: '',
    department: '',
    tests: [],
    isActive: true
  });

  // Sample test panels data (in real app, this would come from database)
  const [testPanels, setTestPanels] = useState([
    {
      id: '1',
      name: 'Complete Blood Count (CBC)',
      description: 'Basic blood cell count and analysis',
      department: 'Hematology',
      tests: ['Hemoglobin', 'White Blood Cells', 'Platelets', 'Red Blood Cells'],
      isActive: true
    },
    {
      id: '2',
      name: 'Comprehensive Metabolic Panel',
      description: 'Liver and kidney function tests',
      department: 'Chemistry',
      tests: ['Glucose', 'Creatinine', 'BUN', 'ALT', 'AST', 'Albumin'],
      isActive: true
    },
    {
      id: '3',
      name: 'Lipid Panel',
      description: 'Cholesterol and triglyceride analysis',
      department: 'Chemistry',
      tests: ['Total Cholesterol', 'HDL', 'LDL', 'Triglycerides'],
      isActive: true
    }
  ]);

  // Get unique departments for filtering
  const departments = useMemo(() => {
    const deps = [...new Set(labTests.map(test => test.department))];
    return deps.sort();
  }, [labTests]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = labTests.length;
    const active = labTests.filter(test => test.isActive !== false).length;
    const special = labTests.filter(test => test.requiresSpecialSlip).length;
    const departments = [...new Set(labTests.map(test => test.department))].length;
    
    return { total, active, special, departments };
  }, [labTests]);

  // Calculate analytics data
  const analytics = useMemo(() => {
    const departmentStats = labTests.reduce((acc, test) => {
      acc[test.department] = (acc[test.department] || 0) + 1;
      return acc;
    }, {});

    const priceStats = labTests.filter(test => test.price).reduce((acc, test) => {
      acc.total += parseFloat(test.price) || 0;
      acc.count += 1;
      return acc;
    }, { total: 0, count: 0 });

    const avgPrice = priceStats.count > 0 ? priceStats.total / priceStats.count : 0;

    return {
      departmentStats,
      avgPrice: avgPrice.toFixed(2),
      totalRevenue: priceStats.total.toFixed(2),
      testPanels: testPanels.length,
      activePanels: testPanels.filter(panel => panel.isActive).length
    };
  }, [labTests, testPanels]);

  // Filter tests based on search and filters
  const filteredTests = useMemo(() => {
    let filtered = labTests;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.referenceRange?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.sampleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.turnaroundTime?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(test => test.department === selectedDepartment);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        filtered = filtered.filter(test => test.isActive !== false);
      } else if (selectedStatus === 'inactive') {
        filtered = filtered.filter(test => test.isActive === false);
      } else if (selectedStatus === 'special') {
        filtered = filtered.filter(test => test.requiresSpecialSlip);
      }
    }

    return filtered;
  }, [labTests, searchTerm, selectedDepartment, selectedStatus]);

  // Group tests by department
  const groupedTests = useMemo(() => {
    if (!groupByDepartment) return null;
    
    const groups = {};
    filteredTests.forEach(test => {
      if (!groups[test.department]) {
        groups[test.department] = [];
      }
      groups[test.department].push(test);
    });
    
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTests, groupByDepartment]);

  const handleOpenModal = (test = null) => {
    setEditingTest(test);
    if (test) {
      // Handle backward compatibility for old referenceRange format
      let referenceRangeMin = '';
      let referenceRangeMax = '';

      if (test.referenceRangeMin && test.referenceRangeMax) {
        // New format already exists
        referenceRangeMin = test.referenceRangeMin;
        referenceRangeMax = test.referenceRangeMax;
      } else if (test.referenceRange) {
        // Old format - try to parse it
        const rangeMatch = test.referenceRange.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
        if (rangeMatch) {
          referenceRangeMin = rangeMatch[1];
          referenceRangeMax = rangeMatch[2];
        }
      }

      setTestFormState({
        name: test.name || '',
        department: test.department || '',
        unit: test.unit || '',
        referenceRangeMin: referenceRangeMin,
        referenceRangeMax: referenceRangeMax,
        requiresSpecialSlip: test.requiresSpecialSlip || false,
        price: test.price || '',
        turnaroundTime: test.turnaroundTime || '',
        sampleType: test.sampleType || '',
        sampleVolume: test.sampleVolume || '',
        instructions: test.instructions || '',
        isActive: test.isActive !== false
      });
    } else {
      // Reset form for new test
      setTestFormState({
        name: '',
        department: '',
        unit: '',
        referenceRangeMin: '',
        referenceRangeMax: '',
        requiresSpecialSlip: false,
        price: '',
        turnaroundTime: '',
        sampleType: '',
        sampleVolume: '',
        instructions: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTest(null);
    setIsModalOpen(false);
    // Reset form state
    setTestFormState({
      name: '',
      department: '',
      unit: '',
      referenceRangeMin: '',
      referenceRangeMax: '',
      requiresSpecialSlip: false,
      price: '',
      turnaroundTime: '',
      sampleType: '',
      sampleVolume: '',
      instructions: '',
      isActive: true
    });
  };

  const handleTestFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTestFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    try {
      if (!testFormState.name || !testFormState.department) {
        showFlashMessage({ type: 'warn', title: 'Warning', message: 'Test Name and Department are required.' });
        return;
      }

      if (editingTest) {
        await updateTest(editingTest.id, testFormState);
        showFlashMessage({ type: 'success', title: 'Success', message: `Test "${testFormState.name}" updated successfully!` });
      } else {
        await addTest(testFormState);
        showFlashMessage({ type: 'success', title: 'Success', message: `Test "${testFormState.name}" added successfully!` });
      }
      handleCloseModal();
    } catch (error) {
      showFlashMessage({ type: 'error', title: 'Error', message: "Failed to save test." });
    }
  };

  const handleDeleteTest = async (testId, testName) => {
    if (window.confirm(`Are you sure you want to delete the test "${testName}"? This cannot be undone.`)) {
      try {
        await deleteTest(testId);
        showFlashMessage({ type: 'success', title: 'Success', message: `Test "${testName}" deleted successfully!` });
      } catch (error) {
        showFlashMessage({ type: 'error', title: 'Error', message: "Failed to delete test." });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTests.length === 0) {
      showFlashMessage({ type: 'warn', title: 'Warning', message: 'No tests selected for deletion.' });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedTests.length} selected tests? This cannot be undone.`)) {
      try {
        for (const testId of selectedTests) {
          await deleteTest(testId);
        }
        setSelectedTests([]);
        showFlashMessage({ type: 'success', title: 'Success', message: `${selectedTests.length} tests deleted successfully!` });
      } catch (error) {
        showFlashMessage({ type: 'error', title: 'Error', message: "Failed to delete some tests." });
      }
    }
  };

  const handleSelectTest = (testId) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTests.length === filteredTests.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(filteredTests.map(test => test.id));
    }
  };

  // Panel management functions
  const handleOpenPanelModal = (panel = null) => {
    setEditingPanel(panel);
    if (panel) {
      setPanelFormState({
        name: panel.name || '',
        description: panel.description || '',
        department: panel.department || '',
        tests: panel.tests || [],
        isActive: panel.isActive !== false
      });
    } else {
      setPanelFormState({
        name: '',
        description: '',
        department: '',
        tests: [],
        isActive: true
      });
    }
    setIsPanelModalOpen(true);
  };

  const handleClosePanelModal = () => {
    setEditingPanel(null);
    setIsPanelModalOpen(false);
  };

  const handlePanelFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPanelFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSavePanel = () => {
    if (!panelFormState.name || !panelFormState.department) {
      showFlashMessage({ type: 'warn', title: 'Warning', message: 'Panel Name and Department are required.' });
      return;
    }

    if (editingPanel) {
      const updatedPanels = testPanels.map(panel => 
        panel.id === editingPanel.id ? { ...panel, ...panelFormState } : panel
      );
      setTestPanels(updatedPanels);
      showFlashMessage({ type: 'success', title: 'Success', message: `Panel "${panelFormState.name}" updated successfully!` });
    } else {
      const newPanel = {
        id: Date.now().toString(),
        ...panelFormState
      };
      setTestPanels([...testPanels, newPanel]);
      showFlashMessage({ type: 'success', title: 'Success', message: `Panel "${panelFormState.name}" added successfully!` });
    }
    handleClosePanelModal();
  };

  // Import/Export functions
  const handleExportTests = () => {
    const dataStr = JSON.stringify(labTests, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lab-tests-export.json';
    link.click();
    URL.revokeObjectURL(url);
    showFlashMessage({ type: 'success', title: 'Success', message: 'Tests exported successfully!' });
  };

  const handleImportTests = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTests = JSON.parse(e.target.result);
        // Simulate import progress
        const interval = setInterval(() => {
          setImportProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsImporting(false);
              showFlashMessage({ type: 'success', title: 'Success', message: `${importedTests.length} tests imported successfully!` });
              return 0;
            }
            return prev + 10;
          });
        }, 100);
      } catch (error) {
        setIsImporting(false);
        setImportProgress(0);
        showFlashMessage({ type: 'error', title: 'Error', message: 'Invalid file format. Please use a valid JSON file.' });
      }
    };
    reader.readAsText(file);
  };

  const toggleDepartmentCollapse = (department) => {
    setCollapsedDepartments(prev => ({
      ...prev,
      [department]: !prev[department]
    }));
  };

  const toggleAllDepartments = (collapse) => {
    if (groupedTests) {
      const newState = {};
      groupedTests.forEach(([dept]) => {
        newState[dept] = collapse;
      });
      setCollapsedDepartments(newState);
    }
  };

  // Initialize collapsed state for new departments when they appear
  const initializeDepartmentCollapse = (department) => {
    if (collapsedDepartments[department] === undefined) {
      setCollapsedDepartments(prev => ({
        ...prev,
        [department]: true // Default to collapsed
      }));
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <FlaskConical size={36} /> Test Catalog
        </Title>
        <Description>
          Manage laboratory tests, panels, and test configurations with advanced filtering and analytics
        </Description>
      </Header>

      <TabContainer>
        <TabButtonsContainer>
          <TabButton
            $active={activeTab === 'tests'}
            onClick={() => setActiveTab('tests')}
          >
            <FlaskConical size={16} />
            Tests ({stats.total})
          </TabButton>
          <TabButton
            $active={activeTab === 'panels'}
            onClick={() => setActiveTab('panels')}
          >
            <Package size={16} />
            Panels ({testPanels.length})
          </TabButton>
          <TabButton
            $active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} />
            Analytics
          </TabButton>
          <TabButton
            $active={activeTab === 'import'}
            onClick={() => setActiveTab('import')}
          >
            <Upload size={16} />
            Import/Export
          </TabButton>
        </TabButtonsContainer>
        
        <TopSearchContainer>
          <TopSearchIcon />
          <TopSearchInput
            type="text"
            placeholder="Search tests by name, department, or details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </TopSearchContainer>
      </TabContainer>

      {/* Tests Tab */}
      {activeTab === 'tests' && (
        <>
          <StatsContainer>
            <StatCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <StatNumber>{stats.total}</StatNumber>
              <StatLabel>Total Tests</StatLabel>
            </StatCard>
            <StatCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <StatNumber>{stats.active}</StatNumber>
              <StatLabel>Active Tests</StatLabel>
            </StatCard>
            <StatCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <StatNumber>{stats.special}</StatNumber>
              <StatLabel>Special Tests</StatLabel>
            </StatCard>
            <StatCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <StatNumber>{stats.departments}</StatNumber>
              <StatLabel>Departments</StatLabel>
            </StatCard>
          </StatsContainer>

          <DepartmentFilterSection>
            <FilterLabel>
              <Building2 size={16} />
              Department
            </FilterLabel>
            <FilterContainer>
              <FilterButton
                $active={selectedDepartment === 'all'}
                onClick={() => setSelectedDepartment('all')}
              >
                <Building2 size={16} />
                All Departments
              </FilterButton>
              
              {departments.map(dept => (
                <FilterButton
                  key={dept}
                  $active={selectedDepartment === dept}
                  onClick={() => setSelectedDepartment(dept)}
                >
                  <DepartmentColor color={departmentColors[dept] || '#667eea'} />
                  {dept}
                </FilterButton>
              ))}
            </FilterContainer>
          </DepartmentFilterSection>
          
          <StatusFilterSection>
            <FilterLabel>
              <CheckCircle size={16} />
              Status
            </FilterLabel>
            <FilterContainer>
              <FilterButton
                $active={selectedStatus === 'all'}
                onClick={() => setSelectedStatus('all')}
              >
                <CheckCircle size={16} />
                All Status
              </FilterButton>
              <FilterButton
                $active={selectedStatus === 'active'}
                onClick={() => setSelectedStatus('active')}
              >
                <CheckCircle size={16} />
                Active
              </FilterButton>
              <FilterButton
                $active={selectedStatus === 'inactive'}
                onClick={() => setSelectedStatus('inactive')}
              >
                <XCircle size={16} />
                Inactive
              </FilterButton>
              <FilterButton
                $active={selectedStatus === 'special'}
                onClick={() => setSelectedStatus('special')}
              >
                <AlertCircle size={16} />
                Special
              </FilterButton>
            </FilterContainer>
          </StatusFilterSection>

          <GroupingToggle>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              width: '100%'
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <ToggleButton
                  $active={groupByDepartment}
                  onClick={() => setGroupByDepartment(true)}
                >
                  <Layers size={16} />
                  Group by Department
                </ToggleButton>
                <ToggleButton
                  $active={!groupByDepartment}
                  onClick={() => setGroupByDepartment(false)}
                >
                  <List size={16} />
                  Show All Tests
                </ToggleButton>
                
                {groupByDepartment && groupedTests && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <ToggleButton
                      onClick={() => toggleAllDepartments(false)}
                      title="Expand All"
                      style={{ padding: '0.75rem', minWidth: '40px', minHeight: '40px' }}
                    >
                      <Maximize2 size={16} />
                    </ToggleButton>
                    <ToggleButton
                      onClick={() => toggleAllDepartments(true)}
                      title="Collapse All"
                      style={{ padding: '0.75rem', minWidth: '40px', minHeight: '40px' }}
                    >
                      <Minimize2 size={16} />
                    </ToggleButton>
                  </div>
                )}
              </div>
              
              {/* Center divider */}
              <div style={{
                width: '1px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
                margin: '0 1rem'
              }} />
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Grid3X3 size={16} />
                    View Mode
                  </span>
                  <ViewToggle>
                    <ViewButton
                      $active={viewMode === 'grid'}
                      onClick={() => setViewMode('grid')}
                      title="2-Column Grid View"
                    >
                      <Grid3X3 size={16} />
                    </ViewButton>
                    <ViewButton
                      $active={viewMode === 'grid3'}
                      onClick={() => setViewMode('grid3')}
                      title="3-Column Grid View"
                    >
                      <Grid3X3 size={16} />
                    </ViewButton>
                    <ViewButton
                      $active={viewMode === 'list'}
                      onClick={() => setViewMode('list')}
                      title="List View"
                    >
                      <List size={16} />
                    </ViewButton>
                  </ViewToggle>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Plus size={16} />
                    Actions
                  </span>
                  <ActionButtons>
                    {selectedTests.length > 0 && (
                      <GlowButton 
                        onClick={handleBulkDelete}
                        style={{ background: '#ef4444', color: 'white' }}
                      >
                        <Trash2 size={16} /> Delete Selected ({selectedTests.length})
                      </GlowButton>
                    )}
                    <GlowButton onClick={() => handleOpenModal()}>
                      <Plus size={16} /> Add Test
                    </GlowButton>
                  </ActionButtons>
                </div>
              </div>
            </div>
          </GroupingToggle>

          {groupByDepartment && groupedTests ? (
            // Grouped view
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {groupedTests.map(([department, tests], deptIndex) => {
                // Initialize collapse state for this department
                initializeDepartmentCollapse(department);
                
                return (
                  <DepartmentSection key={department} style={{
                    marginBottom: collapsedDepartments[department] ? '1.5rem' : '3rem'
                  }}>
                    <DepartmentHeader>
                      <DepartmentTitle>
                        <DepartmentColor color={departmentColors[department] || '#667eea'} />
                        <Building2 size={20} />
                        {department}
                        <CollapseButton
                          onClick={() => toggleDepartmentCollapse(department)}
                          title={collapsedDepartments[department] ? 'Expand' : 'Collapse'}
                        >
                          {collapsedDepartments[department] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        </CollapseButton>
                      </DepartmentTitle>
                      <DepartmentStats>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Package size={14} />
                          {tests.length} tests
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle size={14} />
                          {tests.filter(t => t.isActive !== false).length} active
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <AlertCircle size={14} />
                          {tests.filter(t => t.requiresSpecialSlip).length} special
                        </span>
                        {tests.some(t => t.price) && (
                          <>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <DollarSign size={14} />
                              ${(tests.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0) / tests.filter(t => t.price).length).toFixed(2)} avg
                            </span>
                          </>
                        )}
                        {tests.some(t => t.turnaroundTime) && (
                          <>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Clock size={14} />
                              {Math.round(tests.reduce((sum, t) => sum + (parseInt(t.turnaroundTime) || 0), 0) / tests.filter(t => t.turnaroundTime).length)}h avg
                            </span>
                          </>
                        )}
                      </DepartmentStats>
                    </DepartmentHeader>
                    
                    <CollapsibleSection style={{ 
                      maxHeight: collapsedDepartments[department] ? '0px' : 'none',
                      opacity: collapsedDepartments[department] ? 0 : 1,
                      padding: collapsedDepartments[department] ? '0' : '1.5rem'
                    }}>
                      {viewMode === 'grid' ? (
                        <TestsGrid>
                          {tests.map((test, index) => (
                            <TestCard
                              key={test.id}
                              as={motion.div}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (deptIndex * 0.1) + (index * 0.05) }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              $disabled={test.isActive === false}
                            >
                              <TestHeader>
                                <TestInfo>
                                  <TestName>
                                    {test.name}
                                    {test.requiresSpecialSlip && (
                                      <SpecialBadge>
                                        <AlertCircle size={12} />
                                      </SpecialBadge>
                                    )}
                                  </TestName>
                                  <TestDepartment>
                                    <DepartmentColor color={departmentColors[test.department] || '#667eea'} />
                                    <Building2 size={16} />
                                    {test.department}
                                  </TestDepartment>
                                  <TestStatus>
                                    <StatusBadge $type={test.isActive === false ? 'inactive' : 'active'}>
                                      {test.isActive === false ? 'Inactive' : 'Active'}
                                    </StatusBadge>
                                    {test.requiresSpecialSlip && (
                                      <StatusBadge $type="special">Special</StatusBadge>
                                    )}
                                  </TestStatus>
                                </TestInfo>
                                <TestActions>
                                  <ActionButton
                                    onClick={() => handleSelectTest(test.id)}
                                    title={selectedTests.includes(test.id) ? 'Deselect' : 'Select'}
                                  >
                                    {selectedTests.includes(test.id) ? <CheckCircle size={16} /> : <Eye size={16} />}
                                  </ActionButton>
                                  <ActionButton
                                    onClick={() => handleOpenModal(test)}
                                    title="Edit Test"
                                  >
                                    <Edit size={16} />
                                  </ActionButton>
                                  <ActionButton
                                    onClick={() => handleDeleteTest(test.id, test.name)}
                                    title="Delete Test"
                                    style={{ color: '#ef4444' }}
                                  >
                                    <Trash2 size={16} />
                                  </ActionButton>
                                </TestActions>
                              </TestHeader>
                              
                              <TestDetails>
                                {test.unit && (
                                  <DetailItem>
                                    <Ruler size={14} />
                                    Unit: {test.unit}
                                  </DetailItem>
                                )}
                                {(test.referenceRangeMin || test.referenceRangeMax || test.referenceRange) && (
                                  <DetailItem>
                                    <Target size={14} />
                                    Normal Range: {test.referenceRangeMin && test.referenceRangeMax
                                      ? `${test.referenceRangeMin} - ${test.referenceRangeMax}`
                                      : test.referenceRange || test.referenceRangeMin || test.referenceRangeMax
                                    }
                                  </DetailItem>
                                )}
                                {test.price && (
                                  <GlowingPriceItem>
                                    <DollarSign size={14} />
                                    Price: ${test.price}
                                  </GlowingPriceItem>
                                )}
                                {test.turnaroundTime && (
                                  <DetailItem>
                                    <Clock size={14} />
                                    Turnaround: {test.turnaroundTime}
                                  </DetailItem>
                                )}
                                {test.sampleType && (
                                  <DetailItem>
                                    <FlaskConical size={14} />
                                    Sample: {test.sampleType}
                                    {test.sampleVolume && ` (${test.sampleVolume})`}
                                  </DetailItem>
                                )}
                              </TestDetails>
                            </TestCard>
                          ))}
                        </TestsGrid>
                      ) : viewMode === 'grid3' ? (
                        <TestsGrid3>
                          {tests.map((test, index) => (
                            <TestCard
                              key={test.id}
                              as={motion.div}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (deptIndex * 0.1) + (index * 0.05) }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              $disabled={test.isActive === false}
                            >
                              <TestHeader>
                                <TestInfo>
                                  <TestName>
                                    {test.name}
                                    {test.requiresSpecialSlip && (
                                      <SpecialBadge>
                                        <AlertCircle size={12} />
                                      </SpecialBadge>
                                    )}
                                  </TestName>
                                  <TestDepartment>
                                    <DepartmentColor color={departmentColors[test.department] || '#667eea'} />
                                    <Building2 size={16} />
                                    {test.department}
                                  </TestDepartment>
                                  <TestStatus>
                                    <StatusBadge $type={test.isActive === false ? 'inactive' : 'active'}>
                                      {test.isActive === false ? 'Inactive' : 'Active'}
                                    </StatusBadge>
                                    {test.requiresSpecialSlip && (
                                      <StatusBadge $type="special">Special</StatusBadge>
                                    )}
                                  </TestStatus>
                                </TestInfo>
                                <TestActions>
                                  <ActionButton
                                    onClick={() => handleSelectTest(test.id)}
                                    title={selectedTests.includes(test.id) ? 'Deselect' : 'Select'}
                                  >
                                    {selectedTests.includes(test.id) ? <CheckCircle size={16} /> : <Eye size={16} />}
                                  </ActionButton>
                                  <ActionButton
                                    onClick={() => handleOpenModal(test)}
                                    title="Edit Test"
                                  >
                                    <Edit size={16} />
                                  </ActionButton>
                                  <ActionButton
                                    onClick={() => handleDeleteTest(test.id, test.name)}
                                    title="Delete Test"
                                    style={{ color: '#ef4444' }}
                                  >
                                    <Trash2 size={16} />
                                  </ActionButton>
                                </TestActions>
                              </TestHeader>
                              
                              <TestDetails>
                                {test.unit && (
                                  <DetailItem>
                                    <Ruler size={14} />
                                    Unit: {test.unit}
                                  </DetailItem>
                                )}
                                {(test.referenceRangeMin || test.referenceRangeMax || test.referenceRange) && (
                                  <DetailItem>
                                    <Target size={14} />
                                    Normal Range: {test.referenceRangeMin && test.referenceRangeMax
                                      ? `${test.referenceRangeMin} - ${test.referenceRangeMax}`
                                      : test.referenceRange || test.referenceRangeMin || test.referenceRangeMax
                                    }
                                  </DetailItem>
                                )}
                                {test.price && (
                                  <GlowingPriceItem>
                                    <DollarSign size={14} />
                                    Price: ${test.price}
                                  </GlowingPriceItem>
                                )}
                                {test.turnaroundTime && (
                                  <DetailItem>
                                    <Clock size={14} />
                                    Turnaround: {test.turnaroundTime}
                                  </DetailItem>
                                )}
                                {test.sampleType && (
                                  <DetailItem>
                                    <FlaskConical size={14} />
                                    Sample: {test.sampleType}
                                    {test.sampleVolume && ` (${test.sampleVolume})`}
                                  </DetailItem>
                                )}
                              </TestDetails>
                            </TestCard>
                          ))}
                        </TestsGrid3>
                      ) : (
                        <TestsList>
                          {tests.map((test, index) => (
                            <TestCard
                              key={test.id}
                              as={motion.div}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (deptIndex * 0.1) + (index * 0.05) }}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              $disabled={test.isActive === false}
                            >
                              <TestHeader>
                                <TestInfo>
                                  <TestName>
                                    {test.name}
                                    {test.requiresSpecialSlip && (
                                      <SpecialBadge>
                                        <AlertCircle size={12} />
                                      </SpecialBadge>
                                    )}
                                  </TestName>
                                  <TestDepartment>
                                    <DepartmentColor color={departmentColors[test.department] || '#667eea'} />
                                    <Building2 size={16} />
                                    {test.department}
                                  </TestDepartment>
                                  <TestStatus>
                                    <StatusBadge $type={test.isActive === false ? 'inactive' : 'active'}>
                                      {test.isActive === false ? 'Inactive' : 'Active'}
                                    </StatusBadge>
                                    {test.requiresSpecialSlip && (
                                      <StatusBadge $type="special">Special</StatusBadge>
                                    )}
                                  </TestStatus>
                                </TestInfo>
                                <TestActions>
                                  <ActionButton
                                    onClick={() => handleSelectTest(test.id)}
                                    title={selectedTests.includes(test.id) ? 'Deselect' : 'Select'}
                                  >
                                    {selectedTests.includes(test.id) ? <CheckCircle size={16} /> : <Eye size={16} />}
                                  </ActionButton>
                                  <ActionButton
                                    onClick={() => handleOpenModal(test)}
                                    title="Edit Test"
                                  >
                                    <Edit size={16} />
                                  </ActionButton>
                                  <ActionButton
                                    onClick={() => handleDeleteTest(test.id, test.name)}
                                    title="Delete Test"
                                    style={{ color: '#ef4444' }}
                                  >
                                    <Trash2 size={16} />
                                  </ActionButton>
                                </TestActions>
                              </TestHeader>
                              
                              <TestDetails>
                                {test.unit && (
                                  <DetailItem>
                                    <Ruler size={14} />
                                    Unit: {test.unit}
                                  </DetailItem>
                                )}
                                {(test.referenceRangeMin || test.referenceRangeMax || test.referenceRange) && (
                                  <DetailItem>
                                    <Target size={14} />
                                    Normal Range: {test.referenceRangeMin && test.referenceRangeMax
                                      ? `${test.referenceRangeMin} - ${test.referenceRangeMax}`
                                      : test.referenceRange || test.referenceRangeMin || test.referenceRangeMax
                                    }
                                  </DetailItem>
                                )}
                                {test.price && (
                                  <GlowingPriceItem>
                                    <DollarSign size={14} />
                                    Price: ${test.price}
                                  </GlowingPriceItem>
                                )}
                                {test.turnaroundTime && (
                                  <DetailItem>
                                    <Clock size={14} />
                                    Turnaround: {test.turnaroundTime}
                                  </DetailItem>
                                )}
                                {test.sampleType && (
                                  <DetailItem>
                                    <FlaskConical size={14} />
                                    Sample: {test.sampleType}
                                    {test.sampleVolume && ` (${test.sampleVolume})`}
                                  </DetailItem>
                                )}
                              </TestDetails>
                            </TestCard>
                          ))}
                        </TestsList>
                      )}
                    </CollapsibleSection>
                  </DepartmentSection>
                );
              })}
            </div>
          ) : (
            // Ungrouped view (original display)
            viewMode === 'grid' ? (
              <TestsGrid>
                {testsLoading ? (
                  [...Array(6)].map((_, i) => (
                    <LoadingSkeleton key={i} />
                  ))
                ) : filteredTests.length === 0 ? (
                  <EmptyState style={{ gridColumn: '1 / -1' }}>
                    <EmptyStateIcon>
                      <FlaskConical size={64} style={{ opacity: 0.5 }} />
                    </EmptyStateIcon>
                    <p>No tests found. Add your first test to get started.</p>
                  </EmptyState>
                ) : (
                  filteredTests.map((test, index) => (
                    <TestCard
                      key={test.id}
                      as={motion.div}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      $disabled={test.isActive === false}
                    >
                      <TestHeader>
                        <TestInfo>
                          <TestName>
                            {test.name}
                            {test.requiresSpecialSlip && (
                              <SpecialBadge>
                                <AlertCircle size={12} />
                              </SpecialBadge>
                            )}
                          </TestName>
                          <TestDepartment>
                            <DepartmentColor color={departmentColors[test.department] || '#667eea'} />
                            <Building2 size={16} />
                            {test.department}
                          </TestDepartment>
                          <TestStatus>
                            <StatusBadge $type={test.isActive === false ? 'inactive' : 'active'}>
                              {test.isActive === false ? 'Inactive' : 'Active'}
                            </StatusBadge>
                            {test.requiresSpecialSlip && (
                              <StatusBadge $type="special">Special</StatusBadge>
                            )}
                          </TestStatus>
                        </TestInfo>
                        <TestActions>
                          <ActionButton
                            onClick={() => handleSelectTest(test.id)}
                            title={selectedTests.includes(test.id) ? 'Deselect' : 'Select'}
                          >
                            {selectedTests.includes(test.id) ? <CheckCircle size={16} /> : <Eye size={16} />}
                          </ActionButton>
                          <ActionButton
                            onClick={() => handleOpenModal(test)}
                            title="Edit Test"
                          >
                            <Edit size={16} />
                          </ActionButton>
                          <ActionButton
                            onClick={() => handleDeleteTest(test.id, test.name)}
                            title="Delete Test"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </ActionButton>
                        </TestActions>
                      </TestHeader>
                      
                      <TestDetails>
                        {test.unit && (
                          <DetailItem>
                            <Ruler size={14} />
                            Unit: {test.unit}
                          </DetailItem>
                        )}
                        {(test.referenceRangeMin || test.referenceRangeMax || test.referenceRange) && (
                          <DetailItem>
                            <Target size={14} />
                            Normal Range: {test.referenceRangeMin && test.referenceRangeMax
                              ? `${test.referenceRangeMin} - ${test.referenceRangeMax}`
                              : test.referenceRange || test.referenceRangeMin || test.referenceRangeMax
                            }
                          </DetailItem>
                        )}
                        {test.method && (
                          <DetailItem>
                            <FlaskConical size={14} />
                            Method: {test.method}
                          </DetailItem>
                        )}
                        {test.equipment && (
                          <DetailItem>
                            <Settings size={14} />
                            Equipment: {test.equipment}
                          </DetailItem>
                        )}
                        {test.sampleType && (
                          <DetailItem>
                            <Droplets size={14} />
                            Sample: {test.sampleType}
                            {test.sampleVolume && ` (${test.sampleVolume})`}
                          </DetailItem>
                        )}
                        {test.preparation && (
                          <DetailItem>
                            <Info size={14} />
                            Prep: {test.preparation}
                          </DetailItem>
                        )}
                        {test.price && (
                          <DetailItem>
                            <DollarSign size={14} />
                            Price: ${test.price}
                          </DetailItem>
                        )}
                        {test.turnaroundTime && (
                          <DetailItem>
                            <Clock size={14} />
                            TAT: {test.turnaroundTime}h
                          </DetailItem>
                        )}
                        {test.requiresSpecialSlip && (
                          <DetailItem>
                            <AlertCircle size={14} />
                            Special Handling Required
                          </DetailItem>
                        )}
                        {test.notes && (
                          <DetailItem>
                            <FileText size={14} />
                            {test.notes}
                          </DetailItem>
                        )}
                      </TestDetails>
                    </TestCard>
                  ))
                )}
              </TestsGrid>
            ) : viewMode === 'grid3' ? (
              <TestsGrid3>
                {testsLoading ? (
                  [...Array(6)].map((_, i) => (
                    <LoadingSkeleton key={i} />
                  ))
                ) : filteredTests.length === 0 ? (
                  <EmptyState style={{ gridColumn: '1 / -1' }}>
                    <EmptyStateIcon>
                      <FlaskConical size={64} style={{ opacity: 0.5 }} />
                    </EmptyStateIcon>
                    <p>No tests found. Add your first test to get started.</p>
                  </EmptyState>
                ) : (
                  filteredTests.map((test, index) => (
                    <TestCard
                      key={test.id}
                      as={motion.div}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      $disabled={test.isActive === false}
                    >
                      <TestHeader>
                        <TestInfo>
                          <TestName>
                            {test.name}
                            {test.requiresSpecialSlip && (
                              <SpecialBadge>
                                <AlertCircle size={12} />
                              </SpecialBadge>
                            )}
                          </TestName>
                          <TestDepartment>
                            <DepartmentColor color={departmentColors[test.department] || '#667eea'} />
                            <Building2 size={16} />
                            {test.department}
                          </TestDepartment>
                          <TestStatus>
                            <StatusBadge $type={test.isActive === false ? 'inactive' : 'active'}>
                              {test.isActive === false ? 'Inactive' : 'Active'}
                            </StatusBadge>
                            {test.requiresSpecialSlip && (
                              <StatusBadge $type="special">Special</StatusBadge>
                            )}
                          </TestStatus>
                        </TestInfo>
                        <TestActions>
                          <ActionButton
                            onClick={() => handleSelectTest(test.id)}
                            title={selectedTests.includes(test.id) ? 'Deselect' : 'Select'}
                          >
                            {selectedTests.includes(test.id) ? <CheckCircle size={16} /> : <Eye size={16} />}
                          </ActionButton>
                          <ActionButton
                            onClick={() => handleOpenModal(test)}
                            title="Edit Test"
                          >
                            <Edit size={16} />
                          </ActionButton>
                          <ActionButton
                            onClick={() => handleDeleteTest(test.id, test.name)}
                            title="Delete Test"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </ActionButton>
                        </TestActions>
                      </TestHeader>
                      
                      <TestDetails>
                        {test.unit && (
                          <DetailItem>
                            <Ruler size={14} />
                            Unit: {test.unit}
                          </DetailItem>
                        )}
                        {(test.referenceRangeMin || test.referenceRangeMax || test.referenceRange) && (
                          <DetailItem>
                            <Target size={14} />
                            Normal Range: {test.referenceRangeMin && test.referenceRangeMax
                              ? `${test.referenceRangeMin} - ${test.referenceRangeMax}`
                              : test.referenceRange || test.referenceRangeMin || test.referenceRangeMax
                            }
                          </DetailItem>
                        )}
                        {test.method && (
                          <DetailItem>
                            <FlaskConical size={14} />
                            Method: {test.method}
                          </DetailItem>
                        )}
                        {test.equipment && (
                          <DetailItem>
                            <Settings size={14} />
                            Equipment: {test.equipment}
                          </DetailItem>
                        )}
                        {test.sampleType && (
                          <DetailItem>
                            <Droplets size={14} />
                            Sample: {test.sampleType}
                            {test.sampleVolume && ` (${test.sampleVolume})`}
                          </DetailItem>
                        )}
                        {test.preparation && (
                          <DetailItem>
                            <Info size={14} />
                            Prep: {test.preparation}
                          </DetailItem>
                        )}
                        {test.price && (
                          <DetailItem>
                            <DollarSign size={14} />
                            Price: ${test.price}
                          </DetailItem>
                        )}
                        {test.turnaroundTime && (
                          <DetailItem>
                            <Clock size={14} />
                            TAT: {test.turnaroundTime}h
                          </DetailItem>
                        )}
                        {test.requiresSpecialSlip && (
                          <DetailItem>
                            <AlertCircle size={14} />
                            Special Handling Required
                          </DetailItem>
                        )}
                        {test.notes && (
                          <DetailItem>
                            <FileText size={14} />
                            {test.notes}
                          </DetailItem>
                        )}
                      </TestDetails>
                    </TestCard>
                  ))
                )}
              </TestsGrid3>
            ) : (
              <TestsList>
                {tests.map((test, index) => (
                  <TestCard
                    key={test.id}
                    as={motion.div}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    $disabled={test.isActive === false}
                  >
                    <TestHeader>
                      <TestInfo>
                        <TestName>
                          {test.name}
                          {test.requiresSpecialSlip && (
                            <SpecialBadge>
                              <AlertCircle size={12} />
                            </SpecialBadge>
                          )}
                        </TestName>
                        <TestDepartment>
                          <DepartmentColor color={departmentColors[test.department] || '#667eea'} />
                          <Building2 size={16} />
                          {test.department}
                        </TestDepartment>
                        <TestStatus>
                          <StatusBadge $type={test.isActive === false ? 'inactive' : 'active'}>
                            {test.isActive === false ? 'Inactive' : 'Active'}
                          </StatusBadge>
                          {test.requiresSpecialSlip && (
                            <StatusBadge $type="special">Special</StatusBadge>
                          )}
                        </TestStatus>
                      </TestInfo>
                      <TestActions>
                        <ActionButton
                          onClick={() => handleSelectTest(test.id)}
                          title={selectedTests.includes(test.id) ? 'Deselect' : 'Select'}
                        >
                          {selectedTests.includes(test.id) ? <CheckCircle size={16} /> : <Eye size={16} />}
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleOpenModal(test)}
                          title="Edit Test"
                        >
                          <Edit size={16} />
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleDeleteTest(test.id, test.name)}
                          title="Delete Test"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={16} />
                        </ActionButton>
                      </TestActions>
                    </TestHeader>
                    
                    <TestDetails>
                      {test.unit && (
                        <DetailItem>
                          <Ruler size={14} />
                          Unit: {test.unit}
                        </DetailItem>
                      )}
                      {(test.referenceRangeMin || test.referenceRangeMax || test.referenceRange) && (
                        <DetailItem>
                          <Target size={14} />
                          Reference: {test.referenceRangeMin && test.referenceRangeMax
                            ? `${test.referenceRangeMin} - ${test.referenceRangeMax}`
                            : test.referenceRange || test.referenceRangeMin || test.referenceRangeMax
                          }
                        </DetailItem>
                      )}
                      {test.method && (
                        <DetailItem>
                          <FlaskConical size={14} />
                          Method: {test.method}
                        </DetailItem>
                      )}
                      {test.equipment && (
                        <DetailItem>
                          <Settings size={14} />
                          Equipment: {test.equipment}
                        </DetailItem>
                      )}
                      {test.sampleType && (
                        <DetailItem>
                          <Droplets size={14} />
                          Sample: {test.sampleType}
                          {test.sampleVolume && ` (${test.sampleVolume})`}
                        </DetailItem>
                      )}
                      {test.preparation && (
                        <DetailItem>
                          <Info size={14} />
                          Prep: {test.preparation}
                        </DetailItem>
                      )}
                      {test.price && (
                        <DetailItem>
                          <DollarSign size={14} />
                          Price: ${test.price}
                        </DetailItem>
                      )}
                      {test.turnaroundTime && (
                        <DetailItem>
                          <Clock size={14} />
                          TAT: {test.turnaroundTime}h
                        </DetailItem>
                      )}
                      {test.requiresSpecialSlip && (
                        <DetailItem>
                          <AlertCircle size={14} />
                          Special Handling Required
                        </DetailItem>
                      )}
                      {test.notes && (
                        <DetailItem>
                          <FileText size={14} />
                          {test.notes}
                        </DetailItem>
                      )}
                    </TestDetails>
                  </TestCard>
                ))}
              </TestsList>
            )
          )}
        </>
      )}

      {/* Panels Tab */}
      {activeTab === 'panels' && (
        <PanelSection>
          <QuickActions>
            <GlowButton onClick={() => handleOpenPanelModal()}>
              <Plus size={16} /> Add Panel
            </GlowButton>
            <QuickActionButton onClick={() => setTestPanels([...testPanels].sort((a, b) => a.name.localeCompare(b.name)))}>
              <SortAsc size={16} /> Sort by Name
            </QuickActionButton>
            <QuickActionButton onClick={() => setTestPanels([...testPanels].sort((a, b) => a.department.localeCompare(b.department)))}>
              <Building2 size={16} /> Sort by Department
            </QuickActionButton>
          </QuickActions>

          {testPanels.map((panel, index) => (
            <PanelCard
              key={panel.id}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              $disabled={panel.isActive === false}
            >
              <PanelHeader>
                <div>
                  <PanelTitle>
                    <Package size={20} />
                    {panel.name}
                    {panel.isActive === false && <EyeOff size={16} color="#6b7280" />}
                  </PanelTitle>
                  <p style={{ margin: '0.5rem 0', color: '#6b7280' }}>{panel.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <DepartmentColor color={departmentColors[panel.department] || '#667eea'} />
                    <span style={{ color: '#6b7280' }}>{panel.department}</span>
                    <StatusBadge $type={panel.isActive === false ? 'inactive' : 'active'}>
                      {panel.isActive === false ? 'Inactive' : 'Active'}
                    </StatusBadge>
                  </div>
                </div>
                <TestActions>
                  <ActionButton
                    onClick={() => handleOpenPanelModal(panel)}
                    title="Edit Panel"
                  >
                    <Edit size={16} />
                  </ActionButton>
                  <ActionButton
                    onClick={() => {
                      const updatedPanels = testPanels.filter(p => p.id !== panel.id);
                      setTestPanels(updatedPanels);
                      showFlashMessage({ type: 'success', title: 'Success', message: `Panel "${panel.name}" deleted successfully!` });
                    }}
                    title="Delete Panel"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={16} />
                  </ActionButton>
                </TestActions>
              </PanelHeader>
              
              <PanelTests>
                {panel.tests.map((test, idx) => (
                  <PanelTestTag key={idx}>
                    <FlaskConical size={12} />
                    {test}
                  </PanelTestTag>
                ))}
              </PanelTests>
            </PanelCard>
          ))}
        </PanelSection>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AnalyticsSection>
          <AnalyticsGrid>
            <AnalyticsCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} />
                Revenue Overview
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <MetricCard>
                  <MetricValue>${analytics.avgPrice}</MetricValue>
                  <MetricLabel>Average Price</MetricLabel>
                </MetricCard>
                <MetricCard>
                  <MetricValue>${analytics.totalRevenue}</MetricValue>
                  <MetricLabel>Total Revenue</MetricLabel>
                </MetricCard>
              </div>
            </AnalyticsCard>

            <AnalyticsCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} />
                Department Distribution
              </h3>
              <ChartContainer>
                <div style={{ textAlign: 'center' }}>
                  <PieChart size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <p>Department breakdown visualization</p>
                  <div style={{ marginTop: '1rem' }}>
                    {Object.entries(analytics.departmentStats).map(([dept, count]) => (
                      <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>{dept}:</span>
                        <span>{count} tests</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartContainer>
            </AnalyticsCard>

            <AnalyticsCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={20} />
                Panel Statistics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <MetricCard>
                  <MetricValue>{analytics.testPanels}</MetricValue>
                  <MetricLabel>Total Panels</MetricLabel>
                </MetricCard>
                <MetricCard>
                  <MetricValue>{analytics.activePanels}</MetricValue>
                  <MetricLabel>Active Panels</MetricLabel>
                </MetricCard>
              </div>
            </AnalyticsCard>

            <AnalyticsCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} />
                Performance Metrics
              </h3>
              <ChartContainer>
                <div style={{ textAlign: 'center' }}>
                  <BarChart3 size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <p>Performance trends and metrics</p>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>Active Tests:</span>
                      <span>{stats.active}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>Special Tests:</span>
                      <span>{stats.special}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Departments:</span>
                      <span>{stats.departments}</span>
                    </div>
                  </div>
                </div>
              </ChartContainer>
            </AnalyticsCard>
          </AnalyticsGrid>
        </AnalyticsSection>
      )}

      {/* Import/Export Tab */}
      {activeTab === 'import' && (
        <ImportExportSection>
          <ImportExportCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={20} />
              Export Tests
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>
              Export all your test data to a JSON file for backup or migration purposes.
            </p>
            <GlowButton onClick={handleExportTests}>
              <FileSpreadsheet size={16} /> Export All Tests
            </GlowButton>
          </ImportExportCard>

          <ImportExportCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={20} />
              Import Tests
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>
              Import test data from a JSON file. This will add new tests to your catalog.
            </p>
            
            {isImporting ? (
              <div>
                <p>Importing tests...</p>
                <ProgressBar>
                  <ProgressFill progress={importProgress} />
                </ProgressBar>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>{importProgress}% complete</p>
              </div>
            ) : (
              <FileUploadArea onClick={() => document.getElementById('file-input').click()}>
                <Upload size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <p>Click to select a JSON file or drag and drop</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Supported format: JSON file with test data
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept=".json"
                  onChange={handleImportTests}
                  style={{ display: 'none' }}
                />
              </FileUploadArea>
            )}
          </ImportExportCard>
        </ImportExportSection>
      )}

      {/* Enhanced Modal Form */}
      <AnimatedModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTest ? `Edit Test: ${editingTest.name}` : 'Add New Test'}
      >
        <ModalForm>
          {/* Basic Information Section */}
          <FormSection>
            <SectionTitle>
              <FlaskConical size={18} />
              Basic Information
            </SectionTitle>
            <FormGrid>
              <InputGroup>
                <Label>Test Name *</Label>
                <Input
                  name="name"
                  value={testFormState.name}
                  onChange={handleTestFormChange}
                  placeholder="Test Name (e.g., Glucose)"
                  required
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Department *</Label>
                <Select
                  name="department"
                  value={testFormState.department}
                  onChange={handleTestFormChange}
                  required
                >
                  <option value="">Department (e.g., Chemistry)</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Select>
              </InputGroup>
            </FormGrid>
          </FormSection>

          {/* Test Parameters Section */}
          <FormSection>
            <SectionTitle>
              <Settings size={18} />
              Test Parameters
            </SectionTitle>
            <FormGrid>
              <InputGroup>
                <Label>Unit</Label>
                <Select
                  name="unit"
                  value={testFormState.unit}
                  onChange={handleTestFormChange}
                >
                  <option value="">Unit (e.g., mg/dL)</option>
                  {UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </Select>
              </InputGroup>
              
              <InputGroup>
                <Label>Price ($)</Label>
                <Input
                  name="price"
                  type="number"
                  value={testFormState.price}
                  onChange={handleTestFormChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </InputGroup>
            </FormGrid>
            
            <InputGroup>
              <Label>Reference Range</Label>
              <ReferenceRangeContainer>
                <div>
                  <Label>Minimum</Label>
                  <Input
                    type="number"
                    name="referenceRangeMin"
                    value={testFormState.referenceRangeMin}
                    onChange={handleTestFormChange}
                    placeholder="Min value"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Maximum</Label>
                  <Input
                    type="number"
                    name="referenceRangeMax"
                    value={testFormState.referenceRangeMax}
                    onChange={handleTestFormChange}
                    placeholder="Max value"
                    step="0.01"
                  />
                </div>
              </ReferenceRangeContainer>
            </InputGroup>
          </FormSection>

          {/* Sample & Timing Section */}
          <FormSection>
            <SectionTitle>
              <Clock size={18} />
              Sample & Timing
            </SectionTitle>
            <FormGrid>
              <InputGroup>
                <Label>Sample Type</Label>
                <Select
                  name="sampleType"
                  value={testFormState.sampleType}
                  onChange={handleTestFormChange}
                >
                  <option value="">e.g., Blood, Urine, Serum, Plasma</option>
                  {SAMPLE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </InputGroup>
              
              <InputGroup>
                <Label>Sample Volume</Label>
                <Input
                  name="sampleVolume"
                  value={testFormState.sampleVolume}
                  onChange={handleTestFormChange}
                  placeholder="e.g., 2mL, 5mL, 10mL"
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Turnaround Time</Label>
                <Select
                  name="turnaroundTime"
                  value={testFormState.turnaroundTime}
                  onChange={handleTestFormChange}
                >
                  <option value="">e.g., 24 hours, Same day, 2-3 days</option>
                  {TURNAROUND_TIMES.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </Select>
              </InputGroup>
            </FormGrid>
          </FormSection>

          {/* Additional Information Section */}
          <FormSection>
            <SectionTitle>
              <FileText size={18} />
              Additional Information
            </SectionTitle>
            <FullWidthField>
              <InputGroup>
                <Label>Instructions</Label>
                <TextArea
                  name="instructions"
                  value={testFormState.instructions}
                  onChange={handleTestFormChange}
                  placeholder="Special instructions for sample collection or test preparation..."
                />
              </InputGroup>
            </FullWidthField>
          </FormSection>

          {/* Settings Section */}
          <FormSection>
            <SectionTitle>
              <CheckCircle size={18} />
              Test Settings
            </SectionTitle>
            <ToggleContainer>
              <ToggleLabel>
                <FileText size={16} />
                <div>
                  <strong>Special Slip</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                    Generate a special, individual slip for this test
                  </p>
                </div>
              </ToggleLabel>
              <ToggleSwitch>
                <input
                  type="checkbox"
                  name="requiresSpecialSlip"
                  checked={testFormState.requiresSpecialSlip}
                  onChange={handleTestFormChange}
                />
                <span></span>
              </ToggleSwitch>
            </ToggleContainer>

            <ToggleContainer>
              <ToggleLabel>
                <CheckCircle size={16} />
                <div>
                  <strong>Active Test</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                    Make this test available for ordering
                  </p>
                </div>
              </ToggleLabel>
              <ToggleSwitch>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={testFormState.isActive}
                  onChange={handleTestFormChange}
                />
                <span></span>
              </ToggleSwitch>
            </ToggleContainer>
          </FormSection>

          <Actions>
            <GlowButton type="button" onClick={handleCloseModal} style={{ background: '#eee', color: '#333' }}>
              Cancel
            </GlowButton>
            <GlowButton type="button" onClick={handleSaveTest}>
              <Save size={16} /> Save Test
            </GlowButton>
          </Actions>
        </ModalForm>
      </AnimatedModal>

      {/* Panel Modal */}
      <AnimatedModal
        isOpen={isPanelModalOpen}
        onClose={handleClosePanelModal}
        title={editingPanel ? `Edit Panel: ${editingPanel.name}` : 'Add New Panel'}
      >
        <ModalForm>
          <InputGroup>
            <Label>Panel Name *</Label>
            <Input
              name="name"
              value={panelFormState.name}
              onChange={handlePanelFormChange}
              placeholder="Panel Name (e.g., Complete Blood Count)"
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label>Description</Label>
            <textarea
              name="description"
              value={panelFormState.description}
              onChange={handlePanelFormChange}
              placeholder="Panel description and purpose..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                background: '#fff',
                color: '#333',
                fontSize: '1rem',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </InputGroup>
          
          <InputGroup>
            <Label>Department *</Label>
            <Input
              name="department"
              value={panelFormState.department}
              onChange={handlePanelFormChange}
              placeholder="Department (e.g., Hematology)"
              required
            />
          </InputGroup>

          <ToggleContainer>
            <ToggleLabel>
              <CheckCircle size={16} />
              <div>
                <strong>Active Panel</strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                  Make this panel available for ordering
                </p>
              </div>
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                name="isActive"
                checked={panelFormState.isActive}
                onChange={handlePanelFormChange}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleContainer>

          <Actions>
            <GlowButton type="button" onClick={handleClosePanelModal} style={{ background: '#eee', color: '#333' }}>
              Cancel
            </GlowButton>
            <GlowButton type="button" onClick={handleSavePanel}>
              <Save size={16} /> Save Panel
            </GlowButton>
          </Actions>
        </ModalForm>
      </AnimatedModal>
    </Container>
  );
};

export default TestCatalog; 