import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, limit, startAfter, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaClock, FaPlay, FaCheckCircle, FaTimes, FaSearch, FaFilter, FaPrint, FaDownload, FaEye, 
  FaEdit, FaTrash, FaPlus, FaColumns, FaList, FaSync, FaSpinner, FaChartLine, FaCalendar, 
  FaUser, FaVial, FaThermometer, FaInfoCircle, FaSortUp, FaSortDown, FaRedo, 
  FaPause, FaTicketAlt, FaIdCard, FaFlask, FaBarcode, FaClipboardList, FaBan, FaSave, FaCog, FaBug
} from 'react-icons/fa';
import OrderCard from '../../components/WorkQueue/OrderCard';
import GlowCard from '../../components/common/GlowCard';
import GlowButton from '../../components/common/GlowButton';
import PrintCenter from '../../components/common/PrintCenter';
import PrintableReport from '../../components/Print/PrintableReport';
import RequisitionForm from '../../components/Print/RequisitionForm';
import MasterSlip from '../../components/Print/MasterSlip';
import DepartmentSlip from '../../components/Print/DepartmentSlip';
import TubeIdSlip from '../../components/Print/TubeIdSlip';
import { usePerformanceMonitor, useMemoWithPerformance, useCallbackWithPerformance } from '../../utils/performanceOptimizer';
import { FixedSizeList as List } from 'react-window';
import usePdfDownload from '../../components/Print/usePdfDownload';
import { showFlashMessage } from '../../contexts/NotificationContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AnimatedModal from '../../components/common/AnimatedModal';



// Department Theme System - Premium & State-of-the-Art
const departmentThemes = {
  all: {
    primary: '#3b82f6',
    accent: '#60a5fa',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#334155',
    borderHover: '#475569',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    shadowHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    name: 'All Departments',
    icon: 'FaClipboardList'
  },
  Hematology: {
    primary: '#ef4444',
    accent: '#f87171',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#334155',
    borderHover: '#475569',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    shadowHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    name: 'Hematology Lab',
    icon: 'FaVial'
  },
  Chemistry: {
    primary: '#fbbf24',
    accent: '#fde68a',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#334155',
    borderHover: '#fbbf24',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    shadowHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    name: 'Chemistry Lab',
    icon: 'FaFlask'
  },
  Serology: {
    primary: '#22c55e',
    accent: '#4ade80',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#334155',
    borderHover: '#22c55e',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    shadowHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    name: 'Serology Lab',
    icon: 'FaThermometer'
  },
  Virology: {
    primary: '#2563eb',
    accent: '#60a5fa',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#334155',
    borderHover: '#2563eb',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    shadowHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    name: 'Virology Lab',
    icon: 'FaIdCard'
  },
  Microbiology: {
    primary: '#a21caf',
    accent: '#e879f9',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#334155',
    borderHover: '#a21caf',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    shadowHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    gradient: 'linear-gradient(135deg, #a21caf 0%, #6d28d9 100%)',
    name: 'Microbiology Lab',
    icon: 'FaBacteria'
  },
  Parasitology: {
    primary: '#f97316',
    accent: '#fdba74',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#334155',
    borderHover: '#f97316',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    shadowHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    name: 'Parasitology Lab',
    icon: 'FaBug'
  }
};

// Notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore errors if audio fails
  } catch (error) {
    // Fallback: use Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.log('Audio notification not supported');
    }
  }
};

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${({ theme, $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.background : theme.colors.background};
  color: ${({ theme, $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.text : theme.colors.text};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`;

const DepartmentSwitcher = styled(motion.div)`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0.5rem;
  background: ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.surface : '#1e293b'};
  border: 1px solid ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.border : '#334155'};
  border-radius: 16px;
  box-shadow: ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.shadow : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'};
`;

const DepartmentButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: none;
  background: ${({ $active, $departmentTheme }) => 
    $active 
      ? ($departmentTheme ? $departmentTheme.gradient : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)')
      : 'transparent'};
  color: ${({ $active, $departmentTheme }) => 
    $active ? '#ffffff' : ($departmentTheme ? $departmentTheme.textSecondary : '#cbd5e1')};
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  box-shadow: ${({ $active, $departmentTheme }) => 
    $active 
      ? ($departmentTheme ? $departmentTheme.shadowHover : '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
      : 'none'};
  
  &:hover {
    background: ${({ $active, $departmentTheme }) => 
      $active 
        ? ($departmentTheme ? $departmentTheme.gradient : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)')
        : ($departmentTheme ? $departmentTheme.surfaceHover : '#334155')};
    transform: translateY(-1px);
    box-shadow: ${({ $departmentTheme }) => 
      $departmentTheme ? $departmentTheme.shadowHover : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 1rem;
  }
`;

const PageHeader = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme, $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.border : theme.colors.border};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 60px;
    height: 2px;
    background: ${({ $departmentTheme }) => 
      $departmentTheme ? $departmentTheme.gradient : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'};
    border-radius: 1px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.text : '#f8fafc'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const HeaderSubtitle = styled('p')`
  font-size: 1rem;
  color: ${({ theme, $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.textSecondary : theme.colors.textSecondary};
  margin-top: 0.5rem;
  margin-bottom: 0;
`;

const DepartmentIndicator = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: ${({ $departmentTheme }) => 
    $departmentTheme ? `${$departmentTheme.primary}15` : 'rgba(59, 130, 246, 0.15)'};
  border: 1px solid ${({ $departmentTheme }) => 
    $departmentTheme ? `${$departmentTheme.primary}25` : 'rgba(59, 130, 246, 0.25)'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.primary : '#3b82f6'};
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $departmentTheme }) => 
      $departmentTheme ? $departmentTheme.primary : '#3b82f6'};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const SearchAndFilterContainer = styled(GlowCard)`
  padding: 1.5rem;
  margin-bottom: 2rem;
  background: ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.surface : '#1e293b'};
  border: 1px solid ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.border : '#334155'};
  border-radius: 16px;
  box-shadow: ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.shadow : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'};
  position: relative;
`;

const FilterGrid = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: center;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SearchInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  svg {
    position: absolute;
    left: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1rem;
    z-index: 2;
  }
  
  input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(20px);
    
    &::placeholder {
      color: ${({ theme }) => theme.colors.textSecondary};
    }
    
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
      transform: scale(1.02);
    }
    
    &:hover {
      border-color: #667eea;
    }
  }
`;

const FilterSelect = styled('select')`
  padding: 0.8rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    transform: scale(1.02);
  }
  
  &:hover {
    border-color: #667eea;
  }
  
  option {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
    color: ${({ theme }) => theme.colors.text};
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ClearFiltersButton = styled(GlowButton)`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
  
  ${({ $active, theme }) => $active && `
    background: ${theme.colors.primary};
    color: white;
    border-color: ${theme.colors.primary};
  `}
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.surface : '#1e293b'};
  border: 1px solid ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.border : '#334155'};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.shadow : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'};
  position: relative;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $departmentTheme }) => 
      $departmentTheme ? $departmentTheme.shadowHover : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $departmentTheme }) => 
      $departmentTheme ? $departmentTheme.gradient : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'};
    border-radius: 16px 16px 0 0;
  }
`;

// Colored icon component for stat cards
const ColoredIcon = ({ icon: Icon, type, $departmentTheme }) => {
  const iconColors = {
    all: '#3b82f6',
    pending: '#ef4444',
    inProgress: '#f59e0b',
    completed: '#10b981',
    urgent: '#ef4444',
    cancelled: '#6b7280'
  };
  
  return (
    <Icon style={{ color: iconColors[type] || ($departmentTheme ? $departmentTheme.primary : '#3b82f6') }} />
  );
};

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $departmentTheme }) => 
    $departmentTheme ? `${$departmentTheme.primary}15` : 'rgba(59, 130, 246, 0.15)'};
  color: ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.primary : '#3b82f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.text : '#f8fafc'};
  position: relative;
  z-index: 1;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
  text-align: center;
  line-height: 1.2;
`;

const StatChange = styled.div`
  font-size: 0.8rem;
  color: ${({ $positive, theme }) => $positive ? theme.colors.success : theme.colors.error};
  font-weight: 600;
  margin-top: 0.5rem;
  position: relative;
  z-index: 1;
`;

const FilterContainer = styled(motion.div)`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

// Memoized filter button component
const FilterButton = memo(styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 2px solid ${({ theme, $active }) => 
    $active ? '#667eea' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  background: ${({ theme, $active }) => 
    $active ? 'rgba(102, 126, 234, 0.2)' : 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'};
  color: ${({ theme, $active }) => 
    $active ? '#667eea' : theme.colors.text};
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`);

FilterButton.displayName = 'FilterButton';

// Memoized orders grid component
const OrdersGrid = memo(styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`);

OrdersGrid.displayName = 'OrdersGrid';

// Memoized loading container component
const LoadingContainer = memo(styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-direction: column;
  gap: 1rem;
`);

LoadingContainer.displayName = 'LoadingContainer';

// Memoized empty state component
const EmptyState = memo(styled(GlowCard)`
  text-align: center;
  padding: 4rem 2rem;
  background: ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.surface : '#1e293b'};
  border: 1px solid ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.border : '#334155'};
  border-radius: 16px;
  box-shadow: ${({ $departmentTheme }) => 
    $departmentTheme ? $departmentTheme.shadow : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $departmentTheme }) => 
      $departmentTheme ? $departmentTheme.gradient : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'};
    border-radius: 16px 16px 0 0;
  }
  
  svg {
    font-size: 4rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text};
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 1.5rem;
  }
`);

EmptyState.displayName = 'EmptyState';

// Memoized order card wrapper
const MemoizedOrderCard = memo(({ order, onStatusChange, onViewDetails, onPrint, onDownload }) => (
  <OrderCard
    key={order.id}
    order={order}
    onStatusChange={onStatusChange}
    onViewDetails={onViewDetails}
    onPrint={onPrint}
    onDownload={onDownload}
  />
));

MemoizedOrderCard.displayName = 'MemoizedOrderCard';

const DraggableCard = styled.div`
  margin-bottom: 1rem;
  cursor: grab;
  user-select: none;
  
  &:active {
    cursor: grabbing;
  }
`;

// Add global styles for draggable cards
const GlobalDragStyles = styled.div`
  .draggable-card {
    margin-bottom: 1rem;
    cursor: grab;
    user-select: none;
  }
  
  .draggable-card:active {
    cursor: grabbing;
  }
  
  /* Fix drag preview positioning */
  [data-rbd-draggable-state="dragging"] {
    transform: none !important;
    position: fixed !important;
    z-index: 9999 !important;
    pointer-events: none !important;
    opacity: 0.9 !important;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3) !important;
  }
`;



const KanbanContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const KanbanColumn = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 1.5rem;
  min-height: 400px;
  border: 2px solid ${({ status }) => {
    switch (status) {
      case 'pending_collection': return '#ef4444';
      case 'in_progress': return '#f97316';
      case 'completed': return '#22c55e';
      case 'cancelled': return '#6b7280';
      default: return '#374151';
    }
  }};
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ColumnTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ color }) => color};
`;

const ColumnCount = styled.span`
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  padding: 0.3rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
`;

const DroppableArea = styled.div`
  min-height: 500px;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  position: relative;
  
  ${({ $isDraggingOver }) => $isDraggingOver && `
    background: rgba(59, 130, 246, 0.1);
    border: 2px dashed rgba(59, 130, 246, 0.5);
    
    &::before {
      content: 'Drop here';
      position: absolute;
      top: 50%;
      left: 50%;
      background: rgba(59, 130, 246, 0.9);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      z-index: 1000;
      pointer-events: none;
    }
  `}
  
  /* Ensure proper drop zone behavior */
  &[data-rbd-droppable-id] {
    min-height: 500px;
  }
`;

const kanbanColumns = [
  { id: 'Sample Collected', title: 'Pending Collection', color: '#ef4444', icon: <FaClock /> },
  { id: 'In Progress', title: 'In Progress', color: '#f59e0b', icon: <FaPlay /> },
  { id: 'Completed', title: 'Completed', color: '#10b981', icon: <FaCheckCircle /> },
  { id: 'Cancelled', title: 'Cancelled', color: '#6b7280', icon: <FaTimes /> }
];



const WorkQueue = memo(() => {
  usePerformanceMonitor('WorkQueue');
  
  const { t } = useTranslation();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  
  // State management with performance optimization
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printType, setPrintType] = useState('report');
  const downloadPdf = usePdfDownload();
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [savedViews, setSavedViews] = useState([]);
  const [currentViewName, setCurrentViewName] = useState('');
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [optimisticUpdates, setOptimisticUpdates] = useState(new Map());
  const [notifications, setNotifications] = useState([]);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [lastUrgentCount, setLastUrgentCount] = useState(0);
  const [focusedElement, setFocusedElement] = useState(null);
  const [showCancelledColumn, setShowCancelledColumn] = useState(false);
  const [isCreatingMissingOrders, setIsCreatingMissingOrders] = useState(false);



  // Remove all custom CSS and handlers - let react-beautiful-dnd handle everything

  // Function to create missing test orders for existing collected samples
  const createMissingTestOrders = async () => {
    setIsCreatingMissingOrders(true);
    try {
      // Get all patients with sample_collected status
      const patientsQuery = query(
        collection(db, 'patients'),
        where('bloodCollectionStatus', '==', 'sample_collected')
      );
      
      const patientsSnapshot = await getDocs(patientsQuery);
      const collectedPatients = [];
      
      patientsSnapshot.forEach(doc => {
        collectedPatients.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`Found ${collectedPatients.length} patients with collected samples`);
      
      // Get existing test orders to avoid duplicates
      const testOrdersQuery = query(collection(db, 'testOrders'));
      const testOrdersSnapshot = await getDocs(testOrdersQuery);
      const existingTestOrders = new Set();
      
      testOrdersSnapshot.forEach(doc => {
        const order = doc.data();
        // Create a unique key based on patient ID and collection time
        const key = `${order.patientId}_${order.collectionTime?.toDate?.() || order.collectionTime}`;
        existingTestOrders.add(key);
      });
      
      // Create test orders for patients that don't have them
      let createdCount = 0;
      let skippedCount = 0;
      
      for (const patient of collectedPatients) {
        // Create a unique key for this patient
        const key = `${patient.patientId}_${patient.collectionTime?.toDate?.() || patient.collectionTime}`;
        
        if (existingTestOrders.has(key)) {
          skippedCount++;
          continue;
        }
        
        // Create test order data
        const testOrderData = {
          patientId: patient.patientId,
          patientName: patient.patientName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
          patientAge: patient.age,
          patientGender: patient.gender,
          referringDoctor: patient.referringDoctor || 'N/A',
          orderDate: patient.createdAt?.toDate?.() || new Date(patient.createdAt),
          status: 'Sample Collected',
          priority: patient.priority || 'Normal',
          tests: patient.selectedTests || [],
          totalPrice: 0,
          notes: patient.phlebotomistNotes || '',
          createdBy: 'Phlebotomist',
          createdAt: patient.createdAt?.toDate?.() || new Date(patient.createdAt),
          collectionTime: patient.collectionTime?.toDate?.() || new Date(patient.collectionTime),
          collectedBy: patient.collectedBy || 'Phlebotomist',
          tubeVolumes: patient.tubeVolumes || {}
        };
        
        // Add the test order
        await addDoc(collection(db, 'testOrders'), testOrderData);
        createdCount++;
      }
      
      showFlashMessage({ 
        type: 'success', 
        title: 'Success', 
        message: `Created ${createdCount} missing test orders. Skipped ${skippedCount} existing ones.` 
      });
      
    } catch (error) {
      console.error('Error creating missing test orders:', error);
      showFlashMessage({ 
        type: 'error', 
        title: 'Error', 
        message: 'Failed to create missing test orders' 
      });
    } finally {
      setIsCreatingMissingOrders(false);
    }
  };
  
  // Dynamic kanban columns based on showCancelledColumn state
  const activeKanbanColumns = useMemo(() => {
    return kanbanColumns.filter(column => 
      column.id !== 'Cancelled' || showCancelledColumn
    );
  }, [showCancelledColumn]);
  
  // Get order with optimistic updates
  const getOrderWithOptimisticUpdates = (order) => {
    const optimisticUpdate = optimisticUpdates.get(order.id);
    if (optimisticUpdate) {
      return {
        ...order,
        status: optimisticUpdate.status,
        _isOptimistic: true
      };
    }
    return order;
  };
  
  // Memoized processed orders with filtering and sorting
  const processedOrders = useMemoWithPerformance(() => {
    let filtered = orders.map(getOrderWithOptimisticUpdates);

    // Apply department filter FIRST (by test department)
    if (departmentFilter !== 'all') {
      // Only show orders with at least one test relevant to the selected department
      filtered = filtered.filter(order =>
        order.tests && order.tests.some(test => test.department === departmentFilter)
      );
    }

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderId?.toLowerCase().includes(searchLower) ||
        order.patientName?.toLowerCase().includes(searchLower) ||
        order.patientId?.toLowerCase().includes(searchLower) ||
        order.department?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(order => order.priority === priorityFilter);
    }
    
    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(order => {
        const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        
        if (startDate && endDate) {
          return orderDate >= startDate && orderDate <= endDate;
        } else if (startDate) {
          return orderDate >= startDate;
        } else if (endDate) {
          return orderDate <= endDate;
        }
        return true;
      });
    }
    
    // Apply department selection filter (multi-select, if used)
    if (selectedDepartments.length > 0) {
      filtered = filtered.filter(order => selectedDepartments.includes(order.department));
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle date fields
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = aValue?.toDate?.() || new Date(aValue);
        bValue = bValue?.toDate?.() || new Date(bValue);
      }
      
      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    return filtered;
  }, [
    orders, 
    optimisticUpdates, 
    debouncedSearchTerm, 
    statusFilter, 
    priorityFilter, 
    departmentFilter, 
    dateRange, 
    selectedDepartments, 
    sortBy, 
    sortOrder
  ], 'processed_orders');
  
  // Memoized stats calculation (including optimistic updates)
  const stats = useMemoWithPerformance(() => {
    const ordersWithOptimisticUpdates = orders.map(getOrderWithOptimisticUpdates);
    const total = ordersWithOptimisticUpdates.length;
    const pending = ordersWithOptimisticUpdates.filter(o => o.status === 'Sample Collected').length;
    const inProgress = ordersWithOptimisticUpdates.filter(o => o.status === 'In Progress').length;
    const completed = ordersWithOptimisticUpdates.filter(o => o.status === 'Completed').length;
    const cancelled = ordersWithOptimisticUpdates.filter(o => o.status === 'Cancelled').length;

    return { total, pending, inProgress, completed, cancelled };
  }, [orders, optimisticUpdates], 'stats_calculation');
  
  const allSelected = processedOrders.length > 0 && selectedOrderIds.length === processedOrders.length;
  const toggleSelectOrder = (id) => setSelectedOrderIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  const toggleSelectAll = () => setSelectedOrderIds(allSelected ? [] : processedOrders.map(o => o.id));

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      // Close modals
      if (showSaveViewModal) setShowSaveViewModal(false);
      if (showPrintModal) setShowPrintModal(false);
      if (showTimelineModal) setShowTimelineModal(false);
    }
    
    // Tab navigation for order cards
    if (e.key === 'Tab' && viewMode === 'list') {
      const orderCards = document.querySelectorAll('[data-order-card]');
      const currentIndex = Array.from(orderCards).findIndex(card => card === document.activeElement);
      
      if (e.shiftKey && currentIndex > 0) {
        e.preventDefault();
        orderCards[currentIndex - 1]?.focus();
      } else if (!e.shiftKey && currentIndex < orderCards.length - 1) {
        e.preventDefault();
        orderCards[currentIndex + 1]?.focus();
      }
    }
  }, [showSaveViewModal, showPrintModal, showTimelineModal, viewMode]);

  // Focus management
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);





  // Announce changes to screen readers
  const announceToScreenReader = useCallback((message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }, []);

  // Announce stats changes
  useEffect(() => {
    if (stats.total > 0) {
      announceToScreenReader(`Work queue loaded with ${stats.total} orders. ${stats.urgent} urgent orders.`);
    }
  }, [stats.total, stats.urgent, announceToScreenReader]);

  // Real-time notification system
  useEffect(() => {
    const currentUrgentCount = orders.filter(o => o.priority === 'urgent').length;
    const currentOrderCount = orders.length;

    // New urgent orders notification
    if (currentUrgentCount > lastUrgentCount && lastUrgentCount > 0) {
      const newUrgentOrders = orders.filter(o => 
        o.priority === 'urgent' && 
        o.createdAt?.toDate && 
        o.createdAt.toDate() > new Date(Date.now() - 30000) // Last 30 seconds
      );
      
      if (newUrgentOrders.length > 0) {
        playNotificationSound();
        showFlashMessage({
          type: 'warning',
          title: 'Urgent Orders',
          message: `${newUrgentOrders.length} new urgent order${newUrgentOrders.length > 1 ? 's' : ''} received`
        });
      }
    }

    // New orders notification
    if (currentOrderCount > lastOrderCount && lastOrderCount > 0) {
      const newOrders = orders.filter(o => 
        o.createdAt?.toDate && 
        o.createdAt.toDate() > new Date(Date.now() - 30000) // Last 30 seconds
      );
      
      if (newOrders.length > 0 && newOrders.length <= 3) { // Only notify for small batches
        showFlashMessage({
          type: 'info',
          title: 'New Orders',
          message: `${newOrders.length} new order${newOrders.length > 1 ? 's' : ''} received`
        });
      }
    }

    setLastUrgentCount(currentUrgentCount);
    setLastOrderCount(currentOrderCount);
  }, [orders, lastUrgentCount, lastOrderCount]);

  // Critical value notifications
  useEffect(() => {
    const criticalOrders = orders.filter(o => 
      o.status === 'Critical' || 
      (o.tests && o.tests.some(test => test.status === 'Critical'))
    );

    criticalOrders.forEach(order => {
      const existingNotification = notifications.find(n => n.orderId === order.id);
      if (!existingNotification) {
        playNotificationSound();
        setNotifications(prev => [...prev, {
          id: Date.now().toString(),
          orderId: order.id,
          type: 'critical',
          message: `Critical value for order ${order.orderId}`,
          timestamp: new Date()
        }]);
        
        showFlashMessage({
          type: 'error',
          title: 'Critical Value',
          message: `Critical value detected for order ${order.orderId}`,
          duration: 10000
        });
      }
    });
  }, [orders, notifications]);

  // Auto-clear old notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.filter(n => 
          new Date() - n.timestamp < 300000 // 5 minutes
        )
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Load saved views from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('workQueue_savedViews');
    if (saved) {
      setSavedViews(JSON.parse(saved));
    }
  }, []);

  // Save current filter state as a view
  const saveCurrentView = (name) => {
    const currentView = {
      id: Date.now().toString(),
      name,
      filters: {
        searchTerm,
        statusFilter,
        priorityFilter,
        departmentFilter,
        dateRange,
        selectedDepartments,
        sortBy,
        sortOrder
      },
      createdAt: new Date().toISOString()
    };
    
    const updatedViews = [...savedViews, currentView];
    setSavedViews(updatedViews);
    localStorage.setItem('workQueue_savedViews', JSON.stringify(updatedViews));
    setShowSaveViewModal(false);
    setCurrentViewName('');
  };

  // Load a saved view
  const loadSavedView = (view) => {
    const { filters } = view;
    setSearchTerm(filters.searchTerm || '');
    setStatusFilter(filters.statusFilter || 'all');
    setPriorityFilter(filters.priorityFilter || 'all');
    setDepartmentFilter(filters.departmentFilter || 'all');
    setDateRange(filters.dateRange || { start: '', end: '' });
    setSelectedDepartments(filters.selectedDepartments || []);
    setSortBy(filters.sortBy || 'createdAt');
    setSortOrder(filters.sortOrder || 'desc');
  };

  // Delete a saved view
  const deleteSavedView = (viewId) => {
    const updatedViews = savedViews.filter(v => v.id !== viewId);
    setSavedViews(updatedViews);
    localStorage.setItem('workQueue_savedViews', JSON.stringify(updatedViews));
  };

  // Get current filter state as a string for comparison
  const getCurrentFilterState = () => {
    return JSON.stringify({
      searchTerm,
      statusFilter,
      priorityFilter,
      departmentFilter,
      dateRange,
      selectedDepartments,
      sortBy,
      sortOrder
    });
  };

  // Check if current state matches any saved view
  const currentStateMatchesSavedView = () => {
    const currentState = getCurrentFilterState();
    return savedViews.some(view => 
      JSON.stringify(view.filters) === currentState
    );
  };

  // Memoized query for orders (first page)
  const ordersQuery = useMemoWithPerformance(() => {
    const baseQuery = query(
      collection(db, 'testOrders'),
      orderBy('createdAt', 'desc')
    );
    if (statusFilter !== 'all') {
      return query(baseQuery, where('status', '==', statusFilter));
    }
    return baseQuery;
  }, [statusFilter], 'orders_query');

  // Initial and paginated data fetching
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      showFlashMessage({ type: 'error', title: 'Error', message: 'Failed to load orders' });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [ordersQuery]);

  // Optimistic status update
  const handleOptimisticStatusChange = async (orderId, newStatus) => {
    // Store original state for potential rollback
    const originalOrder = orders.find(o => o.id === orderId);
    if (!originalOrder) return;

    // Immediately update UI optimistically
    setOptimisticUpdates(prev => new Map(prev.set(orderId, { status: newStatus, timestamp: Date.now() })));
    
    try {
      // Update backend
      await updateDoc(doc(db, 'testOrders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Remove optimistic update on success
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(orderId);
        return newMap;
      });
      
      showFlashMessage({ type: 'success', title: 'Success', message: 'Order status updated successfully' });
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Revert optimistic update on failure
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(orderId);
        return newMap;
      });
      
      showFlashMessage({ type: 'error', title: 'Error', message: 'Failed to update order status' });
    }
  };

  // Update the existing handleStatusChange to use optimistic updates
  const handleStatusChange = useCallbackWithPerformance(async (orderId, newStatus) => {
    await handleOptimisticStatusChange(orderId, newStatus);
  }, [], 'status_change');

  // Optimized event handlers
  const handleSearchChange = useCallbackWithPerformance((e) => {
    setSearchTerm(e.target.value);
  }, [], 'search_change');

  const handleStatusFilterChange = useCallbackWithPerformance((status) => {
    setStatusFilter(status);
  }, [], 'status_filter_change');

  const handlePriorityFilterChange = useCallbackWithPerformance((priority) => {
    setPriorityFilter(priority);
  }, [], 'priority_filter_change');

  const handleDepartmentFilterChange = useCallbackWithPerformance((department) => {
    setDepartmentFilter(department);
  }, [], 'department_filter_change');

  const handleSort = useCallbackWithPerformance((field) => {
    setSortBy(prev => {
      if (prev === field) {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortOrder('desc');
      }
      return field;
    });
  }, [], 'sort_change');

  const clearFilters = useCallbackWithPerformance(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDepartmentFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setDateRange({ start: '', end: '' });
    setSelectedDepartments([]);
    setShowAdvancedFilters(false);
    setShowCancelledColumn(false);
  }, [], 'clear_filters');

  const handleViewDetails = useCallbackWithPerformance((order) => {
    setSelectedOrder(order);
    // Navigate to order details
  }, [], 'view_details');

  const handlePrint = useCallbackWithPerformance((order, type = 'report') => {
    setSelectedOrder(order);
    setPrintType(type);
    setShowPrintModal(true);
  }, [], 'print_order');

  const handleViewTimeline = useCallbackWithPerformance((order) => {
    setSelectedOrder(order);
    setShowTimelineModal(true);
  }, [], 'view_timeline');

  const handleDownloadPDF = useCallbackWithPerformance(async (order) => {
    try {
      await downloadPdf('masterSlip', order, 'en');
      showFlashMessage({ type: 'success', title: 'Success', message: 'PDF download started' });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showFlashMessage({ type: 'error', title: 'Error', message: 'Failed to download PDF' });
    }
  }, [downloadPdf], 'download_pdf');

  // Memoized sort icon component
  const getSortIcon = useCallbackWithPerformance((field) => {
    if (sortBy !== field) return <FaSort />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  }, [sortBy, sortOrder], 'sort_icon');

  // Memoized filter options
  const filterOptions = useMemo(() => ({
    status: [
      { value: 'all', label: t('workQueue.allStatuses') },
      { value: 'Sample Collected', label: t('workQueue.pending') },
      { value: 'In Progress', label: t('workQueue.inProgress') },
      { value: 'Completed', label: t('workQueue.completed') },
      { value: 'Cancelled', label: t('workQueue.cancelled') }
    ],
    priority: [
      { value: 'all', label: t('workQueue.allPriorities') },
      { value: 'normal', label: t('workQueue.normal') },
      { value: 'urgent', label: t('workQueue.urgent') },
      { value: 'critical', label: t('workQueue.critical') }
    ],
    department: [
      { value: 'all', label: t('workQueue.allDepartments') },
      { value: 'Hematology', label: t('workQueue.hematology') },
      { value: 'Chemistry', label: t('workQueue.chemistry') },
      { value: 'Serology', label: t('workQueue.serology') },
      { value: 'Virology', label: t('workQueue.virology') },
      { value: 'Microbiology', label: t('workQueue.microbiology') },
      { value: 'Parasitology', label: t('workQueue.parasitology') }
    ]
  }), [t]);

  // Batch status update
  const handleBatchStatusChange = async (newStatus) => {
    for (const id of selectedOrderIds) {
      await handleStatusChange(id, newStatus);
    }
    setSelectedOrderIds([]);
  };

  // Batch actions
  const handleBatchPrint = () => {
    const selectedOrders = processedOrders.filter(o => selectedOrderIds.includes(o.id));
    // For now, print the first order as a placeholder
    if (selectedOrders.length > 0) {
      handlePrint(selectedOrders[0], 'report');
    }
    setSelectedOrderIds([]);
  };

  const handleBatchDownload = async () => {
    const selectedOrders = processedOrders.filter(o => selectedOrderIds.includes(o.id));
    for (const order of selectedOrders) {
      await handleDownloadPDF(order);
    }
    setSelectedOrderIds([]);
  };

  const handleDragEnd = async (result) => {
    console.log('Drag end:', result);
    
    if (!result.destination) {
      return;
    }
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reorder within same column
      return;
    }
    
    // Update order status
    const newStatus = destination.droppableId;
    await handleStatusChange(draggableId, newStatus);
  };

  const handleDragStart = (result) => {
    console.log('Drag start:', result);
    
    // Fix drag preview positioning
    setTimeout(() => {
      const dragPreview = document.querySelector('[data-rbd-draggable-state="dragging"]');
      if (dragPreview && result.clientX && result.clientY) {
        // Position the preview at the mouse cursor
        dragPreview.style.left = `${result.clientX}px`;
        dragPreview.style.top = `${result.clientY}px`;
        dragPreview.style.transform = 'translate(-50%, -50%)';
      }
    }, 0);
  };

  const handleDragUpdate = (result) => {
    console.log('Drag update:', result);
    
    // Update drag preview position to follow mouse cursor
    const dragPreview = document.querySelector('[data-rbd-draggable-state="dragging"]');
    if (dragPreview && result.clientX && result.clientY) {
      // Keep the preview centered on the mouse cursor
      dragPreview.style.left = `${result.clientX}px`;
      dragPreview.style.top = `${result.clientY}px`;
      dragPreview.style.transform = 'translate(-50%, -50%)';
    }
  };



  const getOrdersByStatus = (status) => {
    return processedOrders.filter(order => order.status === status);
  };

      const renderKanbanBoard = () => (
        <DragDropContext 
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onDragUpdate={handleDragUpdate}
        >
          <KanbanContainer>
            {activeKanbanColumns.map((column) => {
              const orders = getOrdersByStatus(column.id);
              return (
                <KanbanColumn 
                  key={column.id} 
                  status={column.id}
                >
                  <ColumnHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ color: column.color }}>
                        {column.icon}
                      </div>
                      <ColumnTitle color={column.color}>{column.title}</ColumnTitle>
                    </div>
                    <ColumnCount color={column.color}>{orders.length}</ColumnCount>
                  </ColumnHeader>
                  
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <DroppableArea
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        $isDraggingOver={snapshot.isDraggingOver}
                      >
                        {orders.map((order, index) => (
                          <Draggable key={order.id} draggableId={order.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={provided.draggableProps.style}
                                className="draggable-card"
                              >
                                <MemoizedOrderCard
                                  order={order}
                                  onStatusChange={handleStatusChange}
                                  onViewDetails={handleViewDetails}
                                  onPrint={handlePrint}
                                  onViewTimeline={handleViewTimeline}
                                  onDownload={handleDownloadPDF}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </DroppableArea>
                    )}
                  </Droppable>
                </KanbanColumn>
              );
            })}
          </KanbanContainer>
        </DragDropContext>
      );

  const renderListView = () => (
    <>
      {processedOrders.length === 0 ? (
        <EmptyState $departmentTheme={currentDepartmentTheme}>
          <FaList />
          <h3>{t('workQueue.noOrders')}</h3>
          <p>{t('workQueue.noOrdersDescription')}</p>
        </EmptyState>
      ) : (
        <>
          <div style={{ width: '100%', height: Math.min(processedOrders.length * 180, 800), maxWidth: '100%' }}>
            <List
              height={Math.min(processedOrders.length * 180, 800)}
              itemCount={processedOrders.length}
              itemSize={190}
              width={'100%'}
              style={{ overflowX: 'hidden' }}
            >
              {({ index, style }) => {
                const order = processedOrders[index];
                return (
                  <div style={style} key={order.id}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={selectedOrderIds.includes(order.id)} onChange={() => toggleSelectOrder(order.id)} style={{ marginRight: 8, marginTop: 8 }} />
                      <MemoizedOrderCard
                        order={order}
                        onStatusChange={handleStatusChange}
                        onViewDetails={handleViewDetails}
                        onPrint={handlePrint}
                        onViewTimeline={handleViewTimeline}
                        onDownload={handleDownloadPDF}
                      />
                    </div>
                  </div>
                );
              }}
            </List>
          </div>
          {/* Removed loadMoreOrders button as pagination is removed */}
        </>
      )}
    </>
  );

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <FaSpinner size={40} />
          <p>{t('workQueue.loading')}</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  const departmentOptions = filterOptions.department;
  const currentDepartmentLabel = departmentOptions.find(dep => dep.value === departmentFilter)?.label || t('workQueue.title');
  const currentDepartmentTheme = departmentThemes[departmentFilter] || departmentThemes.all;

  return (
    <>
      <GlobalDragStyles />
      <PageContainer
        key={departmentFilter} // This will trigger re-animation when department changes
        $departmentTheme={currentDepartmentTheme}
      >


      {/* Department Switcher at the top */}
      <DepartmentSwitcher
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        $departmentTheme={currentDepartmentTheme}
      >
        {departmentOptions.map(option => {
          const optionTheme = departmentThemes[option.value] || departmentThemes.all;
          return (
            <DepartmentButton
              key={option.value}
              onClick={() => handleDepartmentFilterChange(option.value)}
              $active={departmentFilter === option.value}
              $departmentTheme={optionTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {option.value === 'all' && <FaClipboardList />}
              {option.value === 'Hematology' && <FaVial />}
              {option.value === 'Chemistry' && <FaFlask />}
              {option.value === 'Serology' && <FaThermometer />}
              {option.value === 'Virology' && <FaIdCard />}
              {option.value === 'Microbiology' && <FaBarcode />}
              {option.value === 'Parasitology' && <FaBug />}
              {option.label}
            </DepartmentButton>
          );
        })}
      </DepartmentSwitcher>
      <PageHeader $departmentTheme={currentDepartmentTheme}>
        <div>
          <HeaderTitle $departmentTheme={currentDepartmentTheme}>
            <FaClipboardList />
            Lab work
          </HeaderTitle>
          {departmentFilter !== 'all' && (
            <DepartmentIndicator
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              $departmentTheme={currentDepartmentTheme}
            >
              {currentDepartmentLabel}
            </DepartmentIndicator>
          )}
        </div>

        <HeaderActions>
          <GlowButton
            onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {viewMode === 'kanban' ? <FaList /> : <FaColumns />}
            {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
          </GlowButton>
          <GlowButton
            onClick={createMissingTestOrders}
            disabled={isCreatingMissingOrders}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCreatingMissingOrders ? <FaSpinner className="fa-spin" /> : <FaSync />}
            {isCreatingMissingOrders ? 'Creating...' : 'Sync Missing Orders'}
          </GlowButton>
        </HeaderActions>
      </PageHeader>



      <StatsGrid>
        <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} $departmentTheme={currentDepartmentTheme}>
          <StatIcon $departmentTheme={currentDepartmentTheme}>
            <ColoredIcon icon={FaClipboardList} type="all" $departmentTheme={currentDepartmentTheme} />
          </StatIcon>
          <StatContent>
            <StatValue $departmentTheme={currentDepartmentTheme}>{stats.total}</StatValue>
            <StatLabel>{t('workQueue.allStatuses')}</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} $departmentTheme={currentDepartmentTheme}>
          <StatIcon $departmentTheme={currentDepartmentTheme}>
            <ColoredIcon icon={FaClock} type="pending" $departmentTheme={currentDepartmentTheme} />
          </StatIcon>
          <StatContent>
            <StatValue $departmentTheme={currentDepartmentTheme}>{stats.pending}</StatValue>
            <StatLabel>{t('workQueue.pending')}</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} $departmentTheme={currentDepartmentTheme}>
          <StatIcon $departmentTheme={currentDepartmentTheme}>
            <ColoredIcon icon={FaPlay} type="inProgress" $departmentTheme={currentDepartmentTheme} />
          </StatIcon>
          <StatContent>
            <StatValue $departmentTheme={currentDepartmentTheme}>{stats.inProgress}</StatValue>
            <StatLabel>{t('workQueue.inProgress')}</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} $departmentTheme={currentDepartmentTheme}>
          <StatIcon $departmentTheme={currentDepartmentTheme}>
            <ColoredIcon icon={FaCheckCircle} type="completed" $departmentTheme={currentDepartmentTheme} />
          </StatIcon>
          <StatContent>
            <StatValue $departmentTheme={currentDepartmentTheme}>{stats.completed}</StatValue>
            <StatLabel>{t('workQueue.completed')}</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} $departmentTheme={currentDepartmentTheme}>
          <StatIcon $departmentTheme={currentDepartmentTheme}>
            <ColoredIcon icon={FaTimes} type="cancelled" $departmentTheme={currentDepartmentTheme} />
          </StatIcon>
          <StatContent>
            <StatValue $departmentTheme={currentDepartmentTheme}>{stats.cancelled}</StatValue>
            <StatLabel>{t('workQueue.cancelled')}</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <SearchInput>
        <FaSearch />
        <input
          type="text"
          placeholder={t('workQueue.searchPlaceholder')}
          value={searchTerm}
          onChange={handleSearchChange}
          aria-label={t('workQueue.searchLabel')}
        />
      </SearchInput>

      {/* Advanced filters panel */}
      {showAdvancedFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ 
            padding: '1rem', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px', 
            background: '#1e293b', 
            marginTop: '1rem',        // ← Adjust this value
            marginBottom: '1rem'      // ← Adjust this value
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label>Date Range</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              />
            </div>
            <div>
              <label>To</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              />
            </div>
            <div>
              <label>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              >
                <option value="createdAt">Created Date</option>
                <option value="patientName">Patient Name</option>
                <option value="orderId">Order ID</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={showCancelledColumn}
                  onChange={(e) => setShowCancelledColumn(e.target.checked)}
                  style={{ margin: 0 }}
                />
                Show Cancelled Column
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* Status filter buttons and action buttons in one line */}
             <div style={{ 
         display: 'flex', 
         justifyContent: 'space-between', 
         alignItems: 'center', 
         marginTop: '0rem',     // ← Adjust this value
         marginBottom: '-2rem'   // ← Adjust this value
       }}>
        <FilterGrid>
          {filterOptions.status.map(option => (
            <FilterButton
              key={option.value}
              $active={statusFilter === option.value}
              onClick={() => handleStatusFilterChange(option.value)}
              title={option.label}
            >
              {option.value === 'all' && <FaClipboardList style={{ color: '#3b82f6' }} />}
              {option.value === 'Sample Collected' && <FaClock style={{ color: '#ef4444' }} />}
              {option.value === 'In Progress' && <FaPlay style={{ color: '#f59e0b' }} />}
              {option.value === 'Completed' && <FaCheckCircle style={{ color: '#10b981' }} />}
              {option.value === 'Cancelled' && <FaTimes style={{ color: '#6b7280' }} />}
            </FilterButton>
          ))}
        </FilterGrid>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <FilterButton
            $active={showAdvancedFilters}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            title={showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          >
            <FaCog style={{ color: '#3b82f6' }} />
          </FilterButton>
          <FilterButton
            onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
            title={viewMode === 'kanban' ? 'Switch to List View' : 'Switch to Kanban View'}
          >
            {viewMode === 'kanban' ? <FaList style={{ color: '#10b981' }} /> : <FaColumns style={{ color: '#10b981' }} />}
          </FilterButton>
          <FilterButton
            onClick={() => setShowSaveViewModal(true)}
            disabled={currentStateMatchesSavedView()}
            title="Save Current View"
          >
            <FaSave style={{ color: '#8b5cf6' }} />
          </FilterButton>
          <FilterButton
            onClick={() => setShowPrintModal(true)}
            title="Print All Orders"
          >
            <FaPrint style={{ color: '#f59e0b' }} />
          </FilterButton>
          <FilterButton
            onClick={clearFilters}
            title="Clear Filters"
          >
            <FaRedo style={{ color: '#ef4444' }} />
          </FilterButton>
        </div>
      </div>

      {selectedOrderIds.length > 0 && (
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', padding: '1rem', borderBottom: '2px solid #667eea', display: 'flex', alignItems: 'center', gap: 16 }}>
          <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} style={{ marginRight: 8 }} />
          <span>{selectedOrderIds.length} selected</span>
          <GlowButton onClick={() => handleBatchStatusChange('Completed')}>Mark as Completed</GlowButton>
          <GlowButton onClick={() => handleBatchStatusChange('In Progress')}>Mark as In Progress</GlowButton>
          <GlowButton onClick={() => handleBatchStatusChange('Sample Collected')}>Mark as Sample Collected</GlowButton>
          <GlowButton onClick={handleBatchPrint}><FaPrint /> Print Selected</GlowButton>
          <GlowButton onClick={handleBatchDownload}><FaDownload /> Download Selected</GlowButton>
          <GlowButton $variant="secondary" onClick={() => setSelectedOrderIds([])}>Clear</GlowButton>
        </div>
      )}

      {viewMode === 'kanban' ? renderKanbanBoard() : renderListView()}

      {showPrintModal && selectedOrder && (
        <PrintCenter
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title={t('workQueue.printOrder')}
        >
          {printType === 'report' && <PrintableReport order={selectedOrder} />}
          {printType === 'requisition' && <RequisitionForm order={selectedOrder} />}
          {printType === 'masterSlip' && <MasterSlip order={selectedOrder} />}
          {printType === 'departmentSlip' && <DepartmentSlip order={selectedOrder} />}
          {printType === 'tubeIdSlip' && <TubeIdSlip order={selectedOrder} />}
        </PrintCenter>
      )}

      {showSaveViewModal && (
        <AnimatedModal isOpen={showSaveViewModal} onClose={() => setShowSaveViewModal(false)} title="Save Current View">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Enter view name..."
              value={currentViewName}
              onChange={(e) => setCurrentViewName(e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <GlowButton onClick={() => setShowSaveViewModal(false)}>Cancel</GlowButton>
              <GlowButton 
                onClick={() => saveCurrentView(currentViewName)}
                disabled={!currentViewName.trim()}
              >
                Save View
              </GlowButton>
            </div>
          </div>
        </AnimatedModal>
              )}
      </PageContainer>
    </>
  );
});

WorkQueue.displayName = 'WorkQueue';

export default WorkQueue;