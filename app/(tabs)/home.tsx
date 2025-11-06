import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';

import { TopBar } from '../../components/TopBar';
import { useAppTranslation } from '../../localization';
import { AspectPieChart } from '../../components/AspectPieChart';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { useHealthStore } from '../../stores/healthStore';

export default function Home() {
  const { t } = useAppTranslation();
  const router = useRouter();
  
  // Get data from health store
  const { 
    aspects, 
    completionPercentages, 
    isLoading, 
    isInitialized,
    isInitializing,
    initialize 
  } = useHealthStore();

  // Initialize the store on component mount (only if not already initialized or initializing)
  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      initialize();
    }
  }, [isInitialized, isInitializing, initialize]);
  
  // Transform health aspects data for the pie chart
  const pieChartData = aspects.map((aspect) => ({
    name: aspect.name,
    value: 1,
    color: aspect.color,
    completionPercentage: completionPercentages[aspect.id] || 0,
    description: aspect.description,
    id: aspect.id
  }));
  
  // Handle navigation to aspect pages
  const handleAspectPress = (index: number) => {
    const aspectId = pieChartData[index].id;
    router.push(aspectId as any);
  };

  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-[#757575]">Loading health data...</Text>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen options={{ 
        title: t('pageTitle.home'),
        headerShown: false // Hide the default header
      }} />
      <View className="flex-1">
        <TopBar title={t('pageTitle.home')} level={5} />
        
        <ScrollView className="flex-1 p-5">
          {/* Pie Chart showing all health aspects */}
          <AspectPieChart 
            data={pieChartData}
            size="large"
          />
          
          <Text className="text-xl font-bold mt-6 mb-4 text-[#212121]">Weekly Focus Areas</Text>
          
          <View className="flex-row flex-wrap justify-between">
            {aspects.map((aspect) => (
              <TouchableOpacity 
                key={aspect.id} 
                className="bg-white rounded-lg p-4 mb-4 w-[48%] shadow-sm"
                onPress={() => router.push(aspect.id as any)}
              >
                <View className="flex-row items-center mb-2">
                  <View 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: aspect.color }} 
                  />
                  <Text className="text-base font-bold text-[#212121]">{aspect.name}</Text>
                </View>
                <Text className="text-sm text-[#757575]">
                  {Math.round(completionPercentages[aspect.id] || 0)}% complete
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        {/* Floating Action Button */}
        <FloatingActionButton />
      </View>
    </>
  );
}
