import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Firebase
vi.mock('../firebase/config', () => ({
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
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
    useLocation: () => ({ pathname: '/' }),
  };
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock framer-motion
const motionProxy = new Proxy({}, {
  get: (target, prop) => {
    if (typeof prop === 'string') {
      return ({ children, ...props }) => {
        const Component = prop;
        return React.createElement(Component, props, children);
      };
    }
    return target[prop];
  }
});

vi.mock('framer-motion', () => ({
  motion: motionProxy,
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn()
  }),
  useMotionValue: (initial) => ({
    get: () => initial,
    set: vi.fn(),
    on: vi.fn()
  }),
  useTransform: () => ({
    get: () => 0,
    set: vi.fn()
  })
}));

// Mock styled-components
vi.mock('styled-components', () => {
  const styled = (ComponentOrTag) => (styles) => {
    // If ComponentOrTag is a string, use it as a tag; if it's a function/component, use it directly
    const Tag = typeof ComponentOrTag === 'string'
      ? ComponentOrTag
      : (props) => <ComponentOrTag {...props} />;
    return ({ children, ...props }) => (
      <Tag {...props}>{children}</Tag>
    );
  };
  // Proxy to handle any tag (styled.h1, styled.section, etc.)
  const styledProxy = new Proxy(styled, {
    get: (target, prop) => target(prop),
  });
  return {
    __esModule: true,
    default: styledProxy,
    ThemeProvider: ({ children }) => children,
  };
});

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock; 