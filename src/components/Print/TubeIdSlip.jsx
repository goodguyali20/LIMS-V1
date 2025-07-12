import React, { useEffect, useRef } from 'react';
import Barcode from 'jsbarcode';
import { SlipContainer, PatientInfo } from './SlipStyles';

const TubeIdSlip = ({ order }) => {
  const barcodeRef = useRef(null);
  
  useEffect(() => {
    if (barcodeRef.current && order.id) {
      Barcode(barcodeRef.current, order.id, {
        format: "CODE128", height: 35, width: 1.8, displayValue: false 
      });
    }
  }, [order.id]);

  return (
    <SlipContainer style={{ justifyContent: 'center', textAlign: 'center' }}>
      <PatientInfo style={{ display: 'block' }}>
        <p><strong>{order.patientName}</strong></p>
        <p>ID: {order.patientId}</p>
      </PatientInfo>
      <canvas ref={barcodeRef} />
    </SlipContainer>
  );
};

export default TubeIdSlip;