import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSettings } from '../../contexts/SettingsContext';
import { toast } from 'react-toastify';
import { FaSave, FaHospital, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const GeneralContainer = styled.div`
  padding: 2rem;
  animation: fadeIn 0.3s ease-in-out;
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors.info}10;
  border: 1px solid ${({ theme }) => theme.colors.info}30;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 1rem;
  margin-bottom: 1.5rem;
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: ${({ theme }) => theme.colors.info};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const General = () => {
  const { settings, updateSettings, loading } = useSettings();
  const { t } = useTranslation();
  const [formState, setFormState] = useState({
    hospitalName: '',
    hospitalAddress: '',
    hospitalPhone: '',
    hospitalEmail: '',
    hospitalWebsite: '',
    labDirector: '',
    labPhone: '',
    labEmail: '',
    reportHeader: '',
    reportFooter: ''
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        hospitalName: settings.hospitalName || '',
        hospitalAddress: settings.hospitalAddress || '',
        hospitalPhone: settings.hospitalPhone || '',
        hospitalEmail: settings.hospitalEmail || '',
        hospitalWebsite: settings.hospitalWebsite || '',
        labDirector: settings.labDirector || '',
        labPhone: settings.labPhone || '',
        labEmail: settings.labEmail || '',
        reportHeader: settings.reportHeader || '',
        reportFooter: settings.reportFooter || ''
      });
    }
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formState);
      toast.success(t('generalSettingsUpdated'));
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(t('failedToUpdateSettings'));
    }
  };

  if (loading) {
    return (
      <GeneralContainer>
        <LoadingContainer>
          <span>{t('loadingSettings')}</span>
        </LoadingContainer>
      </GeneralContainer>
    );
  }

  return (
    <GeneralContainer>
      <InfoCard>
        <h4>
          <FaHospital />
          {t('hospitalInformation')}
        </h4>
        <p>
          {t('hospitalInfoDescription')}
        </p>
      </InfoCard>

      <Section>
        <SectionHeader>
          <h2>{t('generalSettings')}</h2>
          <SaveButton type="submit" form="general-form" disabled={loading}>
            <FaSave />
            {loading ? t('saving') : t('saveChanges')}
          </SaveButton>
        </SectionHeader>

        <Form id="general-form" onSubmit={handleSubmit}>
          <InputGroup>
            <Label>
              <FaHospital />
              {t('hospitalNameLabel')}
            </Label>
            <Input
              name="hospitalName"
              value={formState.hospitalName}
              onChange={handleInputChange}
              placeholder="مستشفى العزيزية العام"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>
              <FaMapMarkerAlt />
              {t('hospitalAddressLabel')}
            </Label>
            <Input
              name="hospitalAddress"
              value={formState.hospitalAddress}
              onChange={handleInputChange}
              placeholder="Kut, Wasit Governorate, Iraq"
            />
          </InputGroup>

          <InputGroup>
            <Label>
              <FaPhone />
              {t('hospitalPhoneLabel')}
            </Label>
            <Input
              name="hospitalPhone"
              value={formState.hospitalPhone}
              onChange={handleInputChange}
              placeholder="+964 XXX XXX XXXX"
            />
          </InputGroup>

          <InputGroup>
            <Label>{t('hospitalEmailLabel')}</Label>
            <Input
              name="hospitalEmail"
              type="email"
              value={formState.hospitalEmail}
              onChange={handleInputChange}
              placeholder="info@hospital.com"
            />
          </InputGroup>

          <InputGroup>
            <Label>{t('hospitalWebsiteLabel')}</Label>
            <Input
              name="hospitalWebsite"
              value={formState.hospitalWebsite}
              onChange={handleInputChange}
              placeholder="https://hospital.com"
            />
          </InputGroup>

          <InputGroup>
            <Label>{t('labDirectorLabel')}</Label>
            <Input
              name="labDirector"
              value={formState.labDirector}
              onChange={handleInputChange}
              placeholder="Dr. [Name]"
            />
          </InputGroup>

          <InputGroup>
            <Label>{t('labPhoneLabel')}</Label>
            <Input
              name="labPhone"
              value={formState.labPhone}
              onChange={handleInputChange}
              placeholder="+964 XXX XXX XXXX"
            />
          </InputGroup>

          <InputGroup>
            <Label>{t('labEmailLabel')}</Label>
            <Input
              name="labEmail"
              type="email"
              value={formState.labEmail}
              onChange={handleInputChange}
              placeholder="lab@hospital.com"
            />
          </InputGroup>

          <InputGroup style={{ gridColumn: '1 / -1' }}>
            <Label>{t('reportHeaderLabel')}</Label>
            <TextArea
              name="reportHeader"
              value={formState.reportHeader}
              onChange={handleInputChange}
              placeholder={t('reportHeaderPlaceholder')}
            />
          </InputGroup>

          <InputGroup style={{ gridColumn: '1 / -1' }}>
            <Label>{t('reportFooterLabel')}</Label>
            <TextArea
              name="reportFooter"
              value={formState.reportFooter}
              onChange={handleInputChange}
              placeholder={t('reportFooterPlaceholder')}
            />
          </InputGroup>
        </Form>
      </Section>
    </GeneralContainer>
  );
};

export default General; 