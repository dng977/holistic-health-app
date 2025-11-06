import { View, Text } from 'react-native';
import { useEffect } from 'react';

import { AspectPage } from '../../components/AspectPage';
import { useAppTranslation } from '../../localization';
import { AspectType } from '../../types/health';
import { useHealthStore } from '../../stores/healthStore';

export default function Social() {
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
        console.error('Social page: Failed to initialize store:', error);
      });
    }
  }, [isInitialized, initialize]);

  // Get social aspect data
  const socialAspect = getAspectById(AspectType.SOCIAL);
  
  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-[#757575]">Loading social activity data...</Text>
      </View>
    );
  }

  // Handle the case where aspect data is not found
  if (!socialAspect) {
    // Create a default aspect for display purposes
    const defaultAspect = {
      id: AspectType.SOCIAL,
      name: 'Social',
      description: 'Track your social activities',
      icon: 'social',
      color: '#E91E63',
      sortOrder: 5,
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
    <AspectPage aspect={socialAspect} />
  );
}


