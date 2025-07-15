import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkloadView from '../../pages/Workload/WorkloadView';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'workload.title') return 'Workload';
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock styled-components and framer-motion (handled globally in setup)

describe('WorkloadView Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the loading message', () => {
    render(<WorkloadView />);
    expect(screen.getByText('loadingWorkload')).toBeInTheDocument();
  });
}); 