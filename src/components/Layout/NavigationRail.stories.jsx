import React from 'react';
import NavigationRail from './NavigationRail';
import './NavigationRail.css';

export default {
  title: 'Layout/NavigationRail',
  component: NavigationRail,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    activePath: {
      control: 'select',
      options: [
        '/app/dashboard',
        '/app/orders', 
        '/app/registration',
        '/app/phlebotomy',
        '/app/work-queue',
        '/app/history',
        '/app/quality-control',
        '/app/inventory'
      ],
      defaultValue: '/app/dashboard'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ 
        height: '100vh', 
        background: 'linear-gradient(rgb(30, 41, 59) 0%, rgb(15, 23, 42) 100%)',
        display: 'flex'
      }}>
        <Story />
      </div>
    ),
  ],
};

// Mock the useLocation hook to control active state
const MockNavigationRail = ({ activePath }) => {
  // Create a mock location object
  const mockLocation = { pathname: activePath };
  
  // Mock the useLocation hook
  const originalUseLocation = require('react-router-dom').useLocation;
  require('react-router-dom').useLocation = () => mockLocation;
  
  return <NavigationRail />;
};

export const Default = {
  args: {
    activePath: '/app/dashboard',
  },
  render: (args) => <MockNavigationRail {...args} />
};

export const ActiveOrders = {
  args: {
    activePath: '/app/orders',
  },
  render: (args) => <MockNavigationRail {...args} />
};

export const ActiveRegistration = {
  args: {
    activePath: '/app/registration',
  },
  render: (args) => <MockNavigationRail {...args} />
};

export const DebugNotches = {
  args: {
    activePath: '/app/dashboard',
  },
  render: (args) => (
    <div style={{ 
      height: '100vh', 
      background: 'linear-gradient(rgb(30, 41, 59) 0%, rgb(15, 23, 42) 100%)',
      display: 'flex',
      padding: '20px'
    }}>
      <MockNavigationRail {...args} />
      <div style={{ 
        flex: 1, 
        background: 'rgb(15, 23, 42)', 
        marginLeft: '20px',
        padding: '20px',
        color: 'white'
      }}>
        <h2>Debug Panel</h2>
        <p>Active Path: {args.activePath}</p>
        <p>Sidebar Background: linear-gradient(rgb(30, 41, 59) 0%, rgb(15, 23, 42) 100%)</p>
        <p>Page Background: rgb(15, 23, 42)</p>
        <p>Notch Color: linear-gradient(rgb(30, 41, 59) 0%, rgb(15, 23, 42) 100%)</p>
      </div>
    </div>
  )
}; 