import { z } from 'zod';
import { getAge } from './dateUtils.js';

/**
 * Generates a dynamic Zod schema for patient registration based on field configurations
 * @param {Object} fieldConfig - The patient registration field configuration from settings
 * @returns {z.ZodObject} - Dynamic Zod schema
 */
export const generatePatientSchema = (fieldConfig) => {
  const schemaFields = {};

  // Personal Information Fields
  if (fieldConfig.firstName?.enabled) {
    schemaFields.firstName = fieldConfig.firstName.required
      ? z.string()
          .min(2, 'First name must be at least 2 characters')
          .max(50, 'First name must be less than 50 characters')
          .regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, 'First name can only contain Arabic or Latin letters and spaces')
      : z.string()
          .min(2, 'First name must be at least 2 characters')
          .max(50, 'First name must be less than 50 characters')
          .regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, 'First name can only contain Arabic or Latin letters and spaces')
          .optional()
          .or(z.literal(''));
  }



  if (fieldConfig.fathersName?.enabled) {
    schemaFields.fathersName = fieldConfig.fathersName.required
      ? z.string()
          .min(2, "Father's name must be at least 2 characters")
          .max(50, "Father's name must be less than 50 characters")
          .regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, "Father's name can only contain Arabic or Latin letters and spaces")
      : z.string()
          .min(2, "Father's name must be at least 2 characters")
          .max(50, "Father's name must be less than 50 characters")
          .regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, "Father's name can only contain Arabic or Latin letters and spaces")
          .optional()
          .or(z.literal(''));
  }
  if (fieldConfig.grandFathersName?.enabled) {
    schemaFields.grandFathersName = fieldConfig.grandFathersName.required
      ? z.string()
          .min(2, "Grandfather's name must be at least 2 characters")
          .max(50, "Grandfather's name must be less than 50 characters")
          .regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, "Grandfather's name can only contain Arabic or Latin letters and spaces")
      : z.string()
          .min(2, "Grandfather's name must be at least 2 characters")
          .max(50, "Grandfather's name must be less than 50 characters")
          .regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, "Grandfather's name can only contain Arabic or Latin letters and spaces")
          .optional()
          .or(z.literal(''));
  }

  if (fieldConfig.age?.enabled) {
    schemaFields.age = fieldConfig.age.required
      ? z.object({
          value: z.number().min(0, 'Age must be 0 or greater').max(120, 'Age must be 120 or less'),
          unit: z.enum(['years', 'months', 'days'])
        }).refine(obj => {
          if (obj.unit === 'years') return obj.value <= 120;
          if (obj.unit === 'months') return obj.value <= 24;
          if (obj.unit === 'days') return obj.value <= 60;
          return false;
        }, { message: 'Invalid age for selected unit' })
      : z.object({
          value: z.number().min(0, 'Age must be 0 or greater').max(120, 'Age must be 120 or less').optional(),
          unit: z.enum(['years', 'months', 'days']).optional()
        });
  }

  if (fieldConfig.gender?.enabled) {
    schemaFields.gender = fieldConfig.gender.required
      ? z.enum(['male', 'female'], {
          required_error: 'Gender is required'
        })
      : z.enum(['male', 'female']).optional().or(z.literal(''));
  }

  if (fieldConfig.phoneNumber?.enabled) {
    schemaFields.phoneNumber = fieldConfig.phoneNumber.required
      ? z.string()
          .regex(/^07\d{9}$/, 'Phone number must start with 07 and be exactly 11 digits (Iraq format)')
      : z.string()
          .regex(/^07\d{9}$/, 'Phone number must start with 07 and be exactly 11 digits (Iraq format)')
          .optional()
          .or(z.literal(''));
  }

  if (fieldConfig.email?.enabled) {
    schemaFields.email = fieldConfig.email.required
      ? z.string().email('Invalid email address')
      : z.string().email('Invalid email address').optional().or(z.literal(''));
  }

  // Address Information
  if (fieldConfig.address?.street?.enabled || fieldConfig.address?.city?.enabled || 
      fieldConfig.address?.state?.enabled || fieldConfig.address?.zipCode?.enabled || 
      fieldConfig.address?.country?.enabled) {
    const addressFields = {};
    
    if (fieldConfig.address.street?.enabled) {
      addressFields.street = fieldConfig.address.street.required
        ? z.string()
            .min(5, 'Street address must be at least 5 characters')
            .max(100, 'Street address must be less than 100 characters')
        : z.string()
            .min(5, 'Street address must be at least 5 characters')
            .max(100, 'Street address must be less than 100 characters')
            .optional()
            .or(z.literal(''));
    }

    if (fieldConfig.address.city?.enabled) {
      addressFields.city = fieldConfig.address.city.required
        ? z.string()
            .min(2, 'City must be at least 2 characters')
            .max(50, 'City must be less than 50 characters')
        : z.string()
            .min(2, 'City must be at least 2 characters')
            .max(50, 'City must be less than 50 characters')
            .optional()
            .or(z.literal(''));
    }

    if (fieldConfig.address.state?.enabled) {
      addressFields.state = fieldConfig.address.state.required
        ? z.string()
            .min(2, 'State must be at least 2 characters')
            .max(50, 'State must be less than 50 characters')
        : z.string()
            .min(2, 'State must be at least 2 characters')
            .max(50, 'State must be less than 50 characters')
            .optional()
            .or(z.literal(''));
    }

    if (fieldConfig.address.zipCode?.enabled) {
      addressFields.zipCode = fieldConfig.address.zipCode.required
        ? z.string()
            .min(5, 'ZIP code must be at least 5 characters')
            .max(10, 'ZIP code must be less than 10 characters')
            .regex(/^[\d\-]+$/, 'ZIP code can only contain digits and hyphens')
        : z.string()
            .min(5, 'ZIP code must be at least 5 characters')
            .max(10, 'ZIP code must be less than 10 characters')
            .regex(/^[\d\-]+$/, 'ZIP code can only contain digits and hyphens')
            .optional()
            .or(z.literal(''));
    }

    if (fieldConfig.address.country?.enabled) {
      addressFields.country = fieldConfig.address.country.required
        ? z.string()
            .min(2, 'Country must be at least 2 characters')
            .max(50, 'Country must be less than 50 characters')
        : z.string()
            .min(2, 'Country must be at least 2 characters')
            .max(50, 'Country must be less than 50 characters')
            .optional()
            .or(z.literal(''));
    }

    if (Object.keys(addressFields).length > 0) {
      schemaFields.address = z.object(addressFields);
    }
  }

  // Emergency Contact
  if (fieldConfig.emergencyContact?.name?.enabled || fieldConfig.emergencyContact?.relationship?.enabled || 
      fieldConfig.emergencyContact?.phoneNumber?.enabled) {
    const emergencyFields = {};
    
    if (fieldConfig.emergencyContact.name?.enabled) {
      emergencyFields.name = fieldConfig.emergencyContact.name.required
        ? z.string()
            .min(2, 'Emergency contact name must be at least 2 characters')
            .max(100, 'Emergency contact name must be less than 100 characters')
        : z.string()
            .min(2, 'Emergency contact name must be at least 2 characters')
            .max(100, 'Emergency contact name must be less than 100 characters')
            .optional()
            .or(z.literal(''));
    }

    if (fieldConfig.emergencyContact.relationship?.enabled) {
      emergencyFields.relationship = fieldConfig.emergencyContact.relationship.required
        ? z.string()
            .min(2, 'Relationship must be at least 2 characters')
            .max(50, 'Relationship must be less than 50 characters')
        : z.string()
            .min(2, 'Relationship must be at least 2 characters')
            .max(50, 'Relationship must be less than 50 characters')
            .optional()
            .or(z.literal(''));
    }

    if (fieldConfig.emergencyContact.phoneNumber?.enabled) {
      emergencyFields.phoneNumber = fieldConfig.emergencyContact.phoneNumber.required
        ? z.string()
            .min(10, 'Emergency contact phone must be at least 10 digits')
            .max(15, 'Emergency contact phone must be less than 15 digits')
            .regex(/^[\d\s\-\+\(\)]+$/, 'Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses')
        : z.string()
            .min(10, 'Emergency contact phone must be at least 10 digits')
            .max(15, 'Emergency contact phone must be less than 15 digits')
            .regex(/^[\d\s\-\+\(\)]+$/, 'Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses')
            .optional()
            .or(z.literal(''));
    }

    if (Object.keys(emergencyFields).length > 0) {
      schemaFields.emergencyContact = z.object(emergencyFields);
    }
  }

  // Medical History
  if (fieldConfig.medicalHistory?.allergies?.enabled || fieldConfig.medicalHistory?.medications?.enabled || 
      fieldConfig.medicalHistory?.conditions?.enabled || fieldConfig.medicalHistory?.notes?.enabled) {
    const medicalFields = {};
    
    if (fieldConfig.medicalHistory.allergies?.enabled) {
      medicalFields.allergies = fieldConfig.medicalHistory.allergies.required
        ? z.string().max(500, 'Allergies description must be less than 500 characters')
        : z.string().max(500, 'Allergies description must be less than 500 characters').optional().or(z.literal(''));
    }

    if (fieldConfig.medicalHistory.medications?.enabled) {
      medicalFields.medications = fieldConfig.medicalHistory.medications.required
        ? z.string().max(500, 'Medications description must be less than 500 characters')
        : z.string().max(500, 'Medications description must be less than 500 characters').optional().or(z.literal(''));
    }

    if (fieldConfig.medicalHistory.conditions?.enabled) {
      medicalFields.conditions = fieldConfig.medicalHistory.conditions.required
        ? z.string().max(500, 'Medical conditions description must be less than 500 characters')
        : z.string().max(500, 'Medical conditions description must be less than 500 characters').optional().or(z.literal(''));
    }

    if (fieldConfig.medicalHistory.notes?.enabled) {
      medicalFields.notes = fieldConfig.medicalHistory.notes.required
        ? z.string().max(1000, 'Notes must be less than 1000 characters')
        : z.string().max(1000, 'Notes must be less than 1000 characters').optional().or(z.literal(''));
    }

    if (Object.keys(medicalFields).length > 0) {
      schemaFields.medicalHistory = z.object(medicalFields);
    }
  }

  // Insurance Information
  if (fieldConfig.insurance?.provider?.enabled || fieldConfig.insurance?.policyNumber?.enabled || 
      fieldConfig.insurance?.groupNumber?.enabled) {
    const insuranceFields = {};
    
    if (fieldConfig.insurance.provider?.enabled) {
      insuranceFields.provider = fieldConfig.insurance.provider.required
        ? z.string().max(100, 'Insurance provider must be less than 100 characters')
        : z.string().max(100, 'Insurance provider must be less than 100 characters').optional().or(z.literal(''));
    }

    if (fieldConfig.insurance.policyNumber?.enabled) {
      insuranceFields.policyNumber = fieldConfig.insurance.policyNumber.required
        ? z.string().max(50, 'Policy number must be less than 50 characters')
        : z.string().max(50, 'Policy number must be less than 50 characters').optional().or(z.literal(''));
    }

    if (fieldConfig.insurance.groupNumber?.enabled) {
      insuranceFields.groupNumber = fieldConfig.insurance.groupNumber.required
        ? z.string().max(50, 'Group number must be less than 50 characters')
        : z.string().max(50, 'Group number must be less than 50 characters').optional().or(z.literal(''));
    }

    if (Object.keys(insuranceFields).length > 0) {
      schemaFields.insurance = z.object(insuranceFields);
    }
  }

  return z.object(schemaFields);
};

/**
 * Generates default values for the form based on field configurations
 * @param {Object} fieldConfig - The patient registration field configuration from settings
 * @returns {Object} - Default values object
 */
export const generateDefaultValues = (fieldConfig) => {
  const defaultValues = {};

  // Personal Information
  if (fieldConfig.firstName?.enabled) defaultValues.firstName = '';
  if (fieldConfig.fathersName?.enabled) defaultValues.fathersName = '';
  if (fieldConfig.grandFathersName?.enabled) defaultValues.grandFathersName = '';
  if (fieldConfig.age?.enabled) defaultValues.age = null;
  if (fieldConfig.gender?.enabled) defaultValues.gender = '';
  if (fieldConfig.phoneNumber?.enabled) defaultValues.phoneNumber = '';
  if (fieldConfig.email?.enabled) defaultValues.email = '';

  // Address Information
  if (fieldConfig.address?.street?.enabled || fieldConfig.address?.city?.enabled || 
      fieldConfig.address?.state?.enabled || fieldConfig.address?.zipCode?.enabled || 
      fieldConfig.address?.country?.enabled) {
    defaultValues.address = {};
    if (fieldConfig.address.street?.enabled) defaultValues.address.street = '';
    if (fieldConfig.address.city?.enabled) defaultValues.address.city = '';
    if (fieldConfig.address.state?.enabled) defaultValues.address.state = '';
    if (fieldConfig.address.zipCode?.enabled) defaultValues.address.zipCode = '';
    if (fieldConfig.address.country?.enabled) defaultValues.address.country = 'United States';
  }

  // Emergency Contact
  if (fieldConfig.emergencyContact?.name?.enabled || fieldConfig.emergencyContact?.relationship?.enabled || 
      fieldConfig.emergencyContact?.phoneNumber?.enabled) {
    defaultValues.emergencyContact = {};
    if (fieldConfig.emergencyContact.name?.enabled) defaultValues.emergencyContact.name = '';
    if (fieldConfig.emergencyContact.relationship?.enabled) defaultValues.emergencyContact.relationship = '';
    if (fieldConfig.emergencyContact.phoneNumber?.enabled) defaultValues.emergencyContact.phoneNumber = '';
  }

  // Medical History
  if (fieldConfig.medicalHistory?.allergies?.enabled || fieldConfig.medicalHistory?.medications?.enabled || 
      fieldConfig.medicalHistory?.conditions?.enabled || fieldConfig.medicalHistory?.notes?.enabled) {
    defaultValues.medicalHistory = {};
    if (fieldConfig.medicalHistory.allergies?.enabled) defaultValues.medicalHistory.allergies = '';
    if (fieldConfig.medicalHistory.medications?.enabled) defaultValues.medicalHistory.medications = '';
    if (fieldConfig.medicalHistory.conditions?.enabled) defaultValues.medicalHistory.conditions = '';
    if (fieldConfig.medicalHistory.notes?.enabled) defaultValues.medicalHistory.notes = '';
  }

  // Insurance Information
  if (fieldConfig.insurance?.provider?.enabled || fieldConfig.insurance?.policyNumber?.enabled || 
      fieldConfig.insurance?.groupNumber?.enabled) {
    defaultValues.insurance = {};
    if (fieldConfig.insurance.provider?.enabled) defaultValues.insurance.provider = '';
    if (fieldConfig.insurance.policyNumber?.enabled) defaultValues.insurance.policyNumber = '';
    if (fieldConfig.insurance.groupNumber?.enabled) defaultValues.insurance.groupNumber = '';
  }

  return defaultValues;
};

/**
 * Checks if a field should be rendered based on configuration
 * @param {Object} fieldConfig - The field configuration
 * @param {string} section - The section name (optional)
 * @param {string} field - The field name
 * @returns {boolean} - Whether the field should be rendered
 */
export const shouldRenderField = (fieldConfig, section = null, field = null) => {
  if (section && field) {
    return fieldConfig[section]?.[field]?.enabled === true;
  } else if (section) {
    // Check if any field in the section is enabled
    const sectionConfig = fieldConfig[section];
    if (!sectionConfig) {
      return false;
    }
    
    return Object.values(sectionConfig).some(fieldConfig => fieldConfig?.enabled === true);
  }
  
  return fieldConfig[field]?.enabled === true;
};

/**
 * Checks if a field is required based on configuration
 * @param {Object} fieldConfig - The field configuration
 * @param {string} section - The section name (optional)
 * @param {string} field - The field name
 * @returns {boolean} - Whether the field is required
 */
export const isFieldRequired = (fieldConfig, section = null, field = null) => {
  if (section && field) {
    return fieldConfig[section]?.[field]?.required === true;
  }
  return fieldConfig[field]?.required === true;
}; 