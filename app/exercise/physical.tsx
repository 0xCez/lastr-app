import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
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
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { getExerciseById, Exercise } from '@/constants/exercises';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.55;

type ExerciseVariant = 'sets-reps-hold' | 'sets-hold' | 'reps-only' | 'hold-only' | 'instructions-only';

function getExerciseVariant(exercise: Exercise): ExerciseVariant {
  const hasSets = exercise.sets !== undefined && exercise.sets > 0;
  const hasReps = exercise.reps !== undefined && exercise.reps > 0;
  const hasHold = exercise.holdTime !== undefined && exercise.holdTime > 0;

  if (hasSets && hasReps && hasHold) return 'sets-reps-hold';
  if (hasSets && hasHold && !hasReps) return 'sets-hold';
  if (hasReps && !hasSets && !hasHold) return 'reps-only';
  if (hasHold && !hasSets && !hasReps) return 'hold-only';
  return 'instructions-only';
}

export default function PhysicalExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [variant, setVariant] = useState<ExerciseVariant>('instructions-only');

  // State for exercise tracking
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [holdTimeRemaining, setHoldTimeRemaining] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalRepsCompleted, setTotalRepsCompleted] = useState(0);

  // Animation values
  const circleProgress = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  // Rest time between sets (30 seconds)
  const REST_TIME = 30;

  useEffect(() => {
    if (id) {
      const foundExercise = getExerciseById(id);
      if (foundExercise) {
        setExercise(foundExercise);
        setVariant(getExerciseVariant(foundExercise));
        if (foundExercise.holdTime) {
          setHoldTimeRemaining(foundExercise.holdTime);
        }
      }
    }
  }, [id]);

  // Hold timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && holdTimeRemaining > 0) {
      interval = setInterval(() => {
        setHoldTimeRemaining((prev) => {
          if (prev <= 1) {
            handleHoldComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isHolding, holdTimeRemaining]);

  // Rest timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimeRemaining > 0) {
      interval = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            handleRestComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeRemaining]);

  // Animate circle progress during hold
  useEffect(() => {
    if (isHolding && exercise?.holdTime) {
      circleProgress.value = withTiming(0, {
        duration: exercise.holdTime * 1000,
        easing: Easing.linear,
      });
      glowOpacity.value = withTiming(0.8, { duration: 300 });
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      circleProgress.value = withTiming(1, { duration: 300 });
      glowOpacity.value = withTiming(0.3, { duration: 300 });
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [isHolding]);

  const handleHoldComplete = useCallback(() => {
    setIsHolding(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (!exercise) return;

    if (variant === 'sets-reps-hold') {
      // Completed one rep
      const newRep = currentRep + 1;
      setCurrentRep(newRep);
      setTotalRepsCompleted((prev) => prev + 1);

      if (newRep >= (exercise.reps || 0)) {
        // Completed all reps in this set
        if (currentSet >= (exercise.sets || 1)) {
          // All sets complete
          setIsCompleted(true);
        } else {
          // Start rest period
          startRest();
        }
      } else {
        // Reset hold timer for next rep
        setHoldTimeRemaining(exercise.holdTime || 0);
      }
    } else if (variant === 'sets-hold') {
      // Completed one hold (one set)
      if (currentSet >= (exercise.sets || 1)) {
        setIsCompleted(true);
      } else {
        startRest();
      }
    } else if (variant === 'hold-only') {
      // Single hold exercise complete
      setIsCompleted(true);
    }
  }, [exercise, variant, currentRep, currentSet]);

  const startRest = () => {
    setIsResting(true);
    setRestTimeRemaining(REST_TIME);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRestComplete = useCallback(() => {
    setIsResting(false);
    if (!exercise) return;

    // Move to next set
    setCurrentSet((prev) => prev + 1);
    setCurrentRep(0);
    setHoldTimeRemaining(exercise.holdTime || 0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [exercise]);

  const handleStartHold = async () => {
    if (!exercise) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsHolding(true);
    setHoldTimeRemaining(exercise.holdTime || 0);
  };

  const handleStopHold = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsHolding(false);
    if (exercise?.holdTime) {
      setHoldTimeRemaining(exercise.holdTime);
    }
    circleProgress.value = withTiming(1, { duration: 300 });
  };

  const handleRepComplete = async () => {
    if (!exercise) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newRep = currentRep + 1;
    setCurrentRep(newRep);
    setTotalRepsCompleted((prev) => prev + 1);

    if (exercise.sets && newRep >= (exercise.reps || 0)) {
      // Completed all reps in this set
      if (currentSet >= exercise.sets) {
        setIsCompleted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        startRest();
      }
    } else if (!exercise.sets && newRep >= (exercise.reps || 0)) {
      // Reps-only variant complete
      setIsCompleted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSkipRest = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleRestComplete();
  };

  const handleComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return Colors.success;
      case 'intermediate': return Colors.warning;
      case 'advanced': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  // Animated styles
  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    opacity: interpolate(circleProgress.value, [0, 1], [1, 0.3]),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: pulseScale.value * 1.2 }],
  }));

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle" size={48} color={Colors.textSecondary} />
          <Text style={styles.notFoundText}>Exercise not found</Text>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderTimerCircle = () => {
    const displayTime = isResting ? restTimeRemaining : holdTimeRemaining;
    const maxTime = isResting ? REST_TIME : (exercise.holdTime || 0);
    const progress = displayTime / maxTime;

    return (
      <View style={styles.circleContainer}>
        {/* Glow effect */}
        <Animated.View style={[styles.outerGlow, glowStyle]}>
          <Svg width={CIRCLE_SIZE + 60} height={CIRCLE_SIZE + 60}>
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={isResting ? Colors.warning : Colors.primary} stopOpacity="0.5" />
                <Stop offset="70%" stopColor={isResting ? Colors.warning : Colors.primary} stopOpacity="0.1" />
                <Stop offset="100%" stopColor={isResting ? Colors.warning : Colors.primary} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle
              cx={(CIRCLE_SIZE + 60) / 2}
              cy={(CIRCLE_SIZE + 60) / 2}
              r={(CIRCLE_SIZE + 30) / 2}
              fill="url(#glow)"
            />
          </Svg>
        </Animated.View>

        {/* Progress ring */}
        <View style={styles.progressRing}>
          <Svg width={CIRCLE_SIZE + 20} height={CIRCLE_SIZE + 20}>
            <Circle
              cx={(CIRCLE_SIZE + 20) / 2}
              cy={(CIRCLE_SIZE + 20) / 2}
              r={(CIRCLE_SIZE + 10) / 2}
              stroke={Colors.cardBorder}
              strokeWidth={3}
              fill="transparent"
            />
            <Circle
              cx={(CIRCLE_SIZE + 20) / 2}
              cy={(CIRCLE_SIZE + 20) / 2}
              r={(CIRCLE_SIZE + 10) / 2}
              stroke={isResting ? Colors.warning : Colors.primary}
              strokeWidth={3}
              fill="transparent"
              strokeDasharray={`${Math.PI * (CIRCLE_SIZE + 10)}`}
              strokeDashoffset={Math.PI * (CIRCLE_SIZE + 10) * (1 - progress)}
              strokeLinecap="round"
              rotation={-90}
              origin={`${(CIRCLE_SIZE + 20) / 2}, ${(CIRCLE_SIZE + 20) / 2}`}
            />
          </Svg>
        </View>

        {/* Main circle */}
        <Animated.View style={[styles.mainCircle, circleAnimatedStyle]}>
          <LinearGradient
            colors={isResting
              ? [`${Colors.warning}20`, `${Colors.warning}08`]
              : [`${Colors.primary}20`, `${Colors.primary}08`]
            }
            style={styles.circleGradient}
          >
            <Text style={styles.circleLabel}>
              {isResting ? 'Rest' : (isHolding ? 'Hold' : 'Ready')}
            </Text>
            <Text style={[styles.circleTimer, { color: isResting ? Colors.warning : Colors.text }]}>
              {formatTime(displayTime)}
            </Text>
            {!isResting && variant !== 'hold-only' && exercise.reps && (
              <Text style={styles.circleReps}>
                Rep {currentRep + 1}/{exercise.reps}
              </Text>
            )}
          </LinearGradient>
        </Animated.View>
      </View>
    );
  };

  const renderRepsCounter = () => (
    <View style={styles.repsContainer}>
      <View style={styles.repsCircle}>
        <Text style={styles.repsCount}>{currentRep}</Text>
        <Text style={styles.repsTotal}>/ {exercise.reps}</Text>
      </View>
      <Text style={styles.repsLabel}>Reps Completed</Text>
    </View>
  );

  const renderSetIndicator = () => {
    if (!exercise.sets) return null;

    return (
      <View style={styles.setsContainer}>
        {Array.from({ length: exercise.sets }, (_, i) => (
          <View
            key={i}
            style={[
              styles.setDot,
              i < currentSet - 1 && styles.setDotCompleted,
              i === currentSet - 1 && styles.setDotActive,
            ]}
          />
        ))}
        <Text style={styles.setLabel}>Set {currentSet}/{exercise.sets}</Text>
      </View>
    );
  };

  const renderControls = () => {
    if (isCompleted) {
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={handleComplete}>
          <LinearGradient
            colors={[Colors.success, '#16A34A']}
            style={styles.buttonGradient}
          >
            <Ionicons name="checkmark-circle" size={24} color={Colors.text} />
            <Text style={styles.primaryButtonText}>Complete Exercise</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    if (isResting) {
      return (
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSkipRest}>
          <Ionicons name="play-skip-forward" size={24} color={Colors.text} />
          <Text style={styles.secondaryButtonText}>Skip Rest</Text>
        </TouchableOpacity>
      );
    }

    if (variant === 'reps-only') {
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={handleRepComplete}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.buttonGradient}
          >
            <Ionicons name="add-circle" size={24} color={Colors.text} />
            <Text style={styles.primaryButtonText}>Complete Rep</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    if (variant === 'instructions-only') {
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={handleComplete}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.buttonGradient}
          >
            <Ionicons name="checkmark-circle" size={24} color={Colors.text} />
            <Text style={styles.primaryButtonText}>Mark as Complete</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    // Timer-based variants
    return (
      <View style={styles.controlsRow}>
        {!isHolding ? (
          <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={handleStartHold}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.buttonGradient}
            >
              <Ionicons name="play" size={24} color={Colors.text} />
              <Text style={styles.primaryButtonText}>Start Hold</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={handleStopHold}>
            <Ionicons name="stop" size={24} color={Colors.text} />
            <Text style={styles.secondaryButtonText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    );
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
            <Text style={styles.headerTitle} numberOfLines={1}>{exercise.name}</Text>
            <View style={styles.headerMeta}>
              <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(exercise.difficulty)}20` }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(exercise.difficulty) }]}>
                  {exercise.difficulty}
                </Text>
              </View>
              <Text style={styles.durationText}>{exercise.duration}</Text>
            </View>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Set Indicator */}
          {renderSetIndicator()}

          {/* Main Content Area */}
          {(variant === 'sets-reps-hold' || variant === 'sets-hold' || variant === 'hold-only') && (
            renderTimerCircle()
          )}

          {variant === 'reps-only' && renderRepsCounter()}

          {/* Exercise Info for instructions-only */}
          {variant === 'instructions-only' && (
            <View style={styles.instructionsOnlyContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="fitness" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
            </View>
          )}

          {/* Stats Row */}
          {variant !== 'instructions-only' && (
            <View style={styles.statsRow}>
              {exercise.sets && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{exercise.sets}</Text>
                  <Text style={styles.statLabel}>Sets</Text>
                </View>
              )}
              {exercise.reps && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{exercise.reps}</Text>
                  <Text style={styles.statLabel}>Reps</Text>
                </View>
              )}
              {exercise.holdTime && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatTime(exercise.holdTime)}</Text>
                  <Text style={styles.statLabel}>Hold</Text>
                </View>
              )}
            </View>
          )}

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {exercise.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          {/* Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips</Text>
            <View style={styles.tipsCard}>
              {exercise.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons name="bulb" size={18} color={Colors.warning} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomAction}>
          {renderControls()}
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
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textTransform: 'capitalize',
  },
  durationText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  backLink: {
    marginTop: 8,
  },
  backLinkText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.primary,
  },
  setsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  setDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.cardBorder,
  },
  setDotActive: {
    backgroundColor: Colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  setDotCompleted: {
    backgroundColor: Colors.success,
  },
  setLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: CIRCLE_SIZE + 60,
    marginBottom: 16,
  },
  outerGlow: {
    position: 'absolute',
    width: CIRCLE_SIZE + 60,
    height: CIRCLE_SIZE + 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
  },
  mainCircle: {
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
    borderColor: `${Colors.primary}30`,
  },
  circleLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  circleTimer: {
    fontSize: 56,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  circleReps: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.primary,
    marginTop: 8,
  },
  repsContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  repsCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: `${Colors.primary}15`,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repsCount: {
    fontSize: 72,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  repsTotal: {
    fontSize: 24,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  repsLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginTop: 16,
  },
  instructionsOnlyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  exerciseDescription: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  instructionNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomAction: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
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
