import { forwardRef } from 'react';
import { Pressable } from 'react-native';
import { CustomIcon } from './CustomIcon';

export const HeaderButton = forwardRef<typeof Pressable, { onPress?: () => void }>(
  ({ onPress }, ref) => {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <CustomIcon
            name="info-circle"
            size={25}
            color="gray"
            className="mr-[15px]"
            style={{
              opacity: pressed ? 0.5 : 1,
            }}
          />
        )}
      </Pressable>
    );
  }
);

HeaderButton.displayName = 'HeaderButton';


