import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { isPremium, onboardingCompleted } = useUserStore();
  const { user } = useAuthStore();

  // If not authenticated, go to onboarding (which will show sign-in)
  if (!user) {
    return <Redirect href="/(onboarding)" />;
  }

  // If user has completed onboarding and is premium, go to main app
  if (onboardingCompleted && isPremium) {
    return <Redirect href="/(tabs)" />;
  }

  // Otherwise, continue/start onboarding
  return <Redirect href="/(onboarding)" />;
}
