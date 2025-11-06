import { healthService } from './healthService';
import { seedService } from './seedService';
import { syncService } from './syncService';
import { useHealthStore } from '../stores/healthStore';

/**
 * Service for initializing the app's data layer
 */
export class InitService {
  private isInitialized = false;

  /**
   * Initialize the entire data layer
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('App already initialized');
      return;
    }

    try {
      console.log('Initializing Holistic Health app...');

      // Step 1: Initialize database and health service
      await healthService.initialize();
      console.log('✓ Database initialized');

      // Step 2: Seed database with initial data
      await seedService.seedDatabase();
      console.log('✓ Database seeded');

      // Step 3: Initialize Zustand store
      await useHealthStore.getState().initialize();
      console.log('✓ State store initialized');

      // Step 4: Start sync service (if user is authenticated)
      this.startSyncIfAuthenticated();
      console.log('✓ Sync service configured');

      this.isInitialized = true;
      console.log('🎉 Holistic Health app initialized successfully!');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  }

  /**
   * Start sync service if user is authenticated
   */
  private startSyncIfAuthenticated(): void {
    // For now, we'll start auto-sync regardless
    // In a real app, you'd check authentication status first
    syncService.startAutoSync(60000); // Sync every minute
  }

  /**
   * Reinitialize the app (useful for testing or after major updates)
   */
  async reinitialize(): Promise<void> {
    this.isInitialized = false;
    syncService.stopAutoSync();
    await this.initialize();
  }

  /**
   * Get initialization status
   */
  getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  /**
   * Force a full sync with Supabase
   */
  async forceSync(): Promise<void> {
    try {
      console.log('Starting force sync...');
      await syncService.forceFullSync();
      
      // Refresh the store after sync
      await useHealthStore.getState().refreshData();
      console.log('✓ Force sync completed');
    } catch (error) {
      console.error('Force sync failed:', error);
      throw error;
    }
  }

  /**
   * Get sync status for all tables
   */
  async getSyncStatus() {
    return await syncService.getSyncStatus();
  }
}

// Export singleton instance
export const initService = new InitService();
