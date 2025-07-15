import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Profile from '../../pages/Profile/Profile';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'profile.title') return 'Profile';
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock styled-components and framer-motion (handled globally in setup)

describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main headings', () => {
    render(<Profile />);
    expect(screen.getByRole('heading', { name: 'profile_details_header' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'profile_changePassword_header' })).toBeInTheDocument();
  });
}); 