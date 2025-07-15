import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '../../pages/NotFound/NotFound';

// Mock react-router-dom Link
vi.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

// Mock styled-components (handled globally in setup)

describe('NotFound Page', () => {
  beforeEach(() => {
    // No-op, just for symmetry
  });

  it('renders the 404 heading, subtitle, and dashboard link', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /go to dashboard/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dashboard');
  });
}); 