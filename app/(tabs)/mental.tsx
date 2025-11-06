import { View, Text } from 'react-native';
import { useEffect } from 'react';

import { AspectPage } from '../../components/AspectPage';
import { useAppTranslation } from '../../localization';
import { AspectType } from '../../types/health';
import { useHealthStore } from '../../stores/healthStore';

export default function Mental() {
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
        console.error('Mental page: Failed to initialize store:', error);
      });
    }
  }, [isInitialized, initialize]);

  // Get mental aspect data
  const mentalAspect = getAspectById(AspectType.MENTAL);
  
  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-[#757575]">Loading mental activity data...</Text>
      </View>
    );
  }

  // Handle the case where aspect data is not found
  if (!mentalAspect) {
    // Create a default aspect for display purposes
    const defaultAspect = {
      id: AspectType.MENTAL,
      name: 'Mental',
      description: 'Track your mental activities',
      icon: 'mental',
      color: '#9C27B0',
      sortOrder: 4,
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
    <AspectPage aspect={mentalAspect} />
  );
}


