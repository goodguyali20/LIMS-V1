import styled from 'styled-components';

const GradientAccentStrip = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%);
  border-radius: 20px 20px 0 0;
  z-index: 1;
`;

export default GradientAccentStrip; 