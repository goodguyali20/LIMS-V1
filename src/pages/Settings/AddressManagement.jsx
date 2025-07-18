import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useSettings } from '../../contexts/SettingsContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, 
  FaCheck, FaGlobe, FaCity, FaBuilding, FaStar, FaStarOfLife
} from 'react-icons/fa';
import GlowCard from '../../components/common/GlowCard.jsx';
import GlowButton from '../../components/common/GlowButton.jsx';
import { showFlashMessage } from '../../contexts/NotificationContext';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(20px);
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.isDarkMode ? '#ffffff' : '#1f2937'};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(107, 114, 128, 0.8)'};
  margin: 0.5rem 0 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Section = styled(GlowCard)`
  padding: 1.5rem;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.08) 0%, 
    rgba(255, 255, 255, 0.04) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(10px);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.isDarkMode ? '#ffffff' : '#1f2937'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Item = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
  
  &.selected {
    border-color: rgba(102, 126, 234, 0.5);
    background: linear-gradient(145deg, 
      rgba(102, 126, 234, 0.1) 0%, 
      rgba(102, 126, 234, 0.05) 100%);
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const ItemName = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.isDarkMode ? '#ffffff' : '#1f2937'};
`;

const DefaultBadge = styled.span`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  color: ${({ theme }) => theme.isDarkMode ? '#ffffff' : '#374151'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  &.delete:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    color: #ef4444;
  }
  
  &.default:hover {
    background: rgba(16, 185, 129, 0.2);
    border-color: rgba(16, 185, 129, 0.4);
    color: #10b981;
  }
`;

const AddForm = styled(motion.div)`
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  color: ${({ theme }) => theme.isDarkMode ? '#ffffff' : '#1f2937'};
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(107, 114, 128, 0.6)'};
  }
`;

const Select = styled.select`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  color: ${({ theme }) => theme.isDarkMode ? '#ffffff' : '#1f2937'};
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const DefaultsSection = styled(Section)`
  grid-column: 1 / -1;
`;

const DefaultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const DefaultItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

const DefaultLabel = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.isDarkMode ? '#ffffff' : '#1f2937'};
`;

const DefaultValue = styled.span`
  color: ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(107, 114, 128, 0.8)'};
  font-size: 0.9rem;
`;

const AddressManagement = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { showFlashMessage } = useNotifications();
  
  // Default Iraq data
  const defaultIraqData = {
    governorates: [
      { id: 'baghdad', name: 'Baghdad', nameAr: 'بغداد', isDefault: true },
      { id: 'basra', name: 'Basra', nameAr: 'البصرة', isDefault: false },
      { id: 'mosul', name: 'Mosul', nameAr: 'الموصل', isDefault: false },
      { id: 'erbil', name: 'Erbil', nameAr: 'أربيل', isDefault: false },
      { id: 'sulaymaniyah', name: 'Sulaymaniyah', nameAr: 'السليمانية', isDefault: false },
      { id: 'kirkuk', name: 'Kirkuk', nameAr: 'كركوك', isDefault: false },
      { id: 'najaf', name: 'Najaf', nameAr: 'النجف', isDefault: false },
      { id: 'karbala', name: 'Karbala', nameAr: 'كربلاء', isDefault: false },
      { id: 'wasit', name: 'Wasit', nameAr: 'واسط', isDefault: false },
      { id: 'babil', name: 'Babil', nameAr: 'بابل', isDefault: false },
      { id: 'qadisiyah', name: 'Qadisiyah', nameAr: 'القادسية', isDefault: false },
      { id: 'dhi_qar', name: 'Dhi Qar', nameAr: 'ذي قار', isDefault: false },
      { id: 'maysan', name: 'Maysan', nameAr: 'ميسان', isDefault: false },
      { id: 'diyala', name: 'Diyala', nameAr: 'ديالى', isDefault: false },
      { id: 'salah_ad_din', name: 'Salah ad-Din', nameAr: 'صلاح الدين', isDefault: false },
      { id: 'nineveh', name: 'Nineveh', nameAr: 'نينوى', isDefault: false },
      { id: 'anbar', name: 'Anbar', nameAr: 'الأنبار', isDefault: false }
    ],
    districts: {
      'baghdad': [
        { id: 'baghdad_central', name: 'Baghdad Central', nameAr: 'بغداد المركز', governorateId: 'baghdad', isDefault: true },
        { id: 'karkh', name: 'Karkh', nameAr: 'الكرخ', governorateId: 'baghdad', isDefault: false },
        { id: 'rusafa', name: 'Rusafa', nameAr: 'الرصافة', governorateId: 'baghdad', isDefault: false },
        { id: 'adhamiyah', name: 'Adhamiyah', nameAr: 'الأعظمية', governorateId: 'baghdad', isDefault: false },
        { id: 'kadhimiyah', name: 'Kadhimiyah', nameAr: 'الكاظمية', governorateId: 'baghdad', isDefault: false }
      ],
      'basra': [
        { id: 'basra_central', name: 'Basra Central', nameAr: 'البصرة المركز', governorateId: 'basra', isDefault: true },
        { id: 'shatt_al_arab', name: 'Shatt al-Arab', nameAr: 'شط العرب', governorateId: 'basra', isDefault: false },
        { id: 'abdan', name: 'Abdan', nameAr: 'عبدان', governorateId: 'basra', isDefault: false },
        { id: 'qurna', name: 'Qurna', nameAr: 'القرنة', governorateId: 'basra', isDefault: false }
      ],
      'mosul': [
        { id: 'mosul_central', name: 'Mosul Central', nameAr: 'الموصل المركز', governorateId: 'mosul', isDefault: true },
        { id: 'al_hamdaniya', name: 'Al Hamdaniya', nameAr: 'الحمدانية', governorateId: 'mosul', isDefault: false },
        { id: 'tel_kaif', name: 'Tel Kaif', nameAr: 'تل كيف', governorateId: 'mosul', isDefault: false }
      ],
      'erbil': [
        { id: 'erbil_central', name: 'Erbil Central', nameAr: 'أربيل المركز', governorateId: 'erbil', isDefault: true },
        { id: 'soran', name: 'Soran', nameAr: 'سوران', governorateId: 'erbil', isDefault: false },
        { id: 'shaqlawa', name: 'Shaqlawa', nameAr: 'شقلاوه', governorateId: 'erbil', isDefault: false }
      ],
      'sulaymaniyah': [
        { id: 'sulaymaniyah_central', name: 'Sulaymaniyah Central', nameAr: 'السليمانية المركز', governorateId: 'sulaymaniyah', isDefault: true },
        { id: 'halabja', name: 'Halabja', nameAr: 'حلبجة', governorateId: 'sulaymaniyah', isDefault: false },
        { id: 'penjwin', name: 'Penjwin', nameAr: 'بنجوين', governorateId: 'sulaymaniyah', isDefault: false }
      ],
      'kirkuk': [
        { id: 'kirkuk_central', name: 'Kirkuk Central', nameAr: 'كركوك المركز', governorateId: 'kirkuk', isDefault: true },
        { id: 'dibis', name: 'Dibis', nameAr: 'دبس', governorateId: 'kirkuk', isDefault: false },
        { id: 'hawija', name: 'Hawija', nameAr: 'الحويجة', governorateId: 'kirkuk', isDefault: false }
      ],
      'wasit': [
        { id: 'kut', name: 'Kut District', nameAr: 'قضاء الكوت', governorateId: 'wasit', isDefault: true },
        { id: 'al_hay', name: 'Al-Hai District', nameAr: 'قضاء الحي', governorateId: 'wasit', isDefault: false },
        { id: 'al_suwaira', name: 'Al-Suwaira', nameAr: 'قضاء الصويرة', governorateId: 'wasit', isDefault: false },
        { id: 'al_aziziya', name: 'Al-Aziziyah', nameAr: 'قضاء العزيزية', governorateId: 'wasit', isDefault: false },
        { id: 'al_numaniya', name: 'Al-Nu\'maniya', nameAr: 'قضاء النعمانية', governorateId: 'wasit', isDefault: false },
        { id: 'badra', name: 'Badra District', nameAr: 'قضاء بدرة', governorateId: 'wasit', isDefault: false }
      ],
      'najaf': [
        { id: 'najaf_central', name: 'Najaf Central', nameAr: 'النجف المركز', governorateId: 'najaf', isDefault: true },
        { id: 'kufa', name: 'Kufa', nameAr: 'الكوفة', governorateId: 'najaf', isDefault: false },
        { id: 'al_manara', name: 'Al Manara', nameAr: 'المنارة', governorateId: 'najaf', isDefault: false }
      ],
      'karbala': [
        { id: 'karbala_central', name: 'Karbala Central', nameAr: 'كربلاء المركز', governorateId: 'karbala', isDefault: true },
        { id: 'ain_al_tamur', name: 'Ain al-Tamur', nameAr: 'عين التمر', governorateId: 'karbala', isDefault: false },
        { id: 'al_hindiya', name: 'Al Hindiya', nameAr: 'الهندية', governorateId: 'karbala', isDefault: false }
      ],
      'babil': [
        { id: 'hillah', name: 'Hillah', nameAr: 'الحلة', governorateId: 'babil', isDefault: true },
        { id: 'al_mahawil', name: 'Al Mahawil', nameAr: 'المحاويل', governorateId: 'babil', isDefault: false },
        { id: 'al_musaib', name: 'Al Musaib', nameAr: 'المسيب', governorateId: 'babil', isDefault: false }
      ],
      'qadisiyah': [
        { id: 'diwaniyah', name: 'Diwaniyah', nameAr: 'الديوانية', governorateId: 'qadisiyah', isDefault: true },
        { id: 'al_shamiya', name: 'Al Shamiya', nameAr: 'الشمية', governorateId: 'qadisiyah', isDefault: false },
        { id: 'afak', name: 'Afak', nameAr: 'عفك', governorateId: 'qadisiyah', isDefault: false }
      ],
      'dhi_qar': [
        { id: 'nasiriyah', name: 'Nasiriyah', nameAr: 'الناصرية', governorateId: 'dhi_qar', isDefault: true },
        { id: 'shatra', name: 'Shatra', nameAr: 'الشطرة', governorateId: 'dhi_qar', isDefault: false },
        { id: 'al_rifai', name: 'Al Rifai', nameAr: 'الرفاعي', governorateId: 'dhi_qar', isDefault: false }
      ],
      'maysan': [
        { id: 'amarah', name: 'Amarah', nameAr: 'العمارة', governorateId: 'maysan', isDefault: true },
        { id: 'al_kahla', name: 'Al Kahla', nameAr: 'الكحلاء', governorateId: 'maysan', isDefault: false },
        { id: 'al_majar_al_kabir', name: 'Al Majar al-Kabir', nameAr: 'المجر الكبير', governorateId: 'maysan', isDefault: false }
      ],
      'diyala': [
        { id: 'baqubah', name: 'Baqubah', nameAr: 'بعقوبة', governorateId: 'diyala', isDefault: true },
        { id: 'khalis', name: 'Khalis', nameAr: 'الخالص', governorateId: 'diyala', isDefault: false },
        { id: 'balad_ruz', name: 'Balad Ruz', nameAr: 'بلد روز', governorateId: 'diyala', isDefault: false }
      ],
      'salah_ad_din': [
        { id: 'tikrit', name: 'Tikrit', nameAr: 'تكريت', governorateId: 'salah_ad_din', isDefault: true },
        { id: 'samarra', name: 'Samarra', nameAr: 'سامراء', governorateId: 'salah_ad_din', isDefault: false },
        { id: 'balad', name: 'Balad', nameAr: 'بلد', governorateId: 'salah_ad_din', isDefault: false }
      ],
      'nineveh': [
        { id: 'mosul_nineveh', name: 'Mosul', nameAr: 'الموصل', governorateId: 'nineveh', isDefault: true },
        { id: 'sinjar', name: 'Sinjar', nameAr: 'سنجار', governorateId: 'nineveh', isDefault: false },
        { id: 'tel_afar', name: 'Tel Afar', nameAr: 'تلعفر', governorateId: 'nineveh', isDefault: false }
      ],
      'anbar': [
        { id: 'ramadi', name: 'Ramadi', nameAr: 'الرمادي', governorateId: 'anbar', isDefault: true },
        { id: 'fallujah', name: 'Fallujah', nameAr: 'الفلوجة', governorateId: 'anbar', isDefault: false },
        { id: 'al_qaem', name: 'Al Qaem', nameAr: 'القائم', governorateId: 'anbar', isDefault: false }
      ]
    },
    areas: {
      'baghdad_central': [
        { id: 'karrada', name: 'Karrada', nameAr: 'الكرادة', districtId: 'baghdad_central', isDefault: true },
        { id: 'mansour', name: 'Mansour', nameAr: 'المنصور', districtId: 'baghdad_central', isDefault: false },
        { id: 'jadriya', name: 'Jadriya', nameAr: 'الجادرية', districtId: 'baghdad_central', isDefault: false }
      ],
      'karkh': [
        { id: 'karkh_center', name: 'Karkh Center', nameAr: 'مركز الكرخ', districtId: 'karkh', isDefault: true },
        { id: 'al_dora', name: 'Al Dora', nameAr: 'الدورة', districtId: 'karkh', isDefault: false }
      ],
      'rusafa': [
        { id: 'rusafa_center', name: 'Rusafa Center', nameAr: 'مركز الرصافة', districtId: 'rusafa', isDefault: true },
        { id: 'al_sadr_city', name: 'Al Sadr City', nameAr: 'مدينة الصدر', districtId: 'rusafa', isDefault: false }
      ],
      'basra_central': [
        { id: 'ashar', name: 'Ashar', nameAr: 'عشار', districtId: 'basra_central', isDefault: true },
        { id: 'basra_old', name: 'Basra Old', nameAr: 'البصرة القديمة', districtId: 'basra_central', isDefault: false },
        { id: 'al_maqal', name: 'Al Maqal', nameAr: 'المقل', districtId: 'basra_central', isDefault: false }
      ],
      'shatt_al_arab': [
        { id: 'shatt_al_arab_center', name: 'Shatt al-Arab Center', nameAr: 'مركز شط العرب', districtId: 'shatt_al_arab', isDefault: true },
        { id: 'al_faw', name: 'Al Faw', nameAr: 'الفحوة', districtId: 'shatt_al_arab', isDefault: false }
      ],
      'mosul_central': [
        { id: 'mosul_old_city', name: 'Mosul Old City', nameAr: 'الموصل القديمة', districtId: 'mosul_central', isDefault: true },
        { id: 'al_mansour', name: 'Al Mansour', nameAr: 'المنصور', districtId: 'mosul_central', isDefault: false }
      ],
      'erbil_central': [
        { id: 'erbil_citadel', name: 'Erbil Citadel', nameAr: 'قلعة أربيل', districtId: 'erbil_central', isDefault: true },
        { id: 'ankawa', name: 'Ankawa', nameAr: 'عنكاوا', districtId: 'erbil_central', isDefault: false }
      ],
      'sulaymaniyah_central': [
        { id: 'sulaymaniyah_old', name: 'Sulaymaniyah Old', nameAr: 'السليمانية القديمة', districtId: 'sulaymaniyah_central', isDefault: true },
        { id: 'azmar', name: 'Azmar', nameAr: 'أزمر', districtId: 'sulaymaniyah_central', isDefault: false }
      ],
      'kut': [
        { id: 'kut_center', name: 'Kut Center', nameAr: 'مركز الكوت', districtId: 'kut', isDefault: true },
        { id: 'al_numaniya', name: 'Al Numaniya', nameAr: 'النعمانية', districtId: 'kut', isDefault: false },
        { id: 'al_suwaira_old', name: 'Al Suwaira Old', nameAr: 'الصويرة القديمة', districtId: 'kut', isDefault: false }
      ],
      'al_hay': [
        { id: 'al_hay_center', name: 'Al Hay Center', nameAr: 'مركز الحي', districtId: 'al_hay', isDefault: true },
        { id: 'al_aziziya_old', name: 'Al Aziziya Old', nameAr: 'العزيزية القديمة', districtId: 'al_hay', isDefault: false }
      ],
      'al_suwaira': [
        { id: 'al_suwaira_center', name: 'Al Suwaira Center', nameAr: 'مركز الصويرة', districtId: 'al_suwaira', isDefault: true },
        { id: 'al_aziziya_new', name: 'Al Aziziya New', nameAr: 'العزيزية الجديدة', districtId: 'al_suwaira', isDefault: false }
      ],
      'al_aziziya': [
        { id: 'al_hafriya', name: 'Al-Hafriya', nameAr: 'ناحية الحفرية', districtId: 'al_aziziya', isDefault: true },
        { id: 'dubauni', name: 'Dubauni', nameAr: 'ناحية الدبوني', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_karama', name: 'Al-Karama', nameAr: 'ناحية الكرامة', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_uruba', name: 'Al-Uruba', nameAr: 'العروبة', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_jamiya', name: "Al-Jam'iya", nameAr: 'الجمعية', districtId: 'al_aziziya', isDefault: false },
        { id: 'dakhl_al_mahdood', name: 'Dakhl al-Mahdood', nameAr: 'دخل المحدود', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_shuhada', name: 'Al-Shuhada', nameAr: 'الشهداء', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_150', name: 'Al-150', nameAr: 'ال ١٥٠', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_askari', name: 'Al-Askari', nameAr: 'العسكري', districtId: 'al_aziziya', isDefault: false },
        { id: 'bab_al_hara', name: 'Bab al-Hara', nameAr: 'باب الحارة', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_muwazafin', name: 'Al-Muwazafin', nameAr: 'الموظفين', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_siyasiyin', name: 'Al-Siyasiyin', nameAr: 'السياسيين', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_bustan', name: 'Al-Bustan', nameAr: 'البستان', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_jadida', name: 'Al-Jadida', nameAr: 'الجديدة', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_saray', name: 'Al-Saray', nameAr: 'السراي', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_sadouniya', name: 'Al-Sa\'douniya', nameAr: 'السعدونية', districtId: 'al_aziziya', isDefault: false },
        { id: 'maamal_al_soos', name: 'Ma\'mal al-Soos', nameAr: 'معمل السوس', districtId: 'al_aziziya', isDefault: false },
        { id: 'hawas', name: 'Hawas', nameAr: 'حواس', districtId: 'al_aziziya', isDefault: false },
        { id: 'umm_al_banin', name: 'Umm al-Banin', nameAr: 'ام البنين', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_khumas', name: 'Al-Khumas', nameAr: 'الخماس', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_mualimin', name: 'Al-Mu\'alimin', nameAr: 'المعلمين', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_zahra', name: 'Al-Zahra', nameAr: 'الزهراء', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_intisar', name: 'Al-Intisar', nameAr: 'الانتصار', districtId: 'al_aziziya', isDefault: false },
        { id: 'al_souq_al_kabir', name: 'Al-Souq Al-Kabir', nameAr: 'السوق الكبير', districtId: 'al_aziziya', isDefault: false },
        { id: 'aziziyah_residential', name: 'Al-Aziziyah Residential Complex', nameAr: 'مجمع العزيزية السكني', districtId: 'al_aziziya', isDefault: false }
      ],
      'najaf_central': [
        { id: 'najaf_old_city', name: 'Najaf Old City', nameAr: 'النجف القديمة', districtId: 'najaf_central', isDefault: true },
        { id: 'al_manara', name: 'Al Manara', nameAr: 'المنارة', districtId: 'najaf_central', isDefault: false },
        { id: 'al_mishkhab', name: 'Al Mishkhab', nameAr: 'المشخاب', districtId: 'najaf_central', isDefault: false }
      ],
      'kufa': [
        { id: 'kufa_center', name: 'Kufa Center', nameAr: 'مركز الكوفة', districtId: 'kufa', isDefault: true },
        { id: 'al_abbasiya', name: 'Al Abbasiya', nameAr: 'العباسية', districtId: 'kufa', isDefault: false }
      ],
      'karbala_central': [
        { id: 'karbala_old_city', name: 'Karbala Old City', nameAr: 'كربلاء القديمة', districtId: 'karbala_central', isDefault: true },
        { id: 'al_mukhayam', name: 'Al Mukhayam', nameAr: 'المخيم', districtId: 'karbala_central', isDefault: false },
        { id: 'al_hur', name: 'Al Hur', nameAr: 'الحير', districtId: 'karbala_central', isDefault: false }
      ],
      'ain_al_tamur': [
        { id: 'ain_al_tamur_center', name: 'Ain al-Tamur Center', nameAr: 'مركز عين التمر', districtId: 'ain_al_tamur', isDefault: true },
        { id: 'al_hindiya_old', name: 'Al Hindiya Old', nameAr: 'الهندية القديمة', districtId: 'ain_al_tamur', isDefault: false }
      ],
      'hillah': [
        { id: 'hillah_center', name: 'Hillah Center', nameAr: 'مركز الحلة', districtId: 'hillah', isDefault: true },
        { id: 'babylon_ruins', name: 'Babylon Ruins', nameAr: 'أطلال بابل', districtId: 'hillah', isDefault: false }
      ],
      'diwaniyah': [
        { id: 'diwaniyah_center', name: 'Diwaniyah Center', nameAr: 'مركز الديوانية', districtId: 'diwaniyah', isDefault: true },
        { id: 'al_shamiya_old', name: 'Al Shamiya Old', nameAr: 'الشمية القديمة', districtId: 'diwaniyah', isDefault: false }
      ],
      'nasiriyah': [
        { id: 'nasiriyah_center', name: 'Nasiriyah Center', nameAr: 'مركز الناصرية', districtId: 'nasiriyah', isDefault: true },
        { id: 'ur_ruins', name: 'Ur Ruins', nameAr: 'أطلال أور', districtId: 'nasiriyah', isDefault: false }
      ],
      'amarah': [
        { id: 'amarah_center', name: 'Amarah Center', nameAr: 'مركز العمارة', districtId: 'amarah', isDefault: true },
        { id: 'al_kahla_old', name: 'Al Kahla Old', nameAr: 'الكحلاء القديمة', districtId: 'amarah', isDefault: false }
      ],
      'baqubah': [
        { id: 'baqubah_center', name: 'Baqubah Center', nameAr: 'مركز بعقوبة', districtId: 'baqubah', isDefault: true },
        { id: 'khalis_old', name: 'Khalis Old', nameAr: 'الخالص القديمة', districtId: 'baqubah', isDefault: false }
      ],
      'tikrit': [
        { id: 'tikrit_center', name: 'Tikrit Center', nameAr: 'مركز تكريت', districtId: 'tikrit', isDefault: true },
        { id: 'samarra_old', name: 'Samarra Old', nameAr: 'سامراء القديمة', districtId: 'tikrit', isDefault: false }
      ],
      'ramadi': [
        { id: 'ramadi_center', name: 'Ramadi Center', nameAr: 'مركز الرمادي', districtId: 'ramadi', isDefault: true },
        { id: 'fallujah_old', name: 'Fallujah Old', nameAr: 'الفلوجة القديمة', districtId: 'ramadi', isDefault: false }
      ]
    },
    defaults: {
      governorate: '',
      district: '',
      area: ''
    }
  };

  // Initialize state with existing data or defaults
  const [governorates, setGovernorates] = useState(defaultIraqData.governorates);
  const [districts, setDistricts] = useState(defaultIraqData.districts);
  const [areas, setAreas] = useState(defaultIraqData.areas);
  const [defaults, setDefaults] = useState(defaultIraqData.defaults);
  
  // Ref to track if data has been initialized
  const isInitialized = useRef(false);
  
  // Filter states
  const [selectedGovernorateFilter, setSelectedGovernorateFilter] = useState(null);
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState(null);
  
  // Form states
  const [showAddGovernorate, setShowAddGovernorate] = useState(false);
  const [showAddDistrict, setShowAddDistrict] = useState(false);
  const [showAddArea, setShowAddArea] = useState(false);
  
  const [newGovernorateName, setNewGovernorateName] = useState('');
  const [newDistrictName, setNewDistrictName] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  // Edit states
  const [editingGovernorate, setEditingGovernorate] = useState(null);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [editingArea, setEditingArea] = useState(null);
  const [editGovernorateName, setEditGovernorateName] = useState('');
  const [editDistrictName, setEditDistrictName] = useState('');
  const [editAreaName, setEditAreaName] = useState('');

  // Load data on component mount only once
  useEffect(() => {
    if (!isInitialized.current) {
      console.log('Settings addressData:', settings.addressData);
      if (settings.addressData) {
        const addressData = settings.addressData;
        console.log('Using existing addressData:', addressData);
        
        setGovernorates(addressData.governorates || defaultIraqData.governorates);
        setDistricts(addressData.districts || defaultIraqData.districts);
        setAreas(addressData.areas || defaultIraqData.areas);
        setDefaults(addressData.defaults || defaultIraqData.defaults);
      } else {
        console.log('No existing addressData, initializing defaults');
        // Initialize with default data if none exists
        updateSettings({ addressData: defaultIraqData });
      }
      isInitialized.current = true;
    }
  }, []); // Empty dependency array - only run once

  // Manual save function
  const saveAddressData = useCallback(() => {
    if (governorates.length > 0) {
      const addressData = { governorates, districts, areas, defaults };
      console.log('Manually saving addressData:', addressData);
      updateSettings({ addressData });
    }
  }, [governorates, districts, areas, defaults, updateSettings]);

  const initializeDefaultData = useCallback(() => {
    setGovernorates(defaultIraqData.governorates);
    setDistricts(defaultIraqData.districts);
    setAreas(defaultIraqData.areas);
    setDefaults(defaultIraqData.defaults);
    updateSettings({ addressData: defaultIraqData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'Default Iraq address data initialized!' });
  }, [updateSettings, showFlashMessage]);

  const updateWithNewData = useCallback(() => {
    // Merge existing data with new default data
    const existingData = settings.addressData || {};
    const mergedData = {
      governorates: defaultIraqData.governorates,
      districts: { ...existingData.districts, ...defaultIraqData.districts },
      areas: { ...existingData.areas, ...defaultIraqData.areas },
      defaults: existingData.defaults || defaultIraqData.defaults
    };
    
    setGovernorates(mergedData.governorates);
    setDistricts(mergedData.districts);
    setAreas(mergedData.areas);
    setDefaults(mergedData.defaults);
    updateSettings({ addressData: mergedData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'Address data updated with new districts and areas!' });
  }, [settings.addressData, updateSettings, showFlashMessage]);

  const addGovernorate = useCallback(() => {
    if (!newGovernorateName.trim()) return;
    
    const newGovernorate = {
      id: Date.now().toString(),
      name: newGovernorateName.trim(),
      nameAr: newGovernorateName.trim(),
      isDefault: governorates.length === 0
    };
    
    const updatedGovernorates = [...governorates, newGovernorate];
    setGovernorates(updatedGovernorates);
    setNewGovernorateName('');
    setShowAddGovernorate(false);
    
    let updatedDefaults = { ...defaults };
    if (newGovernorate.isDefault) {
      updatedDefaults = { ...defaults, governorate: newGovernorate.id };
      setDefaults(updatedDefaults);
    }
    
    // Save immediately
    const addressData = { 
      governorates: updatedGovernorates, 
      districts, 
      areas, 
      defaults: updatedDefaults 
    };
    updateSettings({ addressData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'Governorate added successfully' });
  }, [newGovernorateName, governorates, districts, areas, defaults, updateSettings, showFlashMessage]);

  const updateGovernorate = useCallback((id, updates) => {
    const updatedGovernorates = governorates.map(g => g.id === id ? { ...g, ...updates } : g);
    setGovernorates(updatedGovernorates);
    setEditingGovernorate(null);
    setEditGovernorateName('');
    
    // Save immediately
    const addressData = { governorates: updatedGovernorates, districts, areas, defaults };
    updateSettings({ addressData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'Governorate updated successfully' });
  }, [governorates, districts, areas, defaults, updateSettings, showFlashMessage]);

  const deleteGovernorate = useCallback((id) => {
    const governorate = governorates.find(g => g.id === id);
    if (governorate.isDefault) {
      showFlashMessage({ type: 'error', title: 'Error', message: 'Cannot delete default governorate' });
      return;
    }
    
    const updatedGovernorates = governorates.filter(g => g.id !== id);
    setGovernorates(updatedGovernorates);
    
    const updatedDistricts = { ...districts };
    delete updatedDistricts[id];
    setDistricts(updatedDistricts);
    
    const updatedAreas = { ...areas };
    delete updatedAreas[id];
    setAreas(updatedAreas);
    
    // Save immediately
    const addressData = { 
      governorates: updatedGovernorates, 
      districts: updatedDistricts, 
      areas: updatedAreas, 
      defaults 
    };
    updateSettings({ addressData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'Governorate deleted successfully' });
  }, [governorates, districts, areas, defaults, updateSettings, showFlashMessage]);

  const setDefaultGovernorate = useCallback((id) => {
    // Optimize the state update to prevent lag
    setGovernorates(prev => 
      prev.map(g => ({ ...g, isDefault: g.id === id }))
    );
    setDefaults(prev => ({ ...prev, governorate: id }));
    
    // Save immediately after state update
    const updatedGovernorates = governorates.map(g => ({ ...g, isDefault: g.id === id }));
    const updatedDefaults = { ...defaults, governorate: id };
    const addressData = { 
      governorates: updatedGovernorates, 
      districts, 
      areas, 
      defaults: updatedDefaults 
    };
    updateSettings({ addressData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'Default governorate set successfully' });
  }, [governorates, districts, areas, defaults, updateSettings, showFlashMessage]);

  const addDistrict = useCallback(() => {
    if (!newDistrictName.trim() || !selectedGovernorate) return;
    
    const newDistrict = {
      id: Date.now().toString(),
      name: newDistrictName.trim(),
      nameAr: newDistrictName.trim(),
      governorateId: selectedGovernorate,
      isDefault: !districts[selectedGovernorate] || districts[selectedGovernorate].length === 0
    };
    
    const updatedDistricts = {
      ...districts,
      [selectedGovernorate]: [...(districts[selectedGovernorate] || []), newDistrict]
    };
    
    setDistricts(updatedDistricts);
    setNewDistrictName('');
    setSelectedGovernorate('');
    setShowAddDistrict(false);
    
    let updatedDefaults = { ...defaults };
    if (newDistrict.isDefault) {
      updatedDefaults = { ...defaults, district: newDistrict.id };
      setDefaults(updatedDefaults);
    }
    
    // Save immediately
    const addressData = { governorates, districts: updatedDistricts, areas, defaults: updatedDefaults };
    updateSettings({ addressData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'District added successfully' });
  }, [newDistrictName, selectedGovernorate, districts, governorates, areas, defaults, updateSettings, showFlashMessage]);

  const updateDistrict = useCallback((governorateId, districtId, updates) => {
    const updatedDistricts = {
      ...districts,
      [governorateId]: districts[governorateId].map(d => 
        d.id === districtId ? { ...d, ...updates } : d
      )
    };
    
    setDistricts(updatedDistricts);
    setEditingDistrict(null);
    setEditDistrictName('');
    
    // Save immediately
    const addressData = { governorates, districts: updatedDistricts, areas, defaults };
    updateSettings({ addressData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'District updated successfully' });
  }, [districts, governorates, areas, defaults, updateSettings, showFlashMessage]);

  const deleteDistrict = useCallback((governorateId, districtId) => {
    const district = districts[governorateId]?.find(d => d.id === districtId);
    if (district?.isDefault) {
      showFlashMessage({ type: 'error', title: 'Error', message: 'Cannot delete default district' });
      return;
    }
    
    const updatedDistricts = {
      ...districts,
      [governorateId]: districts[governorateId].filter(d => d.id !== districtId)
    };
    
    setDistricts(updatedDistricts);
    
    const updatedAreas = { ...areas };
    if (updatedAreas[districtId]) {
      delete updatedAreas[districtId];
    }
    setAreas(updatedAreas);
    
    // Save immediately
    const addressData = { governorates, districts: updatedDistricts, areas: updatedAreas, defaults };
    updateSettings({ addressData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'District deleted successfully' });
  }, [districts, areas, governorates, defaults, updateSettings, showFlashMessage]);

  const setDefaultDistrict = useCallback((governorateId, districtId) => {
    // Optimize the state update to prevent lag
    const updatedDistricts = {
      ...districts,
      [governorateId]: districts[governorateId].map(d => ({
        ...d,
        isDefault: d.id === districtId
      }))
    };
    
    const updatedDefaults = { ...defaults, district: districtId };
    
    setDistricts(updatedDistricts);
    setDefaults(updatedDefaults);
    
    // Save immediately
    const addressData = { governorates, districts: updatedDistricts, areas, defaults: updatedDefaults };
    updateSettings({ addressData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'Default district set successfully' });
  }, [districts, governorates, areas, defaults, updateSettings, showFlashMessage]);

  const addArea = useCallback(() => {
    if (!newAreaName.trim() || !selectedDistrict) return;
    
    const newArea = {
      id: Date.now().toString(),
      name: newAreaName.trim(),
      nameAr: newAreaName.trim(),
      districtId: selectedDistrict,
      isDefault: !areas[selectedDistrict] || areas[selectedDistrict].length === 0
    };
    
    const updatedAreas = {
      ...areas,
      [selectedDistrict]: [...(areas[selectedDistrict] || []), newArea]
    };
    
    setAreas(updatedAreas);
    setNewAreaName('');
    setSelectedDistrict('');
    setShowAddArea(false);
    
    let updatedDefaults = { ...defaults };
    if (newArea.isDefault) {
      updatedDefaults = { ...defaults, area: newArea.id };
      setDefaults(updatedDefaults);
    }
    
    // Save immediately
    const addressData = { governorates, districts, areas: updatedAreas, defaults: updatedDefaults };
    updateSettings({ addressData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'Area added successfully' });
  }, [newAreaName, selectedDistrict, areas, governorates, districts, defaults, updateSettings, showFlashMessage]);

  const updateArea = useCallback((districtId, areaId, updates) => {
    const updatedAreas = {
      ...areas,
      [districtId]: areas[districtId].map(a => 
        a.id === areaId ? { ...a, ...updates } : a
      )
    };
    
    setAreas(updatedAreas);
    setEditingArea(null);
    setEditAreaName('');
    
    // Save immediately
    const addressData = { governorates, districts, areas: updatedAreas, defaults };
    updateSettings({ addressData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'Area updated successfully' });
  }, [areas, governorates, districts, defaults, updateSettings, showFlashMessage]);

  const deleteArea = useCallback((districtId, areaId) => {
    const area = areas[districtId]?.find(a => a.id === areaId);
    if (area?.isDefault) {
      showFlashMessage({ type: 'error', title: 'Error', message: 'Cannot delete default area' });
      return;
    }
    
    const updatedAreas = {
      ...areas,
      [districtId]: areas[districtId].filter(a => a.id !== areaId)
    };
    
    setAreas(updatedAreas);
    
    // Save immediately
    const addressData = { governorates, districts, areas: updatedAreas, defaults };
    updateSettings({ addressData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'Area deleted successfully' });
  }, [areas, governorates, districts, defaults, updateSettings, showFlashMessage]);

  const setDefaultArea = useCallback((districtId, areaId) => {
    // Optimize the state update to prevent lag
    const updatedAreas = {
      ...areas,
      [districtId]: areas[districtId].map(a => ({
        ...a,
        isDefault: a.id === areaId
      }))
    };
    
    const updatedDefaults = { ...defaults, area: areaId };
    
    setAreas(updatedAreas);
    setDefaults(updatedDefaults);
    
    // Save immediately
    const addressData = { governorates, districts, areas: updatedAreas, defaults: updatedDefaults };
    updateSettings({ addressData });
    showFlashMessage({ type: 'success', title: 'Success', message: 'Default area set successfully' });
  }, [areas, governorates, districts, defaults, updateSettings, showFlashMessage]);

  const getDefaultGovernorate = useCallback(() => {
    return governorates.find(g => g.id === defaults.governorate);
  }, [governorates, defaults.governorate]);

  const getDefaultDistrict = useCallback(() => {
    const defaultGov = getDefaultGovernorate();
    if (!defaultGov) return null;
    return districts[defaultGov.id]?.find(d => d.id === defaults.district);
  }, [getDefaultGovernorate, districts, defaults.district]);

  const getDefaultArea = useCallback(() => {
    const defaultDistrict = getDefaultDistrict();
    if (!defaultDistrict) return null;
    return areas[defaultDistrict.id]?.find(a => a.id === defaults.area);
  }, [getDefaultDistrict, areas, defaults.area]);

  const startEditGovernorate = useCallback((governorate) => {
    setEditingGovernorate(governorate);
    setEditGovernorateName(governorate.name);
  }, []);

  const startEditDistrict = useCallback((district) => {
    setEditingDistrict(district);
    setEditDistrictName(district.name);
  }, []);

  const startEditArea = useCallback((area) => {
    setEditingArea(area);
    setEditAreaName(area.name);
  }, []);

  // Memoize computed values
  const governoratesList = useMemo(() => governorates, [governorates]);
  const districtsList = useMemo(() => Object.entries(districts), [districts]);
  const areasList = useMemo(() => Object.entries(areas), [areas]);
  const defaultGovernorate = useMemo(() => getDefaultGovernorate(), [getDefaultGovernorate]);
  const defaultDistrict = useMemo(() => getDefaultDistrict(), [getDefaultDistrict]);
  const defaultArea = useMemo(() => getDefaultArea(), [getDefaultArea]);

  // Filtered data based on selections
  const filteredDistricts = useMemo(() => {
    console.log('Filtering districts. Selected governorate:', selectedGovernorateFilter);
    console.log('All districts:', districtsList);
    if (!selectedGovernorateFilter) {
      console.log('No governorate filter, showing all districts');
      return districtsList;
    }
    const filtered = districtsList.filter(([governorateId]) => governorateId === selectedGovernorateFilter);
    console.log('Filtered districts:', filtered);
    return filtered;
  }, [districtsList, selectedGovernorateFilter]);

  const filteredAreas = useMemo(() => {
    console.log('Filtering areas. Selected district:', selectedDistrictFilter, 'Selected governorate:', selectedGovernorateFilter);
    console.log('All areas:', areasList);
    if (!selectedDistrictFilter) {
      // If no district filter, show areas from the selected governorate's districts
      if (selectedGovernorateFilter) {
        const governorateDistricts = districts[selectedGovernorateFilter] || [];
        const districtIds = governorateDistricts.map(d => d.id);
        console.log('Governorate districts:', governorateDistricts);
        console.log('District IDs:', districtIds);
        const filtered = areasList.filter(([districtId]) => districtIds.includes(districtId));
        console.log('Filtered areas by governorate:', filtered);
        return filtered;
      }
      console.log('No filters, showing all areas');
      return areasList;
    }
    const filtered = areasList.filter(([districtId]) => districtId === selectedDistrictFilter);
    console.log('Filtered areas by district:', filtered);
    return filtered;
  }, [areasList, selectedDistrictFilter, selectedGovernorateFilter, districts]);

  // Get governorate name by ID
  const getGovernorateName = useCallback((governorateId) => {
    return governorates.find(g => g.id === governorateId)?.name || 'Unknown';
  }, [governorates]);

  // Get district name by ID
  const getDistrictName = useCallback((districtId) => {
    const district = Object.values(districts).flat().find(d => d.id === districtId);
    return district?.name || 'Unknown';
  }, [districts]);

  // Handle governorate selection
  const handleGovernorateClick = useCallback((governorateId) => {
    console.log('Governorate clicked:', governorateId);
    console.log('Current filter:', selectedGovernorateFilter);
    if (selectedGovernorateFilter === governorateId) {
      setSelectedGovernorateFilter(null);
      setSelectedDistrictFilter(null);
    } else {
      setSelectedGovernorateFilter(governorateId);
      setSelectedDistrictFilter(null);
    }
  }, [selectedGovernorateFilter]);

  // Handle district selection
  const handleDistrictClick = useCallback((districtId) => {
    console.log('District clicked:', districtId);
    console.log('Current filter:', selectedDistrictFilter);
    if (selectedDistrictFilter === districtId) {
      setSelectedDistrictFilter(null);
    } else {
      setSelectedDistrictFilter(districtId);
    }
  }, [selectedDistrictFilter]);

  return (
    <Container>
      <Header>
        <FaMapMarkerAlt size={24} color="#667eea" />
        <div>
          <Title>{t('settings.addressManagement.title') || 'Address Management'}</Title>
          <Subtitle>
            {t('settings.addressManagement.subtitle') || 'Manage governorates, districts, and areas for patient registration'}
          </Subtitle>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
            Data Status: {governorates.length} governorates, {Object.keys(districts).length} governorates with districts
            {selectedGovernorateFilter && (
              <span style={{ marginLeft: '1rem', color: '#667eea' }}>
                • Filtered by: {getGovernorateName(selectedGovernorateFilter)}
                {selectedDistrictFilter && ` > ${getDistrictName(selectedDistrictFilter)}`}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(selectedGovernorateFilter || selectedDistrictFilter) && (
            <GlowButton
              onClick={() => {
                setSelectedGovernorateFilter(null);
                setSelectedDistrictFilter(null);
              }}
              variant="secondary"
              size="small"
            >
              Clear Filters
            </GlowButton>
          )}
          {governorates.length === 0 && (
            <GlowButton
              onClick={initializeDefaultData}
              variant="secondary"
              size="small"
            >
              Initialize Default Data
            </GlowButton>
          )}
          {governorates.length > 0 && (
            <GlowButton
              onClick={updateWithNewData}
              variant="secondary"
              size="small"
            >
              {t('settings.addressManagement.updateWithNewData') || 'Update with New Data'}
            </GlowButton>
          )}
        </div>
      </Header>

      <Grid>
        {/* Governorates Section */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FaGlobe />
              {t('settings.addressManagement.governorates') || 'Governorates'}
            </SectionTitle>
            <GlowButton
              onClick={() => setShowAddGovernorate(true)}
              variant="secondary"
              size="small"
            >
              <FaPlus />
              {t('settings.addressManagement.add') || 'Add'}
            </GlowButton>
          </SectionHeader>

          <ItemList>
            {governoratesList.map(governorate => (
              <Item
                key={governorate.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGovernorateClick(governorate.id);
                }}
                className={selectedGovernorateFilter === governorate.id ? 'selected' : ''}
              >
                {editingGovernorate?.id === governorate.id ? (
                  <FormRow>
                    <Input
                      value={editGovernorateName}
                      onChange={(e) => setEditGovernorateName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && updateGovernorate(governorate.id, { name: editGovernorateName, nameAr: editGovernorateName })}
                    />
                    <GlowButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateGovernorate(governorate.id, { name: editGovernorateName, nameAr: editGovernorateName });
                      }}
                      size="small"
                    >
                      <FaSave />
                    </GlowButton>
                    <GlowButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGovernorate(null);
                        setEditGovernorateName('');
                      }}
                      variant="secondary"
                      size="small"
                    >
                      <FaTimes />
                    </GlowButton>
                  </FormRow>
                ) : (
                  <>
                    <ItemInfo>
                      <ItemName>{governorate.nameAr}</ItemName>
                      {governorate.isDefault && (
                        <DefaultBadge>
                          <FaStar />
                          {t('settings.addressManagement.default') || 'Default'}
                        </DefaultBadge>
                      )}
                    </ItemInfo>
                    <ItemActions>
                      <ActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setDefaultGovernorate(governorate.id);
                        }}
                        className="default"
                        title={t('settings.addressManagement.setDefault') || 'Set as Default'}
                      >
                        <FaStarOfLife />
                      </ActionButton>
                      <ActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditGovernorate(governorate);
                        }}
                        title={t('settings.addressManagement.edit') || 'Edit'}
                      >
                        <FaEdit />
                      </ActionButton>
                      <ActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGovernorate(governorate.id);
                        }}
                        className="delete"
                        title={t('settings.addressManagement.delete') || 'Delete'}
                      >
                        <FaTrash />
                      </ActionButton>
                    </ItemActions>
                  </>
                )}
              </Item>
            ))}
          </ItemList>

          <AnimatePresence>
            {showAddGovernorate && (
              <AddForm
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <FormRow>
                  <Input
                    placeholder={t('settings.addressManagement.governorateName') || 'Governorate name'}
                    value={newGovernorateName}
                    onChange={(e) => setNewGovernorateName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addGovernorate()}
                  />
                  <GlowButton onClick={addGovernorate} size="small">
                    <FaSave />
                  </GlowButton>
                  <GlowButton
                    onClick={() => {
                      setShowAddGovernorate(false);
                      setNewGovernorateName('');
                    }}
                    variant="secondary"
                    size="small"
                  >
                    <FaTimes />
                  </GlowButton>
                </FormRow>
              </AddForm>
            )}
          </AnimatePresence>
        </Section>

        {/* Districts Section */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FaCity />
              {t('settings.addressManagement.districts') || 'Districts'}
            </SectionTitle>
            <GlowButton
              onClick={() => setShowAddDistrict(true)}
              variant="secondary"
              size="small"
            >
              <FaPlus />
              {t('settings.addressManagement.add') || 'Add'}
            </GlowButton>
          </SectionHeader>

          <ItemList>
            {!selectedGovernorateFilter ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem'
              }}>
                اضغط على محافظة لعرض الأقضية الخاصة بها
              </div>
            ) : filteredDistricts.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem'
              }}>
                لا توجد أقضية للمحافظة المختارة
              </div>
            ) : (
              filteredDistricts.map(([governorateId, districtList]) => {
                const governorate = governorates.find(g => g.id === governorateId);
                return districtList.map(district => (
                  <Item 
                    key={district.id}
                    onClick={() => handleDistrictClick(district.id)}
                    className={selectedDistrictFilter === district.id ? 'selected' : ''}
                  >
                    {editingDistrict?.id === district.id ? (
                      <FormRow>
                        <Input
                          value={editDistrictName}
                          onChange={(e) => setEditDistrictName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && updateDistrict(governorateId, district.id, { name: editDistrictName, nameAr: editDistrictName })}
                        />
                        <GlowButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDistrict(governorateId, district.id, { name: editDistrictName, nameAr: editDistrictName });
                          }}
                          size="small"
                        >
                          <FaSave />
                        </GlowButton>
                        <GlowButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDistrict(null);
                            setEditDistrictName('');
                          }}
                          variant="secondary"
                          size="small"
                        >
                          <FaTimes />
                        </GlowButton>
                      </FormRow>
                    ) : (
                      <>
                        <ItemInfo>
                          <ItemName>
                            {district.nameAr}
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                              {' '}({governorate?.nameAr})
                            </span>
                          </ItemName>
                          {district.isDefault && (
                            <DefaultBadge>
                              <FaStar />
                              {t('settings.addressManagement.default') || 'Default'}
                            </DefaultBadge>
                          )}
                        </ItemInfo>
                        <ItemActions>
                          <ActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setDefaultDistrict(governorateId, district.id);
                            }}
                            className="default"
                            title={t('settings.addressManagement.setDefault') || 'Set as Default'}
                          >
                            <FaStarOfLife />
                          </ActionButton>
                          <ActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditDistrict(district);
                            }}
                            title={t('settings.addressManagement.edit') || 'Edit'}
                          >
                            <FaEdit />
                          </ActionButton>
                          <ActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDistrict(governorateId, district.id);
                            }}
                            className="delete"
                            title={t('settings.addressManagement.delete') || 'Delete'}
                          >
                            <FaTrash />
                          </ActionButton>
                        </ItemActions>
                      </>
                    )}
                  </Item>
                ));
              })
            )}
          </ItemList>

          <AnimatePresence>
            {showAddDistrict && (
              <AddForm
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <FormRow>
                  <Select
                    value={selectedGovernorate}
                    onChange={(e) => setSelectedGovernorate(e.target.value)}
                  >
                    <option value="">{t('settings.addressManagement.selectGovernorate') || 'Select Governorate'}</option>
                    {governorates.map(g => (
                      <option key={g.id} value={g.id}>{g.nameAr}</option>
                    ))}
                  </Select>
                </FormRow>
                <FormRow>
                  <Input
                    placeholder={t('settings.addressManagement.districtName') || 'District name'}
                    value={newDistrictName}
                    onChange={(e) => setNewDistrictName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addDistrict()}
                  />
                  <GlowButton onClick={addDistrict} size="small">
                    <FaSave />
                  </GlowButton>
                  <GlowButton
                    onClick={() => {
                      setShowAddDistrict(false);
                      setNewDistrictName('');
                      setSelectedGovernorate('');
                    }}
                    variant="secondary"
                    size="small"
                  >
                    <FaTimes />
                  </GlowButton>
                </FormRow>
              </AddForm>
            )}
          </AnimatePresence>
        </Section>

        {/* Areas Section */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FaBuilding />
              {t('settings.addressManagement.areas') || 'Areas'}
            </SectionTitle>
            <GlowButton
              onClick={() => setShowAddArea(true)}
              variant="secondary"
              size="small"
            >
              <FaPlus />
              {t('settings.addressManagement.add') || 'Add'}
            </GlowButton>
          </SectionHeader>

          <ItemList>
            {filteredAreas.map(([districtId, areaList]) => {
              const district = Object.values(districts).flat().find(d => d.id === districtId);
              const governorate = district ? governorates.find(g => g.id === district.governorateId) : null;
              return areaList.map(area => (
                <Item key={area.id}>
                  {editingArea?.id === area.id ? (
                    <FormRow>
                      <Input
                        value={editAreaName}
                        onChange={(e) => setEditAreaName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && updateArea(districtId, area.id, { name: editAreaName, nameAr: editAreaName })}
                      />
                      <GlowButton 
                        onClick={() => updateArea(districtId, area.id, { name: editAreaName, nameAr: editAreaName })}
                        size="small"
                      >
                        <FaSave />
                      </GlowButton>
                      <GlowButton
                        onClick={() => {
                          setEditingArea(null);
                          setEditAreaName('');
                        }}
                        variant="secondary"
                        size="small"
                      >
                        <FaTimes />
                      </GlowButton>
                    </FormRow>
                  ) : (
                    <>
                      <ItemInfo>
                        <ItemName>
                          {area.nameAr}
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                            {' '}({district?.nameAr}, {governorate?.nameAr})
                          </span>
                        </ItemName>
                        {area.isDefault && (
                          <DefaultBadge>
                            <FaStar />
                            {t('settings.addressManagement.default') || 'Default'}
                          </DefaultBadge>
                        )}
                      </ItemInfo>
                      <ItemActions>
                        <ActionButton
                          onClick={() => setDefaultArea(districtId, area.id)}
                          className="default"
                          title={t('settings.addressManagement.setDefault') || 'Set as Default'}
                        >
                          <FaStarOfLife />
                        </ActionButton>
                        <ActionButton
                          onClick={() => startEditArea(area)}
                          title={t('settings.addressManagement.edit') || 'Edit'}
                        >
                          <FaEdit />
                        </ActionButton>
                        <ActionButton
                          onClick={() => deleteArea(districtId, area.id)}
                          className="delete"
                          title={t('settings.addressManagement.delete') || 'Delete'}
                        >
                          <FaTrash />
                        </ActionButton>
                      </ItemActions>
                    </>
                  )}
                </Item>
              ));
            })}
          </ItemList>

          <AnimatePresence>
            {showAddArea && (
              <AddForm
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <FormRow>
                  <Select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    <option value="">{t('settings.addressManagement.selectDistrict') || 'Select District'}</option>
                    {Object.entries(districts).map(([governorateId, districtList]) => {
                      const governorate = governorates.find(g => g.id === governorateId);
                      return districtList.map(district => (
                        <option key={district.id} value={district.id}>
                          {district.nameAr} ({governorate?.nameAr})
                        </option>
                      ));
                    })}
                  </Select>
                </FormRow>
                <FormRow>
                  <Input
                    placeholder={t('settings.addressManagement.areaName') || 'Area name'}
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addArea()}
                  />
                  <GlowButton onClick={addArea} size="small">
                    <FaSave />
                  </GlowButton>
                  <GlowButton
                    onClick={() => {
                      setShowAddArea(false);
                      setNewAreaName('');
                      setSelectedDistrict('');
                    }}
                    variant="secondary"
                    size="small"
                  >
                    <FaTimes />
                  </GlowButton>
                </FormRow>
              </AddForm>
            )}
          </AnimatePresence>
        </Section>
      </Grid>

      {/* Defaults Section */}
      <DefaultsSection>
        <SectionHeader>
          <SectionTitle>
            <FaStar />
            {t('settings.addressManagement.defaults') || 'Default Address Settings'}
          </SectionTitle>
        </SectionHeader>
        
        <DefaultsGrid>
          <DefaultItem>
            <DefaultLabel>{t('settings.addressManagement.defaultGovernorate') || 'Default Governorate'}</DefaultLabel>
            <DefaultValue>
              {defaultGovernorate?.nameAr || t('settings.addressManagement.notSet') || 'Not set'}
            </DefaultValue>
          </DefaultItem>
          
          <DefaultItem>
            <DefaultLabel>{t('settings.addressManagement.defaultDistrict') || 'Default District'}</DefaultLabel>
            <DefaultValue>
              {defaultDistrict?.nameAr || t('settings.addressManagement.notSet') || 'Not set'}
            </DefaultValue>
          </DefaultItem>
          
          <DefaultItem>
            <DefaultLabel>{t('settings.addressManagement.defaultArea') || 'Default Area'}</DefaultLabel>
            <DefaultValue>
              {defaultArea?.nameAr || t('settings.addressManagement.notSet') || 'Not set'}
            </DefaultValue>
          </DefaultItem>
        </DefaultsGrid>
      </DefaultsSection>
    </Container>
  );
};

export default AddressManagement; 