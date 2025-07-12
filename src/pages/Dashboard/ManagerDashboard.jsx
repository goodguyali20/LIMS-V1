import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { fadeIn } from '../../styles/animations';
import { FaExclamationTriangle, FaBell, FaChartPie } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PageContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
`;

const FullWidthCard = styled(Card)`
    grid-column: 1 / -1;
`;

const CardHeader = styled.h2`
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AlertList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const AlertItem = styled.li`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 12px;
    background-color: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme, type }) => type === 'error' ? theme.colors.error : theme.colors.border};

    svg {
        color: ${({ theme, type }) => type === 'error' ? theme.colors.error : 'orange'};
        font-size: 1.5rem;
        flex-shrink: 0;
    }
`;

const AlertLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    font-weight: 500;
    &:hover {
        text-decoration: underline;
    }
`;

const ChartWrapper = styled.div`
    height: 400px;
`;

const ManagerDashboard = () => {
  const { t } = useTranslation();
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [testVolumeData, setTestVolumeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsQuery = query(collection(db, "inventoryItems"));
        const itemsSnapshot = await getDocs(itemsQuery);
        
        const lowStockAlerts = [];
        const expiringAlerts = [];
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        await Promise.all(itemsSnapshot.docs.map(async (itemDoc) => {
          const item = { id: itemDoc.id, ...itemDoc.data() };
          const lotsQuery = query(collection(db, "inventoryItems", item.id, "lots"));
          const lotsSnapshot = await getDocs(lotsQuery);
          let totalQuantity = 0;
          lotsSnapshot.forEach(lotDoc => {
            const lot = lotDoc.data();
            if (typeof lot.quantity === 'number') totalQuantity += lot.quantity;
            if (lot.expiryDate?.toDate) {
              const expiryDate = lot.expiryDate.toDate();
              if (expiryDate < thirtyDaysFromNow && expiryDate > now) {
                expiringAlerts.push({ ...item, lotNumber: lot.lotNumber, expiryDate });
              }
            }
          });
          if (typeof item.lowStockThreshold === 'number' && totalQuantity <= item.lowStockThreshold) {
            lowStockAlerts.push({ ...item, totalQuantity });
          }
        }));

        setLowStockItems(lowStockAlerts);
        setExpiringItems(expiringAlerts);

        const ordersQuery = query(collection(db, "testOrders"), where("status", "in", ["Completed", "Verified", "Amended"]));
        const ordersSnapshot = await getDocs(ordersQuery);
        const testCounts = {};
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            order.tests.forEach(testName => {
                testCounts[testName] = (testCounts[testName] || 0) + 1;
            });
        });
        const chartData = Object.entries(testCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
        
        setTestVolumeData(chartData);

      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
        setError("Could not load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <PageContainer>
        <FullWidthCard>
            <CardHeader><FaBell /> {t('dashboard_alerts_header')}</CardHeader>
            {loading ? <p>Loading alerts...</p> : error ? <p style={{color: 'red'}}>{error}</p> : (
                <AlertList>
                    {lowStockItems.length === 0 && expiringItems.length === 0 && <p>{t('dashboard_alerts_none')}</p>}
                    
                    {lowStockItems.map(item => (
                        <AlertItem key={item.id} type="error">
                            <FaExclamationTriangle/>
                            <div>
                                <strong>{t('dashboard_alerts_lowStock')}</strong> 
                                <AlertLink to={`/inventory/${item.id}`}>{item.name}</AlertLink> {t('dashboard_alerts_lowStock_part2')} {item.totalQuantity} {t('dashboard_alerts_lowStock_part3')}
                            </div>
                        </AlertItem>
                    ))}
                    
                    {expiringItems.map(item => (
                        <AlertItem key={`${item.id}-${item.lotNumber}`} type="warning">
                             <FaExclamationTriangle/>
                             <div>
                                <strong>{t('dashboard_alerts_expiry')}</strong> {t('dashboard_alerts_expiry_part2')} {item.lotNumber} {t('dashboard_alerts_expiry_part3')} 
                                <AlertLink to={`/inventory/${item.id}`}>{item.name}</AlertLink> {t('dashboard_alerts_expiry_part4')} {item.expiryDate.toLocaleDateString()}.
                             </div>
                        </AlertItem>
                    ))}
                </AlertList>
            )}
        </FullWidthCard>

        <Card>
            <CardHeader><FaChartPie /> Test Volume</CardHeader>
            {loading ? <p>Loading chart data...</p> : (
                <ChartWrapper>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={testVolumeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                                {testVolumeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartWrapper>
            )}
        </Card>

        <Card>
            <CardHeader>Other Stats</CardHeader>
            <p>Future analytics will be displayed here.</p>
        </Card>
    </PageContainer>
  );
};

export default ManagerDashboard;