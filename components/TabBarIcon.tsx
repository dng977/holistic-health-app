import { CustomIcon } from './CustomIcon';
import type FontAwesome from '@expo/vector-icons/FontAwesome';

export const TabBarIcon = (props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) => {
  return <CustomIcon size={28} className="-mb-[3px]" {...props} />;
};


