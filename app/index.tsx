import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { DEMO_MODE } from '@/lib/demo';

export default function Index() {
  const { isPremium, onboardingCompleted, setPremium, setOnboardingCompleted, initializeFromOnboarding, startDate } = useUserStore();
  const { user } = useAuthStore();

  // In demo mode, seed the user store on first mount so the home screen
  // opens on a realistic mid-program state.
  useEffect(() => {
    if (!DEMO_MODE) return;
    setPremium(true);
    setOnboardingCompleted(true);
    if (!startDate) {
      const target = new Date();
      target.setDate(target.getDate() + 83);
      initializeFromOnboarding(72, 'both', target.toISOString().split('T')[0]);
      // initializeFromOnboarding overrides initialScore to current score; nudge the
      // displayed score to reflect 7 days of progress (initial 45 → current 72).
      useUserStore.setState({
        initialScore: 45,
        currentStreak: 7,
        longestStreak: 12,
      });
    }
  }, []);

  if (DEMO_MODE) {
    return <Redirect href="/(tabs)" />;
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
