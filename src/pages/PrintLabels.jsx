import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import JsBarcode from 'jsbarcode';
import styled from 'styled-components';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaPrint, FaArrowLeft } from 'react-icons/fa';

//--- STYLED COMPONENTS (Vivid Design) ---//

const PageContainer = styled.div`
  background-color: #f0f2f5; /* Use a consistent background */
  padding: 40px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
`;

const ControlButton = styled.button`
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.2s ease;
  ${({ theme }) => theme.squircle(12)};

  background: ${({ theme, primary }) => primary ? theme.primaryGradient : 'linear-gradient(90deg, #6c757d 0%, #343a40 100%)'};

  &:hover {
    transform: scale(1.05);
  }
`;

const LabelSheet = styled.div`
  background: white;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
`;

const Label = styled.div`
  border: 1px dashed #333;
  padding: 12px;
  margin: 10px;
  width: 275px;
  text-align: left;
  font-family: 'Arial', sans-serif;
  page-break-inside: avoid; /* Critical for printing */
`;

const LabelText = styled.div`
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 4px;
    strong {
        color: #000;
    }
`;

const BarcodeSVG = styled.svg`
  display: block;
  margin-top: 8px;
  width: 100%;
  height: auto;
`;

const Barcode = ({ value }) => {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        height: 40,
        displayValue: true,
        fontSize: 14,
        margin: 0,
      });
    }
  }, [value]);
  return <BarcodeSVG ref={ref} />;
};


const PrintLabels = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const orderDoc = await getDoc(doc(db, 'testOrders', orderId));
      if (orderDoc.exists()) {
        setOrderData({ id: orderDoc.id, ...orderDoc.data() });
      }
    };
    fetchOrder();
  }, [orderId]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `labels-${orderId}`,
  });

  if (!orderData) return <PageContainer><div>Loading Labels...</div></PageContainer>;

  return (
    <PageContainer>
      <Controls>
        <ControlButton onClick={() => navigate('/reception')}><FaArrowLeft /> Go Back</ControlButton>
        <ControlButton onClick={handlePrint} primary><FaPrint /> Print Labels</ControlButton>
      </Controls>
      <LabelSheet ref={componentRef}>
          {orderData.tests.map(testName => (
            <Label key={testName}>
              <LabelText><strong>Patient:</strong> {orderData.patientName}</LabelText>
              <LabelText><strong>Test:</strong> {testName}</LabelText>
              <Barcode value={`${orderData.id.substring(0, 6)}-${testName.substring(0,4).toUpperCase()}`} />
            </Label>
          ))}
      </LabelSheet>
    </PageContainer>
  );
};

export default PrintLabels;