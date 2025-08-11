// Iraqi Names Database for Auto-completion
// This file contains common Iraqi names for form auto-completion

export const iraqiNames = {
  // Common Iraqi first names (male)
  maleFirstNames: [
    'Ahmed', 'Ali', 'Hassan', 'Hussein', 'Mohammed', 'Omar', 'Khalid', 'Yusuf', 'Ibrahim', 'Mustafa'
  ],
  
  // Common Iraqi first names (female) 
  femaleFirstNames: [
    'Fatima', 'Aisha', 'Zainab', 'Mariam', 'Huda', 'Noor', 'Layla', 'Rania', 'Sara', 'Amina'
  ],
  

  
  // Common Iraqi father names
  fatherNames: [
    'Abdullah', 'Mahmoud', 'Saleh', 'Kareem', 'Tariq', 'Nasser', 'Faisal', 'Rashid', 'Samir', 'Adnan'
  ],
  
  // Common Iraqi grandfather names
  grandfatherNames: [
    'Hassan', 'Ali', 'Ahmed', 'Mohammed', 'Ibrahim', 'Yusuf', 'Khalil', 'Rashid', 'Saleh', 'Mahmoud'
  ]
};

// Helper function to get filtered names based on input
export const getFilteredNames = (input, nameType) => {
  if (!input || input.length < 2) return [];
  
  const names = iraqiNames[nameType] || [];
  const lowerInput = input.toLowerCase();
  
  return names
    .filter(name => name.toLowerCase().includes(lowerInput))
    .slice(0, 10); // Limit to 10 suggestions
};

// Helper function to get random name for testing
export const getRandomName = (nameType) => {
  const names = iraqiNames[nameType] || [];
  if (names.length === 0) return '';
  return names[Math.floor(Math.random() * names.length)];
}; 