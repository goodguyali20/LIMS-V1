import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const SwitcherButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <SwitcherButton onClick={toggleLanguage}>
      {i18n.language === 'ar' ? 'English' : 'العربية'}
    </SwitcherButton>
  );
};

export default LanguageSwitcher;