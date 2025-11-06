import { View, Text, Platform } from 'react-native';
import { useEffect } from 'react';

import { AspectPage } from '../../components/AspectPage';
import { useAppTranslation } from '../../localization';
import { AspectType } from '../../types/health';
import { useHealthStore } from '../../stores/healthStore';

export default function Nutrition() {
  const { t } = useAppTranslation();
  
  // Get data from health store
  const { 
    aspects, 
    isLoading, 
    isInitialized, 
    initialize,
    getAspectById 
  } = useHealthStore();

  // Initialize the store on component mount
  useEffect(() => {
    if (!isInitialized) {
      console.log('Nutrition page: Initializing health store...');
      initialize().catch(error => {
        console.error('Nutrition page: Failed to initialize store:', error);
      });
    }
  }, [isInitialized, initialize]);

  // Get nutrition aspect data
  const nutritionAspect = getAspectById(AspectType.NUTRITION);
  
  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-[#757575]">Loading nutrition data...</Text>
      </View>
    );
  }

  
  // Handle the case where aspect data is not found
  if (!nutritionAspect) {
    // Create a default aspect for display purposes
    // This allows the UI to show an empty pie chart and activity list
    // instead of an error message
    const defaultAspect = {
      id: AspectType.NUTRITION,
      name: 'Nutrition',
      description: 'Track your nutrition habits',
      icon: 'nutrition',
      color: '#4CAF50',
      sortOrder: 1,
      isActive: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return (
      <AspectPage aspect={defaultAspect} />
    );
  }

  return (
    <AspectPage aspect={nutritionAspect} />
  );
}


