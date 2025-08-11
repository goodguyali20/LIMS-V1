// Core utilities
export { default as dateUtils } from './core/dateUtils.js';
export { default as validation } from './core/validation.ts';
export { default as authHelper } from './core/authHelper.js';

// Security utilities
export { default as security } from './security/security.ts';
export { default as authSecurity } from './security/authSecurity.ts';

// PDF utilities
export { default as pdfGenerator } from './pdf/pdfGenerator.js';
export { default as pdfGeneratorEnhanced } from './pdf/pdfGeneratorEnhanced.js';

// Performance utilities
export { default as performanceOptimizer } from './performance/performanceOptimizer.ts';
export { default as layoutShiftPrevention } from './performance/layoutShiftPrevention.tsx';
export { default as layoutShiftDebugger } from './performance/layoutShiftDebugger.js';

// Data utilities
export { default as dataExport } from './data/dataExport.ts';
export { default as patientMetrics } from './data/patientMetrics.js';
export { default as dashboardCache } from './data/dashboardCache.js';

// Patient utilities
export { default as patientRegistrationUtils } from './patient/patientRegistrationUtils.js';
export { default as iraqiNamesData } from './patient/iraqiNamesData.js';

// Monitoring utilities
export { default as auditLogger } from './monitoring/auditLogger.js';
export { default as errorMonitoring } from './monitoring/errorMonitoring.tsx';

// External services
export { default as weatherService } from './services/weatherService.js';

// Testing utilities
export { default as quickTest } from './testing/quickTest.js';
