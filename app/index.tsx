import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the home tab when users open the root of the app
  return <Redirect href="/(tabs)/home" />;
}
