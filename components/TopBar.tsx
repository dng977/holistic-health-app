import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTranslation } from '../localization';
import { CustomIcon } from './CustomIcon';

type TopBarProps = {
  title?: string;
  level?: number;
  onProfilePress?: () => void;
};

export function TopBar({ 
  title, 
  level = 1, 
  onProfilePress = () => {} 
}: TopBarProps) {
  // Use the translation hook
  const { t } = useAppTranslation();
  
  // If no title is provided, use the home page title as default
  const displayTitle = title || t('pageTitle.home');
  
  return (
    <SafeAreaView edges={['top']} className="bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E0E0E0] shadow-sm">
        {/* Profile Icon */}
        <TouchableOpacity className="p-1" onPress={onProfilePress}>
          <CustomIcon name="user-circle" size={28}/>
        </TouchableOpacity>
        
        {/* Page Title */}
        <Text className="text-lg font-semibold text-[#212121]">{displayTitle}</Text>
        
        {/* Level with Star */}
        <View className="flex-row items-center">
          <CustomIcon name="star" size={24} color="#FFD700" className="-mr-3" />
          <Text className="text-xs font-bold text-[#212121] -ml-[3px]">{level}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}


