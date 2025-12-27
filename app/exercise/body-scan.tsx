import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolateColor,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BodyPart {
  id: string;
  name: string;
  instruction: string;
  duration: number; // seconds
}

const BODY_PARTS: BodyPart[] = [
  {
    id: 'feet',
    name: 'Feet & Legs',
    instruction: 'Notice tension in your feet and legs. Wiggle your toes, then let them relax.',
    duration: 20,
  },
  {
    id: 'pelvis',
    name: 'Pelvis & Hips',
    instruction: 'Breathe into your pelvic area. Release any holding or tension in your hips.',
    duration: 30,
  },
  {
    id: 'core',
    name: 'Core & Chest',
    instruction: 'Let your belly soften. Notice your heartbeat and let your chest expand freely.',
    duration: 25,
  },
  {
    id: 'upper',
    name: 'Arms & Shoulders',
    instruction: 'Unclench your hands. Drop your shoulders away from your ears.',
    duration: 25,
  },
  {
    id: 'head',
    name: 'Face & Head',
    instruction: 'Soften your jaw, relax your forehead. Let your eyes rest gently.',
    duration: 20,
  },
  {
    id: 'whole',
    name: 'Whole Body',
    instruction: 'Feel your entire body as one. Rest in complete relaxation.',
    duration: 30,
  },
];

const TOTAL_DURATION = BODY_PARTS.reduce((sum, part) => sum + part.duration, 0);

export default function BodyScanScreen() {
  const [isActive, setIsActive] = useState(false);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [partTimeRemaining, setPartTimeRemaining] = useState(BODY_PARTS[0].duration);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(TOTAL_DURATION);
  const [isCompleted, setIsCompleted] = useState(false);

  // Animation values
  const pulseOpacity = useSharedValue(0.5);
  const progressWidth = useSharedValue(0);

  const currentPart = BODY_PARTS[currentPartIndex];

  // Pulsing animation for current body part indicator
  useEffect(() => {
    if (isActive) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.5, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulseOpacity.value = withTiming(0.5, { duration: 300 });
    }
  }, [isActive, pulseOpacity]);

  // Part timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && partTimeRemaining > 0) {
      interval = setInterval(() => {
        setPartTimeRemaining((prev) => {
          if (prev <= 1) {
            // Move to next body part
            if (currentPartIndex < BODY_PARTS.length - 1) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCurrentPartIndex((prevIndex) => {
                const nextIndex = prevIndex + 1;
                setPartTimeRemaining(BODY_PARTS[nextIndex].duration);
                return nextIndex;
              });
            } else {
              // Exercise complete
              setIsActive(false);
              setIsCompleted(true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, partTimeRemaining, currentPartIndex]);

  // Total timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && totalTimeRemaining > 0) {
      interval = setInterval(() => {
        setTotalTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, totalTimeRemaining]);

  // Update progress bar
  useEffect(() => {
    const progress = ((TOTAL_DURATION - totalTimeRemaining) / TOTAL_DURATION) * 100;
    progressWidth.value = withTiming(progress, { duration: 500 });
  }, [totalTimeRemaining, progressWidth]);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(true);
  };

  const handlePause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(false);
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

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const getBodyPartIcon = (id: string) => {
    switch (id) {
      case 'feet':
        return 'footsteps';
      case 'calves':
      case 'thighs':
        return 'body';
      case 'pelvis':
        return 'fitness';
      case 'abdomen':
      case 'chest':
        return 'heart';
      case 'hands':
        return 'hand-left';
      case 'shoulders':
        return 'body';
      case 'face':
        return 'happy';
      case 'whole':
        return 'man';
      default:
        return 'body';
    }
  };

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
            <Text style={styles.headerTitle}>Body Scan</Text>
            <Text style={styles.headerSubtitle}>Progressive Relaxation</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Timer & Progress */}
          <View style={styles.progressSection}>
            <View style={styles.timerRow}>
              <Text style={styles.timerLabel}>Time Remaining</Text>
              <Text style={styles.timerValue}>{formatTime(totalTimeRemaining)}</Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>
            <Text style={styles.progressText}>
              {currentPartIndex + 1} of {BODY_PARTS.length} areas
            </Text>
          </View>

          {/* Current Body Part Card */}
          <View style={styles.currentPartCard}>
            <LinearGradient
              colors={[`${Colors.primary}15`, `${Colors.primary}05`]}
              style={styles.currentPartGradient}
            >
              {/* Animated icon */}
              <Animated.View style={[styles.iconWrapper, pulseStyle]}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name={getBodyPartIcon(currentPart.id) as any}
                    size={40}
                    color={Colors.primary}
                  />
                </View>
              </Animated.View>

              {/* Part name */}
              <Text style={styles.currentPartName}>{currentPart.name}</Text>

              {/* Timer for this part */}
              {isActive && (
                <Text style={styles.partTimer}>{partTimeRemaining}s</Text>
              )}

              {/* Instruction */}
              <Text style={styles.currentPartInstruction}>
                {currentPart.instruction}
              </Text>
            </LinearGradient>
          </View>

          {/* Body Parts List */}
          <View style={styles.partsListSection}>
            <Text style={styles.sectionTitle}>Session Progress</Text>
            {BODY_PARTS.map((part, index) => {
              const isCompleted = index < currentPartIndex;
              const isCurrent = index === currentPartIndex;
              const isPending = index > currentPartIndex;

              return (
                <View
                  key={part.id}
                  style={[
                    styles.partItem,
                    isCurrent && styles.partItemCurrent,
                  ]}
                >
                  <View
                    style={[
                      styles.partIndicator,
                      isCompleted && styles.partIndicatorCompleted,
                      isCurrent && styles.partIndicatorCurrent,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={14} color={Colors.background} />
                    ) : (
                      <Text
                        style={[
                          styles.partNumber,
                          isCurrent && styles.partNumberCurrent,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.partName,
                      isCompleted && styles.partNameCompleted,
                      isCurrent && styles.partNameCurrent,
                    ]}
                  >
                    {part.name}
                  </Text>
                  <Text style={styles.partDuration}>{part.duration}s</Text>
                </View>
              );
            })}
          </View>

          {/* Tips Section */}
          {!isActive && !isCompleted && (
            <View style={styles.tipsSection}>
              <Text style={styles.sectionTitle}>Tips</Text>
              <View style={styles.tipCard}>
                <View style={styles.tipRow}>
                  <Ionicons name="bulb" size={18} color={Colors.warning} />
                  <Text style={styles.tipText}>Lie down in a comfortable position</Text>
                </View>
                <View style={styles.tipRow}>
                  <Ionicons name="bulb" size={18} color={Colors.warning} />
                  <Text style={styles.tipText}>Close your eyes and breathe deeply</Text>
                </View>
                <View style={styles.tipRow}>
                  <Ionicons name="bulb" size={18} color={Colors.warning} />
                  <Text style={styles.tipText}>Don't try to change anything, just observe</Text>
                </View>
              </View>
            </View>
          )}

          {/* Completion */}
          {isCompleted && (
            <View style={styles.completionSection}>
              <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
              <Text style={styles.completionTitle}>Session Complete</Text>
              <Text style={styles.completionText}>
                You've completed your body scan relaxation. Notice how your body feels now compared to when you started.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomAction}>
          {isCompleted ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleComplete}>
              <LinearGradient
                colors={[Colors.success, Colors.success]}
                style={styles.buttonGradient}
              >
                <Ionicons name="checkmark-circle" size={24} color={Colors.text} />
                <Text style={styles.primaryButtonText}>Mark as Complete</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : !isActive ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.buttonGradient}
              >
                <Ionicons name="play" size={24} color={Colors.text} />
                <Text style={styles.primaryButtonText}>
                  {currentPartIndex > 0 ? 'Resume' : 'Start Session'}
                </Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressSection: {
    marginBottom: 24,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timerLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  timerValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.card,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  currentPartCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  currentPartGradient: {
    padding: 24,
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${Colors.primary}40`,
  },
  currentPartName: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginBottom: 8,
  },
  partTimer: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  currentPartInstruction: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  partsListSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 16,
  },
  partItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.card,
  },
  partItemCurrent: {
    backgroundColor: `${Colors.primary}15`,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  partIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partIndicatorCompleted: {
    backgroundColor: Colors.success,
  },
  partIndicatorCurrent: {
    backgroundColor: Colors.primary,
  },
  partNumber: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textMuted,
  },
  partNumberCurrent: {
    color: Colors.text,
  },
  partName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  partNameCompleted: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  partNameCurrent: {
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  partDuration: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  completionSection: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
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
    lineHeight: 24,
  },
  bottomAction: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 10,
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
