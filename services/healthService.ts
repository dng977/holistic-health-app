import { databaseService } from './database';
import {
  HealthAspect,
  HealthElement,
  ActivityLogEntry,
  DailySummary,
  WeeklySummary,
  TableName,
  AspectType,
  ElementWeeklySummary,
} from '../types/health';

/**
 * Service for managing health-related data operations
 */
export class HealthService {
  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    await databaseService.initialize();
  }
  
  /**
   * Reset the database (for development purposes)
   */
  async resetDatabase(): Promise<void> {
    await databaseService.resetDatabase();
  }

  // ===== HEALTH ASPECTS =====

  /**
   * Get all active health aspects
   */
  async getHealthAspects(): Promise<HealthAspect[]> {
    return databaseService.find<HealthAspect>(
      TableName.HEALTH_ASPECTS,
      'is_active = 1',
      []
    );
  }

  /**
   * Get a health aspect by ID
   */
  async getHealthAspectById(id: string): Promise<HealthAspect | null> {
    return databaseService.findOne<HealthAspect>(
      TableName.HEALTH_ASPECTS,
      'id = ?',
      [id]
    );
  }

  /**
   * Create a new health aspect
   */
  async createHealthAspect(aspect: Omit<HealthAspect, 'createdAt' | 'updatedAt' | 'syncedAt' | 'isDeleted'>, customId?: string): Promise<HealthAspect> {
    // Use the provided aspect.id if it exists, otherwise use customId or generate a random ID
    const id = aspect.id || customId || `aspect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return databaseService.insert<HealthAspect>(TableName.HEALTH_ASPECTS, {
      ...aspect,
      id,
      isDeleted: false,
    });
  }

  /**
   * Update a health aspect
   */
  async updateHealthAspect(id: string, updates: Partial<HealthAspect>): Promise<void> {
    await databaseService.update<HealthAspect>(TableName.HEALTH_ASPECTS, id, updates);
  }

  // ===== HEALTH ELEMENTS =====

  /**
   * Get all health elements for an aspect
   */
  async getHealthElements(aspectId: string): Promise<HealthElement[]> {
    return databaseService.find<HealthElement>(
      TableName.HEALTH_ELEMENTS,
      'aspect_id = ? AND is_active = 1',
      [aspectId]
    );
  }

  /**
   * Get a health element by ID
   */
  async getHealthElementById(id: string): Promise<HealthElement | null> {
    return databaseService.findOne<HealthElement>(
      TableName.HEALTH_ELEMENTS,
      'id = ?',
      [id]
    );
  }

  /**
   * Create a new health element
   */
  async createHealthElement(element: Omit<HealthElement, 'id' | 'createdAt' | 'updatedAt' | 'syncedAt' | 'isDeleted'>): Promise<HealthElement> {
    const id = `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return databaseService.insert<HealthElement>(TableName.HEALTH_ELEMENTS, {
      ...element,
      id,
      isDeleted: false,
    });
  }

  /**
   * Update a health element
   */
  async updateHealthElement(id: string, updates: Partial<HealthElement>): Promise<void> {
    await databaseService.update<HealthElement>(TableName.HEALTH_ELEMENTS, id, updates);
  }

  // ===== ACTIVITY LOGS =====

  /**
   * Log a health activity
   */
  async logActivity(activity: Omit<ActivityLogEntry, 'id' | 'createdAt' | 'updatedAt' | 'syncedAt' | 'isDeleted'>): Promise<ActivityLogEntry> {
    try {
      // Validate required fields
      if (!activity.userId || !activity.aspectId || !activity.elementId) {
        throw new Error('Missing required fields for activity log');
      }
      
      const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const logEntry = await databaseService.insert<ActivityLogEntry>(TableName.ACTIVITY_LOGS, {
        ...activity,
        id,
        isDeleted: false,
      });

      // Update daily summary after logging activity, but skip weekly summary updates
      // This prevents cascading updates that can cause performance issues
      try {
        await this.updateDailySummary(activity.userId, activity.elementId, activity.aspectId, activity.logDate, true);
      } catch (summaryError) {
        console.error('Failed to update daily summary, but activity was logged:', summaryError);
        // Don't throw - activity was successfully logged
      }
      
      return logEntry;
    } catch (error) {
      console.error('Failed to log activity:', error);
      throw error;
    }
  }
  
  /**
   * Log all database tables for debugging
   */
  async logAllTables(): Promise<void> {
    await databaseService.logAllTables();
  }

  /**
   * Get activity logs for a user and element
   */
  async getActivityLogs(userId: string, elementId?: string, aspectId?: string, limit?: number): Promise<ActivityLogEntry[]> {
    let whereClause = 'user_id = ?';
    const params = [userId];

    if (elementId) {
      whereClause += ' AND element_id = ?';
      params.push(elementId);
    }

    if (aspectId) {
      whereClause += ' AND aspect_id = ?';
      params.push(aspectId);
    }

    whereClause += ' ORDER BY log_date DESC';

    if (limit) {
      whereClause += ` LIMIT ${limit}`;
    }

    return databaseService.find<ActivityLogEntry>(TableName.ACTIVITY_LOGS, whereClause, params);
  }

  /**
   * Get activity logs for a specific date range
   */
  async getActivityLogsByDateRange(userId: string, startDate: Date, endDate: Date, aspectId?: string): Promise<ActivityLogEntry[]> {
    let whereClause = 'user_id = ? AND log_date >= ? AND log_date <= ?';
    const params = [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];

    if (aspectId) {
      whereClause += ' AND aspect_id = ?';
      params.push(aspectId);
    }

    whereClause += ' ORDER BY log_date DESC';

    return databaseService.find<ActivityLogEntry>(TableName.ACTIVITY_LOGS, whereClause, params);
  }

  /**
   * Update activity log
   */
  async updateActivityLog(id: string, updates: Partial<ActivityLogEntry>): Promise<void> {
    await databaseService.update<ActivityLogEntry>(TableName.ACTIVITY_LOGS, id, updates);
  }

  /**
   * Delete activity log
   */
  async deleteActivityLog(id: string): Promise<void> {
    await databaseService.softDelete(TableName.ACTIVITY_LOGS, id);
  }

  // ===== DAILY SUMMARIES =====

  /**
   * Update daily summary for an element
   * @param skipWeeklyUpdate Set to true to skip updating weekly summaries (to avoid cascading updates)
   */
  private async updateDailySummary(userId: string, elementId: string, aspectId: string, date: Date, skipWeeklyUpdate: boolean = false): Promise<void> {
    const dateStr = date.toISOString().split('T')[0];
    
    // Get all activities for this element on this date
    const activities = await databaseService.find<ActivityLogEntry>(
      TableName.ACTIVITY_LOGS,
      'user_id = ? AND element_id = ? AND log_date = ?',
      [userId, elementId, dateStr]
    );

    // Get element to get target value
    const element = await this.getHealthElementById(elementId);
    if (!element) return;

    // Calculate totals
    const totalValue = activities.reduce((sum, activity) => sum + activity.value, 0);
    const targetValue = element.targetValue;
    const completionPercentage = targetValue > 0 ? Math.min((totalValue / targetValue) * 100, 100) : 0;
    const entryCount = activities.length;

    // Use insertOrReplace to handle existing summaries automatically
    const id = `daily_${userId}_${elementId}_${dateStr}`;
    await databaseService.insertOrReplace<DailySummary>(TableName.DAILY_SUMMARIES, {
      id,
      userId,
      elementId,
      aspectId,
      date: new Date(dateStr),
      totalValue,
      targetValue,
      completionPercentage,
      entryCount,
      isDeleted: false,
    });
    
    // We completely skip weekly summary updates during activity logging
    // Weekly summaries will be calculated on-demand when needed by the UI
    // This prevents excessive database operations and app crashes
  }

  /**
   * Get daily summaries for a user and date range
   */
  async getDailySummaries(userId: string, startDate: Date, endDate: Date, aspectId?: string): Promise<DailySummary[]> {
    let whereClause = 'user_id = ? AND date >= ? AND date <= ?';
    const params = [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];

    if (aspectId) {
      whereClause += ' AND aspect_id = ?';
      params.push(aspectId);
    }

    whereClause += ' ORDER BY date DESC';

    return databaseService.find<DailySummary>(TableName.DAILY_SUMMARIES, whereClause, params);
  }

  // ===== WEEKLY SUMMARIES =====

  /**
   * Calculate and store weekly summary for an aspect
   */
  async calculateWeeklySummary(userId: string, aspectId: string, weekStartDate: Date): Promise<WeeklySummary> {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Get all daily summaries for this week
    const dailySummaries = await this.getDailySummaries(userId, weekStartDate, weekEndDate, aspectId);
    
    // Get all elements for this aspect
    const elements = await this.getHealthElements(aspectId);

    // Calculate element summaries
    const elementSummaries: ElementWeeklySummary[] = elements.map(element => {
      const elementDailySummaries = dailySummaries.filter(ds => ds.elementId === element.id);
      const totalValue = elementDailySummaries.reduce((sum, ds) => sum + ds.totalValue, 0);
      const targetValue = element.targetValue * 7; // Weekly target
      const completionPercentage = targetValue > 0 ? Math.min((totalValue / targetValue) * 100, 100) : 0;
      const daysActive = elementDailySummaries.filter(ds => ds.entryCount > 0).length;

      return {
        elementId: element.id,
        totalValue,
        targetValue,
        completionPercentage,
        daysActive,
      };
    });

    // Calculate overall aspect score
    const totalScore = elementSummaries.reduce((sum, es) => sum + es.completionPercentage, 0);
    const maxScore = elementSummaries.length * 100;
    const completionPercentage = maxScore > 0 ? totalScore / maxScore * 100 : 0;

    // Check if weekly summary already exists
    const weekStartStr = weekStartDate.toISOString().split('T')[0];
    const existingSummary = await databaseService.findOne<WeeklySummary>(
      TableName.WEEKLY_SUMMARIES,
      'user_id = ? AND aspect_id = ? AND week_start_date = ?',
      [userId, aspectId, weekStartStr]
    );

    const summaryData = {
      userId,
      aspectId,
      weekStartDate,
      totalScore,
      maxScore,
      completionPercentage,
      elementSummaries,
    };

    if (existingSummary) {
      // Update existing summary
      await databaseService.update<WeeklySummary>(TableName.WEEKLY_SUMMARIES, existingSummary.id, summaryData);
      return { ...existingSummary, ...summaryData };
    } else {
      // Create new summary using insertOrReplace to handle concurrent access
      const id = `weekly_${userId}_${aspectId}_${weekStartStr}`;
      return databaseService.insertOrReplace<WeeklySummary>(TableName.WEEKLY_SUMMARIES, {
        ...summaryData,
        id,
        isDeleted: false,
      });
    }
  }

  /**
   * Get weekly summaries for a user
   */
  async getWeeklySummaries(userId: string, aspectId?: string, limit?: number): Promise<WeeklySummary[]> {
    let whereClause = 'user_id = ?';
    const params = [userId];

    if (aspectId) {
      whereClause += ' AND aspect_id = ?';
      params.push(aspectId);
    }

    whereClause += ' ORDER BY week_start_date DESC';

    if (limit) {
      whereClause += ` LIMIT ${limit}`;
    }

    return databaseService.find<WeeklySummary>(TableName.WEEKLY_SUMMARIES, whereClause, params);
  }

  /**
   * Get current week's summary for all aspects or a specific aspect
   * @param userId The user ID
   * @param specificAspectId Optional aspect ID to get summary for just one aspect
   */
  async getCurrentWeekSummaries(userId: string, specificAspectId?: string): Promise<WeeklySummary[]> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    // If specificAspectId is provided, only get summary for that aspect
    if (specificAspectId) {
      const summary = await this.calculateWeeklySummary(userId, specificAspectId, weekStart);
      return [summary];
    } 
    
    // Otherwise get summaries for all aspects
    const aspects = await this.getHealthAspects();
    const summaries: WeeklySummary[] = [];

    for (const aspect of aspects) {
      const summary = await this.calculateWeeklySummary(userId, aspect.id, weekStart);
      summaries.push(summary);
    }

    return summaries;
  }

  /**
   * Get completion percentages for pie chart display
   */
  async getCompletionPercentages(userId: string, aspectId?: string): Promise<{ [elementId: string]: number }> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    if (aspectId) {
      // Get completion percentages for elements in a specific aspect
      // First try to find an existing weekly summary to avoid recalculation
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const existingSummary = await databaseService.findOne<WeeklySummary>(
        TableName.WEEKLY_SUMMARIES,
        'user_id = ? AND aspect_id = ? AND week_start_date = ?',
        [userId, aspectId, weekStartStr]
      );
      
      // Use existing summary if available, otherwise calculate a new one
      // But don't save it to avoid duplicate database operations
      const percentages: { [elementId: string]: number } = {};
      
      if (existingSummary) {
        // Use existing summary
        existingSummary.elementSummaries.forEach(es => {
          percentages[es.elementId] = es.completionPercentage;
        });
      } else {
        // Calculate percentages directly from daily summaries without saving
        const elements = await this.getHealthElements(aspectId);
        const startDate = new Date(weekStart);
        const endDate = new Date(weekStart);
        endDate.setDate(endDate.getDate() + 6);
        
        const dailySummaries = await this.getDailySummaries(userId, startDate, endDate, aspectId);
        
        for (const element of elements) {
          const elementDailySummaries = dailySummaries.filter(ds => ds.elementId === element.id);
          const totalValue = elementDailySummaries.reduce((sum, ds) => sum + ds.totalValue, 0);
          const targetValue = element.targetValue * 7; // Weekly target
          const completionPercentage = targetValue > 0 ? Math.min((totalValue / targetValue) * 100, 100) : 0;
          
          percentages[element.id] = completionPercentage;
        }
      }
      
      return percentages;
    } else {
      // Get completion percentages for all aspects
      const summaries = await this.getCurrentWeekSummaries(userId);
      const percentages: { [aspectId: string]: number } = {};
      
      summaries.forEach(summary => {
        percentages[summary.aspectId] = summary.completionPercentage;
      });
      
      return percentages;
    }
  }
}

// Export singleton instance
export const healthService = new HealthService();
