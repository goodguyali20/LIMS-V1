import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { advancedVariants } from '../../styles/animations';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  animation: ${advancedVariants.fadeIn} 0.5s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100vh;
  background: ${({ theme }) => theme.isDarkMode 
    ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
    : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
  };
  background-attachment: fixed;
  padding: 2rem;
`;

const PageHeader = styled.h1`
  margin-bottom: 0;
`;

const ChartContainer = styled.div`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(20px);
  height: 500px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 16px 16px 0 0;
  }
`;

const WorkloadView = () => {
  const [workloadData, setWorkloadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchWorkload = async () => {
      // For this to work, your 'testOrders' documents need a field 
      // like 'verifiedBy' or 'completedBy' when an order is finished.
      const ordersQuery = query(
        collection(db, "testOrders"), 
        where("status", "in", ["Completed", "Verified", "Amended"])
      );

      const querySnapshot = await getDocs(ordersQuery);
      const workloadCounts = {};

      querySnapshot.forEach(doc => {
        const order = doc.data();
        // We assume a 'verifiedBy' field exists with the user's email or name
        const technician = order.verifiedBy; 

        if (technician) {
          if (workloadCounts[technician]) {
            // Add the number of tests in this order to the user's total
            workloadCounts[technician] += order.tests.length;
          } else {
            workloadCounts[technician] = order.tests.length;
          }
        }
      });

      // Convert the aggregated object into an array for the chart
      const chartData = Object.keys(workloadCounts).map(technicianName => ({
        name: technicianName,
        testsCompleted: workloadCounts[technicianName]
      }));

      setWorkloadData(chartData);
      setLoading(false);
    };

    fetchWorkload();
  }, [setWorkloadData, setLoading]);

  if (loading) {
    return <p>{t('loadingWorkload')}</p>;
  }

  return (
    <PageContainer>
      <PageHeader>{t('technicianWorkload')}</PageHeader>
      <ChartContainer>
        {workloadData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={workloadData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{fill: 'rgba(238, 238, 238, 0.4)'}}/>
              <Legend />
              <Bar dataKey="testsCompleted" fill="#8884d8" name="Tests Completed" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>{t('noCompletedTestData')}</p>
        )}
      </ChartContainer>
    </PageContainer>
  );
};

export default WorkloadView;