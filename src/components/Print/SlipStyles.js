import styled from 'styled-components';

export const SlipContainer = styled.div`
  border: 1px dotted #888; /* Dotted line for cutting */
  box-sizing: border-box;
  padding: 3mm;
  color: #000;
  font-family: 'Arial', sans-serif;
  font-size: 8pt; /* Small font size for slips */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;

  h4 {
    font-size: 9pt;
    margin: 0 0 4px 0;
    text-align: center;
    border-bottom: 1px solid #333;
    padding-bottom: 3px;
  }
  
  p {
    margin: 1px 0;
  }

  canvas {
    display: block;
    margin: auto;
  }
`;

export const PatientInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`;

export const TestList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 4px 0;
  font-size: 7.5pt;
  li {
    margin-bottom: 1px;
  }
`;