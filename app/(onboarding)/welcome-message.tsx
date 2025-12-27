import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated as RNAnimated, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { AnimatedSplash } from '@/components/ui/AnimatedSplash';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const welcomeMessages = [
  "Hey there.",
  "First of all, I want you to know you're not alone.",
  "Millions of men struggle with this, but very few talk about it.",
  "The good news? This is completely fixable.",
  "With the right training, you can rewire your brain and body for lasting control.",
  "We've helped thousands of men transform their intimate lives.",
  "And we're going to help you too.",
  "Your personalized plan is ready.",
  "Let's take a look...",
];

export default function WelcomeMessageScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;

  // CTA animations
  const buttonScale = useSharedValue(1);
  const shimmerPosition = useSharedValue(-1);

  // Start shimmer animation when button shows
  useEffect(() => {
    if (showButton) {
      shimmerPosition.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      );
    }
  }, [showButton]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value * 400 }],
  }));

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
      router.push('/(onboarding)/custom-plan');
    }, 120);
  };

  useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentMessageIndex]);

  useEffect(() => {
    if (currentMessageIndex >= welcomeMessages.length) {
      setShowButton(true);
      return;
    }

    const currentMessage = welcomeMessages[currentMessageIndex];
    let charIndex = 0;
    setDisplayedText('');
    setIsTyping(true);
    fadeAnim.setValue(0);

    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const typingInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);

        // Wait and move to next message
        setTimeout(() => {
          RNAnimated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setCurrentMessageIndex((prev) => prev + 1);
          });
        }, 1500);
      }
    }, 45);

    return () => clearInterval(typingInterval);
  }, [currentMessageIndex]);

  // Show splash screen first
  if (showSplash) {
    return (
      <Animated.View style={styles.container} exiting={FadeOut.duration(400)}>
        <AnimatedSplash
          isLoading
          size="large"
          onAnimationComplete={() => setShowSplash(false)}
        />
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Message Display */}
          <View style={styles.messageContainer}>
            <RNAnimated.Text
              style={[
                styles.message,
                { opacity: fadeAnim },
              ]}
            >
              {displayedText}
              {isTyping && <Text style={styles.cursor}>|</Text>}
            </RNAnimated.Text>
          </View>
        </View>

        {/* Premium Full-Width CTA */}
        {showButton && (
          <Animated.View
            entering={FadeInUp.duration(500).springify().damping(15)}
            style={styles.footer}
          >
            <AnimatedPressable
              onPress={handlePress}
              style={[styles.ctaWrapper, buttonAnimatedStyle]}
            >
              {/* Outer glow */}
              <View style={styles.ctaGlowOuter} />

              {/* Main button */}
              <View style={styles.ctaButton}>
                <LinearGradient
                  colors={['#A855F7', '#8B5CF6', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ctaGradient}
                >
                  {/* Shimmer overlay */}
                  <Animated.View style={[styles.shimmer, shimmerStyle]}>
                    <LinearGradient
                      colors={['transparent', 'rgba(255,255,255,0.15)', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.shimmerGradient}
                    />
                  </Animated.View>

                  {/* Button content */}
                  <View style={styles.ctaContent}>
                    <Text style={styles.ctaText}>View My Plan</Text>
                    <View style={styles.ctaIconContainer}>
                      <Text style={styles.ctaIcon}>→</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </AnimatedPressable>

            {/* Trust indicator */}
            <View style={styles.trustRow}>
              <Text style={styles.trustIcon}>🔒</Text>
              <Text style={styles.trustText}>100% personalized for you</Text>
            </View>
          </Animated.View>
        )}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  messageContainer: {
    minHeight: 180,
    justifyContent: 'center',
  },
  message: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.2,
  },
  cursor: {
    color: Colors.primary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  ctaWrapper: {
    position: 'relative',
  },
  ctaGlowOuter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderRadius: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  ctaGradient: {
    paddingVertical: 20,
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
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  ctaIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  trustIcon: {
    fontSize: 12,
  },
  trustText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
});
