import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaUser, FaCalendar, FaClock, FaMapMarker, FaPhone, FaEnvelope,
  FaCheckCircle, FaTimes, FaSpinner, FaSearch, FaFilter, FaSort,
  FaSortUp, FaSortDown, FaEye, FaPrint, FaQrcode, FaBarcode,
  FaUserMd, FaVial, FaSyringe, FaThermometer, FaExclamationTriangle,
  FaInfoCircle, FaChartLine, FaCalendarAlt, FaMapMarkerAlt,
  FaUserCircle, FaFileAlt, FaDownload, FaUpload, FaCog, FaBell,
  FaIdCard, FaUserPlus, FaHeartbeat, FaNotesMedical, FaFlask, FaTag
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import GlowCard from '../../components/common/GlowCard';
import GlowButton from '../../components/common/GlowButton';
import { FixedSizeList as List } from 'react-window';
import PremiumBarcodeScanner from '../../components/common/PremiumBarcodeScanner';
import { showFlashMessage } from '../../contexts/NotificationContext.tsx';


// --- Enhanced Main Container ---
const PhlebotomistContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${({ theme }) => theme.isDarkMode 
    ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
    : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
  };
  background-attachment: fixed;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 16px 16px 0 0;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
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

// --- Enhanced Stats Section ---
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
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
    height: 4px;
    background: ${({ color }) => color};
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  color: ${({ color }) => color};
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const StatChange = styled.div`
  font-size: 0.8rem;
  color: ${({ $positive, theme }) => $positive ? theme.colors.success : theme.colors.error};
  font-weight: 600;
  margin-top: 0.5rem;
`;

// --- Enhanced Search & Filters ---
const SearchAndFilterContainer = styled(GlowCard)`
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchInput = styled.div`
  position: relative;
  
  input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border-radius: 12px;
    border: 2px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.input};
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
  }
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.2rem;
  }
`;

const FilterSelect = styled.select`
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.input};
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

const FilterActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
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

// --- Enhanced Sample Collection Grid ---
const SamplesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SampleCard = styled(GlowCard)`
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $priority, theme }) => {
      switch ($priority) {
        case 'urgent': return theme.colors.error;
        case 'high': return theme.colors.warning;
        case 'normal': return theme.colors.primary;
        default: return theme.colors.info;
      }
    }};
  }
`;

const SampleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const SampleInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SampleId = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
`;

const PriorityBadge = styled.div`
  position: absolute;
  top: 1.2rem;
  left: 1.7rem;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  font-size: 1.01rem;
  font-weight: 800;
  background: ${({ $priority, theme }) => {
    switch ($priority) {
      case 'urgent': return `linear-gradient(90deg,${theme.colors.error}cc 0%,#fff0 100%)`;
      case 'high': return `linear-gradient(90deg,${theme.colors.warning}cc 0%,#fff0 100%)`;
      case 'normal': return `linear-gradient(90deg,${theme.colors.primary}cc 0%,#fff0 100%)`;
      default: return `linear-gradient(90deg,${theme.colors.info}cc 0%,#fff0 100%)`;
    }
  }};
  color: ${({ $priority, theme }) => {
    switch ($priority) {
      case 'urgent': return theme.colors.error;
      case 'high': return theme.colors.warning;
      case 'normal': return theme.colors.primary;
      default: return theme.colors.info;
    }
  }};
  border: none;
  box-shadow: 0 2px 12px ${({ $priority, theme }) => {
    switch ($priority) {
      case 'urgent': return theme.colors.error + '33';
      case 'high': return theme.colors.warning + '22';
      case 'normal': return theme.colors.primary + '22';
      default: return theme.colors.info + '22';
    }
  }};
`;

const SampleDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  padding: 0.5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.8rem;
  }
  
  span:first-child {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 500;
  }
  
  span:last-child {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const TestsList = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid ${({ theme }) => theme.colors.border};
`;

const TestsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const TestsTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  font-weight: 600;
`;

const TestsCount = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const TestTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

// Tag for tests
const TestTag = styled.span`
  display: inline-flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.primary + '22'};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.2rem 0.7rem;
  margin: 0 0.25rem 0.25rem 0;
  gap: 0.3rem;
`;

const SampleActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(GlowButton)`
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  
  ${({ $variant, theme }) => $variant === 'secondary' && `
    background: ${theme.colors.surface};
    color: ${theme.colors.textSecondary};
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      background: ${theme.colors.hover};
    }
  `}
  
  ${({ $variant, theme }) => $variant === 'success' && `
    background: ${theme.colors.success};
    color: white;
    
    &:hover {
      background: ${theme.colors.success}dd;
    }
  `}
  
  ${({ $variant, theme }) => $variant === 'warning' && `
    background: ${theme.colors.warning};
    color: white;
    
    &:hover {
      background: ${theme.colors.warning}dd;
    }
  `}
`;

// --- Enhanced Loading & Empty States ---
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-direction: column;
  gap: 1rem;
`;

const EmptyState = styled(GlowCard)`
  text-align: center;
  padding: 4rem 2rem;
  
  svg {
    font-size: 4rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 1rem;
  }
  
  h3 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.5rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.1rem;
  }
`;

const AnimatedModal = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1000;
  background: rgba(20, 24, 40, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(102,126,234,0.18), 0 4px 16px rgba(0,0,0,0.08);
  padding: 2.5rem 2rem 2rem 2rem;
  min-width: 350px;
  max-width: 95vw;
  width: 500px;
  position: relative;
  overflow: hidden;
`;
const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;
const ModalClose = styled.button`
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.5rem;
  cursor: pointer;
`;
const ModalSection = styled.div`
  margin-bottom: 1.5rem;
`;

// Helper: group tests by department
function groupTestsByDepartment(tests) {
  const grouped = {};
  (tests || []).forEach(test => {
    const dept = typeof test === 'object' && test.department ? test.department : 'General';
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push(test);
  });
  return grouped;
}

// Helper: recommended volume per department (cc)
const DEPT_RECOMMENDED = {
  Chemistry: 3,
  Hematology: 2,
  Microbiology: 2,
  Virology: 2,
  General: 2
};

// Modern, glassy, vertical animated syringe
const SyringeSVG = ({ percent }) => (
  <svg width="60" height="180" viewBox="0 0 60 180">
    {/* Barrel */}
    <rect x="20" y="30" width="20" height="100" rx="10" fill="url(#barrelGradient)" stroke="#b3c6e7" strokeWidth="2" filter="url(#barrelShadow)" />
    {/* Blood fill */}
    <motion.rect
      x="20" y={130 - 100 * percent}
      width="20"
      height={100 * percent}
      rx="10"
      fill="url(#bloodGradient)"
      initial={{ height: 0 }}
      animate={{ height: 100 * percent, y: 130 - 100 * percent }}
      transition={{ duration: 0.6, type: 'spring' }}
    />
    {/* Plunger */}
    <motion.rect
      x="22" y={30 + (1 - percent) * 100 - 8}
      width="16"
      height="16"
      rx="8"
      fill="#e5e7eb"
      stroke="#b3c6e7"
      strokeWidth="2"
      filter="url(#plungerShadow)"
      initial={{ y: 130 - 8 }}
      animate={{ y: 30 + (1 - percent) * 100 - 8 }}
      transition={{ duration: 0.6, type: 'spring' }}
    />
    {/* Needle */}
    <rect x="28" y="10" width="4" height="20" rx="2" fill="#b3c6e7" />
    {/* Drop */}
    {percent > 0.99 && (
      <motion.ellipse
        cx="30" cy="7" rx="4" ry="7"
        fill="#60a5fa"
        initial={{ opacity: 0, cy: 7 }}
        animate={{ opacity: 1, cy: 15 }}
        transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse' }}
      />
    )}
    {/* Gradients and shadows */}
    <defs>
      <linearGradient id="barrelGradient" x1="20" y1="30" x2="40" y2="130" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f8fafc" />
        <stop offset="1" stopColor="#dbeafe" />
      </linearGradient>
      <linearGradient id="bloodGradient" x1="20" y1="130" x2="40" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ef4444" />
        <stop offset="1" stopColor="#fbbf24" />
      </linearGradient>
      <filter id="barrelShadow" x="0" y="0" width="60" height="180">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#a5b4fc" floodOpacity="0.18" />
      </filter>
      <filter id="plungerShadow" x="0" y="0" width="60" height="180">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#64748b" floodOpacity="0.12" />
      </filter>
    </defs>
  </svg>
);

// Modern, glassy, animated test tube
const TubeSVG = ({ percent, color, label }) => (
  <svg width="48" height="120" viewBox="0 0 48 120">
    {/* Tube body */}
    <rect x="12" y="20" width="24" height="80" rx="12" fill="url(#tubeGlass)" stroke="#b3c6e7" strokeWidth="2" filter="url(#tubeShadow)" />
    {/* Blood fill */}
    <motion.rect
      x="12" y={100 - 80 * percent + 20}
      width="24"
      height={80 * percent}
      rx="12"
      fill={color}
      style={{ opacity: 0.85 }}
      initial={{ height: 0 }}
      animate={{ height: 80 * percent, y: 100 - 80 * percent + 20 }}
      transition={{ duration: 0.6, type: 'spring' }}
    />
    {/* Cap */}
    <rect x="12" y="10" width="24" height="16" rx="6" fill={color} filter="url(#capShadow)" />
    {/* Label */}
    <text x="24" y="115" textAnchor="middle" fontSize="12" fill={color} style={{ fontWeight: 700 }}>{label}</text>
    {/* Gradients and shadows */}
    <defs>
      <linearGradient id="tubeGlass" x1="12" y1="20" x2="36" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f1f5f9" />
        <stop offset="1" stopColor="#dbeafe" />
      </linearGradient>
      <filter id="tubeShadow" x="0" y="0" width="48" height="120">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#a5b4fc" floodOpacity="0.18" />
      </filter>
      <filter id="capShadow" x="0" y="0" width="48" height="120">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={color} floodOpacity="0.18" />
      </filter>
    </defs>
  </svg>
);

// --- Inventory-style Patient Card Components ---
const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2.5rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
`;

const PatientCard = styled(motion.div)`
  cursor: pointer;
  margin-bottom: 36px;
  border-radius: 2.2rem;
  background: none;
  box-shadow: none;
  position: relative;
`;

const PatientCardContent = styled(GlowCard)`
  padding: 2.2rem 1.7rem 1.7rem 1.7rem;
  height: 100%;
  border-radius: 2.2rem;
  background: ${({ theme }) => theme.isDarkMode ? 'rgba(24,28,35,0.82)' : 'rgba(240,244,250,0.82)'};
  backdrop-filter: blur(18px) saturate(1.2);
  box-shadow: 0 8px 32px #667eea22, 0 2px 8px #0001;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.3s, background 0.3s, transform 0.25s cubic-bezier(0.4,0,0.2,1);
  box-shadow:
    ${({ $priority, theme }) => {
      if ($priority === 'urgent') return `0 0 24px 4px ${theme.colors.error}33, 0 8px 32px #0002`;
      if ($priority === 'high') return `0 0 18px 3px ${theme.colors.warning}33, 0 8px 32px #0002`;
      if ($priority === 'normal') return `0 0 12px 2px ${theme.colors.primary}22, 0 8px 32px #0002`;
      return '0 8px 32px #0002';
    }};
  &:hover {
    transform: scale(1.025);
    box-shadow:
      ${({ $priority, theme }) => {
        if ($priority === 'urgent') return `0 0 32px 8px ${theme.colors.error}44, 0 12px 40px #0003`;
        if ($priority === 'high') return `0 0 24px 6px ${theme.colors.warning}44, 0 12px 40px #0003`;
        if ($priority === 'normal') return `0 0 16px 4px ${theme.colors.primary}33, 0 12px 40px #0003`;
        return '0 12px 40px #0003';
      }};
  }
`;

const PatientCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.2rem;
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.1rem;
`;

const PatientDetails = styled.div``;

const PatientMeta = styled.p`
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
`;

const PatientTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin: 0.7rem 0 1.2rem 0;
`;

const PatientTag = styled.span`
  display: inline-flex;
  align-items: center;
  background: ${({ color }) => `linear-gradient(90deg,${color}22 0%,#fff0 100%)`};
  color: ${({ color }) => color};
  font-size: 1.01rem;
  font-weight: 800;
  border-radius: 999px;
  padding: 0.28rem 1.25rem;
  border: 2px solid ${({ color }) => color + '55'};
  box-shadow: 0 2px 8px ${({ color }) => color + '18'};
  user-select: none;
  letter-spacing: 0.01em;
  transition: box-shadow 0.3s, border 0.3s;
  font-weight: 800;
  background: ${({ $priority, theme }) => {
    switch ($priority) {
      case 'urgent': return `linear-gradient(90deg,${theme.colors.error}33 0%,#fff0 100%)`;
      case 'high': return `linear-gradient(90deg,${theme.colors.warning}33 0%,#fff0 100%)`;
      case 'normal': return `linear-gradient(90deg,${theme.colors.primary}33 0%,#fff0 100%)`;
      default: return `linear-gradient(90deg,${theme.colors.info}33 0%,#fff0 100%)`;
    }
  }};
  color: ${({ $priority, theme }) => {
    switch ($priority) {
      case 'urgent': return theme.colors.error;
      case 'high': return theme.colors.warning;
      case 'normal': return theme.colors.primary;
      default: return theme.colors.info;
    }
  }};
  border: 2px solid ${({ $priority, theme }) => {
    switch ($priority) {
      case 'urgent': return theme.colors.error + '55';
      case 'high': return theme.colors.warning + '55';
      case 'normal': return theme.colors.primary + '55';
      default: return theme.colors.info + '55';
    }
  }};
  box-shadow: 0 1.5px 8px ${({ $priority, theme }) => {
    switch ($priority) {
      case 'urgent': return theme.colors.error + '22';
      case 'high': return theme.colors.warning + '22';
      case 'normal': return theme.colors.primary + '22';
      default: return theme.colors.info + '22';
    }
  }};
`;

function getElapsedTime(startTime) {
  if (!startTime) return '';
  const now = new Date();
  const start = startTime.toDate ? startTime.toDate() : new Date(startTime);
  const diff = Math.floor((now - start) / 1000); // seconds
  const min = Math.floor(diff / 60);
  const sec = diff % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// Add CardCheckboxWrapper styled component:
const CardCheckboxWrapper = styled.label`
  position: absolute;
  top: 18px;
  right: 22px;
  z-index: 10;
  display: flex;
  align-items: center;
  cursor: pointer;
  input[type='checkbox'] {
    appearance: none;
    width: 22px;
    height: 22px;
    border: 2.5px solid ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
    background: ${({ theme }) => theme.isDarkMode ? '#23272F' : '#f1f5f9'};
    box-shadow: 0 2px 8px #0001;
    transition: border-color 0.2s, background 0.2s;
    outline: none;
    margin: 0;
    position: relative;
  }
  input[type='checkbox']:checked {
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
  input[type='checkbox']:checked::after {
    content: '';
    display: block;
    position: absolute;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 12px;
    border: solid #fff;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }
  input[type='checkbox']:hover {
    border-color: ${({ theme }) => theme.colors.info};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.info}22;
  }
`;

// Add a new styled component for the glowing dot:
const PriorityDot = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-left: 8px;
  box-shadow:
    0 0 0 2px ${({ $priority, theme }) => {
      if ($priority === 'urgent') return theme.colors.error + '88';
      if ($priority === 'high') return theme.colors.warning + '88';
      if ($priority === 'normal') return theme.colors.primary + '66';
      return theme.colors.info + '44';
    }},
    0 0 8px 2px ${({ $priority, theme }) => {
      if ($priority === 'urgent') return theme.colors.error + '44';
      if ($priority === 'high') return theme.colors.warning + '44';
      if ($priority === 'normal') return theme.colors.primary + '33';
      return theme.colors.info + '22';
    }};
  background:
    ${({ $priority, theme }) => {
      if ($priority === 'urgent') return theme.colors.error;
      if ($priority === 'high') return theme.colors.warning;
      if ($priority === 'normal') return theme.colors.primary;
      return theme.colors.info;
    }};
  transition: box-shadow 0.3s, background 0.3s;
`;

const Phlebotomist = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    readyForCollection: 0,
    samplesCollected: 0,
    urgentPatients: 0,
    averageCollectionTime: 0
  });

  const [modalPatient, setModalPatient] = useState(null);
  const [tubeVolumes, setTubeVolumes] = useState({});
  const [collecting, setCollecting] = useState(false);
  const [timerTick, setTimerTick] = useState(0);
  const [selectedPatientIds, setSelectedPatientIds] = useState([]);
  const [expandedPatientIds, setExpandedPatientIds] = useState([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [highlightedPatientId, setHighlightedPatientId] = useState(null);
  const modalRef = useRef(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const patientsQuery = query(
          collection(db, 'patients'), 
          orderBy('createdAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(patientsQuery, (querySnapshot) => {
          const patientsData = [];
          querySnapshot.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            // Add phlebotomy-specific data
            data.bloodCollectionStatus = data.bloodCollectionStatus || 'ready_for_collection';
            data.priority = data.priority || 'normal';
            data.collectionTime = data.collectionTime || null;
            data.phlebotomistNotes = data.phlebotomistNotes || '';
            data.sampleConditions = data.sampleConditions || [];
            data.collectionMethod = data.collectionMethod || 'standard';
            data.patientName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
            patientsData.push(data);
          });
          
          setPatients(patientsData);
          
          // Calculate stats
          const readyForCollection = patientsData.filter(p => p.bloodCollectionStatus === 'ready_for_collection');
          const samplesCollected = patientsData.filter(p => p.bloodCollectionStatus === 'sample_collected');
          const urgent = patientsData.filter(p => p.priority === 'urgent');
          
          const collectionTimes = samplesCollected
            .filter(p => p.collectionTime)
            .map(p => {
              const created = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
              const collected = p.collectionTime?.toDate ? p.collectionTime.toDate() : new Date(p.collectionTime);
              return (collected - created) / (1000 * 60); // minutes
            });
          
          const avgTime = collectionTimes.length > 0 
            ? collectionTimes.reduce((a, b) => a + b, 0) / collectionTimes.length 
            : 0;
          
          setStats({
            totalPatients: patientsData.length,
            readyForCollection: readyForCollection.length,
            samplesCollected: samplesCollected.length,
            urgentPatients: urgent.length,
            averageCollectionTime: Math.round(avgTime)
          });
          
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching patients:', error);
        showFlashMessage({ type: 'error', title: t('phlebotomyView.error', { defaultValue: 'Error' }), message: t('phlebotomyView.failedToLoadPatientData') });
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    let filtered = patients;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.bloodCollectionStatus === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(patient => patient.priority === priorityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'patientName':
          aValue = a.patientName || '';
          bValue = b.patientName || '';
          break;
        case 'priority': {
          const priorityOrder = { urgent: 3, high: 2, normal: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        }
        case 'createdAt':
        default:
          aValue = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          bValue = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPatients(filtered);
  }, [patients, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  useEffect(() => {
    // On mount, check for in-process patient
    const inProcessId = localStorage.getItem('inProcessPatientId');
    if (inProcessId && patients.length > 0) {
      const found = patients.find(
        p => p.id === inProcessId && p.bloodCollectionStatus === 'in_progress' && p.assignedTo === 'Current Phlebotomist'
      );
      if (found) {
        setModalPatient(found);
      } else {
        localStorage.removeItem('inProcessPatientId');
      }
    }
    // Only run when patients list changes
  }, [patients]);

  useEffect(() => {
    const interval = setInterval(() => setTimerTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (modalPatient && modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (modalRef.current.focus) modalRef.current.focus();
    }
  }, [modalPatient]);

  const handleCollectSample = async (patient) => {
    try {
      const patientRef = doc(db, 'patients', patient.id);
      await updateDoc(patientRef, {
        bloodCollectionStatus: 'sample_collected',
        collectionTime: new Date(),
        collectedBy: 'Current Phlebotomist', // Replace with actual user
        phlebotomistNotes: patient.phlebotomistNotes || ''
      });
      
      // Create a test order for the collected sample
      const testOrderData = {
        patientId: patient.patientId,
        patientName: patient.patientName,
        patientAge: patient.age,
        patientGender: patient.gender,
        referringDoctor: patient.referringDoctor || 'N/A',
        orderDate: new Date(),
        status: 'Sample Collected',
        priority: patient.priority || 'Normal',
        tests: patient.selectedTests || [],
        totalPrice: 0, // Calculate based on tests
        notes: patient.phlebotomistNotes || '',
        createdBy: 'Phlebotomist',
        createdAt: new Date(),
        collectionTime: new Date(),
        collectedBy: 'Current Phlebotomist'
      };
      
      await addDoc(collection(db, 'testOrders'), testOrderData);
      
      showFlashMessage({ type: 'success', title: t('phlebotomyView.success', { defaultValue: 'Success' }), message: t('phlebotomyView.sampleCollectedSuccess', { patientName: patient.patientName }) });
    } catch (error) {
      console.error('Error collecting sample:', error);
      showFlashMessage({ type: 'error', title: t('phlebotomyView.error', { defaultValue: 'Error' }), message: t('phlebotomyView.failedToCollectSample') });
    }
  };

  const handleMarkReady = async (patient) => {
    try {
      const patientRef = doc(db, 'patients', patient.id);
      await updateDoc(patientRef, {
        bloodCollectionStatus: 'ready_for_collection',
        updatedAt: new Date()
      });
      
      showFlashMessage({ type: 'success', title: t('phlebotomyView.success', { defaultValue: 'Success' }), message: t('phlebotomyView.patientMarkedReady', { patientName: patient.patientName }) });
    } catch (error) {
      console.error('Error marking patient ready:', error);
      showFlashMessage({ type: 'error', title: t('phlebotomyView.error', { defaultValue: 'Error' }), message: t('phlebotomyView.failedToUpdatePatient') });
    }
  };

  const handleViewDetails = (patient) => {
    navigate(`/app/patient/${patient.id}`, { state: { patient } });
  };

  const handleAcceptPatient = async (patient) => {
    try {
      const patientRef = doc(db, 'patients', patient.id);
      await updateDoc(patientRef, {
        bloodCollectionStatus: 'in_progress',
        assignedTo: 'Current Phlebotomist', // Assign to current phlebotomist
        updatedAt: new Date()
      });
      localStorage.setItem('inProcessPatientId', patient.id);
      setModalPatient(patient); // Open modal for this patient
      showFlashMessage({ type: 'success', title: t('phlebotomyView.success', { defaultValue: 'Success' }), message: t('phlebotomyView.patientAccepted', { patientName: patient.patientName }) });
    } catch (error) {
      console.error('Error accepting patient:', error);
      showFlashMessage({ type: 'error', title: t('phlebotomyView.error', { defaultValue: 'Error' }), message: t('phlebotomyView.failedToAcceptPatient') });
    }
  };

  const closeModal = () => {
    setModalPatient(null);
    localStorage.removeItem('inProcessPatientId');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready_for_collection': return '#F59E0B';
      case 'sample_collected': return '#10B981';
      case 'in_progress': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready_for_collection': return 'Ready for Collection';
      case 'sample_collected': return 'Sample Collected';
      case 'in_progress': return 'In Progress';
      default: return 'Unknown';
    }
  };

  const handleTubeVolumeChange = (dept, value) => {
    setTubeVolumes(prev => ({ ...prev, [dept]: value }));
  };

  let grouped = {};
  let departments = [];
  let totalRecommended = 0;
  let totalCollected = 0;
  let allFilled = false;

  if (modalPatient && Array.isArray(modalPatient.selectedTests)) {
    grouped = groupTestsByDepartment(modalPatient.selectedTests);
    departments = Object.keys(grouped);
    totalRecommended = departments.reduce((sum, dept) => sum + (DEPT_RECOMMENDED[dept] || 2), 0);
    totalCollected = departments.reduce((sum, dept) => sum + (Number(tubeVolumes[dept]) || 0), 0);
    allFilled = departments.every(dept => tubeVolumes[dept] && Number(tubeVolumes[dept]) > 0);
  }

  const handleMarkAsCollected = async () => {
    if (!modalPatient) return;
    setCollecting(true);
    try {
      const patientRef = doc(db, 'patients', modalPatient.id);
      await updateDoc(patientRef, {
        bloodCollectionStatus: 'sample_collected',
        assignedTo: null,
        collectionTime: new Date(),
        collectedBy: 'Current Phlebotomist', // Replace with actual user
        tubeVolumes,
        updatedAt: new Date(),
        phlebotomistNotes: note // Save the note
      });
      // Also add note to test order if needed (optional, see handleCollectSample)
      showFlashMessage({ type: 'success', title: t('phlebotomyView.success', { defaultValue: 'Success' }), message: t('phlebotomyView.sampleCollectedSuccess', { patientName: modalPatient.patientName }) });
      setModalPatient(null);
      setTubeVolumes({});
      setNote('');
      localStorage.removeItem('inProcessPatientId');
    } catch (error) {
      console.error('Error marking as collected:', error);
      showFlashMessage({ type: 'error', title: t('phlebotomyView.error', { defaultValue: 'Error' }), message: t('phlebotomyView.failedToCollectSample') });
    } finally {
      setCollecting(false);
    }
  };

  const handleMarkUrgent = async (patient) => {
    try {
      const patientRef = doc(db, 'patients', patient.id);
      await updateDoc(patientRef, {
        priority: 'urgent',
        updatedAt: new Date(),
      });
      showFlashMessage({ type: 'success', title: t('phlebotomyView.success', { defaultValue: 'Success' }), message: t('phlebotomyView.markedUrgent', { patientName: patient.patientName }) });
    } catch (error) {
      console.error('Error marking urgent:', error);
      showFlashMessage({ type: 'error', title: t('phlebotomyView.error', { defaultValue: 'Error' }), message: t('phlebotomyView.failedToMarkUrgent') });
    }
  };

  const handleReassign = async (patient) => {
    try {
      const patientRef = doc(db, 'patients', patient.id);
      await updateDoc(patientRef, {
        assignedTo: null,
        bloodCollectionStatus: 'ready_for_collection',
        updatedAt: new Date(),
      });
      showFlashMessage({ type: 'success', title: t('phlebotomyView.success', { defaultValue: 'Success' }), message: t('phlebotomyView.reassigned', { patientName: patient.patientName }) });
    } catch (error) {
      console.error('Error reassigning:', error);
      showFlashMessage({ type: 'error', title: t('phlebotomyView.error', { defaultValue: 'Error' }), message: t('phlebotomyView.failedToReassign') });
    }
  };

  // Handler to toggle selection
  const handleSelectPatient = (id) => {
    setSelectedPatientIds((prev) =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  // Handler to select all
  const handleSelectAll = () => {
    if (selectedPatientIds.length === waitingPatients.length) {
      setSelectedPatientIds([]);
    } else {
      setSelectedPatientIds(waitingPatients.map(p => p.id));
    }
  };

  // Bulk action handlers
  const handleBulkMarkCollected = async () => {
    for (const id of selectedPatientIds) {
      const patient = waitingPatients.find(p => p.id === id);
      if (patient) await handleCollectSample(patient);
    }
    setSelectedPatientIds([]);
  };

  const handleBulkMarkReady = async () => {
    for (const id of selectedPatientIds) {
      const patient = waitingPatients.find(p => p.id === id);
      if (patient) await handleMarkReady(patient);
    }
    setSelectedPatientIds([]);
  };

  // Handler to toggle expansion
  const handleToggleExpand = (id) => {
    setExpandedPatientIds((prev) =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  // Handler for barcode scan
  const handleBarcodeScan = (code) => {
    // Try to find patient by patientId or barcode
    const found = patients.find(
      p => p.patientId === code || (p.barcode && p.barcode === code)
    );
    if (found) {
      setScannerOpen(false);
      setHighlightedPatientId(found.id);
      // Optionally scroll to patient card
      setTimeout(() => {
        const el = document.getElementById(`patient-card-${found.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    } else {
      showFlashMessage({ type: 'error', title: t('phlebotomyView.error', { defaultValue: 'Error' }), message: t('phlebotomyView.patientNotFound') });
    }
  };

  if (loading) {
    return (
      <PhlebotomistContainer>
        <LoadingContainer>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaSpinner size={48} />
          </motion.div>
          <p>{t('phlebotomyView.loadingPatientData')}</p>
        </LoadingContainer>
      </PhlebotomistContainer>
    );
  }

  // Split patients
  const waitingPatients = filteredPatients.filter(
    p => (!p.assignedTo && p.bloodCollectionStatus === 'ready_for_collection') || p.bloodCollectionStatus === 'in_progress'
  );
  const collectedPatients = filteredPatients.filter(
    p => p.bloodCollectionStatus === 'sample_collected'
  );

  return (
    <PhlebotomistContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <HeaderTitle>
          <FaSyringe /> {t('phlebotomyView.title')}
        </HeaderTitle>
        <HeaderActions>
                                  <GlowButton onClick={() => navigate('/app/workqueue')}>
              <FaEye /> View Work Queue
            </GlowButton>
        </HeaderActions>
      </Header>

      {/* Enhanced Stats */}
      <StatsContainer>
        <StatCard>
          <StatIcon color="#3B82F6">
            <FaUser />
          </StatIcon>
          <StatValue>{stats.totalPatients}</StatValue>
          <StatLabel>{t('phlebotomyView.totalPatients')}</StatLabel>
          <StatChange $positive={true}>
            {stats.readyForCollection} {t('phlebotomyView.readyForCollection', { defaultValue: 'Ready for Collection' }).toLowerCase()}
          </StatChange>
        </StatCard>

        <StatCard>
          <StatIcon color="#10B981">
            <FaCheckCircle />
          </StatIcon>
          <StatValue>{stats.samplesCollected}</StatValue>
          <StatLabel>{t('phlebotomyView.samplesCollected')}</StatLabel>
          <StatChange $positive={true}>
            {stats.averageCollectionTime} min avg time
          </StatChange>
        </StatCard>

        <StatCard>
          <StatIcon color="#F59E0B">
            <FaClock />
          </StatIcon>
          <StatValue>{stats.readyForCollection}</StatValue>
          <StatLabel>{t('phlebotomyView.readyForCollection', { defaultValue: 'Ready for Collection' })}</StatLabel>
          <StatChange $positive={false}>
            {stats.urgentPatients} {t('phlebotomyView.urgentPatients', { defaultValue: 'Urgent Patients' }).toLowerCase()}
          </StatChange>
        </StatCard>

        <StatCard>
          <StatIcon color="#EF4444">
            <FaExclamationTriangle />
          </StatIcon>
          <StatValue>{stats.urgentPatients}</StatValue>
          <StatLabel>{t('phlebotomyView.urgentPatients', { defaultValue: 'Urgent Patients' })}</StatLabel>
          <StatChange $positive={false}>
            Requires immediate attention
          </StatChange>
        </StatCard>
      </StatsContainer>

      {/* Enhanced Search & Filters */}
      <SearchAndFilterContainer>
        <FilterGrid>
          <SearchInput>
            <FaSearch />
            <input
              type="text"
              placeholder={t('phlebotomyView.searchPlaceholder', { defaultValue: 'Search patients...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>

          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('phlebotomyView.allStatus', { defaultValue: 'All Statuses' })}</option>
            <option value="ready_for_collection">{t('phlebotomyView.readyForCollection', { defaultValue: 'Ready for Collection' })}</option>
            <option value="sample_collected">{t('phlebotomyView.sampleCollected', { defaultValue: 'Sample Collected' })}</option>
            <option value="in_progress">{t('phlebotomyView.inProgress', { defaultValue: 'In Progress' })}</option>
          </FilterSelect>

          <FilterSelect
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">{t('phlebotomyView.allPriorities', { defaultValue: 'All Priorities' })}</option>
            <option value="urgent">{t('phlebotomyView.urgent', { defaultValue: 'Urgent' })}</option>
            <option value="high">{t('phlebotomyView.high', { defaultValue: 'High' })}</option>
            <option value="normal">{t('phlebotomyView.normal', { defaultValue: 'Normal' })}</option>
          </FilterSelect>
        </FilterGrid>

        <FilterActions>
          <SortContainer>
            <span>{t('phlebotomyView.sortBy', { defaultValue: 'Sort By' })}</span>
            <SortButton
              $active={sortBy === 'createdAt'}
              onClick={() => handleSort('createdAt')}
            >
              {t('phlebotomyView.created', { defaultValue: 'Created' })} {getSortIcon('createdAt')}
            </SortButton>
            <SortButton
              $active={sortBy === 'patientName'}
              onClick={() => handleSort('patientName')}
            >
              {t('phlebotomyView.patient', { defaultValue: 'Patient' })} {getSortIcon('patientName')}
            </SortButton>
            <SortButton
              $active={sortBy === 'priority'}
              onClick={() => handleSort('priority')}
            >
              {t('phlebotomyView.priority', { defaultValue: 'Priority' })} {getSortIcon('priority')}
            </SortButton>
          </SortContainer>

          <ClearFiltersButton onClick={clearFilters}>
            <FaTimes /> {t('phlebotomyView.clearFilters', { defaultValue: 'Clear Filters' })}
          </ClearFiltersButton>
        </FilterActions>
      </SearchAndFilterContainer>

      {/* Patient Collection List */}
      <GlowCard style={{ minHeight: 180, marginBottom: 32, background: theme.isDarkMode ? '#181C23' : '#f8fafc', boxShadow: theme.isDarkMode ? '0 8px 32px #1118' : '0 8px 32px #e0e7ef33', border: 'none', backdropFilter: 'blur(18px)' }}>
        <div style={{ padding: '2rem 1.5rem 1.5rem 1.5rem' }}>
          {/* Persistent summary bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: theme.isDarkMode ? '#23272F' : '#e5e9f2',
            borderRadius: 16,
            padding: '1rem 1.5rem',
            marginBottom: 24,
            boxShadow: '0 2px 8px #0001',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: theme.colors.text,
            gap: 16
          }}>
            <span>{t('phlebotomyView.waitingForCollection', { defaultValue: 'Waiting for Collection' })}: <b style={{color: theme.colors.primary}}>{waitingPatients.length}</b></span>
            <span>{t('phlebotomyView.urgentPatients', { defaultValue: 'Urgent Patients' })}: <b style={{color: theme.colors.error}}>{waitingPatients.filter(p => p.priority === 'urgent').length}</b></span>
            <span>{t('phlebotomyView.avgWaitTime', { defaultValue: 'Average Wait Time' })}: <b style={{color: theme.colors.info}}>{stats.averageCollectionTime} {t('phlebotomyView.min', { defaultValue: 'min' })}</b></span>
          </div>
          {waitingPatients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: theme.colors.textSecondary, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
                <FaSyringe size={64} style={{ marginBottom: '1.5rem', opacity: 0.4, filter: 'drop-shadow(0 2px 16px #667eea33)' }} />
              </motion.div>
              <h4 style={{ color: theme.colors.textSecondary, fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>{t('phlebotomyView.noPatientsFound', { defaultValue: 'No Patients Found' })}</h4>
              <p style={{ color: theme.colors.textSecondary, fontSize: '1rem', opacity: 0.8 }}>{t('phlebotomyView.waitingEmptyHint', { defaultValue: 'No patients are currently waiting for collection. New requests will appear here in real time.' })}</p>
            </div>
          ) : (
            <React.Fragment>
              {waitingPatients.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, background: theme.colors.surface, borderRadius: 12, padding: '1rem 1.5rem', boxShadow: '0 2px 8px #0001', border: `1.5px solid ${theme.colors.border}` }}>
                  <input
                    type="checkbox"
                    checked={selectedPatientIds.length === waitingPatients.length && waitingPatients.length > 0}
                    onChange={handleSelectAll}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontWeight: 600 }}>{t('phlebotomyView.selectAll', { defaultValue: 'Select All' })}</span>
                  <GlowButton
                    $variant="success"
                    disabled={selectedPatientIds.length === 0}
                    onClick={handleBulkMarkCollected}
                  >
                    <FaCheckCircle style={{ marginRight: 8 }} />{t('phlebotomyView.bulkMarkCollected', { defaultValue: 'Bulk Mark Collected' })}
                  </GlowButton>
                  <GlowButton
                    $variant="secondary"
                    disabled={selectedPatientIds.length === 0}
                    onClick={handleBulkMarkReady}
                  >
                    <FaClock style={{ marginRight: 8 }} />{t('phlebotomyView.bulkMarkReady', { defaultValue: 'Bulk Mark Ready' })}
                  </GlowButton>
                  <span style={{ color: '#888', fontSize: '0.95rem' }}>{selectedPatientIds.length} {t('phlebotomyView.selected', { defaultValue: 'selected' })}</span>
                </div>
              )}
              <GlowButton
                $variant="primary"
                style={{ marginBottom: 24, fontWeight: 700, fontSize: '1.05rem', borderRadius: 12 }}
                onClick={() => setScannerOpen(true)}
              >
                <FaBarcode style={{ marginRight: 8 }} />{t('phlebotomyView.scanBarcode', { defaultValue: 'Scan Barcode' })}
              </GlowButton>
              <PatientGrid>
                {waitingPatients.map((patient) => {
                  let color = theme.colors.primary;
                  if (patient.priority === 'urgent') color = theme.colors.error;
                  else if (patient.priority === 'high') color = theme.colors.warning;
                  else if (patient.priority === 'normal') color = theme.colors.primary;
                  return (
                    <PatientCard
                      key={patient.id}
                      id={`patient-card-${patient.id}`}
                      style={{ marginBottom: 28, ...(highlightedPatientId === patient.id ? { boxShadow: `0 0 0 4px ${theme.colors.primary}` } : {}) }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CardCheckboxWrapper>
                        <input
                          type="checkbox"
                          checked={selectedPatientIds.includes(patient.id)}
                          onChange={() => handleSelectPatient(patient.id)}
                          aria-label={t('phlebotomyView.selectPatient', { defaultValue: 'Select patient' })}
                        />
                      </CardCheckboxWrapper>
                      <PatientCardContent $priority={patient.priority}>
                        <PatientCardHeader>
                          <PatientInfo>
                            <PatientDetails>
                              <PatientName>{patient.patientName}
                                <PriorityDot
                                  $priority={patient.priority}
                                  title={t(`phlebotomyView.${patient.priority}`, { defaultValue: patient.priority })}
                                />
                              </PatientName>
                              <PatientMeta>
                                <FaIdCard size={13} style={{marginRight: 4}} />{patient.patientId} &nbsp;|
                                <FaCalendar size={13} style={{margin: '0 4px 0 8px'}} />{typeof patient.age === 'object' && patient.age !== null ? `${patient.age.value} ${patient.age.unit}` : patient.age} &nbsp;|
                                <FaUser size={13} style={{margin: '0 4px 0 8px'}} />{patient.gender}
                              </PatientMeta>
                              {patient.bloodCollectionStatus === 'in_progress' && (
                                <span style={{ color: theme.colors.info, fontWeight: 700, marginLeft: 8 }}>
                                  ⏱ {getElapsedTime(patient.updatedAt || patient.collectionStartTime || patient.createdAt)}
                                </span>
                              )}
                            </PatientDetails>
                          </PatientInfo>
                        </PatientCardHeader>
                        <PatientTags>
                          {(Array.isArray(patient.selectedTests) ? patient.selectedTests : []).map((test, idx) => (
                            <PatientTag key={idx} color={color}><FaTag size={12} style={{marginRight: 6}} />{typeof test === 'string' ? test : test.name || test.id}</PatientTag>
                          ))}
                        </PatientTags>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                          <GlowButton
                            $variant="secondary"
                            style={{ fontSize: '0.98rem', fontWeight: 600, padding: '0.5rem 0.9rem', borderRadius: 10, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                            onClick={() => handleToggleExpand(patient.id)}
                          >
                            <FaNotesMedical style={{ marginRight: 4 }} />{t('phlebotomyView.notes', { defaultValue: 'Notes' })}
                          </GlowButton>
                          <GlowButton
                            $variant="success"
                            style={{ fontSize: '0.98rem', fontWeight: 700, padding: '0.5rem 0.9rem', borderRadius: 10, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                            title={t('phlebotomyView.startCollection', { defaultValue: 'Collect' })}
                            onClick={() => handleAcceptPatient(patient)}
                          >
                            <FaSyringe style={{ marginRight: 4 }} />{t('phlebotomyView.collect', { defaultValue: 'Collect' })}
                          </GlowButton>
                          <GlowButton
                            $variant="secondary"
                            style={{ fontSize: '0.98rem', fontWeight: 700, padding: '0.5rem 0.9rem', borderRadius: 10, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                            title={t('phlebotomyView.viewDetails', { defaultValue: 'Details' })}
                            onClick={() => handleViewDetails(patient)}
                          >
                            <FaEye style={{ marginRight: 4 }} />{t('phlebotomyView.details', { defaultValue: 'Details' })}
                          </GlowButton>
                          {patient.priority !== 'urgent' && (
                            <GlowButton
                              $variant="warning"
                              style={{ fontSize: '0.98rem', fontWeight: 700, padding: '0.5rem 0.9rem', borderRadius: 10, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                              title={t('phlebotomyView.markUrgent', { defaultValue: 'Urgent' })}
                              onClick={() => handleMarkUrgent(patient)}
                            >
                              <FaExclamationTriangle style={{ marginRight: 4 }} />{t('phlebotomyView.urgent', { defaultValue: 'Urgent' })}
                            </GlowButton>
                          )}
                          {patient.assignedTo && (
                            <GlowButton
                              $variant="secondary"
                              style={{ fontSize: '0.98rem', fontWeight: 700, padding: '0.5rem 0.9rem', borderRadius: 10, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                              title={t('phlebotomyView.reassign', { defaultValue: 'Reassign' })}
                              onClick={() => handleReassign(patient)}
                            >
                              <FaUserPlus style={{ marginRight: 4 }} />
                            </GlowButton>
                          )}
                        </div>
                        {expandedPatientIds.includes(patient.id) && (
                          <div style={{ background: theme.colors.surface, borderRadius: 10, marginTop: 10, padding: '1rem', boxShadow: '0 2px 8px #0001', color: theme.colors.textSecondary }}>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t('phlebotomyView.notesHistory', { defaultValue: 'Notes History' })}</div>
                            <div style={{ marginBottom: 4 }}><b>{t('phlebotomyView.phlebotomistNotes', { defaultValue: 'Phlebotomist Notes' })}:</b> {patient.phlebotomistNotes || t('phlebotomyView.noNotes', { defaultValue: 'No notes' })}</div>
                            <div><b>{t('phlebotomyView.sampleConditions', { defaultValue: 'Sample Conditions' })}:</b> {Array.isArray(patient.sampleConditions) && patient.sampleConditions.length > 0 ? patient.sampleConditions.join(', ') : t('phlebotomyView.noSampleConditions', { defaultValue: 'No sample conditions' })}</div>
                          </div>
                        )}
                      </PatientCardContent>
                    </PatientCard>
                  );
                })}
              </PatientGrid>
            </React.Fragment>
          )}
        </div>
      </GlowCard>

      {/* Collected Patients List */}
      <GlowCard style={{ minHeight: 180, background: theme.isDarkMode ? '#181C23' : '#f8fafc', boxShadow: theme.isDarkMode ? '0 8px 32px #1118' : '0 8px 32px #e0e7ef33', border: 'none', backdropFilter: 'blur(18px)' }}>
        <div style={{ padding: '2rem 1.5rem 1.5rem 1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
            fontWeight: 700,
            fontSize: '1.2rem',
            color: theme.colors.success
          }}>
            <FaCheckCircle style={{ color: theme.colors.success, fontSize: 28, marginRight: 8 }} />
            {t('phlebotomyView.collectedSamples', { defaultValue: 'Collected Samples' })}
            <span style={{ color: theme.colors.text, fontWeight: 600, fontSize: '1.1rem', marginLeft: 8 }}>
              {collectedPatients.length}
            </span>
          </div>
          {collectedPatients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: theme.colors.textSecondary, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <FaCheckCircle size={64} style={{ marginBottom: '1.5rem', opacity: 0.4, color: theme.colors.success, filter: 'drop-shadow(0 2px 16px #10b98133)' }} />
              <h4 style={{ color: theme.colors.textSecondary, fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>{t('phlebotomyView.noCollectedPatients', { defaultValue: 'No Collected Patients' })}</h4>
              <p style={{ color: theme.colors.textSecondary, fontSize: '1rem', opacity: 0.8 }}>{t('phlebotomyView.collectedEmptyHint', { defaultValue: 'No samples have been collected yet. Collected samples will appear here.' })}</p>
            </div>
          ) : (
            <PatientGrid>
              {collectedPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  style={{ marginBottom: 28 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PatientCardContent $priority="collected" style={{ boxShadow: `0 0 16px 2px ${theme.colors.success}44, 0 8px 32px #0002` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <FaCheckCircle style={{ color: theme.colors.success, fontSize: 22 }} title={t('phlebotomyView.sampleCollected', { defaultValue: 'Sample Collected' })} />
                      <PatientName style={{ color: theme.colors.success }}>{patient.patientName}</PatientName>
                    </div>
                    <PatientMeta>
                      <FaIdCard size={13} style={{marginRight: 4}} />{patient.patientId} &nbsp;|
                      <FaCalendar size={13} style={{margin: '0 4px 0 8px'}} />{typeof patient.age === 'object' && patient.age !== null ? `${patient.age.value} ${patient.age.unit}` : patient.age} &nbsp;|
                      <FaUser size={13} style={{margin: '0 4px 0 8px'}} />{patient.gender}
                    </PatientMeta>
                    <div style={{ color: theme.colors.textSecondary, fontSize: '0.98rem', margin: '8px 0 0 0' }}>
                      {t('phlebotomyView.sampleCollected', { defaultValue: 'Sample Collected' })}: {patient.collectionTime ? new Date(patient.collectionTime.seconds ? patient.collectionTime.seconds * 1000 : patient.collectionTime).toLocaleString() : '-'}
                    </div>
                    <PatientTags style={{ marginTop: 12 }}>
                      {(Array.isArray(patient.selectedTests) ? patient.selectedTests : []).map((test, idx) => (
                        <PatientTag key={idx} color={theme.colors.success}><FaTag size={12} />{typeof test === 'string' ? test : test.name || test.id}</PatientTag>
                      ))}
                    </PatientTags>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                      <GlowButton
                        $variant="secondary"
                        style={{ fontSize: '0.98rem', fontWeight: 700, padding: '0.5rem 0.9rem', borderRadius: 10, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => handleViewDetails(patient)}
                      >
                        <FaEye style={{ marginRight: 4 }} />{t('phlebotomyView.details', { defaultValue: 'Details' })}
                      </GlowButton>
                    </div>
                  </PatientCardContent>
                </PatientCard>
              ))}
            </PatientGrid>
          )}
        </div>
      </GlowCard>

      <AnimatePresence>
        {modalPatient && (
          <AnimatedModal
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ModalContent
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              theme={theme}
            >
              <ModalClose theme={theme} onClick={closeModal}>&times;</ModalClose>
              <ModalHeader>
                <FaSyringe size={32} style={{ color: theme.colors.primary }} />
                <div>
                  <h2 style={{ margin: 0, fontWeight: 700 }}>{modalPatient.patientName}</h2>
                  <div style={{ color: theme.colors.textSecondary, fontSize: '1rem' }}>
                    {t('patientIdLabel', { defaultValue: 'Patient ID' })}: {modalPatient.patientId} &nbsp; | &nbsp;
                    {t('ageLabel', { defaultValue: 'Age' })}: {typeof modalPatient.age === 'object' && modalPatient.age !== null ? `${modalPatient.age.value} ${modalPatient.age.unit}` : modalPatient.age} &nbsp; | &nbsp;
                    {t('genderLabel', { defaultValue: 'Gender' })}: {modalPatient.gender}
                  </div>
                </div>
              </ModalHeader>
              <ModalSection>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>{t('testsLabel', { defaultValue: 'Tests' })}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(Array.isArray(modalPatient.selectedTests) ? modalPatient.selectedTests : []).map((test, idx) => (
                    <TestTag key={idx} theme={theme}>{typeof test === 'string' ? test : test.name || test.id}</TestTag>
                  ))}
                </div>
              </ModalSection>
              <ModalSection>
                <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>
                  {t('phlebotomyView.addNote', { defaultValue: 'Add Note (optional)' })}
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                  style={{ width: '100%', borderRadius: 10, border: `1.5px solid ${theme.colors.border}`, padding: 10, fontSize: '1rem', marginBottom: 12, resize: 'vertical', background: theme.colors.input, color: theme.colors.text }}
                  placeholder={t('phlebotomyView.notePlaceholder', { defaultValue: 'Enter any notes about the collection...' })}
                />
              </ModalSection>
              <ModalSection>
                <GlowButton $variant="success" style={{ width: '100%' }} onClick={handleMarkAsCollected}>
                  {collecting ? (
                    <FaSpinner className="fa-spin" style={{ marginRight: 8 }} />
                  ) : null}
                  {t('phlebotomyView.markAsCollected', { defaultValue: 'Mark as Collected' })}
                </GlowButton>
              </ModalSection>
            </ModalContent>
          </AnimatedModal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scannerOpen && (
          <AnimatedModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ModalContent
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              theme={theme}
            >
              <ModalClose theme={theme} onClick={() => setScannerOpen(false)}>&times;</ModalClose>
              <PremiumBarcodeScanner
                onScan={handleBarcodeScan}
                title={t('phlebotomyView.barcodeScannerTitle', { defaultValue: 'Barcode Scanner' })}
                placeholder={t('phlebotomyView.barcodeScannerPlaceholder', { defaultValue: 'Scan a barcode or enter manually' })}
              />
            </ModalContent>
          </AnimatedModal>
        )}
      </AnimatePresence>
    </PhlebotomistContainer>
  );
};

export default Phlebotomist; 