import { securityUtils, logSecurityEvent } from './security';

// Password strength requirements
export const passwordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
  preventCommonPasswords: true,
};

// Common passwords to prevent
const commonPasswords = [
  'password', '123456', '123456789', 'qwerty', 'abc123',
  'password123', 'admin', 'letmein', 'welcome', 'monkey',
  'dragon', 'master', 'hello', 'freedom', 'whatever',
  'qazwsx', 'trustno1', 'jordan', 'harley', 'ranger',
  'iwantu', 'jennifer', 'hunter', 'buster', 'soccer',
  'baseball', 'tequiero', 'princess', 'merlin', 'diamond',
  'ncc1701', 'computer', 'amanda', 'summer', 'hello',
  'canada', 'access', 'yankees', '987654321', 'dallas',
  'austin', 'thunder', 'taylor', 'matrix', 'mobilemail',
  'mom', 'monitor', 'monitoring', 'montana', 'moon',
  'moscow', 'mother', 'movie', 'mozilla', 'music',
  'mustang', 'password', 'pa$$w0rd', 'p@ssw0rd', 'p@$$w0rd',
];

// Enhanced password validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
} => {
  const errors: string[] = [];
  let score = 0;

  // Check length
  if (password.length < passwordRequirements.minLength) {
    errors.push(`Password must be at least ${passwordRequirements.minLength} characters long`);
  } else {
    score += Math.min(password.length * 2, 20);
  }

  // Check for uppercase
  if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    score += 10;
  }

  // Check for lowercase
  if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    score += 10;
  }

  // Check for numbers
  if (passwordRequirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (/\d/.test(password)) {
    score += 10;
  }

  // Check for special characters
  if (passwordRequirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 15;
  }

  // Check for common passwords
  if (passwordRequirements.preventCommonPasswords && 
      commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
    score = 0;
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain more than 2 repeated characters in a row');
    score -= 10;
  }

  // Check for sequential characters
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    errors.push('Password cannot contain sequential characters');
    score -= 10;
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (score >= 60) strength = 'very-strong';
  else if (score >= 45) strength = 'strong';
  else if (score >= 30) strength = 'medium';

  return {
    isValid: errors.length === 0 && score >= 30,
    errors,
    strength,
  };
};

// Enhanced session management
export class SecureAuthSession {
  private static instance: SecureAuthSession;
  private sessions: Map<string, {
    userId: string;
    role: string;
    permissions: string[];
    createdAt: Date;
    lastActivity: Date;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
  }> = new Map();

  static getInstance(): SecureAuthSession {
    if (!SecureAuthSession.instance) {
      SecureAuthSession.instance = new SecureAuthSession();
    }
    return SecureAuthSession.instance;
  }

  createSession(userId: string, role: string, permissions: string[]): string {
    const sessionId = crypto.randomUUID();
    const now = new Date();

    this.sessions.set(sessionId, {
      userId,
      role,
      permissions,
      createdAt: now,
      lastActivity: now,
      ipAddress: 'client-ip', // Would be set by server
      userAgent: navigator.userAgent,
      isActive: true,
    });

    // Store in sessionStorage for client-side access
    sessionStorage.setItem('authSessionId', sessionId);
    sessionStorage.setItem('authUserId', userId);
    sessionStorage.setItem('authRole', role);
    sessionStorage.setItem('authPermissions', JSON.stringify(permissions));

    logSecurityEvent('session_created', { userId, role, sessionId });

    return sessionId;
  }

  validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) return false;

    // Check session timeout (8 hours)
    const now = new Date();
    const sessionAge = now.getTime() - session.createdAt.getTime();
    const maxSessionAge = 8 * 60 * 60 * 1000; // 8 hours

    if (sessionAge > maxSessionAge) {
      this.destroySession(sessionId);
      return false;
    }

    // Update last activity
    session.lastActivity = now;
    return true;
  }

  getSessionData(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  destroySession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      logSecurityEvent('session_destroyed', { 
        userId: session.userId, 
        sessionId,
        reason: 'manual_logout'
      });
    }

    this.sessions.delete(sessionId);
    
    // Clear client-side storage
    sessionStorage.removeItem('authSessionId');
    sessionStorage.removeItem('authUserId');
    sessionStorage.removeItem('authRole');
    sessionStorage.removeItem('authPermissions');
  }

  hasPermission(sessionId: string, permission: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) return false;
    
    return session.permissions.includes(permission) || 
           session.permissions.includes('admin') ||
           session.role === 'admin';
  }

  hasRole(sessionId: string, roles: string | string[]): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) return false;
    
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.includes(session.role);
  }

  // Clean up expired sessions
  cleanupExpiredSessions(): void {
    const now = new Date();
    const maxSessionAge = 8 * 60 * 60 * 1000; // 8 hours

    for (const [sessionId, session] of this.sessions.entries()) {
      const sessionAge = now.getTime() - session.createdAt.getTime();
      if (sessionAge > maxSessionAge) {
        this.destroySession(sessionId);
      }
    }
  }

  // Get all active sessions for a user
  getUserSessions(userId: string): string[] {
    const userSessions: string[] = [];
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId && session.isActive) {
        userSessions.push(sessionId);
      }
    }
    return userSessions;
  }

  // Force logout all sessions for a user
  forceLogoutUser(userId: string): void {
    const userSessions = this.getUserSessions(userId);
    userSessions.forEach(sessionId => {
      this.destroySession(sessionId);
    });

    logSecurityEvent('user_force_logout', { userId, sessionsTerminated: userSessions.length });
  }
}

// Enhanced role-based access control
export class RBAC {
  private static instance: RBAC;
  private roles: Map<string, {
    permissions: string[];
    inherits: string[];
    description: string;
  }> = new Map();

  static getInstance(): RBAC {
    if (!RBAC.instance) {
      RBAC.instance = new RBAC();
      RBAC.instance.initializeDefaultRoles();
    }
    return RBAC.instance;
  }

  private initializeDefaultRoles(): void {
    // Define default roles and permissions
    this.roles.set('admin', {
      permissions: ['*'], // All permissions
      inherits: [],
      description: 'System administrator with full access',
    });

    this.roles.set('manager', {
      permissions: [
        'view_dashboard',
        'manage_orders',
        'view_reports',
        'manage_patients',
        'view_audit_logs',
        'manage_inventory',
        'view_analytics',
        'manage_users',
        'approve_results',
        'view_quality_control',
      ],
      inherits: ['technician'],
      description: 'Laboratory manager with supervisory access',
    });

    this.roles.set('technician', {
      permissions: [
        'view_dashboard',
        'process_orders',
        'enter_results',
        'view_patients',
        'view_inventory',
        'perform_qc',
        'view_work_queue',
      ],
      inherits: ['phlebotomist'],
      description: 'Laboratory technician with testing capabilities',
    });

    this.roles.set('phlebotomist', {
      permissions: [
        'view_dashboard',
        'collect_samples',
        'view_orders',
        'view_patients',
        'update_sample_status',
        'view_work_queue',
      ],
      inherits: [],
      description: 'Sample collection specialist',
    });

    this.roles.set('user', {
      permissions: [
        'view_own_orders',
        'view_own_results',
        'update_profile',
      ],
      inherits: [],
      description: 'Basic user with limited access',
    });
  }

  hasPermission(userRole: string, permission: string): boolean {
    const role = this.roles.get(userRole);
    if (!role) return false;

    // Check direct permissions
    if (role.permissions.includes('*') || role.permissions.includes(permission)) {
      return true;
    }

    // Check inherited permissions
    for (const inheritedRole of role.inherits) {
      if (this.hasPermission(inheritedRole, permission)) {
        return true;
      }
    }

    return false;
  }

  getRolePermissions(role: string): string[] {
    const roleData = this.roles.get(role);
    if (!roleData) return [];

    const permissions = new Set(roleData.permissions);
    
    // Add inherited permissions
    for (const inheritedRole of roleData.inherits) {
      const inheritedPermissions = this.getRolePermissions(inheritedRole);
      inheritedPermissions.forEach(permission => permissions.add(permission));
    }

    return Array.from(permissions);
  }

  addRole(roleName: string, permissions: string[], inherits: string[] = [], description: string = ''): void {
    this.roles.set(roleName, {
      permissions,
      inherits,
      description,
    });
  }

  removeRole(roleName: string): void {
    if (roleName === 'admin') {
      throw new Error('Cannot remove admin role');
    }
    this.roles.delete(roleName);
  }
}

// Enhanced audit logging for authentication events
export const logAuthEvent = (event: string, details: any, userId?: string) => {
  const authLog = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userId,
    userAgent: navigator.userAgent,
    ip: 'client-ip', // Would be set by server
    sessionId: sessionStorage.getItem('authSessionId'),
  };

  logSecurityEvent(`auth_${event}`, authLog, userId);
};

// Export authentication security utilities
export const authSecurityUtils = {
  validatePassword,
  SecureAuthSession: SecureAuthSession.getInstance(),
  RBAC: RBAC.getInstance(),
  logAuthEvent,
  passwordRequirements,
}; 