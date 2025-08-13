import { useState, useEffect, useMemo, useCallback } from 'react';
import { getFilteredNames, saveNameToFirebase, getNamesFromFirebase } from '../utils/patient/iraqiNamesData';
import { db } from '../firebase/config';

export const useIraqiNames = (inputValue, nameType) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseNames, setFirebaseNames] = useState([]);

  // Fetch names from Firebase on component mount
  useEffect(() => {
    const fetchFirebaseNames = async () => {
      try {
        const names = await getNamesFromFirebase(nameType, db);
        setFirebaseNames(names);
      } catch (error) {
        console.error('Error fetching Firebase names:', error);
      }
    };

    if (nameType) {
      fetchFirebaseNames();
    }
  }, [nameType]);

  // Memoized filtered suggestions combining local and Firebase names
  const filteredSuggestions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) {
      return [];
    }
    
    // Get local suggestions
    const localSuggestions = getFilteredNames(inputValue, nameType);
    
    // Get Firebase suggestions
    const firebaseSuggestions = firebaseNames
      .filter(item => item.name.toLowerCase().includes(inputValue.toLowerCase()))
      .map(item => item.name)
      .slice(0, 5); // Limit Firebase suggestions
    
    // Combine and deduplicate
    const combined = [...new Set([...localSuggestions, ...firebaseSuggestions])];
    
    return combined.slice(0, 10); // Total limit of 10
  }, [inputValue, nameType, firebaseNames]);

  // Update suggestions when input changes
  useEffect(() => {
    if (inputValue && inputValue.length >= 2) {
      setIsLoading(true);
      
      // Simulate API delay for better UX
      const timer = setTimeout(() => {
        setSuggestions(filteredSuggestions);
        setIsLoading(false);
      }, 150);
      
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [filteredSuggestions, inputValue]);

  // Function to save a new name to Firebase
  const saveNewName = useCallback(async (name) => {
    if (!name || name.trim().length < 2) return false;
    
    try {
      const success = await saveNameToFirebase(name.trim(), nameType, db);
      if (success) {
        // Refresh Firebase names
        const names = await getNamesFromFirebase(nameType, db);
        setFirebaseNames(names);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving new name:', error);
      return false;
    }
  }, [nameType]);

  return {
    suggestions,
    isLoading,
    hasSuggestions: suggestions.length > 0,
    saveNewName,
    firebaseNames
  };
};

// Hook for first names (gender-aware)
export const useFirstNameSuggestions = (inputValue, gender = null) => {
  // Always call hooks in the same order
  const maleResult = useIraqiNames(inputValue, 'maleFirstNames');
  const femaleResult = useIraqiNames(inputValue, 'femaleFirstNames');
  
  // Determine which result to return based on gender
  if (gender === 'female') {
    return femaleResult;
  } else if (gender === 'male') {
    return maleResult;
  } else {
    // Gender not set, combine both results
    return {
      suggestions: [...maleResult.suggestions, ...femaleResult.suggestions].slice(0, 10),
      isLoading: maleResult.isLoading || femaleResult.isLoading,
      hasSuggestions: maleResult.hasSuggestions || femaleResult.hasSuggestions,
      saveNewName: async (name) => {
        // Try to save to male names first, then female if that fails
        const maleSuccess = await maleResult.saveNewName(name);
        if (maleSuccess) return true;
        return await femaleResult.saveNewName(name);
      },
      firebaseNames: [...maleResult.firebaseNames, ...femaleResult.firebaseNames]
    };
  }
};

// Hook for father and grandfather names (unified pool)
export const useFatherNameSuggestions = (inputValue) => {
  // Use the unified 'names' pool for father names
  return useIraqiNames(inputValue, 'names');
};

export const useGrandfatherNameSuggestions = (inputValue) => {
  // Use the unified 'names' pool for grandfather names
  return useIraqiNames(inputValue, 'names');
}; 