/**
 * Health-related types for the Holistic Health app
 */

/**
 * Base interface for database entities with sync capabilities
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
  isDeleted: boolean;
}

/**
 * User profile information
 */
export interface UserProfile extends BaseEntity {
  email: string;
  username: string;
  level: number;
  totalScore: number;
  preferences: UserPreferences;
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  notifications: boolean;
  reminderTimes: string[];
  weeklyGoals: Record<string, number>;
  theme: 'light' | 'dark' | 'system';
}

/**
 * Represents a health element within an aspect (e.g., Water in Nutrition)
 */
export interface HealthElement extends BaseEntity {
  aspectId: string;
  name: string;
  description: string;
  color: string;
  targetValue: number;
  unit: string;
  category: string;
  isActive: boolean;
}

/**
 * Represents a health aspect (e.g., Nutrition, Recovery, etc.)
 */
export interface HealthAspect extends BaseEntity {
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

/**
 * Represents a log entry for a health element
 */
export interface ActivityLogEntry extends BaseEntity {
  userId: string;
  elementId: string;
  aspectId: string;
  value: number;
  unit: string;
  notes?: string;
  logDate: Date; // Separate from timestamp for daily aggregation
}

/**
 * Daily summary for a health element
 */
export interface DailySummary extends BaseEntity {
  userId: string;
  elementId: string;
  aspectId: string;
  date: Date;
  totalValue: number;
  targetValue: number;
  completionPercentage: number;
  entryCount: number;
}

/**
 * Weekly summary for a health aspect
 */
export interface WeeklySummary extends BaseEntity {
  userId: string;
  aspectId: string;
  weekStartDate: Date;
  totalScore: number;
  maxScore: number;
  completionPercentage: number;
  elementSummaries: ElementWeeklySummary[];
}

/**
 * Weekly summary for individual elements within an aspect
 */
export interface ElementWeeklySummary {
  elementId: string;
  totalValue: number;
  targetValue: number;
  completionPercentage: number;
  daysActive: number;
}

/**
 * Sync status tracking for offline-first functionality
 */
export interface SyncStatus {
  tableName: string;
  lastSyncAt: Date;
  pendingChanges: number;
  syncInProgress: boolean;
}

/**
 * Enum for the different health aspect types
 */
export enum AspectType {
  NUTRITION = 'nutrition',
  RECOVERY = 'recovery',
  PHYSICAL = 'physical',
  MENTAL = 'mental',
  SOCIAL = 'social',
  ENVIRONMENT = 'environment'
}

/**
 * Database table names
 */
export enum TableName {
  USER_PROFILES = 'user_profiles',
  HEALTH_ASPECTS = 'health_aspects',
  HEALTH_ELEMENTS = 'health_elements',
  ACTIVITY_LOGS = 'activity_logs',
  DAILY_SUMMARIES = 'daily_summaries',
  WEEKLY_SUMMARIES = 'weekly_summaries',
  SYNC_STATUS = 'sync_status'
}

/**
 * Sync operation types
 */
export enum SyncOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

/**
 * Pending sync record for offline changes
 */
export interface PendingSyncRecord {
  id: string;
  tableName: string;
  recordId: string;
  operation: SyncOperation;
  data: any;
  createdAt: Date;
  retryCount: number;
}
