import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking, Modal, Dimensions } from 'react-native';
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
import { PurchasesPackage } from '@/lib/purchases-stub';
import { Colors } from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { ShimmerCTA } from '@/components/ui';
import { useRevenueCat } from '@/providers/RevenueCatProvider';
import { formatPrice } from '@/lib/revenuecat';
import { wp, hp, fp } from '@/constants/responsive';

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

// Default plans for main paywall - Weekly and Lifetime only
const defaultPlans: PlanOption[] = [
  {
    id: 'weekly',
    rcIdentifier: '$rc_weekly',
    title: 'Weekly',
    price: '$9.99',
    period: '/week',
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

// Recovery paywall shows Yearly offer only
const defaultRecoveryPlan: PlanOption = {
  id: 'yearly',
  rcIdentifier: '$rc_annual',
  title: 'Yearly',
  price: '$49.99',
  period: '/year',
  perDay: 'Less than $1/week',
  savings: '90% OFF',
};

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
  const [recoveryPlan, setRecoveryPlan] = useState<PlanOption>(defaultRecoveryPlan);
  const [showRecoveryPaywall, setShowRecoveryPaywall] = useState(false);
  const hasAttemptedPurchase = useRef(false);
  const { setPremium } = useUserStore();
  const {
    packages,
    isLoading: rcLoading,
    purchasePackage,
    restorePurchases,
  } = useRevenueCat();

  // Update plans when packages load from RevenueCat
  useEffect(() => {
    if (packages.length > 0) {
      // Update main paywall plans
      const updatedPlans = defaultPlans.map((plan) => {
        const pkg = packages.find((p: PurchasesPackage) => p.identifier === plan.rcIdentifier);
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

      // Update recovery paywall yearly plan
      const yearlyPkg = packages.find((p: PurchasesPackage) => p.identifier === defaultRecoveryPlan.rcIdentifier);
      if (yearlyPkg) {
        setRecoveryPlan({
          ...defaultRecoveryPlan,
          price: formatPrice(yearlyPkg),
          package: yearlyPkg,
        });
      }
    }
  }, [packages]);

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
      setLoading(false);
      // Show recovery paywall only on first cancel attempt
      if (!hasAttemptedPurchase.current) {
        hasAttemptedPurchase.current = true;
        // Small delay for better UX
        setTimeout(() => {
          setShowRecoveryPaywall(true);
        }, 300);
      }
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
      Alert.alert('Restore Failed', 'Something went wrong. Please try again.');
    }
  };

  const handleRecoveryPurchase = async () => {
    // Dev bypass for Expo Go
    if (__DEV__ && isExpoGo && !recoveryPlan?.package) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPremium(true);
      setShowRecoveryPaywall(false);
      router.push('/(onboarding)/login');
      return;
    }

    if (!recoveryPlan?.package) {
      Alert.alert('Error', 'Unable to load purchase options. Please try again.');
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await purchasePackage(recoveryPlan.package);

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPremium(true);
      setLoading(false);
      setShowRecoveryPaywall(false);
      router.push('/(onboarding)/login');
    } else if (result.error === 'cancelled') {
      setLoading(false);
    } else {
      setLoading(false);
      Alert.alert('Purchase Failed', result.error || 'Something went wrong. Please try again.');
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

              <View style={styles.footerLinks}>
                <Pressable onPress={handleRestore}>
                  <Text style={styles.restoreText}>Restore Purchases</Text>
                </Pressable>
                <Text style={styles.linkDivider}>•</Text>
                <Pressable onPress={() => Linking.openURL('https://lastrapp.xyz/terms')}>
                  <Text style={styles.linkText}>Terms</Text>
                </Pressable>
                <Text style={styles.linkDivider}>•</Text>
                <Pressable onPress={() => Linking.openURL('https://lastrapp.xyz/privacy')}>
                  <Text style={styles.linkText}>Privacy</Text>
                </Pressable>
                {__DEV__ && (
                  <>
                    <Text style={styles.linkDivider}>•</Text>
                    <Pressable onPress={() => setShowRecoveryPaywall(true)}>
                      <Text style={[styles.linkText, { color: '#F59E0B' }]}>Test Recovery</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          </SafeAreaView>
        </BlurView>
      </Animated.View>

      {/* Recovery Paywall Modal */}
      <Modal
        visible={showRecoveryPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRecoveryPaywall(false)}
      >
        <View style={styles.recoveryContainer}>
          <LinearGradient
            colors={['#0A0A0F', '#0D0D15', '#12121F']}
            style={StyleSheet.absoluteFill}
          />

          <SafeAreaView style={styles.recoverySafeArea}>
            {/* Close button - smaller, less prominent */}
            <Pressable
              style={styles.recoveryCloseButton}
              onPress={() => setShowRecoveryPaywall(false)}
              hitSlop={8}
            >
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.3)" />
            </Pressable>

            <ScrollView
              style={styles.recoveryScrollView}
              contentContainerStyle={styles.recoveryScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Urgency Header */}
              <View style={styles.recoveryHeader}>
                <Animated.View
                  entering={FadeInDown.delay(200).springify().damping(12)}
                  style={styles.recoveryUrgencyBadge}
                >
                  <LinearGradient
                    colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Ionicons name="time-outline" size={16} color="#EF4444" />
                  <Text style={styles.recoveryUrgencyText}>SPECIAL OFFER</Text>
                </Animated.View>
                <Text style={styles.recoveryTitle}>Your personalized plan{'\n'}is ready to expire</Text>
                <Text style={styles.recoverySubtitle}>
                  We've analyzed your profile and created a custom program.{'\n'}This offer won't be available later.
                </Text>
              </View>

              {/* What you're losing section */}
              <View style={styles.recoveryLossCard}>
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.08)', 'rgba(239, 68, 68, 0.02)']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.recoveryLossTitle}>Without training, most men:</Text>
                <View style={styles.recoveryLossList}>
                  <View style={styles.recoveryLossItem}>
                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                    <Text style={styles.recoveryLossText}>Continue struggling for years</Text>
                  </View>
                  <View style={styles.recoveryLossItem}>
                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                    <Text style={styles.recoveryLossText}>Avoid intimacy and relationships</Text>
                  </View>
                  <View style={styles.recoveryLossItem}>
                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                    <Text style={styles.recoveryLossText}>Never address the root cause</Text>
                  </View>
                </View>
              </View>

              {/* Success stat - big and bold */}
              <View style={styles.recoveryStatCard}>
                <LinearGradient
                  colors={['rgba(34, 197, 94, 0.12)', 'rgba(34, 197, 94, 0.04)']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.recoveryStatNumber}>94%</Text>
                <Text style={styles.recoveryStatLabel}>of men see significant improvement{'\n'}within the first 3 weeks</Text>
              </View>

              {/* Guarantee - make it about removing objections */}
              <View style={styles.recoveryGuaranteeCard}>
                <Ionicons name="shield-checkmark" size={24} color="#22C55E" />
                <View style={styles.recoveryGuaranteeContent}>
                  <Text style={styles.recoveryGuaranteeTitle}>7-Day Money-Back Guarantee</Text>
                  <Text style={styles.recoveryGuaranteeText}>
                    Not satisfied? Full refund, no questions asked.
                  </Text>
                </View>
              </View>

              {/* Yearly plan - recovery offer */}
              <Animated.View
                entering={FadeInDown.delay(400).springify().damping(12)}
                style={styles.recoveryPlanCard}
              >
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.recoveryPlanHeader}>
                  <Text style={styles.recoveryPlanLabel}>SPECIAL YEARLY OFFER</Text>
                  {recoveryPlan.savings && (
                    <View style={styles.recoveryBestValue}>
                      <Text style={styles.recoveryBestValueText}>{recoveryPlan.savings}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.recoveryPlanDetails}>
                  <View>
                    <Text style={styles.recoveryPlanTitle}>{recoveryPlan.title}</Text>
                    {recoveryPlan.perDay && (
                      <Text style={styles.recoveryPlanSubtext}>{recoveryPlan.perDay}</Text>
                    )}
                  </View>
                  <View style={styles.recoveryPlanPriceCol}>
                    <Text style={styles.recoveryPlanPrice}>{recoveryPlan.price}</Text>
                    <Text style={styles.recoveryPlanPeriod}>{recoveryPlan.period}</Text>
                  </View>
                </View>
              </Animated.View>
            </ScrollView>

            {/* Footer - glassy with CTA */}
            <View style={styles.recoveryFooterContainer}>
              <BlurView intensity={30} tint="dark" style={styles.recoveryFooterBlur}>
                <SafeAreaView edges={['bottom']} style={styles.recoveryFooterSafeArea}>
                  <View style={styles.recoveryFooterInner}>
                    <ShimmerCTA
                      title={loading ? 'Processing...' : 'Get Yearly Access'}
                      onPress={handleRecoveryPurchase}
                      disabled={loading}
                    />
                    <Pressable
                      style={styles.recoverySkipButton}
                      onPress={() => setShowRecoveryPaywall(false)}
                    >
                      <Text style={styles.recoverySkipText}>No thanks, I'll keep struggling</Text>
                    </Pressable>
                  </View>
                </SafeAreaView>
              </BlurView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
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
    borderRadius: wp(200),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingTop: hp(60),
    paddingBottom: hp(160),
  },
  header: {
    alignItems: 'center',
    marginBottom: hp(24),
  },
  heroIconWrap: {
    width: wp(72),
    height: wp(72),
    borderRadius: wp(36),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(16),
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
    gap: wp(6),
    paddingHorizontal: wp(14),
    paddingVertical: hp(8),
    borderRadius: wp(20),
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    marginBottom: hp(16),
    overflow: 'hidden',
  },
  limitedText: {
    fontSize: fp(11),
    fontFamily: 'Inter_700Bold',
    color: '#FBBF24',
    letterSpacing: 1,
  },
  title: {
    fontSize: fp(32),
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: fp(38),
    marginBottom: hp(10),
  },
  subtitle: {
    fontSize: fp(15),
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  socialProofCard: {
    borderRadius: wp(16),
    padding: wp(18),
    marginBottom: hp(28),
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
    fontSize: fp(24),
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
    marginBottom: hp(2),
  },
  socialProofLabel: {
    fontSize: fp(12),
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  socialProofDivider: {
    width: 1,
    height: hp(36),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  featuresSection: {
    marginBottom: hp(28),
  },
  sectionHeader: {
    marginBottom: hp(16),
  },
  sectionTitle: {
    fontSize: fp(18),
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: hp(16),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(12),
    paddingHorizontal: wp(14),
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: wp(12),
    marginBottom: hp(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureIconContainer: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(12),
    overflow: 'hidden',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fp(14),
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: hp(2),
  },
  featureDesc: {
    fontSize: fp(12),
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  plansSection: {
    marginBottom: hp(24),
  },
  planCard: {
    padding: wp(18),
    borderRadius: wp(16),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: hp(12),
    overflow: 'hidden',
    position: 'relative',
    minHeight: hp(90),
  },
  planCardSelected: {
    borderColor: Colors.primary,
  },
  savingsBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    paddingHorizontal: wp(10),
    paddingVertical: hp(5),
    borderBottomLeftRadius: wp(10),
    borderTopRightRadius: wp(14),
    overflow: 'hidden',
    zIndex: 10,
  },
  savingsText: {
    fontSize: fp(10),
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    position: 'absolute',
    top: -1,
    left: -1,
    paddingHorizontal: wp(10),
    paddingVertical: hp(5),
    borderBottomRightRadius: wp(10),
    borderTopLeftRadius: wp(14),
    overflow: 'hidden',
  },
  popularText: {
    fontSize: fp(10),
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  radioOuter: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: Colors.primary,
  },
  planTitle: {
    fontSize: fp(16),
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  planTitleSelected: {
    color: Colors.primary,
  },
  planTrial: {
    fontSize: fp(12),
    fontFamily: 'Inter_400Regular',
    color: '#22C55E',
    marginTop: hp(2),
  },
  planPerDay: {
    fontSize: fp(12),
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: hp(2),
  },
  planRight: {
    alignItems: 'flex-end',
    paddingTop: hp(4),
  },
  originalPrice: {
    fontSize: fp(14),
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
    marginBottom: hp(2),
  },
  planPrice: {
    fontSize: fp(24),
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  planPriceSelected: {
    color: Colors.primary,
  },
  planPeriod: {
    fontSize: fp(12),
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  guaranteesSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: wp(16),
    marginBottom: hp(24),
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
  },
  guaranteeText: {
    fontSize: fp(12),
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  testimonialCard: {
    padding: wp(18),
    borderRadius: wp(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  testimonialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(12),
  },
  testimonialStars: {
    flexDirection: 'row',
    gap: wp(2),
  },
  testimonialVerified: {
    fontSize: fp(11),
    fontFamily: 'Inter_500Medium',
    color: '#22C55E',
  },
  testimonialText: {
    fontSize: fp(14),
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
    lineHeight: fp(22),
    fontStyle: 'italic',
    marginBottom: hp(12),
  },
  testimonialAuthor: {
    fontSize: fp(13),
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
    borderTopLeftRadius: wp(24),
    borderTopRightRadius: wp(24),
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
    paddingHorizontal: wp(24),
    paddingTop: hp(24),
    paddingBottom: hp(16),
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(12),
    paddingVertical: hp(12),
  },
  restoreText: {
    fontSize: fp(13),
    fontFamily: 'Inter_500Medium',
    color: Colors.primary,
  },
  linkDivider: {
    fontSize: fp(13),
    color: Colors.textMuted,
  },
  linkText: {
    fontSize: fp(13),
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  // Recovery Paywall Styles
  recoveryContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  recoverySafeArea: {
    flex: 1,
  },
  recoveryCloseButton: {
    position: 'absolute',
    top: hp(16),
    right: wp(16),
    zIndex: 10,
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryScrollView: {
    flex: 1,
  },
  recoveryScrollContent: {
    paddingHorizontal: wp(24),
    paddingTop: hp(60),
    paddingBottom: hp(140),
  },
  recoveryHeader: {
    alignItems: 'center',
    marginBottom: hp(28),
  },
  recoveryUrgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    paddingHorizontal: wp(16),
    paddingVertical: hp(10),
    borderRadius: wp(22),
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: hp(16),
    overflow: 'hidden',
  },
  recoveryUrgencyText: {
    fontSize: fp(12),
    fontFamily: 'Inter_700Bold',
    color: '#EF4444',
    letterSpacing: 1,
  },
  recoveryTitle: {
    fontSize: fp(26),
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: hp(12),
    lineHeight: fp(32),
  },
  recoverySubtitle: {
    fontSize: fp(14),
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: fp(20),
  },
  recoveryLossCard: {
    borderRadius: wp(14),
    padding: wp(18),
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    marginBottom: hp(16),
    overflow: 'hidden',
  },
  recoveryLossTitle: {
    fontSize: fp(15),
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: hp(14),
  },
  recoveryLossList: {
    gap: hp(12),
  },
  recoveryLossItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  recoveryLossText: {
    fontSize: fp(14),
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  recoveryStatCard: {
    borderRadius: wp(14),
    padding: wp(20),
    alignItems: 'center',
    marginBottom: hp(16),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },
  recoveryStatNumber: {
    fontSize: fp(48),
    fontFamily: 'Inter_700Bold',
    color: '#22C55E',
    marginBottom: hp(4),
  },
  recoveryStatLabel: {
    fontSize: fp(14),
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: fp(20),
  },
  recoveryGuaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(14),
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: wp(14),
    padding: wp(16),
    marginBottom: hp(16),
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },
  recoveryGuaranteeContent: {
    flex: 1,
  },
  recoveryGuaranteeTitle: {
    fontSize: fp(15),
    fontFamily: 'Inter_600SemiBold',
    color: '#22C55E',
    marginBottom: hp(2),
  },
  recoveryGuaranteeText: {
    fontSize: fp(13),
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  recoveryPlanCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: wp(14),
    padding: wp(16),
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  recoveryPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(12),
  },
  recoveryPlanLabel: {
    fontSize: fp(11),
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  recoveryBestValue: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: wp(8),
    paddingVertical: hp(3),
    borderRadius: wp(6),
  },
  recoveryBestValueText: {
    fontSize: fp(10),
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  recoveryPlanDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recoveryPlanTitle: {
    fontSize: fp(18),
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  recoveryPlanSubtext: {
    fontSize: fp(12),
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: hp(2),
  },
  recoveryPlanPriceCol: {
    alignItems: 'flex-end',
  },
  recoveryPlanPrice: {
    fontSize: fp(24),
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
  },
  recoveryPlanPeriod: {
    fontSize: fp(12),
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  recoveryFooterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  recoveryFooterBlur: {
    borderTopLeftRadius: wp(24),
    borderTopRightRadius: wp(24),
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recoveryFooterSafeArea: {
    backgroundColor: 'rgba(26, 26, 36, 0.8)',
  },
  recoveryFooterInner: {
    paddingHorizontal: wp(24),
    paddingTop: hp(24),
    paddingBottom: hp(16),
  },
  recoverySkipButton: {
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  recoverySkipText: {
    fontSize: fp(13),
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.35)',
  },
});
