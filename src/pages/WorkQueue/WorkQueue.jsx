import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { fadeIn } from '../../styles/animations';
import OrderCard from '../../components/WorkQueue/OrderCard';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const PageContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PageHeader = styled.h1`
  margin-bottom: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  p {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const WorkQueue = () => {
  const { t } = useTranslation(); // <-- Add this
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "testOrders"), 
      where("status", "in", ["Pending Sample", "Sample Collected", "In Progress", "Rejected"])
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = [];
      querySnapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() });
      });
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>{t('workqueue_loading')}</p>;
  }

  return (
    <PageContainer>
      <PageHeader>{t('workqueue_header')}</PageHeader>
      {orders.length > 0 ? (
        orders.map(order => <OrderCard key={order.id} order={order} />)
      ) : (
        <EmptyState>
          <p>🎉 {t('workqueue_empty')}</p>
        </EmptyState>
      )}
    </PageContainer>
  );
};

export default WorkQueue;