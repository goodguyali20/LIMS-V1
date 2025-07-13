import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import { TestContext, departmentColors } from './TestContextBase.js';

// Re-export useTestCatalog and departmentColors for direct imports
export { useTestCatalog, departmentColors } from './TestContextBase.js';

export function TestProvider({ children }) {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoized test catalog for performance
  const testCatalog = useMemo(() => {
    return labTests.reduce((acc, test) => {
      acc[test.id] = test;
      return acc;
    }, {});
  }, [labTests]);

  useEffect(() => {
    const testsQuery = query(collection(db, "labTests"), orderBy("name"));
    const unsubscribe = onSnapshot(testsQuery, (snapshot) => {
      const testsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLabTests(testsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tests:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const addTest = useCallback(async (testData) => {
    try {
      const docRef = await addDoc(collection(db, "labTests"), {
        ...testData,
        createdAt: new Date()
      });
      toast.success('Test added successfully!');
      return docRef;
    } catch (error) {
      console.error('Error adding test:', error);
      toast.error('Failed to add test');
      throw error;
    }
  }, []);

  const updateTest = useCallback(async (testId, testData) => {
    try {
      await updateDoc(doc(db, "labTests", testId), {
        ...testData,
        updatedAt: new Date()
      });
      toast.success('Test updated successfully!');
    } catch (error) {
      console.error('Error updating test:', error);
      toast.error('Failed to update test');
      throw error;
    }
  }, []);

  const deleteTest = useCallback(async (testId) => {
    try {
      await deleteDoc(doc(db, "labTests", testId));
      toast.success('Test deleted successfully!');
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error('Failed to delete test');
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    labTests,
    testCatalog,
    loading,
    addTest,
    updateTest,
    deleteTest,
    departmentColors
  }), [labTests, testCatalog, loading, addTest, updateTest, deleteTest]);

  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
}