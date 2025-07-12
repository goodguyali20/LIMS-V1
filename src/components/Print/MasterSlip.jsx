import React, { useEffect, useRef } from 'react';
import Barcode from 'jsbarcode';
import { SlipContainer, PatientInfo } from './SlipStyles';

const MasterSlip = ({ order }) => {
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
        <h4>Patient Master Slip (Keep This)</h4>
        <PatientInfo>
          <span><strong>Name:</strong> {order.patientName}</span>
          <span><strong>ID:</strong> {order.patientId}</span>
        </PatientInfo>
        <p><strong>Age:</strong> {order.age} | <strong>Gender:</strong> {order.gender}</p>
        <p><strong>Date:</strong> {order.createdAt?.toDate().toLocaleDateString()}</p>
      </div>
      <canvas ref={barcodeRef} />
    </SlipContainer>
  );
};

export default MasterSlip;