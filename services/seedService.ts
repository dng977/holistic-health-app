import { healthService } from './healthService';
import { AspectType } from '../types/health';

/**
 * Service for seeding the database with initial data
 */
export class SeedService {
  /**
   * Seed the database with initial health aspects and elements
   */
  async seedDatabase(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');
      
      // Check if data already exists
      const existingAspects = await healthService.getHealthAspects();
      if (existingAspects.length > 0) {
        console.log('✅ Database already seeded, checking for sample activities...');
        // Still add sample activities if they don't exist
        await this.seedSampleActivities();
        return;
      }

      console.log('📊 Seeding health aspects and elements...');
      // Seed all health aspects and their elements
      await Promise.all([
        this.seedNutritionAspect(),
        this.seedRecoveryAspect(),
        this.seedPhysicalAspect(),
        this.seedMentalAspect(),
        this.seedSocialAspect(),
        this.seedEnvironmentAspect(),
      ]);

      console.log('✅ Database seeding completed successfully');
      
      // Add some sample activities for demonstration (only on first seed)
      await this.seedSampleActivities();
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  /**
   * Seed some sample activities for demonstration
   */
  private async seedSampleActivities(): Promise<void> {
    try {
      console.log('🎯 Checking for sample activities...');
      
      // Check if activities already exist
      const existingActivities = await healthService.getActivityLogs('default_user', undefined, undefined, 1);
      if (existingActivities.length > 0) {
        console.log('✅ Sample activities already exist, skipping...');
        return;
      }
      
      console.log('🎯 Adding sample activities...');
      
      // Get all aspects to create sample activities
      const aspects = await healthService.getHealthAspects();
      
      for (const aspect of aspects) {
        const elements = await healthService.getHealthElements(aspect.id);
        console.log(`Adding activities for ${aspect.name} with ${elements.length} elements`);
        
        // Add 2-3 sample activities for each aspect
        for (let i = 0; i < Math.min(3, elements.length); i++) {
          const element = elements[i];
          if (element) {
            const daysAgo = Math.floor(Math.random() * 7); // Random day in the last week
            const logDate = new Date();
            logDate.setDate(logDate.getDate() - daysAgo);
            
            console.log(`Adding activity: ${element.name} for ${aspect.name}`);
            await healthService.logActivity({
              userId: 'default_user',
              aspectId: aspect.id,
              elementId: element.id,
              value: Math.floor(Math.random() * element.targetValue * 0.3) + 1, // Random value up to 30% of target
              unit: element.unit,
              notes: `Sample ${element.name.toLowerCase()} activity`,
              logDate,
            });
          }
        }
      }
      
      console.log('✅ Sample activities added successfully');
    } catch (error) {
      console.error('❌ Error adding sample activities:', error);
      // Don't throw error here, as this is just for demonstration
    }
  }

  /**
   * Seed Nutrition aspect and elements
   */
  private async seedNutritionAspect(): Promise<void> {
    const aspect = await healthService.createHealthAspect({
      id: AspectType.NUTRITION,
      name: 'Nutrition',
      description: 'Track your weekly nutrition intake including water, protein, vegetables, and more.',
      color: '#FF9800',
      icon: 'cutlery',
      isActive: true,
      sortOrder: 1,
    });

    const elements = [
      {
        name: 'Water',
        description: 'Aim for 56 glasses of water weekly to maintain proper hydration.',
        color: '#2196F3',
        targetValue: 56,
        unit: 'glasses',
        category: 'hydration',
      },
      {
        name: 'Protein',
        description: 'Include a variety of protein sources to support muscle repair and immune function.',
        color: '#8D6E63',
        targetValue: 7,
        unit: 'servings',
        category: 'macronutrient',
      },
      {
        name: 'Vegetables',
        description: 'Consume a variety of vegetables for essential vitamins and minerals.',
        color: '#4CAF50',
        targetValue: 35,
        unit: 'servings',
        category: 'micronutrient',
      },
      {
        name: 'Healthy Fats',
        description: 'Include omega-3 rich foods and healthy fats in your weekly diet.',
        color: '#FFC107',
        targetValue: 14,
        unit: 'servings',
        category: 'macronutrient',
      },
      {
        name: 'Fruits',
        description: 'Eat a variety of colorful fruits for antioxidants and fiber.',
        color: '#E91E63',
        targetValue: 21,
        unit: 'servings',
        category: 'micronutrient',
      },
    ];

    for (const elementData of elements) {
      await healthService.createHealthElement({
        aspectId: aspect.id,
        ...elementData,
        isActive: true,
      });
    }
  }

  /**
   * Seed Recovery aspect and elements
   */
  private async seedRecoveryAspect(): Promise<void> {
    const aspect = await healthService.createHealthAspect({
      id: AspectType.RECOVERY,
      name: 'Recovery',
      description: 'Track your weekly recovery practices including sleep, meditation, and fasting.',
      color: '#2196F3',
      icon: 'bed',
      isActive: true,
      sortOrder: 2,
    });

    const elements = [
      {
        name: 'Sleep',
        description: 'Aim for 49-56 hours of quality sleep weekly (7-8 hours per night).',
        color: '#3F51B5',
        targetValue: 52.5,
        unit: 'hours',
        category: 'rest',
      },
      {
        name: 'Meditation',
        description: 'Practice meditation for stress reduction and mental clarity.',
        color: '#9C27B0',
        targetValue: 7,
        unit: 'sessions',
        category: 'mindfulness',
      },
      {
        name: 'Fasting',
        description: 'Intermittent fasting supports cellular repair and metabolic health.',
        color: '#FF5722',
        targetValue: 3,
        unit: 'days',
        category: 'metabolic',
      },
    ];

    for (const elementData of elements) {
      await healthService.createHealthElement({
        aspectId: aspect.id,
        ...elementData,
        isActive: true,
      });
    }
  }

  /**
   * Seed Physical aspect and elements
   */
  private async seedPhysicalAspect(): Promise<void> {
    const aspect = await healthService.createHealthAspect({
      id: AspectType.PHYSICAL,
      name: 'Physical Activity',
      description: 'Track your weekly physical activities including movement, strength training, and flexibility.',
      color: '#E91E63',
      icon: 'heartbeat',
      isActive: true,
      sortOrder: 3,
    });

    const elements = [
      {
        name: 'Daily Movement',
        description: 'Incorporate regular movement throughout your week.',
        color: '#4CAF50',
        targetValue: 7,
        unit: 'days',
        category: 'cardio',
      },
      {
        name: 'Strength Training',
        description: 'Build muscle and bone density through resistance exercises.',
        color: '#FF5722',
        targetValue: 3,
        unit: 'sessions',
        category: 'strength',
      },
      {
        name: 'Flexibility',
        description: 'Maintain mobility and prevent injury through stretching.',
        color: '#9C27B0',
        targetValue: 4,
        unit: 'sessions',
        category: 'flexibility',
      },
    ];

    for (const elementData of elements) {
      await healthService.createHealthElement({
        aspectId: aspect.id,
        ...elementData,
        isActive: true,
      });
    }
  }

  /**
   * Seed Mental aspect and elements
   */
  private async seedMentalAspect(): Promise<void> {
    const aspect = await healthService.createHealthAspect({
      id: AspectType.MENTAL,
      name: 'Mental Activity',
      description: 'Track your weekly mental activities including cognitive challenges and creative expression.',
      color: '#9C27B0',
      icon: 'lightbulb-o',
      isActive: true,
      sortOrder: 4,
    });

    const elements = [
      {
        name: 'Cognitive Challenges',
        description: 'Engage in activities that challenge your brain and improve cognitive function.',
        color: '#3F51B5',
        targetValue: 5,
        unit: 'sessions',
        category: 'cognitive',
      },
      {
        name: 'Creative Expression',
        description: 'Express creativity through art, music, writing, or other creative outlets.',
        color: '#FF9800',
        targetValue: 3,
        unit: 'sessions',
        category: 'creative',
      },
      {
        name: 'Learning',
        description: 'Dedicate time to learning new skills or knowledge.',
        color: '#4CAF50',
        targetValue: 4,
        unit: 'hours',
        category: 'education',
      },
    ];

    for (const elementData of elements) {
      await healthService.createHealthElement({
        aspectId: aspect.id,
        ...elementData,
        isActive: true,
      });
    }
  }

  /**
   * Seed Social aspect and elements
   */
  private async seedSocialAspect(): Promise<void> {
    const aspect = await healthService.createHealthAspect({
      id: AspectType.SOCIAL,
      name: 'Social Activity',
      description: 'Track your weekly social activities including interactions, laughter, and meaningful conversations.',
      color: '#00BCD4',
      icon: 'users',
      isActive: true,
      sortOrder: 5,
    });

    const elements = [
      {
        name: 'Social Interactions',
        description: 'Connect with friends, family, and community members.',
        color: '#FF9800',
        targetValue: 5,
        unit: 'interactions',
        category: 'connection',
      },
      {
        name: 'Meaningful Conversations',
        description: 'Engage in deep, meaningful conversations with others.',
        color: '#4CAF50',
        targetValue: 3,
        unit: 'conversations',
        category: 'communication',
      },
      {
        name: 'Community Engagement',
        description: 'Participate in community activities or volunteer work.',
        color: '#9C27B0',
        targetValue: 2,
        unit: 'activities',
        category: 'service',
      },
    ];

    for (const elementData of elements) {
      await healthService.createHealthElement({
        aspectId: aspect.id,
        ...elementData,
        isActive: true,
      });
    }
  }

  /**
   * Seed Environment aspect and elements
   */
  private async seedEnvironmentAspect(): Promise<void> {
    const aspect = await healthService.createHealthAspect({
      id: AspectType.ENVIRONMENT,
      name: 'Environment',
      description: 'Track your weekly environmental wellness including nature exposure and toxin reduction.',
      color: '#8BC34A',
      icon: 'tree',
      isActive: true,
      sortOrder: 6,
    });

    const elements = [
      {
        name: 'Time in Nature',
        description: 'Spend time outdoors in natural environments.',
        color: '#4CAF50',
        targetValue: 14,
        unit: 'hours',
        category: 'nature',
      },
      {
        name: 'Sun Exposure',
        description: 'Get adequate sunlight for vitamin D and circadian rhythm.',
        color: '#FF9800',
        targetValue: 7,
        unit: 'sessions',
        category: 'light',
      },
      {
        name: 'Air Quality',
        description: 'Ensure good air quality in your living and working spaces.',
        color: '#2196F3',
        targetValue: 7,
        unit: 'days',
        category: 'air',
      },
    ];

    for (const elementData of elements) {
      await healthService.createHealthElement({
        aspectId: aspect.id,
        ...elementData,
        isActive: true,
      });
    }
  }
}

// Export singleton instance
export const seedService = new SeedService();
