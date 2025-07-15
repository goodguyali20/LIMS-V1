import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchResults from '../../pages/SearchResults';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'searchResults.title') return 'Search Results';
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock styled-components and framer-motion (handled globally in setup)

describe('SearchResults Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading', () => {
    render(<SearchResults />);
    expect(screen.getByRole('heading', { name: /search results/i })).toBeInTheDocument();
  });
}); 