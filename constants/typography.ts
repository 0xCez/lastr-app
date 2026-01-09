import { TextStyle } from 'react-native';
import { fp } from './responsive';

export const Typography = {
  // Headings
  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: fp(32),
    fontWeight: '700',
    lineHeight: fp(40),
    letterSpacing: -0.5,
  } as TextStyle,

  h2: {
    fontFamily: 'Inter_700Bold',
    fontSize: fp(24),
    fontWeight: '700',
    lineHeight: fp(32),
    letterSpacing: -0.3,
  } as TextStyle,

  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: fp(20),
    fontWeight: '600',
    lineHeight: fp(28),
  } as TextStyle,

  h4: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: fp(18),
    fontWeight: '600',
    lineHeight: fp(24),
  } as TextStyle,

  // Body
  bodyLarge: {
    fontFamily: 'Inter_400Regular',
    fontSize: fp(18),
    fontWeight: '400',
    lineHeight: fp(28),
  } as TextStyle,

  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: fp(16),
    fontWeight: '400',
    lineHeight: fp(24),
  } as TextStyle,

  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: fp(14),
    fontWeight: '400',
    lineHeight: fp(20),
  } as TextStyle,

  // Labels
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: fp(14),
    fontWeight: '500',
    lineHeight: fp(20),
  } as TextStyle,

  labelSmall: {
    fontFamily: 'Inter_500Medium',
    fontSize: fp(12),
    fontWeight: '500',
    lineHeight: fp(16),
  } as TextStyle,

  // Special
  stat: {
    fontFamily: 'Inter_700Bold',
    fontSize: fp(48),
    fontWeight: '700',
    lineHeight: fp(56),
  } as TextStyle,

  statMedium: {
    fontFamily: 'Inter_700Bold',
    fontSize: fp(36),
    fontWeight: '700',
    lineHeight: fp(44),
  } as TextStyle,

  statSmall: {
    fontFamily: 'Inter_700Bold',
    fontSize: fp(24),
    fontWeight: '700',
    lineHeight: fp(32),
  } as TextStyle,

  button: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: fp(16),
    fontWeight: '600',
    lineHeight: fp(24),
  } as TextStyle,

  buttonSmall: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: fp(14),
    fontWeight: '600',
    lineHeight: fp(20),
  } as TextStyle,

  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: fp(12),
    fontWeight: '400',
    lineHeight: fp(16),
  } as TextStyle,
};

export type TypographyName = keyof typeof Typography;
