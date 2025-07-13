import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { FaPrint, FaArrowLeft, FaSpinner, FaBarcode, FaQrcode } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import JsBarcode from 'jsbarcode';

// Print Components
import A4PrintGrid from '../components/Print/A4PrintGrid';
import MasterSlip from '../components/Print/MasterSlip';
import DepartmentSlip from '../components/Print/DepartmentSlip';
import TubeIdSlip from '../components/Print/TubeIdSlip';

const PrintOrderContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease-in-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
`;

const PrintButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OrderInfo = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
  margin-bottom: 2rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.error};
`;

const PrintOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const orderDoc = await getDoc(doc(db, 'testOrders', orderId));
        
        if (!orderDoc.exists()) {
          setError('Order not found');
          return;
        }
        
        const orderData = { id: orderDoc.id, ...orderDoc.data() };
        setOrder(orderData);
        
        // Generate barcode after order is loaded
        setTimeout(() => {
          try {
            JsBarcode(`#barcode-${orderId}`, orderId, {
              format: "CODE128",
              width: 2,
              height: 50,
              displayValue: true,
              fontSize: 12,
              margin: 5
            });
          } catch (error) {
            console.error('Error generating barcode:', error);
          }
        }, 100);
        
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order');
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => {
      toast.success('Print job completed');
    },
    onPrintError: () => {
      toast.error('Print failed');
    }
  });

  const generateSlips = () => {
    if (!order) return [];

    const slips = [];
    
    // Generate Master Slip (Patient copy)
    slips.push(<MasterSlip key="master" order={order} />);
    
    // Generate Department Slips for each test
    if (order.tests && order.tests.length > 0) {
      order.tests.forEach((test, index) => {
        slips.push(
          <DepartmentSlip 
            key={`dept-${index}`} 
            order={order} 
            test={test} 
          />
        );
      });
    }
    
    // Generate Tube ID Slips for special tests
    if (order.tests && order.tests.length > 0) {
      order.tests.forEach((test, index) => {
        if (test.requiresSpecialSlip) {
          slips.push(
            <TubeIdSlip 
              key={`tube-${index}`} 
              order={order} 
              test={test} 
            />
          );
        }
      });
    }
    
    return slips;
  };

  if (loading) {
    return (
      <PrintOrderContainer>
        <LoadingContainer>
          <FaSpinner className="fa-spin" size={24} />
          <span>Loading order...</span>
        </LoadingContainer>
      </PrintOrderContainer>
    );
  }

  if (error) {
    return (
      <PrintOrderContainer>
        <ErrorContainer>
          <h2>Error</h2>
          <p>{error}</p>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> Go Back
          </BackButton>
        </ErrorContainer>
      </PrintOrderContainer>
    );
  }

  if (!order) {
    return (
      <PrintOrderContainer>
        <ErrorContainer>
          <h2>Order Not Found</h2>
          <p>The requested order could not be found.</p>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> Go Back
          </BackButton>
        </ErrorContainer>
      </PrintOrderContainer>
    );
  }

  return (
    <PrintOrderContainer>
      <Header>
        <div>
          <h1>Print Order</h1>
          <p>Order ID: {orderId}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </BackButton>
          <PrintButton onClick={handlePrint}>
            <FaPrint /> Print Slips
          </PrintButton>
        </div>
      </Header>

      <OrderInfo>
        <h3>Order Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p><strong>Patient:</strong> {order.patientName}</p>
            <p><strong>Patient ID:</strong> {order.patientId}</p>
            <p><strong>Date:</strong> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}</p>
            <p><strong>Tests:</strong> {order.tests?.length || 0} test(s)</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
              <FaBarcode size={24} style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.8rem', margin: '0' }}>Order Barcode</p>
            </div>
            <svg id={`barcode-${orderId}`} style={{ width: '100%', maxWidth: '200px' }}></svg>
          </div>
        </div>
      </OrderInfo>

      {/* Hidden print content */}
      <div style={{ display: 'none' }}>
        <A4PrintGrid ref={printRef} slips={generateSlips()} />
      </div>
    </PrintOrderContainer>
  );
};

export default PrintOrder; 