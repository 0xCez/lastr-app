import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { useOnboardingStore } from '@/store/onboardingStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PlanOption {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  period: string;
  perDay?: string;
  savings?: string;
  popular?: boolean;
  trial?: string;
}

const plans: PlanOption[] = [
  {
    id: 'weekly',
    title: 'Weekly',
    price: '$9.99',
    period: '/week',
  },
  {
    id: 'lifetime',
    title: 'Lifetime Access',
    price: '$79.99',
    originalPrice: '$199.99',
    period: 'one-time payment',
    savings: '60% OFF',
    popular: true,
    trial: '7-day money-back guarantee',
  },
];

const features = [
  { icon: 'fitness-outline' as const, title: '90-Day Transformation Program', desc: 'Guaranteed 90%+ improvement' },
  { icon: 'analytics-outline' as const, title: 'Progress Tracking', desc: 'See your improvement over time' },
  { icon: 'chatbubble-ellipses-outline' as const, title: 'AI Coaching Support', desc: 'Personalized guidance 24/7' },
  { icon: 'people-outline' as const, title: 'Community Access', desc: 'Connect with 50K+ men' },
  { icon: 'infinite-outline' as const, title: 'Lifetime Updates', desc: 'New content added weekly' },
];

const guarantees = [
  { icon: 'shield-checkmark-outline' as const, text: '7-day money-back guarantee' },
  { icon: 'lock-closed-outline' as const, text: 'Secure & encrypted payment' },
  { icon: 'eye-off-outline' as const, text: '100% private & discreet' },
];

const socialProof = [
  { value: '94%', label: 'Success Rate' },
  { value: '50K+', label: 'Men Helped' },
  { value: '4.8', label: 'App Rating' },
];

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState('lifetime');
  const [loading, setLoading] = useState(false);
  const { setPremium, initializeFromOnboarding } = useUserStore();
  const { analysisScore, answers, targetDate } = useOnboardingStore();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(20);
  const badgeScale = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const featuresOpacity = useSharedValue(0);
  const plansOpacity = useSharedValue(0);
  const guaranteeOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const shimmerPosition = useSharedValue(-1);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Staggered entrance animations
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    headerY.value = withDelay(100, withSpring(0, { damping: 15 }));
    badgeScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 200 }));
    statsOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    featuresOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    plansOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    guaranteeOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(1300, withTiming(1, { duration: 500 }));

    // CTA shimmer animation
    shimmerPosition.value = withDelay(
      1500,
      withRepeat(
        withTiming(2, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      )
    );

    // Pulse animation for popular badge
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    // Glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  const featuresStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
  }));

  const plansStyle = useAnimatedStyle(() => ({
    opacity: plansOpacity.value,
  }));

  const guaranteeStyle = useAnimatedStyle(() => ({
    opacity: guaranteeOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value * SCREEN_WIDTH }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleSelectPlan = async (planId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(planId);
  };

  const handlePurchase = async () => {
    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });

    // Simulate purchase - in production, use RevenueCat
    setTimeout(() => {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
      setPremium(true);
      // Transfer onboarding data to userStore and generate personalized tasks
      initializeFromOnboarding(
        analysisScore,
        answers.primary_concern || 'both',
        targetDate
      );
      setLoading(false);
      router.replace('/(tabs)');
    }, 1500);
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Purchases',
      'Looking for previous purchases...',
      [{ text: 'OK' }]
    );
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow */}
      <Animated.View style={[styles.ambientGlow, glowStyle]}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.2)', 'transparent']}
          style={styles.ambientGlowGradient}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            {/* Hero Icon */}
            <Animated.View style={[styles.heroIconWrap, pulseStyle]}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.08)']}
                style={styles.heroIconGradient}
              />
              <Ionicons name="diamond" size={32} color={Colors.primary} />
            </Animated.View>

            <Animated.View style={[styles.limitedBadge, badgeStyle]}>
              <LinearGradient
                colors={['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.1)']}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="flash" size={14} color="#FBBF24" />
              <Text style={styles.limitedText}>LIMITED TIME OFFER</Text>
            </Animated.View>

            <Text style={styles.title}>Unlock Your{'\n'}Full Potential</Text>
            <Text style={styles.subtitle}>
              Join 50,000+ men who've transformed their confidence
            </Text>
          </Animated.View>

          {/* Social Proof Stats */}
          <Animated.View style={[styles.socialProofCard, statsStyle]}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.socialProofRow}>
              {socialProof.map((stat, index) => (
                <React.Fragment key={stat.label}>
                  <View style={styles.socialProofItem}>
                    <Text style={styles.socialProofValue}>{stat.value}</Text>
                    <Text style={styles.socialProofLabel}>{stat.label}</Text>
                  </View>
                  {index < socialProof.length - 1 && (
                    <View style={styles.socialProofDivider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </Animated.View>

          {/* Features */}
          <Animated.View style={[styles.featuresSection, featuresStyle]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Everything You Get</Text>
            </View>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.title}
                entering={FadeInDown.delay(800 + index * 100).duration(400)}
                style={styles.featureRow}
              >
                <View style={styles.featureIconContainer}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0.1)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Ionicons name={feature.icon} size={20} color={Colors.primary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
              </Animated.View>
            ))}
          </Animated.View>

          {/* Plan Options */}
          <Animated.View style={[styles.plansSection, plansStyle]}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>

            {plans.map((plan) => (
              <Pressable
                key={plan.id}
                onPress={() => handleSelectPlan(plan.id)}
              >
                <Animated.View
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.planCardSelected,
                    plan.popular && pulseStyle,
                  ]}
                >
                  {plan.popular && (
                    <LinearGradient
                      colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
                      style={StyleSheet.absoluteFill}
                    />
                  )}

                  {plan.savings && (
                    <View style={styles.savingsBadge}>
                      <LinearGradient
                        colors={['#22C55E', '#16A34A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <Text style={styles.savingsText}>{plan.savings}</Text>
                    </View>
                  )}

                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <LinearGradient
                        colors={['#8B5CF6', '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <Ionicons name="star" size={12} color="#FFFFFF" />
                      <Text style={styles.popularText}>BEST VALUE</Text>
                    </View>
                  )}

                  <View style={styles.planContent}>
                    <View style={styles.planLeft}>
                      <View style={[
                        styles.radioOuter,
                        selectedPlan === plan.id && styles.radioOuterSelected,
                      ]}>
                        {selectedPlan === plan.id && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      <View>
                        <Text style={[
                          styles.planTitle,
                          selectedPlan === plan.id && styles.planTitleSelected
                        ]}>
                          {plan.title}
                        </Text>
                        {plan.trial && (
                          <Text style={styles.planTrial}>{plan.trial}</Text>
                        )}
                        {plan.perDay && (
                          <Text style={styles.planPerDay}>{plan.perDay}</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.planRight}>
                      {plan.originalPrice && (
                        <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
                      )}
                      <Text style={[
                        styles.planPrice,
                        selectedPlan === plan.id && styles.planPriceSelected
                      ]}>
                        {plan.price}
                      </Text>
                      <Text style={styles.planPeriod}>{plan.period}</Text>
                    </View>
                  </View>
                </Animated.View>
              </Pressable>
            ))}
          </Animated.View>

          {/* Guarantees */}
          <Animated.View style={[styles.guaranteesSection, guaranteeStyle]}>
            {guarantees.map((guarantee) => (
              <View key={guarantee.text} style={styles.guaranteeItem}>
                <Ionicons name={guarantee.icon} size={18} color="#22C55E" />
                <Text style={styles.guaranteeText}>{guarantee.text}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Testimonial */}
          <Animated.View style={[styles.testimonialCard, guaranteeStyle]}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.testimonialHeader}>
              <View style={styles.testimonialStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={14} color="#FBBF24" />
                ))}
              </View>
              <Text style={styles.testimonialVerified}>Verified Purchase</Text>
            </View>
            <Text style={styles.testimonialText}>
              "I was skeptical at first, but after 3 weeks I went from lasting 2 minutes to over 20.
              Best investment I've ever made in myself."
            </Text>
            <Text style={styles.testimonialAuthor}>— Marcus, 28</Text>
          </Animated.View>

          {/* Extra padding for scroll */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Fixed CTA Footer */}
        <Animated.View style={[styles.footer, ctaStyle]}>
          <View style={styles.footerGradient}>
            <LinearGradient
              colors={['transparent', '#0A0A0F']}
              style={styles.footerGradientInner}
            />
          </View>

          <AnimatedPressable
            onPress={handlePurchase}
            style={[styles.ctaButton, buttonAnimatedStyle]}
            disabled={loading}
          >
            {/* Glow behind button */}
            <View style={styles.ctaGlow}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.4)', 'transparent']}
                style={styles.ctaGlowGradient}
              />
            </View>

            <LinearGradient
              colors={loading ? ['#4B5563', '#374151'] : ['#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              {/* Shimmer effect */}
              {!loading && (
                <Animated.View style={[styles.shimmer, shimmerStyle]}>
                  <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.shimmerGradient}
                  />
                </Animated.View>
              )}

              <View style={styles.ctaContent}>
                {loading ? (
                  <Text style={styles.ctaText}>Processing...</Text>
                ) : (
                  <>
                    <Text style={styles.ctaText}>
                      {selectedPlan === 'lifetime' ? 'Get Lifetime Access' : 'Start Now'}
                    </Text>
                    <View style={styles.ctaPriceTag}>
                      <Text style={styles.ctaPriceText}>{selectedPlanData?.price}</Text>
                    </View>
                  </>
                )}
              </View>
            </LinearGradient>
          </AnimatedPressable>

          <Pressable onPress={handleRestore} style={styles.restoreButton}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </Pressable>

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </Animated.View>
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
    top: '10%',
    left: '10%',
    right: '10%',
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
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIconWrap: {
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
  heroIconGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  limitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  limitedText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#FBBF24',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  socialProofCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  socialProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  socialProofItem: {
    alignItems: 'center',
  },
  socialProofValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
    marginBottom: 2,
  },
  socialProofLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  socialProofDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  featuresSection: {
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  plansSection: {
    marginBottom: 24,
  },
  planCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: Colors.primary,
  },
  savingsBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  savingsText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  popularText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  planTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  planTitleSelected: {
    color: Colors.primary,
  },
  planTrial: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#22C55E',
    marginTop: 2,
  },
  planPerDay: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  planRight: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  planPrice: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  planPriceSelected: {
    color: Colors.primary,
  },
  planPeriod: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  guaranteesSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guaranteeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  testimonialCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  testimonialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testimonialStars: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialVerified: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#22C55E',
  },
  testimonialText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
  },
  footerGradient: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 60,
  },
  footerGradientInner: {
    flex: 1,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  ctaGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    zIndex: -1,
  },
  ctaGlowGradient: {
    flex: 1,
    borderRadius: 50,
  },
  ctaGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    left: -100,
  },
  shimmerGradient: {
    flex: 1,
    width: 100,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  ctaPriceTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ctaPriceText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  restoreText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.primary,
  },
  termsText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
