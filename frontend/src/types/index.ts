import { Timestamp } from 'firebase/firestore';

// User types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  companyId?: string;
  role: UserRole;
  subscription: SubscriptionTier;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: UserSettings;
}

export type UserRole = 'individual' | 'team_member' | 'team_lead' | 'admin';

export interface UserSettings {
  language: 'nl' | 'en';
  notifications: {
    email: boolean;
    browser: boolean;
    applicationUpdates: boolean;
    teamUpdates: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
  };
}

// Company types
export interface Company {
  id: string;
  kvkNumber: string;
  name: string;
  legalForm: string;
  address: Address;
  contactPerson: ContactPerson;
  industry: string;
  employees: number;
  revenue?: number;
  foundedYear: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  members: string[]; // User IDs
  admins: string[]; // User IDs
}

export interface Address {
  street: string;
  houseNumber: string;
  houseNumberAddition?: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface ContactPerson {
  name: string;
  email: string;
  phone: string;
  position: string;
}

// WBSO Application types
export interface WBSOApplication {
  id: string;
  companyId: string;
  userId: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  status: ApplicationStatus;
  projects: WBSOProject[];
  totalEstimatedHours: number;
  totalEstimatedBenefit: number;
  rvoReference?: string;
  submittedAt?: Timestamp;
  approvedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata: ApplicationMetadata;
}

export type ApplicationStatus = 
  | 'draft' 
  | 'generated' 
  | 'reviewed' 
  | 'submitted' 
  | 'approved' 
  | 'rejected' 
  | 'archived';

export interface WBSOProject {
  id: string;
  title: string;
  description: string;
  technicalDescription: string; // AI generated
  category: ProjectCategory;
  estimatedHours: number;
  estimatedBenefit: number;
  hourlyRate?: number;
  startDate: Date;
  endDate: Date;
  employees: ProjectEmployee[];
  objectives: string[];
  innovations: string[];
  risks: string[];
  aiGenerated: boolean;
  aiPrompt?: string;
  userFeedback?: {
    rating: 1 | 2 | 3 | 4 | 5;
    comments: string;
    improvements: string[];
  };
}

export type ProjectCategory = 
  | 'software_development'
  | 'hardware_development'
  | 'process_innovation'
  | 'product_development'
  | 'research'
  | 'other';

export interface ProjectEmployee {
  name: string;
  role: string;
  hoursPerWeek: number;
  hourlyRate: number;
  qualifications: string[];
}

export interface ApplicationMetadata {
  aiModelVersion: string;
  generationTime: number; // milliseconds
  wordCount: number;
  confidence: number; // 0-1
  lastEdited: Timestamp;
  editorUserId: string;
  version: number;
  changelog: ChangelogEntry[];
}

export interface ChangelogEntry {
  version: number;
  changes: string[];
  userId: string;
  timestamp: Timestamp;
}

// Subscription types
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface Subscription {
  id: string;
  userId: string;
  companyId?: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  features: SubscriptionFeatures;
  usage: UsageMetrics;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type SubscriptionStatus = 
  | 'active' 
  | 'trialing' 
  | 'past_due' 
  | 'canceled' 
  | 'unpaid';

export interface SubscriptionFeatures {
  applicationsPerYear: number;
  chromeExtension: boolean;
  aiGeneration: boolean;
  teamFeatures: boolean;
  prioritySupport: boolean;
  customIntegrations: boolean;
  analyticsReports: boolean;
}

export interface UsageMetrics {
  applicationsCreated: number;
  aiGenerationsUsed: number;
  storageUsed: number; // bytes
  lastUsed: Timestamp;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Timestamp;
    requestId: string;
    processingTime: number;
  };
}

// KVK API types
export interface KVKCompanyData {
  kvkNumber: string;
  branchNumber?: string;
  rsin?: string;
  name: string;
  formattedAddress: string;
  businessAddress: Address;
  website?: string;
  employees?: number;
  legalForm: string;
  businessActivities: BusinessActivity[];
  tradeNames: TradeName[];
}

export interface BusinessActivity {
  sbiCode: string;
  sbiCodeDescription: string;
  isMainSbi: boolean;
}

export interface TradeName {
  name: string;
  currentTradeName: boolean;
}

// Chrome Extension types
export interface ExtensionMessage {
  type: ExtensionMessageType;
  payload: any;
  requestId: string;
  timestamp: number;
}

export type ExtensionMessageType = 
  | 'AUTH_STATUS'
  | 'GET_APPLICATION'
  | 'FILL_FORM'
  | 'FORM_DETECTED'
  | 'FORM_FILLED'
  | 'ERROR';

export interface FormFieldMapping {
  selector: string;
  value: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
  required: boolean;
}

// Analytics and reporting types
export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  metrics: {
    applicationsCreated: number;
    successRate: number;
    avgProcessingTime: number;
    userSatisfaction: number;
    aiAccuracy: number;
  };
  trends: TrendData[];
}

export interface TrendData {
  date: Date;
  value: number;
  change: number;
  changePercent: number;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  timestamp: Timestamp;
  userId?: string;
  context?: Record<string, any>;
  stack?: string;
}

// Navigation and UI types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
  badge?: string | number;
  children?: NavItem[];
  requiredRole?: UserRole[];
  requiredFeature?: keyof SubscriptionFeatures;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  helperText?: string;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// Export utility types
export type WithId<T> = T & { id: string };
export type Partial<T> = { [P in keyof T]?: T[P] };
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>; 