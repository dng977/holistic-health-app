import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Platform } from 'react-native';

type IconProps = React.ComponentProps<typeof FontAwesome>;

export function CustomIcon(props: IconProps) {
  // Filter out accessibility props on web platform
  if (Platform.OS === 'web') {
    const { accessibilityHint, accessibilityLabel, ...webSafeProps } = props;
    return <FontAwesome {...webSafeProps} />;
  }
  
  // Use all props on native platforms
  return <FontAwesome {...props} />;
}
