import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

interface AppleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function AppleSignInButton({ onSuccess, onError }: AppleSignInButtonProps) {
  const { signInWithApple, isLoading } = useAuthStore();

  const handleSignIn = async () => {
    const result = await signInWithApple();

    if (result.success) {
      onSuccess?.();
    } else if (result.error && result.error !== 'Sign in was cancelled') {
      onError?.(result.error);
    }
  };

  // Only show on iOS
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingButton}>
          <ActivityIndicator color={Colors.background} />
        </View>
      ) : (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={12}
          style={styles.appleButton}
          onPress={handleSignIn}
        />
      )}
    </View>
  );
}

// Alternative: Custom styled button (if you want more control over the design)
export function CustomAppleSignInButton({ onSuccess, onError }: AppleSignInButtonProps) {
  const { signInWithApple, isLoading } = useAuthStore();

  const handleSignIn = async () => {
    const result = await signInWithApple();

    if (result.success) {
      onSuccess?.();
    } else if (result.error && result.error !== 'Sign in was cancelled') {
      onError?.(result.error);
    }
  };

  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.customButton,
        pressed && styles.customButtonPressed,
        isLoading && styles.customButtonDisabled,
      ]}
      onPress={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={Colors.background} />
      ) : (
        <>
          <Text style={styles.appleIcon}></Text>
          <Text style={styles.customButtonText}>Continue with Apple</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  appleButton: {
    width: '100%',
    height: 56,
  },
  loadingButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  customButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  customButtonDisabled: {
    opacity: 0.7,
  },
  appleIcon: {
    fontSize: 20,
    color: Colors.background,
  },
  customButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.background,
    fontFamily: 'Inter_600SemiBold',
  },
});
