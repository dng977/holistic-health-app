import { HealthAspect } from '../types/health';
import { mockHealthAspects } from './mockHealthData';

/**
 * Get all health aspects
 * @returns Array of all health aspects
 * @deprecated Use healthService.getHealthAspects() instead for database-backed data
 */
export const getHealthAspects = (): HealthAspect[] => {
  return mockHealthAspects;
};
