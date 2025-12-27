import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  withSpring,
  Easing,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);

// "Lastr'" text as SVG paths - approximated for the bold sans-serif look
// These paths represent the letters L, a, s, t, r, '
const LOGO_WIDTH = 280;
const LOGO_HEIGHT = 60;

interface AnimatedSplashProps {
  onAnimationComplete?: () => void;
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const AnimatedSplash: React.FC<AnimatedSplashProps> = ({
  onAnimationComplete,
  isLoading = false,
  size = 'large',
}) => {
  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.5);
  const shimmerPosition = useSharedValue(-1);
  const pulseScale = useSharedValue(1);
  const letterStagger = useSharedValue(0);

  // Individual letter animations
  const letter1 = useSharedValue(0);
  const letter2 = useSharedValue(0);
  const letter3 = useSharedValue(0);
  const letter4 = useSharedValue(0);
  const letter5 = useSharedValue(0);
  const letter6 = useSharedValue(0);

  const sizeMultiplier = size === 'small' ? 0.5 : size === 'medium' ? 0.75 : 1;
  const scaledWidth = LOGO_WIDTH * sizeMultiplier;
  const scaledHeight = LOGO_HEIGHT * sizeMultiplier;

  useEffect(() => {
    // Staggered letter reveal
    const staggerDelay = 80;
    letter1.value = withDelay(0, withSpring(1, { damping: 12, stiffness: 100 }));
    letter2.value = withDelay(staggerDelay * 1, withSpring(1, { damping: 12, stiffness: 100 }));
    letter3.value = withDelay(staggerDelay * 2, withSpring(1, { damping: 12, stiffness: 100 }));
    letter4.value = withDelay(staggerDelay * 3, withSpring(1, { damping: 12, stiffness: 100 }));
    letter5.value = withDelay(staggerDelay * 4, withSpring(1, { damping: 12, stiffness: 100 }));
    letter6.value = withDelay(staggerDelay * 5, withSpring(1, { damping: 12, stiffness: 100 }));

    // Main logo animation
    logoOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });

    // Glow animation
    glowOpacity.value = withDelay(300, withTiming(0.6, { duration: 600 }));
    glowScale.value = withDelay(300, withSpring(1, { damping: 12 }));

    // Shimmer effect
    shimmerPosition.value = withDelay(
      600,
      withTiming(2, { duration: 1200, easing: Easing.inOut(Easing.ease) })
    );

    // Pulse animation for loading state
    if (isLoading) {
      pulseScale.value = withDelay(
        1000,
        withRepeat(
          withSequence(
            withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      );
    }

    // Callback when animation is complete
    if (onAnimationComplete) {
      const timeout = setTimeout(() => {
        onAnimationComplete();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value * pulseScale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value * scaledWidth }],
  }));

  // Letter animation styles
  const letter1Style = useAnimatedStyle(() => ({
    opacity: letter1.value,
    transform: [
      { translateY: interpolate(letter1.value, [0, 1], [20, 0]) },
    ],
  }));

  const letter2Style = useAnimatedStyle(() => ({
    opacity: letter2.value,
    transform: [
      { translateY: interpolate(letter2.value, [0, 1], [20, 0]) },
    ],
  }));

  const letter3Style = useAnimatedStyle(() => ({
    opacity: letter3.value,
    transform: [
      { translateY: interpolate(letter3.value, [0, 1], [20, 0]) },
    ],
  }));

  const letter4Style = useAnimatedStyle(() => ({
    opacity: letter4.value,
    transform: [
      { translateY: interpolate(letter4.value, [0, 1], [20, 0]) },
    ],
  }));

  const letter5Style = useAnimatedStyle(() => ({
    opacity: letter5.value,
    transform: [
      { translateY: interpolate(letter5.value, [0, 1], [20, 0]) },
    ],
  }));

  const letter6Style = useAnimatedStyle(() => ({
    opacity: letter6.value,
    transform: [
      { translateY: interpolate(letter6.value, [0, 1], [20, 0]) },
      { scale: interpolate(letter6.value, [0, 1], [0.5, 1]) },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <Animated.View style={[styles.glowContainer, glowStyle]}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0.1)', 'transparent']}
          style={styles.glowGradient}
        />
      </Animated.View>

      {/* Logo container */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        {/* Shimmer overlay */}
        <View style={styles.shimmerContainer}>
          <Animated.View style={[styles.shimmer, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        </View>

        {/* Text logo using individual animated letters */}
        <View style={[styles.textContainer, { width: scaledWidth, height: scaledHeight }]}>
          <Animated.Text style={[styles.letter, { fontSize: 52 * sizeMultiplier }, letter1Style]}>
            L
          </Animated.Text>
          <Animated.Text style={[styles.letter, { fontSize: 52 * sizeMultiplier }, letter2Style]}>
            a
          </Animated.Text>
          <Animated.Text style={[styles.letter, { fontSize: 52 * sizeMultiplier }, letter3Style]}>
            s
          </Animated.Text>
          <Animated.Text style={[styles.letter, { fontSize: 52 * sizeMultiplier }, letter4Style]}>
            t
          </Animated.Text>
          <Animated.Text style={[styles.letter, { fontSize: 52 * sizeMultiplier }, letter5Style]}>
            r
          </Animated.Text>
          <Animated.Text style={[styles.apostrophe, { fontSize: 52 * sizeMultiplier }, letter6Style]}>
            '
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Loading indicator dots */}
      {isLoading && (
        <LoadingDots />
      )}
    </View>
  );
};

// Separate loading dots component
const LoadingDots: React.FC = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const duration = 400;
    const delay = 150;

    dot1.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0, { duration })
        ),
        -1
      )
    );

    dot2.value = withDelay(
      500 + delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0, { duration })
        ),
        -1
      )
    );

    dot3.value = withDelay(
      500 + delay * 2,
      withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0, { duration })
        ),
        -1
      )
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot1.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot2.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot3.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, dot1Style]} />
      <Animated.View style={[styles.dot, dot2Style]} />
      <Animated.View style={[styles.dot, dot3Style]} />
    </View>
  );
};

// Compact loader version
export const LastrLoader: React.FC<{ size?: 'small' | 'medium' }> = ({ size = 'small' }) => {
  return (
    <View style={styles.loaderContainer}>
      <AnimatedSplash isLoading size={size} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0F',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  glowContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shimmerContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    width: 80,
    height: '100%',
    left: -80,
  },
  shimmerGradient: {
    flex: 1,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: 'NeueHaas-Black',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  apostrophe: {
    fontFamily: 'NeueHaas-Black',
    color: '#8B5CF6',
    letterSpacing: -1,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
});

export default AnimatedSplash;
