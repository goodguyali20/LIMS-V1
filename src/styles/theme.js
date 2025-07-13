export const theme = {
  colors: {
    // Premium Light Mode Colors
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    urgent: '#dc2626',
    
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceSecondary: '#f1f5f9',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    input: '#ffffff',
    hover: '#f1f5f9',
    
    // Premium Dark Mode Colors
    dark: {
      background: '#0f172a',
      surface: '#1e293b',
      surfaceSecondary: '#334155',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      border: '#475569',
      input: '#334155',
      hover: '#334155',
    },
    
    // Enhanced Glow Colors for Premium Effects
    glow: {
      primary: '#00aaff',
      success: '#00ff88',
      danger: '#ff0055',
      warning: '#ffaa00',
      info: '#00ccff',
      urgent: '#ff0044',
    },
    
    // Department Colors with Premium Gradients
    chemistry: '#007bff',
    hematology: '#dc3545',
    serology: '#28a745',
    virology: '#ffc107',
    microbiology: '#6f42c1',
    general: '#6c757d',
    
    // Status Colors for Enhanced UX
    status: {
      pending: '#f59e0b',
      inProgress: '#3b82f6',
      completed: '#10b981',
      rejected: '#ef4444',
      urgent: '#dc2626',
      critical: '#dc2626',
      normal: '#10b981',
      warning: '#f59e0b',
    },
    
    // Gradient Definitions
    gradients: {
      primary: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      urgent: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      premium: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  },
  
  shadows: {
    main: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    premium: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    
    // Dark mode shadows with enhanced glow effects
    dark: {
      main: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
      hover: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      large: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      premium: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    },
    
    // Premium glow shadows for interactive elements
    glow: {
      primary: '0 0 20px rgba(0, 170, 255, 0.3), 0 0 40px rgba(0, 170, 255, 0.1)',
      success: '0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)',
      danger: '0 0 20px rgba(255, 0, 85, 0.3), 0 0 40px rgba(255, 0, 85, 0.1)',
      warning: '0 0 20px rgba(255, 170, 0, 0.3), 0 0 40px rgba(255, 170, 0, 0.1)',
      info: '0 0 20px rgba(0, 204, 255, 0.3), 0 0 40px rgba(0, 204, 255, 0.1)',
      urgent: '0 0 20px rgba(220, 38, 38, 0.4), 0 0 40px rgba(220, 38, 38, 0.2)',
    },
    
    // Status-specific shadows
    status: {
      pending: '0 0 15px rgba(245, 158, 11, 0.3)',
      inProgress: '0 0 15px rgba(59, 130, 246, 0.3)',
      completed: '0 0 15px rgba(16, 185, 129, 0.3)',
      rejected: '0 0 15px rgba(239, 68, 68, 0.3)',
      urgent: '0 0 20px rgba(220, 38, 38, 0.4)',
    },
  },
  
  shapes: {
    squircle: '12px',
    circle: '50%',
    pill: '9999px',
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px',
    ultra: '1600px',
  },
  
  typography: {
    fontFamily: {
      primary: "'Inter', 'Almarai', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      secondary: "'Cairo', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Enhanced Animation Settings
  animations: {
    duration: {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.5s',
      slower: '0.8s',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    spring: {
      gentle: { type: "spring", stiffness: 100, damping: 15 },
      bouncy: { type: "spring", stiffness: 200, damping: 10 },
      smooth: { type: "spring", stiffness: 50, damping: 20 },
      responsive: { type: "spring", stiffness: 300, damping: 25 },
    },
  },
  
  // Premium Effects
  effects: {
    backdropBlur: 'blur(10px)',
    glass: 'rgba(255, 255, 255, 0.1)',
    glassDark: 'rgba(0, 0, 0, 0.1)',
    borderGradient: 'linear-gradient(90deg, #3B82F6, #10B981, #F59E0B, #EF4444)',
  },
  
  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
}; 