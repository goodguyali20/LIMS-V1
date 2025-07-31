import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { FiClock, FiCalendar, FiCloud, FiSun, FiCloudRain, FiCloudSnow, FiZap, FiBattery } from 'react-icons/fi';

const WelcomeContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const WelcomeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const WelcomeTextSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  word-wrap: break-word;
  overflow-wrap: break-word;
  color: white;
`;

const AnimatedName = styled.span`
  background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease infinite;
  font-weight: 700;
  
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const SmartwatchSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
  position: relative;
  margin-top: -5rem;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 120%;
  margin-bottom: 1rem;
  overflow: visible;
`;

const DateBox = styled.div`
  background: #00B4D8;
  border-radius: 12px;
  padding: 0.5rem;
  color: #003D4A;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  min-width: 70px;
  height: 50px;
  display: flex;
  flex-direction: column;
  gap: 0rem;
  justify-content: center;
`;

const DateNumber = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: #003D4A;
  line-height: 1;
  text-align: center;
  margin-top: -1px;
`;

const DateMonth = styled.div`
  font-size: 0.6rem;
  font-weight: 400;
  color: #003D4A;
  opacity: 0.8;
  text-align: center;
  margin-top: 1px;
`;

const HeartRateBox = styled.div`
  background: #fef3c7;
  border-radius: 12px;
  padding: 1rem;
  color: #92400e;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  min-width: 60px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  justify-content: center;
`;

const BPMNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #92400e;
  line-height: 1;
`;

const BPMText = styled.div`
  font-size: 0.625rem;
  font-weight: 400;
  color: #92400e;
  opacity: 0.8;
`;

const ActivityArc = styled.div`
  width: 120px;
  height: 60px;
  border-radius: 60px 60px 0 0;
  border: 3px solid transparent;
  background: linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6);
  background-clip: border-box;
  opacity: 0.6;
  margin-bottom: -5rem;
  margin-top: 1rem;
  position: absolute;
  left: 6.5rem;
  top: 4rem;
  padding: 1rem;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 10px;
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
  }
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  margin-top: 1.5rem;
  position: relative;
`;

const LeftBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
  padding: 0.5rem;
  position: relative;
`;

const RightBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
  padding: 0.5rem;
  position: relative;
`;

const WeatherBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.02rem;
  align-items: flex-start;
  margin-top: -5.525rem;
  padding: 0.05rem;
  min-width: 40px;
  min-height: 30px;
`;

const BPMBox = styled.div`
  position: absolute;
  top: 2.4rem;
  right: 1rem;
  z-index: 1;
`;

const TimeNumbers = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 1rem;
`;

const TimeNumber = styled.div`
  font-size: 5rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  text-align: left;
`;

const WeatherInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  
  svg {
    font-size: 1.1rem;
    color: white;
  }
`;

const DayInfo = styled.div`
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BatteryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  
  svg {
    font-size: 0.9rem;
    color: white;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;
  max-width: 600px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
`;

const StyledNumber = styled.span`
  background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease infinite;
  font-weight: 700;
  font-size: 1.1em;
  display: inline;
  margin: 0;
  padding: 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
    background-size: 400% 400%;
    animation: gradientShift 3s ease infinite;
    border-radius: 2px;
    opacity: 0.6;
  }
`;

const HighlightedText = styled.span`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
  display: inline;
  margin: 0;
  padding: 0;
  letter-spacing: normal;
  word-spacing: normal;
  white-space: normal;
`;

const WelcomeSection = ({ title, subtitle, children }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 22, condition: 'sunny', city: 'Baghdad' });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time for smartwatch display
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return { hours, minutes };
  };

  // Format date for smartwatch display
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
  };

  // Format day of week
  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  };

  // Get weather icon
  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <FiSun />;
      case 'cloudy': return <FiCloud />;
      case 'rainy': return <FiCloudRain />;
      case 'snowy': return <FiCloudSnow />;
      default: return <FiSun />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const defaultTitle = title || `Good morning, ${user?.displayName || 'User'}!`;
  const defaultSubtitle = subtitle || t('dashboard.welcomeMessage', 'Welcome to SmartLab. Here\'s what\'s happening today.');

  // Split the title to style "Good morning" and the name separately
  const renderTitle = (titleText) => {
    if (titleText.startsWith('Good morning, ')) {
      const name = titleText.replace('Good morning, ', '').replace('!', '');
      return (
        <>
          Good morning, <AnimatedName>{name}</AnimatedName>!
        </>
      );
    }
    return titleText;
  };

  // Function to process text with both number and keyword highlighting
  const processText = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    // Simple approach: highlight numbers and key words
    const combinedRegex = /(\d+)|(\b(patients|treatment|pending|results)\b)/gi;
    const result = [];
    let lastIndex = 0;
    let match;
    
    while ((match = combinedRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        result.push(text.slice(lastIndex, match.index));
      }
      
      // Check if it's a number or keyword
      if (match[1]) {
        // It's a number (group 1)
        result.push(
          <StyledNumber key={`num-${match.index}`}>
            {match[1]}
          </StyledNumber>
        );
      } else if (match[2]) {
        // It's a keyword (group 2)
        result.push(
          <HighlightedText key={`keyword-${match.index}`}>
            {match[2]}
          </HighlightedText>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }
    
    return result;
  };

  const processedSubtitle = processText(defaultSubtitle);

  return (
    <WelcomeContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <WelcomeHeader>
        <WelcomeTextSection>
          <WelcomeTitle>{renderTitle(defaultTitle)}</WelcomeTitle>
          <WelcomeSubtitle>{processedSubtitle}</WelcomeSubtitle>
        </WelcomeTextSection>
        
        <SmartwatchSection>
          <TopRow>
          </TopRow>
          <BottomRow>
            <LeftBottom>
              <TimeNumbers>
                <TimeNumber>14</TimeNumber>
                <TimeNumber>50</TimeNumber>
              </TimeNumbers>
            </LeftBottom>
            <RightBottom>
              <WeatherBlock>
                <WeatherInfo>
                  <FiSun />
                  <span>48°</span>
                </WeatherInfo>
                <DayInfo>{formatDay(currentTime)}</DayInfo>
                <BatteryInfo>
                  <FiZap />
                  <span>95%</span>
                </BatteryInfo>
              </WeatherBlock>
            </RightBottom>
            <BPMBox>
              <DateBox>
                <DateNumber>{formatDate(currentTime).split(' ')[0]}</DateNumber>
                <DateMonth>{formatDate(currentTime).split(' ')[1]}</DateMonth>
              </DateBox>
            </BPMBox>
          </BottomRow>
        </SmartwatchSection>
      </WelcomeHeader>
      
      {children}
    </WelcomeContainer>
  );
};

export default WelcomeSection; 