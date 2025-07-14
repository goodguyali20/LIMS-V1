import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
  Navigate: () => null,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
  Link: ({ children, ...props }: any) => {
    return ({ children, ...props }: any) => {
      return <a {...props}>{children}</a>;
    };
  },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      return ({ children, ...props }: any) => {
        return <div {...props}>{children}</div>;
      };
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useMotionValue: (initial: any) => ({
    get: () => initial,
    set: vi.fn(),
    on: vi.fn(),
  }),
  useTransform: vi.fn(() => ({ get: () => 0, set: vi.fn() })),
  useSpring: vi.fn(() => ({ get: () => 0, set: vi.fn() })),
}));

// Mock styled-components
vi.mock('styled-components', () => {
  const styled = (ComponentOrTag: any) => (styles: any) => {
    const StyledComponent = ComponentOrTag
      ? (props: any) => <ComponentOrTag {...props} />
      : (props: any) => <ComponentOrTag {...props} />;
    return ({ children, ...props }: any) => (
      <StyledComponent {...props}>{children}</StyledComponent>
    );
  };

  return {
    default: styled,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock Firebase
vi.mock('../firebase/config', () => ({
  db: {},
  auth: {},
  storage: {},
}));

// Mock context providers
vi.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        info: '#3b82f6',
        dark: {
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f1f5f9',
          textSecondary: '#94a3b8',
        },
      },
      isDarkMode: false,
    },
    toggleTheme: vi.fn(),
  }),
}));

vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
  }),
}));

vi.mock('../contexts/OrderContext', () => ({
  OrderProvider: ({ children }: { children: React.ReactNode }) => children,
  useOrders: () => ({
    orders: [],
    loading: false,
    addOrder: vi.fn(),
    updateOrder: vi.fn(),
    deleteOrder: vi.fn(),
  }),
}));

vi.mock('../contexts/TestContext', () => ({
  TestProvider: ({ children }: { children: React.ReactNode }) => children,
  useTestCatalog: () => ({
    tests: [],
    loading: false,
    addTest: vi.fn(),
    updateTest: vi.fn(),
    deleteTest: vi.fn(),
  }),
}));

vi.mock('../contexts/SettingsContext', () => ({
  SettingsProvider: ({ children }: { children: React.ReactNode }) => children,
  useSettings: () => ({
    settings: {},
    loading: false,
    saveSettings: vi.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Setup global mocks
global.localStorage = localStorageMock;
global.sessionStorage = sessionStorageMock;

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
}); 