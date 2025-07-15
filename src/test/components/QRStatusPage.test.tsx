import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import QRStatusPage from '../../pages/QRStatusPage';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'qrStatus.title') return 'QR Status';
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock styled-components and framer-motion (handled globally in setup)

describe('QRStatusPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the not found heading', () => {
    render(<QRStatusPage />);
    expect(screen.getByRole('heading', { name: 'qrStatus.orderNotFound' })).toBeInTheDocument();
  });
}); 