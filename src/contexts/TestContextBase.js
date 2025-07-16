import { createContext, useContext } from 'react';

export const departmentColors = {
  Chemistry: '#ffc107',
  Hematology: '#dc3545',
  Serology: '#28a745',
  Virology: '#ffc107',
  Microbiology: '#6f42c1',
  General: '#6c757d',
  Immunology: '#007bff',
};

export const TestContext = createContext();
export function useTestCatalog() {
  return useContext(TestContext);
} 