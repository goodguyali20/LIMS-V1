import React from 'react';
import AutoCompleteDemo from '../components/common/AutoCompleteDemo';

const AutoCompleteDemoPage = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <AutoCompleteDemo />
    </div>
  );
};

export default AutoCompleteDemoPage; 