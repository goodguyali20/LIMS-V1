// Global declarations for JavaScript modules
declare module "*.js";
declare module "*.jsx";
declare module "../common";
declare module "../../components/common";
declare module "./common";

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URL: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_SOCKET_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global window extensions
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// React component types for JSX files
declare module "*.jsx" {
  import React from 'react';
  const Component: React.ComponentType<unknown>;
  export default Component;
}

// Styled-components theme types
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      border: string;
      error: string;
      warning: string;
      success: string;
      info: string;
      dark: {
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
      };
    };
    isDarkMode: boolean;
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  }
}

// Test utilities types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
      toHaveClass(className: string): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
    }
  }
}

// Vitest types
declare module 'vitest' {
  export const vi: unknown;
  export const describe: unknown;
  export const it: unknown;
  export const expect: unknown;
  export const beforeEach: unknown;
  export const afterEach: unknown;
}

// Service Worker types
declare var clients: Clients;
declare var self: ServiceWorkerGlobalScope;

interface Clients {
  openWindow(url: string): Promise<WindowClient | null>;
}

interface ServiceWorkerGlobalScope {
  clients: Clients;
  skipWaiting(): Promise<void>;
  clientsClaim(): Promise<void>;
} 