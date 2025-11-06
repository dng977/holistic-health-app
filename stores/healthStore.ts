import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { healthService } from '../services/healthService';
import { seedService } from '../services/seedService';
import {
  HealthAspect,
  HealthElement,
  ActivityLogEntry,
  WeeklySummary,
  DailySummary,
} from '../types/health';

/**
 * Health store state interface
 */
interface HealthState {
  // Data
  aspects: HealthAspect[];
  elements: { [aspectId: string]: HealthElement[] };
  currentWeekSummaries: WeeklySummary[];
  recentActivities: ActivityLogEntry[];
  completionPercentages: { [id: string]: number };
  
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  isInitializing: boolean; // Track if initialization is in progress
  hasResetDatabase: boolean; // Track if database has been reset in this session
  
  // Current user (for now, we'll use a default user)
  currentUserId: string;
  
  // Actions
  initialize: () => Promise<void>;
  refreshData: () => Promise<void>;
  // Aspect actions
  loadAspects: () => Promise<void>;
  getAspectById: (id: string) => HealthAspect | undefined;
  
  // Element actions
  getElementsByAspectId: (aspectId: string) => HealthElement[];
  getElementById: (elementId: string) => HealthElement | undefined;
  
  // Activity actions
  logActivity: (activity: Omit<ActivityLogEntry, 'id' | 'createdAt' | 'updatedAt' | 'syncedAt' | 'isDeleted' | 'userId'>) => Promise<void>;
  loadRecentActivities: (limit?: number) => Promise<void>;
  getActivitiesByAspect: (aspectId: string, limit?: number) => Promise<ActivityLogEntry[]>;
  
  // Summary actions
  loadCurrentWeekSummaries: (aspectId?: string) => Promise<void>;
  getCompletionPercentages: (aspectId?: string) => Promise<void>;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
}

/**
 * Health store using Zustand for state management
 */
export const useHealthStore = create<HealthState>()((set, get) => ({
  // Initial state
  aspects: [],
  elements: {},
  currentWeekSummaries: [],
  recentActivities: [],
  completionPercentages: {},
  isLoading: false,
  isInitialized: false,
  isInitializing: false,
  hasResetDatabase: false,
  currentUserId: 'default_user', // For now, using a default user
    
    // Initialize the store and database
    initialize: async () => {
      const { setLoading } = get();
      
      // Check if already initialized or currently initializing
      if (get().isInitialized) {
        console.log('Health store already initialized');
        return;
      }
      
      if (get().isInitializing) {
        console.log('Health store initialization already in progress, skipping...');
        return;
      }
      
      console.log('Starting health store initialization...');
      set({ isInitializing: true });
      setLoading(true);
      
      try {
        // In development mode, reset the database only once per app session
        if (__DEV__ && !get().hasResetDatabase) {
          console.log('🗑️ Development mode detected - resetting database (first time only)...');
          try {
            await healthService.resetDatabase();
            set({ hasResetDatabase: true });
            console.log('✅ Database reset complete');
          } catch (resetError) {
            console.error('❌ Failed to reset database:', resetError);
            // Continue with initialization even if reset fails
          }
        } else {
          console.log('Initializing health service...');
          // Initialize health service (which initializes the database)
          await healthService.initialize();
        }
        
        console.log('Seeding database...');
        // Seed the database with initial data if needed
        await seedService.seedDatabase();
        
        console.log('Loading initial data...');
        // Load initial data
        await get().refreshData();
        
        set({ isInitialized: true });
        console.log('✅ Health store initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize health store:', error);
        set({ isInitialized: false });
        throw error;
      } finally {
        set({ isInitializing: false });
        setLoading(false);
      }
    },
    
    // Refresh all data
    refreshData: async () => {
      const { loadAspects, loadCurrentWeekSummaries, loadRecentActivities, getCompletionPercentages } = get();
      
      try {
        await Promise.all([
          loadAspects(),
          loadCurrentWeekSummaries(),
          loadRecentActivities(20),
          getCompletionPercentages(),
        ]);
      } catch (error) {
        console.error('Failed to refresh data:', error);
        throw error;
      }
    },
    
    // Load all health aspects
    loadAspects: async () => {
      try {
        const aspects = await healthService.getHealthAspects();
        set({ aspects });
        
        // Load elements for each aspect
        const elements: { [aspectId: string]: HealthElement[] } = {};
        for (const aspect of aspects) {
          elements[aspect.id] = await healthService.getHealthElements(aspect.id);
        }
        set({ elements });
      } catch (error) {
        console.error('Failed to load aspects:', error);
        throw error;
      }
    },
    
    // Get aspect by ID
    getAspectById: (id: string) => {
      const { aspects } = get();
      console.log(`Looking for aspect with ID: ${id}`);
      console.log(`Available aspects: ${aspects.length}`);
      if (aspects.length > 0) {
        console.log('Aspect IDs:', aspects.map(a => a.id));
      }
      const aspect = aspects.find(aspect => aspect.id === id);
      console.log(`Found aspect: ${aspect ? 'Yes' : 'No'}`);
      return aspect;
    },
    
    // Load elements for a specific aspect
    loadElements: async (aspectId: string) => {
      try {
        const elements = await healthService.getHealthElements(aspectId);
        set(state => ({
          elements: {
            ...state.elements,
            [aspectId]: elements,
          },
        }));
      } catch (error) {
        console.error(`Failed to load elements for aspect ${aspectId}:`, error);
        throw error;
      }
    },
    
    // Get elements by aspect ID
    getElementsByAspectId: (aspectId: string) => {
      return get().elements[aspectId] || [];
    },
    
    // Get element by ID
    getElementById: (elementId: string) => {
      const { elements } = get();
      for (const aspectElements of Object.values(elements)) {
        const element = aspectElements.find(el => el.id === elementId);
        if (element) return element;
      }
      return undefined;
    },
    
    // Log an activity
    logActivity: async (activity: Omit<ActivityLogEntry, 'id' | 'createdAt' | 'updatedAt' | 'syncedAt' | 'isDeleted' | 'userId'>) => {
      const { currentUserId } = get();
      
      try {
        // Add userId
        const activityWithUser = {
          ...activity,
          userId: currentUserId,
        };
        
        // Log the activity
        await healthService.logActivity(activityWithUser);
        
        // Don't refresh data immediately after logging to prevent race conditions
        // The UI will refresh when the user navigates back or when they view the data
        // This prevents crashes when adding multiple activities quickly
        console.log('Activity logged successfully, data will refresh on next view');
      } catch (error) {
        console.error('Failed to log activity:', error);
        throw error;
      }
    },
    // Load recent activities
    loadRecentActivities: async (limit = 20) => {
      const { currentUserId } = get();
      
      try {
        const activities = await healthService.getActivityLogs(currentUserId, undefined, undefined, limit);
        set({ recentActivities: activities });
      } catch (error) {
        console.error('Failed to load recent activities:', error);
        throw error;
      }
    },
    
    // Get activities by aspect
    getActivitiesByAspect: async (aspectId: string, limit = 10) => {
      const { currentUserId } = get();
      
      try {
        return await healthService.getActivityLogs(currentUserId, undefined, aspectId, limit);
      } catch (error) {
        console.error(`Failed to load activities for aspect ${aspectId}:`, error);
        throw error;
      }
    },
    
    // Load current week summaries
    loadCurrentWeekSummaries: async (aspectId?: string) => {
      const { currentUserId, currentWeekSummaries } = get();
      
      try {
        if (aspectId) {
          // If aspectId is provided, only update that specific aspect's summary
          const aspectSummary = await healthService.getCurrentWeekSummaries(currentUserId, aspectId);
          
          // Update only the specific aspect summary, keeping others unchanged
          const updatedSummaries = currentWeekSummaries.map(summary => 
            summary.aspectId === aspectId ? aspectSummary[0] : summary
          );
          
          set({ currentWeekSummaries: updatedSummaries });
        } else {
          // Otherwise update all summaries
          const summaries = await healthService.getCurrentWeekSummaries(currentUserId);
          set({ currentWeekSummaries: summaries });
        }
      } catch (error) {
        console.error('Failed to load current week summaries:', error);
        throw error;
      }
    },
    
    // Get completion percentages for pie charts
    getCompletionPercentages: async (aspectId?: string) => {
      const { currentUserId } = get();
      
      try {
        const percentages = await healthService.getCompletionPercentages(currentUserId, aspectId);
        
        if (aspectId) {
          // Update percentages for specific aspect elements
          set(state => ({
            completionPercentages: {
              ...state.completionPercentages,
              ...percentages,
            },
          }));
        } else {
          // Update percentages for all aspects
          set({ completionPercentages: percentages });
        }
      } catch (error) {
        console.error('Failed to get completion percentages:', error);
        throw error;
      }
    },
    
    // Set loading state
    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },
  }))

/**
 * Hook to get aspect-specific data
 */
export const useAspectData = (aspectId: string) => {
  const aspect = useHealthStore(state => state.getAspectById(aspectId));
  const elements = useHealthStore(state => state.getElementsByAspectId(aspectId));
  const summary = useHealthStore(state => 
    state.currentWeekSummaries.find(s => s.aspectId === aspectId)
  );
  
  return {
    aspect,
    elements,
    summary,
  };
};

/**
 * Hook to get element-specific data
 */
export const useElementData = (elementId: string) => {
  const element = useHealthStore(state => state.getElementById(elementId));
  const completionPercentage = useHealthStore(state => 
    state.completionPercentages[elementId] || 0
  );
  
  return {
    element,
    completionPercentage,
  };
};
