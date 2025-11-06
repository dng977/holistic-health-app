/**
 * Web polyfill for SQLite functionality
 * This provides a fallback implementation for web environments
 * where native SQLite is not available
 */

export class WebSQLitePolyfill {
  private dbName: string;
  private storage: Storage;

  constructor(dbName: string) {
    this.dbName = dbName;
    this.storage = typeof window !== 'undefined' ? window.localStorage : ({} as Storage);
  }

  async openAsync(): Promise<void> {
    // Initialize storage if needed
    if (!this.storage.getItem(`${this.dbName}_initialized`)) {
      this.storage.setItem(`${this.dbName}_initialized`, 'true');
    }
  }

  async runAsync(sql: string, params?: any[]): Promise<any> {
    console.warn('WebSQLitePolyfill: SQL operations not fully supported on web:', sql);
    return { changes: 0, lastInsertRowId: 0 };
  }

  async getAllAsync(sql: string, params?: any[]): Promise<any[]> {
    console.warn('WebSQLitePolyfill: SQL queries not fully supported on web:', sql);
    return [];
  }

  async getFirstAsync(sql: string, params?: any[]): Promise<any> {
    console.warn('WebSQLitePolyfill: SQL queries not fully supported on web:', sql);
    return null;
  }

  async closeAsync(): Promise<void> {
    // No-op for web
  }
}

export function openDatabaseAsync(name: string): Promise<WebSQLitePolyfill> {
  const db = new WebSQLitePolyfill(name);
  return db.openAsync().then(() => db);
}
