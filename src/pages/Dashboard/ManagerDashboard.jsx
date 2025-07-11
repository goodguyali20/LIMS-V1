import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { fadeIn } from '../../styles/animations';
import { FaExclamationTriangle, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PageContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
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

const ManagerDashboard = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryAlerts = async () => {
      const itemsQuery = query(collection(db, "inventoryItems"));
      const itemsSnapshot = await getDocs(itemsQuery);
      
      const lowStockAlerts = [];
      const expiringAlerts = [];
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      // Using Promise.all to handle multiple async calls for lots
      await Promise.all(itemsSnapshot.docs.map(async (itemDoc) => {
        const item = { id: itemDoc.id, ...itemDoc.data() };
        
        const lotsQuery = query(collection(db, "inventoryItems", item.id, "lots"));
        const lotsSnapshot = await getDocs(lotsQuery);
        
        let totalQuantity = 0;
        lotsSnapshot.forEach(lotDoc => {
          const lot = lotDoc.data();
          totalQuantity += lot.quantity;

          // Check for expiring lots
          const expiryDate = lot.expiryDate.toDate();
          if (expiryDate < thirtyDaysFromNow && expiryDate > now) {
            expiringAlerts.push({ ...item, lotNumber: lot.lotNumber, expiryDate });
          }
        });

        // Check for low stock
        if (totalQuantity <= item.lowStockThreshold) {
          lowStockAlerts.push({ ...item, totalQuantity });
        }
      }));

      setLowStockItems(lowStockAlerts);
      setExpiringItems(expiringAlerts);
      setLoading(false);
    };

    fetchInventoryAlerts();
  }, []);

  return (
    <PageContainer>
        <Card>
            <CardHeader><FaBell /> System Alerts</CardHeader>
            {loading ? (
                <p>Loading alerts...</p>
            ) : (
                <AlertList>
                    {lowStockItems.length === 0 && expiringItems.length === 0 && <p>No system alerts. Everything looks good!</p>}
                    {lowStockItems.map(item => (
                        <AlertItem key={item.id} type="error">
                            <FaExclamationTriangle/>
                            <div>
                                <strong>Low Stock Alert:</strong> <AlertLink to={`/inventory/${item.id}`}>{item.name}</AlertLink> is running low. Only {item.totalQuantity} remaining.
                            </div>
                        </AlertItem>
                    ))}
                    {expiringItems.map(item => (
                        <AlertItem key={`${item.id}-${item.lotNumber}`} type="warning">
                             <FaExclamationTriangle/>
                             <div>
                                <strong>Expiry Alert:</strong> Lot {item.lotNumber} of <AlertLink to={`/inventory/${item.id}`}>{item.name}</AlertLink> will expire on {item.expiryDate.toLocaleDateString()}.
                             </div>
                        </AlertItem>
                    ))}
                </AlertList>
            )}
        </Card>
      
      {/* Other dashboard cards like charts would go here */}

    </PageContainer>
  );
};

export default ManagerDashboard;