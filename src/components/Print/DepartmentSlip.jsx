import React, { useEffect, useRef } from 'react';
import Barcode from 'jsbarcode';
import { SlipContainer, PatientInfo, TestList } from './SlipStyles';

const DepartmentSlip = ({ order, department, tests }) => {
  const barcodeRef = useRef(null);
  
  useEffect(() => {
    if (barcodeRef.current && order.id) {
      Barcode(barcodeRef.current, order.id, {
        format: "CODE128", height: 25, width: 1.5, displayValue: false 
      });
    }
  }, [order.id]);

  return (
    <SlipContainer>
      <div>
        <h4>Department: {department}</h4>
        <PatientInfo>
          <span><strong>Name:</strong> {order.patientName}</span>
          <span><strong>ID:</strong> {order.patientId}</span>
        </PatientInfo>
        <strong>Tests:</strong>
        <TestList>
          {tests.map(t => <li key={t}>- {t}</li>)}
        </TestList>
      </div>
      <canvas ref={barcodeRef} />
    </SlipContainer>
  );
};

export default DepartmentSlip;