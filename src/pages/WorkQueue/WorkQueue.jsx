import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { fadeIn } from '../../styles/animations';
import OrderCard from '../../components/WorkQueue/OrderCard'; // We'll create this next

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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query for orders that are not yet 'Completed' or 'Rejected'
    const q = query(
      collection(db, "testOrders"), 
      where("status", "in", ["Pending Sample", "Sample Collected", "In Progress"])
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = [];
      querySnapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() });
      });
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  if (loading) {
    return <p>Loading work queue...</p>;
  }

  return (
    <PageContainer>
      <PageHeader>Active Work Queue</PageHeader>
      {orders.length > 0 ? (
        orders.map(order => <OrderCard key={order.id} order={order} />)
      ) : (
        <EmptyState>
          <p>🎉 No active orders in the queue. Great job!</p>
        </EmptyState>
      )}
    </PageContainer>
  );
};

export default WorkQueue;