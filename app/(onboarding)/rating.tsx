import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Interactive Star Component
const InteractiveStar = ({
  isSelected,
  onPress
}: {
  isSelected: boolean;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSequence(
        withTiming(1.3, { duration: 150 }),
        withSpring(1, { damping: 10 })
      );
      rotation.value = withSequence(
        withTiming(15, { duration: 100 }),
        withTiming(-15, { duration: 100 }),
        withSpring(0, { damping: 10 })
      );
    }
  }, [isSelected]);

  const starStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={starStyle}>
      <Pressable onPress={onPress}>
        <Text style={[styles.star, isSelected && styles.starSelected]}>
          {isSelected ? '★' : '☆'}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default function RatingScreen() {
  const [selectedRating, setSelectedRating] = useState(0);
  const buttonScale = useSharedValue(1);
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(20);
  const starsScale = useSharedValue(0.8);
  const ctaOpacity = useSharedValue(0);

  // Floating animation for the icon
  const floatY = useSharedValue(0);

  useEffect(() => {
    // Entry animations
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    headerY.value = withDelay(100, withSpring(0, { damping: 15 }));
    starsScale.value = withDelay(400, withSpring(1, { damping: 12 }));
    ctaOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));

    // Floating animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const starsContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starsScale.value }],
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleStarPress = async (rating: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRating(rating);
  };

  const handleRateApp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });

    // Try to open native rating dialog
    try {
      if (await StoreReview.hasAction()) {
        await StoreReview.requestReview();
      }
    } catch (error) {
      console.log('Store review error:', error);
    }

    // Wait a bit for the dialog to show, then navigate
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });

    // Small delay to let the rating dialog appear
    setTimeout(() => {
      router.push('/(onboarding)/welcome-message');
    }, 1000);
  };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(onboarding)/welcome-message');
  };

  const getMessage = () => {
    if (selectedRating === 0) return "How would you rate your experience so far?";
    if (selectedRating <= 2) return "We're sorry to hear that. We'll work to improve!";
    if (selectedRating <= 3) return "Thanks! We're always working to get better.";
    if (selectedRating === 4) return "Great! We appreciate your feedback!";
    return "Amazing! You're awesome!";
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
          colors={['rgba(251, 191, 36, 0.12)', 'transparent']}
          style={styles.ambientGlowGradient}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <Animated.View style={[styles.iconWrap, floatStyle]}>
              <LinearGradient
                colors={['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.08)']}
                style={styles.iconGradient}
              />
              <Ionicons name="star" size={40} color="#FBBF24" />
            </Animated.View>

            <View style={styles.badge}>
              <Ionicons name="heart" size={14} color="#EF4444" />
              <Text style={styles.badgeText}>HELP US IMPROVE</Text>
            </View>

            <Text style={styles.title}>Enjoying Lastr'?</Text>
            <Text style={styles.subtitle}>
              Your rating helps us reach more men who need this program
            </Text>
          </Animated.View>

          {/* Stars */}
          <Animated.View style={[styles.starsContainer, starsContainerStyle]}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <InteractiveStar
                  key={star}
                  isSelected={star <= selectedRating}
                  onPress={() => handleStarPress(star)}
                />
              ))}
            </View>
            <Text style={styles.ratingMessage}>{getMessage()}</Text>
          </Animated.View>

          {/* Social proof */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(500)}
            style={styles.socialProof}
          >
            <View style={styles.socialProofCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.socialProofRow}>
                <View style={styles.socialProofItem}>
                  <Text style={styles.socialProofValue}>4.8</Text>
                  <Text style={styles.socialProofLabel}>App Rating</Text>
                </View>
                <View style={styles.socialProofDivider} />
                <View style={styles.socialProofItem}>
                  <Text style={styles.socialProofValue}>12K+</Text>
                  <Text style={styles.socialProofLabel}>Reviews</Text>
                </View>
                <View style={styles.socialProofDivider} />
                <View style={styles.socialProofItem}>
                  <Text style={styles.socialProofValue}>2.3M+</Text>
                  <Text style={styles.socialProofLabel}>Users</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View style={[styles.footer, ctaStyle]}>
          <AnimatedPressable
            onPress={handleRateApp}
            style={[styles.ctaButton, buttonAnimatedStyle]}
            disabled={selectedRating === 0}
          >
            <LinearGradient
              colors={selectedRating === 0
                ? ['#2A2A3A', '#232330']
                : ['#FBBF24', '#F59E0B']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Ionicons
                name="star"
                size={20}
                color={selectedRating === 0 ? Colors.textMuted : '#000000'}
              />
              <Text style={[
                styles.ctaText,
                selectedRating === 0 && styles.ctaTextDisabled
              ]}>
                Rate Lastr'
              </Text>
            </LinearGradient>
          </AnimatedPressable>

          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Maybe later</Text>
          </Pressable>
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
    height: '20%',
  },
  ambientGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  iconGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  starsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  star: {
    fontSize: 48,
    color: 'rgba(255, 255, 255, 0.2)',
  },
  starSelected: {
    color: '#FBBF24',
  },
  ratingMessage: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  socialProof: {
    paddingHorizontal: 8,
  },
  socialProofCard: {
    borderRadius: 16,
    padding: 20,
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
    color: '#FBBF24',
    marginBottom: 4,
  },
  socialProofLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  socialProofDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: '#000000',
    letterSpacing: 0.3,
  },
  ctaTextDisabled: {
    color: Colors.textMuted,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
});
