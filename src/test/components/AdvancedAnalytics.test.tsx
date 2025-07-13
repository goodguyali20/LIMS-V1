import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdvancedAnalytics from '../../components/Analytics/AdvancedAnalytics';
import { createMockUser } from '../utils/test-utils';

// Mock the theme context
vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#2563eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
      },
    },
  }),
}));

// Mock recharts
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Area: () => <div data-testid="area" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

describe('AdvancedAnalytics', () => {
  const mockData = {
    orders: {
      total: 1247,
      pending: 89,
      completed: 1158,
      cancelled: 23,
    },
    revenue: {
      daily: 12500,
      weekly: 87500,
      monthly: 375000,
    },
    tests: {
      total: 3421,
      byDepartment: {
        'Chemistry': 1247,
        'Hematology': 892,
        'Serology': 456,
        'Virology': 234,
        'Microbiology': 592,
      },
    },
    performance: {
      averageTurnaroundTime: 4.2,
      onTimeDelivery: 94.5,
    },
  };

  const defaultProps = {
    data: mockData,
    dateRange: '30d' as const,
    onDateRangeChange: vi.fn(),
    onExport: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
  });

  it('displays all metric cards', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    expect(screen.getByText('1,247')).toBeInTheDocument(); // Total Orders
    expect(screen.getByText('$375,000')).toBeInTheDocument(); // Monthly Revenue
    expect(screen.getByText('4.2h')).toBeInTheDocument(); // Avg Turnaround
    expect(screen.getByText('94.5%')).toBeInTheDocument(); // On-Time Delivery
  });

  it('displays metric labels correctly', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText('Avg Turnaround')).toBeInTheDocument();
    expect(screen.getByText('On-Time Delivery')).toBeInTheDocument();
  });

  it('shows trend indicators', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    // Check for trend arrows
    const trendArrows = screen.getAllByTestId('trend-icon');
    expect(trendArrows.length).toBeGreaterThan(0);
  });

  it('displays chart containers', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    expect(screen.getByText('Order Trends')).toBeInTheDocument();
    expect(screen.getByText('Tests by Department')).toBeInTheDocument();
  });

  it('renders responsive containers for charts', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    const responsiveContainers = screen.getAllByTestId('responsive-container');
    expect(responsiveContainers.length).toBeGreaterThan(0);
  });

  it('displays date range selector', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    const dateRangeSelect = screen.getByRole('combobox');
    expect(dateRangeSelect).toBeInTheDocument();
    expect(dateRangeSelect).toHaveValue('30d');
  });

  it('calls onDateRangeChange when date range is changed', async () => {
    const user = userEvent.setup();
    render(<AdvancedAnalytics {...defaultProps} />);
    
    const dateRangeSelect = screen.getByRole('combobox');
    await user.selectOptions(dateRangeSelect, '7d');
    
    expect(defaultProps.onDateRangeChange).toHaveBeenCalledWith('7d');
  });

  it('displays export button', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('calls onExport when export button is clicked', async () => {
    const user = userEvent.setup();
    render(<AdvancedAnalytics {...defaultProps} />);
    
    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);
    
    expect(defaultProps.onExport).toHaveBeenCalled();
  });

  it('displays key trends section', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    expect(screen.getByText('Key Trends')).toBeInTheDocument();
    expect(screen.getByText('Order Volume')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Turnaround Time')).toBeInTheDocument();
    expect(screen.getByText('Customer Satisfaction')).toBeInTheDocument();
  });

  it('shows trend values correctly', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByText('+8.3%')).toBeInTheDocument();
    expect(screen.getByText('-15.2%')).toBeInTheDocument();
    expect(screen.getByText('+2.1%')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<AdvancedAnalytics data={undefined} />);
    
    // Should still render the component with default/mock data
    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    const container = screen.getByText('Advanced Analytics').closest('div');
    expect(container).toHaveClass('analytics-container');
  });

  it('displays department data in pie chart', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    // Check if pie chart is rendered
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('shows positive trend indicators in green', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    const positiveTrends = screen.getAllByText(/\+/);
    positiveTrends.forEach(trend => {
      expect(trend).toHaveClass('positive-trend');
    });
  });

  it('shows negative trend indicators in red', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    const negativeTrends = screen.getAllByText(/-/);
    negativeTrends.forEach(trend => {
      expect(trend).toHaveClass('negative-trend');
    });
  });

  it('formats currency values correctly', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    expect(screen.getByText('$375,000')).toBeInTheDocument();
  });

  it('formats percentage values correctly', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    expect(screen.getByText('94.5%')).toBeInTheDocument();
  });

  it('formats time values correctly', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    expect(screen.getByText('4.2h')).toBeInTheDocument();
  });

  it('handles responsive design correctly', () => {
    // Mock window resize
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(<AdvancedAnalytics {...defaultProps} />);
    
    // Component should still render without errors
    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
  });

  it('displays loading state when data is loading', () => {
    render(<AdvancedAnalytics {...defaultProps} data={undefined} />);
    
    // Should show some loading or default state
    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
  });

  it('handles chart type switching', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    // Default should be line chart
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('displays correct number of metric cards', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    const metricCards = screen.getAllByTestId('metric-card');
    expect(metricCards).toHaveLength(4); // 4 metric cards
  });

  it('shows trend analysis with correct number of items', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    const trendItems = screen.getAllByTestId('trend-item');
    expect(trendItems).toHaveLength(4); // 4 trend items
  });

  it('displays chart titles correctly', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    expect(screen.getByText('Order Trends')).toBeInTheDocument();
    expect(screen.getByText('Tests by Department')).toBeInTheDocument();
  });

  it('handles accessibility attributes', () => {
    render(<AdvancedAnalytics {...defaultProps} />);
    
    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
    
    const dateRangeSelect = screen.getByRole('combobox');
    expect(dateRangeSelect).toBeInTheDocument();
  });
}); 