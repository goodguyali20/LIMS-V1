import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBarcode } from 'react-icons/fa';
import { formatInTimeZone } from 'date-fns-tz';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import LanguageSwitcher from '../common/LanguageSwitcher'; // <-- Import the switcher

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  height: 80px;
  flex-shrink: 0;
`;

const Greeting = styled.div`
  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }
  p {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 0;
    min-height: 1.2em;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  width: 350px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  svg {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  input {
    border: none;
    background: transparent;
    outline: none;
    margin: 0 0.75rem;
    width: 100%;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
  }
`;

const BarcodeStatus = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${({ theme }) => theme.colors.success};
    font-weight: 500;

    svg {
        font-size: 1.5rem;
    }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem; // Increased gap for switcher
`;

const Avatar = styled(Link)`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  text-decoration: none;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

// Simple wrapper to style the button for the dashboard
const HeaderSwitcher = styled.div`
    button {
        background: ${({ theme }) => theme.colors.background};
        border-color: ${({ theme }) => theme.colors.border};
        color: ${({ theme }) => theme.colors.text};

        &:hover {
            background: ${({ theme }) => theme.colors.border};
        }
    }
`;

const Header = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');

  const handleBarcodeScan = (scannedCode) => {
    navigate(`/order/${scannedCode}`);
  };

  useBarcodeScanner(handleBarcodeScan);

  const userInitials = currentUser?.displayName
    ? currentUser.displayName.charAt(0).toUpperCase()
    : currentUser?.email?.charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    const timerId = setInterval(() => {
      const baghdadTime = formatInTimeZone(new Date(), 'Asia/Baghdad', 'hh:mm:ss a');
      setCurrentTime(baghdadTime);
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <HeaderContainer>
      <Greeting>
        <h2>{`${t('greeting')}, ${currentUser?.displayName || 'User'}!`}</h2>
        <p>{currentTime || 'Loading time...'}</p>
      </Greeting>

      <SearchContainer>
        <SearchBar>
          <FaSearch />
          <input type="text" placeholder={t('searchPlaceholder')} />
        </SearchBar>
        <BarcodeStatus>
            <FaBarcode />
            <span>Ready to Scan</span>
        </BarcodeStatus>
      </SearchContainer>
      
      <UserProfile>
        <HeaderSwitcher>
            <LanguageSwitcher />
        </HeaderSwitcher>
        <Avatar to="/profile">{userInitials}</Avatar>
      </UserProfile>
    </HeaderContainer>
  );
};

export default Header;