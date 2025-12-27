import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.65;

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

const PHASE_DURATIONS = {
  inhale: 4000,
  hold: 4000,
  exhale: 8000,
};

const TOTAL_CYCLES = 5;
const SESSION_DURATION = 5 * 60; // 5 minutes in seconds

export default function BreathingExerciseScreen() {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [isActive, setIsActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(0);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(SESSION_DURATION);
  const [isCompleted, setIsCompleted] = useState(false);

  // Animation values
  const breathScale = useSharedValue(0.6);
  const glowOpacity = useSharedValue(0.3);
  const ringProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      default:
        return 'Ready';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return Colors.primary;
      case 'hold':
        return Colors.warning;
      case 'exhale':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  const updatePhase = useCallback((newPhase: BreathPhase) => {
    setPhase(newPhase);
  }, []);

  const runBreathCycle = useCallback(() => {
    // Inhale phase - expand
    updatePhase('inhale');
    setPhaseTimeRemaining(4);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    breathScale.value = withTiming(1, {
      duration: PHASE_DURATIONS.inhale,
      easing: Easing.inOut(Easing.ease),
    });
    glowOpacity.value = withTiming(0.8, {
      duration: PHASE_DURATIONS.inhale,
      easing: Easing.inOut(Easing.ease),
    });

    // Schedule hold phase
    setTimeout(() => {
      updatePhase('hold');
      setPhaseTimeRemaining(4);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Subtle pulse during hold
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        4,
        true
      );
    }, PHASE_DURATIONS.inhale);

    // Schedule exhale phase
    setTimeout(() => {
      updatePhase('exhale');
      setPhaseTimeRemaining(8);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      breathScale.value = withTiming(0.6, {
        duration: PHASE_DURATIONS.exhale,
        easing: Easing.inOut(Easing.ease),
      });
      glowOpacity.value = withTiming(0.3, {
        duration: PHASE_DURATIONS.exhale,
        easing: Easing.inOut(Easing.ease),
      });
    }, PHASE_DURATIONS.inhale + PHASE_DURATIONS.hold);
  }, [breathScale, glowOpacity, pulseScale, updatePhase]);

  // Total session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && totalTimeRemaining > 0) {
      interval = setInterval(() => {
        setTotalTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, totalTimeRemaining]);

  // Phase timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && phaseTimeRemaining > 0) {
      interval = setInterval(() => {
        setPhaseTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phaseTimeRemaining]);

  // Breath cycle loop
  useEffect(() => {
    let cycleTimeout: NodeJS.Timeout;

    if (isActive && !isCompleted) {
      const cycleDuration =
        PHASE_DURATIONS.inhale + PHASE_DURATIONS.hold + PHASE_DURATIONS.exhale;

      runBreathCycle();

      cycleTimeout = setInterval(() => {
        setCurrentCycle((prev) => prev + 1);
        runBreathCycle();
      }, cycleDuration);
    }

    return () => {
      if (cycleTimeout) clearInterval(cycleTimeout);
    };
  }, [isActive, isCompleted, runBreathCycle]);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(true);
    setCurrentCycle(1);
  };

  const handlePause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(false);
    setPhase('idle');
    breathScale.value = withTiming(0.6, { duration: 300 });
    glowOpacity.value = withTiming(0.3, { duration: 300 });
  };

  const handleComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Animated styles
  const breathCircleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breathScale.value * pulseScale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: breathScale.value * 1.3 }],
  }));

  const outerRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(breathScale.value, [0.6, 1], [0.2, 0.5]),
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-down" size={28} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>4-4-8 Breathing</Text>
            <Text style={styles.headerSubtitle}>Deep Relaxation</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Timer Display */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Session Time</Text>
            <Text style={styles.timerValue}>{formatTime(totalTimeRemaining)}</Text>
          </View>

          {/* Breathing Circle */}
          <View style={styles.circleContainer}>
            {/* Outer glow */}
            <Animated.View style={[styles.outerGlow, glowStyle]}>
              <Svg width={CIRCLE_SIZE + 80} height={CIRCLE_SIZE + 80}>
                <Defs>
                  <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.4" />
                    <Stop offset="70%" stopColor={Colors.primary} stopOpacity="0.1" />
                    <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle
                  cx={(CIRCLE_SIZE + 80) / 2}
                  cy={(CIRCLE_SIZE + 80) / 2}
                  r={(CIRCLE_SIZE + 40) / 2}
                  fill="url(#glow)"
                />
              </Svg>
            </Animated.View>

            {/* Outer ring */}
            <Animated.View style={[styles.outerRing, outerRingStyle]} />

            {/* Main breathing circle */}
            <Animated.View style={[styles.breathCircle, breathCircleStyle]}>
              <LinearGradient
                colors={[`${getPhaseColor()}30`, `${getPhaseColor()}10`]}
                style={styles.circleGradient}
              >
                <View style={styles.circleInner}>
                  <Text style={[styles.phaseText, { color: getPhaseColor() }]}>
                    {getPhaseText()}
                  </Text>
                  {isActive && phaseTimeRemaining > 0 && (
                    <Text style={styles.phaseTimer}>{phaseTimeRemaining}</Text>
                  )}
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Cycle Counter */}
          {isActive && (
            <View style={styles.cycleContainer}>
              <Text style={styles.cycleLabel}>Cycle</Text>
              <Text style={styles.cycleValue}>{currentCycle}</Text>
            </View>
          )}

          {/* Instructions */}
          {!isActive && !isCompleted && (
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionRow}>
                <View style={[styles.instructionDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.instructionText}>Inhale for 4 seconds</Text>
              </View>
              <View style={styles.instructionRow}>
                <View style={[styles.instructionDot, { backgroundColor: Colors.warning }]} />
                <Text style={styles.instructionText}>Hold for 4 seconds</Text>
              </View>
              <View style={styles.instructionRow}>
                <View style={[styles.instructionDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.instructionText}>Exhale for 8 seconds</Text>
              </View>
            </View>
          )}

          {/* Completion Message */}
          {isCompleted && (
            <View style={styles.completionContainer}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
              <Text style={styles.completionTitle}>Session Complete</Text>
              <Text style={styles.completionText}>
                Great job! You've completed your breathing exercise.
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Action */}
        <View style={styles.bottomAction}>
          {isCompleted ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleComplete}>
              <Text style={styles.primaryButtonText}>Mark as Complete</Text>
            </TouchableOpacity>
          ) : !isActive ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.buttonGradient}
              >
                <Ionicons name="play" size={24} color={Colors.text} />
                <Text style={styles.primaryButtonText}>Start Session</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePause}>
              <Ionicons name="pause" size={24} color={Colors.text} />
              <Text style={styles.secondaryButtonText}>Pause</Text>
            </TouchableOpacity>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    width: 44,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  circleContainer: {
    width: CIRCLE_SIZE + 80,
    height: CIRCLE_SIZE + 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  outerGlow: {
    position: 'absolute',
    width: CIRCLE_SIZE + 80,
    height: CIRCLE_SIZE + 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: CIRCLE_SIZE + 20,
    height: CIRCLE_SIZE + 20,
    borderRadius: (CIRCLE_SIZE + 20) / 2,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  breathCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: 'hidden',
  },
  circleGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: `${Colors.primary}40`,
  },
  circleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  phaseTimer: {
    fontSize: 64,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  cycleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cycleLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  cycleValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  instructionsContainer: {
    alignItems: 'flex-start',
    gap: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  completionContainer: {
    alignItems: 'center',
    gap: 12,
  },
  completionTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  completionText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bottomAction: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
});
