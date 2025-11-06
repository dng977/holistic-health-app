import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomIcon } from './CustomIcon';

type LogoProps = {
  size?: 'small' | 'medium' | 'large';
};

export function Logo({ size = 'medium' }: LogoProps) {
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 24 : 32;
  const fontSize = size === 'small' ? 14 : size === 'medium' ? 18 : 24;
  const leafSize = iconSize * 0.5;
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {/* Person icon in the center */}
        <CustomIcon name="user" size={iconSize} color="#4CAF50" style={styles.personIcon} />
        
        {/* Small leaf on the left */}
        <CustomIcon 
          name="leaf" 
          size={leafSize} 
          color="#4CAF50" 
          style={[styles.leafLeft, { fontSize: leafSize }]} 
        />
        
        {/* Small leaf on the right */}
        <CustomIcon 
          name="leaf" 
          size={leafSize} 
          color="#4CAF50" 
          style={[styles.leafRight, { fontSize: leafSize }]} 
        />
      </View>
      <Text style={[styles.text, { fontSize }]}>
        <Text style={styles.holisticText}>Holistic</Text>
        <Text style={styles.healthText}>Health</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    width: 40,
    height: 40,
  },
  personIcon: {
    zIndex: 1,
  },
  leafLeft: {
    position: 'absolute',
    top: 2,
    left: 4,
    transform: [{ rotate: '-30deg' }],
  },
  leafRight: {
    position: 'absolute',
    top: 2,
    right: 4,
    transform: [{ rotate: '30deg' }],
  },
  text: {
    fontWeight: 'bold',
  },
  holisticText: {
    color: '#4CAF50',
  },
  healthText: {
    color: '#4CAF50',
  },
});
