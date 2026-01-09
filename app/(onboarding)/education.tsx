import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, ViewToken } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
import { ShimmerCTA } from '@/components/ui';

const { width, height } = Dimensions.get('window');

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
    title: 'Your transformation\nstarts now',
    showLogo: true,
    description: 'A proven method based on clinical research. Join millions of men.',
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
  // Icon/badge animations (dramatic)
  const badgeOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.5);
  const badgeY = useSharedValue(-30);
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(-180);
  const iconPulse = useSharedValue(1);
  const iconFloat = useSharedValue(0);
  const iconGlowOpacity = useSharedValue(0);

  // Content animations (smooth fade-ins)
  const glowOpacity = useSharedValue(0);
  const statOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const descOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Reset icon/badge values
      badgeOpacity.value = 0;
      badgeScale.value = 0.5;
      badgeY.value = -30;
      iconOpacity.value = 0;
      iconScale.value = 0;
      iconRotation.value = -180;

      // Reset content values
      glowOpacity.value = 0;
      statOpacity.value = 0;
      titleOpacity.value = 0;
      descOpacity.value = 0;

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

      // Content smooth fade-ins (gentle, minimal stagger)
      glowOpacity.value = withTiming(0.5, { duration: 400, easing: Easing.out(Easing.ease) });
      statOpacity.value = withDelay(50, withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) }));
      titleOpacity.value = withDelay(100, withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) }));
      descOpacity.value = withDelay(150, withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) }));
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

  // Content animated styles (smooth fade-ins only)
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const statStyle = useAnimatedStyle(() => ({
    opacity: statOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
  }));

  return (
    <View style={styles.slide}>
      <LinearGradient
        colors={item.gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Accent glow - smooth fade in */}
      <Animated.View style={[styles.accentGlow, glowStyle]}>
        <LinearGradient
          colors={[item.accentColor, 'transparent']}
          style={styles.accentGlowGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <View style={styles.slideInner}>
        {/* Welcome header for last slide - positioned absolutely */}
        {'showLogo' in item && item.showLogo && (
          <Animated.View style={[styles.welcomeHeader, titleStyle]}>
            <Animated.Image
              source={require('@/assets/images/logo_nobg.png')}
              style={styles.heroLogo}
              resizeMode="contain"
            />
          </Animated.View>
        )}

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

          {/* Title - smooth fade in */}
          <Animated.Text style={[
            styles.title,
            { color: item.accentColor },
            titleStyle,
          ]}>
            {item.title}
          </Animated.Text>

          {/* Description - smooth fade in */}
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
  const scrollX = useSharedValue(0);

  const isLastSlide = currentIndex === slideData.length - 1;
  const currentSlide = slideData[currentIndex];

  // Get CTA colors based on current slide's accent color
  const getCtaColors = (): [string, string] => {
    const accent = currentSlide.accentColor;
    // Create gradient pair from accent color (lighter to darker)
    switch (accent) {
      case '#EF4444': return ['#EF4444', '#DC2626']; // Red
      case '#F97316': return ['#F97316', '#EA580C']; // Orange
      case '#EAB308': return ['#EAB308', '#CA8A04']; // Yellow
      case '#A855F7': return ['#A855F7', '#9333EA']; // Purple
      case '#22C55E': return ['#22C55E', '#16A34A']; // Green
      case '#8B5CF6': return ['#8B5CF6', '#7C3AED']; // Violet (last slide)
      default: return ['#8B5CF6', '#7C3AED'];
    }
  };

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

    if (currentIndex < slideData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.push('/(onboarding)/rewiring-benefits');
    }
  };

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

      </SafeAreaView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <BlurView intensity={30} tint="dark" style={styles.footerBlur}>
          <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
            <View style={styles.footerInner}>
              <ShimmerCTA
                title={isLastSlide ? 'Get Started' : 'Continue'}
                icon="arrow-forward"
                onPress={handleNext}
                colors={getCtaColors()}
              />
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
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  welcomeHeader: {
    alignItems: 'center',
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
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
});
