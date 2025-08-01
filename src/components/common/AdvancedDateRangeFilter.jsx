import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, startOfDay, endOfDay, isSameDay, isToday, isYesterday, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subYears, isWithinInterval, eachDayOfInterval } from 'date-fns';
import { useTranslation } from 'react-i18next';

const DateFilterContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DateFilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 16px;
    height: 16px;
    opacity: 0.9;
  }
`;

const DateFilterDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 0.75rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  min-width: 450px;
  z-index: 1000;
  
  @media (max-width: 768px) {
    min-width: 350px;
    right: -150px;
  }
`;

const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const DropdownSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: white;
  font-size: 0.75rem;
  color: #374151;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const DateInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: white;
  font-size: 0.75rem;
  color: #374151;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const DropdownContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CalendarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CalendarTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const CalendarNavigation = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    border-color: #667eea;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

const CalendarDayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
`;

const CalendarDay = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: #f3f4f6;
  }
  
  &.other-month {
    color: #d1d5db;
  }
  
  &.today {
    color: #667eea;
    font-weight: 600;
  }
  
  &.selected {
    background: #667eea;
    color: white;
    font-weight: 600;
  }
  
  &.in-range {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }
  
  &.range-start {
    background: #667eea;
    color: white;
    font-weight: 600;
    border-radius: 6px 0 0 6px;
  }
  
  &.range-end {
    background: #667eea;
    color: white;
    font-weight: 600;
    border-radius: 0 6px 6px 0;
  }
  
  &.range-middle {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    border-radius: 0;
  }
  
  &.selecting-end {
    border: 2px solid #667eea;
    background: rgba(102, 126, 234, 0.1);
  }
`;

const PresetSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PresetTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const PresetButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: #f9fafb;
    border-color: #667eea;
  }
  
  &.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
`;

const PresetBadge = styled.span`
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${PresetButton}.active & {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
`;

const ShowMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  
  &:hover {
    background: rgba(102, 126, 234, 0.05);
    border-color: rgba(102, 126, 234, 0.3);
    color: #667eea;
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const DropdownFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const FooterButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.cancel {
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #374151;
    
    &:hover {
      background: #f9fafb;
    }
  }
  
  &.apply {
    background: #667eea;
    border: 1px solid #667eea;
    color: white;
    
    &:hover {
      background: #5a67d8;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
`;

const AdvancedDateRangeFilter = ({ 
  value, 
  onChange, 
  onRefresh,
  placeholder = "Select date range",
  showRefresh = true,
  showFunnelSelect = true 
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState(value || { startDate: new Date(), endDate: new Date() });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activePreset, setActivePreset] = useState(null);
  const [selectionMode, setSelectionMode] = useState('start'); // 'start' or 'end'
  const [showMorePresets, setShowMorePresets] = useState(false);
  const [clickTimeout, setClickTimeout] = useState(null);
  const dropdownRef = useRef(null);

  // Generate calendar days for current month
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays(currentMonth);

  // Preset date ranges - split into visible and hidden
  const visiblePresets = [
    { id: 'today', label: t('dashboard.dateFilter.today'), getDates: () => [new Date(), new Date()] },
    { id: 'yesterday', label: t('dashboard.dateFilter.yesterday'), getDates: () => [subDays(new Date(), 1), subDays(new Date(), 1)] },
    { id: 'last7days', label: t('dashboard.dateFilter.last7Days'), getDates: () => [subDays(new Date(), 6), new Date()] },
    { id: 'last14days', label: t('dashboard.dateFilter.last14Days'), getDates: () => [subDays(new Date(), 13), new Date()] },
    { id: 'last30days', label: t('dashboard.dateFilter.last30Days'), getDates: () => [subDays(new Date(), 29), new Date()] }
  ];

  const hiddenPresets = [
    { id: 'last60days', label: t('dashboard.dateFilter.last60Days'), getDates: () => [subDays(new Date(), 59), new Date()] },
    { id: 'last90days', label: t('dashboard.dateFilter.last90Days'), getDates: () => [subDays(new Date(), 89), new Date()] },
    { id: 'last180days', label: t('dashboard.dateFilter.last180Days'), getDates: () => [subDays(new Date(), 179), new Date()] },
    { id: 'lastyear', label: t('dashboard.dateFilter.lastYear'), getDates: () => [subYears(new Date(), 1), new Date()] }
  ];

  const presets = [...visiblePresets, ...hiddenPresets];

  const handlePresetClick = (preset) => {
    const [startDate, endDate] = preset.getDates();
    setDateRange({ startDate, endDate });
    setActivePreset(preset.id);
  };

  const handleDateClick = (date) => {
    // Clear any existing timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      return; // This was a double click, don't handle as single click
    }

    // Set timeout for single click
    const timeout = setTimeout(() => {
      // Single click behavior
      if (selectionMode === 'start') {
        // First click - set start date
        setDateRange({ startDate: date, endDate: date });
        setSelectionMode('end');
      } else {
        // Second click - set end date to create range
        if (date < dateRange.startDate) {
          setDateRange({ startDate: date, endDate: dateRange.startDate });
        } else {
          setDateRange(prev => ({ ...prev, endDate: date }));
        }
        setSelectionMode('start');
      }
      setActivePreset(null);
      setClickTimeout(null);
    }, 200); // 200ms delay to detect double click

    setClickTimeout(timeout);
  };

  const handleDateDoubleClick = (date) => {
    // Clear the single click timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }

    // Double click - select single date (reset range)
    setDateRange({ startDate: date, endDate: date });
    setSelectionMode('start');
    setActivePreset(null);
  };

  // Reset selection mode when opening the dropdown
  useEffect(() => {
    if (isOpen) {
      setSelectionMode('start');
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  const handleApply = () => {
    onChange(dateRange);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDisplayDate = (dateRange) => {
    if (!dateRange) return placeholder;
    const { startDate, endDate } = dateRange;
    if (isSameDay(startDate, endDate)) {
      return format(startDate, 'dd MMM yyyy');
    }
    return `${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}`;
  };

  const getCurrentPreset = () => {
    return presets.find(preset => preset.id === activePreset);
  };

  const isDateInRange = (date) => {
    if (!dateRange.startDate || !dateRange.endDate) return false;
    return isWithinInterval(date, { start: dateRange.startDate, end: dateRange.endDate });
  };

  const getDateClassName = (day) => {
    const isOtherMonth = day.getMonth() !== currentMonth.getMonth();
    const isTodayDate = isToday(day);
    const isStartDate = isSameDay(day, dateRange.startDate);
    const isEndDate = isSameDay(day, dateRange.endDate);
    const isInRange = isDateInRange(day);
    
    let className = '';
    if (isOtherMonth) className += 'other-month ';
    if (isTodayDate) className += 'today ';
    if (isStartDate) className += 'range-start ';
    else if (isEndDate) className += 'range-end ';
    else if (isInRange) className += 'range-middle ';
    
    // Add selection mode indicator
    if (selectionMode === 'end' && isStartDate) {
      className += 'selecting-end ';
    }
    
    return className.trim();
  };

  return (
    <DateFilterContainer ref={dropdownRef}>
      <DateFilterButton onClick={() => setIsOpen(!isOpen)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
        </svg>
        {formatDisplayDate(dateRange)}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </DateFilterButton>

      <AnimatePresence>
        {isOpen && (
          <>
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <DateFilterDropdown
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DropdownHeader>
                <HeaderActions>
                  {showRefresh && (
                    <RefreshButton onClick={handleRefresh}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t('dashboard.dateFilter.refresh')}
                    </RefreshButton>
                  )}
                  {showFunnelSelect && (
                    <DropdownSelect>
                      <option>{t('dashboard.dateFilter.selectFunnelOrStore')}</option>
                      <option>{t('dashboard.dateFilter.allFunnels')}</option>
                      <option>{t('dashboard.dateFilter.storeA')}</option>
                      <option>{t('dashboard.dateFilter.storeB')}</option>
                    </DropdownSelect>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DateInput 
                      type="date" 
                      value={format(dateRange.startDate, 'yyyy-MM-dd')}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                    />
                    <span style={{ color: '#6b7280', fontSize: '0.75rem', alignSelf: 'center' }}>to</span>
                    <DateInput 
                      type="date" 
                      value={format(dateRange.endDate, 'yyyy-MM-dd')}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                    />
                  </div>
                </HeaderActions>
              </DropdownHeader>

              <DropdownContent>
                <CalendarSection>
                  <CalendarHeader>
                    <CalendarTitle>{format(currentMonth, 'MMMM yyyy')}</CalendarTitle>
                    <CalendarNavigation>
                      <NavButton 
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </NavButton>
                      <NavButton 
                        onClick={() => setCurrentMonth(addDays(currentMonth, 1))}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </NavButton>
                    </CalendarNavigation>
                  </CalendarHeader>

                  <CalendarGrid>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <CalendarDayHeader key={day}>{day}</CalendarDayHeader>
                    ))}
                    {calendarDays.map((day, index) => (
                      <CalendarDay
                        key={index}
                        className={getDateClassName(day)}
                        onClick={() => handleDateClick(day)}
                        onDoubleClick={() => handleDateDoubleClick(day)}
                      >
                        {format(day, 'd')}
                      </CalendarDay>
                    ))}
                  </CalendarGrid>
                </CalendarSection>

                <PresetSection>
                  <PresetTitle>{t('dashboard.dateFilter.quickSelect')}</PresetTitle>
                  {visiblePresets.map((preset) => (
                    <PresetButton
                      key={preset.id}
                      className={activePreset === preset.id ? 'active' : ''}
                      onClick={() => handlePresetClick(preset)}
                    >
                      {preset.label}
                      {activePreset === preset.id && (
                        <PresetBadge>Active</PresetBadge>
                      )}
                    </PresetButton>
                  ))}
                  
                  {showMorePresets && hiddenPresets.map((preset) => (
                    <PresetButton
                      key={preset.id}
                      className={activePreset === preset.id ? 'active' : ''}
                      onClick={() => handlePresetClick(preset)}
                    >
                      {preset.label}
                      {activePreset === preset.id && (
                        <PresetBadge>Active</PresetBadge>
                      )}
                    </PresetButton>
                  ))}
                  
                  <ShowMoreButton onClick={() => setShowMorePresets(!showMorePresets)}>
                    {showMorePresets ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polyline points="18,15 12,9 6,15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Show less
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Show more
                      </>
                    )}
                  </ShowMoreButton>
                </PresetSection>
              </DropdownContent>

              <DropdownFooter>
                <FooterButton className="cancel" onClick={handleCancel}>
                  {t('dashboard.dateFilter.cancel')}
                </FooterButton>
                <FooterButton className="apply" onClick={handleApply}>
                  {t('dashboard.dateFilter.apply')}
                </FooterButton>
              </DropdownFooter>
            </DateFilterDropdown>
          </>
        )}
      </AnimatePresence>
    </DateFilterContainer>
  );
};

export default AdvancedDateRangeFilter; 