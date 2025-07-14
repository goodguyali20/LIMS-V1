// User and Authentication Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions?: string[];
  createdAt?: Date;
  lastLogin?: Date;
}

export type UserRole = 'Manager' | 'Technician' | 'Phlebotomist' | 'Admin' | 'Doctor' | 'Patient';

// Order and Test Types
export interface TestOrder {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';
  referringDoctor: string;
  orderDate: Date;
  status: OrderStatus;
  priority: 'Normal' | 'Urgent' | 'Critical';
  tests: TestItem[];
  totalPrice: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
  rejectionReason?: string;
  amendments?: Amendment[];
}

export interface TestItem {
  id: string;
  name: string;
  department: string;
  price: number;
  status: TestStatus;
  result?: TestResult;
  critical?: boolean;
  unit?: string;
  referenceRange?: {
    min: number;
    max: number;
    unit: string;
  };
}

export interface TestResult {
  value: string | number;
  unit: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  comments?: string;
  enteredBy: string;
  enteredAt: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export type OrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Rejected';
export type TestStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

// Patient Types
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  patientId: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: Date;
  emergencyContact?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  medicalHistory?: string;
  allergies?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
  expiryDate?: Date;
  supplier: string;
  cost: number;
  location: string;
  notes?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired';
  createdAt: Date;
  updatedAt?: Date;
}

// Quality Control Types
export interface QCSample {
  id: string;
  testName: string;
  department: string;
  date: Date;
  results: QCResult[];
  status: 'Pending' | 'Passed' | 'Failed';
  operator: string;
  notes?: string;
}

export interface QCResult {
  parameter: string;
  value: number;
  unit: string;
  expectedRange: {
    min: number;
    max: number;
  };
  status: 'Pass' | 'Fail' | 'Warning';
}

// Theme and UI Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    input: string;
    hover: string;
    dark: {
      background: string;
      surface: string;
      surfaceSecondary: string;
      text: string;
      textSecondary: string;
      border: string;
      input: string;
      hover: string;
    };
    glow: {
      primary: string;
      success: string;
      danger: string;
      warning: string;
      info: string;
    };
    chemistry: string;
    hematology: string;
    serology: string;
    virology: string;
    microbiology: string;
    general: string;
  };
  shadows: {
    main: string;
    hover: string;
    large: string;
    dark: {
      main: string;
      hover: string;
      large: string;
    };
    glow: {
      primary: string;
      success: string;
      danger: string;
      warning: string;
      info: string;
    };
  };
  shapes: {
    squircle: string;
    circle: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  isDarkMode: boolean;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export interface OrderContextType {
  lastOrderId: string | null;
  setLastOrderId: (id: string | null) => void;
}

export interface TestContextType {
  labTests: LabTest[];
  loading: boolean;
  addTest: (testData: Partial<LabTest>) => Promise<any>;
  updateTest: (testId: string, testData: Partial<LabTest>) => Promise<void>;
  deleteTest: (testId: string) => Promise<void>;
}

export interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  saveSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
}

export interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Lab Test Types
export interface LabTest {
  id: string;
  name: string;
  department: string;
  price: number;
  unit?: string;
  referenceRange?: {
    min: number;
    max: number;
    unit: string;
  };
  turnaroundTime?: number;
  specimenType?: string;
  instructions?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Settings Types
export interface AppSettings {
  labName: string;
  labAddress: string;
  labPhone: string;
  labEmail: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  security: {
    sessionTimeout: number;
    requireMFA: boolean;
    passwordPolicy: string;
  };
  printing: {
    defaultPrinter: string;
    autoPrint: boolean;
    printFormat: 'A4' | 'Thermal';
  };
}

// Amendment Types
export interface Amendment {
  id: string;
  type: 'Add Test' | 'Remove Test' | 'Change Priority' | 'Other';
  description: string;
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userEmail: string;
  timestamp: Date;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'radio';
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
}

export interface FormData {
  [key: string]: unknown;
}

export interface FormErrors {
  [key: string]: string;
}

// Chart and Analytics Types
export interface ChartData {
  name: string;
  value: number;
  [key: string]: unknown;
}

export interface AnalyticsData {
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  tests: {
    total: number;
    byDepartment: Record<string, number>;
  };
  performance: {
    averageTurnaroundTime: number;
    onTimeDelivery: number;
  };
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

// Print Types
export interface PrintTemplate {
  id: string;
  name: string;
  type: 'requisition' | 'report' | 'slip';
  layout: 'A4' | 'Thermal';
  content: Record<string, unknown>;
  isDefault: boolean;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  department?: string[];
  priority?: string[];
  assignedTo?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Export Types
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts?: boolean;
  includeData?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: SearchFilters;
}

// Permission Types
export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  [role: string]: Permission[];
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  retry?: () => void;
}

// Pagination Types
export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Real-time Types
export interface RealtimeUpdate {
  type: 'order' | 'test' | 'inventory' | 'qc';
  action: 'create' | 'update' | 'delete';
  data: unknown;
  timestamp: Date;
}

// Validation Types
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type EventHandler<T = unknown> = (event: T) => void;

export type AsyncFunction<T = unknown, R = unknown> = (params: T) => Promise<R>;

// React Component Types
export type FC<P = {}> = React.FC<P>;
export type ReactNode = React.ReactNode;
export type ReactElement = React.ReactElement;
export type ChangeEvent<T = Element> = React.ChangeEvent<T>;
export type FormEvent<T = Element> = React.FormEvent<T>;
export type MouseEvent<T = Element> = React.MouseEvent<T>;
export type KeyboardEvent<T = Element> = React.KeyboardEvent<T>; 