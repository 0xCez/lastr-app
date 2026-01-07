import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { ShimmerCTA } from '@/components/ui';

// Task type icons and colors
const getTaskMeta = (type: string) => {
  switch (type) {
    case 'exercise':
      return { icon: 'barbell-outline' as const, color: '#8B5CF6', label: 'Exercise' };
    case 'cognitive':
      return { icon: 'bulb-outline' as const, color: '#22C55E', label: 'Mental' };
    case 'supplement':
      return { icon: 'leaf-outline' as const, color: '#F59E0B', label: 'Supplement' };
    default:
      return { icon: 'checkmark-circle-outline' as const, color: Colors.primary, label: 'Task' };
  }
};

export default function TodayScreen() {
  const { dailyTasks, toggleDailyTask, currentStreak, initializeDailyTasks } = useUserStore();

  useEffect(() => {
    initializeDailyTasks();
  }, []);

  const completedCount = dailyTasks.filter((t) => t.completed).length;
  const totalCount = dailyTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  // Get the first uncompleted task for "Start Training" button
  const nextTask = dailyTasks.find(t => !t.completed);

  // Generate dates for the week
  const today = new Date();
  const getWeekDates = () => {
    const dates = [];
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const isToday = date.toDateString() === today.toDateString();
      dates.push({
        day: date.getDate(),
        weekday: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        isToday,
        isPast: date < today && !isToday,
      });
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const progressGlow = useSharedValue(0.3);
  const progressWidth = useSharedValue(progress);

  // Animate progress bar when progress changes
  useEffect(() => {
    progressWidth.value = withTiming(progress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));

    progressGlow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: progressGlow.value,
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleToggleTask = async (taskId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleDailyTask(taskId);
  };

  const handleTaskPress = async (taskId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/exercise/${taskId}`);
  };

  const handleStartTraining = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (nextTask) {
      router.push(`/exercise/${nextTask.id}`);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow */}
      <Animated.View style={[styles.ambientGlow, glowStyle]}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.12)', 'transparent']}
          style={styles.ambientGlowGradient}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            style={styles.header}
            entering={FadeInDown.duration(500).delay(100)}
          >
            <View>
              <Text style={styles.headerSubtitle}>Daily Training</Text>
              <Text style={styles.headerTitle}>Today's Tasks</Text>
            </View>
            <Pressable
              style={styles.streakBadge}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="flame" size={18} color="#EF4444" />
              <Text style={styles.streakText}>{currentStreak || 0}</Text>
            </Pressable>
          </Animated.View>

          {/* Calendar Strip */}
          <Animated.View
            style={styles.calendarCard}
            entering={FadeInDown.duration(500).delay(200)}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.calendarStrip}>
              {weekDates.map((date, index) => (
                <View key={index} style={styles.calendarDay}>
                  <Text style={[
                    styles.calendarWeekday,
                    date.isToday && styles.calendarWeekdayToday,
                    date.isPast && styles.calendarWeekdayPast,
                  ]}>
                    {date.weekday}
                  </Text>
                  <View style={[
                    styles.calendarDateWrap,
                    date.isToday && styles.calendarDateWrapToday,
                    date.isPast && styles.calendarDateWrapPast,
                  ]}>
                    {date.isToday && (
                      <LinearGradient
                        colors={['#8B5CF6', '#7C3AED']}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    {date.isPast ? (
                      <Ionicons name="checkmark" size={16} color="#22C55E" />
                    ) : (
                      <Text style={[
                        styles.calendarDate,
                        date.isToday && styles.calendarDateToday,
                      ]}>
                        {date.day}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Progress Section */}
          <Animated.View
            style={styles.progressCard}
            entering={FadeInDown.duration(500).delay(300)}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.08)', 'rgba(139, 92, 246, 0.02)']}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.progressHeader}>
              <View style={styles.progressTitleRow}>
                <Ionicons name="pulse-outline" size={18} color={Colors.primary} />
                <Text style={styles.progressTitle}>Today's Progress</Text>
              </View>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>{completedCount}/{totalCount}</Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <Animated.View
                style={[styles.progressFill, progressBarStyle]}
              >
                <LinearGradient
                  colors={allCompleted ? ['#22C55E', '#16A34A'] : ['#8B5CF6', '#22C55E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>

            <Text style={styles.progressMessage}>
              {allCompleted
                ? '🎉 All tasks completed! Amazing work!'
                : progress >= 50
                  ? `Great progress! ${totalCount - completedCount} tasks remaining.`
                  : `Let's get started! Complete your daily training.`
              }
            </Text>
          </Animated.View>

          {/* Section Header */}
          <Animated.View
            style={styles.sectionHeader}
            entering={FadeInDown.duration(500).delay(400)}
          >
            <Text style={styles.sectionTitle}>Exercises</Text>
            <View style={styles.sectionBadge}>
              <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.sectionBadgeText}>~15 min</Text>
            </View>
          </Animated.View>

          {/* Tasks List */}
          <View style={styles.tasksList}>
            {dailyTasks.map((task, index) => {
              const meta = getTaskMeta(task.type);
              return (
                <Animated.View
                  key={task.id}
                  entering={FadeInUp.duration(400).delay(450 + index * 80)}
                >
                  <Pressable
                    onPress={() => handleTaskPress(task.id)}
                    style={({ pressed }) => [
                      styles.taskCard,
                      task.completed && styles.taskCardCompleted,
                      pressed && styles.taskCardPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={
                        task.completed
                          ? ['rgba(34, 197, 94, 0.08)', 'rgba(34, 197, 94, 0.02)']
                          : ['rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.01)']
                      }
                      style={StyleSheet.absoluteFill}
                    />

                    {/* Left accent line */}
                    <View style={[styles.taskAccent, { backgroundColor: task.completed ? '#22C55E' : meta.color }]} />

                    {/* Checkbox */}
                    <Pressable
                      onPress={() => handleToggleTask(task.id)}
                      style={styles.checkboxWrap}
                      hitSlop={12}
                    >
                      <View style={[
                        styles.checkbox,
                        task.completed && styles.checkboxChecked,
                        !task.completed && { borderColor: `${meta.color}60` },
                      ]}>
                        {task.completed ? (
                          <LinearGradient
                            colors={['#22C55E', '#16A34A']}
                            style={StyleSheet.absoluteFill}
                          />
                        ) : null}
                        {task.completed && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                    </Pressable>

                    {/* Task Content */}
                    <View style={styles.taskContent}>
                      <View style={styles.taskTopRow}>
                        <View style={[styles.taskTypeBadge, { backgroundColor: `${meta.color}15` }]}>
                          <Ionicons name={meta.icon} size={11} color={meta.color} />
                          <Text style={[styles.taskTypeText, { color: meta.color }]}>{meta.label}</Text>
                        </View>
                      </View>
                      <Text style={[
                        styles.taskName,
                        task.completed && styles.taskNameCompleted,
                      ]}>
                        {task.name}
                      </Text>
                    </View>

                    {/* Arrow */}
                    <View style={styles.taskArrow}>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={task.completed ? '#22C55E' : Colors.textMuted}
                      />
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          {/* Start Training CTA */}
          {!allCompleted && nextTask && (
            <Animated.View
              style={styles.ctaSection}
              entering={FadeInUp.duration(500).delay(800)}
            >
              <ShimmerCTA
                title="Start Training"
                icon="play"
                onPress={handleStartTraining}
              />
              <Text style={styles.ctaHint}>Next: {nextTask.name}</Text>
            </Animated.View>
          )}

          {/* Completed State */}
          {allCompleted && (
            <Animated.View
              style={styles.completedCard}
              entering={FadeInUp.duration(500).delay(800)}
            >
              <LinearGradient
                colors={['rgba(34, 197, 94, 0.12)', 'rgba(34, 197, 94, 0.04)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.completedIconWrap}>
                <LinearGradient
                  colors={['#22C55E', '#16A34A']}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="trophy" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.completedTitle}>Daily Training Complete!</Text>
              <Text style={styles.completedSubtitle}>
                You've completed all {totalCount} exercises. Keep up the streak!
              </Text>
            </Animated.View>
          )}

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
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
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: '5%',
    right: '5%',
    height: '25%',
  },
  ambientGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
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
    marginTop: 8,
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    overflow: 'hidden',
  },
  streakText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#EF4444',
  },
  calendarCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarDay: {
    alignItems: 'center',
    flex: 1,
  },
  calendarDayToday: {},
  calendarWeekday: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  calendarWeekdayToday: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  calendarWeekdayPast: {
    color: '#22C55E',
  },
  calendarDateWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  calendarDateWrapToday: {
    // Gradient applied via LinearGradient
  },
  calendarDateWrapPast: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  calendarDate: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  calendarDateToday: {
    color: '#FFFFFF',
  },
  progressCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    overflow: 'hidden',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  progressBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  progressBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressMessage: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
  tasksList: {
    gap: 10,
    marginBottom: 24,
  },
  taskCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 14,
  },
  taskCardCompleted: {
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },
  taskCardPressed: {
    opacity: 0.8,
  },
  taskAccent: {
    width: 3,
    height: '70%',
    borderRadius: 2,
    marginLeft: 2,
  },
  checkboxWrap: {
    paddingHorizontal: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  checkboxChecked: {
    borderWidth: 0,
  },
  taskContent: {
    flex: 1,
  },
  taskTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  taskTypeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskName: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
  },
  taskNameCompleted: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  taskArrow: {
    marginLeft: 8,
  },
  ctaSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  ctaHint: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 10,
  },
  completedCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    overflow: 'hidden',
  },
  completedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  completedTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginBottom: 6,
  },
  completedSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
