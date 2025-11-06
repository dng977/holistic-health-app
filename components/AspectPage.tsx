import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';

import { HealthAspect, ActivityLogEntry } from '../types/health';
import { AspectPieChart } from './AspectPieChart';
import { TopBar } from './TopBar';
import { FloatingActionButton } from './FloatingActionButton';
import { useHealthStore, useElementData } from '../stores/healthStore';

type AspectPageProps = {
  aspect: HealthAspect;
  children?: React.ReactNode;
};

/**
 * Base component for all health aspect pages
 * Provides a consistent structure with:
 * 1. TopBar
 * 2. Aspect-specific pie chart
 * 3. Activity log section
 */
export function AspectPage({ aspect, children }: AspectPageProps) {
  const { 
    getElementsByAspectId, 
    getActivitiesByAspect, 
    completionPercentages,
    initialize,
    isInitialized,
    isInitializing
  } = useHealthStore();

  const [recentActivities, setRecentActivities] = React.useState<ActivityLogEntry[]>([]);
  const [loadingActivities, setLoadingActivities] = React.useState(false);

  // Initialize store if needed (only if not already initialized or initializing)
  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      initialize();
    }
  }, [isInitialized, isInitializing, initialize]);

  // Load recent activities for this aspect
  const loadActivities = React.useCallback(async () => {
    if (!isInitialized) return;
    
    console.log(`Loading activities for aspect: ${aspect.name} (${aspect.id})`);
    setLoadingActivities(true);
    try {
      const activities = await getActivitiesByAspect(aspect.id, 10);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Failed to load activities for aspect:', aspect.id, error);
      setRecentActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  }, [aspect.id, getActivitiesByAspect, isInitialized]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Reload activities when screen comes into focus (e.g., after adding an activity)
  useFocusEffect(
    useCallback(() => {
      if (isInitialized) {
        loadActivities();
      }
    }, [isInitialized, loadActivities])
  );

  // Get elements for this aspect
  const elements = getElementsByAspectId(aspect.id);
  
  // Transform health elements data for the pie chart
  const pieChartData = elements.map(element => ({
    name: element.name,
    value: 1,
    color: element.color,
    completionPercentage: completionPercentages[element.id] || 0,
    description: element.description
  }));
  
  // If no elements are found, create a default empty pie chart data
  if (pieChartData.length === 0) {
    // Add a single empty element to show an empty pie chart
    pieChartData.push({
      name: 'No data',
      value: 1,
      color: '#CCCCCC',
      completionPercentage: 0,
      description: 'No data available yet'
    });
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: aspect.name,
          headerShown: false // Hide the default header
        }} 
      />
      
      <View className="flex-1 bg-[#F5F5F5]">
        {/* Section 1: TopBar */}
        <TopBar title={aspect.name} level={5} />
        
        <ScrollView className="flex-1 p-5">
          {/* Section 2: Aspect-specific pie chart */}
          <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <AspectPieChart 
              data={pieChartData}
              size="large"
            />
          </View>
          
          {/* Section 3: Recent Activity */}
          <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <Text className="text-xl font-bold mb-4 text-[#212121]">Recent Activity</Text>
            
            {loadingActivities ? (
              <Text className="text-[#757575] text-center py-4">
                Loading recent activities...
              </Text>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const element = elements.find(el => el.id === activity.elementId);
                return (
                  <View key={activity.id} className="border-b border-gray-200 py-3">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <View 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: element?.color || '#757575' }} 
                        />
                        <Text className="font-medium text-[#212121]">
                          {element?.name || 'Unknown Activity'}
                        </Text>
                      </View>
                      <Text className="text-sm text-[#757575]">
                        {activity.logDate.toLocaleDateString()}
                      </Text>
                    </View>
                    <Text className="text-sm text-[#757575] mt-1">
                      {activity.value} {activity.unit}
                      {activity.notes ? ` - ${activity.notes}` : ''}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text className="text-[#757575] text-center py-4">
                No recent activity. Start tracking your {aspect.name.toLowerCase()}!
              </Text>
            )}
          </View>
          
          {/* Custom children content */}
          {children}
        </ScrollView>
        
        {/* Floating Action Button */}
        <FloatingActionButton aspectId={aspect.id} />
      </View>
    </>
  );
}
