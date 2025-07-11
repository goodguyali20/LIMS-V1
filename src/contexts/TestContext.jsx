import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

// Define the department colors here so they are available globally
export const departmentColors = {
    Chemistry: '#007bff',
    Hematology: '#dc3545',
    Serology: '#28a745',
    Virology: '#ffc107',
    Microbiology: '#6f42c1',
    General: '#6c757d',
};

const TestContext = createContext();

export function useTestCatalog() {
  return useContext(TestContext);
}

export function TestProvider({ children }) {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "labTests"), (snapshot) => {
      const testsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLabTests(testsData);
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const value = {
    labTests,
    loadingTests: loading,
    departmentColors
  };

  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
}