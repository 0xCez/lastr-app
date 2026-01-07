import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated as RNAnimated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { AnimatedSplash } from '@/components/ui/AnimatedSplash';
import { ShimmerCTA } from '@/components/ui';

const welcomeMessages = [
  "Hey there.",
  "You're not alone in this.",
  "The good news? It's completely fixable.",
  "Your personalized plan is ready.",
];

export default function WelcomeMessageScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;

  const handlePress = () => {
    router.push('/(onboarding)/custom-plan');
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
        }, 800);
      }
    }, 30);

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

      </SafeAreaView>

      {/* Footer CTA */}
      {showButton && (
        <Animated.View
          entering={FadeInUp.duration(500).springify().damping(15)}
          style={styles.footer}
        >
          <BlurView intensity={30} tint="dark" style={styles.footerBlur}>
            <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
              <View style={styles.footerInner}>
                <ShimmerCTA
                  title="View My Plan"
                  icon="arrow-forward"
                  onPress={handlePress}
                />

                {/* Trust indicator */}
                <View style={styles.trustRow}>
                  <Text style={styles.trustIcon}>🔒</Text>
                  <Text style={styles.trustText}>100% personalized for you</Text>
                </View>
              </View>
            </SafeAreaView>
          </BlurView>
        </Animated.View>
      )}
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
    paddingBottom: 140,
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
