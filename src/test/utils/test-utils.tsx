import React from 'react';
import { render, RenderOptions, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock context providers
const ThemeProvider = ({ children }: { children: React.ReactNode }) => children;
const AuthProvider = ({ children }: { children: React.ReactNode }) => children;
const OrderProvider = ({ children }: { children: React.ReactNode }) => children;
const TestProvider = ({ children }: { children: React.ReactNode }) => children;
const SettingsProvider = ({ children }: { children: React.ReactNode }) => children;

// Mock providers wrapper
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
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
  );
};

// Custom render function
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock navigation
export const mockNavigate = vi.fn();

// Mock toast notifications
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

// Mock Firebase
export const mockFirebase = {
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
  auth: {
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(),
  },
  storage: {
    ref: vi.fn(() => ({
      put: vi.fn(),
    })),
  },
};

// Test utilities
export const waitForElementToBeRemoved = async (_element: Element) => {
  // Implementation would go here
  return Promise.resolve();
};

// Mock functions
export const mockFunctions = {
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
};

// Custom matchers
export const customMatchers = {
  toBeInTheDocument: (element: Element) => {
    expect(element).toBeInTheDocument();
  },
  toHaveTextContent: (element: Element, text: string) => {
    expect(element).toHaveTextContent(text);
  },
  toHaveClass: (element: Element, className: string) => {
    expect(element).toHaveClass(className);
  },
  toBeDisabled: (element: Element) => {
    expect(element).toBeDisabled();
  },
  toBeEnabled: (element: Element) => {
    expect(element).toBeEnabled();
  },
};

// Form testing utilities
export const fillFormField = async (name: string, value: string) => {
  const { user } = await import('@testing-library/user-event');
  const element = screen.getByRole('textbox', { name: new RegExp(name, 'i') });
  await user.type(element, value);
};

export const submitForm = async () => {
  const { user } = await import('@testing-library/user-event');
  const submitButton = screen.getByRole('button', { name: /submit/i });
  await user.click(submitButton);
};

// Mock observers
export const mockIntersectionObserver = vi.fn();
export const mockResizeObserver = vi.fn();

// Re-export everything
export * from '@testing-library/react';
export { customRender as render }; 