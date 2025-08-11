import React from 'react';
import styled from 'styled-components';
import EnhancedLaboratoryReport from './EnhancedLaboratoryReport';
// import QRCode from 'qrcode.react'; // Uncomment if using QR/barcode
// import logo from '../../assets/logo.png'; // Placeholder for logo

const Wrapper = styled.div`
  width: 210mm;
  min-height: 297mm;
  background: white;
  color: #222;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  margin: 0 auto;
  padding: 2.5rem 2rem 2rem 2rem;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  position: relative;
  overflow: hidden;
  @media print {
    box-shadow: none;
    margin: 0;
    border-radius: 0;
    width: 100vw;
    min-height: 100vh;
    padding: 1.5rem 1rem 1rem 1rem;
  }
`;

const Watermark = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-20deg);
  font-size: 5rem;
  color: #e0e7ef;
  opacity: 0.18;
  pointer-events: none;
  user-select: none;
  z-index: 0;
  font-weight: 900;
  letter-spacing: 0.2em;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 1.2rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 1rem;
  color: #666;
`;

const Section = styled.section`
  margin-bottom: 1.5rem;
  z-index: 2;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.7rem 1.5rem;
  font-size: 1.05rem;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
  font-size: 1.05rem;
  th, td {
    border: 1px solid #e5e7eb;
    padding: 0.6rem 0.8rem;
    text-align: left;
  }
  th {
    background: ${({ theme }) => theme.colors.primary + '10'};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 700;
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 1.2rem;
  left: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
  color: #888;
  z-index: 2;
  @media print {
    position: fixed;
    left: 1rem;
    right: 1rem;
    bottom: 0.7rem;
  }
`;

const SignatureRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2.5rem;
  gap: 2rem;
`;

const SignatureBox = styled.div`
  flex: 1;
  border-top: 2px solid #e5e7eb;
  padding-top: 0.7rem;
  text-align: center;
  font-size: 1rem;
  color: #666;
`;

const BarcodeBox = styled.div`
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const ChartPlaceholder = styled.div`
  width: 100%;
  height: 120px;
  background: #f3f4f6;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 1.1rem;
  margin-top: 1.2rem;
`;

const A4PrintGrid = ({ order, user, settings }) => {
  // Use the enhanced laboratory report for a more professional look
  return <EnhancedLaboratoryReport order={order} user={user} settings={settings} />;
};

export default A4PrintGrid;