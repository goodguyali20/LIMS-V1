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
    <div style={{ padding: '2rem' }}>
      <h2>Search Results for "{query}"</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 8,
              border: 'none',
              background: activeTab === tab.key ? theme.colors.primary : theme.colors.surface,
              color: activeTab === tab.key ? '#fff' : theme.colors.text,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: activeTab === tab.key ? theme.shadows.glow.primary : 'none',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div>Loading...</div>
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
  );
};

export default SearchResults; 