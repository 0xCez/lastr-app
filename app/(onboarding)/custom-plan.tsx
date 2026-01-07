import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { ShimmerCTA } from '@/components/ui';

// Plan stats
const planStats = [
  { value: '5-10', label: 'min/day' },
  { value: '90', label: 'day program' },
  { value: '90%+', label: 'improvement' },
];

// Timeline milestones
const timeline = [
  { week: 'Weeks 1-3', title: 'Foundation', desc: 'Learn awareness & basic techniques', color: '#8B5CF6' },
  { week: 'Weeks 4-6', title: 'Build Control', desc: 'Master breathing & muscle control', color: '#A78BFA' },
  { week: 'Weeks 7-9', title: 'Advanced Training', desc: 'Develop automatic control responses', color: '#7C3AED' },
  { week: 'Weeks 10-12', title: 'Full Mastery', desc: 'Achieve 90%+ lasting control', color: '#22C55E' },
];

// What you'll master
const masteryItems = [
  { icon: 'body-outline' as const, title: 'Pelvic Floor Control', desc: 'Strengthen the muscles that control ejaculation' },
  { icon: 'pulse-outline' as const, title: 'Arousal Awareness', desc: 'Recognize and manage your arousal levels' },
  { icon: 'cloudy-outline' as const, title: 'Mental Techniques', desc: 'Overcome anxiety and stay present' },
  { icon: 'fitness-outline' as const, title: 'Edging Mastery', desc: 'Train your body to delay climax naturally' },
];

// Before/After comparison
const transformations = [
  { before: 'Lasting 1-3 minutes', after: '15+ minutes of control' },
  { before: 'Performance anxiety', after: 'Calm confidence' },
  { before: 'Unpredictable timing', after: 'You decide when' },
  { before: 'Avoiding intimacy', after: 'Looking forward to it' },
];

// Testimonials with specific results
const testimonials = [
  {
    text: "Went from lasting 1-2 minutes to over 15. My confidence is through the roof.",
    result: '10x improvement',
    weeks: '6 weeks',
    name: 'Marcus, 28',
  },
  {
    text: "The daily exercises are quick but effective. Finally feel in control.",
    result: 'Full control',
    weeks: '8 weeks',
    name: 'James, 34',
  },
  {
    text: "My relationship has completely transformed. She noticed the difference immediately.",
    result: 'Life changed',
    weeks: '10 weeks',
    name: 'Alex, 31',
  },
];

// Science facts
const scienceFacts = [
  { icon: 'flask-outline' as const, text: 'Based on clinical research from leading urologists' },
  { icon: 'school-outline' as const, text: 'Developed with certified sex therapists' },
  { icon: 'medal-outline' as const, text: 'Proven effective in peer-reviewed studies' },
];

export default function CustomPlanScreen() {
  const { targetDate, answers } = useOnboardingStore();
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(20);
  const checkmarkScale = useSharedValue(0);
  const planCardOpacity = useSharedValue(0);
  const timelineOpacity = useSharedValue(0);
  const componentsOpacity = useSharedValue(0);
  const testimonialOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  // Dynamic plan focus areas based on answers
  const planFocusAreas = useMemo(() => {
    const areas: { icon: keyof typeof Ionicons.glyphMap; label: string; included: boolean }[] = [];

    // Based on primary concern
    if (answers.primary_concern === 'physical' || answers.primary_concern === 'both') {
      areas.push({ icon: 'body-outline', label: 'Pelvic floor training', included: true });
    }
    if (answers.primary_concern === 'mental' || answers.primary_concern === 'both') {
      areas.push({ icon: 'cloudy-outline', label: 'Anxiety management', included: true });
    }

    // Based on duration
    if (answers.current_duration === '<1' || answers.current_duration === '1-2') {
      areas.push({ icon: 'pulse-outline', label: 'Arousal control techniques', included: true });
    }

    // Always include these core components
    areas.push({ icon: 'fitness-outline', label: 'Daily exercises', included: true });
    areas.push({ icon: 'analytics-outline', label: 'Progress tracking', included: true });
    areas.push({ icon: 'book-outline', label: 'Educational modules', included: true });
    areas.push({ icon: 'notifications-outline', label: 'Smart reminders', included: true });

    return areas.slice(0, 6);
  }, [answers]);

  // Calculate personalized improvement estimate
  const improvementEstimate = useMemo(() => {
    const baseImprovement = 3;
    let multiplier = 1;

    if (answers.current_duration === '<1') multiplier = 2.5;
    else if (answers.current_duration === '1-2') multiplier = 2;
    else if (answers.current_duration === '2-5') multiplier = 1.5;

    return Math.round(baseImprovement * multiplier);
  }, [answers]);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    headerY.value = withDelay(100, withSpring(0, { damping: 15 }));
    checkmarkScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 200 }));
    planCardOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    timelineOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
    componentsOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
    testimonialOpacity.value = withDelay(1300, withTiming(1, { duration: 600 }));
    ctaOpacity.value = withDelay(1600, withTiming(1, { duration: 600 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const planCardStyle = useAnimatedStyle(() => ({
    opacity: planCardOpacity.value,
  }));

  const timelineStyle = useAnimatedStyle(() => ({
    opacity: timelineOpacity.value,
  }));

  const componentsStyle = useAnimatedStyle(() => ({
    opacity: componentsOpacity.value,
  }));

  const testimonialStyle = useAnimatedStyle(() => ({
    opacity: testimonialOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/(onboarding)/paywall');
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
          colors={['rgba(34, 197, 94, 0.12)', 'transparent']}
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
            <Animated.View style={[styles.checkmarkContainer, checkmarkStyle]}>
              <LinearGradient
                colors={['#22C55E', '#16A34A']}
                style={styles.checkmarkGradient}
              />
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </Animated.View>

            <View style={styles.badge}>
              <Ionicons name="sparkles" size={14} color={Colors.primary} />
              <Text style={styles.badgeText}>PERSONALIZED PLAN READY</Text>
            </View>

            <Text style={styles.title}>Your custom plan{'\n'}is ready</Text>
            <Text style={styles.subtitle}>
              Based on your responses, we've created a targeted program just for you
            </Text>
          </Animated.View>

          {/* Your Plan Card */}
          <Animated.View style={[styles.planCard, planCardStyle]}>
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.12)', 'rgba(34, 197, 94, 0.04)']}
              style={styles.planCardGradient}
            >
              <View style={styles.planHeader}>
                <View style={styles.planTitleRow}>
                  <View style={styles.planIconWrap}>
                    <Ionicons name="calendar-outline" size={20} color="#22C55E" />
                  </View>
                  <View>
                    <Text style={styles.planTitle}>Your Target Date</Text>
                    <Text style={styles.planDate}>{targetDate}</Text>
                  </View>
                </View>
                <View style={styles.improvementBadge}>
                  <Text style={styles.improvementValue}>{improvementEstimate}x</Text>
                  <Text style={styles.improvementLabel}>potential</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                {planStats.map((stat, index) => (
                  <View key={index} style={styles.statItem}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Timeline */}
          <Animated.View style={[styles.timelineSection, timelineStyle]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="git-branch-outline" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Your 90-Day Journey</Text>
            </View>

            <View style={styles.timelineCard}>
              {timeline.map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, { backgroundColor: item.color }]} />
                    {index < timeline.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineWeek, { color: item.color }]}>{item.week}</Text>
                    <Text style={styles.timelineTitle}>{item.title}</Text>
                    <Text style={styles.timelineDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* What You'll Master */}
          <Animated.View style={[styles.masterySection, componentsStyle]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy-outline" size={18} color="#FBBF24" />
              <Text style={styles.sectionTitle}>What You'll Master</Text>
            </View>

            <View style={styles.masteryGrid}>
              {masteryItems.map((item, index) => (
                <View key={index} style={styles.masteryCard}>
                  <View style={styles.masteryIconWrap}>
                    <Ionicons name={item.icon} size={22} color={Colors.primary} />
                  </View>
                  <Text style={styles.masteryTitle}>{item.title}</Text>
                  <Text style={styles.masteryDesc}>{item.desc}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Before/After Transformation */}
          <Animated.View style={[styles.transformSection, componentsStyle]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="swap-horizontal-outline" size={18} color="#22C55E" />
              <Text style={styles.sectionTitle}>Your Transformation</Text>
            </View>

            <View style={styles.transformCard}>
              <View style={styles.transformHeader}>
                <Text style={styles.transformLabel}>BEFORE</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
                <Text style={[styles.transformLabel, styles.transformLabelAfter]}>AFTER</Text>
              </View>
              {transformations.map((item, index) => (
                <View key={index} style={styles.transformRow}>
                  <View style={styles.transformBefore}>
                    <Ionicons name="close-circle" size={16} color="#EF4444" />
                    <Text style={styles.transformBeforeText}>{item.before}</Text>
                  </View>
                  <View style={styles.transformAfter}>
                    <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                    <Text style={styles.transformAfterText}>{item.after}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Plan Components */}
          <Animated.View style={[styles.componentsSection, componentsStyle]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="layers-outline" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Your Plan Includes</Text>
            </View>

            <View style={styles.componentsCard}>
              {planFocusAreas.map((area, index) => (
                <View key={index} style={styles.componentItem}>
                  <View style={styles.componentLeft}>
                    <View style={styles.componentIconWrap}>
                      <Ionicons name={area.icon} size={18} color={Colors.primary} />
                    </View>
                    <Text style={styles.componentLabel}>{area.label}</Text>
                  </View>
                  <View style={styles.includedBadge}>
                    <Ionicons name="checkmark" size={14} color="#22C55E" />
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Science-Backed */}
          <Animated.View style={[styles.scienceSection, testimonialStyle]}>
            <View style={styles.scienceCard}>
              <View style={styles.scienceHeader}>
                <View style={styles.scienceIconWrap}>
                  <Ionicons name="flask" size={24} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.scienceTitle}>Science-Backed Method</Text>
                  <Text style={styles.scienceSubtitle}>Clinically validated protocol</Text>
                </View>
              </View>
              {scienceFacts.map((fact, index) => (
                <View key={index} style={styles.scienceRow}>
                  <Ionicons name={fact.icon} size={16} color="#3B82F6" />
                  <Text style={styles.scienceText}>{fact.text}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Testimonials */}
          <Animated.View style={[styles.testimonialSection, testimonialStyle]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubbles-outline" size={18} color="#FBBF24" />
              <Text style={styles.sectionTitle}>Success Stories</Text>
            </View>

            {testimonials.map((testimonial, index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.testimonialStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text key={star} style={styles.star}>★</Text>
                  ))}
                </View>
                <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
                <View style={styles.testimonialFooter}>
                  <Text style={styles.testimonialName}>{testimonial.name}</Text>
                  <View style={styles.testimonialMeta}>
                    <View style={styles.testimonialBadge}>
                      <Ionicons name="trending-up" size={12} color="#22C55E" />
                      <Text style={styles.testimonialResult}>{testimonial.result}</Text>
                    </View>
                    <View style={styles.testimonialBadge}>
                      <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                      <Text style={styles.testimonialWeeks}>{testimonial.weeks}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Stats Bar */}
          <Animated.View style={[styles.socialProofBar, testimonialStyle]}>
            <View style={styles.socialProofItem}>
              <Text style={styles.socialProofValue}>2.3M+</Text>
              <Text style={styles.socialProofLabel}>Men helped</Text>
            </View>
            <View style={styles.socialProofDivider} />
            <View style={styles.socialProofItem}>
              <Text style={styles.socialProofValue}>4.8</Text>
              <Text style={styles.socialProofLabel}>App rating</Text>
            </View>
            <View style={styles.socialProofDivider} />
            <View style={styles.socialProofItem}>
              <Text style={styles.socialProofValue}>90%+</Text>
              <Text style={styles.socialProofLabel}>Improvement</Text>
            </View>
          </Animated.View>

          {/* Guarantee */}
          <Animated.View style={[styles.guaranteeCard, testimonialStyle]}>
            <Ionicons name="shield-checkmark" size={24} color="#22C55E" />
            <Text style={styles.guaranteeText}>
              <Text style={styles.guaranteeHighlight}>100% satisfaction guaranteed</Text>
              {'\n'}If you don't see results, we'll refund you. No questions asked.
            </Text>
          </Animated.View>

          {/* Final Push */}
          <Animated.View style={[styles.finalPush, testimonialStyle]}>
            <Text style={styles.finalPushText}>
              Your personalized plan is waiting.{'\n'}
              <Text style={styles.finalPushHighlight}>Start today, see results in weeks.</Text>
            </Text>
          </Animated.View>
        </ScrollView>

      </SafeAreaView>

      {/* Footer CTA */}
      <Animated.View style={[styles.footer, ctaStyle]}>
        <BlurView intensity={30} tint="dark" style={styles.footerBlur}>
          <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
            <View style={styles.footerInner}>
              <ShimmerCTA
                title="Start My Program"
                icon="arrow-forward"
                onPress={handleContinue}
              />

              <View style={styles.trustBadges}>
                <View style={styles.trustBadge}>
                  <Ionicons name="lock-closed" size={12} color={Colors.textMuted} />
                  <Text style={styles.trustText}>Secure & private</Text>
                </View>
                <View style={styles.trustDivider} />
                <View style={styles.trustBadge}>
                  <Ionicons name="card-outline" size={12} color={Colors.textMuted} />
                  <Text style={styles.trustText}>Cancel anytime</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </BlurView>
      </Animated.View>
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
  checkmarkContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  checkmarkGradient: {
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    marginBottom: 16,
  },
  planCardGradient: {
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitle: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  planDate: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginTop: 2,
  },
  improvementBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  improvementValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#22C55E',
  },
  improvementLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#22C55E',
    marginTop: -2,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 197, 94, 0.15)',
    paddingTop: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  timelineSection: {
    marginBottom: 16,
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
  timelineWeek: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  timelineTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginTop: 2,
  },
  timelineDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  masterySection: {
    marginBottom: 16,
  },
  masteryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  masteryCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  masteryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  masteryTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },
  masteryDesc: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    lineHeight: 16,
  },
  transformSection: {
    marginBottom: 16,
  },
  transformCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  transformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  transformLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#EF4444',
    letterSpacing: 0.5,
    flex: 1,
  },
  transformLabelAfter: {
    color: '#22C55E',
    textAlign: 'right',
  },
  transformRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  transformBefore: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transformBeforeText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    flex: 1,
  },
  transformAfter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'flex-end',
  },
  transformAfterText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
    textAlign: 'right',
  },
  componentsSection: {
    marginBottom: 16,
  },
  componentsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  componentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  componentIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  componentLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
  },
  includedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scienceSection: {
    marginBottom: 16,
  },
  scienceCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  scienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  scienceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scienceTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  scienceSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#3B82F6',
    marginTop: 2,
  },
  scienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  scienceText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    flex: 1,
  },
  testimonialSection: {
    marginBottom: 12,
  },
  testimonialCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.04)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.12)',
    marginBottom: 10,
  },
  testimonialStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 10,
  },
  star: {
    fontSize: 14,
    color: '#FBBF24',
  },
  testimonialText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 12,
  },
  testimonialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testimonialName: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
  testimonialMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  testimonialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  testimonialResult: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#22C55E',
  },
  testimonialWeeks: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
  socialProofBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  socialProofItem: {
    flex: 1,
    alignItems: 'center',
  },
  socialProofValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  socialProofLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 2,
  },
  socialProofDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.12)',
    marginBottom: 12,
  },
  guaranteeText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  guaranteeHighlight: {
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  finalPush: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  finalPushText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  finalPushHighlight: {
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
