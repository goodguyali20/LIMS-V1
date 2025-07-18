import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import styled from 'styled-components';
import { FaUser, FaIdCard, FaVenusMars, FaPhone, FaEnvelope, FaCalendarAlt, FaFlask, FaArrowLeft, FaNotesMedical, FaCheckCircle, FaHeartbeat } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

const PageContainer = styled.div`
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.08), 0 4px 16px rgba(0,0,0,0.04);
  position: relative;
  min-height: 60vh;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem 2rem;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Label = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Value = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'ready_for_collection': return theme.colors.warning + '20';
      case 'sample_collected': return theme.colors.success + '20';
      case 'in_progress': return theme.colors.info + '20';
      default: return theme.colors.textSecondary + '20';
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'ready_for_collection': return theme.colors.warning;
      case 'sample_collected': return theme.colors.success;
      case 'in_progress': return theme.colors.info;
      default: return theme.colors.textSecondary;
    }
  }};
`;

const TestsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TestItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: ${({ theme }) => theme.colors.text};
`;

const NoteBox = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  padding: 1rem;
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 2rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  color: ${({ theme }) => theme.colors.textSecondary};
  gap: 1.5rem;
`;

const PatientDetails = () => {
  const { patientId } = useParams();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, 'patients', patientId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPatient({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError(t('patient.notFound') || 'Patient not found');
        }
      } catch (e) {
        setError(t('patient.fetchError') || 'Failed to fetch patient');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [patientId, t]);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ready_for_collection':
        return <><FaHeartbeat /> {t('phlebotomistView.readyForCollection')}</>;
      case 'sample_collected':
        return <><FaCheckCircle /> {t('phlebotomistView.sampleCollected')}</>;
      case 'in_progress':
        return <><FaNotesMedical /> {t('phlebotomistView.inProgress')}</>;
      default:
        return status;
    }
  };

  return (
    <PageContainer theme={theme}>
      <BackButton theme={theme} onClick={() => navigate(-1)}>
        <FaArrowLeft /> {t('backButton') || 'Back'}
      </BackButton>
      {loading ? (
        <LoadingContainer theme={theme}>
          <FaUser size={48} />
          <div>{t('loadingSettings') || 'Loading...'}</div>
        </LoadingContainer>
      ) : error ? (
        <LoadingContainer theme={theme}>
          <FaUser size={48} />
          <div>{error}</div>
        </LoadingContainer>
      ) : (
        <>
          <Section>
            <SectionTitle theme={theme}><FaUser /> {t('patientInformation')}</SectionTitle>
            <InfoGrid>
              <InfoItem><Label>{t('fullNameLabel')}</Label><Value>{patient.patientName || patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`}</Value></InfoItem>
              <InfoItem><Label>{t('patientIdLabel')}</Label><Value>{patient.patientId}</Value></InfoItem>
              <InfoItem><Label>{t('ageLabel')}</Label><Value>{typeof patient.age === 'object' && patient.age !== null ? `${patient.age.value} ${patient.age.unit}` : patient.age}</Value></InfoItem>
              <InfoItem><Label>{t('genderLabel')}</Label><Value>{patient.gender}</Value></InfoItem>
              <InfoItem><Label><FaPhone /> {t('phoneNumberLabel')}</Label><Value>{patient.phoneNumber || patient.phone}</Value></InfoItem>
              <InfoItem><Label><FaEnvelope /> {t('emailLabel')}</Label><Value>{patient.email}</Value></InfoItem>
              <InfoItem><Label><FaCalendarAlt /> {t('dateOfBirthLabel')}</Label><Value>{patient.dateOfBirth ? (typeof patient.dateOfBirth === 'string' ? patient.dateOfBirth : new Date(patient.dateOfBirth).toLocaleDateString()) : '-'}</Value></InfoItem>
              <InfoItem><Label>{t('addressLabel')}</Label><Value>{patient.address ? (typeof patient.address === 'string' ? patient.address : Object.values(patient.address).join(', ')) : '-'}</Value></InfoItem>
              <InfoItem><Label>{t('registration_header')}</Label><Value>{patient.createdAt ? (patient.createdAt.toDate ? patient.createdAt.toDate().toLocaleString() : new Date(patient.createdAt).toLocaleString()) : '-'}</Value></InfoItem>
              <InfoItem><Label>{t('phlebotomistView.readyForCollection')}</Label><StatusBadge status={patient.bloodCollectionStatus} theme={theme}>{getStatusLabel(patient.bloodCollectionStatus)}</StatusBadge></InfoItem>
            </InfoGrid>
          </Section>

          {patient.selectedTests && patient.selectedTests.length > 0 && (
            <Section>
              <SectionTitle theme={theme}><FaFlask /> {t('testsLabel')}</SectionTitle>
              <TestsList>
                {patient.selectedTests.map((test, idx) => (
                  <TestItem key={idx} theme={theme}><FaFlask /> {typeof test === 'string' ? test : test.name || test.id}</TestItem>
                ))}
              </TestsList>
            </Section>
          )}

          {patient.notes && (
            <Section>
              <SectionTitle theme={theme}><FaNotesMedical /> {t('notesLabel')}</SectionTitle>
              <NoteBox theme={theme}>{patient.notes}</NoteBox>
            </Section>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default PatientDetails; 