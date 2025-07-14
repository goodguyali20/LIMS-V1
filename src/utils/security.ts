import DOMPurify from 'dompurify';

// Enhanced security patterns with stricter validation
export const securityPatterns = {
  phone: /^\+?[\d\s\-\(\)]{8,15}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  patientId: /^[A-Z0-9]{6,12}$/,
  insuranceNumber: /^[A-Z0-9]{8,16}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  decimal: /^\d+(\.\d{1,2})?$/,
  integer: /^\d+$/,
  // Security patterns
  noScript: /^(?!.*<script).*$/i,
  noHtml: /^(?!.*<[^>]*>).*$/,
  safeText: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  // Stricter patterns for sensitive data
  name: /^[a-zA-Z\s]{2,50}$/,
  medicalNotes: /^[a-zA-Z0-9\s\-_.,!?()\n\r]{0,1000}$/,
};

// Enhanced input sanitization with DOMPurify
export const sanitizeInput = (input: string, options: {
  allowHTML?: boolean;
  maxLength?: number;
  pattern?: RegExp;
} = {}): string => {
  if (typeof input !== 'string') return '';
  
  const { allowHTML = false, maxLength = 1000, pattern } = options;
  
  // Truncate if too long
  let sanitized = input.trim().slice(0, maxLength);
  
  // Apply pattern validation if provided
  if (pattern && !pattern.test(sanitized)) {
    throw new Error('Input does not match required pattern');
  }
  
  if (allowHTML) {
    // Use DOMPurify for HTML content
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: [],
    });
  } else {
    // Remove all HTML and potentially dangerous content
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  
  return sanitized;
};

// Rate limiting utility for API endpoints
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number; blocked: boolean }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000, // 15 minutes
    private blockDuration: number = 30 * 60 * 1000 // 30 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs, blocked: false });
      return true;
    }
    
    // Check if still blocked
    if (attempt.blocked && now < attempt.resetTime + this.blockDuration) {
      return false;
    }
    
    // Reset if window expired
    if (now > attempt.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs, blocked: false });
      return true;
    }
    
    // Check if max attempts exceeded
    if (attempt.count >= this.maxAttempts) {
      attempt.blocked = true;
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
  
  getRemainingAttempts(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - attempt.count);
  }
}

// CSRF token management
export class CSRFProtection {
  private static instance: CSRFProtection;
  private tokens: Set<string> = new Set();
  
  static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }
  
  generateToken(): string {
    const token = crypto.randomUUID();
    this.tokens.add(token);
    return token;
  }
  
  validateToken(token: string): boolean {
    const isValid = this.tokens.has(token);
    if (isValid) {
      this.tokens.delete(token); // Use once
    }
    return isValid;
  }
  
  cleanup(): void {
    // Clean up old tokens periodically
    this.tokens.clear();
  }
}

// Content Security Policy configuration
export const getCSPConfig = () => ({
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://firestore.googleapis.com', 'https://identitytoolkit.googleapis.com'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
});

// Secure headers configuration
export const getSecureHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
});

// Input validation for different field types
export const validateField = (value: any, fieldType: string, options: any = {}): boolean => {
  if (value === null || value === undefined) return false;
  
  const stringValue = String(value).trim();
  
  switch (fieldType) {
    case 'email':
      return securityPatterns.email.test(stringValue);
    case 'phone':
      return securityPatterns.phone.test(stringValue);
    case 'patientId':
      return securityPatterns.patientId.test(stringValue);
    case 'name':
      return securityPatterns.name.test(stringValue);
    case 'date':
      return securityPatterns.date.test(stringValue) && new Date(stringValue) <= new Date();
    case 'number':
      return !isNaN(Number(stringValue)) && Number(stringValue) >= 0;
    case 'text':
      return stringValue.length >= (options.minLength || 1) && 
             stringValue.length <= (options.maxLength || 1000);
    default:
      return stringValue.length > 0;
  }
};

// Audit logging for security events
export const logSecurityEvent = (event: string, details: any, userId?: string) => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userId,
    userAgent: navigator.userAgent,
    ip: 'client-ip', // Would be set by server
    sessionId: sessionStorage.getItem('sessionId'),
  };
  
  // Send to security monitoring service
  if (import.meta.env.PROD) {
    // In production, send to security monitoring service
    console.warn('Security Event:', securityLog);
  } else {
    console.log('Security Event:', securityLog);
  }
};

// Session management
export class SecureSession {
  private static instance: SecureSession;
  private sessionId: string | null = null;
  
  static getInstance(): SecureSession {
    if (!SecureSession.instance) {
      SecureSession.instance = new SecureSession();
    }
    return SecureSession.instance;
  }
  
  createSession(): string {
    this.sessionId = crypto.randomUUID();
    sessionStorage.setItem('sessionId', this.sessionId);
    return this.sessionId;
  }
  
  getSessionId(): string | null {
    return this.sessionId || sessionStorage.getItem('sessionId');
  }
  
  destroySession(): void {
    this.sessionId = null;
    sessionStorage.removeItem('sessionId');
  }
  
  isSessionValid(): boolean {
    return !!this.getSessionId();
  }
}

// Export security utilities
export const securityUtils = {
  sanitizeInput,
  validateField,
  logSecurityEvent,
  RateLimiter,
  CSRFProtection: CSRFProtection.getInstance(),
  SecureSession: SecureSession.getInstance(),
  patterns: securityPatterns,
}; 