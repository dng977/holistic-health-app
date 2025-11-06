import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';


import { TopBar } from '../components/TopBar';
import { Button } from '../components/Button';
import { useHealthStore } from '../stores/healthStore';
import { 
  DEFAULT_DURATION_MINUTES, 
  DEFAULT_QUANTITY_GRAMS, 
  QUANTITY_BASED_ASPECTS,
  GRAM_VALUES,
  DURATION_PRESETS 
} from '../constants/activity';

/**
 * Activity Adding Page
 * Allows users to add a new activity record for any aspect and element
 */
export default function AddActivityScreen() {
  console.log('🔵 AddActivityScreen: Component rendering');
  
  const mountedRef = useRef(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const { aspectId } = useLocalSearchParams<{ aspectId?: string }>();
  const [selectedAspect, setSelectedAspect] = useState<string>(aspectId || '');
  const [selectedElement, setSelectedElement] = useState<string>('');
  const [durationValue, setDurationValue] = useState<number>(DEFAULT_DURATION_MINUTES);
  const [quantityValue, setQuantityValue] = useState<number>(DEFAULT_QUANTITY_GRAMS);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  
  // Determine if the selected aspect uses quantity (grams) instead of duration
  const isQuantityBased = QUANTITY_BASED_ASPECTS.includes(selectedAspect);
  
  // Format duration for display
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours} hr ${remainingMinutes} min` 
        : `${hours} hr`;
    }
  };
  
  // Get data from health store
  const { aspects, getElementsByAspectId, initialize, isInitialized, isInitializing, logActivity } = useHealthStore();
  
  // Keyboard visibility listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      // Scroll to bottom when keyboard appears
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Initialize store if needed (only if not already initialized or initializing)
  useEffect(() => {
    console.log('🔵 AddActivityScreen: Mount effect running');
    if (!isInitialized && !isInitializing) {
      console.log('🔵 AddActivityScreen: Calling initialize()');
      initialize();
    }
    
    return () => {
      console.log('🔴 AddActivityScreen: Component unmounting');
      mountedRef.current = false;
    };
  }, [isInitialized, isInitializing, initialize]);
  
  // Filter elements based on selected aspect
  const currentAspect = aspects.find(aspect => aspect.id === selectedAspect);
  const aspectElements = selectedAspect ? getElementsByAspectId(selectedAspect) : [];
  
  // Reset selected element and set default values when aspect changes
  useEffect(() => {
    if (!mountedRef.current) return;
    
    console.log('🔵 AddActivityScreen: Aspect changed to:', selectedAspect);
    setSelectedElement('');
    // Reset to default values
    if (selectedAspect) {
      if (QUANTITY_BASED_ASPECTS.includes(selectedAspect)) {
        setQuantityValue(DEFAULT_QUANTITY_GRAMS);
      } else {
        setDurationValue(DEFAULT_DURATION_MINUTES);
      }
    }
  }, [selectedAspect]);
  
  // Handle time change from the time picker
  const onTimeChange = (event: any, selectedDate?: Date) => {
    console.log('🔵 AddActivityScreen: onTimeChange called', { selectedDate });
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      // Calculate minutes from midnight
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const totalMinutes = (hours * 60) + minutes;
      setDurationValue(totalMinutes);
    }
  };

  const handleSubmit = async () => {
    console.log('🔵 AddActivityScreen: handleSubmit called');
    
    // Validate form
    if (!selectedAspect || !selectedElement) {
      console.log('⚠️ AddActivityScreen: Validation failed');
      alert('Please select an aspect and element');
      return;
    }
    
    try {
      console.log('🔵 AddActivityScreen: Starting activity save');
      // Get the selected element to get its unit
      const selectedElementData = aspectElements.find(el => el.id === selectedElement);
      if (!selectedElementData) {
        alert('Selected element not found');
        return;
      }
      
      // Create activity log entry
      const newActivity = {
        aspectId: selectedAspect,
        elementId: selectedElement,
        value: isQuantityBased ? quantityValue : durationValue,
        unit: selectedElementData.unit || '',
        notes: notes.trim() || '',
        logDate: new Date(),
      };
      
      console.log('🔵 AddActivityScreen: Saving new activity:', newActivity);
      
      // Save to database using health store
      await logActivity(newActivity);
      
      console.log('✅ AddActivityScreen: Activity saved successfully!');
      console.log('Activity saved successfully!');
      
      // Dismiss the modal
      if (router.canDismiss()) {
        router.dismiss();
      } else {
        router.back();
      }
      
      console.log('✅ AddActivityScreen: router.back() completed');
    } catch (error) {
      console.error('❌ AddActivityScreen: Failed to save activity:', error);
      alert('Failed to save activity. Please try again.');
    }
  };
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Add Activity',
          headerShown: false 
        }} 
      />
      <View className="flex-1 bg-[#F5F5F5]">
        <TopBar title="Add Activity" level={5} />
        <KeyboardAvoidingView 
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 p-5" 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: keyboardVisible ? 350 : 20 }}
          >
        <View className="bg-white rounded-lg p-5 shadow-sm mb-6">
          {/* Aspect Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#757575] mb-1">Health Aspect</Text>
            <View className="flex-row flex-wrap">
              {aspects.map((aspect) => (
                <TouchableOpacity
                  key={aspect.id}
                  onPress={() => setSelectedAspect(aspect.id)}
                  className={`mr-2 mb-2 px-4 py-2 rounded-lg ${selectedAspect === aspect.id ? 'bg-[#4CAF50]' : 'bg-gray-200'}`}
                >
                  <Text className={`${selectedAspect === aspect.id ? 'text-white font-semibold' : 'text-gray-700'}`}>
                    {aspect.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Element Selection (only show if aspect is selected) */}
          {selectedAspect && aspectElements.length > 0 && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-[#757575] mb-1">Element</Text>
              <View className="flex-row flex-wrap">
                {aspectElements.map((element) => (
                  <TouchableOpacity
                    key={element.id}
                    onPress={() => setSelectedElement(element.id)}
                    className={`mr-2 mb-2 px-4 py-2 rounded-lg ${selectedElement === element.id ? 'bg-[#4CAF50]' : 'bg-gray-200'}`}
                  >
                    <Text className={`${selectedElement === element.id ? 'text-white font-semibold' : 'text-gray-700'}`}>
                      {element.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Value Input (Duration or Quantity) */}
          {selectedElement && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-[#757575] mb-1">
                {isQuantityBased ? 'Quantity (grams)' : 'Duration'}
              </Text>
              
              {isQuantityBased ? (
                // Quantity Selection for Nutrition
                <View>
                  {/* Current Quantity Display */}
                  <View className="border border-gray-300 rounded-md p-3 bg-gray-50 mb-2">
                    <Text className="text-center font-medium">{quantityValue}g</Text>
                  </View>
                  
                  {/* Quantity Options */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {GRAM_VALUES.map((grams) => (
                      <TouchableOpacity
                        key={`grams-${grams}`}
                        onPress={() => setQuantityValue(grams)}
                        className={`mr-2 px-4 py-2 rounded-lg ${quantityValue === grams ? 'bg-[#4CAF50]' : 'bg-gray-200'}`}
                      >
                        <Text className={`${quantityValue === grams ? 'text-white font-semibold' : 'text-gray-700'}`}>
                          {grams}g
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                // Duration Picker for other aspects
                <View>
                  {/* Current Duration Display */}
                  <View className="border border-gray-300 rounded-md p-3 bg-gray-50 mb-2">
                    <Text className="text-center font-medium">{formatDuration(durationValue)}</Text>
                  </View>
                  
                  {/* Duration Presets */}
                  <View className="flex-row flex-wrap">
                    {DURATION_PRESETS.map((preset) => (
                      <TouchableOpacity
                        key={`preset-${preset.value}`}
                        onPress={() => setDurationValue(preset.value)}
                        className={`mr-2 mb-2 px-4 py-2 rounded-lg ${durationValue === preset.value ? 'bg-[#4CAF50]' : 'bg-gray-200'}`}
                      >
                        <Text className={`${durationValue === preset.value ? 'text-white font-semibold' : 'text-gray-700'}`}>
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
          
          {/* Notes Input */}
          {selectedElement && (
            <View className="mb-6">
              <Text className="text-sm font-medium text-[#757575] mb-1">Notes (optional)</Text>
              <TextInput
                className="border border-gray-300 rounded-md p-3 h-24"
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes about this activity"
                multiline
                textAlignVertical="top"
              />
            </View>
          )}
          
          {/* Submit Button */}
          {selectedElement && (
            <Button 
              title="Add Activity" 
              onPress={handleSubmit} 
              className="bg-[#4CAF50]"
            />
          )}
        
        </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  picker: {
    height: 50,
    width: '100%',
  },
});
