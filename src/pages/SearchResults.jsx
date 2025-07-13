import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AnimatedDataTable from '../components/common/AnimatedDataTable';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { FaFileMedical, FaUser, FaBoxOpen } from 'react-icons/fa';

const TABS = [
  { key: 'orders', label: 'Orders', icon: <FaFileMedical /> },
  { key: 'patients', label: 'Patients', icon: <FaUser /> },
  { key: 'inventory', label: 'Inventory', icon: <FaBoxOpen /> },
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const query = useQuery().get('query') || '';
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [inventory, setInventory] = useState([]);
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // Simulate fetching all data in parallel (replace with real fetches)
    Promise.all([
      import('./Orders.jsx').then(m => m.default),
      import('./PatientHistory/PatientHistory.jsx').then(m => m.default),
      import('./Inventory/Inventory.jsx').then(m => m.default),
    ]).then(() => {
      // TODO: Replace with actual data fetching logic
      setOrders([]); // Fetch and filter orders by query
      setPatients([]); // Fetch and filter patients by query
      setInventory([]); // Fetch and filter inventory by query
      setLoading(false);
    });
  }, [query]);

  // Placeholder: Replace with real columns and data
  const orderColumns = [
    { key: 'id', label: 'Order ID' },
    { key: 'patientName', label: 'Patient' },
    { key: 'patientId', label: 'Patient ID' },
    { key: 'status', label: 'Status' },
  ];
  const patientColumns = [
    { key: 'patientId', label: 'Patient ID' },
    { key: 'name', label: 'Name' },
    { key: 'primaryDiagnosis', label: 'Diagnosis' },
    { key: 'status', label: 'Status' },
  ];
  const inventoryColumns = [
    { key: 'name', label: 'Item' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
    { key: 'quantity', label: 'Quantity' },
  ];

  return (
    <div style={{ 
      padding: '2rem',
      minHeight: '100vh',
      background: theme.isDarkMode 
        ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
        : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`,
      backgroundAttachment: 'fixed'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '2rem',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
          borderRadius: '20px 20px 0 0'
        }} />
        
        <h2 style={{ 
          marginBottom: '1.5rem',
          fontSize: '2rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Search Results for "{query}"
        </h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: activeTab === tab.key 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                color: activeTab === tab.key ? '#fff' : theme.colors.text,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: activeTab === tab.key ? '0 8px 25px rgba(102, 126, 234, 0.3)' : 'none',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(20px)',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: theme.colors.textSecondary
          }}>
            Loading...
          </div>
        ) : (
          <>
            {activeTab === 'orders' && (
              <AnimatedDataTable
                data={orders}
                columns={orderColumns}
                title="Orders"
                onRowClick={row => navigate(`/app/print-order/${row.id}`)}
              />
            )}
            {activeTab === 'patients' && (
              <AnimatedDataTable
                data={patients}
                columns={patientColumns}
                title="Patients"
                onRowClick={row => navigate(`/app/patient-history?patientId=${row.patientId}`)}
              />
            )}
            {activeTab === 'inventory' && (
              <AnimatedDataTable
                data={inventory}
                columns={inventoryColumns}
                title="Inventory"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults; 