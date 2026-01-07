import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import * as Haptics from 'expo-haptics';

const CIRCLE_SIZE = 190;
const STROKE_WIDTH = 13;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const loadingMessages = [
  'Analyzing your responses...',
  'Building your profile...',
  'Identifying key areas...',
  'Creating your personalized plan...',
  'Almost there...',
];

export default function AnalyzingScreen() {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const { calculateAnalysisScore } = useOnboardingStore();

  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const messageOpacity = useSharedValue(1);

  useEffect(() => {
    // Rotate animation - only for the outer glow ring
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    // Pulse animation for the center
    pulseScale.value = withRepeat(
      withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Progress animation - 1% every 80ms = 8 seconds total
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        calculateAnalysisScore();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          router.replace('/(onboarding)/analysis-complete');
        }, 600);
      }
    }, 80);

    // Message rotation
    const messageInterval = setInterval(() => {
      messageOpacity.value = withTiming(0, { duration: 200 }, () => {
        messageOpacity.value = withTiming(1, { duration: 200 });
      });
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, []);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow */}
      <View style={styles.ambientGlow}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
          style={styles.ambientGlowGradient}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Progress Circle Container */}
          <View style={styles.circleContainer}>
            {/* Rotating glow ring */}
            <Animated.View style={[styles.glowRing, rotationStyle]}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.4)', 'transparent', 'rgba(139, 92, 246, 0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.glowRingGradient}
              />
            </Animated.View>

            {/* Static progress circle */}
            <View style={styles.progressCircle}>
              <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                <Defs>
                  <SvgGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={Colors.primary} />
                    <Stop offset="100%" stopColor={Colors.primaryLight} />
                  </SvgGradient>
                </Defs>
                {/* Background Circle */}
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth={STROKE_WIDTH}
                  fill="transparent"
                />
                {/* Progress Circle */}
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke="url(#progressGradient)"
                  strokeWidth={STROKE_WIDTH}
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
                />
              </Svg>

              {/* Center content - NOT rotating */}
              <Animated.View style={[styles.centerContent, pulseStyle]}>
                <Text style={styles.progressPercent}>{Math.round(progress)}</Text>
                <Text style={styles.progressSymbol}>%</Text>
              </Animated.View>
            </View>
          </View>

          {/* Loading Message */}
          <Animated.View style={[styles.messageContainer, messageStyle]}>
            <Text style={styles.message}>{loadingMessages[messageIndex]}</Text>
          </Animated.View>

          {/* Privacy Note - positioned closer to content */}
          <View style={styles.privacyContainer}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={styles.privacyNote}>
              Your responses are 100% anonymous and encrypted
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  ambientGlow: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    height: '30%',
  },
  ambientGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  circleContainer: {
    width: CIRCLE_SIZE + 40,
    height: CIRCLE_SIZE + 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: CIRCLE_SIZE + 40,
    height: CIRCLE_SIZE + 40,
    borderRadius: (CIRCLE_SIZE + 40) / 2,
    overflow: 'hidden',
  },
  glowRingGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (CIRCLE_SIZE + 40) / 2,
  },
  progressCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressPercent: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    letterSpacing: -2,
  },
  progressSymbol: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  messageContainer: {
    marginTop: 48,
    minHeight: 80,
    paddingHorizontal: 24,
  },
  message: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
  },
  privacyIcon: {
    fontSize: 14,
  },
  privacyNote: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
});
