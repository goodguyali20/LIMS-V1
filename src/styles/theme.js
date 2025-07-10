// A helper function to create our squircle clip-path
const squircle = (radius) => `
  border-radius: ${radius}px;
  @supports (clip-path: rect(0 0 0 0)) {
    clip-path: inset(0 0 0 0 round ${radius}px);
  }
`;

export const lightTheme = {
  name: 'light',
  squircle,
  body: '#F0F2F5', // A softer off-white
  text: '#1C1C1E',
  cardBg: '#FFFFFF',
  sidebarBg: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
  borderColor: '#E9ECEF',
  shadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
  
  // Primary "Vivid Blue" Gradient
  primary: '#007BFF',
  primaryGradient: 'linear-gradient(90deg, #007BFF 0%, #0056b3 100%)',
  primaryHover: '#0056b3',

  // Accent Colors
  success: '#28A745',
  warning: '#FFC107',
  danger: '#DC3545',
  
  // Glassmorphism
  glassBg: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(10px)',
};

export const darkTheme = {
  name: 'dark',
  squircle,
  body: '#121212',
  text: '#EAEAEA',
  cardBg: '#1E1E1E',
  sidebarBg: 'linear-gradient(180deg, #1E1E1E 0%, #121212 100%)',
  borderColor: '#3A3A3C',
  shadow: '0 8px 24px rgba(0, 0, 0, 0.2)',

  // Primary "Vivid Blue" Gradient for Dark Mode
  primary: '#3391FF',
  primaryGradient: 'linear-gradient(90deg, #3391FF 0%, #007BFF 100%)',
  primaryHover: '#58a6ff',

  // Accent Colors
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',

  // Glassmorphism
  glassBg: 'rgba(28, 28, 30, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
};