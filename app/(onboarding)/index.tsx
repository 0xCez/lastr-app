import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  FadeOut,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { AnimatedSplash } from '@/components/ui/AnimatedSplash';
import { ShimmerCTA } from '@/components/ui';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [showSplash, setShowSplash] = useState(true);

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const taglineOpacity = useSharedValue(0);
  const heroOpacity = useSharedValue(0);
  const heroTranslateY = useSharedValue(30);
  const statsOpacity = useSharedValue(0);
  const statsTranslateY = useSharedValue(40);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  // Floating orbs animation - start from bottom
  const orb1Y = useSharedValue(height);
  const orb1Opacity = useSharedValue(0);
  const orb2Y = useSharedValue(height);
  const orb2Opacity = useSharedValue(0);
  const orb3Y = useSharedValue(height);
  const orb3Opacity = useSharedValue(0);

  useEffect(() => {
    // Only run animations after splash is hidden
    if (showSplash) return;

    // Staggered entrance animations
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    logoScale.value = withDelay(200, withSpring(1, { damping: 12 }));
    taglineOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    heroOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
    heroTranslateY.value = withDelay(700, withSpring(0, { damping: 15 }));
    statsOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
    statsTranslateY.value = withDelay(1000, withSpring(0, { damping: 15 }));
    buttonOpacity.value = withDelay(1300, withTiming(1, { duration: 600 }));
    buttonTranslateY.value = withDelay(1300, withSpring(0, { damping: 15 }));

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      true
    );

    // Orbs rise from bottom then float
    // Orb 1 - rises first
    orb1Opacity.value = withTiming(1, { duration: 800 });
    orb1Y.value = withSpring(0, { damping: 20, stiffness: 40 });

    // Orb 2 - rises with delay
    orb2Opacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    orb2Y.value = withDelay(200, withSpring(0, { damping: 18, stiffness: 35 }));

    // Orb 3 - rises last
    orb3Opacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    orb3Y.value = withDelay(400, withSpring(0, { damping: 22, stiffness: 45 }));

    // Start floating animation after orbs settle
    const floatDelay = 1200;

    orb1Y.value = withDelay(
      floatDelay,
      withRepeat(
        withSequence(
          withTiming(-35, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    orb2Y.value = withDelay(
      floatDelay + 200,
      withRepeat(
        withSequence(
          withTiming(-28, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    orb3Y.value = withDelay(
      floatDelay + 400,
      withRepeat(
        withSequence(
          withTiming(-40, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [showSplash]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslateY.value }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: statsTranslateY.value }],
  }));

  const buttonContainerStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [
      { translateY: buttonTranslateY.value },
      { scale: buttonScale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const orb1Style = useAnimatedStyle(() => ({
    opacity: orb1Opacity.value,
    transform: [{ translateY: orb1Y.value }],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    opacity: orb2Opacity.value,
    transform: [{ translateY: orb2Y.value }],
  }));

  const orb3Style = useAnimatedStyle(() => ({
    opacity: orb3Opacity.value,
    transform: [{ translateY: orb3Y.value }],
  }));

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    router.push('/(onboarding)/questions');
  };

  // Show animated splash first
  if (showSplash) {
    return (
      <Animated.View style={styles.container} exiting={FadeOut.duration(400)}>
        <AnimatedSplash
          size="large"
          onAnimationComplete={() => setShowSplash(false)}
        />
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs */}
      <Animated.View style={[styles.orb, styles.orb1, orb1Style]}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0)']}
          style={styles.orbGradient}
        />
      </Animated.View>
      <Animated.View style={[styles.orb, styles.orb2, orb2Style]}>
        <LinearGradient
          colors={['rgba(109, 40, 217, 0.3)', 'rgba(109, 40, 217, 0)']}
          style={styles.orbGradient}
        />
      </Animated.View>
      <Animated.View style={[styles.orb, styles.orb3, orb3Style]}>
        <LinearGradient
          colors={['rgba(167, 139, 250, 0.25)', 'rgba(167, 139, 250, 0)']}
          style={styles.orbGradient}
        />
      </Animated.View>

      {/* Center glow */}
      <Animated.View style={[styles.centerGlow, glowStyle]}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
          style={styles.centerGlowGradient}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Animated.View style={[styles.logoContainer, logoStyle]}>
              <Image
                source={require('@/assets/images/logo_nobg.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>
            <Animated.Text style={[styles.tagline, taglineStyle]}>
              Take Control. Permanently.
            </Animated.Text>
          </View>

          {/* Hero Section */}
          <Animated.View style={[styles.heroSection, heroStyle]}>
            <Text style={styles.heroTitle}>
              The science-backed{'\n'}program to help you{'\n'}
              <Text style={styles.heroHighlight}>last longer</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Join thousands of men who have transformed{'\n'}their confidence and intimate life
            </Text>
          </Animated.View>

          {/* Stats */}
          <Animated.View style={[styles.statsContainer, statsStyle]}>
            <BlurView intensity={20} tint="dark" style={styles.statsBlur}>
              <View style={styles.statsInner}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>94%</Text>
                  <Text style={styles.statLabel}>Success rate</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>50K+</Text>
                  <Text style={styles.statLabel}>Users</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>4.8</Text>
                  <Text style={styles.statLabel}>App rating</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </View>

      </SafeAreaView>

      {/* Footer - outside SafeAreaView for edge-to-edge */}
      <Animated.View style={[styles.footer, buttonContainerStyle]}>
        <BlurView intensity={30} tint="dark" style={styles.footerBlur}>
          <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
            <View style={styles.footerInner}>
              <ShimmerCTA
                title="Get Started"
                icon="arrow-forward"
                onPress={handlePress}
              />

              <View style={styles.disclaimerRow}>
                <Text style={styles.lockIcon}>🔒</Text>
                <Text style={styles.disclaimer}>
                  100% private & anonymous
                </Text>
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
    paddingHorizontal: 24,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    top: height * 0.1,
    left: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
  },
  orb2: {
    top: height * 0.4,
    right: -width * 0.4,
    width: width * 0.7,
    height: width * 0.7,
  },
  orb3: {
    bottom: height * 0.1,
    left: width * 0.1,
    width: width * 0.5,
    height: width * 0.5,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  centerGlow: {
    position: 'absolute',
    top: height * 0.12,
    left: width * 0.1,
    right: width * 0.1,
    height: height * 0.25,
  },
  centerGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 160,
    height: 60,
  },
  tagline: {
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginTop: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.2,
  },
  heroHighlight: {
    color: Colors.primary,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 0,
    lineHeight: 26,
  },
  statsContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsBlur: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  statsInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(26, 26, 36, 0.6)',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    gap: 16,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  lockIcon: {
    fontSize: 11,
  },
  disclaimer: {
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    fontSize: 12,
  },
});
