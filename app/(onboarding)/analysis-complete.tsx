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
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { ShimmerCTA } from '@/components/ui';


// All possible risk factors mapped to answer conditions
interface RiskFactor {
  id: string;
  label: string;
  severity: 'high' | 'medium' | 'low';
  icon: keyof typeof Ionicons.glyphMap;
}

// Recovery stats
const recoveryStats = [
  { value: '94%', label: 'Success rate' },
  { value: '3', label: 'Weeks to results' },
  { value: '2.3M+', label: 'Men helped' },
];

export default function AnalysisCompleteScreen() {
  const { analysisScore, answers } = useOnboardingStore();
  const averageScore = 72; // Clinical baseline
  // analysisScore is now the direct control score (15-70, higher = better)
  const userControlScore = analysisScore;

  // Generate dynamic risk factors based on user answers
  const riskFactors = useMemo((): RiskFactor[] => {
    const factors: RiskFactor[] = [];

    // Duration-based risk
    if (answers.current_duration === '<1') {
      factors.push({
        id: 'arousal',
        label: 'Rapid arousal response',
        severity: 'high',
        icon: 'flash-outline',
      });
    } else if (answers.current_duration === '1-2') {
      factors.push({
        id: 'arousal',
        label: 'Elevated arousal sensitivity',
        severity: 'medium',
        icon: 'flash-outline',
      });
    }

    // Frequency-based risk
    if (answers.frequency === 'always') {
      factors.push({
        id: 'pattern',
        label: 'Conditioned response pattern',
        severity: 'high',
        icon: 'repeat-outline',
      });
    } else if (answers.frequency === 'often') {
      factors.push({
        id: 'pattern',
        label: 'Habitual response pattern',
        severity: 'medium',
        icon: 'repeat-outline',
      });
    }

    // Confidence/anxiety impact
    if (answers.confidence_impact && answers.confidence_impact >= 7) {
      factors.push({
        id: 'anxiety',
        label: 'Performance anxiety cycle',
        severity: 'high',
        icon: 'pulse-outline',
      });
    } else if (answers.confidence_impact && answers.confidence_impact >= 4) {
      factors.push({
        id: 'anxiety',
        label: 'Mild anxiety response',
        severity: 'medium',
        icon: 'pulse-outline',
      });
    }

    // Primary concern based
    if (answers.primary_concern === 'mental' || answers.primary_concern === 'both') {
      factors.push({
        id: 'mental',
        label: 'Psychological triggers',
        severity: answers.primary_concern === 'mental' ? 'high' : 'medium',
        icon: 'cloudy-outline',
      });
    }

    if (answers.primary_concern === 'physical' || answers.primary_concern === 'both') {
      factors.push({
        id: 'physical',
        label: 'Neurological sensitivity',
        severity: answers.primary_concern === 'physical' ? 'high' : 'medium',
        icon: 'body-outline',
      });
    }

    // Duration of issue
    if (answers.duration_issue === '3+' || answers.duration_issue === 'always') {
      factors.push({
        id: 'chronic',
        label: 'Deeply ingrained habit loops',
        severity: 'high',
        icon: 'time-outline',
      });
    }

    // Return top 3 factors, prioritizing high severity
    return factors
      .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .slice(0, 3);
  }, [answers]);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(20);
  const badgePulse = useSharedValue(1);
  const checkmarkRotate = useSharedValue(0);
  const scoreOpacity = useSharedValue(0);
  const scoreScale = useSharedValue(0.8);
  const comparisonOpacity = useSharedValue(0);
  const factorsOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const messageOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const userBarWidth = useSharedValue(0);
  const avgBarWidth = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    headerY.value = withDelay(100, withSpring(0, { damping: 15 }));
    // Badge pulse animation
    badgePulse.value = withDelay(600, withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));
    // Checkmark rotation
    checkmarkRotate.value = withDelay(300, withSpring(360, { damping: 12, stiffness: 80 }));
    scoreOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    scoreScale.value = withDelay(400, withSpring(1, { damping: 12 }));
    comparisonOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
    userBarWidth.value = withDelay(900, withTiming(userControlScore, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }));
    avgBarWidth.value = withDelay(1100, withTiming(averageScore, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }));
    factorsOpacity.value = withDelay(1300, withTiming(1, { duration: 600 }));
    statsOpacity.value = withDelay(1600, withTiming(1, { duration: 600 }));
    messageOpacity.value = withDelay(1900, withTiming(1, { duration: 600 }));
    ctaOpacity.value = withDelay(2200, withTiming(1, { duration: 600 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgePulse.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${checkmarkRotate.value}deg` }],
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ scale: scoreScale.value }],
  }));

  const comparisonStyle = useAnimatedStyle(() => ({
    opacity: comparisonOpacity.value,
  }));

  const userBarStyle = useAnimatedStyle(() => ({
    width: `${userBarWidth.value}%`,
  }));

  const avgBarStyle = useAnimatedStyle(() => ({
    width: `${avgBarWidth.value}%`,
  }));

  const factorsStyle = useAnimatedStyle(() => ({
    opacity: factorsOpacity.value,
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/(onboarding)/symptoms');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      default: return '#22C55E';
    }
  };

  // Coherent score status - matches the score thresholds
  const getScoreStatus = () => {
    if (userControlScore <= 30) return { label: 'Critical', color: '#EF4444' };
    if (userControlScore <= 50) return { label: 'Low', color: '#F97316' };
    if (userControlScore <= 70) return { label: 'Below Average', color: '#F59E0B' };
    return { label: 'Fair', color: '#22C55E' };
  };

  const status = getScoreStatus();
  const difference = averageScore - userControlScore;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <Animated.View style={[styles.badge, badgeStyle]}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.badgeGradient}
              >
                <View style={styles.badgeIconWrap}>
                  <Animated.View style={checkmarkStyle}>
                    <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                  </Animated.View>
                </View>
                <Text style={styles.badgeText}>ANALYSIS COMPLETE</Text>
              </LinearGradient>
            </Animated.View>
            <Text style={styles.title}>Your Results Are In</Text>
            <Text style={styles.subtitle}>
              We've identified the key patterns affecting your control
            </Text>
          </Animated.View>

          {/* Score Card */}
          <Animated.View style={[styles.scoreCard, scoreStyle]}>
            <LinearGradient
              colors={[`${status.color}18`, `${status.color}08`]}
              style={styles.scoreCardGradient}
            >
              <View style={styles.scoreHeader}>
                <Ionicons name="analytics-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.scoreLabel}>Control Score</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>

              <View style={styles.scoreMainRow}>
                <Text style={[styles.scoreValue, { color: status.color }]}>{userControlScore}</Text>
                <Text style={styles.scoreUnit}>/100</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Comparison Section */}
          <Animated.View style={[styles.comparisonSection, comparisonStyle]}>
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>How You Compare</Text>

              {/* User bar */}
              <View style={styles.barContainer}>
                <View style={styles.barLabelRow}>
                  <View style={styles.barLabelWithIcon}>
                    <View style={[styles.barDot, { backgroundColor: status.color }]} />
                    <Text style={styles.barLabel}>Your score</Text>
                  </View>
                  <Text style={[styles.barValue, { color: status.color }]}>{userControlScore}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <Animated.View style={[styles.barFill, userBarStyle]}>
                    <LinearGradient
                      colors={[status.color, status.color]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.barGradient}
                    />
                  </Animated.View>
                </View>
              </View>

              {/* Average bar */}
              <View style={styles.barContainer}>
                <View style={styles.barLabelRow}>
                  <View style={styles.barLabelWithIcon}>
                    <View style={[styles.barDot, { backgroundColor: '#22C55E' }]} />
                    <Text style={styles.barLabel}>Average male</Text>
                  </View>
                  <Text style={[styles.barValue, { color: '#22C55E' }]}>{averageScore}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <Animated.View style={[styles.barFill, avgBarStyle]}>
                    <LinearGradient
                      colors={['#22C55E', '#16A34A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.barGradient}
                    />
                  </Animated.View>
                </View>
              </View>

              {difference > 0 && (
                <View style={styles.differenceNote}>
                  <Ionicons name="arrow-down" size={14} color="#EF4444" />
                  <Text style={styles.differenceText}>
                    <Text style={styles.differenceHighlight}>{difference}% below</Text> the average male
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Risk Factors */}
          {riskFactors.length > 0 && (
            <Animated.View style={[styles.factorsSection, factorsStyle]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="warning-outline" size={18} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Your Risk Factors</Text>
              </View>

              <View style={styles.factorsList}>
                {riskFactors.map((factor) => (
                  <View key={factor.id} style={styles.factorItem}>
                    <View style={styles.factorLeft}>
                      <View style={[styles.factorIconWrap, { backgroundColor: `${getSeverityColor(factor.severity)}15` }]}>
                        <Ionicons name={factor.icon} size={18} color={getSeverityColor(factor.severity)} />
                      </View>
                      <Text style={styles.factorLabel}>{factor.label}</Text>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: `${getSeverityColor(factor.severity)}15` }]}>
                      <Text style={[styles.severityText, { color: getSeverityColor(factor.severity) }]}>
                        {factor.severity}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Science-Based Method + Stats */}
          <Animated.View style={[styles.methodSection, statsStyle]}>
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.08)', 'rgba(34, 197, 94, 0.02)']}
              style={styles.methodCard}
            >
              <View style={styles.methodHeader}>
                <View style={styles.methodIconWrap}>
                  <Ionicons name="flask-outline" size={22} color="#22C55E" />
                </View>
                <View style={styles.methodTitleWrap}>
                  <Text style={styles.methodTitle}>Science-Based Method</Text>
                  <Text style={styles.methodSubtitle}>Clinically validated protocol</Text>
                </View>
              </View>

              <Text style={styles.methodDescription}>
                Our method combines neuromuscular training, cognitive behavioral techniques, and biofeedback exercises developed with leading urologists and sex therapists.
              </Text>

              <View style={styles.statsRow}>
                {recoveryStats.map((stat, index) => (
                  <View key={index} style={styles.statItem}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Hope Message */}
          <Animated.View style={[styles.messageSection, messageStyle]}>
            <View style={styles.messageCard}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              <Text style={styles.messageText}>
                These patterns are <Text style={styles.messageHighlight}>100% reversible</Text> with the right training protocol.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

      </SafeAreaView>

      {/* Footer CTA */}
      <Animated.View style={[styles.footer, ctaStyle]}>
        <BlurView intensity={30} tint="dark" style={styles.footerBlur}>
          <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
            <View style={styles.footerInner}>
              <ShimmerCTA
                title="Get My Recovery Plan"
                icon="arrow-forward"
                onPress={handleContinue}
              />

              <View style={styles.trustBadges}>
                <View style={styles.trustBadge}>
                  <Ionicons name="lock-closed" size={12} color={Colors.textMuted} />
                  <Text style={styles.trustText}>256-bit encrypted</Text>
                </View>
                <View style={styles.trustDivider} />
                <View style={styles.trustBadge}>
                  <Ionicons name="shield-checkmark" size={12} color={Colors.textMuted} />
                  <Text style={styles.trustText}>HIPAA compliant</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  header: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  badge: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  badgeIconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  scoreCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  scoreCardGradient: {
    padding: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  scoreMainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 52,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -2,
  },
  scoreUnit: {
    fontSize: 20,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
    marginLeft: 4,
  },
  comparisonSection: {
    marginBottom: 12,
  },
  comparisonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  comparisonTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 14,
  },
  barContainer: {
    marginBottom: 12,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  barLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  barValue: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  barTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barGradient: {
    flex: 1,
  },
  differenceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  differenceText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  differenceHighlight: {
    color: '#EF4444',
    fontFamily: 'Inter_600SemiBold',
  },
  factorsSection: {
    marginBottom: 12,
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
  factorsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  factorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  factorIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'capitalize',
  },
  methodSection: {
    marginBottom: 12,
  },
  methodCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  methodIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitleWrap: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  methodSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#22C55E',
    marginTop: 2,
  },
  methodDescription: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
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
    fontSize: 20,
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
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.12)',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
    lineHeight: 20,
  },
  messageHighlight: {
    color: Colors.primary,
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
    gap: 12,
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
