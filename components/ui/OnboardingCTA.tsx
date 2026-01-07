import React, { useEffect } from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface OnboardingCTAProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  subtitle?: string;
}

export const OnboardingCTA: React.FC<OnboardingCTAProps> = ({
  title,
  onPress,
  disabled = false,
  subtitle,
}) => {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const shinePosition = useSharedValue(-100);

  // Pulse and shine animations when not disabled
  useEffect(() => {
    if (!disabled) {
      // Subtle pulse animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      // Shine sweep animation
      shinePosition.value = withRepeat(
        withSequence(
          withTiming(400, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-100, { duration: 0 })
        ),
        -1,
        false
      );
    }
  }, [disabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: disabled ? 1 : scale.value }],
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: pressed.value * 0.5,
  }));

  const shineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shinePosition.value }],
  }));

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
    >
      {/* Main button */}
      <LinearGradient
        colors={disabled
          ? ['#2A2A3A', '#232330']
          : ['#8B5CF6', '#7C3AED']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {/* Animated shine sweep */}
        {!disabled && (
          <Animated.View style={[styles.shineSweep, shineAnimatedStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        {/* Press highlight */}
        <Animated.View style={[styles.pressHighlight, innerGlowStyle]} />

        <View style={styles.textContainer}>
          <Ionicons name="arrow-forward" size={20} color={disabled ? Colors.textMuted : '#FFFFFF'} style={{ marginRight: 8 }} />
          <Text style={[styles.text, disabled && styles.textDisabled]}>{title}</Text>
        </View>
        {subtitle && (
          <Text style={[styles.subtitleText, disabled && styles.textDisabled]}>{subtitle}</Text>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  containerDisabled: {
    opacity: 0.6,
  },
  gradient: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    overflow: 'hidden',
  },
  shineSweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    left: -60,
  },
  pressHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  textDisabled: {
    color: Colors.textMuted,
  },
  subtitleText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
});
