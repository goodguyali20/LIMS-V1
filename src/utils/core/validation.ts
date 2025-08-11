import * as yup from 'yup';
import { FormData, FormErrors } from '../types';

// Enhanced security patterns with stricter validation
const patterns = {
  phone: /^\+?[\d\s\-\(\)]{8,15}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  patientId: /^[A-Z0-9]{6,12}$/,
  insuranceNumber: /^[A-Z0-9]{8,16}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  decimal: /^\d+(\.\d{1,2})?$/,
  integer: /^\d+$/,
  // Add security patterns
  noScript: /^(?!.*<script).*$/i,
  noHtml: /^(?!.*<[^>]*>).*$/,
  safeText: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
};

// Input sanitization function
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/&/g, '&amp;') // Escape HTML entities
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Enhanced patient validation schema with security measures
export const patientSchema = yup.object({
  name: yup
    .string()
    .required('Patient name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  age: yup
    .number()
    .required('Age is required')
    .positive('Age must be positive')
    .integer('Age must be a whole number')
    .min(0, 'Age cannot be negative')
    .max(150, 'Age cannot exceed 150'),
  
  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(['Male', 'Female', 'Other'], 'Please select a valid gender'),
  
  patientId: yup
    .string()
    .required('Patient ID is required')
    .matches(patterns.patientId, 'Patient ID must be 6-12 alphanumeric characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(patterns.phone, 'Please enter a valid phone number'),
  
  email: yup
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  address: yup
    .string()
    .max(200, 'Address must be less than 200 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  dateOfBirth: yup
    .string()
    .matches(patterns.date, 'Please enter a valid date (YYYY-MM-DD)')
    .test('future-date', 'Date of birth cannot be in the future', (value) => {
      if (!value) return true;
      return new Date(value) <= new Date();
    }),
  
  emergencyContact: yup
    .string()
    .matches(patterns.phone, 'Please enter a valid phone number'),
  
  insuranceProvider: yup
    .string()
    .max(50, 'Insurance provider must be less than 50 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  insuranceNumber: yup
    .string()
    .matches(patterns.insuranceNumber, 'Insurance number must be 8-16 alphanumeric characters'),
  
  medicalHistory: yup
    .string()
    .max(500, 'Medical history must be less than 500 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  allergies: yup
    .array()
    .of(yup.string().max(50, 'Allergy must be less than 50 characters'))
    .max(10, 'Cannot have more than 10 allergies'),
});

// Enhanced test order validation schema
export const orderSchema = yup.object({
  patientId: yup
    .string()
    .required('Patient ID is required')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  patientName: yup
    .string()
    .required('Patient name is required')
    .min(2, 'Name must be at least 2 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  referringDoctor: yup
    .string()
    .required('Referring doctor is required')
    .min(2, 'Doctor name must be at least 2 characters')
    .max(100, 'Doctor name must be less than 100 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  tests: yup
    .array()
    .min(1, 'At least one test must be selected')
    .of(yup.object({
      id: yup.string().required(),
      name: yup.string().required(),
      department: yup.string().required(),
      price: yup.number().positive().required(),
    })),
  
  priority: yup
    .string()
    .required('Priority is required')
    .oneOf(['Normal', 'Urgent', 'Critical'], 'Please select a valid priority'),
  
  notes: yup
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
});

// Enhanced test result validation schema
export const resultSchema = yup.object({
  value: yup
    .string()
    .required('Test result value is required')
    .max(50, 'Result value must be less than 50 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  unit: yup
    .string()
    .required('Unit is required')
    .max(20, 'Unit must be less than 20 characters'),
  
  status: yup
    .string()
    .required('Status is required')
    .oneOf(['normal', 'high', 'low', 'critical'], 'Please select a valid status'),
  
  comments: yup
    .string()
    .max(200, 'Comments must be less than 200 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  critical: yup
    .boolean(),
});

// Enhanced inventory item validation schema
export const inventorySchema = yup.object({
  name: yup
    .string()
    .required('Item name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  category: yup
    .string()
    .required('Category is required')
    .oneOf(['Reagents', 'Consumables', 'Equipment', 'Supplies'], 'Please select a valid category'),
  
  quantity: yup
    .number()
    .required('Quantity is required')
    .positive('Quantity must be positive')
    .integer('Quantity must be a whole number'),
  
  minQuantity: yup
    .number()
    .required('Minimum quantity is required')
    .positive('Minimum quantity must be positive')
    .integer('Minimum quantity must be a whole number'),
  
  maxQuantity: yup
    .number()
    .required('Maximum quantity is required')
    .positive('Maximum quantity must be positive')
    .integer('Maximum quantity must be a whole number')
    .test('max-greater-than-min', 'Maximum quantity must be greater than minimum quantity', function(value) {
      const { minQuantity } = this.parent;
      return value > minQuantity;
    }),
  
  unit: yup
    .string()
    .required('Unit is required')
    .max(20, 'Unit must be less than 20 characters'),
  
  expiryDate: yup
    .string()
    .matches(patterns.date, 'Please enter a valid date (YYYY-MM-DD)')
    .test('future-date', 'Expiry date must be in the future', (value) => {
      if (!value) return true;
      return new Date(value) > new Date();
    }),
  
  supplier: yup
    .string()
    .required('Supplier is required')
    .min(2, 'Supplier name must be at least 2 characters')
    .max(100, 'Supplier name must be less than 100 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  cost: yup
    .number()
    .required('Cost is required')
    .positive('Cost must be positive')
    .max(999999.99, 'Cost cannot exceed 999,999.99'),
  
  location: yup
    .string()
    .required('Location is required')
    .max(100, 'Location must be less than 100 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  notes: yup
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
});

// Enhanced QC sample validation schema
export const qcSchema = yup.object({
  testName: yup
    .string()
    .required('Test name is required')
    .min(2, 'Test name must be at least 2 characters')
    .max(100, 'Test name must be less than 100 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  department: yup
    .string()
    .required('Department is required')
    .oneOf(['Chemistry', 'Hematology', 'Serology', 'Virology', 'Microbiology'], 'Please select a valid department'),
  
  date: yup
    .string()
    .required('Date is required')
    .matches(patterns.date, 'Please enter a valid date (YYYY-MM-DD)'),
  
  results: yup
    .array()
    .min(1, 'At least one result is required')
    .of(yup.object({
      parameter: yup.string().required('Parameter is required'),
      value: yup.number().required('Value is required'),
      unit: yup.string().required('Unit is required'),
      expectedRange: yup.object({
        min: yup.number().required('Minimum value is required'),
        max: yup.number().required('Maximum value is required'),
      }).test('max-greater-than-min', 'Maximum must be greater than minimum', function(value) {
        return value.max > value.min;
      }),
      status: yup.string().oneOf(['Pass', 'Fail', 'Warning']).required('Status is required'),
    })),
  
  operator: yup
    .string()
    .required('Operator is required')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  notes: yup
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
});

// Enhanced settings validation schema
export const settingsSchema = yup.object({
  labName: yup
    .string()
    .required('Lab name is required')
    .min(2, 'Lab name must be at least 2 characters')
    .max(100, 'Lab name must be less than 100 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  labAddress: yup
    .string()
    .required('Lab address is required')
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must be less than 200 characters')
    .test('no-script', 'Invalid characters detected', value => 
      patterns.noScript.test(value || '')
    ),
  
  labPhone: yup
    .string()
    .required('Lab phone is required')
    .matches(patterns.phone, 'Please enter a valid phone number'),
  
  labEmail: yup
    .string()
    .required('Lab email is required')
    .email('Please enter a valid email address'),
  
  currency: yup
    .string()
    .required('Currency is required')
    .oneOf(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'], 'Please select a valid currency'),
  
  timezone: yup
    .string()
    .required('Timezone is required'),
  
  dateFormat: yup
    .string()
    .required('Date format is required')
    .oneOf(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], 'Please select a valid date format'),
  
  language: yup
    .string()
    .required('Language is required')
    .oneOf(['en', 'ar'], 'Please select a valid language'),
  
  notifications: yup.object({
    email: yup.boolean(),
    sms: yup.boolean(),
    push: yup.boolean(),
  }),
  
  security: yup.object({
    sessionTimeout: yup
      .number()
      .required('Session timeout is required')
      .positive('Session timeout must be positive')
      .integer('Session timeout must be a whole number')
      .min(5, 'Session timeout must be at least 5 minutes')
      .max(480, 'Session timeout cannot exceed 8 hours'),
    requireMFA: yup.boolean(),
    passwordPolicy: yup.string(),
  }),
  
  printing: yup.object({
    defaultPrinter: yup.string(),
    autoPrint: yup.boolean(),
    printFormat: yup.string().oneOf(['A4', 'Thermal']),
  }),
});

// Generic validation function with enhanced error handling
export const validateForm = async <T extends FormData>(
  schema: yup.ObjectSchema<any>,
  data: T
): Promise<{ isValid: boolean; errors: FormErrors }> => {
  try {
    // Sanitize input data before validation
    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      const value = data[key];
      if (typeof value === 'string') {
        acc[key] = sanitizeInput(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    await schema.validate(sanitizedData, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: FormErrors = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};

// Field-specific validation with sanitization
export const validateField = async <T extends FormData>(
  schema: yup.ObjectSchema<any>,
  field: keyof T,
  value: any
): Promise<string | null> => {
  try {
    // Sanitize string values
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
    
    await schema.validateAt(field as string, { [field]: sanitizedValue });
    return null;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.message;
    }
    return 'Validation failed';
  }
};

// Real-time validation hook with sanitization
export const useFieldValidation = <T extends FormData>(
  schema: yup.ObjectSchema<any>,
  field: keyof T
) => {
  const validate = async (value: any): Promise<string | null> => {
    return validateField(schema, field, value);
  };

  return { validate };
};

// Export patterns for use in other modules
export { patterns }; 