import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const { isPremium, onboardingCompleted } = useUserStore();

  // If user has completed onboarding and is premium, go to main app
  if (onboardingCompleted && isPremium) {
    return <Redirect href="/(tabs)" />;
  }

  // Otherwise, start onboarding
  return <Redirect href="/(onboarding)" />;
}
