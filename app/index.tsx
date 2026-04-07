import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { DEMO_MODE } from '@/lib/demo';

export default function Index() {
  const { isPremium, onboardingCompleted } = useUserStore();
  const { user } = useAuthStore();

  // Demo: send every visitor through onboarding from screen 1.
  // The mock auth user is already "signed in" via authStore.initialize(),
  // so any auth checks during onboarding pass — but onboardingCompleted
  // starts false (see DEMO_MODE branch in store/userStore.ts) so the flow
  // is shown fresh on every page load.
  if (DEMO_MODE) {
    return <Redirect href="/(onboarding)" />;
  }

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
