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
          setSettings(docSnap.data());
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

  const saveSettings = useCallback(async (newSettings) => {
    try {
      const docRef = doc(db, 'settings', 'general');
      await setDoc(docRef, newSettings);
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }, []);

  const value = {
    settings,
    loading,
    saveSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};