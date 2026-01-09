import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
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
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const LOGO_HEIGHT = 70;

interface AnimatedSplashProps {
  onAnimationComplete?: () => void;
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// White teardrop/drop SVG component - styled like an apostrophe
const DropIcon: React.FC<{ size: number }> = ({ size }) => (
  <View style={{ transform: [{ rotate: '-135deg' }] }}>
    <Svg width={size * 0.22} height={size * 0.28} viewBox="0 0 24 30">
      <Path
        d="M12 0C12 0 2 12 2 19C2 24.5 6.5 29 12 29C17.5 29 22 24.5 22 19C22 12 12 0 12 0Z"
        fill="#FFFFFF"
      />
    </Svg>
  </View>
);

export const AnimatedSplash: React.FC<AnimatedSplashProps> = ({
  onAnimationComplete,
  isLoading = false,
  size = 'large',
}) => {
  // Main logo animation
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const logoY = useSharedValue(15);

  // Breathing for loading state
  const breatheScale = useSharedValue(1);

  // Individual letter animations (L-a-s-t-r + drop)
  const letterOpacities = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0), // drop
  ];
  const letterYs = [
    useSharedValue(14),
    useSharedValue(14),
    useSharedValue(14),
    useSharedValue(14),
    useSharedValue(14),
    useSharedValue(10), // drop starts higher
  ];

  const sizeMultiplier = size === 'small' ? 0.5 : size === 'large' ? 1.5 : 1;
  const scaledHeight = LOGO_HEIGHT * sizeMultiplier;
  const fontSize = 52 * sizeMultiplier;

  useEffect(() => {
    // Phase 1: Container fade in
    logoOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withSpring(1, {
      damping: 18,
      stiffness: 100,
    });
    logoY.value = withSpring(0, {
      damping: 18,
      stiffness: 100,
    });

    // Phase 2: Staggered letter reveal
    const staggerDelay = 70;
    const springConfig = { damping: 12, stiffness: 100 };

    letterOpacities.forEach((opacity, i) => {
      opacity.value = withDelay(
        150 + i * staggerDelay,
        withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) })
      );
    });

    letterYs.forEach((y, i) => {
      y.value = withDelay(150 + i * staggerDelay, withSpring(0, springConfig));
    });

    // Loading state: gentle breathing
    if (isLoading) {
      breatheScale.value = withDelay(
        900,
        withRepeat(
          withSequence(
            withTiming(1.025, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      );
    }

    // Completion callback
    if (onAnimationComplete) {
      const timeout = setTimeout(onAnimationComplete, 1400);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value * breatheScale.value },
      { translateY: logoY.value },
    ],
  }));

  // Letter styles
  const createLetterStyle = (index: number) =>
    useAnimatedStyle(() => ({
      opacity: letterOpacities[index].value,
      transform: [{ translateY: letterYs[index].value }],
    }));

  const letter0Style = createLetterStyle(0);
  const letter1Style = createLetterStyle(1);
  const letter2Style = createLetterStyle(2);
  const letter3Style = createLetterStyle(3);
  const letter4Style = createLetterStyle(4);
  const dropStyle = useAnimatedStyle(() => ({
    opacity: letterOpacities[5].value,
    transform: [
      { translateY: letterYs[5].value },
      { scale: interpolate(letterOpacities[5].value, [0, 1], [0.6, 1]) },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, containerStyle]}>
        {/* Letters */}
        <View style={[styles.textContainer, { height: scaledHeight }]}>
          <Animated.Text style={[styles.letter, { fontSize }, letter0Style]}>
            L
          </Animated.Text>
          <Animated.Text style={[styles.letter, { fontSize }, letter1Style]}>
            a
          </Animated.Text>
          <Animated.Text style={[styles.letter, { fontSize }, letter2Style]}>
            s
          </Animated.Text>
          <Animated.Text style={[styles.letter, { fontSize }, letter3Style]}>
            t
          </Animated.Text>
          <Animated.Text style={[styles.letter, { fontSize }, letter4Style]}>
            r
          </Animated.Text>
          <Animated.View style={[styles.dropContainer, dropStyle]}>
            <DropIcon size={fontSize} />
          </Animated.View>
        </View>
      </Animated.View>

      {/* Loading bar */}
      {isLoading && <LoadingBar />}
    </View>
  );
};

// Minimal loading indicator
const LoadingBar: React.FC = () => {
  const width = useSharedValue(0.2);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(700, withTiming(1, { duration: 300 }));

    width.value = withDelay(
      700,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
          withTiming(0.2, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) })
        ),
        -1
      )
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: width.value }],
    opacity: interpolate(width.value, [0.2, 0.6, 1], [0.5, 1, 0.8]),
  }));

  return (
    <Animated.View style={[styles.loadingContainer, containerStyle]}>
      <Animated.View style={[styles.loadingBar, barStyle]} />
    </Animated.View>
  );
};

// Compact loader
export const LastrLoader: React.FC<{ size?: 'small' | 'medium' }> = ({ size = 'small' }) => (
  <View style={styles.loaderContainer}>
    <AnimatedSplash isLoading size={size} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: 'Aeonik-Black',
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  dropContainer: {
    marginLeft: 2,
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: '28%',
    alignItems: 'center',
  },
  loadingBar: {
    width: 50,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#8B5CF6',
  },
});

export default AnimatedSplash;
