# Lastr' - Development Plan

## Overview
Lastr' is a men's sexual health app focused on helping users overcome premature ejaculation through science-backed exercises, daily habits, progress tracking, and community support.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React Native 0.76+ | Mobile framework |
| Expo SDK 52 | Development platform (managed workflow) |
| Expo Router | File-based navigation |
| TypeScript (strict) | Type safety |
| Supabase | Backend (Auth, DB, Storage, Edge Functions) |
| React Native Reanimated | Smooth animations |
| Lottie | Complex animations |
| RevenueCat | Subscription management |
| PostHog | Analytics |
| i18n-js + expo-localization | Internationalization |
| expo-apple-authentication | Sign in with Apple |
| @react-native-google-signin | Sign in with Google |
| expo-secure-store | Secure storage |
| EAS Build | CI/CD |

---

## Current Progress ✅

### Completed Features:
- ✅ Project structure and configuration
- ✅ Design system (colors, typography)
- ✅ Reusable UI components (Button, Card, ProgressBar, Checkbox, OptionButton)
- ✅ State management with Zustand (onboarding + user stores)
- ✅ Complete onboarding flow:
  - Welcome screen
  - Questions flow (8 questions with various input types)
  - Analyzing screen with animated progress
  - Analysis complete with comparison chart
  - Symptoms selection (psychological, physical, social)
  - Education slider (6 swipeable cards)
  - Social proof with reviews
  - Goals selection
  - Personalized welcome message with typing effect
  - Custom plan teaser
  - Paywall with subscription options
- ✅ Main app screens:
  - Dashboard with control scores, progress chart, best practices
  - Today (daily tasks with streak tracking)
  - Learn (exercise library with cognitive + physical tabs)
  - Community (forum with posts and engagement)
  - Profile (settings, stats, account management)
- ✅ Exercise detail screen with timer functionality
- ✅ Supabase client setup
- ✅ Haptic feedback throughout

---

## What's Next (To Complete)

### Backend Integration
- [ ] Set up Supabase project and database tables
- [ ] Implement authentication (email + social)
- [ ] Connect stores to Supabase for persistence
- [ ] Real-time forum functionality

### RevenueCat Integration
- [ ] Configure products in App Store Connect / Play Console
- [ ] Set up RevenueCat project
- [ ] Implement purchase flow
- [ ] Handle subscription status

### Polish & Launch
- [ ] Add app icons and splash screen images
- [ ] Add Lottie animations for loading states
- [ ] Implement push notifications
- [ ] Error boundaries and error handling
- [ ] Performance optimization
- [ ] TestFlight / Internal testing
- [ ] App Store submission

---

## Running the App

```bash
# Navigate to project
cd lastr-app

# Install dependencies
npm install

# Start development server
npx expo start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
```

---

## App Structure

### Onboarding Flow (13 screens)
1. Welcome/Splash → Brand introduction with stats
2. Questions (8) → Collect user data for personalization
3. Analyzing → Animated progress indicator
4. Analysis Complete → Comparison chart (psychological hook)
5. Symptoms → Select from 3 categories
6. Education → 6 swipeable cards about the issue
7. Social Proof → Reviews and testimonials
8. Goals → Select personal goals
9. Welcome Message → Typing effect personal message
10. Custom Plan → Teaser of personalized plan
11. Paywall → Weekly/Lifetime subscription options

### Main App (5 tabs)
1. **Dashboard** - Progress tracking, scores, charts
2. **Today** - Daily tasks, streaks, calendar
3. **Learn** - Exercise library (cognitive + physical)
4. **Community** - Forum, discussions, support
5. **Profile** - Settings, account, subscription

---

## File Structure

```
lastr-app/
├── app/
│   ├── (onboarding)/     # 11 onboarding screens
│   ├── (tabs)/           # 5 main app tabs
│   ├── exercise/[id].tsx # Exercise detail
│   ├── _layout.tsx       # Root layout
│   └── index.tsx         # Entry redirect
├── components/
│   └── ui/               # Reusable components
├── constants/
│   ├── colors.ts
│   ├── typography.ts
│   ├── exercises.ts
│   └── onboarding.ts
├── store/
│   ├── onboardingStore.ts
│   └── userStore.ts
├── lib/
│   └── supabase.ts
└── assets/
    ├── images/
    └── animations/
```

---

## Environment Variables

Create a `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=your_rc_ios_key
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=your_rc_android_key
EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_key
```

---

## Database Schema (Supabase)

### Tables
- **users** - User profiles and stats
- **user_answers** - Onboarding question responses
- **user_symptoms** - Selected symptoms
- **user_goals** - Selected goals
- **daily_tasks** - Daily task completion tracking
- **progress_logs** - Historical progress data
- **forum_posts** - Community posts
- **forum_comments** - Post comments

---

## Design System

### Colors
- Primary: `#8B5CF6` (Purple)
- Background: `#0A0A0F` (Dark)
- Card: `#1A1A24`
- Success: `#22C55E`
- Error: `#EF4444`

### Typography
- Headings: Bold, 20-32px
- Body: Regular, 14-18px
- Stats: Bold, 24-48px

### UI Patterns
- Dark theme
- 16px rounded corners
- Purple accent highlights
- Subtle gradients
- Haptic feedback on interactions
