import { View, Text } from 'react-native';
import { useEffect } from 'react';

import { AspectPage } from '../../components/AspectPage';
import { useAppTranslation } from '../../localization';
import { AspectType } from '../../types/health';
import { useHealthStore } from '../../stores/healthStore';

export default function Physical() {
  const { t } = useAppTranslation();
  
  // Get data from health store
  const { 
    isLoading, 
    isInitialized, 
    initialize,
    getAspectById 
  } = useHealthStore();

  // Initialize the store on component mount
  useEffect(() => {
    if (!isInitialized) {
      initialize().catch(error => {
        console.error('Physical page: Failed to initialize store:', error);
      });
    }
  }, [isInitialized, initialize]);

  // Get physical aspect data
  const physicalAspect = getAspectById(AspectType.PHYSICAL);
  
  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-[#757575]">Loading physical activity data...</Text>
      </View>
    );
  }

  // Handle the case where aspect data is not found
  if (!physicalAspect) {
    // Create a default aspect for display purposes
    const defaultAspect = {
      id: AspectType.PHYSICAL,
      name: 'Physical',
      description: 'Track your physical activities',
      icon: 'physical',
      color: '#FF9800',
      sortOrder: 3,
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
    <AspectPage aspect={physicalAspect} />
  );
}
