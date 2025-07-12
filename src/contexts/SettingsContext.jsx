import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

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
      const docRef = doc(db, 'settings', 'main');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSettings(prev => ({...prev, ...docSnap.data()}));
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    setLoading(true);
    const docRef = doc(db, 'settings', 'main');
    try {
      await setDoc(docRef, newSettings, { merge: true });
      setSettings(prev => ({...prev, ...newSettings}));
    } catch (error) {
      console.error("Failed to update settings: ", error);
    }
    setLoading(false);
  };

  const value = {
    settings,
    loading,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};