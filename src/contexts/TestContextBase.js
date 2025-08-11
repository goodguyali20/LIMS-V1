import { createContext, useContext } from 'react';

export const departmentColors = {
  Chemistry: '#ffc107',      // Yellow
  Hematology: '#dc3545',     // Red
  Serology: '#28a745',       // Green
  Virology: '#007bff',       // Blue
  Parasitology: '#6f42c1',   // Purple (replacing General)
  Microbiology: '#6f42c1',   // Purple (keeping existing)
  Immunology: '#007bff',     // Blue (keeping existing)
};

export const TestContext = createContext();
export function useTestCatalog() {
  return useContext(TestContext);
} 