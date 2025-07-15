import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuditLog from '../../pages/AuditLog/AuditLog';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'auditLogHeader') return 'Audit Log';
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock styled-components and framer-motion (handled globally in setup)

describe('AuditLog Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading', () => {
    render(<AuditLog />);
    // Look for the heading with text 'Audit Log'
    expect(screen.getByRole('heading', { name: 'Audit Log' })).toBeInTheDocument();
  });
}); 