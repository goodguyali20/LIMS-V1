import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AutoCompleteInput from '../../components/common/AutoCompleteInput';

// Mock the showFlashMessage function
const mockShowFlashMessage = vi.fn();

// Mock props
const defaultProps = {
  value: '',
  onChange: vi.fn(),
  onBlur: vi.fn(),
  placeholder: 'Enter name',
  suggestions: ['Ahmed', 'Ali', 'Hassan'],
  isLoading: false,
  error: null,
  name: 'firstName',
  id: 'firstName',
  type: 'text',
  disabled: false,
  required: false,
  autoComplete: 'off',
  showClearButton: true,
  onSaveNewName: vi.fn(),
  showAddNewOption: true,
};

describe('AutoCompleteInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input field with placeholder', () => {
    render(<AutoCompleteInput {...defaultProps} />);
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  it('shows suggestions when typing', async () => {
    render(<AutoCompleteInput {...defaultProps} value="Ah" />);
    
    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Ahmed')).toBeInTheDocument();
      expect(screen.getByText('Ali')).toBeInTheDocument();
      expect(screen.getByText('Hassan')).toBeInTheDocument();
    });
  });

  it('filters suggestions based on input', async () => {
    render(<AutoCompleteInput {...defaultProps} value="Ah" />);
    
    await waitFor(() => {
      expect(screen.getByText('Ahmed')).toBeInTheDocument();
      expect(screen.queryByText('Ali')).not.toBeInTheDocument();
      expect(screen.queryByText('Hassan')).not.toBeInTheDocument();
    });
  });

  it('shows add new option when no suggestions match', async () => {
    render(<AutoCompleteInput {...defaultProps} value="XYZ" suggestions={[]} />);
    
    await waitFor(() => {
      expect(screen.getByText('Add "XYZ" as new name')).toBeInTheDocument();
    });
  });

  it('calls onChange when typing', () => {
    render(<AutoCompleteInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Enter name');
    
    fireEvent.change(input, { target: { value: 'Test' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      target: { name: 'firstName', value: 'Test' }
    });
  });

  it('calls onSaveNewName when adding new name', async () => {
    const mockSaveNewName = vi.fn().mockResolvedValue(true);
    render(
      <AutoCompleteInput 
        {...defaultProps} 
        value="NewName" 
        suggestions={[]} 
        onSaveNewName={mockSaveNewName}
      />
    );
    
    await waitFor(() => {
      const addButton = screen.getByText('Add "NewName" as new name');
      fireEvent.click(addButton);
    });
    
    expect(mockSaveNewName).toHaveBeenCalledWith('NewName');
  });

  it('shows loading state', () => {
    render(<AutoCompleteInput {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Loading suggestions...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<AutoCompleteInput {...defaultProps} error="This field is required" />);
    const input = screen.getByPlaceholderText('Enter name');
    expect(input).toHaveClass('error');
  });

  it('handles keyboard navigation', async () => {
    render(<AutoCompleteInput {...defaultProps} value="Ah" />);
    
    await waitFor(() => {
      expect(screen.getByText('Ahmed')).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText('Enter name');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      target: { name: 'firstName', value: 'Ahmed' }
    });
  });

  it('clears input when clear button is clicked', () => {
    render(<AutoCompleteInput {...defaultProps} value="Test" />);
    const clearButton = screen.getByRole('button');
    
    fireEvent.click(clearButton);
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      target: { name: 'firstName', value: '' }
    });
  });

  it('hides suggestions when clicking outside', async () => {
    render(<AutoCompleteInput {...defaultProps} value="Ah" />);
    
    await waitFor(() => {
      expect(screen.getByText('Ahmed')).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText('Enter name');
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.queryByText('Ahmed')).not.toBeInTheDocument();
    }, { timeout: 300 });
  });
});
