import React from 'react';
import styled from 'styled-components';

const ReportContainer = styled.div`
  background: white;
  color: black;
  font-family: 'Arial', sans-serif;
  padding: 2rem;
  width: 210mm; /* A4 width */
  min-height: 297mm; /* A4 height */
  margin: auto;
`;

const ReportHeader = styled.header`
  text-align: center;
  border-bottom: 2px solid black;
  padding-bottom: 1rem;
  margin-bottom: 2rem;

  h1 {
    margin: 0;
    color: black;
  }
  p {
    margin: 0.2rem 0;
    font-size: 0.9rem;
  }
`;

const AmendedTitle = styled.h2`
  color: red;
  text-align: center;
  font-weight: bold;
  font-size: 2rem;
  margin-bottom: 1.5rem;
`;

const PatientInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 1rem;
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;

  th, td {
    border: 1px solid #ccc;
    padding: 0.75rem;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }
`;

const AmendmentHistory = styled.div`
  margin-top: 1rem;
  background-color: #fff0f0;
  border: 1px solid red;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.9rem;

  p {
    margin: 0.3rem 0;
  }
`;

const PrintableReport = ({ order, hospitalInfo }) => {
  const isAmended = order.status === 'Amended' && order.amendments?.length > 0;
  
  // Use passed-in hospital info or fall back to defaults
  const displayHospitalInfo = hospitalInfo || {
    name: "مستشفى العزيزية العام",
    address: "Kut, Wasit Governorate, Iraq",
    phone: "123-456-7890"
  };

  return (
    <ReportContainer>
      <ReportHeader>
        <h1>{displayHospitalInfo.name}</h1>
        <p>{displayHospitalInfo.address}</p>
        <p>Phone: {displayHospitalInfo.phone}</p>
      </ReportHeader>
      
      {isAmended && <AmendedTitle>AMENDED REPORT</AmendedTitle>}

      <PatientInfo>
        <div><strong>Patient Name:</strong> {order.patientName}</div>
        <div><strong>Patient ID:</strong> {order.patientId || 'N/A'}</div>
        <div><strong>Order ID:</strong> {order.id}</div>
        <div><strong>Date Reported:</strong> {new Date().toLocaleDateString()}</div>
        <div><strong>Referring Doctor:</strong> {order.referringDoctor || 'N/A'}</div>
      </PatientInfo>

      <ResultsTable>
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Result</th>
            <th>Reference Range</th>
          </tr>
        </thead>
        <tbody>
          {order.tests.map(testName => {
            const amendment = isAmended ? order.amendments.find(a => a.test === testName) : null;
            return (
              <tr key={testName}>
                <td>{testName}</td>
                <td>
                  <strong>{order.results ? order.results[testName] : 'Pending'}</strong>
                  {amendment && (
                    <AmendmentHistory>
                      <p><strong>Correction History:</strong></p>
                      <p><strong>Original Result:</strong> {amendment.originalResult}</p>
                      <p><strong>Reason:</strong> {amendment.reason}</p>
                      <p><strong>By:</strong> {amendment.amendedBy} on {new Date(amendment.amendedAt.seconds * 1000).toLocaleString()}</p>
                    </AmendmentHistory>
                  )}
                </td>
                <td>{/* Reference ranges would go here */}</td>
              </tr>
            );
          })}
        </tbody>
      </ResultsTable>
    </ReportContainer>
  );
};

export default PrintableReport;