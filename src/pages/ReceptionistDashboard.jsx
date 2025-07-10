import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import RegistrationForm from '../components/RegistrationForm.jsx';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';

//--- STYLED COMPONENTS ---//
const DashboardLayout = styled.div`
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
  font-size: 1.5rem;
  margin-bottom: 24px;
`;

const PatientListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }
`;

const PatientInfo = styled.div`
    p {
        margin: 0;
        font-weight: 600;
    }
    span {
        font-size: 0.9rem;
        color: ${({ theme }) => theme.text}99;
    }
`;


const ReceptionistDashboard = () => {
    const [recentPatients, setRecentPatients] = useState([]);
    
    // Using useCallback is not strictly necessary here since the dependency array is empty,
    // but it's good practice if we were to add dependencies later.
    const fetchRecentPatients = useCallback(() => {
        const q = query(collection(db, "patients"), orderBy("registeredAt", "desc"), limit(5));
        
        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const patients = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRecentPatients(patients);
        }, (error) => {
            console.error("Error fetching recent patients: ", error);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = fetchRecentPatients();
        return () => unsubscribe(); // Cleanup the listener when the component unmounts
    }, [fetchRecentPatients]);

    return (
        <div className="fade-in">
            <DashboardLayout>
                <RegistrationForm onPatientRegistered={() => { /* No longer needed as onSnapshot handles updates */ }} />
                <ContentBox>
                    <BoxTitle>Recently Registered</BoxTitle>
                    {recentPatients.length > 0 ? (
                        recentPatients.map(patient => (
                            <PatientListItem key={patient.id}>
                                <PatientInfo>
                                    <p>{patient.name}</p>
                                    <span>{patient.registeredAt ? format(patient.registeredAt.toDate(), 'PPpp') : '...'}</span>
                                </PatientInfo>
                            </PatientListItem>
                        ))
                    ) : (
                        <p>No patients registered recently.</p>
                    )}
                </ContentBox>
            </DashboardLayout>
        </div>
    );
};

export default ReceptionistDashboard;