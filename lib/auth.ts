import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from './supabase';
import { Platform } from 'react-native';

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResult {
  success: boolean;
  error?: AuthError;
}

/**
 * Sign in with Apple
 * Uses native Apple authentication on iOS, returns error on other platforms
 */
export async function signInWithApple(): Promise<AuthResult> {
  if (Platform.OS !== 'ios') {
    return {
      success: false,
      error: { message: 'Sign in with Apple is only available on iOS', code: 'PLATFORM_NOT_SUPPORTED' },
    };
  }

  try {
    // Check if SIWA is available on this device
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        error: { message: 'Sign in with Apple is not available on this device', code: 'NOT_AVAILABLE' },
      };
    }

    // Request Apple credentials
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Sign in to Supabase with the Apple ID token
    if (!credential.identityToken) {
      return {
        success: false,
        error: { message: 'No identity token received from Apple', code: 'NO_TOKEN' },
      };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) {
      return {
        success: false,
        error: { message: error.message, code: error.code },
      };
    }

    return { success: true };
  } catch (error: any) {
    // Handle user cancellation
    if (error.code === 'ERR_REQUEST_CANCELED') {
      return {
        success: false,
        error: { message: 'Sign in was cancelled', code: 'CANCELLED' },
      };
    }

    return {
      success: false,
      error: { message: error.message || 'An unexpected error occurred', code: error.code },
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: { message: error.message, code: error.code },
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: { message: error.message || 'Failed to sign out' },
    };
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

/**
 * Get the current user
 */
export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}
