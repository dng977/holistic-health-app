import { View, Text } from 'react-native';
import { useEffect } from 'react';

import { AspectPage } from '../../components/AspectPage';
import { useAppTranslation } from '../../localization';
import { AspectType } from '../../types/health';
import { useHealthStore } from '../../stores/healthStore';

export default function Environment() {
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
        console.error('Environment page: Failed to initialize store:', error);
      });
    }
  }, [isInitialized, initialize]);

  // Get environment aspect data
  const environmentAspect = getAspectById(AspectType.ENVIRONMENT);
  
  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-[#757575]">Loading environment data...</Text>
      </View>
    );
  }

  // Handle the case where aspect data is not found
  if (!environmentAspect) {
    // Create a default aspect for display purposes
    const defaultAspect = {
      id: AspectType.ENVIRONMENT,
      name: 'Environment',
      description: 'Track your environmental activities',
      icon: 'environment',
      color: '#4CAF50',
      sortOrder: 6,
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
    <AspectPage aspect={environmentAspect} />
  );
}


