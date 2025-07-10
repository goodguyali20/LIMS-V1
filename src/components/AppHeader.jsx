import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatInTimeZone } from 'date-fns-tz';
import SearchBar from './SearchBar.jsx'; // Import the new component

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  animation: fadeIn 0.5s ease-out;
  gap: 16px;
`;

const Greetings = styled.div`
  flex-shrink: 0;
  h1 {
    font-size: 2rem;
    font-weight: 700;
  }
  p {
    font-size: 1rem;
    color: ${({ theme }) => theme.text}99;
    margin-top: 4px;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const UserWidget = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const TimeDisplay = styled.div`
  text-align: right;
  p {
    margin: 0;
    font-weight: 600;
    font-size: 1.2rem;
  }
  span {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.text}99;
  }
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  background: ${({ theme }) => theme.primaryGradient};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  ${({ theme }) => theme.squircle(16)};
`;


const AppHeader = () => {
  const { currentUser } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };
  
  const userInitial = currentUser?.email ? currentUser.email[0].toUpperCase() : '?';

  return (
    <HeaderContainer>
      <Greetings>
        <h1>{getGreeting()}, {currentUser?.email.split('@')[0]}</h1>
        <p>Welcome to your SmartLab dashboard.</p>
      </Greetings>
      <HeaderRight>
        <SearchBar />
        <UserWidget>
          <TimeDisplay>
            <p>{formatInTimeZone(time, 'Asia/Baghdad', 'h:mm:ss a')}</p>
            <span>{formatInTimeZone(time, 'Asia/Baghdad', 'eeee, MMMM d')}</span>
          </TimeDisplay>
          <Avatar>{userInitial}</Avatar>
        </UserWidget>
      </HeaderRight>
    </HeaderContainer>
  );
};

export default AppHeader;