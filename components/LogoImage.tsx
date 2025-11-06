import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CustomIcon } from './CustomIcon';

type LogoImageProps = {
  size?: number;
};

export function LogoImage({ size = 100 }: LogoImageProps) {
  // Create a logo with overlapping icons
  const iconSize = size * 0.6;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.iconContainer}>
        <CustomIcon name="leaf" size={iconSize} color="#4CAF50" style={styles.leafIcon} />
        <CustomIcon name="heart" size={iconSize} color="#E91E63" style={[styles.heartIcon, { fontSize: iconSize }]} />
        <CustomIcon name="sun-o" size={iconSize} color="#FF9800" style={styles.sunIcon} />
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafIcon: {
    marginRight: -8,
    transform: [{ rotate: '-15deg' }],
  },
  heartIcon: {
    zIndex: 1,
  },
  sunIcon: {
    marginLeft: -8,
    transform: [{ rotate: '15deg' }],
  },
});
