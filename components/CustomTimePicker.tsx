import React from 'react';
import { Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Define DateTimePickerProps type based on the component props
type DateTimePickerProps = React.ComponentProps<typeof DateTimePicker>;

/**
 * Custom wrapper for DateTimePicker to handle platform-specific issues
 * Particularly fixes SVG filter warnings on web platform
 */
export function CustomTimePicker(props: DateTimePickerProps) {
  // On web platform, wrap in a View for consistent styling
  if (Platform.OS === 'web') {
    return (
      <View>
        <DateTimePicker {...props} />
      </View>
    );
  }
  
  // On native platforms, use the component directly
  return <DateTimePicker {...props} />;
}
