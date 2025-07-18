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
import RegistrationSummaryModal from './RegistrationSummaryModal';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';
import { useRef } from 'react';
import Confetti from 'react-confetti';
import { useTheme } from 'styled-components';
import { useTestCatalog } from '../../contexts/TestContext';
import { useTestSelectionStore } from './TestSelectionPanel';
import { LinearProgress } from '@mui/material';

// Utility functions for field rendering
const shouldRenderField = (fields, section, fieldName) => {
  if (section) {
    return fields[section]?.[fieldName]?.enabled !== false;
  }
  return fields[fieldName]?.enabled !== false;
};

// New utility: shouldRenderSection
const shouldRenderSection = (fields, section) => {
  // If the section itself is disabled, hide it
  if (fields[section]?.enabled === false) return false;
  // If all fields in the section are disabled, hide the section
  const sectionFields = fields[section] || {};
  const enabledFields = Object.keys(sectionFields).filter(
    (key) => key !== 'enabled' && sectionFields[key]?.enabled !== false
  );
  return enabledFields.length > 0;
};

const isFieldRequired = (fields, section, fieldName) => {
  if (section) {
    return fields[section]?.[fieldName]?.required === true;
  }
  return fields[fieldName]?.required === true;
};

const FormContainer = styled(GlowCard)`
  padding: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  background: linear-gradient(120deg, rgba(102,126,234,0.18) 0%, rgba(118,75,162,0.14) 50%, rgba(16,185,129,0.13) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 5px;
    right: 5px;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.10) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.09) 0%, transparent 50%),
      linear-gradient(120deg, rgba(16,185,129,0.08) 0%, rgba(102,126,234,0.07) 100%);
    pointer-events: none;
    z-index: 0;
    animation: hue-rotate 12s linear infinite;
  }

  @keyframes hue-rotate {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
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
  background: #fff;
  color: #23263a;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  z-index: 1;
  
  &:hover {
    border-color: rgba(102, 126, 234, 0.5);
    background: #fff;
    box-shadow: 
      0 8px 32px rgba(102, 126, 234, 0.15),
      0 4px 16px rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }
  
  &:focus {
    border-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.error : '#667eea'};
    box-shadow: ${({ theme, $hasError }) => 
      $hasError ? theme.shadows.glow.error : '0 0 0 3px rgba(102, 126, 234, 0.2)'};
    transform: scale(1.02);
    background: #fff;
    color: #23263a;
  }
  
  &::placeholder {
    color: #6b7280;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 2px solid ${({ theme, $hasError }) => 
    $hasError ? theme.colors.error : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  background: #fff;
  color: #23263a;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;
  backdrop-filter: blur(20px);
  
  &:hover {
    border-color: rgba(102, 126, 234, 0.5);
    background: #fff;
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
    background: #fff;
    color: #23263a;
  }
  
  &::placeholder {
    color: #6b7280;
  }
`;

const SelectContainer = styled.div`
  .react-select__control {
    background: #fff;
    color: #23263a;
    border: 2px solid ${({ $hasError, theme }) => 
      $hasError ? theme.colors.error : 'rgba(255, 255, 255, 0.1)'};
    border-radius: 12px;
    box-shadow: none;
    backdrop-filter: blur(20px);
    z-index: 1;
    
    &:hover {
      border-color: rgba(102, 126, 234, 0.5);
      background: #fff;
      box-shadow: 
        0 8px 32px rgba(102, 126, 234, 0.15),
        0 4px 16px rgba(255, 255, 255, 0.08);
      transform: translateY(-2px);
    }
    
    &.react-select__control--is-focused {
      border-color: ${({ $hasError, theme }) => 
        $hasError ? theme.colors.error : '#667eea'};
      box-shadow: ${({ $hasError, theme }) => 
        $hasError ? theme.shadows.glow.error : '0 0 0 3px rgba(102, 126, 234, 0.2)'};
      transform: scale(1.02);
      background: #fff;
    }
  }
  
  .react-select__menu {
    background: #fff;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
  }
  
  .react-select__option {
    background: transparent;
    color: #23263a;
    
    &:hover {
      background: rgba(102, 126, 234, 0.1);
    }
    
    &.react-select__option--is-selected {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
  }
  
  .react-select__single-value {
    color: #23263a;
  }
  
  .react-select__input-container {
    color: #23263a;
  }
  
  .react-select__placeholder {
    color: #6b7280;
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

// Comprehensive Iraq address data (all governorates, all districts, all major areas per district)
const IRAQ_ADDRESS_DATA = [
  { name: 'بغداد', en: 'Baghdad', districts: [
    { name: 'أبو غريب', en: 'Abu Ghraib', areas: ['أبو غريب', 'الرضوانية', 'اليوسفية', 'الزيدان', 'النصر والسلام', 'الشيحة', 'الكرغولية', 'الزيدان', 'العامرية', 'الرضوانية الجديدة'] },
    { name: 'الحسينية', en: 'Al-Husayniyah', areas: ['الحسينية', 'سبع قصور', 'الراشدية', 'العبيدي', 'الكرامة'] },
    { name: 'المدائن', en: "Al-Mada'in", areas: ['المدائن', 'جسر ديالى', 'الوحدة', 'النهروان', 'الطارمية', 'الجبور'] },
    { name: 'المحمودية', en: 'Mahmudiya', areas: ['المحمودية', 'اللطيفية', 'اليوسفية', 'الرشيد', 'المدائن'] },
    { name: 'التاجي', en: 'Taji', areas: ['التاجي', 'الحصوة', 'الطارمية', 'الراشدية'] },
    { name: 'الطارمية', en: 'Tarmiyah', areas: ['الطارمية', 'المشاهدة', 'الهرية', 'العبايجي'] },
    { name: 'الرصافة', en: 'Rusafa', areas: ['الرصافة', 'الاعظمية', 'الصدر', 'الكرادة', 'الزعفرانية', 'الكرخ', 'المنصور', 'البلديات', 'العبيدي', 'الكرادة الشرقية'] },
    { name: 'الأعظمية', en: 'Adhamiyah', areas: ['الأعظمية', 'الكريعات', 'الصليخ', 'الوزيرية', 'الكسرة', 'الفضل'] },
    { name: 'الصدر', en: 'Sadr City', areas: ['مدينة الصدر', 'حي طارق', 'حي جميلة', 'حي اور', 'حي البنوك', 'حي القاهرة'] },
    { name: 'الكرادة', en: 'Karrada', areas: ['الكرادة', 'الجادرية', 'الزعفرانية', 'البياع', 'الدورة', 'المعامل'] },
    { name: 'الكرخ', en: 'Karkh', areas: ['الكرخ', 'العلاوي', 'المنصور', 'اليرموك', 'الحارثية', 'الجامعة', 'العامرية'] },
    { name: 'المنصور', en: 'Mansour', areas: ['المنصور', 'الحارثية', 'اليرموك', 'الجامعة', 'الغزالية', 'العدل', 'الخضراء'] },
    { name: 'الرشيد', en: 'Rashid', areas: ['الرشيد', 'حي العامل', 'حي الجهاد', 'حي الاعلام', 'حي التراث', 'حي الفرات'] },
    { name: 'الكاظمية', en: 'Kadhimiya', areas: ['الكاظمية', 'سبع أبكار', 'الشالجية', 'العطيفية', 'الحرية', 'الوشاش'] },
    { name: 'بغداد', en: 'Baghdad', areas: ['بغداد', 'باب المعظم', 'باب الشرقي', 'باب الشيخ', 'السنك', 'البتاوين', 'الفضل', 'الكرادة', 'الاعظمية', 'الصدر', 'المنصور', 'الكرخ', 'الرصافة'] },
  ] },
  { name: 'نينوى', en: 'Nineveh', districts: [
    { name: 'الموصل', en: 'Mosul', areas: ['الموصل', 'الزهور', 'اليرموك', 'المنصور', 'الحدباء', 'الانتصار', 'الشرطة', 'الجامعة', 'الربيع', 'التحرير', 'الفيصلية', 'الكرامة', 'الجزائر', 'الرفاعي', 'النهروان', 'القدس', 'السكر', 'البلديات', 'الزهراء', 'الانتصار', 'الرفاعي', 'الجزائر', 'الحدباء', 'اليرموك', 'المنصور', 'الشرطة', 'الجامعة', 'الربيع', 'التحرير', 'الفيصلية', 'الكرامة', 'الجزائر', 'الرفاعي', 'النهروان', 'القدس', 'السكر', 'البلديات', 'الزهراء'] },
    { name: 'تلعفر', en: 'Tal Afar', areas: ['تلعفر', 'العين', 'الربيعية', 'الجزيرة', 'القصبة', 'الكرامة', 'الكرامة الجديدة'] },
    { name: 'الحمدانية', en: 'Hamdaniya', areas: ['بخديدا', 'برطلة', 'كرمليس', 'النمرود', 'القوش', 'تللسقف'] },
    { name: 'سنجار', en: 'Sinjar', areas: ['سنجار', 'القحطانية', 'تل بنات', 'تل قصب', 'الجزيرة', 'الكرامة'] },
    { name: 'الحضر', en: 'Hatra', areas: ['الحضر', 'الجزيرة', 'الكرامة', 'القصبة', 'الكرامة الجديدة'] },
    { name: 'تلكيف', en: 'Tel Kaif', areas: ['تلكيف', 'باطنايا', 'تللسقف', 'القوش', 'بعشيقة', 'بحزاني'] },
    { name: 'بعاج', en: "Ba'aj", areas: ['بعاج', 'الجزيرة', 'الكرامة', 'القصبة', 'الكرامة الجديدة'] },
    { name: 'الشيخان', en: 'Shekhan', areas: ['عين سفني', 'الشيخان', 'باعدرة', 'بابيرة', 'خانسور'] },
    { name: 'الشرقاط', en: 'Shirqat', areas: ['الشرقاط', 'الحورية', 'الجزيرة', 'الكرامة'] },
    { name: 'القيارة', en: 'Qayyarah', areas: ['القيارة', 'الحاج علي', 'الشرقاط', 'الجزيرة', 'الكرامة'] },
    { name: 'الربيعة', en: 'Rabia', areas: ['الربيعة', 'الجزيرة', 'الكرامة', 'القصبة', 'الكرامة الجديدة'] },
    { name: 'المحلبية', en: 'Mahlabiya', areas: ['المحلبية', 'الجزيرة', 'الكرامة', 'القصبة', 'الكرامة الجديدة'] },
    { name: 'تل عبطة', en: 'Tel Abta', areas: ['تل عبطة', 'الجزيرة', 'الكرامة', 'القصبة', 'الكرامة الجديدة'] },
  ] },
  { name: 'البصرة', en: 'Basra', districts: [
    { name: 'البصرة', en: 'Basra', areas: ['البصرة', 'العشار', 'المعقل', 'البراضعية', 'الطويسة', 'الزبير', 'القرنة', 'المدينة', 'الهارثة', 'أبو الخصيب', 'الفاو', 'شط العرب', 'البرجسية', 'الخور', 'البراضعية الجديدة'] },
    { name: 'الزبير', en: 'Zubair', areas: ['الزبير', 'صفوان', 'خور الزبير', 'الشعيبة', 'البرجسية'] },
    { name: 'القرنة', en: 'Qurna', areas: ['القرنة', 'الثغر', 'الشرش', 'الهوير', 'المدينة'] },
    { name: 'المدينة', en: 'Madinah', areas: ['المدينة', 'الهوير', 'الثغر', 'الشرش'] },
    { name: 'أبو الخصيب', en: 'Abu Al-Khaseeb', areas: ['أبو الخصيب', 'السيبة', 'البراضعية', 'الطويسة'] },
    { name: 'الفاو', en: 'Fao', areas: ['الفاو', 'رأس البيشة', 'البرجسية'] },
    { name: 'شط العرب', en: 'Shatt Al-Arab', areas: ['شط العرب', 'البراضعية', 'الطويسة', 'البرجسية'] },
    { name: 'المعقل', en: 'Maqal', areas: ['المعقل', 'العشار', 'البراضعية', 'الطويسة'] },
    { name: 'الهارثة', en: 'Hartha', areas: ['الهارثة', 'المدينة', 'القرنة', 'الثغر'] },
  ] },
  { name: 'ذي قار', en: 'Dhi Qar', districts: [
    { name: 'الناصرية', en: 'Nasiriyah', areas: ['الناصرية', 'الشامية', 'الحي العسكري', 'الزهراء', 'الكرامة', 'البتول', 'الرفاعي', 'الجبايش', 'سوق الشيوخ', 'الغراف', 'الإصلاح', 'النصر', 'الفهود', 'قلعة سكر', 'الشطرة', 'الطار', 'الفضلية', 'الطارمية'] },
    { name: 'الشطرة', en: 'Shatra', areas: ['الشطرة', 'الفضلية', 'الطار', 'البتول', 'الزهراء', 'الكرامة'] },
    { name: 'سوق الشيوخ', en: 'Suq Al-Shuyukh', areas: ['سوق الشيوخ', 'البتول', 'الزهراء', 'الكرامة', 'الجبايش'] },
    { name: 'الجبايش', en: 'Chibayish', areas: ['الجبايش', 'سوق الشيوخ', 'البتول', 'الزهراء', 'الكرامة'] },
    { name: 'الرفاعي', en: 'Rifai', areas: ['الرفاعي', 'البتول', 'الزهراء', 'الكرامة', 'الشطرة'] },
    { name: 'الغراف', en: 'Gharraf', areas: ['الغراف', 'البتول', 'الزهراء', 'الكرامة', 'الشطرة'] },
    { name: 'الإصلاح', en: 'Islah', areas: ['الإصلاح', 'البتول', 'الزهراء', 'الكرامة', 'الشطرة'] },
    { name: 'النصر', en: 'Nasr', areas: ['النصر', 'البتول', 'الزهراء', 'الكرامة', 'الشطرة'] },
    { name: 'الفهود', en: 'Fuhud', areas: ['الفهود', 'البتول', 'الزهراء', 'الكرامة', 'الشطرة'] },
    { name: 'قلعة سكر', en: 'Qalat Sukkar', areas: ['قلعة سكر', 'البتول', 'الزهراء', 'الكرامة', 'الشطرة'] },
  ] },
  { name: 'بابل', en: 'Babil', districts: [
    { name: 'الحلة', en: 'Hillah', areas: ['الحلة', 'الطهمازية', 'الجبلة', 'الهاشمية', 'المحاويل', 'الكفل', 'المدحتية', 'الحمزة الغربي', 'القاسم', 'الشوملي', 'المسيب', 'سدة الهندية', 'الطارمية'] },
    { name: 'المسيب', en: 'Musayyib', areas: ['المسيب', 'سدة الهندية', 'الجبلة', 'الطارمية'] },
    { name: 'المحاويل', en: 'Mahawil', areas: ['المحاويل', 'الجبلة', 'الهاشمية', 'المدحتية'] },
    { name: 'الهاشمية', en: 'Hashimiyah', areas: ['الهاشمية', 'المدحتية', 'الحمزة الغربي', 'القاسم'] },
  ] },
  { name: 'ديالى', en: 'Diyala', districts: [
    { name: 'بعقوبة', en: 'Baqubah', areas: ['بعقوبة', 'الوجيهية', 'العبارة', 'الخرنابات', 'الكنعان', 'المقدادية', 'خان بني سعد', 'المنصورية', 'الوجيهية الجديدة'] },
    { name: 'الخالص', en: 'Khalis', areas: ['الخالص', 'العظيم', 'الوجيهية', 'العبارة', 'الخرنابات'] },
    { name: 'خانقين', en: 'Khanaqin', areas: ['خانقين', 'السعدية', 'جلولاء', 'قره تبه', 'المقدادية'] },
    { name: 'المقدادية', en: 'Muqdadiya', areas: ['المقدادية', 'الوجيهية', 'العبارة', 'الخرنابات'] },
    { name: 'بلدروز', en: 'Baladrooz', areas: ['بلدروز', 'الوجيهية', 'العبارة', 'الخرنابات'] },
    { name: 'كفري', en: 'Kifri', areas: ['كفري', 'جلولاء', 'قره تبه'] },
  ] },
  { name: 'الأنبار', en: 'Al Anbar', districts: [
    { name: 'الرمادي', en: 'Ramadi', areas: ['الرمادي', 'الحبانية', 'الخالدية', 'الجزيرة', 'الكرمة', 'الوفاء', 'الطاش', 'الملعب', 'الورار', 'البو فراج', 'البو عبيد', 'البو عساف'] },
    { name: 'الفلوجة', en: 'Fallujah', areas: ['الفلوجة', 'الكرمة', 'الصقلاوية', 'الحبانية', 'النعيمية', 'العامرية'] },
    { name: 'هيت', en: 'Hit', areas: ['هيت', 'كبيسة', 'البغدادي', 'الحقلانية', 'الجزيرة'] },
    { name: 'حديثة', en: 'Haditha', areas: ['حديثة', 'الحقلانية', 'بروانة', 'الجزيرة'] },
    { name: 'عانة', en: 'Anah', areas: ['عانة', 'راوة', 'القائم', 'الجزيرة'] },
    { name: 'راوة', en: 'Rawa', areas: ['راوة', 'عانة', 'القائم', 'الجزيرة'] },
    { name: 'القائم', en: "Qa'im", areas: ['القائم', 'عكاشات', 'الكرابلة', 'الجزيرة'] },
    { name: 'الرطبة', en: 'Rutba', areas: ['الرطبة', 'النخيب', 'عكاشات', 'الجزيرة'] },
  ] },
  { name: 'المثنى', en: 'Al Muthanna', districts: [
    { name: 'السماوة', en: 'Samawah', areas: ['السماوة', 'الرميثة', 'الخضر', 'السلمان', 'الوركاء', 'النجمي', 'الحمزة الشرقي'] },
    { name: 'الرميثة', en: 'Rumaitha', areas: ['الرميثة', 'النجمي', 'الحمزة الشرقي'] },
    { name: 'الخضر', en: 'Khidhir', areas: ['الخضر', 'النجمي', 'الحمزة الشرقي'] },
    { name: 'السلمان', en: 'Salman', areas: ['السلمان', 'النجمي', 'الحمزة الشرقي'] },
  ] },
  { name: 'القادسية', en: 'Al Qadisiyyah', districts: [
    { name: 'الديوانية', en: 'Diwaniyah', areas: ['الديوانية', 'الشامية', 'عفك', 'الحمزة', 'السنية', 'البدير', 'الجباية', 'الحمزة الشرقي'] },
    { name: 'عفك', en: 'Afaq', areas: ['عفك', 'الحمزة', 'الشامية', 'الديوانية'] },
    { name: 'الحمزة', en: 'Hamza', areas: ['الحمزة', 'عفك', 'الشامية', 'الديوانية'] },
    { name: 'الشامية', en: 'Shamiya', areas: ['الشامية', 'عفك', 'الحمزة', 'الديوانية'] },
  ] },
  { name: 'كربلاء', en: 'Karbala', districts: [
    { name: 'كربلاء', en: 'Karbala', areas: ['كربلاء', 'الحر', 'الحسينية', 'الحي العسكري', 'الحي الصناعي', 'الحي الجامعي', 'الحي الزراعي', 'الحي العسكري الجديد'] },
    { name: 'الهندية', en: 'Hindiya', areas: ['الهندية', 'الجدول الغربي', 'الجدول الشرقي', 'العطيشي', 'الحي العسكري'] },
    { name: 'عين التمر', en: 'Ayn al-Tamr', areas: ['عين التمر', 'الحي العسكري', 'الحي الصناعي'] },
  ] },
  { name: 'واسط', en: 'Wasit', districts: [
    { name: 'الكوت', en: 'Kut', areas: ['الكوت', 'الحي', 'الصويرة', 'النعمانية', 'بدرة', 'العزيزية', 'الزبيدية', 'الشيخ سعد', 'الدبوني', 'الحفرية', 'الموفقية', 'البتار', 'الحي العسكري', 'الحي الصناعي', 'الحي الجامعي', 'الحي الزراعي', 'الحي التجاري', 'الحي السكني', 'الحي العسكري الجديد', 'الحي الصناعي الجديد', 'الحي الجامعي الجديد', 'الحي الزراعي الجديد', 'الحي التجاري الجديد', 'الحي السكني الجديد', 'الحي العسكري القديم', 'الحي الصناعي القديم', 'الحي الجامعي القديم', 'الحي الزراعي القديم', 'الحي التجاري القديم', 'الحي السكني القديم'] },
    { name: 'الصويرة', en: 'Suwaira', areas: ['الصويرة', 'الحي', 'النعمانية', 'بدرة', 'العزيزية', 'الحي العسكري', 'الحي الصناعي', 'الحي الجامعي', 'الحي الزراعي', 'الحي التجاري', 'الحي السكني', 'الحي العسكري الجديد', 'الحي الصناعي الجديد', 'الحي الجامعي الجديد', 'الحي الزراعي الجديد', 'الحي التجاري الجديد', 'الحي السكني الجديد'] },
    { name: 'الحي', en: 'Hai', areas: ['الحي', 'الصويرة', 'النعمانية', 'بدرة', 'العزيزية', 'الحي العسكري', 'الحي الصناعي', 'الحي الجامعي', 'الحي الزراعي', 'الحي التجاري', 'الحي السكني', 'الحي العسكري الجديد', 'الحي الصناعي الجديد', 'الحي الجامعي الجديد', 'الحي الزراعي الجديد', 'الحي التجاري الجديد', 'الحي السكني الجديد'] },
    { name: 'النعمانية', en: 'Numaniyah', areas: ['النعمانية', 'الصويرة', 'الحي', 'بدرة', 'العزيزية', 'الحي العسكري', 'الحي الصناعي', 'الحي الجامعي', 'الحي الزراعي', 'الحي التجاري', 'الحي السكني', 'الحي العسكري الجديد', 'الحي الصناعي الجديد', 'الحي الجامعي الجديد', 'الحي الزراعي الجديد', 'الحي التجاري الجديد', 'الحي السكني الجديد'] },
    { name: 'بدرة', en: 'Badra', areas: ['بدرة', 'الصويرة', 'الحي', 'النعمانية', 'العزيزية', 'الحي العسكري', 'الحي الصناعي', 'الحي الجامعي', 'الحي الزراعي', 'الحي التجاري', 'الحي السكني', 'الحي العسكري الجديد', 'الحي الصناعي الجديد', 'الحي الجامعي الجديد', 'الحي الزراعي الجديد', 'الحي التجاري الجديد', 'الحي السكني الجديد'] },
    { name: 'العزيزية', en: 'Aziziyah', areas: ['العزيزية', 'الصويرة', 'الحي', 'النعمانية', 'بدرة', 'الحي العسكري', 'الحي الصناعي', 'الحي الجامعي', 'الحي الزراعي', 'الحي التجاري', 'الحي السكني', 'الحي العسكري الجديد', 'الحي الصناعي الجديد', 'الحي الجامعي الجديد', 'الحي الزراعي الجديد', 'الحي التجاري الجديد', 'الحي السكني الجديد'] },
  ] },
  { name: 'ميسان', en: 'Maysan', districts: [
    { name: 'العمارة', en: 'Amarah', areas: ['العمارة', 'علي الغربي', 'الميمونة', 'المجر الكبير', 'الكحلاء', 'قلعة صالح', 'الكحلاء الجديدة', 'البتيرة', 'الحي العسكري', 'الحي الصناعي'] },
    { name: 'علي الغربي', en: 'Ali Al-Gharbi', areas: ['علي الغربي', 'العمارة', 'الميمونة', 'المجر الكبير', 'الكحلاء'] },
    { name: 'الميمونة', en: 'Maimouna', areas: ['الميمونة', 'العمارة', 'علي الغربي', 'المجر الكبير', 'الكحلاء'] },
    { name: 'المجر الكبير', en: 'Mejar Al-Kabi', areas: ['المجر الكبير', 'العمارة', 'علي الغربي', 'الميمونة', 'الكحلاء'] },
    { name: 'الكحلاء', en: 'Kahla', areas: ['الكحلاء', 'العمارة', 'علي الغربي', 'الميمونة', 'المجر الكبير'] },
    { name: 'قلعة صالح', en: 'Qalat Saleh', areas: ['قلعة صالح', 'العمارة', 'علي الغربي', 'الميمونة', 'المجر الكبير', 'الكحلاء'] },
  ] },
  { name: 'النجف', en: 'Najaf', districts: [
    { name: 'النجف', en: 'Najaf', areas: ['النجف', 'الكوفة', 'المناذرة', 'المشخاب', 'العباسية', 'الحيدرية', 'الحرية', 'الحي العسكري', 'الحي الصناعي'] },
    { name: 'الكوفة', en: 'Kufa', areas: ['الكوفة', 'النجف', 'المناذرة', 'المشخاب'] },
    { name: 'المناذرة', en: 'Manathera', areas: ['المناذرة', 'النجف', 'الكوفة', 'المشخاب'] },
    { name: 'المشخاب', en: 'Meshkhab', areas: ['المشخاب', 'النجف', 'الكوفة', 'المناذرة'] },
  ] },
  { name: 'صلاح الدين', en: 'Salah ad Din', districts: [
    { name: 'تكريت', en: 'Tikrit', areas: ['تكريت', 'العلم', 'الدور', 'الشرقاط', 'بيجي', 'سامراء', 'بلد', 'الدجيل', 'الضلوعية', 'الاسحاقي', 'المعتصم', 'العباسية', 'العباسية الجديدة'] },
    { name: 'سامراء', en: 'Samarra', areas: ['سامراء', 'تكريت', 'العلم', 'الدور', 'الشرقاط'] },
    { name: 'بلد', en: 'Balad', areas: ['بلد', 'الدجيل', 'الضلوعية', 'الاسحاقي', 'المعتصم'] },
    { name: 'بيجي', en: 'Baiji', areas: ['بيجي', 'تكريت', 'العلم', 'الدور', 'الشرقاط'] },
    { name: 'الدور', en: 'Daur', areas: ['الدور', 'تكريت', 'العلم', 'الشرقاط', 'بيجي'] },
    { name: 'الدجيل', en: 'Dujail', areas: ['الدجيل', 'بلد', 'الضلوعية', 'الاسحاقي', 'المعتصم'] },
    { name: 'الشرقاط', en: 'Shirqat', areas: ['الشرقاط', 'تكريت', 'العلم', 'الدور', 'بيجي'] },
    { name: 'طوز خورماتو', en: 'Tuz Khurmatu', areas: ['طوز خورماتو', 'آمرلي', 'سليمان بيك', 'ينكجة'] },
  ] },
  { name: 'كركوك', en: 'Kirkuk', districts: [
    { name: 'كركوك', en: 'Kirkuk', areas: ['كركوك', 'داقوق', 'الحويجة', 'الرياض', 'العباسي', 'الملا عبد الله', 'التون كوبري', 'الملتقى', 'الحرية', 'الحي الصناعي'] },
    { name: 'الحويجة', en: 'Hawija', areas: ['الحويجة', 'الرياض', 'العباسي', 'الملتقى'] },
    { name: 'داقوق', en: 'Daquq', areas: ['داقوق', 'كركوك', 'الحويجة', 'الرياض'] },
    { name: 'الدبس', en: 'Dibis', areas: ['الدبس', 'كركوك', 'الحويجة', 'الرياض'] },
  ] },
  { name: 'أربيل', en: 'Erbil', districts: [
    { name: 'أربيل', en: 'Erbil', areas: ['أربيل', 'عنكاوة', 'شقلاوة', 'كويسنجق', 'مخمور', 'سوران', 'جومان', 'ميركسور', 'ديانا', 'حرير', 'كنديناوة', 'كلك', 'كردكوسك', 'كنديناوة الجديدة'] },
    { name: 'شقلاوة', en: 'Shaqlawa', areas: ['شقلاوة', 'أربيل', 'عنكاوة', 'كويسنجق'] },
    { name: 'كويسنجق', en: 'Koy Sanjaq', areas: ['كويسنجق', 'أربيل', 'عنكاوة', 'شقلاوة'] },
    { name: 'مخمور', en: 'Makhmur', areas: ['مخمور', 'أربيل', 'عنكاوة', 'شقلاوة'] },
    { name: 'سوران', en: 'Soran', areas: ['سوران', 'ديانا', 'حرير', 'كنديناوة'] },
    { name: 'جومان', en: 'Choman', areas: ['جومان', 'ديانا', 'حرير', 'كنديناوة'] },
    { name: 'ميركسور', en: 'Mergasor', areas: ['ميركسور', 'ديانا', 'حرير', 'كنديناوة'] },
    { name: 'عنكاوة', en: 'Ankawa', areas: ['عنكاوة', 'أربيل', 'شقلاوة', 'كويسنجق'] },
  ] },
  { name: 'دهوك', en: 'Duhok', districts: [
    { name: 'دهوك', en: 'Duhok', areas: ['دهوك', 'زاخو', 'العمادية', 'سيميل', 'بردرش', 'عقرة', 'شيخان', 'سرسنك', 'كاني ماسي', 'ديرلوك', 'مانكيش', 'سريشمة', 'ديربون', 'ديرلوك الجديدة'] },
    { name: 'زاخو', en: 'Zakho', areas: ['زاخو', 'دهوك', 'العمادية', 'سيميل'] },
    { name: 'العمادية', en: 'Amadiya', areas: ['العمادية', 'دهوك', 'زاخو', 'سيميل'] },
    { name: 'سيميل', en: 'Sumel', areas: ['سيميل', 'دهوك', 'زاخو', 'العمادية'] },
    { name: 'بردرش', en: 'Bardarash', areas: ['بردرش', 'دهوك', 'زاخو', 'العمادية'] },
    { name: 'عقرة', en: 'Akre', areas: ['عقرة', 'دهوك', 'زاخو', 'العمادية'] },
    { name: 'شيخان', en: 'Shekhan', areas: ['شيخان', 'دهوك', 'زاخو', 'العمادية'] },
  ] },
  { name: 'السليمانية', en: 'Sulaymaniyah', districts: [
    { name: 'السليمانية', en: 'Sulaymaniyah', areas: ['السليمانية', 'جمجمال', 'كلار', 'رانية', 'دربندخان', 'دوكان', 'بنجوين', 'بشدر', 'سيد صادق', 'شهرزور', 'شاربازير', 'ميدان', 'قره داغ', 'حلبجة', 'خورمال', 'سيروان', 'بيارة'] },
    { name: 'جمجمال', en: 'Chamchamal', areas: ['جمجمال', 'السليمانية', 'كلار', 'رانية'] },
    { name: 'كلار', en: 'Kalar', areas: ['كلار', 'جمجمال', 'السليمانية', 'رانية'] },
    { name: 'رانية', en: 'Rania', areas: ['رانية', 'جمجمال', 'كلار', 'السليمانية'] },
    { name: 'دربندخان', en: 'Darbandikhan', areas: ['دربندخان', 'جمجمال', 'كلار', 'السليمانية'] },
    { name: 'دوكان', en: 'Dokan', areas: ['دوكان', 'جمجمال', 'كلار', 'السليمانية'] },
    { name: 'بنجوين', en: 'Penjwin', areas: ['بنجوين', 'جمجمال', 'كلار', 'السليمانية'] },
    { name: 'بشدر', en: 'Pshdar', areas: ['بشدر', 'جمجمال', 'كلار', 'السليمانية'] },
    { name: 'سيد صادق', en: 'Saidsadiq', areas: ['سيد صادق', 'جمجمال', 'كلار', 'السليمانية'] },
    { name: 'شهرزور', en: 'Sharazoor', areas: ['شهرزور', 'جمجمال', 'كلار', 'السليمانية'] },
    { name: 'شاربازير', en: 'Sharbazher', areas: ['شاربازير', 'جمجمال', 'كلار', 'السليمانية'] },
    { name: 'ميدان', en: 'Maidan', areas: ['ميدان', 'جمجمال', 'كلار', 'السليمانية'] },
  ] },
  { name: 'حلبجة', en: 'Halabja', districts: [
    { name: 'حلبجة', en: 'Halabja', areas: ['حلبجة', 'خورمال', 'سيروان', 'بيارة'] },
    { name: 'خورمال', en: 'Khurmal', areas: ['خورمال', 'حلبجة', 'سيروان', 'بيارة'] },
    { name: 'سيروان', en: 'Sirwan', areas: ['سيروان', 'حلبجة', 'خورمال', 'بيارة'] },
    { name: 'بيارة', en: 'Byara', areas: ['بيارة', 'حلبجة', 'خورمال', 'سيروان'] },
  ] },
];

// Improved dark mode styles for react-select to match Input
const selectStyles = (isDarkMode) => ({
  control: (provided, state) => ({
    ...provided,
    background: isDarkMode
      ? 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
      : 'linear-gradient(145deg, #fff 0%, #f3f4f6 100%)',
    color: isDarkMode ? '#fff' : '#23263a',
    borderColor: state.isFocused
      ? (isDarkMode ? '#667eea' : '#667eea')
      : (isDarkMode ? 'rgba(255,255,255,0.1)' : '#ccc'),
    borderRadius: 12,
    minHeight: 48,
    height: 48,
    boxShadow: state.isFocused
      ? (isDarkMode ? '0 0 0 3px rgba(102,126,234,0.2)' : '0 0 0 3px rgba(102,126,234,0.2)')
      : 'none',
    fontSize: '1rem',
    paddingLeft: 0,
    paddingRight: 0,
    outline: 'none',
    transition: 'all 0.3s ease',
  }),
  menu: (provided) => ({
    ...provided,
    background: isDarkMode
      ? 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
      : 'linear-gradient(145deg, #fff 0%, #f3f4f6 100%)',
    color: isDarkMode ? '#fff' : '#23263a',
    borderRadius: 12,
    zIndex: 20,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? (isDarkMode ? '#667eea' : '#e0e7ff')
      : state.isFocused
      ? (isDarkMode ? '#2d3250' : '#f3f4f6')
      : 'transparent',
    color: isDarkMode ? '#fff' : '#23263a',
    fontSize: '1rem',
    borderRadius: 8,
    cursor: 'pointer',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: isDarkMode ? '#fff' : '#23263a',
    fontSize: '1rem',
  }),
  input: (provided) => ({
    ...provided,
    color: isDarkMode ? '#fff' : '#23263a',
    fontSize: '1rem',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: isDarkMode ? '#a0aec0' : '#6b7280',
    fontSize: '1rem',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: isDarkMode ? '#a0aec0' : '#6b7280',
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: isDarkMode ? '#44476a' : '#ccc',
  }),
});

const EnhancedPatientForm = ({ onPatientRegistered, patients = [] }) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTests, setSelectedTests] = useState([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { t } = useTranslation();
  const justSubmitted = useRef(false);
  const skipNextAutosave = useRef(false);
  const autosaveSubscription = useRef(null);
  const { theme } = useTheme();
  const isDarkMode = theme?.isDarkMode;
  const { labTests } = useTestCatalog();
  const selectedTestIds = useTestSelectionStore((s) => s.selectedTestIds);

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
    defaultValues: {
      patientId: '',
      firstName: '',
      fathersName: '',
      grandFathersName: '',
      lastName: '',
      age: { value: '', unit: 'years' },
      gender: '',
      phoneNumber: '',
      email: '',
      address: {
        governorate: '',
        district: '',
        area: '',
        landmark: '',
        city: ''
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
      },
    }
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

  // Address state with defaults from address management
  const [selectedGovernorate, setSelectedGovernorate] = useState(() => {
    const defaultValue = settings?.addressData?.defaults?.governorate || 
                        settings?.patientRegistrationFields?.defaultLocation?.governorate?.value || '';
    return defaultValue.startsWith('patientRegistration.') ? '' : defaultValue;
  });
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    const defaultValue = settings?.addressData?.defaults?.district || 
                        settings?.patientRegistrationFields?.defaultLocation?.district?.value || '';
    return defaultValue.startsWith('patientRegistration.') ? '' : defaultValue;
  });
  const [selectedArea, setSelectedArea] = useState(() => {
    const defaultValue = settings?.addressData?.defaults?.area || 
                        settings?.patientRegistrationFields?.defaultLocation?.area?.value || '';
    return defaultValue.startsWith('patientRegistration.') ? '' : defaultValue;
  });

  // Reset address values if they contain translation keys
  useEffect(() => {
    if (selectedGovernorate && selectedGovernorate.startsWith('patientRegistration.')) {
      setSelectedGovernorate('');
    }
    if (selectedDistrict && selectedDistrict.startsWith('patientRegistration.')) {
      setSelectedDistrict('');
    }
    if (selectedArea && selectedArea.startsWith('patientRegistration.')) {
      setSelectedArea('');
    }
  }, [selectedGovernorate, selectedDistrict, selectedArea]);

  // Clear localStorage if it contains translation keys
  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let needsUpdate = false;
        
        // Check if any address fields contain translation keys
        if (parsed.formData) {
          if (parsed.formData.governorate && parsed.formData.governorate.startsWith('patientRegistration.')) {
            parsed.formData.governorate = '';
            needsUpdate = true;
          }
          if (parsed.formData.district && parsed.formData.district.startsWith('patientRegistration.')) {
            parsed.formData.district = '';
            needsUpdate = true;
          }
          if (parsed.formData.area && parsed.formData.area.startsWith('patientRegistration.')) {
            parsed.formData.area = '';
            needsUpdate = true;
          }
        }
        
        if (needsUpdate) {
          localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(parsed));
        }
      } catch (e) {
        // If there's an error parsing, clear the localStorage
        localStorage.removeItem(AUTOSAVE_KEY);
      }
    }
  }, []);

  // Use custom address data from settings
  const addressData = settings.addressData || { governorates: [], districts: {}, areas: {} };
  
  const governorateOptions = addressData.governorates.map(g => ({ 
    value: g.id, 
    label: g.nameAr || g.name 
  }));
  
  const selectedGovObj = addressData.governorates.find(g => g.id === selectedGovernorate);
  
  // Get districts for selected governorate
  const districtOptions = selectedGovObj && addressData.districts?.[selectedGovObj.id]
    ? addressData.districts[selectedGovObj.id].map(d => ({ 
        value: d.id, 
        label: d.nameAr || d.name 
      }))
    : [];
  
  const selectedDistObj = selectedGovObj && addressData.districts?.[selectedGovObj.id]
    ? addressData.districts[selectedGovObj.id].find(d => d.id === selectedDistrict)
    : null;
  
  // Get areas for selected district
  const areaOptions = selectedDistObj && addressData.areas?.[selectedDistObj.id]
    ? addressData.areas[selectedDistObj.id].map(a => ({ 
        value: a.id, 
        label: a.nameAr || a.name 
      }))
    : [];

  // Mutation for adding new patient
  const addPatientMutation = useMutation({
    mutationFn: async (patientData) => {
      const docRef = await addDoc(collection(db, "patients"), {
        ...patientData,
        bloodCollectionStatus: 'ready_for_collection', // Set initial status for phlebotomist view
        priority: patientData.priority || 'normal',
        selectedTests: selectedTests, // Include selected tests for test order creation
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
          // Clean any translation keys from form data
          const cleanedFormData = { ...parsed.formData };
          if (cleanedFormData.governorate && cleanedFormData.governorate.startsWith('patientRegistration.')) {
            cleanedFormData.governorate = '';
          }
          if (cleanedFormData.district && cleanedFormData.district.startsWith('patientRegistration.')) {
            cleanedFormData.district = '';
          }
          if (cleanedFormData.area && cleanedFormData.area.startsWith('patientRegistration.')) {
            cleanedFormData.area = '';
          }
          reset(cleanedFormData);
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

  useEffect(() => {
    setSelectedTests(selectedTestIds);
  }, [selectedTestIds]);

  // Show summary modal instead of direct submission
  const onSubmit = (data) => {
    // Ensure address fields are synced to form state before showing summary
    setValue('address.governorate', governorateOptions.find(opt => opt.value === selectedGovernorate) || '');
    setValue('address.district', districtOptions.find(opt => opt.value === selectedDistrict) || '');
    setValue('address.area', areaOptions.find(opt => opt.value === selectedArea) || '');
    setShowSummaryModal(true);
  };

  // Handle actual form submission after confirmation
  const handleConfirmRegistration = async () => {
    setIsSubmitting(true);
    try {
      const data = getValues();
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
      setShowSummaryModal(false);
      setShowPrintPreview(true); // Automatically open print preview after registration
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditForm = () => {
    setShowSummaryModal(false);
  };

  const handlePrintSummary = () => {
    setShowSummaryModal(false);
    setShowPrintPreview(true);
  };

  const [duplicateWarning, setDuplicateWarning] = useState('');
  const watchedFirstName = watch('firstName');
  const watchedFathersName = watch('fathersName');
  const watchedGrandFathersName = watch('grandFathersName');
  const watchedLastName = watch('lastName');
  const watchedPhone = watch('phoneNumber');
  const watchedEmail = watch('email');
  const watchedArea = watch('area');

  useEffect(() => {
    if (!watchedFirstName && !watchedFathersName && !watchedGrandFathersName && !watchedLastName && !watchedPhone && !watchedArea) {
      setDuplicateWarning('');
      return;
    }
    const match = patients.find(
      p =>
        watchedFirstName && watchedFathersName && watchedGrandFathersName && watchedLastName && watchedPhone && watchedArea &&
        p.firstName?.toLowerCase() === watchedFirstName.toLowerCase() &&
        p.fathersName?.toLowerCase() === watchedFathersName.toLowerCase() &&
        p.grandFathersName?.toLowerCase() === watchedGrandFathersName.toLowerCase() &&
        p.lastName?.toLowerCase() === watchedLastName.toLowerCase() &&
        p.phoneNumber === watchedPhone &&
        p.area === watchedArea
    );
    if (match) {
      setDuplicateWarning('A patient with similar details already exists. Please review before submitting.');
    } else {
      setDuplicateWarning('');
    }
  }, [watchedFirstName, watchedFathersName, watchedGrandFathersName, watchedLastName, watchedPhone, watchedArea, patients]);

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
            {t(fieldLabel)} {isRequired && '*'}
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
                  placeholder={`Scan or enter ${t(fieldLabel.toLowerCase())}`}
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
            <FieldTip>{t('patientRegistration.patientIdTip')}</FieldTip>
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
    if (fieldName === 'email') tip = t('patientRegistration.emailTip');
    if (fieldName === 'phoneNumber') tip = t('patientRegistration.phoneNumberTip');
    if (fieldName === 'age') tip = t('patientRegistration.ageTip');
    if (fieldName === 'age') {
      // Composite input for age value and unit, styled as a single field
      return (
        <InputGroup key={fieldPath}>
          <Label htmlFor={fieldPath}>
            {t(fieldLabel)} {isRequired && '*'}
          </Label>
          <Controller
            name={fieldPath}
            control={control}
            render={({ field }) => (
              <div style={{
                display: 'flex',
                width: '100%',
                maxWidth: 220,
                border: '1px solid #ccc',
                borderRadius: '8px',
                background: '#fff',
                overflow: 'hidden',
                alignItems: 'center',
                height: '48px',
              }}>
                <Input
                  type="number"
                  min="0"
                  id={`${fieldPath}.value`}
                  name={`${fieldPath}.value`}
                  value={field.value?.value ?? ''}
                  onChange={e => field.onChange({ ...field.value, value: e.target.value === '' ? '' : Number(e.target.value) })}
                  $hasError={!!errorPath}
                  autoComplete="off"
                  placeholder={t('patientRegistration.ageValuePlaceholder')}
                  style={{
                    border: 'none',
                    borderRadius: '0',
                    background: 'transparent',
                    width: '60%',
                    height: '100%',
                    fontSize: '1rem',
                    color: '#23263a',
                    padding: '0 0.75rem',
                    outline: 'none',
                  }}
                />
                <div style={{ width: 1, height: '70%', background: '#e0e0e0' }} />
                <select
                  id={`${fieldPath}.unit`}
                  name={`${fieldPath}.unit`}
                  value={field.value?.unit || 'years'}
                  onChange={e => field.onChange({ ...field.value, unit: e.target.value })}
                  style={{
                    border: 'none',
                    borderRadius: '0',
                    background: 'transparent',
                    width: '40%',
                    height: '100%',
                    fontSize: '1rem',
                    color: '#23263a',
                    padding: '0 0.75rem',
                    outline: 'none',
                    appearance: 'none',
                  }}
                >
                  <option value="years">{t('patientRegistration.years')}</option>
                  <option value="months">{t('patientRegistration.months')}</option>
                  <option value="days">{t('patientRegistration.days')}</option>
                </select>
              </div>
            )}
          />
          {errorPath && (
            <ErrorMessage>{errorPath.message}</ErrorMessage>
          )}
          {tip && <FieldTip>{tip}</FieldTip>}
        </InputGroup>
      );
    }
    return (
      <InputGroup key={fieldPath}>
        <Label htmlFor={fieldPath}>
          {t(fieldLabel)} {isRequired && '*'}
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
              placeholder={`Enter ${t(fieldLabel.toLowerCase())}`}
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
          {t(fieldLabel)} {isRequired && '*'}
        </Label>
        <Controller
          name={fieldPath}
          control={control}
          render={({ field }) => (
            <SelectContainer $hasError={!!errorPath}>
              <Select
                options={options}
                placeholder={`Select ${t(fieldLabel.toLowerCase())}`}
                classNamePrefix="react-select"
                isClearable
                onChange={option => field.onChange(option ? option.value : '')}
                value={options.find(option => option.value === field.value) || null}
                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                menuPosition="fixed"
                styles={{ ...selectStyles(isDarkMode), menuPortal: base => ({ ...base, zIndex: 9999 }) }}
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
          {t(fieldLabel)} {isRequired && '*'}
        </Label>
        <Controller
          name={fieldPath}
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              id={fieldPath}
              name={fieldPath}
              placeholder={`Enter ${t(fieldLabel.toLowerCase())}`}
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

  useEffect(() => {
    // Ensure age.unit is always set to a valid value
    const currentAge = getValues('age');
    if (!currentAge || !['years', 'months', 'days'].includes(currentAge.unit)) {
      setValue('age.unit', 'years');
    }
    // Ensure address.city is always a string and valid if required
    const currentCity = getValues('address.city');
    const currentDistrict = getValues('address.district');
    const cityRequired = isFieldRequired(settings.patientRegistrationFields, 'address', 'city');
    if (cityRequired) {
      if (typeof currentDistrict === 'string' && currentDistrict.length >= 2) {
        setValue('address.city', currentDistrict);
      } else {
        setValue('address.city', 'N/A');
      }
    } else if (typeof currentCity !== 'string') {
      setValue('address.city', '');
    }
  }, [reset, setValue, getValues, settings]);

  // Always sync city to district
  useEffect(() => {
    const district = getValues('address.district');
    const city = getValues('address.city');
    if (district !== city) {
      setValue('address.city', district || '');
    }
  }, [watch('address.district')]);

  // Always ensure city is valid if required
  useEffect(() => {
    const cityRequired = isFieldRequired(settings.patientRegistrationFields, 'address', 'city');
    const currentCity = getValues('address.city');
    const currentDistrict = getValues('address.district');
    if (cityRequired && (typeof currentCity !== 'string' || currentCity.length < 2)) {
      if (typeof currentDistrict === 'string' && currentDistrict.length >= 2) {
        setValue('address.city', currentDistrict, { shouldValidate: true });
      } else {
        setValue('address.city', 'N/A', { shouldValidate: true });
      }
    }
  }, [getValues('address.city'), getValues('address.district'), settings, setValue]);

  // Map selectedTests (names) to test objects
  const selectedTestObjects = selectedTests.map(testName => labTests.find(t => t.name === testName)).filter(Boolean);

  // Add after useForm and before the form JSX
  const requiredFields = [
    'firstName', 'fathersName', 'grandFathersName', 'lastName', 'age', 'gender', 'phoneNumber',
    'address.governorate', 'address.district', 'address.area',
    'emergencyContact.name', 'emergencyContact.relationship', 'emergencyContact.phoneNumber'
  ];
  const values = getValues();
  let filled = 0;
  requiredFields.forEach(field => {
    const parts = field.split('.');
    let val = values;
    for (const part of parts) {
      val = val?.[part];
    }
    if (val && (typeof val === 'string' ? val.trim() : true)) filled++;
  });
  const progress = Math.round((filled / requiredFields.length) * 100);

  // Add after autosave logic
  const handleSaveDraft = () => {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ formData: getValues(), selectedTests }));
    toast.success('Draft saved!');
  };
  const handleLoadDraft = () => {
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
        toast.success('Draft loaded!');
      } catch (e) {
        toast.error('Failed to load draft');
      }
    }
  };
  const hasDraft = !!localStorage.getItem(AUTOSAVE_KEY);

  return (
    <>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={250} recycle={false} />} 
      <FormContainer>
        <h2 style={{ marginBottom: '1.5rem', color: '#667eea', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaSmileBeam style={{ color: '#f093fb' }} /> {t('patientRegistration.title')}
        </h2>
        <div style={{ width: '100%', marginBottom: 16 }}>
          <LinearProgress variant="determinate" value={progress} />
          <div style={{ textAlign: 'right', fontSize: 12, color: '#888', marginTop: 2 }}>{progress}%</div>
        </div>
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
                  {renderField('fathersName', settings.patientRegistrationFields.fathersName)}
                  {renderField('grandFathersName', settings.patientRegistrationFields.grandFathersName)}
                  {renderField('lastName', settings.patientRegistrationFields.lastName)}
                  {renderField('age', settings.patientRegistrationFields.age)}
                  {renderSelectField('gender', settings.patientRegistrationFields.gender, genderOptions)}
                  {renderField('phoneNumber', settings.patientRegistrationFields.phoneNumber)}
                  {renderField('email', settings.patientRegistrationFields.email)}
                </FormGrid>
              </FormSection>

              {/* Address Section (Iraq structure) */}
              {shouldRenderSection(settings.patientRegistrationFields, 'address') && (
                <FormSection>
                  <SectionTitle>
                    <FaMapMarkerAlt /> {t('patientRegistration.addressInfo')}
                  </SectionTitle>
                  <FormGrid>
                    {/* Country (fixed to Iraq) */}
                    <InputGroup>
                      <Label>{t('patientRegistration.country')}</Label>
                      <Input value="العراق" disabled readOnly />
                    </InputGroup>
                    {/* Governorate */}
                    <InputGroup>
                      <Label>{t('patientRegistration.governorate')}</Label>
                      <Select
                        options={governorateOptions}
                        value={governorateOptions.find(opt => opt.value === String(selectedGovernorate).trim()) || null}
                        onChange={opt => {
                          setSelectedGovernorate(opt?.value || '');
                          setSelectedDistrict('');
                          setSelectedArea('');
                          setValue('address.governorate', opt || '');
                        }}
                        placeholder={t('patientRegistration.selectGovernorate')}
                        isClearable
                        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                        menuPosition="fixed"
                        styles={{ ...selectStyles(isDarkMode), menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      />
                    </InputGroup>
                    {/* District */}
                    <InputGroup>
                      <Label>{t('patientRegistration.district')}</Label>
                      <Select
                        options={districtOptions}
                        value={districtOptions.find(opt => opt.value === String(selectedDistrict).trim()) || (selectedDistrict && !districtOptions.find(opt => opt.value === String(selectedDistrict).trim()) ? { value: selectedDistrict, label: selectedDistrict } : null)}
                        onChange={opt => {
                          setSelectedDistrict(opt?.value || '');
                          setSelectedArea('');
                          setValue('address.district', opt || '');
                          setValue('address.city', opt?.value || ''); // Sync city to district
                        }}
                        placeholder={t('patientRegistration.selectOrTypeDistrict')}
                        isClearable
                        isDisabled={!selectedGovernorate}
                        filterOption={(option, inputValue) => {
                          if (!inputValue) return true;
                          return option.label.toLowerCase().includes(inputValue.toLowerCase());
                        }}
                        onInputChange={(inputValue) => {
                          if (inputValue && !districtOptions.find(opt => opt.value === inputValue)) {
                            setSelectedDistrict(inputValue);
                            setValue('address.district', { value: inputValue, label: inputValue });
                            setValue('address.city', inputValue); // Sync city to district
                          }
                        }}
                        createOptionPosition="first"
                        formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
                        isValidNewOption={(inputValue) => inputValue.length > 0}
                        onCreateOption={(inputValue) => {
                          setSelectedDistrict(inputValue);
                          setValue('address.district', { value: inputValue, label: inputValue });
                          setValue('address.city', inputValue); // Sync city to district
                        }}
                        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                        menuPosition="fixed"
                        styles={{ ...selectStyles(isDarkMode), menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      />
                    </InputGroup>
                    {/* Area */}
                    <InputGroup>
                      <Label>{t('patientRegistration.area')}</Label>
                      <Select
                        options={areaOptions}
                        value={areaOptions.find(opt => opt.value === String(selectedArea).trim()) || (selectedArea && !areaOptions.find(opt => opt.value === String(selectedArea).trim()) ? { value: selectedArea, label: selectedArea } : null)}
                        onChange={opt => {
                          setSelectedArea(opt?.value || '');
                          setValue('address.area', opt || '');
                        }}
                        placeholder={t('patientRegistration.selectOrTypeArea')}
                        isClearable
                        isDisabled={!selectedDistrict}
                        filterOption={(option, inputValue) => {
                          if (!inputValue) return true;
                          return option.label.toLowerCase().includes(inputValue.toLowerCase());
                        }}
                        onInputChange={(inputValue) => {
                          if (inputValue && !areaOptions.find(opt => opt.value === inputValue)) {
                            setSelectedArea(inputValue);
                            setValue('address.area', { value: inputValue, label: inputValue });
                          }
                        }}
                        createOptionPosition="first"
                        formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
                        isValidNewOption={(inputValue) => inputValue.length > 0}
                        onCreateOption={(inputValue) => {
                          setSelectedArea(inputValue);
                          setValue('address.area', { value: inputValue, label: inputValue });
                        }}
                        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                        menuPosition="fixed"
                        styles={{ ...selectStyles(isDarkMode), menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      />
                    </InputGroup>
                    {/* Nearest Landmark */}
                    <InputGroup>
                      <Label>{t('patientRegistration.landmark')}</Label>
                      <Controller
                        name="address.landmark"
                        control={control}
                        render={({ field }) => (
                          <Input {...field} placeholder={t('patientRegistration.landmarkPlaceholder')} />
                        )}
                      />
                    </InputGroup>
                  </FormGrid>
                </FormSection>
              )}

              {/* Emergency Contact Section */}
              {shouldRenderSection(settings.patientRegistrationFields, 'emergencyContact') && (
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
              {shouldRenderSection(settings.patientRegistrationFields, 'medicalHistory') && (
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
              {shouldRenderSection(settings.patientRegistrationFields, 'insurance') && (
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
              <TestSelectionPanel
                selectedTests={selectedTests}
                onTestSelection={handleTestSelection}
                onTestRemoval={handleTestRemoval}
              >
                <GlowButton
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    padding: '1.25rem 2.5rem',
                    background: 'linear-gradient(90deg, #667eea 0%, #f093fb 100%)',
                    border: '3px solid #764ba2',
                    boxShadow: '0 6px 32px 0 #667eea55',
                    borderRadius: '16px',
                    color: '#fff',
                    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                    letterSpacing: '0.5px',
                  }}
                >
                  {isSubmitting ? (
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <FaSave />
                  )}
                  {isSubmitting ? t('patientRegistration.saving') : t('patientRegistration.reviewAndRegister') || 'Review & Register'}
                </GlowButton>
              </TestSelectionPanel>
            </form>
          </MainFormColumn>
        </RegistrationLayout>
      </FormContainer>
      <RegistrationSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        patientData={getValues()}
        selectedTests={selectedTestObjects}
        onConfirm={handleConfirmRegistration}
        onEdit={handleEditForm}
        onPrint={handlePrintSummary}
      />
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        patientData={getValues()}
        selectedTests={selectedTestObjects}
        orderData={{
          referringDoctor: getValues('referringDoctor') || 'N/A',
          priority: getValues('priority') || 'Normal',
          notes: getValues('notes') || ''
        }}
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <GlowButton type="button" onClick={handleSaveDraft}>
          Save as Draft
        </GlowButton>
        {hasDraft && (
          <GlowButton type="button" onClick={handleLoadDraft}>
            Load Draft
          </GlowButton>
        )}
      </div>
    </>
  );
};

export default EnhancedPatientForm; 