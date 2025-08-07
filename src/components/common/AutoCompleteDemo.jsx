import React, { useState } from 'react';
import styled from 'styled-components';
import AutoCompleteInput from './AutoCompleteInput';
import { useFirstNameSuggestions, useFatherNameSuggestions, useGrandfatherNameSuggestions } from '../../hooks/useIraqiNames';

const DemoContainer = styled.div`
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
`;

const DemoTitle = styled.h2`
  color: #667eea;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const DemoSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(20px);
`;

const SectionTitle = styled.h3`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const AutoCompleteDemo = () => {
  const [firstName, setFirstName] = useState('');
  const [fathersName, setFathersName] = useState('');
  const [grandFathersName, setGrandFathersName] = useState('');
  const [gender, setGender] = useState('male');

  const { suggestions: firstNameSuggestions, isLoading: firstNameLoading } = useFirstNameSuggestions(firstName, gender);
  const { suggestions: fatherSuggestions, isLoading: fatherLoading } = useFatherNameSuggestions(fathersName);
  const { suggestions: grandfatherSuggestions, isLoading: grandfatherLoading } = useGrandfatherNameSuggestions(grandFathersName);

  return (
    <DemoContainer>
      <DemoTitle>Iraqi Names Auto-completion Demo</DemoTitle>
      
      <DemoSection>
        <SectionTitle>Gender Selection</SectionTitle>
        <Label>Select gender to filter first name suggestions:</Label>
        <select 
          value={gender} 
          onChange={(e) => setGender(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginBottom: '1rem'
          }}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </DemoSection>

      <DemoSection>
        <SectionTitle>First Name</SectionTitle>
        <Label>Start typing for suggestions (gender-based):</Label>
        <AutoCompleteInput
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter first name..."
          suggestions={firstNameSuggestions}
          isLoading={firstNameLoading}
          name="firstName"
        />
      </DemoSection>



      <DemoSection>
        <SectionTitle>Father's Name</SectionTitle>
        <Label>Start typing for suggestions:</Label>
        <AutoCompleteInput
          value={fathersName}
          onChange={(e) => setFathersName(e.target.value)}
          placeholder="Enter father's name..."
          suggestions={fatherSuggestions}
          isLoading={fatherLoading}
          name="fathersName"
        />
      </DemoSection>

      <DemoSection>
        <SectionTitle>Grandfather's Name</SectionTitle>
        <Label>Start typing for suggestions:</Label>
        <AutoCompleteInput
          value={grandFathersName}
          onChange={(e) => setGrandFathersName(e.target.value)}
          placeholder="Enter grandfather's name..."
          suggestions={grandfatherSuggestions}
          isLoading={grandfatherLoading}
          name="grandFathersName"
        />
      </DemoSection>

      <DemoSection>
        <SectionTitle>Form Data Preview</SectionTitle>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '1rem', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          overflow: 'auto'
        }}>
          {JSON.stringify({
            firstName,
            fathersName,
            grandFathersName,
            gender
          }, null, 2)}
        </pre>
      </DemoSection>
    </DemoContainer>
  );
};

export default AutoCompleteDemo; 