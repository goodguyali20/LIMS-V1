import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../contexts/ThemeContext.jsx';
import { AuthProvider } from '../../contexts/AuthContext.jsx';
import { TestProvider } from '../../contexts/TestContext.jsx';
import { NotificationProvider } from '../../contexts/NotificationContext.tsx';
import { OrderProvider } from '../../contexts/OrderContext.jsx';
import { SettingsProvider } from '../../contexts/SettingsContext.jsx';
import AdvancedAnalytics from '../../components/Analytics/AdvancedAnalytics.jsx';

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  ScatterChart: ({ children }) => <div data-testid="scatter-chart">{children}</div>,
  Scatter: () => <div data-testid="scatter" />,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date) => 'Jan 01'),
  subDays: jest.fn((date, days) => new Date()),
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TestProvider>
            <NotificationProvider>
              <OrderProvider>
                <SettingsProvider>
                  {component}
                </SettingsProvider>
              </OrderProvider>
            </NotificationProvider>
          </TestProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('AdvancedAnalytics', () => {
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