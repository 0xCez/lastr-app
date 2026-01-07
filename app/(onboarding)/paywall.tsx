import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';
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
import { PurchasesPackage } from 'react-native-purchases';
import { Colors } from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { ShimmerCTA } from '@/components/ui';
import {
  getPackages,
  purchasePackage,
  restorePurchases,
  formatPrice,
} from '@/lib/revenuecat';

// Check if running in Expo Go (for dev bypass)
const isExpoGo = Constants.appOwnership === 'expo';

interface PlanOption {
  id: string;
  rcIdentifier: string; // RevenueCat package identifier
  title: string;
  price: string;
  originalPrice?: string;
  period: string;
  perDay?: string;
  savings?: string;
  popular?: boolean;
  trial?: string;
  package?: PurchasesPackage;
}

// Default plans - prices will be updated from RevenueCat
const defaultPlans: PlanOption[] = [
  {
    id: 'weekly',
    rcIdentifier: '$rc_weekly',
    title: 'Weekly',
    price: '$9.99',
    period: '/week',
  },
  {
    id: 'yearly',
    rcIdentifier: '$rc_annual',
    title: 'Yearly',
    price: '$49.99',
    period: '/year',
    perDay: 'Less than $1/week',
    savings: '90% OFF',
  },
  {
    id: 'lifetime',
    rcIdentifier: '$rc_lifetime',
    title: 'Lifetime Access',
    price: '$79.99',
    period: 'one-time payment',
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
  const [plans, setPlans] = useState<PlanOption[]>(defaultPlans);
  const [packagesLoaded, setPackagesLoaded] = useState(false);
  const { setPremium } = useUserStore();

  // Load RevenueCat packages on mount
  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const packages = await getPackages();
      if (packages.length > 0) {
        // Update plans with real prices from RevenueCat
        const updatedPlans = defaultPlans.map((plan) => {
          const pkg = packages.find((p) => p.identifier === plan.rcIdentifier);
          if (pkg) {
            return {
              ...plan,
              price: formatPrice(pkg),
              package: pkg,
            };
          }
          return plan;
        });
        setPlans(updatedPlans);
      }
      setPackagesLoaded(true);
    } catch (error) {
      console.error('Failed to load packages:', error);
      setPackagesLoaded(true);
    }
  };

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(20);
  const badgeScale = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const featuresOpacity = useSharedValue(0);
  const plansOpacity = useSharedValue(0);
  const guaranteeOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
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
    const plan = plans.find((p) => p.id === selectedPlan);

    // Dev bypass for Expo Go
    if (__DEV__ && isExpoGo && !plan?.package) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPremium(true);
      router.push('/(onboarding)/login');
      return;
    }

    if (!plan?.package) {
      Alert.alert('Error', 'Unable to load purchase options. Please try again.');
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await purchasePackage(plan.package);

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPremium(true);
      setLoading(false);
      // After successful purchase, go to login/signup
      router.push('/(onboarding)/login');
    } else if (result.error === 'cancelled') {
      // User cancelled, do nothing
      setLoading(false);
    } else {
      setLoading(false);
      Alert.alert('Purchase Failed', result.error || 'Something went wrong. Please try again.');
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await restorePurchases();

    setLoading(false);

    if (result.success && result.isPremium) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPremium(true);
      Alert.alert('Success', 'Your purchase has been restored!', [
        { text: 'Continue', onPress: () => router.push('/(onboarding)/login') },
      ]);
    } else if (result.success && !result.isPremium) {
      Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases for this account.');
    } else {
      Alert.alert('Restore Failed', result.error || 'Something went wrong. Please try again.');
    }
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

      </SafeAreaView>

      {/* Footer CTA */}
      <Animated.View style={[styles.footer, ctaStyle]}>
        <BlurView intensity={30} tint="dark" style={styles.footerBlur}>
          <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
            <View style={styles.footerInner}>
              <ShimmerCTA
                title={loading ? 'Processing...' : (__DEV__ && isExpoGo ? 'Continue (Dev Mode)' : (selectedPlan === 'lifetime' ? 'Get Lifetime Access' : 'Start Now'))}
                onPress={handlePurchase}
                disabled={loading}
              />

              <Pressable onPress={handleRestore} style={styles.restoreButton}>
                <Text style={styles.restoreText}>Restore Purchases</Text>
              </Pressable>

              <Text style={styles.termsText}>
                By continuing, you agree to our Terms & Privacy Policy
              </Text>
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
