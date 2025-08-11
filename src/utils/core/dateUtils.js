import { 
  format, 
  parseISO, 
  isValid, 
  addDays, 
  subDays, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  differenceInDays, 
  differenceInHours, 
  differenceInMinutes,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  formatDistanceToNow,
  formatRelative
} from 'date-fns';

/**
 * Format a date to a readable string
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return 'Invalid Date';
  }
  
  return format(dateObj, formatStr);
};

/**
 * Format a date to show relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return 'Invalid Date';
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Format a date to show relative time with more context
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string with context
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return 'Invalid Date';
  }
  
  return formatRelative(dateObj, new Date());
};

/**
 * Get a human-readable date string
 * @param {Date|string} date - Date to format
 * @returns {string} Human-readable date string
 */
export const getHumanReadableDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return 'Invalid Date';
  }
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  if (isThisWeek(dateObj)) {
    return format(dateObj, 'EEEE');
  }
  
  if (isThisMonth(dateObj)) {
    return format(dateObj, 'MMM dd');
  }
  
  return format(dateObj, 'MMM dd, yyyy');
};

/**
 * Format a date for display in tables
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date for tables
 */
export const formatTableDate = (date) => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return '-';
  }
  
  return format(dateObj, 'MMM dd, yyyy HH:mm');
};

/**
 * Format a date for sorting
 * @param {Date|string} date - Date to format
 * @returns {string} ISO date string for sorting
 */
export const formatSortableDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return '';
  }
  
  return format(dateObj, 'yyyy-MM-dd HH:mm:ss');
};

/**
 * Get the difference in days between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in days
 */
export const getDaysDifference = (date1, date2) => {
  const date1Obj = typeof date1 === 'string' ? parseISO(date1) : date1;
  const date2Obj = typeof date2 === 'string' ? parseISO(date2) : date2;
  
  if (!isValid(date1Obj) || !isValid(date2Obj)) {
    return 0;
  }
  
  return differenceInDays(date2Obj, date1Obj);
};

/**
 * Get the difference in hours between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in hours
 */
export const getHoursDifference = (date1, date2) => {
  const date1Obj = typeof date1 === 'string' ? parseISO(date1) : date1;
  const date2Obj = typeof date2 === 'string' ? parseISO(date2) : date2;
  
  if (!isValid(date1Obj) || !isValid(date2Obj)) {
    return 0;
  }
  
  return differenceInHours(date2Obj, date1Obj);
};

/**
 * Get the difference in minutes between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in minutes
 */
export const getMinutesDifference = (date1, date2) => {
  const date1Obj = typeof date1 === 'string' ? parseISO(date1) : date1;
  const date2Obj = typeof date2 === 'string' ? parseISO(date2) : date2;
  
  if (!isValid(date1Obj) || !isValid(date2Obj)) {
    return 0;
  }
  
  return differenceInMinutes(date2Obj, date1Obj);
};

/**
 * Get date range for a specific period
 * @param {string} period - Period type ('today', 'week', 'month', 'custom')
 * @param {Object} options - Additional options
 * @returns {Object} Object with start and end dates
 */
export const getDateRange = (period, options = {}) => {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return {
        start: startOfDay(now),
        end: endOfDay(now)
      };
    
    case 'week':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(now, { weekStartsOn: 1 })
      };
    
    case 'month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };
    
    case 'last7days':
      return {
        start: startOfDay(subDays(now, 6)),
        end: endOfDay(now)
      };
    
    case 'last30days':
      return {
        start: startOfDay(subDays(now, 29)),
        end: endOfDay(now)
      };
    
    case 'last90days':
      return {
        start: startOfDay(subDays(now, 89)),
        end: endOfDay(now)
      };
    
    case 'custom':
      return {
        start: options.start || startOfDay(now),
        end: options.end || endOfDay(now)
      };
    
    default:
      return {
        start: startOfDay(now),
        end: endOfDay(now)
      };
  }
};

/**
 * Generate an array of dates for a given range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Array of dates
 */
export const generateDateArray = (startDate, endDate) => {
  const dates = [];
  let currentDate = startOfDay(startDate);
  const end = endOfDay(endDate);
  
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};

/**
 * Format duration in a human-readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Check if a date is overdue
 * @param {Date|string} dueDate - Due date
 * @param {Date|string} currentDate - Current date (defaults to now)
 * @returns {boolean} True if overdue
 */
export const isOverdue = (dueDate, currentDate = new Date()) => {
  const dueDateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const currentDateObj = typeof currentDate === 'string' ? parseISO(currentDate) : currentDate;
  
  if (!isValid(dueDateObj) || !isValid(currentDateObj)) {
    return false;
  }
  
  return dueDateObj < currentDateObj;
};

/**
 * Get the age from a birth date
 * @param {Date|string} birthDate - Birth date
 * @param {Date|string} currentDate - Current date (defaults to now)
 * @returns {number} Age in years
 */
export const getAge = (birthDate, currentDate = new Date()) => {
  const birthDateObj = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
  const currentDateObj = typeof currentDate === 'string' ? parseISO(currentDate) : currentDate;
  
  if (!isValid(birthDateObj) || !isValid(currentDateObj)) {
    return 0;
  }
  
  return differenceInDays(currentDateObj, birthDateObj) / 365.25;
};

/**
 * Format a date for input fields
 * @param {Date|string} date - Date to format
 * @returns {string} Date in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return '';
  }
  
  return format(dateObj, 'yyyy-MM-dd');
};

/**
 * Format a date and time for input fields
 * @param {Date|string} date - Date to format
 * @returns {string} Date and time in YYYY-MM-DDTHH:mm format
 */
export const formatDateTimeForInput = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return '';
  }
  
  return format(dateObj, "yyyy-MM-dd'T'HH:mm");
};

export default {
  formatDate,
  formatRelativeTime,
  formatRelativeDate,
  getHumanReadableDate,
  formatTableDate,
  formatSortableDate,
  getDaysDifference,
  getHoursDifference,
  getMinutesDifference,
  getDateRange,
  generateDateArray,
  formatDuration,
  isOverdue,
  getAge,
  formatDateForInput,
  formatDateTimeForInput
}; 