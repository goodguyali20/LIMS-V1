import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { FaUser, FaClock, FaInfoCircle } from 'react-icons/fa';

//--- STYLED COMPONENTS ---//
const LogContainer = styled.div`
  background: ${({ theme }) => theme.cardBg};
  ${({ theme }) => theme.squircle(24)};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 24px;
`;

const LogItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};

  &:last-child {
    border-bottom: none;
  }
`;

const LogIcon = styled.div`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.primary};
  margin-top: 2px;
`;

const LogContent = styled.div`
  flex-grow: 1;
`;

const LogAction = styled.p`
  margin: 0;
  font-weight: 600;
`;

const LogMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text}99;
  margin-top: 4px;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const LogDetails = styled.pre`
  background: ${({ theme }) => theme.body};
  border: 1px solid ${({ theme }) => theme.borderColor};
  ${({ theme }) => theme.squircle(12)};
  padding: 12px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text}BF;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin-top: 8px;
`;


const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const logQuery = query(collection(db, 'auditLog'), orderBy('timestamp', 'desc'), limit(100));
                const logSnapshot = await getDocs(logQuery);
                const logData = logSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLogs(logData);
            } catch (error) {
                console.error("Error fetching audit logs:", error);
            }
            setLoading(false);
        };
        fetchLogs();
    }, []);

    if (loading) {
        return <div>Loading Audit Log...</div>;
    }

    return (
        <div className="fade-in">
            <LogContainer>
                <Title>System Audit Log</Title>
                {logs.map(log => (
                    <LogItem key={log.id}>
                        <LogIcon><FaInfoCircle /></LogIcon>
                        <LogContent>
                            <LogAction>{log.action}</LogAction>
                            <LogMeta>
                                <span><FaUser /> {log.userEmail}</span>
                                <span><FaClock /> {log.timestamp ? format(log.timestamp.toDate(), 'PPpp') : 'No timestamp'}</span>
                            </LogMeta>
                            {log.details && Object.keys(log.details).length > 0 && (
                                <LogDetails>{JSON.stringify(log.details, null, 2)}</LogDetails>
                            )}
                        </LogContent>
                    </LogItem>
                ))}
            </LogContainer>
        </div>
    );
};

export default AuditLogPage;