// Type declarations for JSX files
declare module '*.jsx' {
  import React from 'react';
  const Component: React.ComponentType<unknown>;
  export default Component;
}

// Extend the styled-components theme
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      error: string;
      info: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      border: string;
    };
    shadows: {
      main: string;
      hover: string;
    };
    shapes: {
      squircle: string;
    };
  }
} 