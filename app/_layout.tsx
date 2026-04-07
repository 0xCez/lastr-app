import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Haptics from 'expo-haptics';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { RevenueCatProvider } from '@/providers/RevenueCatProvider';
import { DEMO_MODE } from '@/lib/demo';

// Prevent auto hide
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialize, isInitialized } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    // Neue Haas Display (for logo only)
    'NeueHaas-Light': require('@/assets/fonts/NeueHaasDisplayLight.ttf'),
    'NeueHaas-Roman': require('@/assets/fonts/NeueHaasDisplayRoman.ttf'),
    'NeueHaas-Medium': require('@/assets/fonts/NeueHaasDisplayMediu.ttf'),
    'NeueHaas-Bold': require('@/assets/fonts/NeueHaasDisplayBold.ttf'),
    'NeueHaas-Black': require('@/assets/fonts/NeueHaasDisplayBlack.ttf'),
    // Aeonik (for logo)
    'Aeonik-Black': require('@/assets/fonts/Aeonik-Black.ttf'),
    'Aeonik-Bold': require('@/assets/fonts/Aeonik-Bold.ttf'),
  });

  // Initialize auth on app start
  useEffect(() => {
    // Demo: clear any persisted store state from a previous visit so every
    // page load restarts at the welcome screen with a clean slate.
    if (DEMO_MODE && Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('user-storage');
        window.localStorage.removeItem('onboarding-storage');
      } catch {}
    }

    initialize();

    // Haptics aren't available on web; skip the startup test there.
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isInitialized]);

  if (!fontsLoaded || !isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <RevenueCatProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="exercise/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </RevenueCatProvider>
    </GestureHandlerRootView>
  );
}
