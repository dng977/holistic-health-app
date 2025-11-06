import { supabase } from '../utils/supabase';
import { databaseService } from './database';
import {
  PendingSyncRecord,
  SyncOperation,
  TableName,
  HealthAspect,
  HealthElement,
  ActivityLogEntry,
  DailySummary,
  WeeklySummary,
} from '../types/health';

/**
 * Service for synchronizing local SQLite data with Supabase
 */
export class SyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  /**
   * Check if Supabase is properly configured
   */
  private isSupabaseConfigured(): boolean {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
    
    // Check if we have real credentials (not placeholders)
    return url.includes('supabase.co') && 
           !url.includes('placeholder') && 
           key.length > 20 && 
           !key.includes('placeholder');
  }

  /**
   * Start automatic sync process
   */
  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      await this.syncPendingChanges();
    }, intervalMs);

    console.log(`Auto-sync started with ${intervalMs}ms interval`);
  }

  /**
   * Stop automatic sync process
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  /**
   * Sync all pending changes to Supabase
   */
  async syncPendingChanges(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;

    try {
      // Check if Supabase is properly configured
      if (!this.isSupabaseConfigured()) {
        console.log('Supabase not configured, skipping sync');
        return;
      }

      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.log('Authentication error, skipping sync:', authError.message);
        return;
      }
      
      if (!user) {
        console.log('User not authenticated, skipping sync');
        return;
      }

      // Get pending sync records
      const pendingRecords = await databaseService.getPendingSyncRecords();
      
      if (pendingRecords.length === 0) {
        console.log('No pending changes to sync');
        return;
      }

      console.log(`Syncing ${pendingRecords.length} pending changes...`);

      // Process each pending record
      for (const record of pendingRecords) {
        try {
          await this.processSyncRecord(record);
          await databaseService.removePendingSyncRecord(record.id);
          console.log(`Synced ${record.operation} for ${record.tableName}:${record.recordId}`);
        } catch (error) {
          console.error(`Failed to sync ${record.operation} for ${record.tableName}:${record.recordId}:`, error);
          
          // Increment retry count
          const db = databaseService.getDatabase();
          if (db) {
            await db.runAsync(
              'UPDATE pending_sync_records SET retry_count = retry_count + 1 WHERE id = ?',
              [record.id]
            );
          }
        }
      }

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process a single sync record
   */
  private async processSyncRecord(record: PendingSyncRecord): Promise<void> {
    const supabaseTableName = this.getSupabaseTableName(record.tableName);
    
    switch (record.operation) {
      case SyncOperation.CREATE:
        await this.syncCreate(supabaseTableName, record.data);
        break;
      case SyncOperation.UPDATE:
        await this.syncUpdate(supabaseTableName, record.recordId, record.data);
        break;
      case SyncOperation.DELETE:
        await this.syncDelete(supabaseTableName, record.recordId);
        break;
      default:
        throw new Error(`Unknown sync operation: ${record.operation}`);
    }
  }

  /**
   * Sync create operation to Supabase
   */
  private async syncCreate(tableName: string, data: any): Promise<void> {
    const supabaseData = this.transformDataForSupabase(data);
    
    const { error } = await supabase
      .from(tableName)
      .insert(supabaseData);

    if (error) {
      throw error;
    }
  }

  /**
   * Sync update operation to Supabase
   */
  private async syncUpdate(tableName: string, recordId: string, data: any): Promise<void> {
    const supabaseData = this.transformDataForSupabase(data);
    
    const { error } = await supabase
      .from(tableName)
      .update(supabaseData)
      .eq('id', recordId);

    if (error) {
      throw error;
    }
  }

  /**
   * Sync delete operation to Supabase
   */
  private async syncDelete(tableName: string, recordId: string): Promise<void> {
    const { error } = await supabase
      .from(tableName)
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', recordId);

    if (error) {
      throw error;
    }
  }

  /**
   * Pull data from Supabase and update local database
   */
  async pullFromSupabase(): Promise<void> {
    try {
      // Check if Supabase is properly configured
      if (!this.isSupabaseConfigured()) {
        console.log('Supabase not configured, skipping pull');
        return;
      }

      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.log('Authentication error, skipping pull:', authError.message);
        return;
      }
      
      if (!user) {
        console.log('User not authenticated, skipping pull');
        return;
      }

      console.log('Pulling data from Supabase...');

      // Pull each table
      await this.pullTable(TableName.HEALTH_ASPECTS);
      await this.pullTable(TableName.HEALTH_ELEMENTS);
      await this.pullTable(TableName.ACTIVITY_LOGS);
      await this.pullTable(TableName.DAILY_SUMMARIES);
      await this.pullTable(TableName.WEEKLY_SUMMARIES);

      console.log('Pull from Supabase completed successfully');
    } catch (error) {
      console.error('Failed to pull from Supabase:', error);
      throw error;
    }
  }

  /**
   * Pull a specific table from Supabase
   */
  private async pullTable(tableName: string): Promise<void> {
    const supabaseTableName = this.getSupabaseTableName(tableName);
    
    // Get last sync timestamp for this table
    const db = databaseService.getDatabase();
    if (!db) throw new Error('Database not initialized');

    const lastSyncResult = await db.getAllAsync(
      'SELECT last_sync_at FROM sync_status WHERE table_name = ?',
      [tableName]
    );

    const lastSyncAt = lastSyncResult.length > 0 
      ? new Date((lastSyncResult[0] as any).last_sync_at as string)
      : new Date(0); // If no previous sync, get all data

    // Pull data from Supabase
    const { data, error } = await supabase
      .from(supabaseTableName)
      .select('*')
      .gte('updated_at', lastSyncAt.toISOString())
      .order('updated_at', { ascending: true });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log(`No new data for ${tableName}`);
      return;
    }

    // Update local database with pulled data
    for (const record of data) {
      const localData = this.transformDataFromSupabase(record);
      
      // Check if record exists locally
      const existingRecord = await databaseService.findOne(
        tableName,
        'id = ?',
        [record.id]
      );

      if (existingRecord) {
        // Update existing record
        await databaseService.update(tableName, record.id, localData);
      } else {
        // Insert new record
        await databaseService.insert(tableName, localData);
      }
    }

    // Update sync status
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR REPLACE INTO sync_status (table_name, last_sync_at, pending_changes, sync_in_progress) 
       VALUES (?, ?, 0, 0)`,
      [tableName, now]
    );

    console.log(`Pulled ${data.length} records for ${tableName}`);
  }

  /**
   * Get Supabase table name from local table name
   */
  private getSupabaseTableName(localTableName: string): string {
    // Map local table names to Supabase table names
    const tableMapping: { [key: string]: string } = {
      [TableName.HEALTH_ASPECTS]: 'health_aspects',
      [TableName.HEALTH_ELEMENTS]: 'health_elements',
      [TableName.ACTIVITY_LOGS]: 'activity_logs',
      [TableName.DAILY_SUMMARIES]: 'daily_summaries',
      [TableName.WEEKLY_SUMMARIES]: 'weekly_summaries',
    };

    return tableMapping[localTableName] || localTableName;
  }

  /**
   * Transform data for Supabase (camelCase to snake_case)
   */
  private transformDataForSupabase(data: any): any {
    const transformed: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      const snakeKey = this.camelToSnake(key);
      
      if (value instanceof Date) {
        transformed[snakeKey] = value.toISOString();
      } else if (typeof value === 'object' && value !== null) {
        transformed[snakeKey] = JSON.stringify(value);
      } else {
        transformed[snakeKey] = value;
      }
    }
    
    return transformed;
  }

  /**
   * Transform data from Supabase (snake_case to camelCase)
   */
  private transformDataFromSupabase(data: any): any {
    const transformed: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      const camelKey = this.snakeToCamel(key);
      
      // Handle JSON fields
      if (camelKey === 'preferences' || camelKey === 'elementSummaries') {
        transformed[camelKey] = typeof value === 'string' ? JSON.parse(value) : value;
      }
      // Handle date fields
      else if (camelKey.includes('At') || camelKey === 'date' || camelKey === 'logDate' || camelKey === 'weekStartDate') {
        transformed[camelKey] = typeof value === 'string' ? new Date(value) : value;
      }
      // Handle boolean fields
      else if (camelKey === 'isDeleted' || camelKey === 'isActive') {
        transformed[camelKey] = Boolean(value);
      }
      else {
        transformed[camelKey] = value;
      }
    }
    
    return transformed;
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
   * Force full sync (pull all data from Supabase)
   */
  async forceFullSync(): Promise<void> {
    try {
      // Check if Supabase is properly configured
      if (!this.isSupabaseConfigured()) {
        console.log('Supabase not configured, skipping force sync');
        return;
      }

      // Clear sync status to force full pull
      const db = databaseService.getDatabase();
      if (db) {
        await db.runAsync('DELETE FROM sync_status');
      }

      // Pull all data from Supabase
      await this.pullFromSupabase();

      // Sync any pending local changes
      await this.syncPendingChanges();

      console.log('Force full sync completed');
    } catch (error) {
      console.error('Force full sync failed:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{ [tableName: string]: { lastSyncAt: Date; pendingChanges: number } }> {
    const db = databaseService.getDatabase();
    if (!db) throw new Error('Database not initialized');

    const result = await db.getAllAsync('SELECT * FROM sync_status');
    const status: { [tableName: string]: { lastSyncAt: Date; pendingChanges: number } } = {};

    for (const row of result) {
      const rowData = row as any;
      status[rowData.table_name as string] = {
        lastSyncAt: new Date(rowData.last_sync_at as string),
        pendingChanges: rowData.pending_changes as number,
      };
    }

    return status;
  }
}

// Export singleton instance
export const syncService = new SyncService();
