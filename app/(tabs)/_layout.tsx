import { Link, Tabs } from 'expo-router';
import { View, Text } from 'react-native';

import { HeaderButton } from '../../components/HeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';
import { t } from '../../localization';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: { paddingBottom: 5 },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="nutrition"
        options={{
          title: t('pageTitle.nutrition'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="cutlery" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recovery"
        options={{
          title: t('pageTitle.recovery'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="bed" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="physical"
        options={{
          title: t('pageTitle.physical'),
          tabBarIcon: ({ color }) => <TabBarIcon name="heartbeat" color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: t('pageTitle.home'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-[60px] h-[60px] rounded-full justify-center items-center -mt-[15px] shadow-md border-[3px] border-white ${focused ? 'bg-[#4CAF50]' : 'bg-[#f0f0f0]'}`}>
              <Text className={`text-[32px] font-bold ${focused ? 'text-white' : 'text-black'}`}>H</Text>
            </View>
          ),
          tabBarItemStyle: { height: 60 },
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="mental"
        options={{
          title: t('pageTitle.mental'),
          tabBarIcon: ({ color }) => <TabBarIcon name="lightbulb-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: t('pageTitle.social'),
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="environment"
        options={{
          title: t('pageTitle.environment'),
          tabBarIcon: ({ color }) => <TabBarIcon name="tree" color={color} />,
        }}
      />
    </Tabs>
  );
}


