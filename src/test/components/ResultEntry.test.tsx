import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../utils/test-utils';
import ResultEntry from '../../pages/ResultEntry/ResultEntry';

describe('ResultEntry', () => {
  it('renders the result entry main heading', () => {
    render(<ResultEntry />);
    // Look for a main heading or key UI element
    expect(
      screen.getByRole('heading', { level: 1, name: /result entry|results|entry/i })
    ).toBeInTheDocument();
  });
}); 