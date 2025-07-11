import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, getCountFromServer, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaHourglassHalf, FaCheckCircle, FaUsers, FaFileMedicalAlt } from 'react-icons/fa';
import { logAction } from '../utils/logAction.js'; // Import the logger

//--- STYLED COMPONENTS (Vivid Design) ---//

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  ${({ theme }) => theme.squircle(24)};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadow};
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ color }) => color};
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ color }) => color};
  background-color: ${({ color }) => color}2A;
  ${({ theme }) => theme.squircle(16)};
`;

const StatInfo = styled.div`
  h3 {
    font-size: 2.5rem;
    font-weight: 700;
  }
  p {
    color: ${({ theme }) => theme.text}99;
    font-weight: 500;
  }
`;

const MainContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ContentBox = styled.div`
  background: ${({ theme }) => theme.cardBg};
  ${({ theme }) => theme.squircle(24)};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const BoxTitle = styled.h2`
  margin-bottom: 24px;
  font-size: 1.5rem;
`;

const ChartContainer = styled.div`
  height: 350px;
`;

const ItemCard = styled.div`
  border: 1px solid ${({ theme }) => theme.borderColor};
  ${({ theme }) => theme.squircle(16)};
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.body};
  }
`;

const ItemInfo = styled.div`
  p {
    margin: 0;
    font-weight: 600;
  }
  span {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.text}99;
    direction: ltr;
    display: block;
    margin-top: 4px;
  }
`;

const ActionButton = styled.button`
    padding: 10px 16px;
    margin-left: 10px;
    color: white;
    font-weight: 600;
    border: none;
    cursor: pointer;
    background: ${({ color }) => color};
    transition: transform 0.2s ease;
    ${({ theme }) => theme.squircle(12)};

    &:hover {
        transform: scale(1.05);
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 40px;
    color: ${({ theme }) => theme.text}99;
`;


const ManagerDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();
    const [stats, setStats] = useState({ pending: 0, verifiedToday: 0, newPatients: 0 });
    const [chartData, setChartData] = useState([]);
    const [pendingVerification, setPendingVerification] = useState([]);
    const [loading, setLoading] = useState(true);

    const today = useMemo(() => new Date(), []);
    const startOfToday = useMemo(() => new Date(today.setHours(0, 0, 0, 0)), [today]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const pendingQ = query(collection(db, 'testOrders'), where('status', '==', 'pending_verification'));
                const unsubscribePending = onSnapshot(pendingQ, (snapshot) => {
                    const pendingList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setPendingVerification(pendingList);
                    setStats(prev => ({ ...prev, pending: pendingList.length }));
                });

                const verifiedTodayQ = query(collection(db, 'testOrders'), where('status', '==', 'verified'), where('createdAt', '>=', Timestamp.fromDate(startOfToday)));
                const newPatientsQ = query(collection(db, 'patients'), where('registeredAt', '>=', Timestamp.fromDate(startOfToday)));
                
                const [verifiedCount, newPatientsCount] = await Promise.all([
                    getCountFromServer(verifiedTodayQ),
                    getCountFromServer(newPatientsQ)
                ]);

                setStats(prev => ({
                    ...prev,
                    verifiedToday: verifiedCount.data().count,
                    newPatients: newPatientsCount.data().count,
                }));

                const chartPromises = [];
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const start = new Date(d.setHours(0, 0, 0, 0));
                    const end = new Date(d.setHours(23, 59, 59, 999));
                    
                    const q = query(collection(db, 'testOrders'), where('createdAt', '>=', start), where('createdAt', '<=', end));
                    chartPromises.push(getCountFromServer(q));
                }
                const dailyCounts = await Promise.all(chartPromises);
                const formattedChartData = dailyCounts.map((snapshot, i) => {
                     const d = new Date();
                     d.setDate(d.getDate() - (6-i));
                     return { name: days[d.getDay()], Tests: snapshot.data().count }
                });
                setChartData(formattedChartData);
                
                return () => unsubscribePending();

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Failed to load dashboard data. An index may be required.");
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = fetchData();
        return () => {
            unsubscribe.then(unsub => unsub && unsub());
        };
    }, [startOfToday]);

    const handleVerify = async (order) => {
        try {
            const orderRef = doc(db, 'testOrders', order.id);
            await updateDoc(orderRef, { status: 'verified', verifiedAt: serverTimestamp() });
            
            const resultQuery = query(collection(db, 'testResults'), where('orderId', '==', order.id));
            const resultSnapshot = await getDocs(resultQuery);
            if (!resultSnapshot.empty) {
                const resultDocRef = resultSnapshot.docs[0].ref;
                await updateDoc(resultDocRef, { status: 'verified' });
            }

            // Log the action
            await logAction('Report Verified', { orderId: order.id, patientName: order.patientName });

            toast.success("Report verified successfully!");
        } catch (error) {
            console.error("Error verifying report:", error);
            toast.error("Failed to verify report.");
        }
    };

    if (loading && pendingVerification.length === 0) {
        return <div>Loading Dashboard...</div>; // Add a proper loader component later
    }

    return (
        <div className="fade-in">
            <StatsGrid>
                <StatCard color={theme.warning}>
                    <StatIcon color={theme.warning}><FaHourglassHalf /></StatIcon>
                    <StatInfo>
                        <h3>{stats.pending}</h3>
                        <p>Pending Verification</p>
                    </StatInfo>
                </StatCard>
                <StatCard color={theme.success}>
                    <StatIcon color={theme.success}><FaCheckCircle /></StatIcon>
                    <StatInfo>
                        <h3>{stats.verifiedToday}</h3>
                        <p>Reports Verified Today</p>
                    </StatInfo>
                </StatCard>
                <StatCard color={theme.primary}>
                    <StatIcon color={theme.primary}><FaUsers /></StatIcon>
                    <StatInfo>
                        <h3>{stats.newPatients}</h3>
                        <p>New Patients Today</p>
                    </StatInfo>
                </StatCard>
            </StatsGrid>

            <MainContentGrid>
                <ContentBox>
                    <BoxTitle>Weekly Lab Activity</BoxTitle>
                    <ChartContainer>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.borderColor} />
                                <XAxis dataKey="name" tick={{ fill: theme.text }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: theme.text }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: theme.primary + '1A'}} contentStyle={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}`, borderRadius: '12px' }}/>
                                <Bar dataKey="Tests" fill={theme.primary} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </ContentBox>
                <ContentBox>
                    <BoxTitle>Verification Queue</BoxTitle>
                     {pendingVerification.map(order => (
                        <ItemCard key={order.id}>
                            <ItemInfo>
                                <p>{order.patientName}</p>
                                <span>{order.tests.join(', ')}</span>
                            </ItemInfo>
                            <div>
                                <ActionButton onClick={() => navigate(`/report/${order.id}`)} color={theme.primaryGradient}>{t('viewReport')}</ActionButton>
                                {/* The Verification button was missing, I have added it back */}
                                <ActionButton onClick={() => handleVerify(order)} color={theme.success}>{t('verifyResults')}</ActionButton>
                            </div>
                        </ItemCard>
                    ))}
                    {pendingVerification.length === 0 && <EmptyState>The verification queue is empty.</EmptyState>}
                </ContentBox>
            </MainContentGrid>
        </div>
    );
};

export default ManagerDashboard;