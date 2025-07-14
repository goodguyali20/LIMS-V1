import React from 'react';

// Common Components
export interface GlowCardProps {
  children: React.ReactNode;
  padding?: string;
  glowColor?: string;
  onClick?: () => void;
  className?: string;
  initial?: any;
  animate?: any;
  transition?: any;
  whileHover?: any;
  whileTap?: any;
}

export interface GlowButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large';
  glowColor?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: string;
}

export interface AnimatedNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  icon?: React.ComponentType<unknown>;
  onClose?: () => void;
  duration?: number;
}

// Export the actual components
export { default as GlowCard } from './GlowCard';
export { default as GlowButton } from './GlowButton';
export { default as AnimatedModal } from './AnimatedModal';
export { default as AnimatedNotification } from './AnimatedNotification'; 