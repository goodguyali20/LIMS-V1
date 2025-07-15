import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrintOrder from '../../pages/PrintOrder';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'printOrder.title') return 'Print Order';
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock styled-components and framer-motion (handled globally in setup)

describe('PrintOrder Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the loader when loading', () => {
    render(<PrintOrder />);
    expect(screen.getByText('Loading order...')).toBeInTheDocument();
  });
}); 