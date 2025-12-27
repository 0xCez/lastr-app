import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="questions" />
      <Stack.Screen name="analyzing" />
      <Stack.Screen name="analysis-complete" />
      <Stack.Screen name="symptoms" />
      <Stack.Screen name="education" />
      <Stack.Screen name="social-proof" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="welcome-message" />
      <Stack.Screen name="custom-plan" />
      <Stack.Screen name="rewiring-benefits" />
      <Stack.Screen name="paywall" />
    </Stack>
  );
}
