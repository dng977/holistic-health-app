import '../global.css';

import { Stack, Redirect } from 'expo-router';
import { useEffect } from 'react';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  // Add unhandled promise rejection handler
  useEffect(() => {
    const handleUnhandledRejection = (event: any) => {
      console.error('🚨 UNHANDLED PROMISE REJECTION:', {
        reason: event?.reason,
        promise: event?.promise,
      });
    };
    
    // @ts-ignore - addEventListener exists on global in React Native
    if (typeof global !== 'undefined' && global.addEventListener) {
      // @ts-ignore
      global.addEventListener('unhandledRejection', handleUnhandledRejection);
      
      return () => {
        // @ts-ignore
        global.removeEventListener('unhandledRejection', handleUnhandledRejection);
      };
    }
  }, []);
  
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="add-activity" 
        options={{
          presentation: 'modal',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="test-modal" 
        options={{
          presentation: 'modal',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
