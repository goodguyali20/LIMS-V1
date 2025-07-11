import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fadeIn } from '../../styles/animations';

const PageContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PageHeader = styled.h1`
  margin-bottom: 0;
`;

const ChartContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
  height: 500px;
`;

const WorkloadView = () => {
  const [workloadData, setWorkloadData] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  if (loading) {
    return <p>Loading workload data...</p>;
  }

  return (
    <PageContainer>
      <PageHeader>Technician Workload</PageHeader>
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
          <p>No completed test data found to display.</p>
        )}
      </ChartContainer>
    </PageContainer>
  );
};

export default WorkloadView;