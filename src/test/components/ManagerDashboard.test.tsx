import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../utils/test-utils';
import ManagerDashboard from '../../pages/Dashboard/ManagerDashboard';

// Basic smoke test for dashboard rendering

describe('ManagerDashboard', () => {
  it('renders the dashboard main heading', () => {
    render(<ManagerDashboard />);
    // Look for the main heading specifically
    expect(
      screen.getByRole('heading', { name: /dashboard/i })
    ).toBeInTheDocument();
  });
}); 