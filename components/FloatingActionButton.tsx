import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CustomIcon } from './CustomIcon';

type FloatingActionButtonProps = {
  aspectId?: string;
};

/**
 * Floating action button component that appears in the bottom right corner
 * Used to add new activities from any aspect page
 */
export function FloatingActionButton({ aspectId }: FloatingActionButtonProps) {
  const handlePress = () => {
    // Navigate to the add activity page with the current aspect as a parameter
    router.push({
      pathname: '/add-activity',
      params: aspectId ? { aspectId } : {}
    });
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <CustomIcon name="plus" size={24} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20, // Position above the tab bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
});
