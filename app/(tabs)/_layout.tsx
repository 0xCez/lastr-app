import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/colors';
import { useRevenueCat } from '@/providers/RevenueCatProvider';
import { useUserStore } from '@/store/userStore';
import { DEMO_MODE } from '@/lib/demo';

export default function TabsLayout() {
  const { isSubscribed, isLoading: rcLoading } = useRevenueCat();
  const { isPremium, setPremium, onboardingCompleted } = useUserStore();

  // Sync RevenueCat subscription status with local store
  useEffect(() => {
    if (!rcLoading && isSubscribed !== isPremium) {
      setPremium(isSubscribed);
    }
  }, [isSubscribed, rcLoading, isPremium, setPremium]);

  // Gate access: redirect to paywall if not subscribed.
  // In DEMO_MODE the user is always treated as subscribed, so the gate is a no-op.
  useEffect(() => {
    if (DEMO_MODE) return;
    // Only check after RC loads and if user completed onboarding
    if (!rcLoading && onboardingCompleted && !isSubscribed && !isPremium) {
      router.replace('/(onboarding)/paywall');
    }
  }, [rcLoading, isSubscribed, isPremium, onboardingCompleted]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={40} tint="dark" style={styles.tabBarBlur}>
            <View style={styles.tabBarInner} />
          </BlurView>
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: 'Train',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'barbell' : 'barbell-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Soon',
          tabBarIcon: ({ focused }) => (
            <View style={styles.soonIconWrap}>
              <Ionicons
                name="chatbubbles-outline"
                size={24}
                color="rgba(255, 255, 255, 0.25)"
              />
            </View>
          ),
          tabBarLabelStyle: styles.soonLabel,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBarInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 20, 28, 0.75)',
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
  },
  soonIconWrap: {
    opacity: 0.5,
  },
  soonLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
    color: 'rgba(255, 255, 255, 0.25)',
  },
});
