import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PatientHistory from '../../pages/PatientHistory/PatientHistory';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'patientHistory.title') return 'patient.history';
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock styled-components and framer-motion (handled globally in setup)

describe('PatientHistory Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading', () => {
    render(<PatientHistory />);
    expect(screen.getByRole('heading', { name: 'patient.history' })).toBeInTheDocument();
  });
}); 