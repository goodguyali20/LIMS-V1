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
    // Patient Registration Field Configuration
    patientRegistrationFields: {
      // Personal Information
      firstName: { required: true, enabled: true, label: 'First Name' },
      lastName: { required: true, enabled: true, label: 'Last Name' },
      age: { required: true, enabled: true, label: 'Age' },
      gender: { required: true, enabled: true, label: 'Gender' },
      phoneNumber: { required: true, enabled: true, label: 'Phone Number' },
      email: { required: false, enabled: true, label: 'Email' },
      
      // Address Information
      address: {
        street: { required: true, enabled: true, label: 'Street Address' },
        city: { required: true, enabled: true, label: 'City' },
        state: { required: true, enabled: true, label: 'State' },
        zipCode: { required: true, enabled: true, label: 'ZIP Code' },
        country: { required: false, enabled: true, label: 'Country' }
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

  const value = {
    settings,
    loading,
    updateSettings,
    saveSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};