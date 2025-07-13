import { createContext, useContext } from 'react';

export const departmentColors = {
  Chemistry: '#007bff',
  Hematology: '#dc3545',
  Serology: '#28a745',
  Virology: '#ffc107',
  Microbiology: '#6f42c1',
  General: '#6c757d',
};

export const TestContext = createContext();
export function useTestCatalog() {
  return useContext(TestContext);
} 