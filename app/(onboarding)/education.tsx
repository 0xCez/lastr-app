import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, ViewToken, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  interpolate,
  useAnimatedScrollHandler,
  SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Slide data with stats, icons, and indirect messaging
const slideData = [
  {
    id: 1,
    badge: 'THE PROBLEM',
    title: 'It\'s more than\nthe bedroom',
    description: 'Most men don\'t realize how much lack of control quietly affects their entire life.',
    stat: '30%',
    statLabel: 'of men affected',
    icon: 'alert-circle-outline' as const,
    gradient: ['#1a1a2e', '#16213e', '#0f0f23'] as const,
    accentColor: '#EF4444',
  },
  {
    id: 2,
    badge: 'THE IMPACT',
    title: 'It kills\nintimacy',
    description: 'Men struggling with control are 3x more likely to pull away from their partners.',
    stat: '3x',
    statLabel: 'more avoidance',
    icon: 'heart-dislike-outline' as const,
    gradient: ['#1a1a2e', '#16213e', '#0f0f23'] as const,
    accentColor: '#F97316',
  },
  {
    id: 3,
    badge: 'RELATIONSHIPS',
    title: 'Your partner\nfeels it too',
    description: 'The pressure builds. That worry about satisfaction only makes things harder.',
    stat: '80%',
    statLabel: 'feel partner impact',
    icon: 'people-outline' as const,
    gradient: ['#1a1a2e', '#16213e', '#0f0f23'] as const,
    accentColor: '#EAB308',
  },
  {
    id: 4,
    badge: 'THE CYCLE',
    title: 'Anxiety feeds\nthe problem',
    description: 'Worry → Tension → Poor performance → More worry. A cycle that feels impossible to break.',
    stat: '∞',
    statLabel: 'vicious cycle',
    icon: 'sync-outline' as const,
    gradient: ['#1a1a2e', '#16213e', '#0f0f23'] as const,
    accentColor: '#A855F7',
  },
  {
    id: 5,
    badge: 'THE SOLUTION',
    title: 'Your brain can\nbe retrained',
    description: 'With the right techniques, you can rewire your response and build lasting control.',
    stat: '94%',
    statLabel: 'success rate',
    icon: 'checkmark-circle-outline' as const,
    gradient: ['#0f2922', '#134e3a', '#0f0f23'] as const,
    accentColor: '#22C55E',
  },
  {
    id: 6,
    badge: 'YOUR JOURNEY',
    title: 'Welcome to',
    showLogo: true,
    description: 'A proven method based on clinical research. Your transformation starts now.',
    stat: '2.3M+',
    statLabel: 'men helped',
    icon: 'rocket-outline' as const,
    gradient: ['#1e1b4b', '#312e81', '#0f0f23'] as const,
    accentColor: '#8B5CF6',
  },
];

// Slide Component
const SlideContent = ({
  item,
  index,
  isActive,
  scrollX,
}: {
  item: typeof slideData[0];
  index: number;
  isActive: boolean;
  scrollX: SharedValue<number>;
}) => {
  const isPositive = index === 4; // Only slide 5 (THE SOLUTION) is green

  // Individual element animations
  const badgeOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.5);
  const badgeY = useSharedValue(-30);
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(-180);
  const iconPulse = useSharedValue(1);
  const statOpacity = useSharedValue(0);
  const statScale = useSharedValue(0.3);
  const statY = useSharedValue(40);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(50);
  const titleScale = useSharedValue(0.9);
  const descOpacity = useSharedValue(0);
  const descY = useSharedValue(30);
  const glowPulse = useSharedValue(0.2);
  const glowScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const logoRotateY = useSharedValue(90);
  const iconFloat = useSharedValue(0);
  const iconGlowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Reset all values
      badgeOpacity.value = 0;
      badgeScale.value = 0.5;
      badgeY.value = -30;
      iconOpacity.value = 0;
      iconScale.value = 0;
      iconRotation.value = -180;
      statOpacity.value = 0;
      statScale.value = 0.3;
      statY.value = 40;
      titleOpacity.value = 0;
      titleY.value = 50;
      titleScale.value = 0.9;
      descOpacity.value = 0;
      descY.value = 30;
      glowScale.value = 0.5;
      logoOpacity.value = 0;
      logoScale.value = 0.5;
      logoRotateY.value = 90;

      // Glow expands first (creates anticipation)
      glowScale.value = withDelay(0, withSpring(1.2, { damping: 8, stiffness: 80 }));
      glowPulse.value = withDelay(0, withTiming(0.8, { duration: 400 }));

      // Badge drops in from top with bounce
      badgeOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
      badgeY.value = withDelay(100, withSpring(0, { damping: 10, stiffness: 150 }));
      badgeScale.value = withDelay(100, withSpring(1, { damping: 8, stiffness: 200 }));

      // Icon spins in dramatically with overshoot
      iconOpacity.value = withDelay(250, withTiming(1, { duration: 400 }));
      iconScale.value = withDelay(250, withSpring(1, { damping: 6, stiffness: 120 }));
      iconRotation.value = withDelay(250, withSpring(0, { damping: 8, stiffness: 80 }));

      // Continuous subtle pulse on icon after entrance
      iconPulse.value = withDelay(800, withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      ));

      // Floating animation for icon
      iconFloat.value = withDelay(800, withRepeat(
        withSequence(
          withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      ));

      // Icon glow ring pulse
      iconGlowOpacity.value = withDelay(600, withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      ));

      // Stat number scales up dramatically
      statOpacity.value = withDelay(450, withTiming(1, { duration: 350 }));
      statScale.value = withDelay(450, withSpring(1, { damping: 6, stiffness: 100 }));
      statY.value = withDelay(450, withSpring(0, { damping: 12, stiffness: 120 }));

      // Title slides up with scale
      titleOpacity.value = withDelay(650, withTiming(1, { duration: 400 }));
      titleY.value = withDelay(650, withSpring(0, { damping: 12, stiffness: 90 }));
      titleScale.value = withDelay(650, withSpring(1, { damping: 10, stiffness: 120 }));

      // Hero logo flips in (for last slide)
      logoOpacity.value = withDelay(750, withTiming(1, { duration: 400 }));
      logoScale.value = withDelay(750, withSpring(1, { damping: 8, stiffness: 100 }));
      logoRotateY.value = withDelay(750, withSpring(0, { damping: 10, stiffness: 80 }));

      // Description fades in last
      descOpacity.value = withDelay(850, withTiming(1, { duration: 450 }));
      descY.value = withDelay(850, withSpring(0, { damping: 14, stiffness: 100 }));

      // Glow settles into pulse
      glowPulse.value = withDelay(600, withRepeat(
        withSequence(
          withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      ));
    }
  }, [isActive]);

  // Parallax effect based on scroll position
  const parallaxStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [width * 0.3, 0, -width * 0.3]
    );
    return {
      transform: [{ translateX }],
    };
  });

  // Icon parallax (moves faster for depth effect)
  const iconParallaxStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const translateXVal = interpolate(
      scrollX.value,
      inputRange,
      [width * 0.5, 0, -width * 0.5]
    );
    const scaleVal = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6]
    );
    return {
      transform: [
        { translateX: translateXVal },
        { scale: scaleVal },
      ] as const,
    };
  });

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [
      { translateY: badgeY.value },
      { scale: badgeScale.value },
    ] as const,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [
      { translateY: iconFloat.value },
      { scale: iconScale.value * iconPulse.value },
      { rotate: `${iconRotation.value}deg` },
    ] as const,
  }));

  const iconGlowStyle = useAnimatedStyle(() => ({
    opacity: iconGlowOpacity.value,
    transform: [
      { translateY: iconFloat.value },
      { scale: 1.3 + iconPulse.value * 0.1 },
    ] as const,
  }));

  const statStyle = useAnimatedStyle(() => ({
    opacity: statOpacity.value,
    transform: [
      { translateY: statY.value },
      { scale: statScale.value },
    ] as const,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      { translateY: titleY.value },
      { scale: titleScale.value },
    ] as const,
  }));

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
    transform: [{ translateY: descY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
    transform: [{ scale: glowScale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { perspective: 1000 },
      { rotateY: `${logoRotateY.value}deg` },
    ] as const,
  }));

  return (
    <View style={styles.slide}>
      <LinearGradient
        colors={item.gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Accent glow */}
      <Animated.View style={[styles.accentGlow, glowStyle]}>
        <LinearGradient
          colors={[item.accentColor, 'transparent']}
          style={styles.accentGlowGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <View style={styles.slideInner}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/logo_nobg.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Main Content - Centered with parallax */}
        <Animated.View style={[styles.mainContent, parallaxStyle]}>
          {/* Badge */}
          <Animated.View style={[styles.badge, { backgroundColor: `${item.accentColor}20` }, badgeStyle]}>
            <View style={[styles.badgeDot, { backgroundColor: item.accentColor }]} />
            <Text style={[styles.badgeText, { color: item.accentColor }]}>{item.badge}</Text>
          </Animated.View>

          {/* Icon + Stat with separate parallax */}
          <Animated.View style={[styles.statContainer, iconParallaxStyle]}>
            <View style={styles.iconWrapper}>
              {/* Glow ring behind icon */}
              <Animated.View style={[styles.iconGlowRing, { backgroundColor: item.accentColor }, iconGlowStyle]} />
              <Animated.View style={[styles.iconCircle, { borderColor: `${item.accentColor}40` }, iconStyle]}>
                <Ionicons name={item.icon} size={28} color={item.accentColor} />
              </Animated.View>
            </View>
            <Animated.Text style={[styles.statNumber, { color: item.accentColor }, statStyle]}>
              {item.stat}
            </Animated.Text>
            <Animated.Text style={[styles.statLabel, statStyle]}>{item.statLabel}</Animated.Text>
          </Animated.View>

          {/* Title */}
          <Animated.Text style={[
            styles.title,
            isPositive && { color: '#22C55E' },
            titleStyle
          ]}>
            {item.title}
          </Animated.Text>

          {/* Logo for last slide */}
          {'showLogo' in item && item.showLogo && (
            <Animated.Image
              source={require('@/assets/images/logo_nobg.png')}
              style={[styles.heroLogo, logoStyle]}
              resizeMode="contain"
            />
          )}

          {/* Description */}
          <Animated.Text style={[styles.description, descStyle]}>{item.description}</Animated.Text>
        </Animated.View>
      </View>
    </View>
  );
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<typeof slideData[0]>);

export default function EducationScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const buttonScale = useSharedValue(1);
  const scrollX = useSharedValue(0);
  const buttonGlow = useSharedValue(0.5);

  const isLastSlide = currentIndex === slideData.length - 1;
  const isPositiveSlide = currentIndex === 4; // Only slide 5 (THE SOLUTION) is green
  const currentSlide = slideData[currentIndex];

  // Pulsing button glow
  useEffect(() => {
    buttonGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50,
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  // Scroll handler for parallax
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );

    if (currentIndex < slideData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.push('/(onboarding)/rewiring-benefits');
    }
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const buttonGlowStyle = useAnimatedStyle(() => ({
    opacity: buttonGlow.value * 0.6,
    transform: [{ scale: 1 + buttonGlow.value * 0.05 }],
  }));

  const renderSlide = ({ item, index }: { item: typeof slideData[0]; index: number }) => {
    return (
      <SlideContent
        item={item}
        index={index}
        isActive={index === currentIndex}
        scrollX={scrollX}
      />
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <AnimatedFlatList
          ref={flatListRef}
          data={slideData}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          keyExtractor={(item) => item.id.toString()}
          style={styles.flatList}
          onScroll={onScroll}
          scrollEventThrottle={16}
          getItemLayout={(_: unknown, index: number) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />

        {/* Footer */}
        <View style={styles.footer}>
          {/* Button glow effect */}
          <Animated.View style={[styles.buttonGlow, buttonGlowStyle]}>
            <LinearGradient
              colors={[
                isPositiveSlide ? 'rgba(34, 197, 94, 0.4)' : `${currentSlide.accentColor}40`,
                'transparent'
              ]}
              style={styles.buttonGlowGradient}
            />
          </Animated.View>

          <AnimatedPressable onPress={handleNext} style={[styles.ctaButton, buttonStyle]}>
            <LinearGradient
              colors={
                isPositiveSlide
                  ? ['#22C55E', '#16A34A']
                  : [currentSlide.accentColor, currentSlide.accentColor]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>
                {isLastSlide ? 'Get Started' : 'Continue'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  safeArea: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
  },
  accentGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
  },
  accentGlowGradient: {
    flex: 1,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },
  slideInner: {
    flex: 1,
    paddingHorizontal: 28,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
  },
  logoImage: {
    width: 100,
    height: 36,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 24,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
  },
  statContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconGlowRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    opacity: 0.3,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  statNumber: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -2,
    lineHeight: 56,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.2,
    lineHeight: 36,
    marginBottom: 20,
  },
  heroLogo: {
    width: 140,
    height: 50,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    position: 'relative',
  },
  buttonGlow: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 0,
  },
  buttonGlowGradient: {
    flex: 1,
    borderRadius: 50,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
    zIndex: 1,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 6,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
