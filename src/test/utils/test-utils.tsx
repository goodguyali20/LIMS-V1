import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { OrderProvider } from '../contexts/OrderContext';
import { TestProvider } from '../contexts/TestContext';
import { SettingsProvider } from '../contexts/SettingsContext';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <OrderProvider>
            <TestProvider>
              <SettingsProvider>
                {children}
              </SettingsProvider>
            </TestProvider>
          </OrderProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test data factories
export const createMockUser = (overrides = {}) => ({
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'Manager' as const,
  permissions: ['read', 'write'],
  createdAt: new Date(),
  lastLogin: new Date(),
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: 'test-order-id',
  patientId: 'test-patient-id',
  patientName: 'John Doe',
  patientAge: 30,
  patientGender: 'Male' as const,
  referringDoctor: 'Dr. Smith',
  orderDate: new Date(),
  status: 'Pending' as const,
  priority: 'Normal' as const,
  tests: [
    {
      id: 'test-1',
      name: 'Blood Glucose',
      department: 'Chemistry',
      price: 25.00,
      status: 'Pending' as const,
    },
  ],
  totalPrice: 25.00,
  notes: 'Test order',
  createdBy: 'test-user-id',
  createdAt: new Date(),
  ...overrides,
});

export const createMockPatient = (overrides = {}) => ({
  id: 'test-patient-id',
  name: 'John Doe',
  age: 30,
  gender: 'Male' as const,
  patientId: 'P001',
  phone: '+1234567890',
  email: 'john.doe@example.com',
  address: '123 Main St',
  dateOfBirth: new Date('1990-01-01'),
  emergencyContact: '+1234567891',
  insuranceProvider: 'Blue Cross',
  insuranceNumber: 'BC123456',
  medicalHistory: 'None',
  allergies: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockTest = (overrides = {}) => ({
  id: 'test-test-id',
  name: 'Blood Glucose',
  department: 'Chemistry',
  price: 25.00,
  unit: 'mg/dL',
  referenceRange: {
    min: 70,
    max: 100,
    unit: 'mg/dL',
  },
  turnaroundTime: 24,
  specimenType: 'Serum',
  instructions: 'Fasting required',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockInventoryItem = (overrides = {}) => ({
  id: 'test-inventory-id',
  name: 'Glucose Reagent',
  category: 'Reagents',
  quantity: 100,
  minQuantity: 10,
  maxQuantity: 200,
  unit: 'mL',
  expiryDate: new Date('2024-12-31'),
  supplier: 'Sigma Aldrich',
  cost: 50.00,
  location: 'Refrigerator A',
  notes: 'Store at 2-8°C',
  status: 'In Stock' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockQCSample = (overrides = {}) => ({
  id: 'test-qc-id',
  testName: 'Blood Glucose QC',
  department: 'Chemistry',
  date: new Date(),
  results: [
    {
      parameter: 'Glucose',
      value: 95,
      unit: 'mg/dL',
      expectedRange: {
        min: 90,
        max: 110,
      },
      status: 'Pass' as const,
    },
  ],
  status: 'Passed' as const,
  operator: 'test-user-id',
  notes: 'QC passed',
  ...overrides,
});

// Mock functions
export const mockNavigate = vi.fn();
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

// Test helpers
export const waitForElementToBeRemoved = async (element: Element) => {
  await new Promise(resolve => setTimeout(resolve, 0));
};

export const mockFirebase = {
  db: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      })),
      add: vi.fn(),
      onSnapshot: vi.fn(),
    })),
  },
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(),
  },
  storage: {
    ref: vi.fn(() => ({
      put: vi.fn(),
    })),
  },
};

// Custom matchers
export const expectElementToBeInDocument = (element: Element) => {
  expect(element).toBeInTheDocument();
};

export const expectElementToHaveTextContent = (element: Element, text: string) => {
  expect(element).toHaveTextContent(text);
};

export const expectElementToHaveClass = (element: Element, className: string) => {
  expect(element).toHaveClass(className);
};

export const expectElementToBeDisabled = (element: Element) => {
  expect(element).toBeDisabled();
};

export const expectElementToBeEnabled = (element: Element) => {
  expect(element).toBeEnabled();
};

// Async test helpers
export const waitFor = async (callback: () => void, timeout = 1000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      callback();
      return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  callback();
};

// Form testing helpers
export const fillForm = async (formData: Record<string, string>) => {
  const { user } = await import('@testing-library/user-event');
  const userEvent = user.setup();
  
  for (const [name, value] of Object.entries(formData)) {
    const element = screen.getByRole('textbox', { name: new RegExp(name, 'i') });
    await userEvent.type(element, value);
  }
};

export const submitForm = async () => {
  const { user } = await import('@testing-library/user-event');
  const userEvent = user.setup();
  
  const submitButton = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(submitButton);
};

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

// Mock ResizeObserver
export const mockResizeObserver = () => {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
}; 