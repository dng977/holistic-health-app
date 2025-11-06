import { View, Text } from 'react-native';
import { useEffect } from 'react';

import { AspectPage } from '../../components/AspectPage';
import { useAppTranslation } from '../../localization';
import { AspectType } from '../../types/health';
import { useHealthStore } from '../../stores/healthStore';

export default function Recovery() {
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
        console.error('Recovery page: Failed to initialize store:', error);
      });
    }
  }, [isInitialized, initialize]);

  // Get recovery aspect data
  const recoveryAspect = getAspectById(AspectType.RECOVERY);
  
  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-[#757575]">Loading recovery data...</Text>
      </View>
    );
  }

  // Handle the case where aspect data is not found
  if (!recoveryAspect) {
    // Create a default aspect for display purposes
    const defaultAspect = {
      id: AspectType.RECOVERY,
      name: 'Recovery',
      description: 'Track your recovery activities',
      icon: 'recovery',
      color: '#2196F3',
      sortOrder: 2,
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
    <AspectPage aspect={recoveryAspect} />
  );
}


