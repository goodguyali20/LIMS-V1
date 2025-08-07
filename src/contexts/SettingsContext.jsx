import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SettingsContext } from './SettingsContextBase.js';

// Re-export useSettings for direct imports
export { useSettings } from './SettingsContextBase.js';

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    hospitalName: 'مستشفى العزيزية العام',
    hospitalAddress: 'Kut, Wasit Governorate, Iraq',
    hospitalPhone: 'N/A',
    hospitalEmail: '',
    hospitalWebsite: '',
    labDirector: '',
    labPhone: '',
    labEmail: '',
    reportHeader: '',
    reportFooter: '',
    // System settings
    darkMode: false,
    notifications: true,
    multiLanguage: true,
    soundEffects: false,
    showWorkflowJourney: true,
    // Security settings
    twoFactorAuth: false,
    sessionTimeout: true,
    auditLogging: true,
    // Backup settings
    autoBackup: true,
    backupFrequency: 'daily',
    // Print settings
    defaultPrinter: '',
    printQuality: 'high',
    // Advanced settings
    apiEnabled: false,
    debugMode: false,
    performanceMode: false,
    // Address Data for Iraq
    addressData: {
      governorates: [
        { id: 'baghdad', name: 'Baghdad', nameAr: 'بغداد', isDefault: false },
        { id: 'basra', name: 'Basra', nameAr: 'البصرة', isDefault: false },
        { id: 'mosul', name: 'Mosul', nameAr: 'الموصل', isDefault: false },
        { id: 'erbil', name: 'Erbil', nameAr: 'أربيل', isDefault: false },
        { id: 'sulaymaniyah', name: 'Sulaymaniyah', nameAr: 'السليمانية', isDefault: false },
        { id: 'kirkuk', name: 'Kirkuk', nameAr: 'كركوك', isDefault: false },
        { id: 'najaf', name: 'Najaf', nameAr: 'النجف', isDefault: false },
        { id: 'karbala', name: 'Karbala', nameAr: 'كربلاء', isDefault: false },
        { id: 'wasit', name: 'Wasit', nameAr: 'واسط', isDefault: true },
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
          { id: 'rusafa', name: 'Rusafa', nameAr: 'الرصافة', governorateId: 'baghdad', isDefault: false }
        ],
        'basra': [
          { id: 'basra_central', name: 'Basra Central', nameAr: 'البصرة المركز', governorateId: 'basra', isDefault: true },
          { id: 'shatt_al_arab', name: 'Shatt al-Arab', nameAr: 'شط العرب', governorateId: 'basra', isDefault: false }
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
          { id: 'kufa', name: 'Kufa', nameAr: 'الكوفة', governorateId: 'najaf', isDefault: false }
        ],
        'karbala': [
          { id: 'karbala_central', name: 'Karbala Central', nameAr: 'كربلاء المركز', governorateId: 'karbala', isDefault: true },
          { id: 'ain_al_tamur', name: 'Ain al-Tamur', nameAr: 'عين التمر', governorateId: 'karbala', isDefault: false }
        ]
      },
      areas: {
        'baghdad_central': [
          { id: 'karrada', name: 'Karrada', nameAr: 'الكرادة', districtId: 'baghdad_central', isDefault: true },
          { id: 'mansour', name: 'Mansour', nameAr: 'المنصور', districtId: 'baghdad_central', isDefault: false }
        ],
        'kut': [
          { id: 'kut_center', name: 'Kut Center', nameAr: 'مركز الكوت', districtId: 'kut', isDefault: true },
          { id: 'kut_old', name: 'Kut Old', nameAr: 'الكوت القديمة', districtId: 'kut', isDefault: false }
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
        'basra_central': [
          { id: 'ashar', name: 'Ashar', nameAr: 'عشار', districtId: 'basra_central', isDefault: true },
          { id: 'basra_old', name: 'Basra Old', nameAr: 'البصرة القديمة', districtId: 'basra_central', isDefault: false }
        ]
      },
      defaults: {
        governorate: 'wasit',
        district: 'kut',
        area: 'kut_center'
      }
    },
    // Patient Registration Field Configuration
    patientRegistrationFields: {
      // Personal Information
      firstName: { required: true, enabled: true, label: 'First Name' },
      fathersName: { required: true, enabled: true, label: 'Father\'s Name', labelAr: 'اسم الأب' },
      grandFathersName: { required: true, enabled: true, label: 'Grandfather\'s Name', labelAr: 'اسم الجد' },
      age: { required: true, enabled: true, label: 'Age' },
      gender: { required: true, enabled: true, label: 'Gender' },
      phoneNumber: { required: true, enabled: true, label: 'Phone Number' },
      email: { required: false, enabled: true, label: 'Email' },
      
      // Address Information
      address: {
        governorate: { required: true, enabled: true, label: 'المحافظة' },
        district: { required: true, enabled: true, label: 'القضاء' },
        area: { required: true, enabled: true, label: 'المنطقة' },
        landmark: { required: false, enabled: true, label: 'اقرب نقطة دالة' },
        city: { required: false, enabled: false, label: 'City' }
      },
      
      // Default Location Settings
      defaultLocation: {
        governorate: { value: 'واسط', enabled: true, label: 'المحافظة الافتراضية' },
        district: { value: 'الكوت', enabled: true, label: 'القضاء الافتراضي' },
        area: { value: 'الكوت', enabled: true, label: 'المنطقة الافتراضية' }
      },
      
      // Emergency Contact
      emergencyContact: {
        name: { required: true, enabled: true, label: 'Emergency Contact Name' },
        relationship: { required: true, enabled: true, label: 'Relationship' },
        phoneNumber: { required: true, enabled: true, label: 'Emergency Contact Phone' }
      },
      
      // Medical History
      medicalHistory: {
        allergies: { required: false, enabled: true, label: 'Allergies' },
        medications: { required: false, enabled: true, label: 'Current Medications' },
        conditions: { required: false, enabled: true, label: 'Medical Conditions' },
        notes: { required: false, enabled: true, label: 'Additional Notes' }
      },
      
      // Insurance Information
      insurance: {
        provider: { required: false, enabled: true, label: 'Insurance Provider' },
        policyNumber: { required: false, enabled: true, label: 'Policy Number' },
        groupNumber: { required: false, enabled: true, label: 'Group Number' }
      }
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      // We'll store all settings in a single document for simplicity
      const docRef = doc(db, 'settings', 'general');
      
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fetchedSettings = docSnap.data();
          // Migration: Convert dateOfBirth to age if needed
          if (fetchedSettings.patientRegistrationFields?.dateOfBirth && !fetchedSettings.patientRegistrationFields?.age) {
            fetchedSettings.patientRegistrationFields.age = fetchedSettings.patientRegistrationFields.dateOfBirth;
            delete fetchedSettings.patientRegistrationFields.dateOfBirth;
            // Update the database with migrated settings
            await setDoc(docRef, fetchedSettings);
            console.log('Migrated dateOfBirth to age field');
          }
          // Force label for age field
          if (fetchedSettings.patientRegistrationFields?.age) {
            fetchedSettings.patientRegistrationFields.age.label = 'Age';
          }
          
          // Migration: Remove lastName field if it exists
          if (fetchedSettings.patientRegistrationFields?.lastName) {
            delete fetchedSettings.patientRegistrationFields.lastName;
            // Update the database with migrated settings
            await setDoc(docRef, fetchedSettings);
            console.log('Migrated: Removed lastName field');
          }
          
          // Merge with default settings to ensure all fields exist
          setSettings(prev => ({ ...prev, ...fetchedSettings }));
        } else {
          // Create default settings if they don't exist
          await setDoc(docRef, settings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      const docRef = doc(db, 'settings', 'general');
      const updatedSettings = { ...settings, ...newSettings };
      await setDoc(docRef, updatedSettings);
      setSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }, [settings]);

  const saveSettings = useCallback(async (newSettings) => {
    return updateSettings(newSettings);
  }, [updateSettings]);

  const resetToDefaults = useCallback(async () => {
    try {
      const docRef = doc(db, 'settings', 'general');
      await setDoc(docRef, settings);
      setSettings(settings);
      console.log('Reset settings to defaults');
      return true;
    } catch (error) {
      console.error('Error resetting settings:', error);
      return false;
    }
  }, [settings]);

  const value = {
    settings,
    loading,
    updateSettings,
    saveSettings,
    resetToDefaults,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};