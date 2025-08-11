import React, { createContext, useContext, useState, useEffect } from 'react';

const TestSelectionContext = createContext();

export const useTestSelection = () => {
  const context = useContext(TestSelectionContext);
  if (!context) {
    throw new Error('useTestSelection must be used within a TestSelectionProvider');
  }
  return context;
};

export const TestSelectionProvider = ({ children }) => {
  const [selectedTestIds, setSelectedTestIds] = useState([]);

  // Load selected tests from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('smartlab-selected-tests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedTestIds(parsed);
        }
      } catch (e) {
        console.error('Error loading saved test selection:', e);
      }
    }
  }, []);

  // Save selected tests to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('smartlab-selected-tests', JSON.stringify(selectedTestIds));
  }, [selectedTestIds]);

  const toggleTestSelection = (testId) => {
    setSelectedTestIds(prev => {
      const exists = prev.includes(testId);
      if (exists) {
        return prev.filter(id => id !== testId);
      } else {
        return [...prev, testId];
      }
    });
  };

  const clearSelection = () => {
    setSelectedTestIds([]);
  };

  const setSelectedTests = (testIds) => {
    if (Array.isArray(testIds)) {
      setSelectedTestIds(testIds);
    }
  };

  const value = {
    selectedTestIds,
    toggleTestSelection,
    clearSelection,
    setSelectedTests
  };

  return (
    <TestSelectionContext.Provider value={value}>
      {children}
    </TestSelectionContext.Provider>
  );
};
