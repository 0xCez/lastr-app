import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useUserStore } from '@/store/userStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Progress ring dimensions
const RING_SIZE = 200;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Inner decorative ring
const INNER_RING_STROKE = 2;
const INNER_RING_RADIUS = 70; // Slightly smaller than main ring

// Journey milestones (90-day program)
const journeyMilestones = [
  { day: 1, label: 'Start', icon: 'flag-outline' as const, reached: true },
  { day: 21, label: '3 Weeks', icon: 'trending-up-outline' as const, reached: true },
  { day: 45, label: '6 Weeks', icon: 'fitness-outline' as const, reached: false },
  { day: 90, label: 'Mastery', icon: 'trophy-outline' as const, reached: false },
];

// Quick insights
const getInsights = (controlScore: number, streak: number) => [
  {
    icon: 'pulse-outline' as const,
    label: 'Control Level',
    value: controlScore >= 70 ? 'Strong' : controlScore >= 50 ? 'Building' : 'Developing',
    color: controlScore >= 70 ? '#22C55E' : controlScore >= 50 ? '#F59E0B' : '#8B5CF6',
  },
  {
    icon: 'flame-outline' as const,
    label: 'Streak Status',
    value: streak >= 7 ? 'On Fire!' : streak >= 3 ? 'Growing' : 'Just Started',
    color: streak >= 7 ? '#EF4444' : streak >= 3 ? '#F59E0B' : '#8B5CF6',
  },
];

export default function DashboardScreen() {
  const {
    controlScore,
    currentStreak,
    dailyTasks,
    initializeDailyTasks,
  } = useUserStore();

  // Calculate today's progress
  const completedToday = dailyTasks.filter(t => t.completed).length;
  const totalTasks = dailyTasks.length;
  const todayProgress = totalTasks > 0 ? (completedToday / totalTasks) * 100 : 0;
  const allCompleted = completedToday === totalTasks && totalTasks > 0;

  // Get the first uncompleted task for "Start Training" button
  const nextTask = dailyTasks.find(t => !t.completed);

  // Current day in journey (mock - would be calculated from start date)
  const currentDay = Math.min(currentStreak + 1, 90);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(20);
  const ringProgress = useSharedValue(0);
  const ringGlow = useSharedValue(0.3);
  const scoreOpacity = useSharedValue(0);
  const scoreScale = useSharedValue(0.8);
  const statsOpacity = useSharedValue(0);
  const todayCardOpacity = useSharedValue(0);
  const todayCardY = useSharedValue(20);
  const journeyOpacity = useSharedValue(0);
  const insightsOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    initializeDailyTasks();

    // Staggered entrance animations
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    headerY.value = withDelay(100, withSpring(0, { damping: 15 }));

    scoreOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    scoreScale.value = withDelay(300, withSpring(1, { damping: 12 }));

    ringProgress.value = withDelay(500, withTiming(controlScore / 100, {
      duration: 1200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }));

    statsOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    todayCardOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    todayCardY.value = withDelay(1000, withSpring(0, { damping: 15 }));
    journeyOpacity.value = withDelay(1200, withTiming(1, { duration: 500 }));
    insightsOpacity.value = withDelay(1400, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(1600, withTiming(1, { duration: 500 }));

    // Continuous glow pulse
    ringGlow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Subtle pulse for CTA
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const scoreContainerStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ scale: scoreScale.value }],
  }));

  const ringGlowStyle = useAnimatedStyle(() => ({
    opacity: ringGlow.value,
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  const todayCardStyle = useAnimatedStyle(() => ({
    opacity: todayCardOpacity.value,
    transform: [{ translateY: todayCardY.value }],
  }));

  const journeyStyle = useAnimatedStyle(() => ({
    opacity: journeyOpacity.value,
  }));

  const insightsStyle = useAnimatedStyle(() => ({
    opacity: insightsOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const ctaButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  // Animated props for the progress ring
  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - ringProgress.value),
  }));

  const handleStartExercise = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    ctaScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      ctaScale.value = withSpring(1, { damping: 15, stiffness: 400 });
      // If there's a next task, go directly to it; otherwise go to today's list
      if (nextTask) {
        router.push(`/exercise/${nextTask.id}`);
      } else {
        router.push('/(tabs)/today');
      }
    }, 120);
  };

  const insights = getInsights(controlScore, currentStreak);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <View style={styles.headerLeft}>
              <View>
                <Text style={styles.greeting}>Welcome back</Text>
                <Text style={styles.headerTitle}>Dashboard</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Pressable
                style={styles.headerButton}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Ionicons name="stats-chart-outline" size={20} color={Colors.textSecondary} />
              </Pressable>
              <Pressable
                style={styles.headerButton}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Hero Score Section */}
          <Animated.View style={[styles.heroSection, scoreContainerStyle]}>
            {/* Progress Ring */}
            <View style={styles.ringWrapper}>
                {/* Outer glow */}
                <Animated.View style={[styles.ringGlow, ringGlowStyle]}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0.1)', 'transparent']}
                    style={styles.ringGlowGradient}
                  />
                </Animated.View>

                <View style={styles.ringContainer}>
                  <Svg width={RING_SIZE} height={RING_SIZE}>
                    <Defs>
                      <SvgGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#8B5CF6" />
                        <Stop offset="100%" stopColor="#22C55E" />
                      </SvgGradient>
                      <SvgGradient id="innerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
                        <Stop offset="100%" stopColor="rgba(34, 197, 94, 0.3)" />
                      </SvgGradient>
                    </Defs>

                    {/* Outer background ring */}
                    <Circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={RING_RADIUS}
                      stroke="rgba(255, 255, 255, 0.06)"
                      strokeWidth={RING_STROKE}
                      fill="transparent"
                    />

                    {/* Inner decorative ring */}
                    <Circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={INNER_RING_RADIUS}
                      stroke="url(#innerRingGradient)"
                      strokeWidth={INNER_RING_STROKE}
                      fill="transparent"
                      strokeDasharray="8 4"
                    />

                    {/* Progress ring */}
                    <AnimatedCircle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={RING_RADIUS}
                      stroke="url(#ringGradient)"
                      strokeWidth={RING_STROKE}
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      animatedProps={animatedCircleProps}
                      transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                    />
                  </Svg>

                  {/* Center content */}
                  <View style={styles.ringCenter}>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreValue}>{controlScore}</Text>
                      <Text style={styles.scorePercent}>%</Text>
                    </View>
                    <Text style={styles.scoreLabel}>Control Score</Text>
                  </View>
                </View>
            </View>
          </Animated.View>

          {/* Quick Stats Row */}
          <Animated.View style={[styles.statsRow, statsStyle]}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.12)', 'rgba(239, 68, 68, 0.04)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.statIconWrap}>
                <Ionicons name="flame" size={20} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>{currentStreak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.12)', 'rgba(139, 92, 246, 0.04)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.statIconWrap}>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{currentDay}</Text>
              <Text style={styles.statLabel}>Day of 90</Text>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(34, 197, 94, 0.12)', 'rgba(34, 197, 94, 0.04)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.statIconWrap}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              </View>
              <Text style={styles.statValue}>{completedToday}</Text>
              <Text style={styles.statLabel}>Done Today</Text>
            </View>
          </Animated.View>

          {/* Today's Progress Card */}
          <Animated.View style={[styles.todayCard, todayCardStyle]}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.03)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.todayHeader}>
              <View style={styles.todayTitleRow}>
                <Ionicons name="today-outline" size={20} color={Colors.primary} />
                <Text style={styles.todayTitle}>Today's Training</Text>
              </View>
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>{completedToday}/{totalTasks}</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.todayProgressTrack}>
              <Animated.View
                style={[
                  styles.todayProgressFill,
                  { width: `${todayProgress}%` }
                ]}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#22C55E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>

            <Text style={styles.todayMessage}>
              {todayProgress === 100
                ? '🎉 All exercises completed! Great work!'
                : todayProgress >= 50
                  ? `Keep going! ${totalTasks - completedToday} exercises left.`
                  : `Start your daily training to build control.`
              }
            </Text>

            <Pressable
              style={styles.todayButton}
              onPress={() => router.push('/(tabs)/today')}
            >
              <Text style={styles.todayButtonText}>
                {todayProgress === 100 ? 'View Completed' : 'Continue Training'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
            </Pressable>
          </Animated.View>

          {/* Journey Timeline */}
          <Animated.View style={[styles.journeySection, journeyStyle]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="map-outline" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Your 90-Day Journey</Text>
            </View>

            <View style={styles.journeyCard}>
              <View style={styles.journeyTimeline}>
                {journeyMilestones.map((milestone, index) => (
                  <View key={index} style={styles.milestoneItem}>
                    <View style={[
                      styles.milestoneDot,
                      milestone.reached && styles.milestoneDotReached,
                      currentDay >= milestone.day && styles.milestoneDotCurrent,
                    ]}>
                      <Ionicons
                        name={milestone.icon}
                        size={14}
                        color={milestone.reached ? '#FFFFFF' : Colors.textMuted}
                      />
                    </View>
                    {index < journeyMilestones.length - 1 && (
                      <View style={[
                        styles.milestoneLine,
                        milestone.reached && styles.milestoneLineReached,
                      ]} />
                    )}
                    <Text style={[
                      styles.milestoneLabel,
                      milestone.reached && styles.milestoneLabelReached,
                    ]}>{milestone.label}</Text>
                    <Text style={styles.milestoneDay}>Day {milestone.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Insights */}
          <Animated.View style={[styles.insightsSection, insightsStyle]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics-outline" size={18} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Quick Insights</Text>
            </View>

            <View style={styles.insightsRow}>
              {insights.map((insight, index) => (
                <View key={index} style={styles.insightCard}>
                  <View style={[styles.insightIconWrap, { backgroundColor: `${insight.color}20` }]}>
                    <Ionicons name={insight.icon} size={20} color={insight.color} />
                  </View>
                  <Text style={styles.insightLabel}>{insight.label}</Text>
                  <Text style={[styles.insightValue, { color: insight.color }]}>{insight.value}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Motivation Card */}
          <Animated.View style={[styles.motivationCard, insightsStyle]}>
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.03)']}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="sparkles" size={24} color="#22C55E" />
            <View style={styles.motivationContent}>
              <Text style={styles.motivationText}>
                {currentStreak >= 7
                  ? "You're on fire! Keep the momentum going."
                  : currentStreak >= 3
                    ? "Building a great streak! Don't break it."
                    : "Start your journey today. Consistency is key."
                }
              </Text>
            </View>
          </Animated.View>

          {/* CTA Button */}
          <Animated.View style={[styles.ctaSection, ctaStyle]}>
            <AnimatedPressable
              onPress={handleStartExercise}
              style={[styles.ctaButton, ctaButtonStyle]}
            >
              <LinearGradient
                colors={allCompleted ? ['#22C55E', '#16A34A'] : ['#8B5CF6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Ionicons
                  name={allCompleted ? 'checkmark-circle' : 'play'}
                  size={22}
                  color="#FFFFFF"
                />
                <Text style={styles.ctaText}>
                  {allCompleted ? 'All Tasks Complete!' : 'Start Today\'s Training'}
                </Text>
              </LinearGradient>
            </AnimatedPressable>
          </Animated.View>

          {/* Bottom padding */}
          <View style={{ height: 20 }} />
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 32,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  greeting: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    letterSpacing: -0.3,
    marginTop: 1,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringGlow: {
    position: 'absolute',
    width: RING_SIZE + 40,
    height: RING_SIZE + 40,
    borderRadius: (RING_SIZE + 40) / 2,
  },
  ringGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (RING_SIZE + 40) / 2,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    letterSpacing: -2,
  },
  scorePercent: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textMuted,
    marginLeft: 2,
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginTop: -2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 2,
  },
  todayCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  todayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  todayBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  todayBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  todayProgressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  todayProgressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  todayMessage: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingVertical: 12,
    borderRadius: 12,
  },
  todayButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  journeySection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  journeyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  journeyTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestoneItem: {
    alignItems: 'center',
    flex: 1,
  },
  milestoneDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  milestoneDotReached: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  milestoneDotCurrent: {
    borderColor: '#22C55E',
    borderWidth: 2,
  },
  milestoneLine: {
    position: 'absolute',
    top: 15,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  milestoneLineReached: {
    backgroundColor: Colors.primary,
  },
  milestoneLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
    marginTop: 8,
  },
  milestoneLabelReached: {
    color: Colors.text,
  },
  milestoneDay: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 2,
  },
  insightsSection: {
    marginBottom: 16,
  },
  insightsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  insightIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  insightLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  motivationContent: {
    flex: 1,
  },
  motivationText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
    lineHeight: 20,
  },
  ctaSection: {
    marginBottom: 8,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
});
