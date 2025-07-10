import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, getCountFromServer, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaHourglassHalf, FaCheckCircle, FaUsers, FaFileExport, FaChartPie, FaClock } from 'react-icons/fa';

//--- STYLED COMPONENTS ---//
const StatsGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 32px; `;
const StatCard = styled.div` background: ${({ theme }) => theme.cardBg}; ${({ theme }) => theme.squircle(24)}; padding: 24px; box-shadow: ${({ theme }) => theme.shadow}; display: flex; align-items: center; gap: 20px; position: relative; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; &:hover { transform: translateY(-8px); box-shadow: 0 12px 28px rgba(0,0,0,0.1); } &::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${({ color }) => color}; } `;
const StatIcon = styled.div` font-size: 2rem; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; color: ${({ color }) => color}; background-color: ${({ color }) => color}2A; ${({ theme }) => theme.squircle(16)}; `;
const StatInfo = styled.div` h3 { font-size: 2.5rem; font-weight: 700; } p { color: ${({ theme }) => theme.text}99; font-weight: 500; } `;
const MainContentGrid = styled.div` display: grid; grid-template-columns: 2fr 1fr; gap: 32px; @media (max-width: 1200px) { grid-template-columns: 1fr; } `;
const ContentBox = styled.div` background: ${({ theme }) => theme.cardBg}; ${({ theme }) => theme.squircle(24)}; padding: 24px; box-shadow: ${({ theme }) => theme.shadow}; `;
const BoxTitle = styled.h2` margin-bottom: 24px; font-size: 1.5rem; display: flex; justify-content: space-between; align-items: center; `;
const ChartContainer = styled.div` height: 350px; `;
const ItemCard = styled.div` border: 1px solid ${({ theme }) => theme.borderColor}; ${({ theme }) => theme.squircle(16)}; padding: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; transition: background-color 0.2s ease; &:hover { background-color: ${({ theme }) => theme.body}; } `;
const ItemInfo = styled.div` p { margin: 0; font-weight: 600; } span { font-size: 0.9rem; color: ${({ theme }) => theme.text}99; direction: ltr; display: block; margin-top: 4px; } `;
const ActionButton = styled.button` padding: 10px 16px; margin-left: 10px; color: white; font-weight: 600; border: none; cursor: pointer; background: ${({ color }) => color}; transition: transform 0.2s ease; ${({ theme }) => theme.squircle(12)}; &:hover { transform: scale(1.05); } `;
const ExportButton = styled(ActionButton)` background: ${({ theme }) => theme.success}; display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 0.9rem; margin-left: 0; `;
const EmptyState = styled.div` text-align: center; padding: 40px; color: ${({ theme }) => theme.text}99; `;

const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const ManagerDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();
    const [stats, setStats] = useState({ pending: 0, verifiedToday: 0, newPatients: 0, avgTAT: 'N/A' });
    const [chartData, setChartData] = useState([]);
    const [testVolumeData, setTestVolumeData] = useState([]);
    const [pendingVerification, setPendingVerification] = useState([]);
    const [loading, setLoading] = useState(true);

    const today = useMemo(() => new Date(), []);
    const startOfToday = useMemo(() => new Date(today.setHours(0, 0, 0, 0)), [today]);
    const thirtyDaysAgo = useMemo(() => new Date(new Date().setDate(today.getDate() - 30)), [today]);

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
                
                const [verifiedCount, newPatientsCount] = await Promise.all([ getCountFromServer(verifiedTodayQ), getCountFromServer(newPatientsQ) ]);
                setStats(prev => ({ ...prev, verifiedToday: verifiedCount.data().count, newPatients: newPatientsCount.data().count }));

                // Calculate Average TAT from last 50 verified orders
                const tatQuery = query(collection(db, 'testOrders'), where('status', '==', 'verified'), where('verifiedAt', '!=', null), orderBy('verifiedAt', 'desc'), limit(50));
                const tatSnapshot = await getDocs(tatQuery);
                let totalTAT = 0;
                let tatCount = 0;
                tatSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.collectedAt && data.verifiedAt) {
                        const tat = data.verifiedAt.toMillis() - data.collectedAt.toMillis();
                        totalTAT += tat;
                        tatCount++;
                    }
                });
                const avgTATMinutes = tatCount > 0 ? (totalTAT / tatCount / 1000 / 60) : 0;
                setStats(prev => ({ ...prev, avgTAT: `${avgTATMinutes.toFixed(0)} min` }));

                // Calculate Test Volume
                const volumeQuery = query(collection(db, 'testOrders'), where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)));
                const volumeSnapshot = await getDocs(volumeQuery);
                const testCounts = {};
                volumeSnapshot.forEach(doc => {
                    doc.data().tests.forEach(testName => {
                        testCounts[testName] = (testCounts[testName] || 0) + 1;
                    });
                });
                const volumeData = Object.entries(testCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
                setTestVolumeData(volumeData);

                // Bar Chart data logic remains the same
                // ...
                
                return () => unsubscribePending();
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Failed to load dashboard data. An index may be required.");
            } finally {
                setLoading(false);
            }
        };
        const unsubscribePromise = fetchData();
        return () => { unsubscribePromise.then(unsub => unsub && unsub()); };
    }, [startOfToday, thirtyDaysAgo]);

    const handleVerify = async (orderId) => {
        try {
            await updateDoc(doc(db, 'testOrders', orderId), { status: 'verified', verifiedAt: serverTimestamp() });
            const resultQuery = query(collection(db, 'testResults'), where('orderId', '==', orderId));
            const resultSnapshot = await getDocs(resultQuery);
            if (!resultSnapshot.empty) await updateDoc(resultSnapshot.docs[0].ref, { status: 'verified' });
            toast.success("Report verified successfully!");
        } catch (error) {
            console.error("Error verifying report:", error);
            toast.error("Failed to verify report.");
        }
    };

    const exportToCSV = () => {
        const headers = ["Patient Name", "Tests", "Status", "Priority"];
        const rows = pendingVerification.map(order => [
            `"${order.patientName}"`,
            `"${order.tests.join(', ')}"`,
            order.status,
            order.priority || 'routine'
        ].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "pending_verification_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && pendingVerification.length === 0) return <div>Loading Dashboard...</div>;

    return (
        <div className="fade-in">
            <StatsGrid>
                <StatCard color={theme.warning}><StatIcon color={theme.warning}><FaHourglassHalf /></StatIcon><StatInfo><h3>{stats.pending}</h3><p>Pending Verification</p></StatInfo></StatCard>
                <StatCard color={theme.success}><StatIcon color={theme.success}><FaCheckCircle /></StatIcon><StatInfo><h3>{stats.verifiedToday}</h3><p>Reports Verified Today</p></StatInfo></StatCard>
                <StatCard color={theme.primary}><StatIcon color={theme.primary}><FaUsers /></StatIcon><StatInfo><h3>{stats.newPatients}</h3><p>New Patients Today</p></StatInfo></StatCard>
                <StatCard color="#8884d8"><StatIcon color="#8884d8"><FaClock /></StatIcon><StatInfo><h3>{stats.avgTAT}</h3><p>Avg. Turnaround Time</p></StatInfo></StatCard>
            </StatsGrid>

            <MainContentGrid>
                <ContentBox>
                    <BoxTitle>Test Volume (Last 30 Days)</BoxTitle>
                    <ChartContainer>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={testVolumeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {testVolumeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </ContentBox>
                <ContentBox>
                    <BoxTitle>
                        <span>Verification Queue</span>
                        <ExportButton onClick={exportToCSV}><FaFileExport /> Export CSV</ExportButton>
                    </BoxTitle>
                     {pendingVerification.map(order => (
                        <ItemCard key={order.id}>
                            <ItemInfo><p>{order.patientName}</p><span>{order.tests.join(', ')}</span></ItemInfo>
                            <div><ActionButton onClick={() => navigate(`/report/${order.id}`)} color={theme.primaryGradient}>{t('viewReport')}</ActionButton></div>
                        </ItemCard>
                    ))}
                    {pendingVerification.length === 0 && <EmptyState>The verification queue is empty.</EmptyState>}
                </ContentBox>
            </MainContentGrid>
        </div>
    );
};

export default ManagerDashboard;