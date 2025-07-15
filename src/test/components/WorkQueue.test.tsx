import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkQueue from '../../pages/WorkQueue/WorkQueue';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'workQueue.title') return 'Work Queue';
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock styled-components and framer-motion (handled globally in setup)

describe('WorkQueue Page', () => {
  let queryClient: QueryClient;
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();
  });

  it('renders the main heading', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <WorkQueue />
      </QueryClientProvider>
    );
    expect(screen.getByRole('heading', { name: /work queue/i })).toBeInTheDocument();
  });
}); 