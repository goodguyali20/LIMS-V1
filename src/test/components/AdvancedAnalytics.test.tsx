import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdvancedAnalytics from '../../components/Analytics/AdvancedAnalytics';

// Mock the translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  ScatterChart: ({ children }: { children: React.ReactNode }) => <div data-testid="scatter-chart">{children}</div>,
  Scatter: () => null,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((_date: Date) => 'Jan 01'),
  subDays: vi.fn((_date: Date, _days: number) => new Date()),
  startOfDay: vi.fn((date: Date) => date),
  endOfDay: vi.fn((date: Date) => date),
}));

// Mock providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(component);
};

describe('AdvancedAnalytics', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('renders analytics dashboard', () => {
    renderWithProviders(<AdvancedAnalytics />);
    
    expect(screen.getByText('analytics.title')).toBeInTheDocument();
  });

  it('renders summary statistics', () => {
    renderWithProviders(<AdvancedAnalytics />);
    
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Avg Revenue')).toBeInTheDocument();
    expect(screen.getByText('Quality Score')).toBeInTheDocument();
    expect(screen.getByText('Avg Turnaround')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
  });

  it('renders chart components', () => {
    renderWithProviders(<AdvancedAnalytics />);
    
    expect(screen.getByText('Orders Trend')).toBeInTheDocument();
    expect(screen.getByText('Revenue Analysis')).toBeInTheDocument();
    expect(screen.getByText('Test Types')).toBeInTheDocument();
    expect(screen.getByText('Quality Score')).toBeInTheDocument();
    expect(screen.getByText('Order Status')).toBeInTheDocument();
    expect(screen.getByText('Turnaround vs Quality')).toBeInTheDocument();
  });

  it('renders chart containers', () => {
    renderWithProviders(<AdvancedAnalytics />);
    
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(6);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('pie-chart')).toHaveLength(2);
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
  });

  it('renders control buttons', () => {
    renderWithProviders(<AdvancedAnalytics />);
    
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Hide Legend')).toBeInTheDocument();
  });

  it('renders date range selector', () => {
    renderWithProviders(<AdvancedAnalytics />);
    
    expect(screen.getByDisplayValue('7d')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    expect(screen.getByText('Last 90 Days')).toBeInTheDocument();
  });
}); 