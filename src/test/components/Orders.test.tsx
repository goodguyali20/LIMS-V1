import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Orders from '../../pages/Orders';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'orders.title') return 'Orders';
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock styled-components and framer-motion (handled globally in setup)

describe('Orders Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading', () => {
    render(<Orders />);
    expect(screen.getByRole('heading', { level: 1, name: /orders/i })).toBeInTheDocument();
  });
}); 