import { TextStyle } from 'react-native';

export const Typography = {
  // Headings
  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
  } as TextStyle,

  h2: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.3,
  } as TextStyle,

  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  } as TextStyle,

  h4: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  // Body
  bodyLarge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
  } as TextStyle,

  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,

  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,

  // Labels
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  } as TextStyle,

  labelSmall: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  } as TextStyle,

  // Special
  stat: {
    fontFamily: 'Inter_700Bold',
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  } as TextStyle,

  statMedium: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
  } as TextStyle,

  statSmall: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  } as TextStyle,

  button: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  buttonSmall: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,

  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,
};

export type TypographyName = keyof typeof Typography;
