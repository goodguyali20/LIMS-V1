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
  margin: auto;
  border: 1px solid #ccc; /* Add a border for visibility if not printing */
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid black;
  padding-bottom: 1rem;

  h2 { font-size: 1.5rem; margin: 0; }
  h3 { font-size: 1.2rem; margin: 0; font-weight: normal; }
  p { margin: 0.2rem 0; }
`;

const PatientInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 2rem;
  margin-bottom: 2rem;
  font-size: 1.1rem;
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
    }
`;

const BarcodeCanvas = styled.canvas`
    display: block;
    margin: 1.5rem auto 0 auto;
`;

const RequisitionForm = React.forwardRef(({ order, department, tests }, ref) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && order.id) {
      Barcode(barcodeRef.current, order.id, {
        format: "CODE128",
        height: 50,
        displayValue: true,
        fontSize: 18,
      });
    }
  }, [order.id]);

  return (
    <div ref={ref}>
      <FormContainer>
        <Header>
          <h2>مستشفى العزيزية العام</h2>
          <h3>Al-Aziziyah General Hospital</h3>
          <p>Lab Requisition Form - **{department}**</p>
        </Header>
        <PatientInfo>
            <div><strong>Patient Name:</strong> {order.patientName}</div>
            <div><strong>Age:</strong> {order.age}</div>
            <div><strong>Patient ID:</strong> {order.patientId}</div>
            <div><strong>Order Date:</strong> {order.createdAt.toDate().toLocaleDateString()}</div>
            <div><strong>Referring Doctor:</strong> {order.referringDoctor}</div>
        </PatientInfo>
        <hr />
        <h3>Requested Tests</h3>
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