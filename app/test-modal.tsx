import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';

export default function TestModal() {
  console.log('🟦 TestModal: Rendering');

  const handleBack = () => {
    console.log('🟦 TestModal: Back button pressed');
    if (router.canDismiss()) {
      router.dismiss();
    } else {
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Test Modal',
          headerShown: false 
        }} 
      />
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-2xl font-bold mb-4">Test Modal</Text>
        <Text className="text-gray-600 mb-8">This is a blank test modal</Text>
        
        <TouchableOpacity 
          onPress={handleBack}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
