import { useState, useEffect, useMemo } from 'react';
import { getFilteredNames } from '../utils/iraqiNamesData';

export const useIraqiNames = (inputValue, nameType) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Memoized filtered suggestions
  const filteredSuggestions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) {
      return [];
    }
    
    return getFilteredNames(inputValue, nameType);
  }, [inputValue, nameType]);

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

  return {
    suggestions,
    isLoading,
    hasSuggestions: suggestions.length > 0
  };
};

// Hook for specific name types
export const useFirstNameSuggestions = (inputValue, gender = null) => {
  const nameType = gender === 'female' ? 'femaleFirstNames' : 'maleFirstNames';
  return useIraqiNames(inputValue, nameType);
};

export const useLastNameSuggestions = (inputValue) => {
  return useIraqiNames(inputValue, 'lastNames');
};

export const useFatherNameSuggestions = (inputValue) => {
  return useIraqiNames(inputValue, 'fatherNames');
};

export const useGrandfatherNameSuggestions = (inputValue) => {
  return useIraqiNames(inputValue, 'grandfatherNames');
}; 