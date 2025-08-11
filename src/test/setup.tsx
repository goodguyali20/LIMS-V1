import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'patientRegistration.title': 'Patient Registration',
        'patientRegistration.personalInfo': 'Personal Information',
        'patientRegistration.addressInfo': 'Address Information',
        'patientRegistration.emergencyContact': 'Emergency Contact',
        'patientRegistration.medicalHistory': 'Medical History',
        'patientRegistration.insuranceInfo': 'Insurance Information',
        'patientRegistration.registrationSummary': 'Registration Summary',
        'patientRegistration.testSelection': 'Test Selection',
        'patientRegistration.register': 'Register Patient',
        'patientRegistration.email': 'Email',
        'patientRegistration.firstName': 'First Name',
        'patientRegistration.lastName': 'Last Name',
        'patientRegistration.age': 'Age',
        'patientRegistration.gender': 'Gender',
        'patientRegistration.phoneNumber': 'Phone Number',
        'patientRegistration.patientId': 'Patient ID',
        'patientRegistration.previewPrint': 'Preview Print',
        'patientRegistration.saving': 'Saving...',
        'patientRegistration.saving': 'Saving...',
        'patientRegistration.saving': 'Saving...',
        'patientRegistration.saving': 'Saving...',
        'patientRegistration.saving': 'Saving...',
        'dashboard.title': 'Dashboard',
        'dashboard.exportReport': 'Export Report',
        'dashboard.last7Days': 'Last 7 Days',
        'dashboard.last30Days': 'Last 30 Days',
        'dashboard.last90Days': 'Last 90 Days',
        'dashboard.totalOrders': 'Total Orders',
        'dashboard.testsCompleted': 'Tests Completed',
        'dashboard.revenue': 'Revenue',
        'dashboard.pendingResults': 'Pending Results',
        'workQueue.title': 'Work Queue',
        'workQueue.noOrders': 'No Orders',
        'workQueue.subtitle': 'Manage and track all lab orders in real time.',
        'workQueue.printAll': 'Print All',
        'workQueue.clearFilters': 'Clear Filters',
        'workQueue.searchPlaceholder': 'Search orders...',
        'resultEntry.title': 'Result Entry',
        'resultEntry.noOrder': 'No Order Found',
        'resultEntry.save': 'Save Results',
        'resultEntry.submit': 'Submit',
        'resultEntry.cancel': 'Cancel',
        'enterResults': 'Result Entry',
        'orderIdLabel': 'Order ID:',
        'saveResults': 'Save Results',
        'saving': 'Saving...',
        'orderInformation': 'Order Information',
        'patientLabel': 'Patient',
        'patientIdLabel': 'Patient ID',
        // Add more as needed for all fields/buttons/sections
      };
      return map[key] || key;
    },
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
vi.mock('framer-motion', () => {
  const motion = {
    div: (props: any) => <div {...props} />,
    button: (props: any) => <button {...props} />,
    span: (props: any) => <span {...props} />,
    h1: (props: any) => <h1 {...props} />,
    h2: (props: any) => <h2 {...props} />,
    h3: (props: any) => <h3 {...props} />,
    h4: (props: any) => <h4 {...props} />,
    h5: (props: any) => <h5 {...props} />,
    h6: (props: any) => <h6 {...props} />,
    p: (props: any) => <p {...props} />,
    form: (props: any) => <form {...props} />,
    input: (props: any) => <input {...props} />,
    textarea: (props: any) => <textarea {...props} />,
    table: (props: any) => <table {...props} />,
    tr: (props: any) => <tr {...props} />,
    td: (props: any) => <td {...props} />,
    th: (props: any) => <th {...props} />,
    thead: (props: any) => <thead {...props} />,
    tbody: (props: any) => <tbody {...props} />,
    ul: (props: any) => <ul {...props} />,
    li: (props: any) => <li {...props} />,
    section: (props: any) => <section {...props} />,
    header: (props: any) => <header {...props} />,
    footer: (props: any) => <footer {...props} />,
    nav: (props: any) => <nav {...props} />,
    aside: (props: any) => <aside {...props} />,
    main: (props: any) => <main {...props} />,
    label: (props: any) => <label {...props} />,
    select: (props: any) => <select {...props} />,
  };
  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useMotionValue: (initial: any) => ({
      get: () => initial,
      set: vi.fn(),
      on: vi.fn(),
    }),
    useTransform: vi.fn(() => ({ get: () => 0, set: vi.fn() })),
    useSpring: vi.fn(() => ({ get: () => 0, set: vi.fn() })),
    // Patch for global 'motion' usage
    ...(typeof global !== 'undefined' ? { motion } : {}),
  };
});

// Mock styled-components
vi.mock('styled-components', () => {
  const styled = (ComponentOrTag: any) => (styles: any) => {
    return (props: any) => {
      const { children, ...rest } = props;
      if (typeof ComponentOrTag === 'function') {
        // If it's a function component (e.g., motion.div), call as a component
        return React.createElement(ComponentOrTag, rest, children);
      }
      // Otherwise, treat as a string tag
      return React.createElement(ComponentOrTag, rest, children);
    };
  };
  // Patch for styled.div, styled.button, etc.
  const tags = [
    'div', 'button', 'input', 'textarea', 'span', 'form', 'label', 'section', 'header', 'main', 'aside', 'footer', 'nav', 'ul', 'li', 'a',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'select',
    'p',
    'canvas'
  ];
  tags.forEach(tag => {
    styled[tag] = styled(tag);
  });
  return {
    default: styled,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock Firebase Firestore
vi.mock('../firebase/config', () => ({
  db: {},
}));
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    collection: vi.fn(() => ({})),
    getDocs: vi.fn(async () => ({
      forEach: (fn: any) => {}, // No docs by default
      docs: [],
    })),
    onSnapshot: vi.fn((q, cb) => {
      cb({
        forEach: (fn: any) => {}, // No docs by default
        docs: [],
      });
      return () => {};
    }),
    addDoc: vi.fn(async () => ({})),
    updateDoc: vi.fn(async () => {}),
    deleteDoc: vi.fn(async () => {}),
    doc: vi.fn(() => ({})),
    query: vi.fn(() => ({})),
    orderBy: vi.fn(() => ({})),
    limit: vi.fn(() => ({})),
    where: (...args: any[]) => args, // Add this passthrough mock
  };
});

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

// Mock AuthContext for Profile page
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: '',
      phoneNumber: '',
      emailVerified: true,
      uid: 'test-uid',
      providerData: [],
    },
    loading: false,
    updateProfile: vi.fn(),
    updateEmail: vi.fn(),
    updatePassword: vi.fn(),
    sendEmailVerification: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    logout: vi.fn(),
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
  useTestCatalog: () => {
    const tests = [
      { id: 't1', name: 'CBC', code: 'CBC', price: 100, department: 'Parasitology' },
      { id: 't2', name: 'Blood Sugar', code: 'BS', price: 50, department: 'Parasitology' },
      { id: 't3', name: 'Lipid Profile', code: 'LP', price: 200, department: 'Parasitology' },
    ];
    return {
      tests,
      labTests: tests, // alias for PrintPreviewModal compatibility
    };
  },
}));

vi.mock('../contexts/SettingsContext', () => ({
  SettingsProvider: ({ children }: { children: React.ReactNode }) => children,
  useSettings: () => ({
    settings: {
      patientRegistrationFields: {
        firstName: { enabled: true, required: true, label: 'First Name' },
        lastName: { enabled: true, required: true, label: 'Last Name' },
        age: { enabled: true, required: true, label: 'Age' },
        gender: { enabled: true, required: true, label: 'Gender' },
        phoneNumber: { enabled: true, required: false, label: 'Phone Number' },
        email: { enabled: true, required: false, label: 'Email' },
        patientId: { enabled: true, required: false, label: 'Patient ID' },
        address: {
          street: { enabled: true, required: false, label: 'Street' },
          city: { enabled: true, required: false, label: 'City' },
          state: { enabled: true, required: false, label: 'State' },
          zipCode: { enabled: true, required: false, label: 'Zip Code' },
          country: { enabled: true, required: false, label: 'Country' },
        },
        emergencyContact: {
          name: { enabled: true, required: false, label: 'Contact Name' },
          relationship: { enabled: true, required: false, label: 'Relationship' },
          phoneNumber: { enabled: true, required: false, label: 'Contact Phone' },
        },
        medicalHistory: {
          allergies: { enabled: true, required: false, label: 'Allergies' },
          medications: { enabled: true, required: false, label: 'Medications' },
          conditions: { enabled: true, required: false, label: 'Conditions' },
          notes: { enabled: true, required: false, label: 'Notes' },
        },
        insurance: {
          provider: { enabled: true, required: false, label: 'Provider' },
          policyNumber: { enabled: true, required: false, label: 'Policy Number' },
          groupNumber: { enabled: true, required: false, label: 'Group Number' },
        },
      },
    },
    loading: false,
    saveSettings: vi.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

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

// Mock departmentColors for TestSelectionPanel
Object.defineProperty(global, 'departmentColors', {
  value: { Parasitology: '#6f42c1' },
  writable: true,
});

// Mock react-to-print
vi.mock('react-to-print', () => ({
  __esModule: true,
  default: () => null,
  useReactToPrint: () => () => {},
}));

// Setup global mocks
global.localStorage = localStorageMock;
global.sessionStorage = sessionStorageMock;

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
}); 