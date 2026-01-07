import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { ShimmerCTA } from '@/components/ui';

// Brain rewiring benefits
const rewiringBenefits = [
  { icon: 'flash-outline' as const, title: 'Faster Response Control', desc: 'Train your nervous system to delay arousal response' },
  { icon: 'fitness-outline' as const, title: 'Muscle Memory', desc: 'Build automatic control through repetition' },
  { icon: 'sync-outline' as const, title: 'New Neural Pathways', desc: 'Replace old habits with lasting control patterns' },
  { icon: 'shield-checkmark-outline' as const, title: 'Permanent Results', desc: 'Changes become hardwired with consistent practice' },
];

// Timeline stages
const timelineStages = [
  { day: 'Weeks 1-3', title: 'Foundation', desc: 'Build awareness & basic control', progress: 25 },
  { day: 'Weeks 4-6', title: 'Strengthening', desc: 'Deepen neural connections', progress: 50 },
  { day: 'Weeks 7-9', title: 'Advanced Control', desc: 'Master arousal management', progress: 75 },
  { day: 'Weeks 10-12', title: 'Mastery', desc: '90%+ improvement achieved', progress: 100 },
];

// Stats
const scienceStats = [
  { value: '90%+', label: 'Improvement rate' },
  { value: '3', label: 'Weeks to see results' },
  { value: '5x', label: 'Avg. improvement' },
];

// Progress Graph Component with Animation - Clean bar chart style
const ProgressGraph = ({ animate }: { animate: boolean }) => {
  const bar1Height = useSharedValue(0);
  const bar2Height = useSharedValue(0);
  const bar3Height = useSharedValue(0);
  const labelsOpacity = useSharedValue(0);

  useEffect(() => {
    if (animate) {
      bar1Height.value = withDelay(300, withSpring(35, { damping: 12, stiffness: 100 }));
      bar2Height.value = withDelay(500, withSpring(65, { damping: 12, stiffness: 100 }));
      bar3Height.value = withDelay(700, withSpring(95, { damping: 12, stiffness: 100 }));
      labelsOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));
    }
  }, [animate]);

  const bar1Style = useAnimatedStyle(() => ({
    height: `${bar1Height.value}%`,
  }));

  const bar2Style = useAnimatedStyle(() => ({
    height: `${bar2Height.value}%`,
  }));

  const bar3Style = useAnimatedStyle(() => ({
    height: `${bar3Height.value}%`,
  }));

  const labelsStyle = useAnimatedStyle(() => ({
    opacity: labelsOpacity.value,
  }));

  return (
    <View style={styles.graphContainer}>
      <View style={styles.graphCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={styles.graphHeader}>
          <Text style={styles.graphTitle}>Your Control Level Over Time</Text>
          <View style={styles.graphBadge}>
            <Ionicons name="trending-up" size={12} color="#22C55E" />
            <Text style={styles.graphBadgeText}>Projected</Text>
          </View>
        </View>

        {/* Bar Chart */}
        <View style={styles.barChartContainer}>
          {/* Y-axis labels */}
          <View style={styles.yAxisLabels}>
            <Text style={styles.yAxisText}>High</Text>
            <Text style={styles.yAxisText}>Med</Text>
            <Text style={styles.yAxisText}>Low</Text>
          </View>

          {/* Bars */}
          <View style={styles.barsWrapper}>
            {/* Month 1 */}
            <View style={styles.barColumn}>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, styles.barFill1, bar1Style]}>
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
              <Animated.View style={labelsStyle}>
                <Text style={styles.barLabel}>Month 1</Text>
                <Text style={styles.barValue}>35%</Text>
              </Animated.View>
            </View>

            {/* Month 2 */}
            <View style={styles.barColumn}>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, styles.barFill2, bar2Style]}>
                  <LinearGradient
                    colors={['#8B5CF6', '#22C55E']}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
              <Animated.View style={labelsStyle}>
                <Text style={styles.barLabel}>Month 2</Text>
                <Text style={styles.barValue}>65%</Text>
              </Animated.View>
            </View>

            {/* Month 3 */}
            <View style={styles.barColumn}>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, styles.barFill3, bar3Style]}>
                  <LinearGradient
                    colors={['#22C55E', '#16A34A']}
                    style={StyleSheet.absoluteFill}
                  />
                  {/* Glow effect on top bar */}
                  <View style={styles.barGlow} />
                </Animated.View>
              </View>
              <Animated.View style={labelsStyle}>
                <Text style={styles.barLabel}>Month 3</Text>
                <Text style={[styles.barValue, { color: '#22C55E' }]}>90%+</Text>
              </Animated.View>
            </View>
          </View>
        </View>

        {/* Bottom note */}
        <View style={styles.graphNote}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.graphNoteText}>Based on 2.3M+ user results</Text>
        </View>
      </View>
    </View>
  );
};

export default function RewiringBenefitsScreen() {
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(20);
  const graphOpacity = useSharedValue(0);
  const benefitsOpacity = useSharedValue(0);
  const timelineOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);

  // Pulsing animation for the brain icon
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    headerY.value = withDelay(100, withSpring(0, { damping: 15 }));
    graphOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    benefitsOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
    timelineOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
    statsOpacity.value = withDelay(1300, withTiming(1, { duration: 600 }));

    // Pulse animation for brain icon
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const graphStyle = useAnimatedStyle(() => ({
    opacity: graphOpacity.value,
  }));

  const benefitsStyle = useAnimatedStyle(() => ({
    opacity: benefitsOpacity.value,
  }));

  const timelineStyle = useAnimatedStyle(() => ({
    opacity: timelineOpacity.value,
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/social-proof');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow */}
      <View style={styles.ambientGlow}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.12)', 'transparent']}
          style={styles.ambientGlowGradient}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <Animated.View style={[styles.brainIconWrap, pulseStyle]}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.08)']}
                style={styles.brainIconGradient}
              />
              <Ionicons name="fitness" size={32} color={Colors.primary} />
            </Animated.View>

            <View style={styles.badge}>
              <Ionicons name="sparkles" size={14} color={Colors.primary} />
              <Text style={styles.badgeText}>NEUROPLASTICITY SCIENCE</Text>
            </View>

            <Text style={styles.title}>Your brain can be{'\n'}rewired for control</Text>
            <Text style={styles.subtitle}>
              Just like learning to ride a bike, your brain can form new neural pathways for lasting control
            </Text>
          </Animated.View>

          {/* Progress Graph */}
          <Animated.View style={graphStyle}>
            <ProgressGraph animate={true} />
          </Animated.View>

          {/* Key Benefits Grid */}
          <Animated.View style={[styles.benefitsSection, benefitsStyle]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={18} color="#FBBF24" />
              <Text style={styles.sectionTitle}>How Rewiring Works</Text>
            </View>

            <View style={styles.benefitsGrid}>
              {rewiringBenefits.map((benefit, index) => (
                <View key={index} style={styles.benefitCard}>
                  <View style={styles.benefitIconWrap}>
                    <Ionicons name={benefit.icon} size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* 12-Week Timeline */}
          <Animated.View style={[styles.timelineSection, timelineStyle]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={18} color="#22C55E" />
              <Text style={styles.sectionTitle}>Your 90-Day Transformation</Text>
            </View>

            <View style={styles.timelineCard}>
              {timelineStages.map((stage, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      { backgroundColor: index === 2 ? '#22C55E' : Colors.primary }
                    ]} />
                    {index < timelineStages.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <Text style={styles.timelineDay}>{stage.day}</Text>
                      <View style={styles.progressBadge}>
                        <Text style={styles.progressText}>{stage.progress}%</Text>
                      </View>
                    </View>
                    <Text style={styles.timelineTitle}>{stage.title}</Text>
                    <Text style={styles.timelineDesc}>{stage.desc}</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${stage.progress}%` }]}>
                        <LinearGradient
                          colors={['#8B5CF6', '#22C55E']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={StyleSheet.absoluteFill}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Science Stats */}
          <Animated.View style={[styles.statsSection, statsStyle]}>
            <View style={styles.statsCard}>
              <LinearGradient
                colors={['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.03)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.statsHeader}>
                <View style={styles.statsIconWrap}>
                  <Ionicons name="flask" size={22} color="#22C55E" />
                </View>
                <View>
                  <Text style={styles.statsTitle}>Clinically Proven</Text>
                  <Text style={styles.statsSubtitle}>Based on neuroscience research</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                {scienceStats.map((stat, index) => (
                  <View key={index} style={styles.statItem}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Bottom Message */}
          <Animated.View style={[styles.messageSection, statsStyle]}>
            <View style={styles.messageCard}>
              <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
              <Text style={styles.messageText}>
                <Text style={styles.messageHighlight}>The best part?</Text> Once rewired, these changes become permanent. Your new neural pathways are yours for life.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

      </SafeAreaView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <BlurView intensity={30} tint="dark" style={styles.footerBlur}>
          <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
            <View style={styles.footerInner}>
              <ShimmerCTA
                title="See My Personalized Plan"
                icon="arrow-forward"
                onPress={handleContinue}
              />

              <View style={styles.trustBadges}>
                <View style={styles.trustBadge}>
                  <Ionicons name="shield-checkmark" size={12} color={Colors.textMuted} />
                  <Text style={styles.trustText}>Science-backed</Text>
                </View>
                <View style={styles.trustDivider} />
                <View style={styles.trustBadge}>
                  <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                  <Text style={styles.trustText}>First results in 3 weeks</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </BlurView>
      </View>
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
    top: '10%',
    left: '10%',
    right: '10%',
    height: '20%',
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
    paddingBottom: 140,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: 20,
  },
  brainIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  brainIconGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 10,
  },
  graphContainer: {
    marginBottom: 20,
  },
  graphCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  graphTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  graphBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  graphBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#22C55E',
  },
  barChartContainer: {
    flexDirection: 'row',
    height: 140,
    marginBottom: 16,
  },
  yAxisLabels: {
    width: 36,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  yAxisText: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  barsWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 44,
    height: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barFill1: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barFill2: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barFill3: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  barLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
    marginTop: 8,
  },
  barValue: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginTop: 2,
  },
  graphNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  graphNoteText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  benefitsSection: {
    marginBottom: 20,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  benefitCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  benefitIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  benefitTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    lineHeight: 16,
  },
  timelineSection: {
    marginBottom: 20,
  },
  timelineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timelineDay: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  progressBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#22C55E',
  },
  timelineTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 2,
  },
  timelineDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  statsSection: {
    marginBottom: 12,
  },
  statsCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
    overflow: 'hidden',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  statsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  statsSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#22C55E',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 197, 94, 0.1)',
    paddingTop: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#22C55E',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 2,
  },
  messageSection: {
    marginBottom: 8,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.12)',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  messageHighlight: {
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerBlur: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerSafeArea: {
    backgroundColor: 'rgba(26, 26, 36, 0.8)',
  },
  footerInner: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  trustBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 12,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  trustDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
