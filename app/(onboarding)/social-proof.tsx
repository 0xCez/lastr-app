import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { socialProofReviews } from '@/constants/onboarding';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const StarRating = ({ rating }: { rating: number }) => (
  <View style={styles.stars}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Text key={star} style={styles.star}>
        {star <= rating ? '★' : '☆'}
      </Text>
    ))}
  </View>
);

export default function SocialProofScreen() {
  const buttonScale = useSharedValue(1);

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSpring(0.95, { damping: 15 });
    setTimeout(() => {
      buttonScale.value = withSpring(1, { damping: 15 });
    }, 100);
    router.push('/(onboarding)/goals');
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow */}
      <View style={styles.ambientGlow}>
        <LinearGradient
          colors={['rgba(251, 191, 36, 0.1)', 'transparent']}
          style={styles.ambientGlowGradient}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Reviews */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - now scrollable */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>REAL RESULTS</Text>
            </View>
            <Text style={styles.title}>Rewiring Benefits</Text>
            <Text style={styles.subtitle}>
              See what others have achieved with Lastr'
            </Text>

            {/* Overall Rating */}
            <View style={styles.ratingCard}>
              <LinearGradient
                colors={['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)']}
                style={styles.ratingGradient}
              />
              <Text style={styles.ratingNumber}>4.8</Text>
              <View style={styles.ratingDetails}>
                <StarRating rating={5} />
                <Text style={styles.ratingCount}>Based on 12,400+ reviews</Text>
              </View>
            </View>
          </View>

          {socialProofReviews.map((review, index) => (
            <Animated.View
              key={review.id}
              entering={FadeInDown.delay(index * 100).duration(400)}
              style={styles.reviewCard}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.reviewHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{review.name.charAt(0)}</Text>
                </View>
                <View style={styles.reviewMeta}>
                  <Text style={styles.reviewName}>{review.name}</Text>
                  <StarRating rating={review.rating} />
                </View>
              </View>
              <Text style={styles.reviewText}>"{review.text}"</Text>
            </Animated.View>
          ))}

          {/* Progress Comparison */}
          <View style={styles.comparisonSection}>
            <Text style={styles.comparisonTitle}>
              Why Lastr' works better
            </Text>
            <View style={styles.comparisonCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.01)']}
                style={StyleSheet.absoluteFill}
              />

              {/* Lastr Program */}
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonLabelRow}>
                  <View style={[styles.comparisonDot, { backgroundColor: '#22C55E' }]} />
                  <Text style={styles.comparisonLabel}>Lastr' Program</Text>
                </View>
                <View style={styles.comparisonBarTrack}>
                  <View style={[styles.comparisonBarFill, { width: '94%' }]}>
                    <LinearGradient
                      colors={['#22C55E', '#16A34A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </View>
                </View>
                <Text style={[styles.comparisonValue, { color: '#22C55E' }]}>94% success</Text>
              </View>

              {/* Pills */}
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonLabelRow}>
                  <View style={[styles.comparisonDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.comparisonLabel}>Pills/Supplements</Text>
                </View>
                <View style={styles.comparisonBarTrack}>
                  <View style={[styles.comparisonBarFill, { width: '40%' }]}>
                    <LinearGradient
                      colors={['#F59E0B', '#D97706']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </View>
                </View>
                <Text style={[styles.comparisonValue, { color: '#F59E0B' }]}>Temporary</Text>
              </View>

              {/* Doing nothing */}
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonLabelRow}>
                  <View style={[styles.comparisonDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.comparisonLabel}>Doing nothing</Text>
                </View>
                <View style={styles.comparisonBarTrack}>
                  <View style={[styles.comparisonBarFill, { width: '15%' }]}>
                    <LinearGradient
                      colors={['#EF4444', '#DC2626']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </View>
                </View>
                <Text style={[styles.comparisonValue, { color: '#EF4444' }]}>Gets worse</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <AnimatedPressable onPress={handleContinue} style={buttonStyle}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>Continue</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#FBBF24',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  ratingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  ratingGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  ratingNumber: {
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    color: '#FBBF24',
    letterSpacing: -1,
  },
  ratingDetails: {
    gap: 4,
  },
  ratingCount: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 16,
    color: '#FBBF24',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  reviewCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  reviewMeta: {
    flex: 1,
    gap: 4,
  },
  reviewName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  reviewText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  comparisonSection: {
    marginTop: 16,
  },
  comparisonTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 16,
  },
  comparisonCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    gap: 20,
  },
  comparisonRow: {
    gap: 10,
  },
  comparisonLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comparisonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  comparisonLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  comparisonBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  comparisonBarFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  comparisonValue: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  ctaButton: {
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
