import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrderView from '../../pages/OrderView/OrderView';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'orderView.title') return 'Order Details';
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock Firestore and db (handled globally in setup)
// Mock styled-components and framer-motion (handled globally in setup)

describe('OrderView Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the loader when loading', () => {
    render(<OrderView />);
    expect(screen.getByText('SmartLab LIMS')).toBeInTheDocument();
    expect(screen.getByText('Loading SmartLab LIMS...')).toBeInTheDocument();
  });
}); 