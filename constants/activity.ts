/**
 * Constants for activity tracking
 */

// Default values for activity tracking
export const DEFAULT_DURATION_MINUTES = 30;
export const DEFAULT_QUANTITY_GRAMS = 100;

// Aspect types that use quantity (grams) instead of duration
export const QUANTITY_BASED_ASPECTS = ['nutrition'];

// Generate array of gram values from 10 to 500 with step of 10
export const GRAM_VALUES = Array.from(
  { length: 50 }, 
  (_, i) => (i + 1) * 10
);

// Time duration options in minutes
export const DURATION_PRESETS = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
];
