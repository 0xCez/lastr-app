import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { AppleSignInButton, ShimmerCTA } from '@/components/ui';
import { useUserStore } from '@/store/userStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const { initializeFromOnboarding } = useUserStore();
  const { analysisScore, answers, targetDate } = useOnboardingStore();

  // Animations
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(20);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(30);
  const footerOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const orb1Y = useSharedValue(height * 0.3);
  const orb2Y = useSharedValue(height * 0.3);
  const orb1Opacity = useSharedValue(0);
  const orb2Opacity = useSharedValue(0);

  useEffect(() => {
    // Staggered animations
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    headerY.value = withDelay(100, withSpring(0, { damping: 15 }));
    formOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    formY.value = withDelay(300, withSpring(0, { damping: 15 }));
    footerOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));

    // Orbs float up
    orb1Opacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    orb1Y.value = withDelay(200, withSpring(0, { damping: 20, stiffness: 40 }));
    orb2Opacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    orb2Y.value = withDelay(400, withSpring(0, { damping: 18, stiffness: 35 }));

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      true
    );

    // Orbs float after settling
    const floatDelay = 1200;
    orb1Y.value = withDelay(
      floatDelay,
      withRepeat(
        withSequence(
          withTiming(-25, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    orb2Y.value = withDelay(
      floatDelay + 500,
      withRepeat(
        withSequence(
          withTiming(-30, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailAuth = async () => {
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setEmailError('This email is already registered');
            setMode('login');
          } else {
            Alert.alert('Error', error.message);
          }
          setLoading(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login')) {
            setPasswordError('Invalid email or password');
          } else {
            Alert.alert('Error', error.message);
          }
          setLoading(false);
          return;
        }
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      initializeFromOnboarding(
        analysisScore,
        answers.primary_concern || 'both',
        targetDate
      );
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSuccess = () => {
    initializeFromOnboarding(
      analysisScore,
      answers.primary_concern || 'both',
      targetDate
    );
    router.replace('/(tabs)');
  };

  const handleAppleError = (error: string) => {
    Alert.alert('Sign In Error', error);
  };

  return (
    <View style={styles.container}>
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

      {/* Ambient glow */}
      <Animated.View style={[styles.ambientGlow, glowStyle]}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.2)', 'transparent']}
          style={styles.ambientGlowGradient}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <Animated.View style={[styles.header, headerStyle]}>
              <View style={styles.iconWrap}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.08)']}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="person" size={28} color={Colors.primary} />
              </View>

              <Text style={styles.title}>
                {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </Text>
              <Text style={styles.subtitle}>
                {mode === 'signup'
                  ? 'Secure your progress and personalized program'
                  : 'Continue your transformation journey'}
              </Text>
            </Animated.View>

            {/* Form Card */}
            <Animated.View style={[styles.formCard, formStyle]}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)']}
                style={StyleSheet.absoluteFill}
              />

              {/* Apple Sign In */}
              <View style={styles.appleSection}>
                <AppleSignInButton
                  onSuccess={handleAppleSuccess}
                  onError={handleAppleError}
                />
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <View
                  style={[
                    styles.inputContainer,
                    emailFocused && styles.inputFocused,
                    emailError && styles.inputErrorStyle,
                  ]}
                >
                  <Ionicons
                    name="mail"
                    size={18}
                    color={emailFocused ? Colors.primary : Colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError('');
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                </View>
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <View
                  style={[
                    styles.inputContainer,
                    passwordFocused && styles.inputFocused,
                    passwordError && styles.inputErrorStyle,
                  ]}
                >
                  <Ionicons
                    name="lock-closed"
                    size={18}
                    color={passwordFocused ? Colors.primary : Colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError('');
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleEmailAuth}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={Colors.textMuted}
                    />
                  </Pressable>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              {/* Submit Button */}
              <View style={styles.ctaWrapper}>
                <ShimmerCTA
                  title={loading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : 'Sign In')}
                  onPress={handleEmailAuth}
                  disabled={loading}
                />
              </View>

              {/* Toggle Mode */}
              <Pressable
                style={styles.toggleMode}
                onPress={() => {
                  setMode(mode === 'signup' ? 'login' : 'signup');
                  setEmailError('');
                  setPasswordError('');
                }}
              >
                <Text style={styles.toggleModeText}>
                  {mode === 'signup'
                    ? 'Already have an account? '
                    : "Don't have an account? "}
                  <Text style={styles.toggleModeLink}>
                    {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                  </Text>
                </Text>
              </Pressable>
            </Animated.View>

            {/* Security badges */}
            <Animated.View style={[styles.securitySection, footerStyle]}>
              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#22C55E" />
                <Text style={styles.securityText}>256-bit encryption</Text>
              </View>
              <View style={styles.securityBadge}>
                <Ionicons name="eye-off" size={16} color="#22C55E" />
                <Text style={styles.securityText}>100% private</Text>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    top: height * 0.08,
    left: -width * 0.3,
    width: width * 0.7,
    height: width * 0.7,
  },
  orb2: {
    top: height * 0.5,
    right: -width * 0.4,
    width: width * 0.6,
    height: width * 0.6,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  ambientGlow: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    right: '10%',
    height: '20%',
  },
  ambientGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  appleSection: {
    marginBottom: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputFocused: {
    borderColor: 'rgba(139, 92, 246, 0.6)',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  inputErrorStyle: {
    borderColor: 'rgba(239, 68, 68, 0.6)',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    height: 54,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
  },
  eyeButton: {
    padding: 16,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
  },
  ctaWrapper: {
    marginTop: 6,
    marginBottom: 8,
  },
  toggleMode: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleModeText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  toggleModeLink: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  securitySection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
});
