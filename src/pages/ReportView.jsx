import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { FaPrint, FaFlask } from 'react-icons/fa';

//--- STYLED COMPONENTS ---//

const PageContainer = styled.div`
  background-color: #f0f2f5;
  padding: 40px;
  min-height: 100vh;
`;

const PrintButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background-color: #007BFF;
  color: white;
  border: none;
  ${({ theme }) => theme.squircle(12)};
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;

  @media print {
    display: none;
  }
`;

const ReportSheet = styled.div`
  max-width: 800px;
  margin: auto;
  padding: 50px;
  background: white;
  border: 1px solid #dee2e6;
  box-shadow: 0 0 20px rgba(0,0,0,0.05);
  font-family: 'Times New Roman', serif;
`;

const ReportHeader = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;

const LabLogo = styled.div`
    color: #007BFF;
    font-size: 2rem;
    margin-bottom: 8px;
`;

const LabName = styled.h1`
  font-size: 2.5rem;
  margin: 0;
  font-weight: 700;
`;

const LabAddress = styled.p`
  margin: 4px 0 0;
  font-size: 1rem;
  color: #6c757d;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  border-bottom: 2px solid #343a40;
  padding-bottom: 8px;
  margin: 30px 0 20px 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
`;

const InfoItem = styled.div`
  font-size: 1rem;
  strong {
    color: #495057;
  }
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 1.1rem;

  th, td {
    border: 1px solid #dee2e6;
    padding: 12px;
    text-align: left;
  }
  
  thead th {
    background-color: #f8f9fa;
    font-weight: 600;
  }
`;

const Flag = styled.span`
  font-weight: 700;
  ${({ flag }) => {
    if (flag?.includes('Critical')) {
      return css`color: #DC3545;`;
    }
    if (flag === 'Low' || flag === 'High') {
      return css`color: #FFC107;`;
    }
    return css`color: inherit;`;
  }}
`;

const ReportFooter = styled.footer`
  margin-top: 50px;
  text-align: center;
  font-size: 0.9rem;
  color: #6c757d;
`;


const ReportView = () => {
  const { orderId } = useParams();
  const { t } = useTranslation();
  const [labInfo, setLabInfo] = useState(null); // State for custom lab info
  const [order, setOrder] = useState(null);
  const [patient, setPatient] = useState(null);
  const [results, setResults] = useState(null);
  const [testDefinitions, setTestDefinitions] = useState({});
  const componentRef = useRef();
  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch custom lab info
      const labInfoDoc = await getDoc(doc(db, 'settings', 'labInfo'));
      if (labInfoDoc.exists()) {
        setLabInfo(labInfoDoc.data());
      } else {
        // Set default values if none are in the database
        setLabInfo({ name: 'مستشفى العزيزية العام', address: 'Kut, Wasit Governorate, Iraq', phone: '' });
      }

      // Fetch test definitions first
      const defsRef = collection(db, 'labTests');
      const defsSnap = await getDocs(defsRef);
      const defs = {};
      defsSnap.forEach(doc => {
          defs[doc.data().name] = doc.data();
      });
      setTestDefinitions(defs);

      // Fetch order
      const orderRef = doc(db, 'testOrders', orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) return;
      const orderData = orderSnap.data();
      setOrder(orderData);

      // Fetch patient
      const patientRef = doc(db, 'patients', orderData.patientId);
      const patientSnap = await getDoc(patientRef);
      if(patientSnap.exists()) setPatient(patientSnap.data());

      // Fetch results
      const resultsQuery = query(collection(db, 'testResults'), where('orderId', '==', orderId));
      const resultsSnap = await getDocs(resultsQuery);
      if (!resultsSnap.empty) {
        setResults(resultsSnap.docs[0].data().results);
      }
    };
    fetchData();
  }, [orderId]);

  // Updated loading check to include labInfo
  if (!order || !patient || !results || !labInfo) return <PageContainer><div>Loading report...</div></PageContainer>;

  return (
    <PageContainer>
      <PrintButton onClick={handlePrint}><FaPrint /> {t('printReport')}</PrintButton>
      <ReportSheet ref={componentRef}>
        <ReportHeader>
          <LabLogo><FaFlask /></LabLogo>
          {/* Use the dynamic labInfo from state */}
          <LabName>{labInfo.name}</LabName>
          <LabAddress>{labInfo.address} {labInfo.phone && `| Tel: ${labInfo.phone}`}</LabAddress>
        </ReportHeader>

        <SectionTitle>{t('patientInformation')}</SectionTitle>
        <InfoGrid>
          <InfoItem><strong>{t('patientName')}:</strong> {patient.name}</InfoItem>
          <InfoItem><strong>{t('patientID')}:</strong> {order.patientId.substring(0,8)}</InfoItem>
          <InfoItem><strong>{t('dateOfBirth')}:</strong> {format(new Date(patient.dob), 'MMMM d, yyyy')}</InfoItem>
          <InfoItem><strong>{t('gender')}:</strong> {t(patient.gender.toLowerCase())}</InfoItem>
          <InfoItem><strong>{t('orderDate')}:</strong> {format(order.createdAt.toDate(), 'MMMM d, yyyy')}</InfoItem>
          {order.referringDoctor && <InfoItem><strong>Referring Doctor:</strong> {order.referringDoctor}</InfoItem>}
        </InfoGrid>

        <SectionTitle>{t('results')}</SectionTitle>
        <ResultsTable>
          <thead>
            <tr>
              <th>{t('test')}</th>
              <th>{t('result')}</th>
              <th>Unit</th>
              <th>{t('referenceRange')}</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(results).map(([test, resultData]) => {
                const def = testDefinitions[test];
                const range = (def && def.refRangeLow && def.refRangeHigh) 
                    ? `${def.refRangeLow} - ${def.refRangeHigh}` 
                    : 'N/A';
                
                return (
                    <tr key={test}>
                        <td>{test}</td>
                        <td><strong>{resultData.value}</strong></td>
                        <td>{resultData.unit}</td>
                        <td>{range}</td>
                        <td>
                            <Flag flag={resultData.flag}>
                                {resultData.flag !== 'Normal' ? resultData.flag : ''}
                            </Flag>
                        </td>
                    </tr>
                );
            })}
          </tbody>
        </ResultsTable>
        <ReportFooter>
          Report generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
        </ReportFooter>
      </ReportSheet>
    </PageContainer>
  );
};

export default ReportView;