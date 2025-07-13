import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* Apply theme colors to body */
  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
    /* Premium scrollbar styling */
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.colors.primary} transparent;
  }

  body {
    font-family: 'Inter', 'Almarai', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.6;
    transition: background-color 0.3s ease, color 0.3s ease;
    overflow-x: hidden;
    /* Premium background with subtle gradient */
    background: ${({ theme }) => theme.isDarkMode 
      ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
      : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
    };
    background-attachment: fixed;
    min-height: 100vh;
  }

  /* Dark mode transitions */
  body.dark-mode {
    background-color: ${({ theme }) => theme.isDarkMode ? theme.colors.dark.background : theme.colors.background};
    color: ${({ theme }) => theme.isDarkMode ? theme.colors.dark.text : theme.colors.text};
  }

  body.dark-mode * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }

  /* Premium scrollbar for dark mode */
  body.dark-mode::-webkit-scrollbar {
    width: 10px;
  }

  body.dark-mode::-webkit-scrollbar-track {
    background: linear-gradient(180deg, #1e1e1e 0%, #2d2d2d 100%);
    border-radius: 5px;
  }

  body.dark-mode::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 5px;
    border: 2px solid #1e1e1e;
  }

  body.dark-mode::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  }

  /* Premium light mode scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%);
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 5px;
    border: 2px solid #f1f5f9;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  }

  /* Premium focus styles for accessibility */
  *:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.5);
    border-radius: 4px;
  }

  /* Premium selection styles */
  ::selection {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  /* Premium smooth animations for all interactive elements */
  button, input, select, textarea, a {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Disable transitions for users who prefer reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Premium Loading animation keyframes */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.05);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8) rotate(-5deg);
    }
    to {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
  }

  /* Premium glow animation for interactive elements */
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
    }
    50% {
      box-shadow: 0 0 25px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
    }
  }

  /* Premium floating animation */
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    33% {
      transform: translateY(-10px) rotate(1deg);
    }
    66% {
      transform: translateY(-5px) rotate(-1deg);
    }
  }

  /* Premium shimmer effect */
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  /* Premium bounce animation */
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  }

  /* Premium wave animation */
  @keyframes wave {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-20px);
    }
  }

  /* Premium morphing animation */
  @keyframes morph {
    0%, 100% {
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    }
    50% {
      border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
    }
  }

  /* Premium particle animation */
  @keyframes particle {
    0% {
      transform: translateY(0) scale(0);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100px) scale(1);
      opacity: 0;
    }
  }

  /* Utility classes for animations */
  .animate-fade-in {
    animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-slide-in {
    animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-scale-in {
    animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-bounce {
    animation: bounce 1s ease-in-out;
  }

  .animate-wave {
    animation: wave 1s ease-in-out infinite;
  }

  .animate-morph {
    animation: morph 4s ease-in-out infinite;
  }

  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  /* Premium glow utility classes */
  .glow-primary {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2);
  }

  .glow-success {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2);
  }

  .glow-danger {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2);
  }

  .glow-warning {
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2);
  }

  .glow-info {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2);
  }

  /* Dark mode specific utility classes */
  .dark-mode .glow-primary {
    box-shadow: 0 0 25px rgba(59, 130, 246, 0.5), 0 0 50px rgba(59, 130, 246, 0.3);
  }

  .dark-mode .glow-success {
    box-shadow: 0 0 25px rgba(16, 185, 129, 0.5), 0 0 50px rgba(16, 185, 129, 0.3);
  }

  .dark-mode .glow-danger {
    box-shadow: 0 0 25px rgba(239, 68, 68, 0.5), 0 0 50px rgba(239, 68, 68, 0.3);
  }

  .dark-mode .glow-warning {
    box-shadow: 0 0 25px rgba(245, 158, 11, 0.5), 0 0 50px rgba(245, 158, 11, 0.3);
  }

  .dark-mode .glow-info {
    box-shadow: 0 0 25px rgba(59, 130, 246, 0.5), 0 0 50px rgba(59, 130, 246, 0.3);
  }

  /* Premium glassmorphism effects */
  .glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .dark-mode .glass {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Premium gradient backgrounds */
  .gradient-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  }

  .gradient-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  .gradient-danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }

  .gradient-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }

  .gradient-info {
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  }

  /* Premium text gradients */
  .text-gradient-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .text-gradient-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Premium border gradients */
  .border-gradient-primary {
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) border-box;
  }

  .dark-mode .border-gradient-primary {
    background: linear-gradient(#1e293b, #1e293b) padding-box,
                linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) border-box;
  }

  /* Premium hover effects */
  .hover-lift {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-lift:hover {
    transform: translateY(-5px);
  }

  .hover-glow:hover {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
  }

  .hover-scale:hover {
    transform: scale(1.05);
  }

  /* Premium responsive utilities */
  @media (max-width: 768px) {
    .animate-float {
      animation: none;
    }
    
    .glass {
      backdrop-filter: blur(5px);
    }
  }

  /* Premium print styles */
  @media print {
    .animate-float,
    .animate-pulse,
    .animate-spin,
    .animate-wave,
    .animate-morph {
      animation: none !important;
    }
    
    .glass {
      background: white !important;
      backdrop-filter: none !important;
    }
  }
`;