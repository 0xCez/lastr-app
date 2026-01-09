import { Dimensions, PixelRatio } from 'react-native';

// Base dimensions (iPhone 14/15 - standard design reference)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Scale factors
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;

/**
 * Scales a size based on screen width
 * Use for horizontal dimensions: padding, margin, width, font sizes
 */
export const wp = (size: number): number => {
  const scaledSize = size * widthScale;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

/**
 * Scales a size based on screen height
 * Use for vertical dimensions: height, vertical padding/margin
 */
export const hp = (size: number): number => {
  const scaledSize = size * heightScale;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

/**
 * Scales font size with moderate scaling (prevents fonts from getting too large/small)
 * Uses a dampened scale factor for better readability
 */
export const fp = (size: number): number => {
  const scale = Math.min(widthScale, heightScale);
  // Dampen the scaling to prevent extreme sizes (max 15% change)
  const dampenedScale = 1 + (scale - 1) * 0.5;
  const scaledSize = size * dampenedScale;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

/**
 * Returns percentage of screen width
 */
export const widthPercent = (percent: number): number => {
  return (SCREEN_WIDTH * percent) / 100;
};

/**
 * Returns percentage of screen height
 */
export const heightPercent = (percent: number): number => {
  return (SCREEN_HEIGHT * percent) / 100;
};

// Device size detection
export const isSmallDevice = SCREEN_WIDTH < 375; // iPhone SE
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;

// Screen dimensions export
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// Common responsive spacing
export const spacing = {
  xs: wp(4),
  sm: wp(8),
  md: wp(12),
  lg: wp(16),
  xl: wp(24),
  xxl: wp(32),
};

// Common responsive padding
export const padding = {
  horizontal: wp(24),
  vertical: hp(16),
  screen: wp(20),
};

// Responsive border radius
export const radius = {
  sm: wp(8),
  md: wp(12),
  lg: wp(16),
  xl: wp(20),
  xxl: wp(24),
  full: wp(999),
};
