import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Barcode from 'jsbarcode';

const FormContainer = styled.div`
  background: white;
  color: black;
  font-family: 'Arial', sans-serif;
  padding: 1.5rem;
  width: 210mm; /* A4 width */
  min-height: 297mm; /* A4 height for page-break simulation */
  margin: 0;
  box-sizing: border-box;
  page-break-after: always; /* Ensures each form is on a new page when printing */

  &:last-child {
    page-break-after: auto;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid black;
  padding-bottom: 1rem;

  h2 { font-size: 1.6rem; margin: 0; }
  h3 { font-size: 1.3rem; margin: 0; font-weight: normal; }
  p { margin: 0.2rem 0; font-size: 1.1rem; font-weight: bold; }
`;

const PatientInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem 2rem;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const InfoField = styled.div`
    padding: 4px 0;
    strong {
        margin-right: 8px;
    }
`;

const TestList = styled.ul`
    list-style: none;
    padding-left: 0;
    font-size: 1.2rem;
    column-count: 2;
    column-gap: 2rem;

    li {
        margin-bottom: 1rem;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        break-inside: avoid-page;
    }
`;

const SectionTitle = styled.h3`
    font-size: 1.4rem;
    border-bottom: 1px solid #555;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
`;

const BarcodeCanvas = styled.canvas`
    display: block;
    margin: 2rem auto 0 auto;
`;

const RequisitionForm = React.forwardRef(({ order, settings, department, tests }, ref) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && order.id) {
      Barcode(barcodeRef.current, order.id, {
        format: "CODE128",
        height: 60,
        width: 2.5,
        displayValue: true,
        fontSize: 18,
      });
    }
  }, [order.id]);

  // Use toDate() to convert Firestore Timestamp to JS Date
  const orderDate = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-CA') : 'N/A';
  const orderTime = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  return (
    <div ref={ref}>
      <FormContainer>
        <Header>
          <h2>{settings?.hospitalName || 'مستشفى العزيزية العام'}</h2>
          <h3>{settings?.hospitalAddress || 'Al-Aziziyah General Hospital'}</h3>
          <p>Lab Requisition Form - **{department}**</p>
        </Header>
        <PatientInfo>
            <InfoField><strong>Patient Name:</strong> {order.patientName}</InfoField>
            <InfoField><strong>Patient ID:</strong> {order.patientId}</InfoField>
            <InfoField><strong>Age:</strong> {order.age}</InfoField>
            <InfoField><strong>Gender:</strong> {order.gender}</InfoField>
            <InfoField><strong>Order Date:</strong> {orderDate}</InfoField>
            <InfoField><strong>Order Time:</strong> {orderTime}</InfoField>
            <InfoField><strong>Referring Doctor:</strong> {order.referringDoctor || 'N/A'}</InfoField>
            <InfoField><strong>Order ID:</strong> {order.id.substring(0, 10)}...</InfoField>
        </PatientInfo>
        
        <SectionTitle>Requested Tests</SectionTitle>
        <TestList>
            {tests.map(testName => (
                <li key={testName}>{testName}</li>
            ))}
        </TestList>

        <BarcodeCanvas ref={barcodeRef} />
      </FormContainer>
    </div>
  );
});

export default RequisitionForm;