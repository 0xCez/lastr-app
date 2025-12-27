export const Colors = {
  // Primary
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',

  // Backgrounds
  background: '#0A0A0F',
  backgroundSecondary: '#111118',
  card: '#1A1A24',
  cardBorder: '#2A2A3A',

  // Text
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',

  // Status
  success: '#22C55E',
  successLight: '#4ADE80',
  warning: '#F59E0B',
  error: '#EF4444',
  errorDark: '#DC2626',

  // Accent
  streak: '#F97316',

  // Gradients
  gradientPurple: ['#8B5CF6', '#6D28D9'],
  gradientDark: ['#1A1A24', '#0A0A0F'],
  gradientCard: ['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)'],

  // Onboarding specific
  onboardingRed: '#991B1B',
  onboardingRedBg: '#7F1D1D',
} as const;

export type ColorName = keyof typeof Colors;
