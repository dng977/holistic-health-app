import { Platform } from 'react-native';

// Conditionally import SQLite for mobile platforms only
let SQLite: typeof import('expo-sqlite') | null = null;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
}

// Define database interface for type safety
interface DatabaseInstance {
  runAsync(sql: string, params?: any): Promise<{ changes: number; lastInsertRowId: number }>;
  getAllAsync(sql: string, params?: any): Promise<DatabaseRow[]>;
  getFirstAsync(sql: string, params?: any): Promise<DatabaseRow | null>;
  execAsync(sql: string): Promise<void>;
  closeAsync(): Promise<void>;
}

// Type for database row (snake_case from SQLite)
interface DatabaseRow {
  [key: string]: any;
}
import type { 
  UserProfile, 
  HealthAspect, 
  HealthElement, 
  ActivityLogEntry, 
  DailySummary, 
  WeeklySummary, 
  SyncStatus,
  PendingSyncRecord,
  BaseEntity
} from '../types/health';
import { TableName, SyncOperation } from '../types/health';

/**
 * SQLite Database Service for offline-first functionality
 */
class DatabaseService {
  private db: DatabaseInstance | null = null;
  private isInitialized = false;

  /**
   * Reset the database by deleting all data
   */
  async resetDatabase(): Promise<void> {
    console.log('🗑️ Resetting database...');
    
    if (!this.db) {
      await this.initialize();
    }
    
    if (Platform.OS === 'web') {
      console.warn('Database reset not supported on web');
      return;
    }
    
    try {
      // Drop all tables
      await this.db!.runAsync(`DROP TABLE IF EXISTS ${TableName.USER_PROFILES}`);
      await this.db!.runAsync(`DROP TABLE IF EXISTS ${TableName.HEALTH_ASPECTS}`);
      await this.db!.runAsync(`DROP TABLE IF EXISTS ${TableName.HEALTH_ELEMENTS}`);
      await this.db!.runAsync(`DROP TABLE IF EXISTS ${TableName.ACTIVITY_LOGS}`);
      await this.db!.runAsync(`DROP TABLE IF EXISTS ${TableName.DAILY_SUMMARIES}`);
      await this.db!.runAsync(`DROP TABLE IF EXISTS ${TableName.WEEKLY_SUMMARIES}`);
      await this.db!.runAsync(`DROP TABLE IF EXISTS ${TableName.SYNC_STATUS}`);
      await this.db!.runAsync(`DROP TABLE IF EXISTS pending_sync_records`);
      
      // Re-create tables
      await this.createTables();
      
      console.log('✅ Database reset complete');
    } catch (error) {
      console.error('❌ Failed to reset database:', error);
      throw error;
    }
  }
  
  /**
   * Initialize the database and create tables
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Skip SQLite initialization on web platform
    if (Platform.OS === 'web') {
      console.warn('SQLite not supported on web platform. Using mock data.');
      this.isInitialized = true;
      return;
    }

    try {
      if (!SQLite) {
        throw new Error('SQLite not available on this platform');
      }
      this.db = await SQLite.openDatabaseAsync('holistic_health.db');
      await this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create all necessary tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      // User profiles table
      `CREATE TABLE IF NOT EXISTS ${TableName.USER_PROFILES} (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        total_score INTEGER DEFAULT 0,
        preferences TEXT, -- JSON string
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced_at TEXT,
        is_deleted INTEGER DEFAULT 0
      )`,

      // Health aspects table
      `CREATE TABLE IF NOT EXISTS ${TableName.HEALTH_ASPECTS} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced_at TEXT,
        is_deleted INTEGER DEFAULT 0
      )`,

      // Health elements table
      `CREATE TABLE IF NOT EXISTS ${TableName.HEALTH_ELEMENTS} (
        id TEXT PRIMARY KEY,
        aspect_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT NOT NULL,
        target_value REAL DEFAULT 0,
        unit TEXT NOT NULL,
        category TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced_at TEXT,
        is_deleted INTEGER DEFAULT 0,
        FOREIGN KEY (aspect_id) REFERENCES ${TableName.HEALTH_ASPECTS}(id)
      )`,

      // Activity logs table
      `CREATE TABLE IF NOT EXISTS ${TableName.ACTIVITY_LOGS} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        element_id TEXT NOT NULL,
        aspect_id TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT NOT NULL,
        notes TEXT,
        log_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced_at TEXT,
        is_deleted INTEGER DEFAULT 0,
        FOREIGN KEY (element_id) REFERENCES ${TableName.HEALTH_ELEMENTS}(id),
        FOREIGN KEY (aspect_id) REFERENCES ${TableName.HEALTH_ASPECTS}(id)
      )`,

      // Daily summaries table
      `CREATE TABLE IF NOT EXISTS ${TableName.DAILY_SUMMARIES} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        element_id TEXT NOT NULL,
        aspect_id TEXT NOT NULL,
        date TEXT NOT NULL,
        total_value REAL NOT NULL,
        target_value REAL NOT NULL,
        completion_percentage REAL NOT NULL,
        entry_count INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced_at TEXT,
        is_deleted INTEGER DEFAULT 0,
        UNIQUE(user_id, element_id, date),
        FOREIGN KEY (element_id) REFERENCES ${TableName.HEALTH_ELEMENTS}(id),
        FOREIGN KEY (aspect_id) REFERENCES ${TableName.HEALTH_ASPECTS}(id)
      )`,

      // Weekly summaries table
      `CREATE TABLE IF NOT EXISTS ${TableName.WEEKLY_SUMMARIES} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        aspect_id TEXT NOT NULL,
        week_start_date TEXT NOT NULL,
        total_score REAL NOT NULL,
        max_score REAL NOT NULL,
        completion_percentage REAL NOT NULL,
        element_summaries TEXT, -- JSON string
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced_at TEXT,
        is_deleted INTEGER DEFAULT 0,
        UNIQUE(user_id, aspect_id, week_start_date),
        FOREIGN KEY (aspect_id) REFERENCES ${TableName.HEALTH_ASPECTS}(id)
      )`,

      // Sync status table
      `CREATE TABLE IF NOT EXISTS ${TableName.SYNC_STATUS} (
        table_name TEXT PRIMARY KEY,
        last_sync_at TEXT NOT NULL,
        pending_changes INTEGER DEFAULT 0,
        sync_in_progress INTEGER DEFAULT 0
      )`,

      // Pending sync records table
      `CREATE TABLE IF NOT EXISTS pending_sync_records (
        id TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL, -- JSON string
        created_at TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0
      )`
    ];

    for (const tableSQL of tables) {
      await this.db.execAsync(tableSQL);
    }

    // Create indexes for better performance
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON ${TableName.ACTIVITY_LOGS}(user_id, log_date)`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_element ON ${TableName.ACTIVITY_LOGS}(element_id)`,
      `CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON ${TableName.DAILY_SUMMARIES}(user_id, date)`,
      `CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_week ON ${TableName.WEEKLY_SUMMARIES}(user_id, week_start_date)`,
      `CREATE INDEX IF NOT EXISTS idx_health_elements_aspect ON ${TableName.HEALTH_ELEMENTS}(aspect_id)`,
    ];

    for (const indexSQL of indexes) {
      await this.db.execAsync(indexSQL);
    }
  }

  /**
   * Generic method to insert a record
   */
  async insert<T extends BaseEntity>(tableName: string, record: Omit<T, 'createdAt' | 'updatedAt'>): Promise<T> {
    if (Platform.OS === 'web') {
      console.warn('Database operations not supported on web');
      return record as T;
    }
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const fullRecord = {
      ...record,
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    const columns = Object.keys(fullRecord);
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map(col => {
      const value = (fullRecord as any)[col];
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });

    const sql = `INSERT INTO ${tableName} (${columns.map(col => this.camelToSnake(col)).join(', ')}) VALUES (${placeholders})`;
    
    // Debug logging in a single, structured format
//     console.log(`📝 DATABASE OPERATION [${tableName}]:
// ` +
//       `SQL: ${sql}
// ` +
//       `VALUES: ${JSON.stringify(values, null, 2)}
// ` +
//       `RECORD: ${JSON.stringify(fullRecord, null, 2)}`);
    
    // Check for null values that might cause issues
    const nullValues = values.map((val, idx) => val === null ? columns[idx] : null).filter(Boolean);
    if (nullValues.length > 0) {
      console.warn('⚠️ Found null values for columns:', nullValues);
    }
    
    try {
      await this.db.runAsync(sql, values);
      
      // Log the table contents after insert for debugging
      // await this.logTableContents(tableName, (record as any).id);
    } catch (error) {
      console.error(`❌ DATABASE ERROR [${tableName}]:\n` +
        `OPERATION: INSERT\n` +
        `ERROR: ${error}\n` +
        `SQL: ${sql}\n` +
        `VALUES: ${JSON.stringify(values, null, 2)}`);
      throw error;
    }
    
    // Add to pending sync
    await this.addToPendingSync(tableName, (record as any).id, SyncOperation.CREATE, fullRecord);
    
    return fullRecord;
  }

  /**
   * Generic method to insert or replace a record (handles unique constraint conflicts)
   */
  async insertOrReplace<T extends BaseEntity>(tableName: string, record: Omit<T, 'createdAt' | 'updatedAt'>): Promise<T> {
    if (Platform.OS === 'web') {
      console.warn('Database operations not supported on web');
      return record as T;
    }
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const fullRecord = {
      ...record,
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    const columns = Object.keys(fullRecord);
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map(col => {
      const value = (fullRecord as any)[col];
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });

    const sql = `INSERT OR REPLACE INTO ${tableName} (${columns.map(col => this.camelToSnake(col)).join(', ')}) VALUES (${placeholders})`;
    
    // Debug logging in a single, structured format
    // console.log(`📝 DATABASE OPERATION [${tableName}]:\n` +
    //   `SQL: ${sql}\n` +
    //   `VALUES: ${JSON.stringify(values, null, 2)}\n` +
    //   `RECORD: ${JSON.stringify(fullRecord, null, 2)}`);
    
    
    try {
      await this.db.runAsync(sql, values);
      
      // Log the table contents after insert for debugging
      // await this.logTableContents(tableName, (record as any).id);
    } catch (error) {
      console.error(`❌ DATABASE ERROR [${tableName}]:\n` +
        `OPERATION: INSERT OR REPLACE\n` +
        `ERROR: ${error}\n` +
        `SQL: ${sql}\n` +
        `VALUES: ${JSON.stringify(values, null, 2)}`);
      throw error;
    }
    
    // Add to pending sync
    await this.addToPendingSync(tableName, (record as any).id, SyncOperation.CREATE, fullRecord);
    
    return fullRecord;
  }

  /**
{{ ... }}
   */
  async update<T extends BaseEntity>(tableName: string, id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const columns = Object.keys(updatesWithTimestamp);
    const setClause = columns.map(col => `${this.camelToSnake(col)} = ?`).join(', ');
    const values = columns.map(col => {
      const value = (updatesWithTimestamp as any)[col];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });

    const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
    await this.db.runAsync(sql, [...values, id]);
    await this.addToPendingSync(tableName, id, SyncOperation.UPDATE, updatesWithTimestamp);
  }

  /**
   * Generic method to soft delete a record
   */
  async softDelete(tableName: string, id: string): Promise<void> {
    if (Platform.OS === 'web') {
      console.warn('Database operations not supported on web');
      return;
    }
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const sql = `UPDATE ${tableName} SET is_deleted = 1, updated_at = ? WHERE id = ?`;
    await this.db.runAsync(sql, [now, id]);
    await this.addToPendingSync(tableName, id, SyncOperation.DELETE, { isDeleted: true });
  }

  /**
   * Generic method to find records
   */
  async find<T>(tableName: string, where?: string, params?: any[]): Promise<T[]> {
    if (Platform.OS === 'web') {
      console.warn('Database operations not supported on web');
      return [];
    }
    if (!this.db) throw new Error('Database not initialized');

    let sql = `SELECT * FROM ${tableName} WHERE is_deleted = 0`;
    const queryParams = [];

    if (where) {
      sql += ` AND ${where}`;
      if (params) {
        queryParams.push(...params);
      }
    }

    const result = await this.db.getAllAsync(sql, queryParams);
    return result.map((row: DatabaseRow) => this.mapRowToObject(row)) as T[];
  }

  /**
   * Generic method to find a single record
   */
  async findOne<T>(tableName: string, where: string, params: any[]): Promise<T | null> {
    const results = await this.find<T>(tableName, where, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Add a record to pending sync queue
   */
  private async addToPendingSync(tableName: string, recordId: string, operation: SyncOperation, data: any): Promise<void> {
    if (Platform.OS === 'web' || !this.db) return;

    // Generate a more unique ID using timestamp + random number
    const uniqueId = `${tableName}_${recordId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pendingRecord: PendingSyncRecord = {
      id: uniqueId,
      tableName,
      recordId,
      operation,
      data,
      createdAt: new Date(),
      retryCount: 0,
    };

    try {
      await this.db.runAsync(
        'INSERT OR REPLACE INTO pending_sync_records (id, table_name, record_id, operation, data, created_at, retry_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          pendingRecord.id,
          pendingRecord.tableName,
          pendingRecord.recordId,
          pendingRecord.operation,
          JSON.stringify(pendingRecord.data),
          pendingRecord.createdAt.toISOString(),
          pendingRecord.retryCount,
        ]
      );
    } catch (error) {
      console.error('Failed to add pending sync record:', error);
      // Don't throw error here as sync is optional
    }
  }

  /**
   * Get pending sync records
   */
  async getPendingSyncRecords(): Promise<PendingSyncRecord[]> {
    if (Platform.OS === 'web') return [];
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync('SELECT * FROM pending_sync_records ORDER BY created_at ASC');
    return result.map((row: DatabaseRow) => {
      const r = row as any;
      return {
        id: r.id as string,
        tableName: r.table_name as string,
        recordId: r.record_id as string,
        operation: r.operation as SyncOperation,
        data: JSON.parse(r.data as string),
        createdAt: new Date(r.created_at as string),
        retryCount: r.retry_count as number,
      };
    });
  }

  /**
   * Remove a pending sync record
   */
  async removePendingSyncRecord(id: string): Promise<void> {
    if (Platform.OS === 'web') return;
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM pending_sync_records WHERE id = ?', [id]);
  }

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert snake_case to camelCase
   */
  private snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Map database row to object with camelCase properties
   */
  private mapRowToObject(row: DatabaseRow): Record<string, any> {
    const obj: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      const camelKey = this.snakeToCamel(key);
      
      // Handle JSON fields
      if (camelKey === 'preferences' || camelKey === 'elementSummaries') {
        obj[camelKey] = typeof value === 'string' ? JSON.parse(value) : value;
      }
      // Handle date fields
      else if (camelKey.includes('At') || camelKey === 'date' || camelKey === 'logDate' || camelKey === 'weekStartDate') {
        obj[camelKey] = typeof value === 'string' ? new Date(value) : value;
      }
      // Handle boolean fields
      else if (camelKey === 'isDeleted' || camelKey === 'isActive' || camelKey === 'syncInProgress') {
        obj[camelKey] = Boolean(value);
      }
      else {
        obj[camelKey] = value;
      }
    }
    return obj;
  }

  /**
   * Log the contents of all tables for debugging
   */
  async logAllTables(): Promise<void> {
    if (Platform.OS === 'web' || !this.db) return;
    
    try {
      console.log('======= LOGGING ALL DATABASE TABLES =======');
      for (const table of Object.values(TableName)) {
        await this.logTableContents(table);
      }
      console.log('======= END LOGGING ALL DATABASE TABLES =======');
    } catch (error) {
      console.error('Failed to log all tables:', error);
    }
  }

  /**
   * Log the contents of a table for debugging
   */
  async logTableContents(tableName: string, recordId?: string): Promise<void> {
    if (Platform.OS === 'web' || !this.db) return;
    
    try {
      let sql = `SELECT * FROM ${tableName}`;
      const params = [];
      
      if (recordId) {
        sql += ` WHERE id = ?`;
        params.push(recordId);
      } else {
        sql += ` LIMIT 10`; // Limit results if no specific record
      }
      
      const results = await this.db.getAllAsync(sql, params);
      console.log(`===== TABLE ${tableName} CONTENTS =====`);
      console.log(`Found ${results.length} records`);
      results.forEach((row: DatabaseRow, index: number) => {
        console.log(`Record ${index + 1}:`, this.mapRowToObject(row));
      });
      console.log(`===== END TABLE ${tableName} CONTENTS =====`);
    } catch (error) {
      console.error(`Failed to log table ${tableName} contents:`, error);
    }
  }
  
  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
    }
  }

  /**
   * Get database instance (for advanced queries)
   */
  getDatabase(): DatabaseInstance | null {
    return this.db;
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
