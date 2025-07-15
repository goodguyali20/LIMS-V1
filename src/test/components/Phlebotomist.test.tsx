import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Phlebotomist from '../../pages/Phlebotomist/Phlebotomist';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'phlebotomist.title') return 'Phlebotomist';
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock styled-components and framer-motion (handled globally in setup)

describe('Phlebotomist Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading', () => {
    render(<Phlebotomist />);
    expect(screen.getByRole('heading', { level: 1, name: /sample collection/i })).toBeInTheDocument();
  });
}); 