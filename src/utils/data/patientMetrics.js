// Patient metrics service for tracking daily patient processing

// Simulate patient processing data (in real app, this would come from your database)
const getTodayPatientCount = () => {
  // Get today's date
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Get stored count for today
  const storedCount = localStorage.getItem(`patientCount_${todayKey}`);
  
  if (storedCount) {
    return parseInt(storedCount);
  }
  
  // Generate a realistic daily count (between 15-45 patients)
  const baseCount = Math.floor(Math.random() * 30) + 15;
  localStorage.setItem(`patientCount_${todayKey}`, baseCount.toString());
  
  return baseCount;
};

// Increment patient count (call this when a patient is processed)
export const incrementPatientCount = () => {
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  
  const currentCount = getTodayPatientCount();
  const newCount = currentCount + 1;
  
  localStorage.setItem(`patientCount_${todayKey}`, newCount.toString());
  
  return newCount;
};

// Get today's patient count
export const getTodayPatients = () => {
  return getTodayPatientCount();
};

// Get patient processing trend (compare with yesterday)
export const getPatientTrend = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayKey = today.toISOString().split('T')[0];
  const yesterdayKey = yesterday.toISOString().split('T')[0];
  
  const todayCount = getTodayPatientCount();
  const yesterdayCount = parseInt(localStorage.getItem(`patientCount_${yesterdayKey}`)) || 0;
  
  if (yesterdayCount === 0) return 'new';
  if (todayCount > yesterdayCount) return 'up';
  if (todayCount < yesterdayCount) return 'down';
  return 'same';
};

// Get patient processing status
export const getPatientStatus = () => {
  const count = getTodayPatientCount();
  const trend = getPatientTrend();
  
  if (count === 0) return 'No patients today';
  if (count < 10) return `${count} patients`;
  if (count < 25) return `${count} patients`;
  return `${count} patients`;
};

// Simulate real-time patient processing (for demo purposes)
export const simulatePatientProcessing = () => {
  // Simulate a new patient being processed every 2-5 minutes
  const interval = Math.random() * 180000 + 120000; // 2-5 minutes
  
  setTimeout(() => {
    incrementPatientCount();
    // Schedule next simulation
    simulatePatientProcessing();
  }, interval);
};

// Start simulation if in development mode
if (process.env.NODE_ENV === 'development') {
  // simulatePatientProcessing();
} 