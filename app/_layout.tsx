import { Stack } from 'expo-router';
import { AppProvider } from '@/context/AppContext';
import { Colors } from '@/constants/colors';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerTintColor: Colors.primaryDark,
          headerStyle: { backgroundColor: Colors.secondary },
          headerTitleStyle: { color: Colors.textDark, fontWeight: '700' },
          contentStyle: { backgroundColor: Colors.secondary },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ title: 'Authentication' }} />
        <Stack.Screen name="profile-setup" options={{ title: 'Profile Setup' }} />
        <Stack.Screen name="pujaris/[pujaId]" options={{ title: 'Pujari Listings' }} />
        <Stack.Screen name="booking/create" options={{ title: 'Create Booking' }} />
        <Stack.Screen name="booking/payment" options={{ title: 'Payment' }} />
      </Stack>
    </AppProvider>
  );
}
