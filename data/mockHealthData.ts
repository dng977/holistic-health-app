import { AspectType, HealthAspect, HealthElement, ActivityLogEntry } from '../types/health';

/**
 * Mock data for health aspects (for backward compatibility)
 * Note: This is kept for reference but the app now uses SQLite with seeded data
 */

// Temporary compatibility type for UI components
export interface LegacyHealthAspect extends HealthAspect {
  elements: Array<{
    id: string;
    name: string;
    description: string;
    completionPercentage: number;
    color: string;
  }>;
}

// Mock health elements for nutrition aspect
export const mockNutritionElements: HealthElement[] = [
  {
    id: 'water',
    aspectId: AspectType.NUTRITION,
    name: 'Water',
    description: 'Aim for 56 glasses of water weekly to maintain proper hydration.',
    color: '#2196F3',
    targetValue: 56,
    unit: 'glasses',
    category: 'hydration',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  },
  {
    id: 'protein',
    aspectId: AspectType.NUTRITION,
    name: 'Protein',
    description: 'Include a variety of protein sources to support muscle repair and immune function.',
    color: '#8D6E63',
    targetValue: 7,
    unit: 'servings',
    category: 'macronutrient',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  },
  {
    id: 'vegetables',
    aspectId: AspectType.NUTRITION,
    name: 'Vegetables',
    description: 'Consume a variety of vegetables for essential vitamins and minerals.',
    color: '#4CAF50',
    targetValue: 35,
    unit: 'servings',
    category: 'micronutrient',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  },
];

export const mockHealthAspects: LegacyHealthAspect[] = [
  {
    id: AspectType.NUTRITION,
    name: 'Nutrition',
    description: 'Track your weekly nutrition intake including water, protein, vegetables, and more.',
    color: '#FF9800',
    icon: 'cutlery',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    elements: [
      {
        id: 'water',
        name: 'Water',
        description: 'Aim for 56 glasses of water weekly to maintain proper hydration.',
        completionPercentage: 75,
        color: '#2196F3',
      },
      {
        id: 'protein',
        name: 'Protein',
        description: 'Include a variety of protein sources to support muscle repair and immune function.',
        completionPercentage: 60,
        color: '#8D6E63',
      },
      {
        id: 'vegetables',
        name: 'Vegetables',
        description: 'Consume a variety of vegetables for essential vitamins and minerals.',
        completionPercentage: 80,
        color: '#4CAF50',
      },
    ],
  },
  {
    id: AspectType.RECOVERY,
    name: 'Recovery',
    description: 'Track your weekly recovery practices including sleep, meditation, and fasting.',
    color: '#2196F3',
    icon: 'bed',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    elements: [
      {
        id: 'sleep',
        name: 'Sleep',
        description: 'Aim for quality sleep to optimize recovery and cognitive function.',
        completionPercentage: 70,
        color: '#3F51B5',
      },
      {
        id: 'meditation',
        name: 'Meditation',
        description: 'Regular meditation promotes emotional resilience and stress reduction.',
        completionPercentage: 45,
        color: '#9C27B0',
      },
    ],
  },
  {
    id: AspectType.PHYSICAL,
    name: 'Physical Activity',
    description: 'Track your weekly physical activities including movement, strength training, and flexibility.',
    color: '#E91E63',
    icon: 'heartbeat',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    elements: [
      { id: 'movement', name: 'Daily Movement', description: 'Regular movement', completionPercentage: 65, color: '#4CAF50' },
      { id: 'strength', name: 'Strength Training', description: 'Build muscle', completionPercentage: 50, color: '#FF5722' },
    ],
  },
  {
    id: AspectType.MENTAL,
    name: 'Mental Activity',
    description: 'Track your weekly mental activities including cognitive challenges and creative expression.',
    color: '#9C27B0',
    icon: 'lightbulb-o',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    elements: [
      { id: 'cognitive', name: 'Cognitive Challenges', description: 'Brain exercises', completionPercentage: 60, color: '#3F51B5' },
      { id: 'creative', name: 'Creative Expression', description: 'Art and creativity', completionPercentage: 45, color: '#FF9800' },
    ],
  },
  {
    id: AspectType.SOCIAL,
    name: 'Social Activity',
    description: 'Track your weekly social activities including interactions, laughter, and meaningful conversations.',
    color: '#00BCD4',
    icon: 'users',
    isActive: true,
    sortOrder: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    elements: [
      { id: 'interactions', name: 'Social Interactions', description: 'Connect with others', completionPercentage: 55, color: '#FF9800' },
      { id: 'laughter', name: 'Laughter', description: 'Find joy', completionPercentage: 65, color: '#FFEB3B' },
    ],
  },
  {
    id: AspectType.ENVIRONMENT,
    name: 'Environment',
    description: 'Track your weekly environmental wellness including nature exposure and toxin reduction.',
    color: '#8BC34A',
    icon: 'tree',
    isActive: true,
    sortOrder: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    elements: [
      { id: 'nature', name: 'Time in Nature', description: 'Connect with nature', completionPercentage: 45, color: '#4CAF50' },
      { id: 'sun', name: 'Sun Exposure', description: 'Get sunlight', completionPercentage: 60, color: '#FF9800' },
    ],
  },
];

/**
 * Get a health aspect by its ID
 */
export const getMockAspectById = (id: string): HealthAspect | undefined => {
  return mockHealthAspects.find(aspect => aspect.id === id);
};

/**
 * Generate mock activity logs for a given aspect
 */
export const generateMockActivityLogs = (aspectId: string, count: number = 5): ActivityLogEntry[] => {
  const logs: ActivityLogEntry[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 7);
    const logDate = new Date(now);
    logDate.setDate(logDate.getDate() - randomDaysAgo);
    
    logs.push({
      id: `log-${aspectId}-${i}`,
      userId: 'default_user',
      elementId: `element-${i}`,
      aspectId: aspectId,
      value: Math.floor(Math.random() * 100),
      unit: 'units',
      notes: `Sample activity for ${aspectId}`,
      logDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    });
  }
  
  // Sort by logDate, newest first
  return logs.sort((a, b) => b.logDate.getTime() - a.logDate.getTime());
};
