import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Pressable, View, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ShimmerCTAProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'success';
  /** Custom gradient colors [start, end] - overrides variant */
  colors?: [string, string];
}

export const ShimmerCTA: React.FC<ShimmerCTAProps> = ({
  title,
  onPress,
  disabled = false,
  subtitle,
  icon = 'arrow-forward',
  variant = 'primary',
  colors,
}) => {
  const [buttonWidth, setButtonWidth] = useState(300);
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const shimmerProgress = useSharedValue(0);

  const defaultGradientColors: [string, string] = variant === 'success'
    ? ['#22C55E', '#16A34A']
    : ['#8B5CF6', '#7C3AED'];

  const gradientColors: [string, string] = colors || defaultGradientColors;
  const disabledColors: [string, string] = ['#2A2A3A', '#232330'];

  // Shimmer width
  const SHIMMER_WIDTH = 80;

  // Start shimmer animation
  useEffect(() => {
    if (!disabled) {
      // Pulse animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Shimmer sweep animation - goes from left to right across full width
      shimmerProgress.value = withDelay(
        500,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
            withDelay(1000, withTiming(0, { duration: 0 }))
          ),
          -1,
          false
        )
      );
    } else {
      scale.value = 1;
      shimmerProgress.value = 0;
    }
  }, [disabled]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setButtonWidth(event.nativeEvent.layout.width);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: disabled ? 1 : scale.value }],
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: pressed.value * 0.3,
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerProgress.value,
      [0, 1],
      [-SHIMMER_WIDTH, buttonWidth + SHIMMER_WIDTH]
    );

    return {
      transform: [{ translateX }],
      opacity: interpolate(shimmerProgress.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
    };
  });

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
      pressed.value = withSpring(1, { damping: 15 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
    pressed.value = withSpring(0, { damping: 15 });
  };

  const handlePress = async () => {
    if (!disabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle, disabled && styles.containerDisabled]}
      onLayout={handleLayout}
    >
      <LinearGradient
        colors={disabled ? disabledColors : gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {/* Shimmer sweep */}
        {!disabled && (
          <Animated.View style={[styles.shimmer, shimmerStyle]}>
            <LinearGradient
              colors={[
                'transparent',
                'rgba(255, 255, 255, 0.1)',
                'rgba(255, 255, 255, 0.3)',
                'rgba(255, 255, 255, 0.1)',
                'transparent',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        )}

        {/* Press highlight */}
        <Animated.View style={[styles.pressHighlight, innerGlowStyle]} />

        {/* Content */}
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={disabled ? Colors.textMuted : '#FFFFFF'}
              style={styles.icon}
            />
          )}
          <Text style={[styles.title, disabled && styles.textDisabled]}>{title}</Text>
        </View>

        {subtitle && (
          <Text style={[styles.subtitle, disabled && styles.textDisabled]}>{subtitle}</Text>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  containerDisabled: {
    opacity: 0.6,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    left: 0,
  },
  shimmerGradient: {
    flex: 1,
  },
  pressHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  textDisabled: {
    color: Colors.textMuted,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
});
